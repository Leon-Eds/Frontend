"use client";

import { useState, useEffect, useCallback } from "react";
import toast from 'react-hot-toast';
import { CheckCircle2, AlertCircle, RefreshCw, Eye, Calendar, Sparkles, TrendingUp, ArrowRight, Clock, FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { resultApi, classApi, sessionApi } from "@/lib/api";

interface PendingSubmission {
  id: string;
  subject: string;
  date: string;
  teacher: string;
  className: string;
  status: "Pending" | "Revision Requested" | "Approved" | "Published";
  classId: string;
  termId: string;
  adminComment?: string;
  teacherComment?: string;
}

function formatActivityTime(dateStr: string) {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return "Just now";
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function ResultsApproval() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<PendingSubmission[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real stats states
  const [totalClassesCount, setTotalClassesCount] = useState(0);
  const [totalResultsCount, setTotalResultsCount] = useState(0);
  const [approvedResultsCount, setApprovedResultsCount] = useState(0);
  const [activities, setActivities] = useState<any[]>([]);

  // Revision details modal state
  const [selectedSubmission, setSelectedSubmission] = useState<PendingSubmission | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState("");

  // Derived stats
  const urgentCount = submissions.filter(s => s.status === "Pending").length;
  const revisionCount = submissions.filter(s => s.status === "Revision Requested").length;
  const completionPercentage = totalResultsCount > 0 
    ? Math.round((approvedResultsCount / totalResultsCount) * 100) 
    : 100;

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

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Get all sessions and find the current one + current term
      const sessions = await sessionApi.getAll();
      const currentSession = sessions.find((s) => s.isCurrent);
      if (!currentSession) {
        setSubmissions([]);
        setIsLoading(false);
        return;
      }

      const currentTerm = currentSession.terms?.find((t) => t.isCurrent);
      if (!currentTerm) {
        setSubmissions([]);
        setIsLoading(false);
        return;
      }

      // 2. Get all classes
      const classes = await classApi.getAll();
      setTotalClassesCount(classes.length);
      if (!classes.length) {
        setSubmissions([]);
        setIsLoading(false);
        return;
      }

      // 3. For each class, fetch results for the current term
      const allSubmissions: PendingSubmission[] = [];
      let totalResults = 0;
      let approvedResults = 0;

      const resultPromises = classes.map(async (cls) => {
        try {
          const results = await resultApi.getClassResults(cls.id, currentTerm.id);
          console.log(`[Approvals] Results for class ${cls.name}:`, results);
          const rData = (results as any)?.data || results;
          const rawStatusStr = String((results as any)?.status || (results as any)?.approvalStatus || rData?.status || rData?.approvalStatus || "Pending").trim().toLowerCase();

          if (rawStatusStr === "approved" || rawStatusStr === "published" || rawStatusStr === "submitted" || rawStatusStr === "revision requested" || rawStatusStr === "revision_requested") {
            totalResults++;
            if (rawStatusStr === "approved" || rawStatusStr === "published") {
              approvedResults++;
            }
            
            let status: PendingSubmission["status"] = "Pending";
            if (rawStatusStr === "revision requested" || rawStatusStr === "revision_requested") status = "Revision Requested";
            else if (rawStatusStr === "approved") status = "Approved";
            else if (rawStatusStr === "published") status = "Published";
            
            const dateRaw = rData?.submittedAt || rData?.updatedAt || rData?.createdAt || "";
            let formattedDate = "";
            if (dateRaw) {
              try {
                const d = new Date(dateRaw);
                formattedDate = `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })}`;
              } catch {
                formattedDate = dateRaw;
              }
            }

            allSubmissions.push({
              id: `${cls.id}-${currentTerm.id}`,
              subject: "Overall Class Results",
              date: formattedDate,
              teacher: rData?.formTeacherName || rData?.teacherName || "Form Teacher",
              className: cls.name || "Unknown Class",
              status,
              classId: cls.id,
              termId: currentTerm.id,
              adminComment: rData?.adminComment || rData?.comment || "",
              teacherComment: rData?.teacherComment || rData?.remark || "",
            });
          }
        } catch (err) {
          // If a single class fails (e.g. no results yet), just skip it
          console.warn(`[Approvals] Could not fetch results for class ${cls.name}:`, err);
        }
      });

      await Promise.all(resultPromises);
      setSubmissions(allSubmissions);
      setTotalResultsCount(totalResults);
      setApprovedResultsCount(approvedResults);
    } catch (err) {
      console.error("[Approvals] Failed to fetch submissions:", err);
      setError(err instanceof Error ? err.message : "Failed to load pending submissions.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Load local activities specific to school and category
  useEffect(() => {
    try {
      const stored = localStorage.getItem("leoned_user");
      if (stored) {
        const user = JSON.parse(stored);
        const schoolId = user.schoolId || "default";
        const key = `leoned_local_activities_${schoolId}`;
        const local = JSON.parse(localStorage.getItem(key) || "[]");
        const filtered = local.filter((act: any) => act.category === "Approvals" || act.category === "Grading");
        setActivities(filtered);
      }
    } catch (e) {
      console.error(e);
    }
  }, [submissions]);

  const handleApprove = async (id: string) => {
    const sub = submissions.find(s => s.id === id);
    if (!sub) return;

    try {
      await resultApi.approve(sub.classId, sub.termId, { approve: true });
      // Try to publish immediately as well
      await resultApi.publish(sub.classId, sub.termId).catch(() => {});
      
      try {
        const { notificationsApi } = await import("@/lib/notifications");
        notificationsApi.addNotification({
          title: "Results Published",
          message: `Results for ${sub.className} - ${sub.subject} have been approved and published.`,
          type: "success",
          targetRole: "Student",
          link: "/dashboard/student-portal"
        });
      } catch (e) {
        console.error("Failed to send notification", e);
      }

      setSubmissions(prev => prev.filter(item => item.classId !== sub.classId));
      setApprovedResultsCount(prev => prev + submissions.filter(item => item.classId === sub.classId).length);
      toast.success("Results approved successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to approve results";
      toast.error(message);
    }
  };

  const handleRequestRevision = (id: string) => {
    const sub = submissions.find(s => s.id === id);
    if (!sub) return;
    setSelectedSubmission(sub);
    setRejectComment("");
    setIsRejectModalOpen(true);
  };

  const submitRevision = async () => {
    if (!selectedSubmission) return;

    try {
      await resultApi.approve(selectedSubmission.classId, selectedSubmission.termId, { 
        approve: false, 
        adminComment: rejectComment || "Revision requested" 
      });
      setSubmissions(prev => prev.map(item => {
        if (item.classId === selectedSubmission.classId) {
          return { ...item, status: "Revision Requested", adminComment: rejectComment || "Revision requested" };
        }
        return item;
      }));
      // Notify teachers about the revision
      try {
        const { notificationsApi } = await import("@/lib/notifications");
        notificationsApi.addNotification({
          title: "Revision Requested",
          message: `Results for ${selectedSubmission.className} need revision: ${rejectComment || "Please review and resubmit."}`,
          type: "warning",
          targetRole: ["Teacher", "Faculty"],
          link: "/dashboard/faculty/revisions"
        });
      } catch (e) {
        console.error("Failed to send revision notification", e);
      }

      toast.success("Revision requested successfully");
      setIsRejectModalOpen(false);
      setSelectedSubmission(null);
      setRejectComment("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to request revision";
      toast.error(message);
    }
  };

  const pendingRecords = submissions.filter(sub => sub.status !== "Approved" && sub.status !== "Published");
  const publishedRecords = submissions.filter(sub => sub.status === "Approved" || sub.status === "Published");

  const filteredPendingRecords = pendingRecords.filter(sub => {
    if (activeFilter === "Pending") return sub.status === "Pending";
    return true;
  });

  const renderSubmissionCard = (sub: PendingSubmission) => (
    <div 
      key={sub.id} 
      className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        {/* Calendar Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center shrink-0">
          <span className="text-lg font-black text-gray-900 leading-none">{sub.date.split(" ")[0]}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{sub.date.split(" ")[1] || ""}</span>
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-gray-900 text-base">{sub.subject}</h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              sub.status === "Pending" 
                ? "bg-yellow-100 text-yellow-800" 
                : sub.status === "Revision Requested"
                ? "bg-orange-100 text-orange-800"
                : "bg-green-100 text-green-800"
            }`}>
              {sub.status}
            </span>
          </div>
          <p className="text-xs text-gray-500 font-semibold">
            Teacher: <span className="text-gray-700">{sub.teacher}</span> • Class: <span className="text-gray-700">{sub.className}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {sub.status === "Revision Requested" ? (
          <button 
            onClick={() => {
              setSelectedSubmission(sub);
              setIsDetailsOpen(true);
            }}
            className="px-4 py-2.5 rounded-full bg-gray-50 text-gray-700 text-xs font-bold border border-gray-200 hover:bg-gray-100 transition-all"
          >
            View Details
          </button>
        ) : sub.status === "Approved" || sub.status === "Published" ? (
          <button 
            onClick={() => router.push(`/dashboard/approvals/approved-results?classId=${sub.classId}`)}
            className="px-4 py-2.5 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200 hover:bg-green-100 transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            View Details
          </button>
        ) : (
          <>
            <button 
              onClick={() => router.push(`/dashboard/approvals/class-results?classId=${sub.classId}`)}
              className="px-4 py-2.5 rounded-full bg-gray-50 text-gray-700 text-xs font-bold border border-gray-200 hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              <Eye className="w-3.5 h-3.5" />
              View Results
            </button>
            <button 
              onClick={() => handleRequestRevision(sub.id)}
              className="px-4 py-2.5 rounded-full bg-gray-50 text-gray-700 text-xs font-bold border border-gray-200 hover:bg-gray-100 transition-all"
            >
              Request Revision
            </button>
            <button 
              onClick={() => handleApprove(sub.id)}
              className="px-5 py-2.5 rounded-full bg-[#053d26] text-white text-xs font-bold hover:bg-[#042c1b] transition-all shadow"
            >
              Approve
            </button>
          </>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-[#053d26] animate-spin" />
          <p className="text-sm font-semibold text-gray-500">Loading pending submissions…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="text-sm font-semibold text-gray-700">{error}</p>
          <button
            onClick={fetchSubmissions}
            className="px-5 py-2.5 rounded-full bg-[#053d26] text-white text-xs font-bold hover:bg-[#042c1b] transition-all shadow"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Results Approval</h1>
        <p className="text-gray-500 max-w-3xl leading-relaxed text-sm">
          Review and authorize final academic performance records before they are released to the student portal. Ensure all grade distributions meet institutional standards.
        </p>
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 gap-6">
        {/* Urgent Attention */}
        <div className="rounded-3xl bg-[#053d26] p-8 shadow-sm text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
            <Clock className="w-32 h-32" />
          </div>
          <div className="space-y-2 relative z-10">
            <p className="text-xs font-bold uppercase tracking-wider text-green-200">Urgent Attention</p>
            <p className="text-5xl font-black">{urgentCount}</p>
            <p className="text-xs text-green-100/70 font-semibold pt-2">Pending results require your review today.</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Pending Submissions</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveFilter("All")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeFilter === "All" ? "bg-gray-900 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Records
            </button>
            <button 
              onClick={() => setActiveFilter("Pending")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeFilter === "Pending" ? "bg-gray-900 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Urgent First
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredPendingRecords.map(renderSubmissionCard)}

          {filteredPendingRecords.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 text-lg mb-1">All Caught Up!</h3>
              <p className="text-sm text-gray-400 font-semibold">There are no pending submissions awaiting approval.</p>
            </div>
          )}
        </div>

        {publishedRecords.length > 0 && (
          <div className="pt-8 mt-8 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Published Results</h2>
            <div className="space-y-4">
              {publishedRecords.map(renderSubmissionCard)}
            </div>
          </div>
        )}
      </div>

      {/* Revision Details Modal */}
      {isDetailsOpen && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-100 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold text-gray-900">Revision Details</h3>
              <button 
                onClick={() => {
                  setIsDetailsOpen(false);
                  setSelectedSubmission(null);
                }}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Class & Subject</p>
                <p className="text-sm font-bold text-gray-900">{selectedSubmission.className} — {selectedSubmission.subject}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Submitted By</p>
                <p className="text-sm font-semibold text-gray-700">{selectedSubmission.teacher} on {selectedSubmission.date}</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100/50 space-y-1">
                <p className="text-[10px] font-bold text-orange-800 uppercase tracking-wider">Administrator Feedback</p>
                <p className="text-xs text-orange-900 font-medium leading-relaxed">
                  {selectedSubmission.adminComment || "Please review the entered scores and resubmit for approval."}
                </p>
              </div>

              {selectedSubmission.teacherComment && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Teacher's Remark</p>
                  <p className="text-xs text-gray-700 font-medium leading-relaxed">
                    {selectedSubmission.teacherComment}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setIsDetailsOpen(false);
                  setSelectedSubmission(null);
                }}
                className="px-6 py-2.5 rounded-full bg-gray-950 text-white text-xs font-bold hover:bg-gray-800 transition-all shadow"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject/Request Revision Modal */}
      {isRejectModalOpen && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-100 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Request Revision
              </h3>
              <button 
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setSelectedSubmission(null);
                }}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                You are requesting a revision for <strong>{selectedSubmission.className} — {selectedSubmission.subject}</strong> submitted by {selectedSubmission.teacher}.
              </p>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Administrator Feedback</label>
                <textarea
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  placeholder="Explain why this submission is being rejected and what the teacher needs to correct..."
                  className="w-full rounded-xl border border-gray-200 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[120px] resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setSelectedSubmission(null);
                }}
                className="px-6 py-2.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitRevision}
                disabled={!rejectComment.trim()}
                className="px-6 py-2.5 rounded-full bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-all shadow disabled:opacity-50"
              >
                Send to Teacher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
