"use client";

import { useState, useEffect, Suspense } from "react";
import { CheckCircle2, AlertCircle, Loader2, FileText, Send, UserCheck, ShieldAlert, Award, FileSpreadsheet } from "lucide-react";
import { resultApi, sessionApi, classApi, teacherPortalApi, attendanceApi, subjectApi, dashboardApi, studentApi, scoreApi } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

function FormClassResultsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlClassId = searchParams.get('classId');
  const [results, setResults] = useState<any[]>([]);
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [formClass, setFormClass] = useState<any>(null);
  const [currentTerm, setCurrentTerm] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentResult = results[currentIndex];
  let sId = currentResult?.studentId || currentResult?.student?.id || currentResult?.id || currentIndex.toString();
  let subjects = currentResult?.subjects || currentResult?.subjectScores || [];


  let studentName = `Student ${currentIndex + 1} of ${formClass?.className || formClass?.name || 'Unknown'}`;
  let profilePic = "/placeholder-user.jpg";
  let avg: string | number = 0;
  let computedGrade = "F";
  let adm: string = sId;

  if (currentResult) {
    sId = currentResult.studentId || currentResult.student?.id || currentResult.id || currentIndex.toString();
    
    const nameObj = currentResult.student || currentResult.user || currentResult;
    const derivedName = nameObj.fullName || (nameObj.firstName ? `${nameObj.firstName} ${nameObj.lastName || ''}`.trim() : '') || currentResult.studentName;
    studentName = derivedName || `Student ${currentIndex + 1} of ${formClass?.className || formClass?.name || 'Unknown'}`;
    
    adm = currentResult.admissionNumber || currentResult.student?.admissionNumber || currentResult.user?.admissionNumber || sId;
    
    profilePic = currentResult.profilePictureUrl || currentResult.student?.profilePictureUrl || currentResult.student?.imageUrl || currentResult.student?.image || currentResult.imageUrl;
    avg = currentResult.totalScore || currentResult.averageScore || currentResult.average || 0;
    const numAvg = Number(avg) || 0;
    computedGrade = currentResult.grade || (numAvg >= 75 ? "A+" : numAvg >= 70 ? "A" : numAvg >= 60 ? "B+" : numAvg >= 50 ? "B" : numAvg >= 40 ? "C" : "F");
  }

  useEffect(() => {
    const init = async () => {
      try {
        const storedUser = localStorage.getItem("leoned_user");
        if (!storedUser) return router.push("/login");
        
        const user = JSON.parse(storedUser);
        const userId = user.id || user._id || user.teacher?.id || user.teacher?._id;
        
        // Find form class
        let myFormClass: any = null;
        let allClasses: any[] = [];
        
        try {
          const classesRes = await teacherPortalApi.getClasses();
          allClasses = Array.isArray(classesRes) ? classesRes : ((classesRes as any)?.data || (classesRes as any)?.items || []);
          
          if (userId) {
            try {
              const formClassesRes = await attendanceApi.getMyFormClasses();
              const unwrapped = Array.isArray(formClassesRes) ? formClassesRes : ((formClassesRes as any).data || (formClassesRes as any).items || (formClassesRes as any).classes || (formClassesRes as any).formClasses || []);
              const myFormClasses = Array.isArray(unwrapped) ? unwrapped : [];
              if (myFormClasses.length > 0) {
                // If there's a classId in URL, try to match it, else use first
                const targetFc = urlClassId ? myFormClasses.find((c: any) => c.id === urlClassId || c.classId === urlClassId || c._id === urlClassId) || myFormClasses[0] : myFormClasses[0];
                myFormClass = { ...targetFc, classId: targetFc.id || targetFc.classId || targetFc._id, className: targetFc.name || targetFc.className || "Class" };
              }
            } catch (e) {}
            
            if (!myFormClass) {
              const today = new Date().toISOString().split('T')[0];
              for (const cls of allClasses) {
                const cId = cls.classId || cls.id || cls._id;
                if (!cId) continue;
                
                // If urlClassId is present, we only check that one
                if (urlClassId && cId !== urlClassId) continue;

                try {
                  await attendanceApi.getClassAttendance(cId, today);
                  myFormClass = { ...cls, classId: cId, className: cls.className || cls.name };
                  break;
                } catch (e: any) {
                  const errorMsg = e instanceof Error ? e.message : String(e);
                  if (!errorMsg.includes('403')) {
                    myFormClass = { ...cls, classId: cId, className: cls.className || cls.name };
                    break;
                  }
                }
              }
            }
          }
        } catch (e) {}
        
        let fc = myFormClass;
        
        // Just mock it if not found easily for the demo
        if (!fc && allClasses.length > 0) fc = allClasses[0];
        
        if (!fc) {
          setError("You are not assigned as a Form Teacher to any class.");
          setIsLoading(false);
          return;
        }
        setFormClass(fc);

        const sessions = await sessionApi.getAll();
        const activeSession = sessions.find(s => s.isCurrent);
        const activeTerm = activeSession?.terms?.find(t => t.isCurrent);
        
        if (!activeTerm) {
          setError("No active academic term found.");
          setIsLoading(false);
          return;
        }
        setCurrentTerm(activeTerm);

        const targetClassId = fc.classId || fc.id || fc._id;

        // Compute first to ensure we have latest results
        await resultApi.compute(targetClassId, activeTerm.id).catch(() => {});
        
        // Fetch results
        const classResults = await resultApi.getClassResults(targetClassId, activeTerm.id);
        const rData = (classResults as any)?.data || classResults;
        let resultsArray: any[] = [];
        if (Array.isArray(rData)) {
          resultsArray = rData;
        } else if (rData && typeof rData === 'object') {
          resultsArray = rData.scores || rData.data || rData.items || rData.students || [];
        }

        // Fetch detailed results (with subjectScores) for each student
        // resultApi.getStudentResults returns the full breakdown including subjectScores
        const detailedResults: any[] = [];
        
        const uniqueStudentIds = new Set<string>();
        resultsArray.forEach(r => {
          const sId = r.student?.id || r.studentId;
          if (sId) uniqueStudentIds.add(sId);
        });


        
        await Promise.all(
          Array.from(uniqueStudentIds).map(async (studentId) => {
            try {
              const detailRes = await resultApi.getStudentResults(studentId, activeTerm.id);
              const detailData = (detailRes as any)?.data || detailRes;

              
              // Find the matching summary from resultsArray for name/admission info
              const summaryResult = resultsArray.find(r => (r.student?.id || r.studentId) === studentId);
              
              // Extract subjectScores from the detail response
              let subjectScores: any[] = [];
              if (detailData) {
                if (Array.isArray(detailData)) {
                  // If it's an array, check first item for subjectScores
                  if (detailData.length > 0 && detailData[0].subjectScores) {
                    subjectScores = detailData[0].subjectScores;
                  } else {
                    subjectScores = detailData;
                  }
                } else if (detailData.subjectScores) {
                  subjectScores = detailData.subjectScores;
                } else if (detailData.subjects) {
                  subjectScores = detailData.subjects;
                }
              }
              
              // Filter scores to only this student's entries
              // (the endpoint may return all students' scores for the class)
              if (subjectScores.length > 0 && subjectScores[0].studentId) {
                const filtered = subjectScores.filter((s: any) => s.studentId === studentId);
                if (filtered.length > 0) {
                  subjectScores = filtered;
                }
              }
              
              const mappedSubjects = subjectScores.map((s: any) => ({
                  subjectId: s.subjectId,
                  subjectName: s.subjectName || s.subject?.name || "Subject",
                  firstCA: s.firstCA,
                  secondCA: s.secondCA,
                  examScore: s.exam || s.examScore,
                  totalScore: s.total || s.totalScore,
                  grade: s.grade,
                  remark: s.remark
                }));
              
              detailedResults.push({
                ...summaryResult,
                ...detailData,
                studentId,
                subjects: mappedSubjects
              });
            } catch (err) {

              // Fall back to the summary result
              const summaryResult = resultsArray.find(r => (r.student?.id || r.studentId) === studentId);
              if (summaryResult) detailedResults.push({ ...summaryResult, subjects: [] });
            }
          })
        );



        // Sort results alphabetically by student name
        detailedResults.sort((a, b) => {
          const nameA = (a.student?.fullName || a.studentName || "").toLowerCase();
          const nameB = (b.student?.fullName || b.studentName || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });

        // Pre-populate existing teacher remarks from backend
        const existingRemarks: Record<string, string> = {};
        detailedResults.forEach((r: any) => {
          const sId = r.student?.id || r.studentId;
          const remark = r.teacherComment || r.formTeacherRemark || r.teacherRemark || "";
          if (sId && remark) {
            existingRemarks[sId] = remark;
          }
        });
        if (Object.keys(existingRemarks).length > 0) {
          setRemarks(prev => ({ ...existingRemarks, ...prev }));
        }

        setResults(detailedResults);
      } catch (err: any) {
        setError(err.message || "Failed to load results.");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [router]);


  const handleSubmitToAdmin = async () => {
    if (!formClass || !currentTerm) return;
    setIsSubmitting(true);
    setValidationErrors([]);
    try {
      const payload = {
        remarks: results.map((res: any) => ({
          studentId: res.student?.id || res.studentId,
          comment: remarks[res.student?.id || res.studentId] || ""
        }))
      };
      
      await resultApi.submit(formClass.classId || formClass.id, currentTerm.id, payload as any);
      toast.success("Results submitted to School Admin for final approval!");
      router.push("/dashboard/faculty/classes");
    } catch (err: any) {
      if (err.message && err.message.includes("checkAllSubjectsEntered")) {
        setValidationErrors(["Submission blocked: Not all active students have scores recorded for every subject. Please check the score ledger."]);
      } else if (err.message) {
        setValidationErrors([err.message]);
      } else {
        toast.error("Failed to submit results.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#053d26] mb-4" />
        <p className="text-gray-500 font-medium">Loading form class results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Access Error</h2>
        <p className="text-sm text-gray-500">{error}</p>
        <button onClick={() => router.push("/dashboard/faculty")} className="px-6 py-2.5 bg-[#053d26] text-white rounded-full font-bold text-sm hover:bg-[#042c1b]">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleNext = () => {
    if (currentIndex < results.length - 1) setCurrentIndex(curr => curr + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(curr => curr - 1);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <button 
              onClick={() => router.back()}
              className="mt-1 p-2 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
              title="Go Back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider rounded-full">
                  Term Results
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                Form Class Review
              </h1>
              <p className="text-sm text-gray-500 font-medium max-w-2xl">
                Review the computed results for {formClass?.name || formClass?.className || "your class"}. Once verified, submit them to the School Admin for final approval.
              </p>
            </div>
          </div>

        <button 
          onClick={handleSubmitToAdmin}
          disabled={isSubmitting || results.length === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-all text-sm shadow-md disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {isSubmitting ? "Submitting..." : "Submit to Admin"}
        </button>
      </div>

      {validationErrors.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-rose-900">Cannot Submit Results</h3>
              <ul className="mt-1 text-sm text-rose-700 space-y-1 list-disc list-inside">
                {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
        </ul>
            </div>
          </div>
        </div>
      )}



      {results.length > 0 && currentResult ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          {/* Report Card Header */}
          <div className="bg-white p-6 sm:px-8 border-b border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#053d26]/10 flex items-center justify-center mb-4">
              <Award className="h-8 w-8 text-[#053d26]" />
            </div>
            <h2 className="text-2xl font-black text-[#053d26] uppercase tracking-widest mb-1">Student Report Card</h2>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">
              {formClass?.className || formClass?.name || "LeonEd Academy"} • {currentTerm?.name || "Current Term"}
            </p>


            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-left border-y border-gray-200 py-4 mb-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase w-20">Name:</span>
                  <span className="text-sm font-bold text-gray-900">{studentName}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase w-20">Admission:</span>
                  <span className="text-sm font-bold text-gray-900">{adm}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase w-20">Average:</span>
                  <span className="text-sm font-black text-[#053d26]">{avg ? Number(avg).toFixed(1) : "-"}%</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase w-20">Grade:</span>
                  <span className="text-sm font-black text-[#b05e1c]">{computedGrade}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subject Breakdown Table */}
          {subjects && subjects.length > 0 && (
            <div className="px-6 py-4 sm:px-8">
              <h3 className="text-xs font-extrabold text-[#053d26] uppercase tracking-widest mb-4">Academic Performance</h3>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-[#053d26] text-white text-[10px] uppercase tracking-wider font-black">
                      <th className="py-3 px-4 border-b border-[#042c1b]">Subject</th>
                      <th className="py-3 px-4 border-b border-[#042c1b] text-center">1st CA</th>
                      <th className="py-3 px-4 border-b border-[#042c1b] text-center">2nd CA</th>
                      <th className="py-3 px-4 border-b border-[#042c1b] text-center">Exam</th>
                      <th className="py-3 px-4 border-b border-[#042c1b] text-center">Total</th>
                      <th className="py-3 px-4 border-b border-[#042c1b] text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {subjects.map((subj: any, i: number) => {
                      const subjName = subj.subjectName || subj.subject?.name || subj.subject || "Unknown";
                      const tScore = Number(subj.totalScore || subj.total || 0);
                      const sGrade = subj.grade || (tScore >= 75 ? "A+" : tScore >= 70 ? "A" : tScore >= 60 ? "B+" : tScore >= 50 ? "B" : tScore >= 40 ? "C" : "F");
                      
                      return (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-bold text-gray-900 text-xs">{subjName}</td>
                          <td className="py-3 px-4 font-medium text-gray-600 text-xs text-center">{subj.firstCA || "-"}</td>
                          <td className="py-3 px-4 font-medium text-gray-600 text-xs text-center">{subj.secondCA || "-"}</td>
                          <td className="py-3 px-4 font-medium text-gray-600 text-xs text-center">{subj.examScore || subj.exam || "-"}</td>
                          <td className="py-3 px-4 font-black text-[#053d26] text-xs text-center">{subj.totalScore || subj.total || "-"}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              sGrade.includes('A') ? 'bg-green-100 text-green-700' :
                              sGrade.includes('B') ? 'bg-blue-100 text-blue-700' :
                              sGrade.includes('C') ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {sGrade}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Form Teacher Remark */}
          <div className="p-6 sm:px-8 bg-gray-50 border-t border-gray-100">
            <h3 className="text-xs font-extrabold text-[#053d26] uppercase tracking-widest mb-3 flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5" />
              Form Teacher's Remark
            </h3>
            <textarea 
              className="w-full min-h-[80px] p-4 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#053d26] resize-none"
              placeholder="Enter your final remark for this student's report card..."
              value={remarks[sId] || ""}
              onChange={(e) => setRemarks(prev => ({ ...prev, [sId]: e.target.value }))}
            />

          </div>

          {/* Pagination Controls */}
          <div className="p-6 sm:px-8 bg-white flex justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-5 py-2.5 rounded-full border border-gray-200 font-bold text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous Student
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === results.length - 1}
              className="px-5 py-2.5 rounded-full bg-[#053d26] text-white font-bold text-sm hover:bg-[#042c1b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next Student
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
          <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="font-bold text-lg text-gray-900">No results found</p>
          <p className="text-sm text-gray-500 mt-2">Make sure subject scores have been entered for this class.</p>
        </div>
      )}
    </div>
  );
}

export default function FormClassResults() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#053d26] mb-4" />
        <p className="text-gray-500 font-medium">Loading form class results...</p>
      </div>
    }>
      <FormClassResultsInner />
    </Suspense>
  );
}
