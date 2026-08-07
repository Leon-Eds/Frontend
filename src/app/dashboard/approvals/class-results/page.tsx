"use client";

import { useState, useEffect, Suspense } from "react";
import { CheckCircle2, AlertCircle, Loader2, FileText, Send, UserCheck, ShieldAlert, Award, FileSpreadsheet, Download } from "lucide-react";
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
  const [schoolName, setSchoolName] = useState("LEONED ACADEMY");
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [currentSessionName, setCurrentSessionName] = useState<string>("");
  const [classSize, setClassSize] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [schoolEmail, setSchoolEmail] = useState("info@leoned.com");
  const [schoolAddress, setSchoolAddress] = useState("");

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
        if (!urlClassId) {
          setError("No class ID provided in URL.");
          setIsLoading(false);
          return;
        }

        let allClasses: any[] = [];
        try {
          const classesRes = await classApi.getAll();
          allClasses = Array.isArray(classesRes) ? classesRes : ((classesRes as any)?.data || (classesRes as any)?.items || []);
        } catch (e) {}

        const targetFc = allClasses.find(c => String(c.id || c._id) === String(urlClassId));
        if (!targetFc) {
          setError("Class not found.");
          setIsLoading(false);
          return;
        }

        const fc = { ...targetFc, classId: String(targetFc.id || targetFc._id), className: targetFc.name || targetFc.className || "Class" };
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
        setCurrentSessionName(activeSession?.name || "Current Session");
        
        try {
          const userStr = localStorage.getItem("leoned_user");
          if (userStr) {
            const user = JSON.parse(userStr);
            if (user.schoolName) setSchoolName(user.schoolName);
            if (user.schoolLogoUrl || user.schoolLogo) setSchoolLogo(user.schoolLogoUrl || user.schoolLogo);
            if (user.school) {
              if (user.school.contactEmail) setSchoolEmail(user.school.contactEmail);
              if (user.school.address) setSchoolAddress(user.school.address);
            }
          }
        } catch(e) {}

        const targetClassId = fc.classId || fc.id || fc._id;
        
        // Fetch results
        const classResults = await resultApi.getClassResults(targetClassId, activeTerm.id);
        const rData = (classResults as any)?.data || classResults;
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
        
        setResults(prev => prev.map((r, i) => i === currentIndex ? { ...r, subjects: mappedSubjects, isLoadingSubjects: false } : r));
      } catch (err) {
        setResults(prev => prev.map((r, i) => i === currentIndex ? { ...r, isLoadingSubjects: false } : r));
      }
    };
    fetchCurrentStudentDetails();
  }, [currentIndex, results, currentTerm]);

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

  const handleDownloadResult = async () => {
    try {
      setIsDownloading(true);
      const element = document.getElementById("result-pdf-content");
      if (!element) {
        setIsDownloading(false);
        return;
      }
      
      const html2pdf = (await import("html2pdf.js")).default;
      const currentStudentName = document.getElementById("result-student-name")?.innerText || "Student";
      const opt = {
        margin: 10,
        filename: `${currentStudentName}_Result.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };
      
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    } finally {
      setIsDownloading(false);
    }
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
                Review the computed results for {formClass?.name || formClass?.className || "your class"}. 
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadResult}
              disabled={isDownloading || !currentResult}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all text-xs shadow-md disabled:opacity-50 print:hidden"
            >
              {isDownloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Download PDF
            </button>
          </div>
      </div>



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
              <div className="text-right">
                <h1 className="text-2xl sm:text-3xl font-black text-[#053d26] uppercase tracking-wide">
                  {schoolName.toUpperCase()}
                </h1>
                <p className="text-[#b45309] font-bold italic tracking-widest text-sm mt-1">{schoolAddress || "Empowering the Future"}</p>
                <p className="text-xs text-gray-600 mt-2 font-medium leading-tight">
                  <span className="font-bold">Email:</span> {schoolEmail} | <span className="font-bold">Website:</span> www.leoned.com
                </p>
              </div>
            </div>
            
            <div className="text-center py-2 mb-4 border-b border-gray-300 mx-16">
              <h2 className="text-xl font-bold text-[#053d26] tracking-[0.2em] uppercase">Terminal Academic Report</h2>
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
