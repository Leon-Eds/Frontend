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
  const [classStatus, setClassStatus] = useState<string>("Pending");
  const [adminComment, setAdminComment] = useState<string | null>(null);
  const [classSize, setClassSize] = useState<number>(0);

  const currentResult = results[currentIndex];
  let sId = currentResult?.studentId || currentResult?.student?.id || currentResult?.id || currentIndex.toString();
  let subjects = currentResult?.subjects || currentResult?.subjectScores || [];


  let studentName = `Student ${currentIndex + 1} of ${formClass?.className || formClass?.name || 'Unknown'}`;
  let profilePic = "/placeholder-user.jpg";
  let avg: string | number = 0;
  let computedGrade = "F";
  let adm: string = sId;
  let pos: string = "--";
  let totalStudentScore = 0;
  let maxPossibleScore = 0;

  if (currentResult) {
    sId = currentResult.studentId || currentResult.student?.id || currentResult.id || currentIndex.toString();
    
    const nameObj = currentResult.student || currentResult.user || currentResult;
    const derivedName = nameObj.fullName || (nameObj.firstName ? `${nameObj.firstName} ${nameObj.lastName || ''}`.trim() : '') || currentResult.studentName;
    studentName = derivedName || `Student ${currentIndex + 1} of ${formClass?.className || formClass?.name || 'Unknown'}`;
    
    adm = currentResult.admissionNumber || currentResult.student?.admissionNumber || currentResult.user?.admissionNumber || sId;
    pos = currentResult.pos || currentResult.position || currentResult.rank || "--";
    
    profilePic = currentResult.profilePictureUrl || currentResult.student?.profilePictureUrl || currentResult.student?.imageUrl || currentResult.student?.image || currentResult.imageUrl;
    
    let computedAvg = 0;
    if (subjects && subjects.length > 0) {
      const total = subjects.reduce((sum: number, subj: any) => {
        return sum + Number(subj.totalScore || subj.total || 0);
      }, 0);
      computedAvg = total / subjects.length;
      totalStudentScore = total;
      maxPossibleScore = subjects.length * 100;
    }
    
    avg = currentResult.averageScore || currentResult.average || (computedAvg > 0 ? computedAvg : currentResult.totalScore) || 0;
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
              let myFormClasses = Array.isArray(unwrapped) ? unwrapped : [];
              
              if (myFormClasses.length === 0) {
                 const myPortalClasses = allClasses.filter((c: any) => c.formTeacherId === userId || c.formTeacher?.id === userId || c.formTeacher?._id === userId);
                 myFormClasses = myPortalClasses;
              }
              
              if (myFormClasses.length > 0) {
                // If there's a classId in URL, try to match it, else use first
                const targetFc = urlClassId 
                  ? myFormClasses.find((c: any) => {
                      const id = typeof c === 'string' ? c : String(c.id || c.classId || c._id);
                      return id === String(urlClassId);
                    }) || myFormClasses[0]
                  : myFormClasses[0];
                  
                if (targetFc) {
                  const id = typeof targetFc === 'string' ? targetFc : String(targetFc.id || targetFc.classId || targetFc._id);
                  const name = typeof targetFc === 'string' ? "Class" : (targetFc.name || targetFc.className || "Class");
                  myFormClass = { ...targetFc, classId: id, className: name };
                }
              }
            } catch (e) {}
            
            if (!myFormClass) {
              // Try to find if user object has formClass
              if (user?.teacher?.formClass) {
                const userFcArr = Array.isArray(user.teacher.formClass) ? user.teacher.formClass : [user.teacher.formClass];
                const matchingFc = urlClassId 
                  ? userFcArr.find((fc: any) => {
                      const id = typeof fc === 'string' ? fc : String(fc.id || fc.classId || fc._id);
                      return id === String(urlClassId);
                    })
                  : userFcArr[0];
                  
                if (matchingFc) {
                  const id = typeof matchingFc === 'string' ? matchingFc : String(matchingFc.id || matchingFc.classId || matchingFc._id);
                  const name = typeof matchingFc === 'string' ? "Class" : (matchingFc.name || matchingFc.className || "Class");
                  myFormClass = { ...matchingFc, classId: id, className: name };
                }
              }
            }
          }
        } catch (e) {}
        
        let fc = myFormClass;
        
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
        
        // Fetch actual class size
        try {
          const cStudentsRes = await teacherPortalApi.getClassStudents(targetClassId);
          const cStudents = Array.isArray(cStudentsRes) ? cStudentsRes : (cStudentsRes as any)?.data || (cStudentsRes as any)?.students || [];
          setClassSize(cStudents.length);
        } catch (err) {
          console.error("Failed to fetch class students for size");
        }
        
        // Fetch results
        const classResults = await resultApi.getClassResults(targetClassId, activeTerm.id);
        const rData = (classResults as any)?.data || classResults;
        
        // Check submission status: backend status field stays "Draft" even after submit,
        // so we also check localStorage for a persisted submission flag
        const rawStatusStr = String((classResults as any)?.status || (classResults as any)?.approvalStatus || rData?.status || rData?.approvalStatus || "").trim().toLowerCase();
        let derivedStatus = "Pending";
        if (rawStatusStr === "approved" || rawStatusStr === "published") derivedStatus = "Approved";
        else if (rawStatusStr === "submitted") derivedStatus = "Submitted";
        else if (rawStatusStr === "revision requested" || rawStatusStr === "revision_requested") derivedStatus = "Revision Requested";
        
        // Check localStorage for persisted submission status
        const submissionKey = `leoned_submitted_${targetClassId}_${activeTerm.id}`;
        const storedStatus = localStorage.getItem(submissionKey);
        if (storedStatus === "submitted" || storedStatus === "approved") {
          derivedStatus = storedStatus === "approved" ? "Approved" : "Submitted";
        }
        // If admin requested revision, clear the localStorage flag
        if (rawStatusStr === "revision requested" || rawStatusStr === "revision_requested") {
          localStorage.removeItem(submissionKey);
          derivedStatus = "Revision Requested";
          
          const aComment = (classResults as any)?.adminComment || rData?.adminComment || (classResults as any)?.comment || rData?.comment || "Admin requested a revision but didn't provide a specific comment.";
          setAdminComment(aComment);
        }
        setClassStatus(derivedStatus);

        let resultsArray: any[] = [];
        if (Array.isArray(rData)) {
          resultsArray = rData;
        } else if (rData && typeof rData === 'object') {
          resultsArray = rData.scores || rData.data || rData.items || rData.students || [];
        }

        // Initialize detailedResults base with summary data
        const detailedResults = resultsArray.map(r => ({
          ...r,
          studentId: r.student?.id || r.studentId,
          subjects: []
        }));

        // Compute positions dynamically based on summary average/total score
        detailedResults.sort((a, b) => {
          let scoreA = Number(a.averageScore || a.average || a.totalScore || 0);
          let scoreB = Number(b.averageScore || b.average || b.totalScore || 0);
          return scoreB - scoreA;
        });

        let currentRank = 1;
        let currentScore = -1;
        detailedResults.forEach((r, index) => {
          let rScore = Number(r.averageScore || r.average || r.totalScore || 0);
          
          if (rScore !== currentScore) {
            currentRank = index + 1;
            currentScore = rScore;
          }
          
          let suffix = "th";
          const lastDigit = currentRank % 10;
          const lastTwo = currentRank % 100;
          if (lastDigit === 1 && lastTwo !== 11) suffix = "st";
          else if (lastDigit === 2 && lastTwo !== 12) suffix = "nd";
          else if (lastDigit === 3 && lastTwo !== 13) suffix = "rd";
          
          r.pos = r.position || r.rank || `${currentRank}${suffix}`;
        });

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

  // Lazy load subject details for the currently viewed student
  useEffect(() => {
    const fetchCurrentStudentDetails = async () => {
      if (results.length === 0 || !currentTerm) return;
      const current = results[currentIndex];
      if (!current) return;
      if (current.subjects && current.subjects.length > 0) return;
      if (current.isLoadingSubjects) return;

      const sId = current.student?.id || current.studentId || current.id;
      if (!sId) return;

      try {
        setResults(prev => prev.map((r, i) => i === currentIndex ? { ...r, isLoadingSubjects: true } : r));
        const detailRes = await resultApi.getStudentResults(sId, currentTerm.id);
        const detailData = (detailRes as any)?.data || detailRes;
        
        let subjectScores: any[] = [];
        if (detailData) {
          if (Array.isArray(detailData)) {
            if (detailData.length > 0 && detailData[0].subjectScores) subjectScores = detailData[0].subjectScores;
            else subjectScores = detailData;
          } else if (detailData.subjectScores) {
            subjectScores = detailData.subjectScores;
          } else if (detailData.subjects) {
            subjectScores = detailData.subjects;
          }
        }
        
        if (subjectScores.length > 0 && subjectScores[0].studentId) {
          const filtered = subjectScores.filter((s: any) => s.studentId === sId);
          if (filtered.length > 0) subjectScores = filtered;
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

        // Extract teacher remark if present
        let remark = "";
        if (Array.isArray(detailData) && detailData.length > 0) {
          remark = detailData[0].teacherComment || detailData[0].formTeacherRemark || detailData[0].teacherRemark || "";
        } else if (detailData && !Array.isArray(detailData)) {
          remark = detailData.teacherComment || detailData.formTeacherRemark || detailData.teacherRemark || "";
        }
        if (remark) {
          setRemarks(prev => {
            if (prev[sId] !== remark) return { ...prev, [sId]: remark };
            return prev;
          });
        }

        setResults(prev => prev.map((r, i) => i === currentIndex ? { ...r, subjects: mappedSubjects, isLoadingSubjects: false } : r));
      } catch (err) {
        setResults(prev => prev.map((r, i) => i === currentIndex ? { ...r, isLoadingSubjects: false } : r));
      }
    };
    fetchCurrentStudentDetails();
  }, [currentIndex, results, currentTerm]);

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
      
      // Persist submission status in localStorage since backend doesn't reflect it
      const submissionKey = `leoned_submitted_${formClass.classId || formClass.id}_${currentTerm.id}`;
      localStorage.setItem(submissionKey, "submitted");
      
      setClassStatus("Submitted");
      toast.success("Results submitted to School Admin for final approval!");
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
          disabled={isSubmitting || results.length === 0 || classStatus === "Submitted" || classStatus === "Approved"}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-all text-sm shadow-md disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {isSubmitting ? "Submitting..." : (classStatus === "Submitted" || classStatus === "Approved") ? "Submitted" : "Submit to Admin"}
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

      {classStatus === "Revision Requested" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">Revision Requested by Admin</h3>
              <p className="mt-1 text-sm text-amber-800 font-medium whitespace-pre-wrap">
                {adminComment || "The School Admin has reviewed your submission and requested some changes before final approval. Please review the scores and submit again."}
              </p>
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


            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 text-left border-y border-gray-200 py-4 mb-4">
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
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase w-20">Position:</span>
                  <span className="text-sm font-black text-[#053d26]">{pos}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase w-20">Total:</span>
                  <span className="text-sm font-black text-[#b05e1c]">
                    {totalStudentScore} / {maxPossibleScore}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase w-20">Class Size:</span>
                  <span className="text-sm font-black text-[#053d26]">{classSize > 0 ? classSize : results.length} Students</span>
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
