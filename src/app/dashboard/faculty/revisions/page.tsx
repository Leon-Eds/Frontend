"use client";

import { useState, useEffect } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Loader2, MessageSquare, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resultApi, sessionApi, teacherPortalApi, attendanceApi } from "@/lib/api";

interface RevisionItem {
  classId: string;
  className: string;
  termId: string;
  termName: string;
  adminComment: string;
  date: string;
}

export default function FacultyRevisions() {
  const router = useRouter();
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRevisions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const storedUser = localStorage.getItem("leoned_user");
        if (!storedUser) return;
        const user = JSON.parse(storedUser);
        const userId = user.id || user._id || user.teacher?.id || user.teacher?._id;

        // Find the teacher's form classes
        let myFormClasses: any[] = [];

        try {
          const formClassesRes = await attendanceApi.getMyFormClasses();
          const unwrapped = Array.isArray(formClassesRes) ? formClassesRes : ((formClassesRes as any).data || (formClassesRes as any).items || (formClassesRes as any).classes || (formClassesRes as any).formClasses || []);
          myFormClasses = Array.isArray(unwrapped) ? unwrapped : [];
        } catch (e) {
          console.warn("Failed to fetch form classes via attendanceApi, trying fallback");
        }

        // Fallback: check teacher portal classes
        if (myFormClasses.length === 0) {
          try {
            const classesRes = await teacherPortalApi.getClasses();
            const allClasses = Array.isArray(classesRes) ? classesRes : ((classesRes as any)?.data || (classesRes as any)?.items || []);
            myFormClasses = allClasses.filter((c: any) => c.formTeacherId === userId || c.formTeacher?.id === userId || c.formTeacher?._id === userId);
          } catch (e) {
            console.warn("Failed to fetch classes from teacher portal");
          }
        }

        // Fallback: check user object
        if (myFormClasses.length === 0 && user?.teacher?.formClass) {
          const userFcs = Array.isArray(user.teacher.formClass) ? user.teacher.formClass : [user.teacher.formClass];
          myFormClasses = userFcs.map((fc: any) => {
            if (typeof fc === 'string') return { id: fc, classId: fc, name: "Class" };
            return { ...fc, classId: fc.id || fc.classId || fc._id, name: fc.name || fc.className || "Class" };
          });
        }

        if (myFormClasses.length === 0) {
          setRevisions([]);
          setIsLoading(false);
          return;
        }

        // Get current term
        const sessions = await sessionApi.getAll();
        const activeSession = sessions.find(s => s.isCurrent);
        const activeTerm = activeSession?.terms?.find(t => t.isCurrent);

        if (!activeTerm) {
          setError("No active academic term found.");
          setIsLoading(false);
          return;
        }

        // Check each form class for revision status
        const revisionItems: RevisionItem[] = [];

        await Promise.all(myFormClasses.map(async (fc: any) => {
          const classId = typeof fc === 'string' ? fc : (fc.id || fc.classId || fc._id);
          const className = typeof fc === 'string' ? "Class" : (fc.name || fc.className || "Class");

          try {
            const classResults = await resultApi.getClassResults(classId, activeTerm.id);
            const rData = (classResults as any)?.data || classResults;
            const rawStatus = String((classResults as any)?.status || rData?.status || rData?.approvalStatus || "").trim().toLowerCase();

            if (rawStatus === "revision requested" || rawStatus === "revision_requested") {
              const adminComment = (classResults as any)?.adminComment || rData?.adminComment || (classResults as any)?.comment || rData?.comment || "Admin requested a revision.";
              
              const updatedAt = (classResults as any)?.updatedAt || rData?.updatedAt || (classResults as any)?.createdAt || rData?.createdAt || new Date().toISOString();
              let formattedDate = "";
              try {
                const d = new Date(updatedAt);
                formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              } catch {
                formattedDate = "Recently";
              }

              revisionItems.push({
                classId,
                className,
                termId: activeTerm.id,
                termName: (activeTerm as any).name || (activeTerm as any).term || "Current Term",
                adminComment,
                date: formattedDate,
              });
            }
          } catch (err) {
            console.warn(`Could not fetch results for class ${className}:`, err);
          }
        }));

        setRevisions(revisionItems);
      } catch (err) {
        console.error("[Revisions] Failed to fetch:", err);
        setError(err instanceof Error ? err.message : "Failed to load revisions.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevisions();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-[#053d26] animate-spin" />
          <p className="text-sm font-semibold text-gray-500">Checking for revision requests…</p>
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
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.back()}
          className="mt-1 p-2 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider rounded-full">
              Action Required
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            Revision Requests
          </h1>
          <p className="text-sm text-gray-500 font-medium max-w-2xl">
            The School Admin has reviewed your submitted results and requested changes on the following classes. Please review the feedback, make corrections, and resubmit.
          </p>
        </div>
      </div>

      {/* Revision Cards */}
      {revisions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 text-lg mb-1">No Pending Revisions</h3>
          <p className="text-sm text-gray-400 font-semibold">All your submitted results are either approved or still awaiting review. Nothing to fix!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {revisions.map((rev) => (
            <div
              key={rev.classId}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-5 w-5 text-amber-600" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-base">{rev.className}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                        Revision Requested
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-semibold">
                      {rev.termName} • Requested on {rev.date}
                    </p>

                    {/* Admin comment */}
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-100/50 rounded-xl">
                      <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">Admin Feedback</p>
                      <p className="text-sm text-amber-900 font-medium leading-relaxed whitespace-pre-wrap">
                        {rev.adminComment}
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/dashboard/faculty/form-class-results?classId=${rev.classId}`}
                  className="px-5 py-2.5 rounded-full bg-[#053d26] text-white text-xs font-bold hover:bg-[#042c1b] transition-all shadow-md flex items-center gap-2 self-end sm:self-center shrink-0"
                >
                  Review & Edit
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
