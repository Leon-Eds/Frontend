"use client";

import { useState, useEffect } from "react";
import { CreditCard, UploadCloud, CheckCircle2, AlertCircle, Loader2, Download, Receipt } from "lucide-react";
import { feeApi, sessionApi, schoolApi, uploadToCloudinary } from "@/lib/api";
import toast from "react-hot-toast";

export default function StudentFinance({ studentInfo }: { studentInfo: any }) {
  const [feesData, setFeesData] = useState<any>(null);
  const [feeBreakdown, setFeeBreakdown] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bankDetails, setBankDetails] = useState<{bankAccountName?: string, bankName?: string, bankAccountNumber?: string} | null>(null);

  const [terms, setTerms] = useState<any[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string>('');

  const [isUploading, setIsUploading] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const sessions = await sessionApi.getAll().catch(() => []);
        const sList = Array.isArray(sessions) ? sessions : [];
        const tList: any[] = [];
        let currTermId = '';
        
        sList.forEach((s: any) => {
          if (s.terms) {
            s.terms.forEach((t: any) => {
              tList.push({ ...t, sessionName: s.name, sessionId: s.id || s._id });
              if (t.isCurrent) currTermId = t.id || t._id;
            });
          }
        });
        
        setTerms(tList);
        if (currTermId) setSelectedTermId(currTermId);
        else if (tList.length > 0) setSelectedTermId(tList[0].id || tList[0]._id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTerms();
  }, []);

  const fetchFees = async () => {
    if (!selectedTermId) return;
    try {
      setIsLoading(true);
      setError(null);
      
      const { feeStructureApi } = await import('@/lib/api');
      const structures = await feeStructureApi.getStructures();
      const customFeesMap = await feeStructureApi.getStudentCustomFees();
      
      const studentId = studentInfo.studentId || studentInfo.id || studentInfo._id;
      const studentClass = studentInfo.className || studentInfo.formClass || "JSS 1";
      
      const applicableStructures = structures.filter((s: any) => {
        if (s.type === 'base') {
          const match = s.applicableLevels.some((l: string) => 
            l === 'All' || studentClass.replace(/\s+/g, '').toLowerCase() === l.replace(/\s+/g, '').toLowerCase()
          );
          if (match) return true;
        }
        if (s.type === 'custom' && customFeesMap[studentId]?.includes(s.id)) {
          return true;
        }
        return false;
      });
      setFeeBreakdown(applicableStructures);

      const res = await feeApi.getMyStatus(selectedTermId);
      const data = (res as any)?.data || res;
      setFeesData(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load fee information.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [selectedTermId, studentInfo]);

  useEffect(() => {
    const fetchSchoolBankDetails = async () => {
      try {
        const userStr = localStorage.getItem('leoned_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const sId = user.schoolId || user.SchoolId || studentInfo?.schoolId;
          if (sId) {
            const school: any = await schoolApi.getById(sId);
            if (school?.bankName || school?.bankAccountNumber) {
              setBankDetails({ 
                bankAccountName: school.bankAccountName, 
                bankName: school.bankName, 
                bankAccountNumber: school.bankAccountNumber 
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch school bank details", err);
      }
    };
    fetchSchoolBankDetails();
  }, [studentInfo]);

  const handleUploadReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile) {
      toast.error("Please select a receipt image to upload.");
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    try {
      setIsUploading(true);
      const receiptUrl = await uploadToCloudinary(receiptFile);
      
      const studentRecordId = studentInfo.studentId || studentInfo.id || studentInfo._id;
      const selectedTerm = terms.find(t => (t.id || t._id) === selectedTermId);
      
      await feeApi.record({
        studentId: studentRecordId,
        termId: selectedTermId,
        academicSessionId: selectedTerm?.sessionId,
        amountPaid: Number(amount),
        notes: description,
        receiptImageUrl: receiptUrl,
        paymentDate: new Date().toISOString(),
        paymentMethod: "Bank Transfer",
        status: "Pending" // Explicitly mark as pending for bursar approval
      } as any);

      toast.success("Receipt uploaded successfully. Pending approval.");
      setReceiptFile(null);
      setDescription("");
      setAmount("");
      fetchFees();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to upload receipt.");
    } finally {
      setIsUploading(false);
    }
  };

  const status = feesData?.status || (Number(feesData?.balance || 0) <= 0 && feesData ? "Cleared" : "Unpaid");
  
  // Try to parse payment history if it exists
  let paymentHistory = Array.isArray(feesData?.history) ? feesData.history : (Array.isArray(feesData?.payments) ? feesData.payments : []);
  
  // If no history array but there is payment data on the main record, synthesize an entry
  if (paymentHistory.length === 0 && feesData && (feesData.amountPaid > 0 || feesData.status === 'Pending' || feesData.receiptImageUrl)) {
      paymentHistory = [{
          id: feesData.id || feesData._id,
          amountPaid: feesData.amountPaid || 0,
          date: feesData.paymentDate || feesData.clearedAt || feesData.updatedAt || feesData.createdAt || new Date().toISOString(),
          status: feesData.status === 'NotRecorded' ? 'Unpaid' : feesData.status,
          method: feesData.paymentMethod || "Bank Transfer",
          receiptUrl: feesData.receiptImageUrl || feesData.receiptUrl,
          notes: feesData.notes || feesData.description || "Tuition Payment"
      }];
  }
  
  // Compute local fallback if backend returns 0
  const computedTotal = feeBreakdown.reduce((sum, f) => sum + Number(f.amount || 0), 0);
  const backendTotal = Number(feesData?.totalAmount || feesData?.amountDue || 0);
  const totalAmount = backendTotal > 0 ? backendTotal : computedTotal;
  
  const backendPaid = Number(feesData?.amountPaid || feesData?.paidAmount || 0);
  const balance = totalAmount - backendPaid;
  
  const showUploadForm = totalAmount > 0 && balance > 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Term Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-[#b05e1c]" />
          <h2 className="text-xl font-bold text-gray-900">Finance & Fees</h2>
        </div>
        <select
          value={selectedTermId}
          onChange={(e) => setSelectedTermId(e.target.value)}
          className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#053d26] focus:border-[#053d26] block w-full sm:w-auto p-2.5 font-semibold"
        >
          {terms.map((t, idx) => (
            <option key={idx} value={t.id || t._id}>
              Term {t.termNumber || t.name} ({t.sessionName})
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[30vh] text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading finance data...
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[30vh] text-red-500">
          <AlertCircle className="w-6 h-6 mr-2" /> {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Fee Summary */}
          <div className={showUploadForm ? "lg:col-span-8 space-y-6" : "lg:col-span-12 space-y-6"}>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Term Fee Summary</h3>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    status === 'Cleared' ? 'bg-emerald-100 text-emerald-700' :
                    status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {status === 'NotRecorded' ? 'Not Recorded' : status}
                  </span>
                </div>
              </div>
              <div className="flex gap-8 text-right">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Amount Due</p>
                  <p className="text-2xl font-extrabold text-gray-900">₦{totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Balance</p>
                  <p className={`text-2xl font-extrabold ${balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    ₦{balance.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Fee Breakdown */}
            {feeBreakdown.length > 0 && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Fee Breakdown & Payment Details</h3>
                
                {bankDetails && (bankDetails.bankName || bankDetails.bankAccountNumber) && (
                  <div className="mb-6 p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-start gap-4">
                    <Receipt className="w-6 h-6 text-emerald-600 mt-1 shrink-0" />
                    <div>
                      <h4 className="font-bold text-emerald-900 mb-2">School Payment Account</h4>
                      <div className="text-sm text-emerald-800 space-y-1 bg-white/60 inline-block p-3 rounded-xl border border-emerald-50">
                        {bankDetails.bankAccountName && <p><span className="font-bold uppercase tracking-wider text-xs text-emerald-600 mr-2">Account Name:</span> <span className="font-medium text-emerald-950">{bankDetails.bankAccountName}</span></p>}
                        {bankDetails.bankName && <p><span className="font-bold uppercase tracking-wider text-xs text-emerald-600 mr-2">Bank:</span> <span className="font-medium text-emerald-950">{bankDetails.bankName}</span></p>}
                        {bankDetails.bankAccountNumber && <p><span className="font-bold uppercase tracking-wider text-xs text-emerald-600 mr-2">Account No:</span> <span className="font-mono text-emerald-950 text-base">{bankDetails.bankAccountNumber}</span></p>}
                      </div>
                      <p className="text-xs text-emerald-600 mt-3 font-medium">Please use this account for all fee payments, and upload the receipt below.</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {feeBreakdown.map((fee: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-gray-900">{fee.name}</p>
                        {(fee.bankName || fee.accountNumber) && (
                          <div className="text-sm text-gray-600 mt-1 space-y-0.5">
                            {fee.bankName && <p><span className="font-semibold text-gray-800">Bank:</span> {fee.bankName}</p>}
                            {fee.accountNumber && <p><span className="font-semibold text-gray-800">Account No:</span> {fee.accountNumber}</p>}
                          </div>
                        )}
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <p className="font-extrabold text-[#053d26]">₦{Number(fee.amount).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment History */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Payment History</h3>
              {paymentHistory.length === 0 ? (
                <p className="text-center text-gray-500 py-6">No payments recorded for this term.</p>
              ) : (
                <div className="space-y-4">
                  {paymentHistory.map((payment: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-4 rounded-2xl border border-gray-100 bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          payment.status === 'Pending' ? 'bg-amber-100' : 
                          payment.status === 'Rejected' ? 'bg-red-100' : 'bg-emerald-100'
                        }`}>
                          {payment.status === 'Pending' ? <Loader2 className="w-6 h-6 text-amber-600" /> : 
                           payment.status === 'Rejected' ? <AlertCircle className="w-6 h-6 text-red-600" /> :
                           <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">₦{Number(payment.amountPaid || payment.amount || 0).toLocaleString()}</p>
                          <p className="text-xs text-gray-500">{new Date(payment.date || payment.createdAt).toLocaleDateString()}</p>
                          {payment.notes && <p className="text-xs text-gray-400 mt-1 max-w-[200px] truncate">{payment.notes}</p>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${
                          payment.status === 'Pending' ? 'text-amber-600' : 
                          payment.status === 'Rejected' ? 'text-red-600' : 'text-emerald-600'
                        }`}>
                          {payment.status || 'Cleared'}
                        </span>
                        {payment.status === 'Cleared' && (payment.id || payment._id) && (
                          <button
                            onClick={async () => {
                              try {
                                const toastId = toast.loading('Generating Receipt...');
                                const blob = await feeApi.downloadReceiptPdf(payment.id || payment._id);
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `Receipt-${payment.id || payment._id}.pdf`;
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                                window.URL.revokeObjectURL(url);
                                toast.success('Receipt downloaded!', { id: toastId });
                              } catch (e) {
                                toast.error('Failed to download receipt');
                              }
                            }}
                            className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
                          >
                            <Download className="w-3 h-3" /> Download Receipt
                          </button>
                        )}
                        {payment.receiptUrl && (
                          <a href={payment.receiptUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-[#053d26] hover:underline">
                            <Receipt className="w-3 h-3" /> View Uploaded Image
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upload Receipt Form */}
          {showUploadForm && (
            <div className="lg:col-span-4 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-fit">
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Submit Payment</h3>
              <form onSubmit={handleUploadReceipt} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Amount Paid (₦)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border-gray-200 rounded-xl focus:ring-[#053d26] focus:border-[#053d26]"
                    placeholder="e.g. 50000"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Receipt Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#053d26]/10 file:text-[#053d26] hover:file:bg-[#053d26]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Description / Notes</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border-gray-200 rounded-xl focus:ring-[#053d26] focus:border-[#053d26] resize-none"
                    rows={3}
                    placeholder="e.g. First installment paid via Zenith Bank"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isUploading || !receiptFile || !amount}
                  className="w-full flex items-center justify-center gap-2 bg-[#4285F4] hover:bg-[#3367D6] text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <UploadCloud className="w-5 h-5" />
                  )}
                  {isUploading ? "Uploading..." : "Submit Receipt"}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
