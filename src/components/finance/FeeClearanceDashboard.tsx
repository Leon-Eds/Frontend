"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import toast from 'react-hot-toast';
import { Eye, Search, Filter, Download, MoreVertical, CreditCard, Wallet, ArrowUpRight, ArrowDownRight, Printer, AlertCircle, Loader2, RotateCw, Lock, UploadCloud, Plus, Mail, Check, FileText, X, Settings2, XCircle, CheckCircle, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { studentApi, sessionApi, classApi, bursarApi, dashboardApi, uploadToCloudinary } from "@/lib/api";

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

export default function FeeClearanceDashboard() {
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

  const [currentUser, setCurrentUser] = useState<any>(null);

  // Role guard redirect
  useEffect(() => {
    try {
      const stored = localStorage.getItem("leoned_user");
      if (stored) {
        const user = JSON.parse(stored);
        setCurrentUser(user);
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
  const [paymentDescription, setPaymentDescription] = useState("");
  const [receiptImageUrl, setReceiptImageUrl] = useState("");
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
    setIsEditingPaid(false);
    setEditedPaid(student.amountPaid?.toString() || "0");
  };

  const [isManagingCustomFees, setIsManagingCustomFees] = useState(false);
  const [allFeeStructures, setAllFeeStructures] = useState<any[]>([]);
  const [studentCustomFeesMap, setStudentCustomFeesMap] = useState<Record<string, string[]>>({});
  const [tempSelectedCustomFees, setTempSelectedCustomFees] = useState<string[]>([]);
  
  const [isEditingPaid, setIsEditingPaid] = useState(false);
  const [editedPaid, setEditedPaid] = useState("0");

  const handleSaveCustomFees = async () => {
    try {
      const { feeStructureApi } = await import('@/lib/api');
      await feeStructureApi.saveStudentCustomFees(detailStudent.id, tempSelectedCustomFees);
      
      // Update local state map
      setStudentCustomFeesMap(prev => ({
        ...prev,
        [detailStudent.id]: tempSelectedCustomFees
      }));
      
      // Recompute the amount due for optimistic UI
      const sClass = detailStudent.class || detailStudent.className || "";
      let computedDue = 0;
      allFeeStructures.filter(s => s.type === 'base').forEach(base => {
        if (base.applicableLevels.some((l: string) => sClass.replace(/\s+/g, '').toLowerCase().includes(l.replace(/\s+/g, '').toLowerCase()))) {
          computedDue += base.amount;
        }
      });
      allFeeStructures.filter(s => s.type === 'custom' && tempSelectedCustomFees.includes(s.id)).forEach(custom => {
        computedDue += custom.amount;
      });

      setRegistry(prev => prev.map(s => 
        s.id === detailStudent.id ? { ...s, amountDue: computedDue } : s
      ));
      setDetailStudent({ ...detailStudent, amountDue: computedDue });
      
      toast.success("Custom fees assigned successfully");
      setIsManagingCustomFees(false);
    } catch (err) {
      toast.error("Failed to assign custom fees");
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
        await bursarApi.recordFee({
          studentId: detailStudent.id,
          termId: currentTermId,
          academicSessionId: currentSessionId,
          amountDue: detailStudent.amountDue || 50000,
          amountPaid: newPaid,
          description: "System generated (Amount Paid updated)",
          receiptImageUrl: ""
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
        studentApi.getAll().catch(() => []),
        classApi.getAll().catch(() => []),
        sessionApi.getAll().catch(() => [])
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
      let tId = currentTerm?.id;
      let tName = currentTerm?.termNumber;

      if (!tId && typeof window !== 'undefined') {
        const userStr = localStorage.getItem('leoned_user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            tId = user?.school?.currentTermId || user?.currentTermId;
          } catch (e) {}
        }
      }
      


      if (!tId) {
         try {
           const dashboardData = await dashboardApi.getBursarDashboard().catch(() => null) as any;
           if (dashboardData) {
             tId = dashboardData.currentTermId || dashboardData.activeTermId || dashboardData.termId;
             if (!tId && dashboardData.currentTerm && typeof dashboardData.currentTerm === 'object') {
                tId = dashboardData.currentTerm.id || dashboardData.currentTerm._id;
             }
           }
         } catch (e) {
           console.error("[DEBUG] Failed to fetch dashboard data for term fallback", e);
         }
      }

      if (!tId && students && students.length > 0) {
        for (const s of students) {
          if ((s as any).currentTermId) { tId = (s as any).currentTermId; break; }
          if ((s as any).termId) { tId = (s as any).termId; break; }
          if ((s as any).academicSession?.terms) {
            const active = (s as any).academicSession.terms.find((t: any) => t.isCurrent);
            if (active?.id) { tId = active.id; break; }
          }
        }
        if (tId) console.log("[DEBUG] Found termId from student object:", tId);
      }

      if (!tId) {
         try {
           const reportData = await bursarApi.getReport().catch(() => null) as any;
           if (reportData) {
             console.log("[DEBUG] getReport succeeded without termId! Data:", reportData);
             tId = reportData.termId || reportData.currentTermId || (reportData.data && reportData.data[0]?.termId);
           }
         } catch(e) {}
      }

      if (currentTerm) {
        setCurrentTermId(tId || '');
        setCurrentTermName(tName || '');
      } else if (tId) {
        setCurrentTermId(tId || '');
      }

      let feeRecords: any[] = [];
      if (tId) {
         const classList = Array.isArray(classes) ? classes : [];
         
         const feePromises = classList.map(async (c: any) => {
           let fees = await bursarApi.getClassFees(c.id, tId).catch(() => []) as any;
           if (!fees || fees.length === 0 || (fees.data && fees.data.length === 0)) {
             fees = await bursarApi.getClassFees(c.id, tId).catch(() => []) as any;
           }
           return fees;
         });
         
         const classFees = await Promise.all(feePromises);
         
         feeRecords = classFees.map(f => {
           if (Array.isArray(f)) return f;
           if (f && typeof f === 'object' && 'data' in f) return (f as any).data;
           if (f && typeof f === 'object' && 'items' in f) return (f as any).items;
           return [];
         }).flat();
         console.log("[DEBUG] Fetched feeRecords:", feeRecords);
      }

      // FALLBACK: If feeRecords is empty, try fetching individually for each student
      if (feeRecords.length === 0) {
         console.log("[DEBUG] Bulk fetch returned empty or currentTerm missing, falling back to individual getStudentFees...");
         if (students && students.length > 0) {
            console.log("[DEBUG] First student FULL object:", JSON.stringify(students[0], null, 2));
         }
         const individualPromises = (Array.isArray(students) ? students : []).map(async (s: any) => {
             let res = null;
             res = await bursarApi.getStudentFees(s.id, tId).catch((err) => {
               console.warn(`[DEBUG] getStudentFees failed for ${s.id}:`, err);
               return null;
             }) as any;
             
             if (!res || (Array.isArray(res) && res.length === 0) || (res.data && res.data.length === 0)) {
                res = await bursarApi.getStudentFees(s.id, tId).catch(() => null) as any;
             }
             let items: any[] = [];
            if (Array.isArray(res)) items = res;
            else if (res && Array.isArray(res.data)) items = res.data;
            else if (res && Array.isArray(res.items)) items = res.items;
            else if (res && typeof res === 'object') items = [res.data || res];
            
            return items.map(item => ({ ...item, studentId: s.id }));
         });
         const individualResults = await Promise.all(individualPromises);
         feeRecords = individualResults.flat().filter(Boolean);
         console.log("[DEBUG] Flattened Individual fetch feeRecords:", feeRecords);
      }

      const feeMap = new Map();
      feeRecords.forEach(f => {
         if (!f) return;
         const sId = f.studentId || f.student?.id || f.student?._id || (typeof f.student === 'string' ? f.student : null);
         if (sId) {
            feeMap.set(sId.toString(), f);
         } else {
            console.warn("[DEBUG] Could not extract student ID from fee record:", f);
         }
      });
      console.log("[DEBUG] Final feeMap keys:", Array.from(feeMap.keys()));
      console.log("[DEBUG] Students available to map:", students.map(s => ({ id: s.id, refId: (s as any).refId, studentId: (s as any).studentId, name: s.fullName })));

      // Load fee structures
      const { feeStructureApi } = await import('@/lib/api');
      const feeStructures = await feeStructureApi.getStructures().catch(() => []);
      const customFeesMap = await feeStructureApi.getStudentCustomFees().catch(() => ({}));
      setAllFeeStructures(feeStructures);
      setStudentCustomFeesMap(customFeesMap);

      const localFeesStr = typeof window !== 'undefined' ? localStorage.getItem('mock_fee_records') : null;
      const localFees = localFeesStr ? JSON.parse(localFeesStr) : {};
      let needsBackfill = false;

      const mapped: StudentRegistry[] = students.map((student) => {
        const fee = feeMap.get(student.id) || feeMap.get((student as any).refId) || feeMap.get((student as any).studentId);
        if (student.fullName === "Kid Gojo") {
           console.log("[DEBUG] Kid Gojo fee record JSON:", JSON.stringify(fee, null, 2));
        }
        
        const localFee = localFees[student.id] || {};
        const sClass = (student as any).class || student.className || "";

        // Compute Base Fees
        let computedDue = 0;
        feeStructures.filter(s => s.type === 'base').forEach(base => {
          if (base.applicableLevels.some(l => sClass.replace(/\s+/g, '').toLowerCase().includes(l.replace(/\s+/g, '').toLowerCase()))) {
            computedDue += base.amount;
          }
        });
        
        // Compute Custom Fees
        const studentCustoms = (customFeesMap as any)[student.id] || [];
        feeStructures.filter(s => s.type === 'custom' && studentCustoms.includes(s.id)).forEach(custom => {
          computedDue += custom.amount;
        });

        // If no base fee matches, default to 0. (Previously 50000)
        
        const finalAmountDue = computedDue;
        const finalAmountPaid = fee ? fee.amountPaid || fee.paidAmount || 0 : 0;
        
        let finalStatus = "Unpaid";
        if (fee) {
          const fs = fee.status ? fee.status.toLowerCase() : "";
          if (fs === "cleared" || fee.isCleared || (fee.amountDue > 0 && finalAmountPaid >= fee.amountDue)) {
            finalStatus = "Cleared";
          } else if (fs === "pending" || fs === "pending verification" || fee.receiptImageUrl || fee.receiptUrl) {
            finalStatus = "Pending Verification";
          } else if (fs === "notrecorded" || fs === "unpaid") {
            finalStatus = "Unpaid";
          } else if (fs) {
            finalStatus = fee.status; // use as is
          } else if (finalAmountDue === 0) {
            finalStatus = "Cleared";
          }
        } else if (finalAmountDue === 0) {
          finalStatus = "Cleared";
        }

        // Backfill studentName into existing local records
        if (localFees[student.id] && !localFees[student.id].studentName) {
          localFees[student.id].studentName = student.fullName;
          needsBackfill = true;
        }

        return {
          id: student.id,
          name: student.fullName,
          avatarUrl: student.profilePictureUrl || (student as any).avatarUrl,
          program: student.className || "Unassigned",
          refId: student.admissionNumber || student.id,
          status: finalStatus as "Cleared" | "Unpaid" | "Pending Verification",
          amountDue: finalAmountDue,
          amountPaid: finalAmountPaid,
          receiptImageUrl: fee?.receiptImageUrl || fee?.receiptUrl || fee?.imageUrl || fee?.receipt || fee?.paymentReceipt || fee?.proofOfPayment || null,
          paymentDescription: localFee.description || "Tuition Fee",
          paymentDate: localFee.date || new Date().toISOString(),
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
    setAmountDue("0");
    setAmountPaid("0");
    setIsPaymentModalOpen(true);
  };

  const handleOpenClearModal = (studentId: string) => {
    const student = registry.find(s => s.id === studentId);
    setSelectedStudentId(studentId);
    setSelectedTermId(currentTermId);
    setAmountDue(student?.amountDue?.toString() || "0");
    setAmountPaid("0");
    setPaymentDescription("");
    setReceiptImageUrl("");
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
      await bursarApi.recordFee({
        studentId: selectedStudentId,
        termId: selectedTermId,
        academicSessionId: currentSessionId,
        amountDue: parseFloat(amountDue),
        amountPaid: parseFloat(amountPaid),
        description: paymentDescription,
        receiptImageUrl: receiptImageUrl
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
            status: newStatus,
            paymentDescription: paymentDescription || "Manual Fee Payment",
            paymentDate: new Date().toISOString()
          };
        }
        return s;
      }));
      const selectedStudent = registry.find(s => s.id === selectedStudentId);
      updateLocalFee(selectedStudentId, { 
        amountDue: pDue, 
        amountPaid: pPaid, 
        status: newStatus,
        description: paymentDescription || "Manual Fee Payment",
        date: new Date().toISOString()
      }, selectedStudent?.name);
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

    if (!currentTermId) return;

    try {
      if (newStatus === "Cleared") {
        // Use the correct bursar clearance endpoint: PUT /bursar/fees/clear/:studentId
        await bursarApi.clearFee(id, currentTermId);
      } else if (newStatus === "Unpaid") {
        // Record a zero-amount fee to reset status
        await bursarApi.recordFee({
          studentId: id,
          termId: currentTermId,
          academicSessionId: currentSessionId,
          amountDue: actionStudent?.amountDue || 0,
          amountPaid: 0,
          description: "Status reset to Unpaid",
          receiptImageUrl: ""
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
          <div className="flex items-center gap-4">
            <p className="text-gray-500 leading-relaxed text-sm">
              Manage academic access & payment verification
            </p>
            <div className="h-4 w-px bg-gray-300 hidden md:block"></div>
            <Link 
              href="/dashboard/finance/setup"
              className="text-[#053d26] text-sm font-bold hover:underline flex items-center gap-1"
            >
              <Settings2 className="w-4 h-4" />
              Fee Structures Setup
            </Link>
          </div>
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



      {/* Active Students Registry Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Toolbar Header */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Active Students Registry</h2>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Showing {filteredStudents.length} of {registry.length} students</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">

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
                      <div className="w-10 h-10 rounded-full bg-[#053d26] text-white font-bold flex items-center justify-center text-sm shadow-md overflow-hidden shrink-0">
                        {student.avatarUrl ? (
                          <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          student.name.split(" ").map(w => w[0]).join("").substring(0, 2)
                        )}
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
                          <button 
                            onClick={async () => {
                              setReceiptStudent(student);
                              toast.success(`Preparing PDF receipt for ${student.name}...`);
                              setTimeout(async () => {
                                const element = document.getElementById("receipt-container");
                                if (element) {
                                  try {
                                    // @ts-ignore
                                    const html2pdf = (await import("html2pdf.js")).default;
                                    const opt: any = {
                                      margin: 0.5,
                                      filename: `${student.name.replace(/\s+/g, '_')}_Receipt.pdf`,
                                      image: { type: 'jpeg', quality: 0.98 },
                                      html2canvas: { scale: 2, useCORS: true },
                                      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                                    };
                                    await html2pdf().set(opt).from(element).save();
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }
                                setTimeout(() => setReceiptStudent(null), 1000);
                              }, 800);
                            }}
                            className="p-2 rounded-xl text-gray-400 hover:text-[#b05e1c] transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      
                      {(student.status === "Pending Verification" || student.status === "Unpaid") && (
                        <>
                          <button 
                            onClick={() => handleOpenClearModal(student.id)}
                            className="p-1.5 rounded-xl bg-green-100 text-[#053d26] hover:bg-green-200 transition-colors"
                            title={student.status === "Pending Verification" ? "Verify & Approve" : "Clear Payment"}
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
                                {student.status !== "Unpaid" && (
                                  <button 
                                    onClick={() => {
                                      handleAction(student.id, "Unpaid");
                                      setDropdownOpenId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-bold"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Reject / Mark Unpaid
                                  </button>
                                )}
                                <button 
                                  onClick={() => {
                                    handleAction(student.id, "Cleared");
                                    setDropdownOpenId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Force Clear Student
                                </button>
                                {student.status === "Unpaid" && (
                                  <button 
                                    onClick={() => {
                                      handleAction(student.id, "Pending Verification");
                                      setDropdownOpenId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                                  >
                                    <RotateCw className="w-4 h-4" />
                                    Trigger Re-Verification
                                  </button>
                                )}
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
                  onChange={(e) => {
                    const sId = e.target.value;
                    setSelectedStudentId(sId);
                    const student = registry.find(s => s.id === sId);
                    if (student) {
                      setAmountDue(student.amountDue?.toString() || "0");
                    } else {
                      setAmountDue("0");
                    }
                  }}
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
                <div className="block w-full rounded-2xl border border-gray-100 bg-gray-50 py-3 px-4 text-sm font-bold text-gray-500">
                  {Number(amountDue).toLocaleString()}
                </div>
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

              {/* Description / Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description/Notes</label>
                <textarea
                  value={paymentDescription}
                  onChange={(e) => setPaymentDescription(e.target.value)}
                  placeholder="e.g. Cleared via Bank Transfer"
                  rows={2}
                  className="block w-full rounded-2xl border border-gray-200 bg-white py-3 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-transparent transition-colors resize-none"
                />
              </div>

              {/* Receipt Image URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Receipt Image (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={receiptImageUrl}
                    onChange={(e) => setReceiptImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="block w-full rounded-2xl border border-gray-200 bg-white py-3 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-transparent transition-colors"
                  />
                  <button type="button" onClick={handleUploadClick} className="px-4 bg-gray-100 rounded-2xl text-xs font-bold hover:bg-gray-200 whitespace-nowrap">
                    Upload
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={async (e) => {
                     const file = e.target.files?.[0];
                     if (file) {
                       const toastId = toast.loading(`Uploading ${file.name}...`);
                       try {
                         const url = await uploadToCloudinary(file);
                         setReceiptImageUrl(url);
                         toast.success(`Receipt uploaded successfully!`, { id: toastId });
                       } catch (err) {
                         console.error(err);
                         toast.error(`Failed to upload receipt`, { id: toastId });
                       }
                     }
                  }} />
                </div>
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
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
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
            
            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
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
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 relative">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex justify-between items-center">
                    Amount Due
                    <button 
                      onClick={() => {
                        setTempSelectedCustomFees(studentCustomFeesMap[detailStudent.id] || []);
                        setIsManagingCustomFees(!isManagingCustomFees);
                      }}
                      className="text-[#053d26] hover:text-green-700 underline text-[10px]"
                    >
                      {isManagingCustomFees ? "Cancel" : "Manage Fees"}
                    </button>
                  </p>
                  {isManagingCustomFees && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white shadow-2xl border border-gray-200 rounded-xl p-4 z-20">
                      <h4 className="text-xs font-bold text-gray-900 mb-2 border-b pb-1">Assign Custom Fees</h4>
                      <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                        {allFeeStructures.filter(s => s.type === 'custom').length === 0 && (
                           <p className="text-xs text-gray-500 italic">No custom fees defined.</p>
                        )}
                        {allFeeStructures.filter(s => s.type === 'custom').map(fee => (
                          <label key={fee.id} className="flex items-center gap-2 cursor-pointer text-sm">
                            <input 
                              type="checkbox" 
                              className="rounded text-[#053d26] focus:ring-[#053d26]"
                              checked={tempSelectedCustomFees.includes(fee.id)}
                              onChange={(e) => {
                                if (e.target.checked) setTempSelectedCustomFees([...tempSelectedCustomFees, fee.id]);
                                else setTempSelectedCustomFees(tempSelectedCustomFees.filter(id => id !== fee.id));
                              }}
                            />
                            <span className="flex-1 truncate">{fee.name}</span>
                            <span className="text-xs font-bold text-gray-500">₦{fee.amount.toLocaleString()}</span>
                          </label>
                        ))}
                      </div>
                      <button 
                        onClick={handleSaveCustomFees}
                        className="w-full py-1.5 bg-[#053d26] text-white text-xs font-bold rounded-lg hover:bg-[#042c1b]"
                      >
                        Save Assignment
                      </button>
                    </div>
                  )}
                  <p className="font-bold text-gray-900">₦{(Number(detailStudent.amountDue) || 0).toLocaleString()}</p>
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

              {detailStudent.receiptImageUrl && (
                <div className="mt-4 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex justify-between items-center">
                    Uploaded Payment Receipt
                    <a 
                      href={detailStudent.receiptImageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#053d26] hover:text-green-700 underline flex items-center gap-1 normal-case tracking-normal"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Full Size
                    </a>
                  </p>
                  <div className="rounded-xl overflow-hidden border border-gray-200 bg-white flex items-center justify-center p-2">
                    <img 
                      src={detailStudent.receiptImageUrl} 
                      alt="Payment Receipt" 
                      className="w-full max-h-64 object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}
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
        <div id="receipt-container" className="print-only bg-white text-black font-sans p-6 relative">
          <div 
            className="absolute top-0 left-0 right-0 h-2" 
            style={{ backgroundColor: currentUser?.themeColor || '#053d26' }}
          />
          <div className="border-b border-gray-800 pb-3 mb-4 mt-2 flex justify-between items-end">
            <div className="flex items-center gap-3">
              {currentUser?.logoUrl && (
                <img src={currentUser.logoUrl} alt="School Logo" className="h-12 w-12 object-contain" />
              )}
              <div>
                <h1 
                  className="text-xl font-black mb-0.5 uppercase"
                  style={{ color: currentUser?.themeColor || '#053d26' }}
                >
                  {currentUser?.schoolName || currentUser?.name || 'LEONED AFRICA'}
                </h1>
                <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Official Fee Clearance Receipt</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-800">
                Date: {new Date(receiptStudent.paymentDate || Date.now()).toLocaleDateString()}
              </p>
              <p className="text-xs font-bold text-gray-500">Ref: {receiptStudent.refId}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <h2 className="text-sm font-bold text-gray-900 mb-2">Student Details</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Name</p>
                <p className="text-sm font-bold text-gray-900">{receiptStudent.name}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Program / Class</p>
                <p className="text-sm font-bold text-gray-900">{receiptStudent.program}</p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-sm font-bold text-gray-900 mb-2">Financial Summary</h2>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-gray-600">Payment Description</span>
                <span className="text-xs font-bold text-gray-900">{receiptStudent.paymentDescription || "Tuition Fee"}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-gray-600">Amount Due</span>
                <span className="text-sm font-black text-gray-900">₦{(Number(receiptStudent.amountDue) || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-gray-600">Amount Paid</span>
                <span className="text-sm font-black text-gray-900">₦{(Number(receiptStudent.amountPaid) || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-xs font-bold text-gray-900">Clearance Status</span>
                <span 
                  className="text-sm font-black uppercase tracking-wider"
                  style={{ color: receiptStudent.status === 'Cleared' ? (currentUser?.themeColor || '#053d26') : '#dc2626' }}
                >
                  {receiptStudent.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-200 text-center">
            <p className="text-[10px] font-bold text-gray-400">This is a system-generated receipt and does not require a physical signature.</p>
            <p className="text-[9px] font-bold text-gray-300 mt-1">© {new Date().getFullYear()} {currentUser?.schoolName || currentUser?.name || 'LeonEd Africa'}. Academic Architect System.</p>
          </div>
        </div>
      )}
    </div>
  );
}
