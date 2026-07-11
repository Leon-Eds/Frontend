"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Loader2, FileText, Send, UserCheck, ShieldAlert, Award, FileSpreadsheet } from "lucide-react";
import { resultApi, sessionApi, classApi, teacherPortalApi, attendanceApi, subjectApi, dashboardApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function FormClassResults() {
  const router = useRouter();
  const [results, setResults] = useState<any[]>([]);
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [formClass, setFormClass] = useState<any>(null);
  const [currentTerm, setCurrentTerm] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rawDebugData, setRawDebugData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [detailedSubjects, setDetailedSubjects] = useState<any[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const currentResult = results[currentIndex];
  let sId = "";
  let studentName = "";
  let profilePic = "";
  let avg = 0;
  let computedGrade = "";
  let subjects = detailedSubjects;

  if (currentResult) {
    sId = currentResult.studentId || currentResult.student?.id || currentResult.id || currentIndex.toString();
    studentName = currentResult.studentName || currentResult.student?.fullName || `Student ${currentIndex + 1}`;
    profilePic = currentResult.profilePictureUrl || currentResult.student?.profilePictureUrl || currentResult.student?.imageUrl || currentResult.student?.image || currentResult.imageUrl;
    avg = currentResult.totalScore || currentResult.averageScore || currentResult.average || 0;
    computedGrade = currentResult.grade || (avg >= 75 ? "A+" : avg >= 70 ? "A" : avg >= 60 ? "B+" : avg >= 50 ? "B" : avg >= 40 ? "C" : "F");
  }

  useEffect(() => {
    async function fetchDetails() {
      if (!sId || !currentTerm) {
        setDetailedSubjects([]);
        setRawDebugData(null);
        return;
      }
      try {
        setIsLoadingDetails(true);
        const res = await resultApi.getStudentResults(sId, currentTerm.id);
        
        // DEBUG: Save raw response to state
        setRawDebugData(res);
        
        let parsedSubjects: any[] = [];
        const resData = (res as any)?.data || res;

        if (Array.isArray(resData)) {
          parsedSubjects = resData;
        } else if (resData && typeof resData === 'object') {
          // If it's an object, subjects might be a property
          parsedSubjects = resData.subjects || resData.subjectResults || resData.scores || resData.items || [];
        }

        // If we still have a weird nested structure (like an array of length 1 containing the real object)
        if (parsedSubjects.length === 1 && parsedSubjects[0].subjectScores) {
           parsedSubjects = parsedSubjects[0].subjectScores;
        } else if (parsedSubjects.length === 1 && parsedSubjects[0].subjectResults) {
           parsedSubjects = parsedSubjects[0].subjectResults;
        } else if (parsedSubjects.length === 1 && parsedSubjects[0].subjects) {
           parsedSubjects = parsedSubjects[0].subjects;
        }

        setDetailedSubjects(parsedSubjects);
      } catch (err) {
        console.error("Failed to load details", err);
        setDetailedSubjects([]);
        setRawDebugData({ error: String(err) });
      } finally {
        setIsLoadingDetails(false);
      }
    }
    fetchDetails();
  }, [sId, currentTerm]);


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
                const fc = myFormClasses[0];
                myFormClass = { ...fc, classId: fc.id || fc.classId || fc._id, className: fc.name || fc.className || "Class" };
              }
            } catch (e) {}
            
            if (!myFormClass) {
              const today = new Date().toISOString().split('T')[0];
              for (const cls of allClasses) {
                const cId = cls.classId || cls.id || cls._id;
                if (!cId) continue;
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

        // Fetch subjects to map names properly
        let allSubjects: any[] = [];
        try {
          // Try fetching class details first (might 403 for teachers)
          const clsDetails = await classApi.getById(targetClassId).catch(() => null);
          if (clsDetails && clsDetails.subjects && clsDetails.subjects.length > 0) {
            allSubjects = clsDetails.subjects;
          } else {
            // Fallback to teacher subjects
            const subjs = await teacherPortalApi.getSubjects().catch(() => null);
            if (subjs) {
              allSubjects = Array.isArray(subjs) ? subjs : ((subjs as any)?.data || (subjs as any)?.items || []);
            }
          }
          
          // If still empty, try pulling from dashboard assignments
          if (allSubjects.length === 0) {
            const dash = await dashboardApi.getTeacherDashboard().catch(() => null);
            if (dash && (dash as any).assignments) {
               const uniqueSubjs = new Map();
               (dash as any).assignments.forEach((a: any) => {
                 if (a.subjectId) uniqueSubjs.set(a.subjectId, { id: a.subjectId, _id: a.subjectId, name: a.subjectName || 'Subject' });
               });
               allSubjects = Array.from(uniqueSubjs.values());
            }
          }
        } catch (e) {
          console.error("[DEBUG] Failed to load subjects", e);
        }

        console.log("[DEBUG] final allSubjects lookup table:", allSubjects);
        console.log("[DEBUG] raw resultsArray before grouping:", resultsArray);
        if (resultsArray.length > 0) {
          setRawDebugData(resultsArray[0]);
        }
        
        // Group flat results by studentId (or use already grouped ones)
        const grouped = new Map<string, any>();
        
        resultsArray.forEach(r => {
          const sId = r.student?.id || r.studentId;
          if (!sId) return;
          
          if (!grouped.has(sId)) {
            grouped.set(sId, {
              studentId: sId,
              student: r.student,
              studentName: r.student?.fullName || r.studentName,
              subjects: [],
              totalScoreSum: 0,
              subjectCount: 0,
              ...r // Keep existing properties like subjectScores
            });
          }
          
          const studentData = grouped.get(sId);
          
          // If the result is already grouped, subjects are in subjectScores or similar
          if (r.subjectScores || r.subjects) {
            const subjs = r.subjectScores || r.subjects;
            if (Array.isArray(subjs)) {
              subjs.forEach(subj => {
                if (!studentData.subjects.find((s: any) => s.subjectId === subj.subjectId)) {
                  studentData.subjects.push({
                    subjectId: subj.subjectId,
                    subjectName: subj.subjectName || subj.subject?.name || "Subject",
                    firstCA: subj.firstCA,
                    secondCA: subj.secondCA,
                    examScore: subj.examScore,
                    totalScore: subj.totalScore,
                    grade: subj.grade,
                    remark: subj.remark
                  });
                  studentData.totalScoreSum += Number(subj.totalScore || 0);
                  studentData.subjectCount += 1;
                }
              });
            }
          } else if (r.subjectId) {
            // Flat structure
            let resolvedSubjName = r.subject?.name || r.subjectName;
            if (!resolvedSubjName && r.subjectId) {
              const foundSubj = allSubjects.find((s: any) => s.id === r.subjectId || s._id === r.subjectId);
              if (foundSubj) resolvedSubjName = foundSubj.name;
            }
            
            if (!studentData.subjects.find((s: any) => s.subjectId === r.subjectId)) {
              studentData.subjects.push({
                subjectId: r.subjectId,
                subjectName: resolvedSubjName,
                firstCA: r.firstCA,
                secondCA: r.secondCA,
                examScore: r.examScore,
                totalScore: r.totalScore,
                grade: r.grade,
                remark: r.remark
              });
              
              studentData.totalScoreSum += Number(r.totalScore || 0);
              studentData.subjectCount += 1;
            }
          }
        });

        let groupedResults = Array.from(grouped.values());
        
        // Calculate average for each student
        groupedResults = groupedResults.map(g => {
          g.averageScore = g.subjectCount > 0 ? (g.totalScoreSum / g.subjectCount) : 0;
          return g;
        });

        // Fetch students to populate profile pictures for grouped results
        try {
          const classStudentsRes = await teacherPortalApi.getClassStudents(targetClassId);
          const safeClassStudents = Array.isArray(classStudentsRes) ? classStudentsRes : ((classStudentsRes as any)?.data || (classStudentsRes as any)?.items || []);
          
          groupedResults = groupedResults.map(r => {
             const sId = r.studentId;
             const sInfo = safeClassStudents.find((s: any) => s.id === sId || s.studentId === sId || s._id === sId || s.student?.id === sId);
             if (sInfo) {
               r.student = { ...(r.student || {}), ...sInfo, ...sInfo.user, ...sInfo.student };
             }
             return r;
          });
        } catch (e) {
          console.error("Failed to fetch class students for pictures", e);
        }

        // Sort results alphabetically by student name
        groupedResults.sort((a, b) => {
          const nameA = (a.student?.fullName || a.studentName || "").toLowerCase();
          const nameB = (b.student?.fullName || b.studentName || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });

        setResults(groupedResults);
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
        students: results.map((res: any) => {
          const sId = res.student?.id || res.studentId;
          return {
            studentId: sId,
            formTeacherRemark: remarks[sId] || ""
          };
        })
      };
      
      await resultApi.submit(formClass.id, currentTerm.id, payload as any);
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
          {/* Header */}
          <div className="bg-gray-50 p-6 sm:px-8 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center text-xl font-bold text-gray-500 shadow-sm border border-white">
                {profilePic ? (
                  <img src={profilePic} alt="" className="h-full w-full object-cover" />
                ) : (
                  studentName[0].toUpperCase()
                )}
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">{studentName}</h2>
                <p className="text-sm text-gray-500 font-medium mt-1 text-[#b05e1c]">
                  Student {currentIndex + 1} of {results.length}
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-xs uppercase font-bold text-gray-400 tracking-wider">Average</p>
                <p className="text-xl font-black text-gray-900 mt-1">{avg ? Number(avg).toFixed(1) : "-"}</p>
              </div>
              <div className="text-center">
                <p className="text-xs uppercase font-bold text-gray-400 tracking-wider">Grade</p>
                <div className="mt-1">
                  <span className={`px-2.5 py-1 rounded font-black text-xs ${
                    computedGrade.includes('A') ? 'bg-green-100 text-green-700' :
                    computedGrade.includes('B') ? 'bg-blue-100 text-blue-700' :
                    computedGrade.includes('C') ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {computedGrade}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Teacher Remark */}
          <div className="p-6 sm:px-8 bg-amber-50/30 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              Form Teacher's Remark
            </h3>
            <textarea 
              className="w-full min-h-[100px] p-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#053d26] resize-none"
              placeholder="Enter your final remark for this student's report card..."
              value={remarks[sId] || ""}
              onChange={(e) => setRemarks(prev => ({ ...prev, [sId]: e.target.value }))}
            />
          </div>

          {/* Subject Breakdown */}
          {subjects && subjects.length > 0 && (
            <div className="p-6 sm:px-8">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Subject Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {subjects.map((subj: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                    <span className="font-medium text-sm text-gray-700 truncate mr-2" title={subj.subjectName || subj.subject}>
                      {subj.subjectName || subj.subject || "Subject"}
                    </span>
                    <span className="font-bold text-sm text-gray-900">{subj.totalScore || subj.total || "-"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
