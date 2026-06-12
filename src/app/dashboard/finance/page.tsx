"use client";

import { useState, useEffect, useCallback } from "react";
import toast from 'react-hot-toast';
import { Lock, UploadCloud, Plus, Eye, Printer, Mail, Check, RotateCw, MoreVertical, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { studentApi, feeApi, sessionApi, classApi } from "@/lib/api";

interface StudentRegistry {
  id: string;
  name: string;
  avatarUrl?: string;
  program: string;
  refId: string;
  status: "Cleared" | "Unpaid" | "Pending Verification";
}

export default function FeeClearance() {
  const router = useRouter();
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

      const mapped: StudentRegistry[] = students.map((student) => {
        const fee = feeMap.get(student.id);
        let status: "Cleared" | "Unpaid" | "Pending Verification" = "Pending Verification";
        if (fee) {
           status = (fee.amountDue > 0 && fee.amountPaid >= fee.amountDue) || fee.isCleared ? "Cleared" : "Unpaid";
        }

        return {
          id: student.id,
          name: student.fullName,
          program: student.className || "Unassigned",
          refId: student.admissionNumber || student.id,
          status,
        };
      });
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
      fetchStudents();
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
          <div className="flex flex-col justify-between flex-1 space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900">Verify Payment Receipts</h3>
              <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                Bulk upload bank statements or individual student payment vouchers for automated reconciliation.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#053d26] text-white font-bold text-xs hover:bg-[#042c1b] transition-all shadow-md">
                <UploadCloud className="h-4 w-4" />
                Upload Batch
              </button>
              <button className="flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-all shadow-sm">
                Manual Entry
              </button>
            </div>
          </div>

          {/* Dotted Dropzone */}
          <div className="flex-1 border-2 border-dashed border-gray-200 rounded-[2rem] bg-gray-50/50 hover:bg-gray-50 transition-all flex flex-col items-center justify-center p-8 text-center cursor-pointer min-h-[160px]">
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
                          <button className="p-2 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="p-2 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
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
                            onClick={() => handleAction(student.id, "Cleared")}
                            className="p-1.5 rounded-xl bg-green-100 text-[#053d26] hover:bg-green-200 transition-colors"
                            title="Verify & Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
                            <MoreVertical className="w-5 h-5" />
                          </button>
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
    </div>
  );
}
