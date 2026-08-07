"use client";

import { useState, useEffect, Suspense } from "react";
import { CheckCircle2, AlertCircle, Loader2, FileText, Send, UserCheck, ShieldAlert, Award, FileSpreadsheet, Settings, X, Edit, Save, Download } from "lucide-react";
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
  const [schoolName, setSchoolName] = useState("LEONED ACADEMY");
  const [schoolEmail, setSchoolEmail] = useState("info@leoned.com");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);

  const [currentSessionName, setCurrentSessionName] = useState<string>("");
  const [classAverages, setClassAverages] = useState<Record<string, string>>({});
  const [isResultEditingActive, setIsResultEditingActive] = useState(true);
  const [isTogglingLock, setIsTogglingLock] = useState(false);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMetadata, setEditingMetadata] = useState<any>(null);
  const [isSavingMetadata, setIsSavingMetadata] = useState(false);

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
        
        setSchoolName(user.schoolName || "LEONED ACADEMY");
        if (user.school) {
          if (user.school.contactEmail) setSchoolEmail(user.school.contactEmail);
          if (user.school.address) setSchoolAddress(user.school.address);
        }
        
        const sIdForLogo = user.schoolId || user.school?.id || user.school?._id;
        const cachedLogo = sIdForLogo ? localStorage.getItem(`leoned_logo_${sIdForLogo}`) : null;
        setSchoolLogo(user.logoUrl || cachedLogo || null);
        
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
        
        if (activeSession?.name) {
          setCurrentSessionName(activeSession.name);
        }

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
        
        // Fetch editing status
        try {
          const statusRes = await resultApi.getEditingStatus(targetClassId);
          const statusData = (statusRes as any)?.data || statusRes;
          setIsResultEditingActive(statusData?.isResultEditingActive !== false);
        } catch (err) {
          console.warn("Failed to fetch editing status");
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

  // Compute class averages asynchronously for all subjects
  useEffect(() => {
    const computeAverages = async () => {
      if (!currentTerm || results.length === 0 || Object.keys(classAverages).length > 0) return;
      try {
        const resPromises = results.map(r => 
          resultApi.getStudentResults(r.studentId, currentTerm.id).catch(() => null)
        );
        const allRes = await Promise.all(resPromises);
        const allData = allRes.map(res => (res as any)?.data || res);

        const totals: Record<string, { sum: number, count: number }> = {};
        
        allData.forEach((detailData: any) => {
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
          
          subjectScores.forEach((s: any) => {
            const sName = s.subjectName || s.subject?.name || s.name || "Subject";
            const score = Number(s.total || s.totalScore || 0);
            if (!isNaN(score)) {
              if (!totals[sName]) totals[sName] = { sum: 0, count: 0 };
              totals[sName].sum += score;
              totals[sName].count += 1;
            }
          });
        });
        
        const avgs: Record<string, string> = {};
        Object.keys(totals).forEach(k => {
          if (totals[k].count > 0) {
            avgs[k] = (totals[k].sum / totals[k].count).toFixed(1);
          }
        });
        setClassAverages(avgs);
      } catch (e) {
        console.error("Failed to compute class averages", e);
      }
    };
    computeAverages();
  }, [results, currentTerm]);

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
          classAvg: s.classAverage || s.classAvg || classAverages[s.subjectName || s.subject?.name || "Subject"],
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

  const handleToggleEditing = async () => {
    if (!formClass) return;
    setIsTogglingLock(true);
    try {
      await resultApi.toggleEditing(formClass.classId || formClass.id);
      setIsResultEditingActive(!isResultEditingActive);
      toast.success(isResultEditingActive ? "Result entry locked for subject teachers." : "Result entry unlocked for subject teachers.");
    } catch (err) {
      toast.error("Failed to toggle editing status.");
    } finally {
      setIsTogglingLock(false);
    }
  };

  const openEditModal = () => {
    setEditingMetadata({
      daysSchoolOpened: currentResult?.daysSchoolOpened || "",
      daysPresent: currentResult?.daysPresent || "",
      nextTermBegins: currentResult?.nextTermBegins || "",
      promotedTo: currentResult?.promotedTo || "",
      teacherComment: remarks[sId] || currentResult?.teacherComment || "",
      principalsRemark: currentResult?.principalsRemark || "",
      affectiveDomains: currentResult?.affectiveDomains || {
        punctuality: 5, neatness: 5, politeness: 4, honesty: 5, cooperation: 4, peerRelationship: 5
      },
      psychomotorDomains: currentResult?.psychomotorDomains || {
        handwriting: 4, publicSpeaking: 3, sports: 5, clubParticipation: 4, craftSkills: 4, musicalSkill: 3
      },
      gender: currentResult?.student?.gender || currentResult?.gender || "",
      dateOfBirth: currentResult?.student?.dateOfBirth || currentResult?.dateOfBirth || "",
    });
    setIsEditModalOpen(true);
  };

  const saveMetadata = async () => {
    setIsSavingMetadata(true);
    try {
      const studentId = currentResult?.student?.id || currentResult?.student?._id || currentResult?.studentId;
      if (!studentId) throw new Error("Student ID not found.");
      
      const payload = {
        termId: currentTerm?.id,
        affectiveDomains: editingMetadata.affectiveDomains,
        psychomotorDomains: editingMetadata.psychomotorDomains,
        formTeacherRemark: editingMetadata.teacherComment,
        daysPresent: parseInt(editingMetadata.daysPresent) || 0,
        daysSchoolOpened: parseInt(editingMetadata.daysOpened || editingMetadata.daysSchoolOpened) || 0,
        promotedTo: editingMetadata.promotedTo
      };
      
      await teacherPortalApi.updateStudentDomains(studentId, payload);
      
      setRemarks(prev => ({ ...prev, [sId]: editingMetadata.teacherComment }));
      setResults(prev => prev.map((r, i) => i === currentIndex ? { ...r, ...editingMetadata } : r));
      setIsEditModalOpen(false);
      toast.success("Result domains and remark saved successfully!");
    } catch(err: any) {
      toast.error(err.message || "Failed to save metadata.");
    } finally {
      setIsSavingMetadata(false);
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
    if (currentIndex < results.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
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

        <div className="flex items-center gap-3">
          <button 
            onClick={openEditModal}
            disabled={!currentResult}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all text-xs shadow-sm bg-blue-100 text-blue-800 hover:bg-green-200 print:hidden"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit Metadata
          </button>

          <button 
            onClick={handleToggleEditing}
            disabled={isTogglingLock || !formClass}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all text-xs shadow-sm disabled:opacity-50 ${isResultEditingActive ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
          >
            {isTogglingLock ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (isResultEditingActive ? <ShieldAlert className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />)}
            {isResultEditingActive ? "Lock Result Entry" : "Unlock Result Entry"}
          </button>

          <button 
            onClick={handleSubmitToAdmin}
            disabled={isSubmitting || results.length === 0 || classStatus === "Submitted" || classStatus === "Approved"}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#053d26] text-white font-semibold hover:bg-[#042c1b] transition-all text-xs shadow-md disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            {isSubmitting ? "Submitting..." : (classStatus === "Submitted" || classStatus === "Approved") ? "Submitted" : "Submit"}
          </button>


        </div>
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
        <div id="result-pdf-content" className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col print-only print:shadow-none print:border-none print:rounded-none print:overflow-visible">
          {/* --- PAGE 1 --- */}
          <div className="print:break-after-page print:min-h-[297mm] p-6 sm:p-8 flex flex-col text-sm print:pt-4">
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-[#053d26] pb-4 mb-3">
              <div className="w-20 h-20 shrink-0 rounded-full border-4 border-[#b45309] bg-[#053d26] text-white flex items-center justify-center overflow-hidden flex-col">
                {schoolLogo ? (
                  <img src={schoolLogo} alt="School Logo" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <>
                    <Award className="w-6 h-6 text-[#b45309]" />
                    <span className="text-[10px] font-bold mt-1 tracking-wider">{schoolName.substring(0, 3).toUpperCase()}</span>
                  </>
                )}
              </div>
              <div className="text-center flex-1 px-4">
                <h1 className="text-2xl sm:text-3xl font-black text-[#053d26] uppercase tracking-wide">
                  {schoolName.toUpperCase()}
                </h1>
              </div>
            </div>
            
            <div className="text-center py-2 mb-4 border-b border-gray-300 mx-16">
              <h2 className="text-xl font-bold text-[#053d26] tracking-[0.2em] uppercase">Terminal Academic Report</h2>
              <p className="text-[#b45309] font-bold italic tracking-widest text-sm mt-1">{schoolAddress || "Empowering the Future"}</p>
              <p className="text-xs text-gray-600 mt-2 font-medium leading-tight">
                <span className="font-bold">Email:</span> {schoolEmail} | <span className="font-bold">Website:</span> www.leoned.com
              </p>
              <p className="text-[#b45309] text-xs font-bold uppercase tracking-widest italic mt-1">{currentTerm?.name || "Current Term"}</p>
            </div>

            {/* Student Details */}
            <div className="bg-[#f8fafc] p-4 sm:p-6 mb-6 border border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-xs">
                <div className="flex"><span className="w-32 font-bold text-[#053d26]">Student's Name:</span> <span id="result-student-name" className="font-medium text-gray-800">{studentName}</span></div>
                <div className="flex"><span className="w-32 font-bold text-[#053d26]">Admission No.:</span> <span className="font-medium text-gray-800">{adm || "-"}</span></div>
                <div className="flex"><span className="w-32 font-bold text-[#053d26]">Class:</span> <span className="font-medium text-gray-800">{formClass?.className || formClass?.name || "-"}</span></div>
                <div className="flex"><span className="w-32 font-bold text-[#053d26]">Gender:</span> <span className="font-medium text-gray-800">{currentResult?.gender || "-"}</span></div>
                {currentResult?.dateOfBirth && !isNaN(new Date(currentResult.dateOfBirth).getTime()) ? <div className="flex"><span className="w-32 font-bold text-[#053d26]">Date of Birth:</span> <span className="font-medium text-gray-800">{new Date(currentResult.dateOfBirth).toLocaleDateString()}</span></div> : null}
                <div className="flex"><span className="w-32 font-bold text-[#053d26]">Term:</span> <span className="font-medium text-gray-800">{currentTerm?.name || "Current Term"}</span></div>
                <div className="flex"><span className="w-32 font-bold text-[#053d26]">Session:</span> <span className="font-medium text-gray-800">{currentSessionName || "-"}</span></div>
                <div className="flex"><span className="w-32 font-bold text-[#053d26]">No. in Class:</span> <span className="font-medium text-gray-800">{classSize > 0 ? classSize : results.length}</span></div>
                <div className="flex"><span className="w-32 font-bold text-[#053d26]">Position in Class:</span> <span className="font-medium text-gray-800">{pos}</span></div>
                {currentResult?.daysSchoolOpened ? <div className="flex"><span className="w-32 font-bold text-[#053d26]">Days School Opened:</span> <span className="font-medium text-gray-800">{currentResult.daysSchoolOpened}</span></div> : null}
                {currentResult?.daysPresent ? <div className="flex"><span className="w-32 font-bold text-[#053d26]">Days Present:</span> <span className="font-medium text-gray-800">{currentResult.daysPresent}</span></div> : null}
                {currentResult?.nextTermBegins && !isNaN(new Date(currentResult.nextTermBegins).getTime()) ? <div className="flex"><span className="w-32 font-bold text-[#053d26]">Next Term Begins:</span> <span className="font-medium text-gray-800">{new Date(currentResult.nextTermBegins).toLocaleDateString()}</span></div> : null}
              </div>
            </div>

            {/* Academic Performance Table */}
            <h3 className="text-[13px] font-black text-[#053d26] tracking-widest uppercase mb-2">Academic Performance</h3>
            <div className="border-t-[3px] border-[#053d26]">
              <table className="w-full text-xs text-center border-collapse mb-4">
                <thead>
                  <tr className="bg-[#053d26] text-white">
                    <th className="py-2.5 px-3 text-left w-[25%] border border-[#053d26] font-bold">SUBJECT</th>
                    <th className="py-2.5 px-1 border border-[#053d26] font-bold leading-tight">CA 1<br/><span className="text-[9px] font-normal">(20)</span></th>
                    <th className="py-2.5 px-1 border border-[#053d26] font-bold leading-tight">CA 2<br/><span className="text-[9px] font-normal">(20)</span></th>
                    <th className="py-2.5 px-1 border border-[#053d26] font-bold leading-tight">EXAM<br/><span className="text-[9px] font-normal">(60)</span></th>
                    <th className="py-2.5 px-1 border border-[#053d26] font-bold leading-tight">TOTAL<br/><span className="text-[9px] font-normal">(100)</span></th>
                    <th className="py-2.5 px-1 border border-[#053d26] font-bold">GRADE</th>
                    <th className="py-2.5 px-1 border border-[#053d26] font-bold leading-tight">CLASS<br/>AVG</th>
                    <th className="py-2.5 px-2 border border-[#053d26] w-[20%] font-bold">REMARK</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subj: any, i: number) => {
                    const subjName = subj.subjectName || subj.subject?.name || subj.subject || "Unknown";
                    const tScore = Number(subj.totalScore || subj.total || 0);
                    const sGrade = subj.grade || (tScore >= 75 ? "A+" : tScore >= 70 ? "A" : tScore >= 60 ? "B+" : tScore >= 50 ? "B" : tScore >= 40 ? "C" : "F");
                    return (
                      <tr key={i} className={i % 2 === 0 ? "bg-[#f8fafc]" : "bg-white"}>
                        <td className="py-2 px-3 text-left font-bold text-[#053d26] border border-gray-300">{subjName}</td>
                        <td className="py-2 px-1 border border-gray-300 text-gray-700">{subj.firstCA || "-"}</td>
                        <td className="py-2 px-1 border border-gray-300 text-gray-700">{subj.secondCA || "-"}</td>
                        <td className="py-2 px-1 border border-gray-300 text-gray-700">{subj.examScore || subj.exam || "-"}</td>
                        <td className="py-2 px-1 border border-gray-300 font-black text-[#053d26]">{subj.totalScore || subj.total || "-"}</td>
                        <td className="py-2 px-1 border border-gray-300 font-bold text-[#053d26]">{sGrade}</td>
                        <td className="py-2 px-1 border border-gray-300 text-gray-700">{subj.classAvg || "-"}</td>
                        <td className="py-2 px-2 border border-gray-300 text-gray-700 text-xs">{subj.remark || "N/A"}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-[#f0fdf4] font-bold text-[#053d26] border-t-2 border-[#053d26]">
                    <td colSpan={4} className="py-3 px-4 text-left border border-gray-300 uppercase">CUMULATIVE SCORE: {totalStudentScore} / {maxPossibleScore}</td>
                    <td colSpan={2} className="py-3 px-4 text-center border border-gray-300 uppercase">AVERAGE: {avg ? Number(avg).toFixed(1) : "-"}%</td>
                    <td colSpan={2} className="py-3 px-4 text-right border border-gray-300 uppercase">POSITION: {pos}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Grading Key */}
            <div className="mt-4 pb-4">
              <h4 className="text-xs font-bold text-[#053d26] mb-2">Grading Key</h4>
              <div className="flex flex-wrap gap-x-8 gap-y-2 text-[11px] text-gray-600 font-medium">
                <div><span className="font-bold text-[#053d26]">A</span> 70-100 (Excellent)</div>
                <div><span className="font-bold text-[#053d26]">B</span> 60-69 (Very Good)</div>
                <div><span className="font-bold text-[#053d26]">C</span> 50-59 (Good)</div>
                <div><span className="font-bold text-[#053d26]">D</span> 45-49 (Fair)</div>
                <div><span className="font-bold text-[#053d26]">E</span> 40-44 (Poor)</div>
                <div><span className="font-bold text-[#053d26]">F</span> 0-39 (Fail)</div>
              </div>
            </div>
          </div>

          {/* --- PAGE 2 --- */}
          <div className="print:break-after-page print:min-h-[297mm] p-6 sm:p-8 flex flex-col text-sm border-t border-gray-300 print:border-none print:pt-12 mt-12 print:mt-0">
            <div className="flex justify-between items-center border-b border-gray-300 pb-2 mb-6 text-xs font-bold text-[#053d26]">
              <span className="uppercase">{schoolName}</span>
              <span className="text-gray-300">|</span>
              <span>Student: {studentName}</span>
              <span className="text-gray-300">|</span>
              <span>Adm. No: {adm || "-"}</span>
            </div>

            <h3 className="text-sm font-bold text-[#053d26] tracking-widest uppercase mb-1 border-b-[2.5px] border-[#b45309] pb-1 inline-block w-full">Affective & Psychomotor Domains</h3>
            <p className="text-[11px] text-gray-500 italic mb-4">Non-academic assessment of behaviour, character and practical skills.</p>

            <div className="flex flex-col sm:flex-row gap-6 mb-2">
              <div className="flex-1">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#053d26] text-white">
                      <th className="py-2 px-3 border border-[#053d26]">BEHAVIOUR (AFFECTIVE)</th>
                      <th className="py-2 px-3 border border-[#053d26] text-center w-20">RATING</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['Punctuality', 'Neatness', 'Politeness', 'Honesty', 'Cooperation', 'Peer Relationship'].map((b, i) => {
                      const keys = ['punctuality', 'neatness', 'politeness', 'honesty', 'cooperation', 'peerRelationship'];
                      const val = currentResult?.affectiveDomains?.[keys[i]] || "-";
                      return (
                        <tr key={i} className={i % 2 === 0 ? "bg-[#f8fafc]" : "bg-white"}>
                          <td className="py-2.5 px-3 border border-gray-300 text-gray-700 font-medium">{b}</td>
                          <td className="py-2.5 px-3 border border-gray-300 text-center font-bold text-[#053d26]">{val}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex-1">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#053d26] text-white">
                      <th className="py-2 px-3 border border-[#053d26]">SKILLS (PSYCHOMOTOR)</th>
                      <th className="py-2 px-3 border border-[#053d26] text-center w-20">RATING</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['Handwriting', 'Public Speaking', 'Sports & Athletics', 'Club Participation', 'Craft / Lab Skills', 'Musical Skill'].map((s, i) => {
                      const keys = ['handwriting', 'publicSpeaking', 'sports', 'clubParticipation', 'craftSkills', 'musicalSkill'];
                      const val = currentResult?.psychomotorDomains?.[keys[i]] || "-";
                      return (
                        <tr key={i} className={i % 2 === 0 ? "bg-[#f8fafc]" : "bg-white"}>
                          <td className="py-2.5 px-3 border border-gray-300 text-gray-700 font-medium">{s}</td>
                          <td className="py-2.5 px-3 border border-gray-300 text-center font-bold text-[#053d26]">{val}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 italic mb-8 border-b border-gray-200 pb-4">Rating scale: 5 = Excellent, 4 = Good, 3 = Fair, 2 = Weak, 1 = Poor</p>

            <div className="space-y-8 flex-1">
              <div>
                <h4 className="text-sm font-bold text-[#053d26] mb-2 flex items-center justify-between">
                  Form Teacher's Remark
                  <span className="text-[10px] font-normal text-gray-400 italic">Edit your remark below:</span>
                </h4>
                <div className="pl-4 border-l-4 border-[#b45309]">
                  <textarea 
                    className="w-full min-h-[60px] p-2 bg-white border border-gray-200 rounded text-sm text-gray-700 italic font-medium focus:outline-none focus:border-[#b45309] resize-y print:border-none print:resize-none"
                    placeholder="Enter your final remark for this student's report card..."
                    value={remarks[sId] || ""}
                    onChange={(e) => setRemarks(prev => ({ ...prev, [sId]: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col items-center">
                  {currentResult?.formTeacherSignatureUrl ? (
                    <img src={currentResult.formTeacherSignatureUrl} alt="Teacher Signature" className="h-10 mb-1 object-contain" crossOrigin="anonymous" />
                  ) : (
                    <div className="h-10 mb-1"></div>
                  )}
                  <div className="w-48 border-t border-gray-400 mb-2"></div>
                  <div className="text-center text-xs">
                    <span className="font-bold">Form Teacher</span><br/>
                    <span>Teacher's Name: {currentResult?.formTeacherName || formClass?.teacher?.name || (formClass?.teacher?.firstName ? `${formClass.teacher.firstName} ${formClass.teacher.lastName || ""}` : "_________________")}</span>
                  </div>
                </div>
              </div>

              {/* Principal's Section */}
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-bold text-[#053d26] mb-2">Principal's Remark</h4>
                <div className="pl-4 border-l-4 border-[#b45309] text-sm text-gray-700 italic mb-4 min-h-[40px]">
                  {currentResult?.principalsRemark || "-"}
                </div>
                <div className="flex flex-col items-center">
                  {currentResult?.principalSignatureUrl ? (
                    <img src={currentResult.principalSignatureUrl} alt="Principal Signature" className="h-10 mb-1 object-contain" crossOrigin="anonymous" />
                  ) : (
                    <div className="h-10 mb-1"></div>
                  )}
                  <div className="w-48 border-t border-gray-400 mb-2"></div>
                  <div className="text-center text-xs">
                    <span className="font-bold">Principal / Head of School</span><br/>
                    <span>Principal's Name: {currentResult?.principalName || "_________________"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 mb-4 border border-green-200 bg-[#f0fdf4] flex justify-between p-3 px-4 text-xs font-bold text-[#053d26]">
              <span>PROMOTED TO: {currentResult?.promotedTo || "-"}</span>
              <span>NEXT TERM BEGINS: {currentResult?.nextTermBegins && !isNaN(new Date(currentResult.nextTermBegins).getTime()) ? new Date(currentResult.nextTermBegins).toLocaleDateString() : "-"}</span>
            </div>

            <div className="flex justify-between items-start mt-4 relative">
              <div className="text-[10px] text-gray-500 italic max-w-sm pt-4">
                <strong className="block text-[#053d26] mb-1 font-bold">Authentication</strong>
                This report is official only when it bears the school's embossed stamp and the Principal's original signature above.
              </div>
              <div className="w-28 h-28 rounded-full border-2 border-dashed border-[#053d26] flex items-center justify-center text-center p-2 opacity-60 shrink-0 right-4 top-2 relative">
                <span className="text-[9px] font-bold text-[#053d26] leading-tight flex flex-col gap-1">
                  OFFICIAL<br/>SCHOOL STAMP
                  <span className="text-[6px] font-normal leading-[1] mt-1 text-[#b45309] uppercase">{schoolName}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="p-6 sm:px-8 bg-gray-50 border-t border-gray-200 flex justify-between items-center print:hidden">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-5 py-2.5 rounded-full border border-gray-300 font-bold text-sm text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous Student
            </button>
            <div className="text-sm font-medium text-gray-500">
              {currentIndex + 1} of {results.length}
            </div>
            <button
              onClick={handleNext}
              disabled={currentIndex === results.length - 1}
              className="px-5 py-2.5 rounded-full bg-[#053d26] text-white font-bold text-sm hover:bg-[#172a6b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next Student
            </button>
          </div>
        </div>
      ) : (
        !isLoading && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <UserCheck className="h-12 w-12 text-gray-300 mb-4" />
            <p className="font-medium">No results found for this class.</p>
          </div>
        )
      )}

      {/* Edit Metadata Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-[#053d26]">Edit Report Card Metadata</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              {/* Attendance & Progression */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider border-b pb-2">Attendance & Progression</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Days School Opened</label>
                    <input type="number" 
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#053d26]"
                      value={editingMetadata?.daysSchoolOpened || ""}
                      onChange={(e) => setEditingMetadata({...editingMetadata, daysSchoolOpened: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Days Present</label>
                    <input type="number" 
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#053d26]"
                      value={editingMetadata?.daysPresent || ""}
                      onChange={(e) => setEditingMetadata({...editingMetadata, daysPresent: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Next Term Begins</label>
                    <input type="date" 
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#053d26]"
                      value={editingMetadata?.nextTermBegins && !isNaN(new Date(editingMetadata.nextTermBegins).getTime()) ? new Date(editingMetadata.nextTermBegins).toISOString().split('T')[0] : ""}
                      onChange={(e) => setEditingMetadata({...editingMetadata, nextTermBegins: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Promoted To (Optional)</label>
                    <input type="text" 
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#053d26]"
                      value={editingMetadata?.promotedTo || ""}
                      onChange={(e) => setEditingMetadata({...editingMetadata, promotedTo: e.target.value})}
                    />
                  </div>
                </div>
              </section>

              {/* Affective Domains */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider border-b pb-2">Affective Domains (1-5)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {['Punctuality', 'Neatness', 'Politeness', 'Honesty', 'Cooperation', 'Peer Relationship'].map((label, idx) => {
                    const keys = ['punctuality', 'neatness', 'politeness', 'honesty', 'cooperation', 'peerRelationship'];
                    const key = keys[idx];
                    return (
                      <div key={key}>
                        <label className="block text-xs font-bold text-gray-700 mb-1">{label}</label>
                        <input type="number" min="1" max="5"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#053d26]"
                          value={editingMetadata?.affectiveDomains?.[key] || ""}
                          onChange={(e) => setEditingMetadata({
                            ...editingMetadata, 
                            affectiveDomains: { ...editingMetadata.affectiveDomains, [key]: Number(e.target.value) }
                          })}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Psychomotor Domains */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider border-b pb-2">Psychomotor Domains (1-5)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {['Handwriting', 'Public Speaking', 'Sports', 'Club Participation', 'Craft Skills', 'Musical Skill'].map((label, idx) => {
                    const keys = ['handwriting', 'publicSpeaking', 'sports', 'clubParticipation', 'craftSkills', 'musicalSkill'];
                    const key = keys[idx];
                    return (
                      <div key={key}>
                        <label className="block text-xs font-bold text-gray-700 mb-1">{label}</label>
                        <input type="number" min="1" max="5"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#053d26]"
                          value={editingMetadata?.psychomotorDomains?.[key] || ""}
                          onChange={(e) => setEditingMetadata({
                            ...editingMetadata, 
                            psychomotorDomains: { ...editingMetadata.psychomotorDomains, [key]: Number(e.target.value) }
                          })}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
              
              {/* Remarks */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider border-b pb-2">Remarks</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Form Teacher's Remark</label>
                    <textarea 
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#053d26] min-h-[80px]"
                      value={editingMetadata?.teacherComment || ""}
                      onChange={(e) => setEditingMetadata({...editingMetadata, teacherComment: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Principal's Remark</label>
                    <textarea 
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#053d26] min-h-[80px]"
                      value={editingMetadata?.principalsRemark || ""}
                      onChange={(e) => setEditingMetadata({...editingMetadata, principalsRemark: e.target.value})}
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 mt-auto">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-5 py-2.5 rounded-full border border-gray-300 font-bold text-sm text-gray-700 hover:bg-white transition-colors"
                disabled={isSavingMetadata}
              >
                Cancel
              </button>
              <button 
                onClick={saveMetadata}
                disabled={isSavingMetadata}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#053d26] text-white font-bold text-sm hover:bg-[#172a6b] transition-colors shadow-sm disabled:opacity-50"
              >
                {isSavingMetadata ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSavingMetadata ? "Saving..." : "Save Metadata"}
              </button>
            </div>
          </div>
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
