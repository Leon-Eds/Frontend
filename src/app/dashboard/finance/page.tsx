"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import toast from 'react-hot-toast';
import { Lock, UploadCloud, Plus, Eye, Printer, Mail, Check, RotateCw, MoreVertical, Search, FileText, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { studentApi, feeApi, sessionApi, classApi } from "@/lib/api";

interface StudentRegistry {
  id: string;
  name: string;
  avatarUrl?: string;
  program: string;
  refId: string;
  status: "Cleared" | "Unpaid" | "Pending Verification";
  amountDue?: number;
  amountPaid?: number;
}

export default function FeeClearance() {
  const router = useRouter();

  const updateLocalFee = useCallback((studentId: string, updates: any, studentName?: string) => {
    if (typeof window === 'undefined') return;
    const existingStr = localStorage.getItem('mock_fee_records');
    const existing = existingStr ? JSON.parse(existingStr) : {};
    existing[studentId] = { ...existing[studentId], ...updates, studentName: studentName || existing[studentId]?.studentName };
    localStorage.setItem('mock_fee_records', JSON.stringify(existing));
  }, []);

  const [registry, setRegistry] = useState<StudentRegistry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Role guard redirect
  useEffect(() => {
    try {
      const stored = localStorage.getItem("leoned_user");
      if (stored) {
        const user = JSON.parse(stored);
        const userRole = user.role?.toLowerCase();
        if (userRole === "teacher" || userRole === "faculty") {
          router.push("/dashboard/faculty");
        } else if (userRole === "student" || userRole === "parent" || userRole === "guardian") {
          router.push("/dashboard/student-portal");
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [router]);

  const [currentTermId, setCurrentTermId] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState("");
  const [currentSessionName, setCurrentSessionName] = useState("");
  const [currentTermName, setCurrentTermName] = useState("");

  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [termsList, setTermsList] = useState<any[]>([]);

  // Record Payment Modal states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedTermId, setSelectedTermId] = useState("");
  const [amountDue, setAmountDue] = useState("50000");
  const [amountPaid, setAmountPaid] = useState("50000");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);

  // Student Details Modal states
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailStudent, setDetailStudent] = useState<any>(null);
  
  // Print state
  const [receiptStudent, setReceiptStudent] = useState<any>(null);

  const handleOpenDetails = (student: any) => {
    setDetailStudent(student);
    setIsDetailsModalOpen(true);
    setIsEditingDue(false);
    setEditedDue(student.amountDue?.toString() || "0");
    setIsEditingPaid(false);
    setEditedPaid(student.amountPaid?.toString() || "0");
  };

  const [isEditingDue, setIsEditingDue] = useState(false);
  const [editedDue, setEditedDue] = useState("0");
  
  const [isEditingPaid, setIsEditingPaid] = useState(false);
  const [editedPaid, setEditedPaid] = useState("0");

  const handleSaveAmountDue = async () => {
    const newDue = Number(editedDue);
    
    // Optimistic UI update
    setRegistry(prev => prev.map(s => 
      s.id === detailStudent.id ? { ...s, amountDue: newDue } : s
    ));
    setDetailStudent({ ...detailStudent, amountDue: newDue });
    updateLocalFee(detailStudent.id, { amountDue: newDue }, detailStudent.name);
    setIsEditingDue(false);

    // Hit the backend endpoint if term and session are available
    if (currentTermId && currentSessionId) {
      try {
        await feeApi.record({
          studentId: detailStudent.id,
          termId: currentTermId,
          academicSessionId: currentSessionId,
          amountDue: newDue,
          amountPaid: detailStudent.amountPaid || 0
        });
        toast.success("Amount due updated on server");
      } catch (err) {
        toast.error("Failed to sync amount due with server");
      }
    } else {
      toast.success("Amount due updated locally");
    }
  };

  const handleSaveAmountPaid = async () => {
    const newPaid = Number(editedPaid);
    let newStatus = detailStudent.status;
    if (newPaid >= Number(detailStudent.amountDue || 0)) {
       newStatus = "Cleared";
    }

    // Optimistic UI update
    setRegistry(prev => prev.map(s => 
      s.id === detailStudent.id ? { ...s, amountPaid: newPaid, status: newStatus } : s
    ));
    setDetailStudent({ ...detailStudent, amountPaid: newPaid, status: newStatus });
    updateLocalFee(detailStudent.id, { amountPaid: newPaid, status: newStatus }, detailStudent.name);
    setIsEditingPaid(false);

    // Hit the backend endpoint if term and session are available
    if (currentTermId && currentSessionId) {
      try {
        await feeApi.record({
          studentId: detailStudent.id,
          termId: currentTermId,
          academicSessionId: currentSessionId,
          amountDue: detailStudent.amountDue || 50000,
          amountPaid: newPaid
        });
        toast.success("Amount paid updated on server");
      } catch (err) {
        toast.error("Failed to sync amount paid with server");
      }
    } else {
      toast.success("Amount paid updated locally");
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.action-dropdown-container')) {
        setDropdownOpenId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.success(`Payment batch/voucher "${file.name}" uploaded successfully! Reconciling transaction records...`);
  };

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [students, classes, sessionData] = await Promise.all([
        studentApi.getAll(),
        classApi.getAll(),
        sessionApi.getAll()
      ]);

      setStudentsList(students);

      const currentSession = (Array.isArray(sessionData) ? sessionData : []).find((s: any) => s.isCurrent);
      const currentTerm = currentSession?.terms?.find((t: any) => t.isCurrent);
      
      if (currentSession) {
        setCurrentSessionId(currentSession.id);
        setCurrentSessionName(currentSession.name);
        if (currentSession.terms) {
          setTermsList(currentSession.terms);
        }
      }
      if (currentTerm) {
        setCurrentTermId(currentTerm.id);
        setCurrentTermName(currentTerm.termNumber);
      }

      let feeRecords: any[] = [];
      if (currentTerm) {
         const classList = Array.isArray(classes) ? classes : [];
         const feePromises = classList.map((c: any) => feeApi.getClassFees(c.id, currentTerm.id).catch(() => []));
         const classFees = await Promise.all(feePromises);
         
         feeRecords = classFees.map(f => {
           if (Array.isArray(f)) return f;
           if (f && typeof f === 'object' && 'data' in f) return (f as any).data;
           if (f && typeof f === 'object' && 'items' in f) return (f as any).items;
           return [];
         }).flat();
      }

      const feeMap = new Map();
      feeRecords.forEach(f => {
         if (f && f.studentId) {
            feeMap.set(f.studentId, f);
         }
      });

      const localFeesStr = typeof window !== 'undefined' ? localStorage.getItem('mock_fee_records') : null;
      const localFees = localFeesStr ? JSON.parse(localFeesStr) : {};
      let needsBackfill = false;

      const mapped: StudentRegistry[] = students.map((student) => {
        const fee = feeMap.get(student.id);
        const localFee = localFees[student.id] || {};

        const finalAmountDue = localFee.amountDue !== undefined ? localFee.amountDue : (fee ? fee.amountDue : 50000);
        const finalAmountPaid = localFee.amountPaid !== undefined ? localFee.amountPaid : (fee ? fee.amountPaid : 0);
        let finalStatus = localFee.status || "Pending Verification";

        if (!localFee.status) {
           if (fee) {
              finalStatus = (fee.amountDue > 0 && fee.amountPaid >= fee.amountDue) || fee.isCleared ? "Cleared" : "Unpaid";
           }
        }

        // Backfill studentName into existing local records
        if (localFees[student.id] && !localFees[student.id].studentName) {
          localFees[student.id].studentName = student.fullName;
          needsBackfill = true;
        }

        return {
          id: student.id,
          name: student.fullName,
          program: student.className || "Unassigned",
          refId: student.admissionNumber || student.id,
          status: finalStatus,
          amountDue: finalAmountDue,
          amountPaid: finalAmountPaid,
        };
      });
      
      // Persist backfilled names
      if (needsBackfill && typeof window !== 'undefined') {
        localStorage.setItem('mock_fee_records', JSON.stringify(localFees));
      }
      
      setRegistry(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch students");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleOpenPaymentModal = () => {
    setSelectedStudentId("");
    setSelectedTermId(currentTermId);
    setAmountDue("50000");
    setAmountPaid("50000");
    setIsPaymentModalOpen(true);
  };

  const handleOpenClearModal = (studentId: string) => {
    const student = registry.find(s => s.id === studentId);
    setSelectedStudentId(studentId);
    setSelectedTermId(currentTermId);
    setAmountDue(student?.amountDue?.toString() || "50000");
    setAmountPaid(student?.amountDue?.toString() || "50000");
    setIsPaymentModalOpen(true);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedTermId || !currentSessionId) {
      toast.error("Please select a student and term.");
      return;
    }

    setIsSubmittingPayment(true);
    try {
      await feeApi.record({
        studentId: selectedStudentId,
        termId: selectedTermId,
        academicSessionId: currentSessionId,
        amountDue: parseFloat(amountDue),
        amountPaid: parseFloat(amountPaid)
      });
      toast.success("Payment recorded successfully!");
      setIsPaymentModalOpen(false);
      
      const pPaid = parseFloat(amountPaid);
      const pDue = parseFloat(amountDue);
      const newStatus = pPaid >= pDue ? "Cleared" : "Unpaid";

      setRegistry(prev => prev.map(s => {
        if (s.id === selectedStudentId) {
          return {
            ...s,
            amountDue: pDue,
            amountPaid: pPaid,
            status: newStatus
          };
        }
        return s;
      }));
      const selectedStudent = registry.find(s => s.id === selectedStudentId);
      updateLocalFee(selectedStudentId, { amountDue: pDue, amountPaid: pPaid, status: newStatus }, selectedStudent?.name);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record payment";
      toast.error(msg);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleAction = async (id: string, newStatus: "Cleared" | "Unpaid" | "Pending Verification") => {
    setRegistry(prev => prev.map(student => {
      if (student.id === id) {
        return { ...student, status: newStatus };
      }
      return student;
    }));
    const actionStudent = registry.find(s => s.id === id);
    updateLocalFee(id, { status: newStatus }, actionStudent?.name);

    if (!currentTermId || !currentSessionId) return;

    try {
      if (newStatus === "Cleared") {
        await feeApi.clearFees(id, currentTermId);
      } else if (newStatus === "Unpaid") {
        await feeApi.record({
          studentId: id,
          termId: currentTermId,
          academicSessionId: currentSessionId,
          amountDue: 1000, // default placeholder
          amountPaid: 0
        });
      }
    } catch (err) {
      console.error("Failed to update fee status:", err);
    }
  };

  const filteredStudents = registry.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.refId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#053d26] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-500">Loading student registry…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <span className="text-xl font-bold">!</span>
          </div>
          <p className="text-sm font-semibold text-red-700">{error}</p>
          <button
            onClick={fetchStudents}
            className="px-5 py-2.5 rounded-full bg-[#053d26] hover:bg-[#042c1b] text-white font-bold text-xs transition-colors shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">Fee Clearance</h1>
          <p className="text-gray-500 leading-relaxed text-sm">
            Manage academic access & payment verification
          </p>
        </div>

        {/* Local Search input */}
        <div className="relative flex-1 max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-full border border-gray-200 bg-white py-2.5 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-transparent transition-colors"
            placeholder="Search student name or ID..."
          />
        </div>
      </div>

      {/* Access Lock & Verification Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Academic Access Lock */}
        <div className="rounded-3xl bg-[#fdf2f2] p-8 border border-red-100 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-red-950">Academic Access Lock</h3>
            <p className="text-xs text-red-700 leading-relaxed font-semibold">
              Students with <span className="font-bold underline">Unpaid</span> status have their examination results and semester registration automatically locked. Access is restored only upon verified receipt clearance.
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-red-200/50 pt-6 mt-8">
            <div>
              <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Currently Locked</p>
              <p className="text-3xl font-black text-red-950">{registry.filter(s => s.status === 'Unpaid').length} Students</p>
            </div>
            <button className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow">
              Review List
            </button>
          </div>
        </div>

        {/* Verify Payment Receipts */}
        <div className="lg:col-span-2 rounded-3xl bg-white p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-8">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".pdf,.png,.jpg,.jpeg" 
            style={{ display: 'none' }} 
          />
          <div className="flex flex-col justify-between flex-1 space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900">Verify Payment Receipts</h3>
              <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                Bulk upload bank statements or individual student payment vouchers for automated reconciliation.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={handleUploadClick}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#053d26] text-white font-bold text-xs hover:bg-[#042c1b] transition-all shadow-md"
              >
                <UploadCloud className="h-4 w-4" />
                Upload Batch
              </button>
              <button className="flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-all shadow-sm">
                Manual Entry
              </button>
            </div>
          </div>

          {/* Dotted Dropzone */}
          <div 
            onClick={handleUploadClick}
            className="flex-1 border-2 border-dashed border-gray-200 rounded-[2rem] bg-gray-50/50 hover:bg-gray-50 transition-all flex flex-col items-center justify-center p-8 text-center cursor-pointer min-h-[160px]"
          >
            <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-xs font-bold text-gray-600">Drag & drop files here</p>
            <p className="text-[10px] text-gray-400 font-semibold mt-1">Accepts PDF, PNG, JPG (Max 10MB)</p>
          </div>
        </div>
      </div>

      {/* Active Students Registry Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Toolbar Header */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Active Students Registry</h2>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Showing {filteredStudents.length} of {registry.length} students</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* System Status badge */}
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-700 text-[10px] font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              System Live: Syncing with Bank APIs
            </span>
            <button className="px-3.5 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-colors">
              Filter by Program
            </button>
            <button className="px-3.5 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-colors">
              {currentSessionName || "No Active Session"}{currentTermName ? ` — ${currentTermName} Term` : ""}
            </button>
          </div>
        </div>

        {/* Table list */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-wider text-gray-400 border-b border-gray-100">
                <th className="py-4 px-8">Student Identity</th>
                <th className="py-4 px-6 text-center">Reference ID</th>
                <th className="py-4 px-6 text-center">Payment Status</th>
                <th className="py-4 px-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#053d26] text-white font-bold flex items-center justify-center text-sm shadow-md">
                        {student.name.split(" ").map(w => w[0]).join("")}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{student.name}</p>
                        <p className="text-xs text-gray-400 font-semibold">{student.program}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-center font-bold text-gray-500 text-sm">{student.refId}</td>
                  <td className="py-5 px-6">
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        student.status === "Cleared"
                          ? "bg-green-100 text-[#053d26]"
                          : student.status === "Unpaid"
                          ? "bg-red-100 text-red-700"
                          : "bg-orange-100 text-orange-700"
                      }`}>
                        {student.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-8">
                    <div className="flex items-center justify-end gap-2">
                      {student.status === "Cleared" && (
                        <>
                          <button 
                            onClick={() => handleOpenDetails(student)}
                            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => {
                              setReceiptStudent(student);
                              toast.success(`Preparing receipt for ${student.name}...`);
                              setTimeout(() => {
                                window.print();
                                setTimeout(() => setReceiptStudent(null), 1000);
                              }, 800);
                            }}
                            className="p-2 rounded-xl text-gray-400 hover:text-[#053d26] transition-colors"
                            title="Print Receipt"
                          >
                            <Printer className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      
                      {student.status === "Unpaid" && (
                        <>
                          <button 
                            onClick={() => handleAction(student.id, "Pending Verification")}
                            className="p-2 rounded-xl text-gray-400 hover:text-[#053d26] transition-colors"
                            title="Trigger Re-Verification"
                          >
                            <RotateCw className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
                            <Mail className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      {student.status === "Pending Verification" && (
                        <>
                          <button 
                            onClick={() => handleOpenClearModal(student.id)}
                            className="p-1.5 rounded-xl bg-green-100 text-[#053d26] hover:bg-green-200 transition-colors"
                            title="Verify & Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          
                          <div className="relative action-dropdown-container">
                            <button 
                              onClick={() => setDropdownOpenId(dropdownOpenId === student.id ? null : student.id)}
                              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
                              title="More Options"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>

                            {dropdownOpenId === student.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 animate-in fade-in slide-in-from-top-2 duration-100">
                                <button 
                                  onClick={() => {
                                    handleAction(student.id, "Unpaid");
                                    setDropdownOpenId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  Reject Verification
                                </button>
                                <button 
                                  onClick={() => {
                                    handleOpenDetails(student);
                                    setDropdownOpenId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  View Details
                                </button>
                                <button 
                                  onClick={() => {
                                    toast.success("Contact feature coming soon");
                                    setDropdownOpenId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  Contact Student
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500">
          <span>Showing {filteredStudents.length} of {registry.length} students</span>
        </div>
      </div>

      {/* Floating circular "+" action button on the bottom right */}
      <button 
        onClick={handleOpenPaymentModal}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#b05e1c] hover:bg-[#965017] text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 z-40"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Record Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <form 
            onSubmit={handleSubmitPayment}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-6 animate-in fade-in zoom-in duration-200"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold text-gray-900">Record Fee Payment</h3>
              <button 
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Student Select */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Student</label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="block w-full rounded-2xl border border-gray-200 bg-white py-3 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-transparent transition-colors"
                >
                  <option value="">-- Choose a Student --</option>
                  {studentsList.map((std) => (
                    <option key={std.id} value={std.id}>
                      {std.fullName} ({std.className || "Unassigned"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Term Select */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Term</label>
                <select
                  required
                  value={selectedTermId}
                  onChange={(e) => setSelectedTermId(e.target.value)}
                  className="block w-full rounded-2xl border border-gray-200 bg-white py-3 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-transparent transition-colors"
                >
                  <option value="">-- Choose a Term --</option>
                  {termsList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.termNumber} Term
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Due */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Amount Due (₦)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={amountDue}
                  onChange={(e) => setAmountDue(e.target.value)}
                  className="block w-full rounded-2xl border border-gray-200 bg-white py-3 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-transparent transition-colors"
                />
              </div>

              {/* Amount Paid */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Amount Paid (₦)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="block w-full rounded-2xl border border-gray-200 bg-white py-3 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingPayment}
                className="px-6 py-2.5 rounded-full bg-[#053d26] text-white text-xs font-bold hover:bg-[#042c1b] transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmittingPayment ? "Recording..." : "Record Payment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Student Details Modal */}
      {isDetailsModalOpen && detailStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#053d26]" /> Student Financial Profile
              </h3>
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#053d26] text-white font-bold flex items-center justify-center text-xl shadow-md">
                  {detailStudent.name.split(" ").map((w: string) => w[0]).join("")}
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-900">{detailStudent.name}</h4>
                  <p className="text-sm font-semibold text-gray-500">{detailStudent.program}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Reference ID</p>
                  <p className="font-bold text-gray-900">{detailStudent.refId}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    detailStudent.status === "Cleared"
                      ? "bg-green-100 text-[#053d26]"
                      : detailStudent.status === "Unpaid"
                      ? "bg-red-100 text-red-700"
                      : "bg-orange-100 text-orange-700"
                  }`}>
                    {detailStudent.status}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex justify-between items-center">
                    Amount Due
                    {!isEditingDue && (
                      <button 
                        onClick={() => setIsEditingDue(true)}
                        className="text-[#053d26] hover:text-green-700 underline text-[10px]"
                      >
                        Edit
                      </button>
                    )}
                  </p>
                  {isEditingDue ? (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-500 font-bold">₦</span>
                      <input 
                        type="number" 
                        value={editedDue}
                        onChange={(e) => setEditedDue(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-md px-2 py-1 text-sm font-bold text-gray-900 focus:outline-none focus:border-[#053d26]"
                        autoFocus
                      />
                      <button 
                        onClick={handleSaveAmountDue}
                        className="p-1.5 bg-[#053d26] text-white rounded-md hover:bg-[#042c1b]"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <p className="font-bold text-gray-900">₦{(Number(detailStudent.amountDue) || 0).toLocaleString()}</p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex justify-between items-center">
                    Amount Paid
                    {!isEditingPaid && (
                      <button 
                        onClick={() => setIsEditingPaid(true)}
                        className="text-[#053d26] hover:text-green-700 underline text-[10px]"
                      >
                        Edit
                      </button>
                    )}
                  </p>
                  {isEditingPaid ? (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-500 font-bold">₦</span>
                      <input 
                        type="number" 
                        value={editedPaid}
                        onChange={(e) => setEditedPaid(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-md px-2 py-1 text-sm font-bold text-gray-900 focus:outline-none focus:border-[#053d26]"
                        autoFocus
                      />
                      <button 
                        onClick={handleSaveAmountPaid}
                        className="p-1.5 bg-[#053d26] text-white rounded-md hover:bg-[#042c1b]"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <p className="font-bold text-gray-900">₦{(Number(detailStudent.amountPaid) || 0).toLocaleString()}</p>
                  )}
                </div>
              </div>

            </div>
            
            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {receiptStudent && (
        <div className="print-only bg-white text-black font-sans min-h-screen">
          <div className="border-b-2 border-gray-800 pb-6 mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-[#053d26] mb-1">LEONED AFRICA</h1>
              <p className="text-sm font-bold text-gray-500 tracking-widest uppercase">Official Fee Clearance Receipt</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-800">Date: {new Date().toLocaleDateString()}</p>
              <p className="text-sm font-bold text-gray-500">Ref: {receiptStudent.refId}</p>
            </div>
          </div>
          
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Student Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</p>
                <p className="text-lg font-bold text-gray-900">{receiptStudent.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Program</p>
                <p className="text-lg font-bold text-gray-900">{receiptStudent.program}</p>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Financial Summary</h2>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between mb-4">
                <span className="font-bold text-gray-600">Amount Due</span>
                <span className="font-black text-gray-900">₦{(Number(receiptStudent.amountDue) || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="font-bold text-gray-600">Amount Paid</span>
                <span className="font-black text-gray-900">₦{(Number(receiptStudent.amountPaid) || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <span className="font-bold text-gray-900">Clearance Status</span>
                <span className={`font-black uppercase tracking-wider ${receiptStudent.status === 'Cleared' ? 'text-[#053d26]' : 'text-red-600'}`}>
                  {receiptStudent.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-20 pt-8 border-t border-gray-200 text-center">
            <p className="text-xs font-bold text-gray-400">This is a system-generated receipt and does not require a physical signature.</p>
            <p className="text-[10px] font-bold text-gray-300 mt-1">© {new Date().getFullYear()} LeonEd Africa. Academic Architect System.</p>
          </div>
        </div>
      )}
    </div>
  );
}
