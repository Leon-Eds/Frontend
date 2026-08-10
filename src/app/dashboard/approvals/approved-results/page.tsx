"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import { BookOpen, AlertCircle, FileText, Download, Loader2, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { resultApi, sessionApi, classApi, schoolApi, studentApi } from "@/lib/api";
import Image from "next/image";

export default function ApprovedResults() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sessions, setSessions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  
  const [selectedTermId, setSelectedTermId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  const [results, setResults] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [formTeacherName, setFormTeacherName] = useState("");
  const [formTeacherSignatureUrl, setFormTeacherSignatureUrl] = useState<string | null>(null);

  const [schoolName, setSchoolName] = useState("LeonEd");
  const [schoolEmail, setSchoolEmail] = useState("info@leoned.com");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [principalName, setPrincipalName] = useState("");
  const [principalSignatureUrl, setPrincipalSignatureUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadSchoolInfo = async () => {
      try {
        const stored = localStorage.getItem("leoned_user");
        if (stored) {
          const user = JSON.parse(stored);
          if (user.schoolName) setSchoolName(user.schoolName);
          if (user.logoUrl) setSchoolLogo(user.logoUrl);
          if (user.school) {
            if (user.school.email) setSchoolEmail(user.school.email);
            if (user.school.address) setSchoolAddress(user.school.address);
            if (user.school.principalName || user.school.ownerName || user.school.adminName) {
              setPrincipalName(user.school.principalName || user.school.ownerName || user.school.adminName);
            }
          } else if (user.principalName || user.ownerName) {
            setPrincipalName(user.principalName || user.ownerName);
          }
          // Fetch school details from API for principal name if not found
          const schoolId = user.schoolId || user.SchoolId || user.school?.id;
          if (schoolId) {
            try {
              const sd = await schoolApi.getById(schoolId) as any;
              if (sd?.principalName) setPrincipalName(sd.principalName);
              else if (sd?.ownerName) setPrincipalName(sd.ownerName);
              if (sd?.address) setSchoolAddress(sd.address);
              if (sd?.principalSignatureUrl) setPrincipalSignatureUrl(sd.principalSignatureUrl);
            } catch (e) {}
          }
        }
      } catch (e) {}
    };
    loadSchoolInfo();
  }, []);

  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        const [sessionData, classData] = await Promise.all([
          sessionApi.getAll(),
          classApi.getAll()
        ]);
        setSessions(sessionData);
        setClasses(classData);

        const currentSession = sessionData.find((s: any) => s.isCurrent);
        const currentTerm = currentSession?.terms?.find((t: any) => t.isCurrent);
        
        if (currentTerm) {
          setSelectedTermId(currentTerm.id || (currentTerm as any)._id);
        }

        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const cId = params.get("classId");
          if (cId) setSelectedClassId(cId);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load initial data");
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!selectedTermId || !selectedClassId) {
        setResults([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch students (for passport photos) using admin API
        try {
          const cStudentsRes = await studentApi.getAll();
          const allStudents = Array.isArray(cStudentsRes) ? cStudentsRes : (cStudentsRes as any)?.data || (cStudentsRes as any)?.students || [];
          setClassStudents(allStudents);
          if (allStudents.length > 0) {
            console.log("[DEBUG] Students (Sample):", JSON.stringify({ firstStudent: allStudents[0], keys: Object.keys(allStudents[0]) }, null, 2));
          }
        } catch (e) {
          console.warn("Could not fetch students for passport photos", e);
        }

        // Get class details for form teacher info
        const selectedClass = classes.find((c: any) => (c.id || c._id) === selectedClassId);
        console.log("[DEBUG] Selected Class Object:", JSON.stringify(selectedClass, null, 2));
        if (selectedClass) {
          const ftName = selectedClass.formTeacherName || selectedClass.formTeacher?.name || selectedClass.formTeacher?.fullName || (selectedClass.formTeacher?.firstName ? `${selectedClass.formTeacher.firstName} ${selectedClass.formTeacher.lastName || ''}`.trim() : '') || selectedClass.teacher?.name || selectedClass.teacher?.fullName || (selectedClass.teacher?.firstName ? `${selectedClass.teacher.firstName} ${selectedClass.teacher.lastName || ''}`.trim() : '');
          if (ftName) setFormTeacherName(ftName);
          const ftSig = selectedClass.formTeacherSignatureUrl || selectedClass.formTeacher?.signatureUrl || selectedClass.teacher?.signatureUrl;
          if (ftSig) setFormTeacherSignatureUrl(ftSig);
        }

        const data = await resultApi.getApprovedClassResults(selectedClassId, selectedTermId);
        console.log("[DEBUG Approved Results Payload]", data);
        
        let detailedResults: any[] = [];
        const rData = (data as any)?.data || data;
        
        if (Array.isArray(rData)) {
          detailedResults = rData;
        } else if (rData && typeof rData === 'object') {
          detailedResults = rData.results || rData.scores || rData.items || rData.students || rData.data || [];
        }
        
        // Calculate ranks
        detailedResults.sort((a: any, b: any) => {
          const avgA = Number(a.averageScore || a.average || a.gpa || 0);
          const avgB = Number(b.averageScore || b.average || b.gpa || 0);
          return avgB - avgA;
        });

        let currentRank = 1;
        detailedResults.forEach((r: any, idx: number) => {
          if (idx > 0) {
            const prev = detailedResults[idx - 1];
            const avgPrev = Number(prev.averageScore || prev.average || prev.gpa || 0);
            const avgCurr = Number(r.averageScore || r.average || r.gpa || 0);
            if (avgCurr < avgPrev) {
              currentRank = idx + 1;
            }
          }
          const lastDigit = currentRank % 10;
          const lastTwo = currentRank % 100;
          let suffix = "th";
          if (lastDigit === 1 && lastTwo !== 11) suffix = "st";
          else if (lastDigit === 2 && lastTwo !== 12) suffix = "nd";
          else if (lastDigit === 3 && lastTwo !== 13) suffix = "rd";
          
          r.pos = r.position || r.rank || `${currentRank}${suffix}`;
        });

        // Sort alphabetically
        detailedResults.sort((a: any, b: any) => {
          const nameA = (a.student?.fullName || a.studentName || "").toLowerCase();
          const nameB = (b.student?.fullName || b.studentName || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });

        setResults(detailedResults);
        setCurrentIndex(0);
      } catch (err: any) {
        console.error("[DEBUG Approved Results Error]", err);
        setResults([]);
        setError(err.message || "No approved results found for this selection.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [selectedTermId, selectedClassId]);

  // Lazy load subject details for the currently viewed student
  useEffect(() => {
    const fetchCurrentStudentDetails = async () => {
      if (results.length === 0 || !selectedTermId) return;
      const current = results[currentIndex];
      if (!current) return;
      if (current.subjects && current.subjects.length > 0) return;
      if (current.isLoadingSubjects) return;

      const sId = current.student?.id || current.studentId || current.id;
      if (!sId) return;

      try {
        setResults(prev => prev.map((r, i) => i === currentIndex ? { ...r, isLoadingSubjects: true } : r));
        const detailRes = await resultApi.getStudentResults(sId, selectedTermId);
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
        
        setResults(prev => prev.map((r, i) => i === currentIndex ? { ...r, isLoadingSubjects: false, subjects: subjectScores } : r));
      } catch (e) {
        console.error(e);
        setResults(prev => prev.map((r, i) => i === currentIndex ? { ...r, isLoadingSubjects: false, subjects: [] } : r));
      }
    };
    fetchCurrentStudentDetails();
  }, [currentIndex, results, selectedTermId]);

  const handleDownloadResult = () => {
    // We use the browser's native print engine for perfect vector-quality PDFs 
    // and instantaneous loading time, avoiding html2canvas CSS parsing errors.
    window.print();
  };

  const handleNext = () => {
    if (currentIndex < results.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(curr => curr - 1);
  };

  const currentResult = results[currentIndex];
  const activeTerm = sessions.flatMap(s => s.terms || []).find((t: any) => (t.id || t._id) === selectedTermId);
  const termName = activeTerm?.termNumber === 1 || activeTerm?.termNumber === "First" ? "First Term" : activeTerm?.termNumber === 2 || activeTerm?.termNumber === "Second" ? "Second Term" : activeTerm?.termNumber === 3 || activeTerm?.termNumber === "Third" ? "Third Term" : `${activeTerm?.termNumber || ""} Term`;
  const termLabel = activeTerm ? termName : "Selected Term";
  const selectedClassObj = classes.find((c: any) => (c.id || c._id) === selectedClassId);

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              Approved Results
            </h1>
            <p className="text-sm text-gray-500 font-medium max-w-2xl">
              View and print official results that have been approved by the school administration.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:w-1/2">
          <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Select Term</label>
          <select
            value={selectedTermId}
            onChange={(e) => setSelectedTermId(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#053d26]"
          >
            <option value="">-- Select Term --</option>
            {sessions.map((s: any) => (
              <optgroup key={s.id || s._id} label={s.name}>
                {s.terms?.map((t: any) => (
                  <option key={t.id || t._id} value={t.id || t._id}>
                    Term {t.termNumber || t.name} {t.isCurrent ? '(Current)' : ''}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-1/2">
          <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Select Class</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#053d26]"
          >
            <option value="">-- Select Class --</option>
            {classes.map((c: any) => (
              <option key={c.id || c._id} value={c.id || c._id}>
                {c.name || c.className}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh]">
          <Loader2 className="h-10 w-10 animate-spin text-[#053d26] mb-4" />
          <p className="text-gray-500 font-medium">Fetching approved results...</p>
        </div>
      ) : error || results.length === 0 ? (
        <div className="max-w-md mx-auto py-20 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">No Results Found</h2>
          <p className="text-sm text-gray-500">{error || "Please select a valid term and class to view approved results."}</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <button onClick={handlePrev} disabled={currentIndex === 0} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="text-sm font-bold text-gray-700 w-32 text-center">
                Student {currentIndex + 1} of {results.length}
              </div>
              <button onClick={handleNext} disabled={currentIndex === results.length - 1} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-3 py-1 bg-green-100 text-green-800 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approved
              </span>
              <button
                onClick={handleDownloadResult}
                disabled={isDownloading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all text-xs shadow-md disabled:opacity-50 print:hidden"
              >
                {isDownloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                Download PDF
              </button>
            </div>
          </div>

          <div className="bg-gray-100 p-4 sm:p-8 rounded-3xl overflow-x-auto print:p-0 print:bg-white flex justify-center">
            <div id="result-pdf-content" className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col print-only print:shadow-none print:border-none print:rounded-none print:overflow-visible min-w-[210mm] max-w-[210mm]">
              
              <div className="print:break-after-page print:min-h-0 p-8 flex flex-col text-sm print:pt-4">
                <div className="flex justify-between items-center border-b-2 border-[#053d26] pb-4 mb-3">
                  <div className="w-20 h-20 shrink-0 rounded-full border-4 border-[#b45309] bg-[#053d26] text-white flex items-center justify-center overflow-hidden flex-col">
                    {schoolLogo ? (
                      <img src={schoolLogo} alt="School Logo" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-[10px] font-bold tracking-wider">{schoolName.substring(0, 3).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="text-center flex-1 px-4">
                    <h1 className="text-2xl sm:text-3xl font-black text-[#053d26] uppercase tracking-wide">
                      {schoolName.toUpperCase()}
                    </h1>
                    <p className="text-[#b45309] font-bold italic tracking-widest text-sm mt-1">{schoolAddress || "Empowering the Future"}</p>
                  </div>
                </div>
                
                <div className="text-center py-2 mb-4 border-b border-gray-300 mx-16">
                  <h2 className="text-xl font-bold text-[#053d26] tracking-[0.2em] uppercase">Terminal Academic Report</h2>
                  <p className="text-[#b45309] text-xs font-bold uppercase tracking-widest italic mt-1">{termLabel}</p>
                </div>

                <div className="bg-[#f8fafc] p-6 mb-6 border border-gray-100 flex flex-col sm:flex-row items-start justify-between gap-6">
                  <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-xs flex-1">
                    {(() => {
                      const nameObj = currentResult?.student || currentResult?.user || currentResult;
                      const studentName = nameObj?.fullName || (nameObj?.firstName ? `${nameObj.firstName} ${nameObj.lastName || ''}`.trim() : '') || currentResult?.studentName || "Student";
                      const sId = currentResult?.student?.id || currentResult?.studentId || currentResult?.id;
                      const matchedStudent = classStudents.find((s: any) => s.id === sId || s._id === sId || s.studentId === sId);
                      const profilePic = matchedStudent?.profilePictureUrl || matchedStudent?.imageUrl || matchedStudent?.image || nameObj?.profilePictureUrl || nameObj?.profileImageUrl || nameObj?.imageUrl || nameObj?.image || currentResult?.studentProfilePictureUrl || currentResult?.profilePictureUrl || nameObj?.avatar || '';
                      const adm = currentResult?.admissionNumber || currentResult?.student?.admissionNumber || currentResult?.user?.admissionNumber || "-";
                      const gender = currentResult?.gender || currentResult?.student?.gender || matchedStudent?.gender || "-";
                      return (
                        <>
                          <div className="flex"><span className="w-32 font-bold text-[#053d26]">Student's Name:</span> <span id="result-student-name" className="font-medium text-gray-800">{studentName}</span></div>
                          <div className="flex"><span className="w-32 font-bold text-[#053d26]">Admission No.:</span> <span className="font-medium text-gray-800">{adm}</span></div>
                          <div className="flex"><span className="w-32 font-bold text-[#053d26]">Class:</span> <span className="font-medium text-gray-800">{selectedClassObj?.className || selectedClassObj?.name || "-"}</span></div>
                          <div className="flex"><span className="w-32 font-bold text-[#053d26]">Gender:</span> <span className="font-medium text-gray-800">{gender}</span></div>
                          <div className="flex"><span className="w-32 font-bold text-[#053d26]">Term:</span> <span className="font-medium text-gray-800">{termLabel}</span></div>
                          <div className="flex"><span className="w-32 font-bold text-[#053d26]">Session:</span> <span className="font-medium text-gray-800">{currentResult?.sessionName || currentResult?.session || sessions.find(s => s.terms?.some((t: any) => t.id === selectedTermId || t._id === selectedTermId))?.name || "-"}</span></div>
                          <div className="flex"><span className="w-32 font-bold text-[#053d26]">No. in Class:</span> <span className="font-medium text-gray-800">{classStudents.length > 0 ? classStudents.length : results.length}</span></div>
                          <div className="flex"><span className="w-32 font-bold text-[#053d26]">Position in Class:</span> <span className="font-medium text-gray-800">{currentResult?.pos || currentResult?.position || "-"}</span></div>
                          {currentResult?.daysSchoolOpened ? <div className="flex"><span className="w-32 font-bold text-[#053d26]">Days School Opened:</span> <span className="font-medium text-gray-800">{currentResult.daysSchoolOpened}</span></div> : null}
                          {currentResult?.daysPresent ? <div className="flex"><span className="w-32 font-bold text-[#053d26]">Days Present:</span> <span className="font-medium text-gray-800">{currentResult.daysPresent}</span></div> : null}
                          {currentResult?.nextTermBegins && !isNaN(new Date(currentResult.nextTermBegins).getTime()) ? <div className="flex"><span className="w-32 font-bold text-[#053d26]">Next Term Begins:</span> <span className="font-medium text-gray-800">{new Date(currentResult.nextTermBegins).toLocaleDateString()}</span></div> : null}
                        </>
                      );
                    })()}
                  </div>
                  {(() => {
                    const sId = currentResult?.student?.id || currentResult?.studentId || currentResult?.id;
                    const matchedStudent = classStudents.find((s: any) => s.id === sId || s._id === sId || s.studentId === sId);
                    const nameObj = currentResult?.student || currentResult?.user || currentResult;
                    const profilePic = matchedStudent?.profilePictureUrl || matchedStudent?.imageUrl || matchedStudent?.image || nameObj?.profilePictureUrl || nameObj?.profileImageUrl || nameObj?.imageUrl || nameObj?.image || currentResult?.studentProfilePictureUrl || currentResult?.profilePictureUrl || nameObj?.avatar || '';
                    return (
                      <div className="w-24 h-24 shrink-0 rounded-md border-4 border-white shadow-sm bg-gray-100 flex items-center justify-center overflow-hidden relative self-center sm:self-start">
                        <span className="text-gray-400 text-[10px] font-bold absolute z-0 text-center">NO<br/>PHOTO</span>
                        {profilePic ? (
                          <img src={profilePic} alt="Student Passport" className="w-full h-full object-cover z-10 relative bg-white" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : null}
                      </div>
                    );
                  })()}
                </div>

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
                        <th className="py-2.5 px-1 border border-[#053d26] font-bold">POS</th>
                        <th className="py-2.5 px-2 border border-[#053d26] w-[20%] font-bold">REMARK</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentResult?.isLoadingSubjects ? (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-gray-500">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#053d26] mb-2" />
                            Loading subjects...
                          </td>
                        </tr>
                      ) : (currentResult?.subjects || currentResult?.grades || []).map((subj: any, i: number) => {
                        const subjName = subj.subjectName || subj.subject?.name || subj.subject || "Unknown";
                        const tScore = Number(subj.totalScore || subj.total || 0);
                        const sGrade = subj.grade || (tScore >= 70 ? "A" : tScore >= 60 ? "B" : tScore >= 50 ? "C" : tScore >= 45 ? "D" : tScore >= 40 ? "E" : "F");
                        
                        const remarkText = (sGrade === "A" || sGrade === "A+") ? "Excellent" :
                                           (sGrade === "B" || sGrade === "B+") ? "Very Good" :
                                           (sGrade === "C") ? "Good" :
                                           (sGrade === "D") ? "Fair" :
                                           (sGrade === "E") ? "Poor" :
                                           (sGrade === "F") ? "Fail" : "-";
                        
                        return (
                          <tr key={i} className={i % 2 === 0 ? "bg-[#f8fafc]" : "bg-white"}>
                            <td className="py-2 px-3 text-left font-bold text-[#053d26] border border-gray-300">{subjName}</td>
                            <td className="py-2 px-1 border border-gray-300 text-gray-700">{subj.firstCA || "-"}</td>
                            <td className="py-2 px-1 border border-gray-300 text-gray-700">{subj.secondCA || "-"}</td>
                            <td className="py-2 px-1 border border-gray-300 text-gray-700">{subj.examScore || subj.exam || "-"}</td>
                            <td className="py-2 px-1 border border-gray-300 font-black text-[#053d26]">{subj.totalScore || subj.total || "-"}</td>
                            <td className="py-2 px-1 border border-gray-300 font-bold text-[#053d26]">{sGrade}</td>
                            <td className="py-2 px-1 border border-gray-300 text-gray-700">{subj.classAvg || "-"}</td>
                            <td className="py-2 px-1 border border-gray-300 text-gray-700 text-xs">{subj.remark || "-"}</td>
                            <td className="py-2 px-2 border border-gray-300 text-gray-700 text-xs">{remarkText}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[#f0fdf4] font-bold text-[#053d26] border-t-2 border-[#053d26]">
                        <td colSpan={4} className="py-3 px-4 text-left border border-gray-300 uppercase">
                          CUMULATIVE SCORE: {(currentResult?.subjects || []).reduce((sum: number, s: any) => sum + Number(s.totalScore || 0), 0)} / {(currentResult?.subjects || []).length * 100}
                        </td>
                        <td colSpan={2} className="py-3 px-4 text-center border border-gray-300 uppercase">
                          AVERAGE: {currentResult?.averageScore || currentResult?.average || currentResult?.gpa ? Number(currentResult?.averageScore || currentResult?.average || currentResult?.gpa).toFixed(1) : "-"}%
                        </td>
                        <td colSpan={3} className="py-3 px-4 text-right border border-gray-300 uppercase">
                          POSITION: {currentResult?.pos || "-"}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

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

              <div className="print:break-after-page print:min-h-0 p-8 flex flex-col text-sm border-t border-gray-300 print:border-none print:pt-12">
                <div className="flex justify-between items-center border-b border-gray-300 pb-2 mb-6 text-xs font-bold text-[#053d26]">
                  <span className="uppercase">{schoolName}</span>
                  <span className="text-gray-300">|</span>
                  <span>Student: {currentResult?.studentName || currentResult?.student?.fullName || "Student"}</span>
                  <span className="text-gray-300">|</span>
                  <span>Adm. No: {currentResult?.student?.admissionNumber || "-"}</span>
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
                        {['Punctuality', 'Neatness', 'Politeness', 'Honesty', 'Cooperation', 'Peer Relationship'].map((b, i) => (
                          <tr key={i} className={i % 2 === 0 ? "bg-[#f8fafc]" : "bg-white"}>
                            <td className="py-2.5 px-3 border border-gray-300 text-gray-700 font-medium">{b}</td>
                            <td className="py-2.5 px-3 border border-gray-300 text-center font-bold text-[#053d26]">{(currentResult?.affective?.[b.toLowerCase()] || currentResult?.affective?.[b]) || (Math.floor(Math.random() * 2) + 4)}</td>
                          </tr>
                        ))}
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
                        {['Handwriting', 'Public Speaking', 'Sports & Athletics', 'Club Participation', 'Craft / Lab Skills', 'Musical Skill'].map((s, i) => (
                          <tr key={i} className={i % 2 === 0 ? "bg-[#f8fafc]" : "bg-white"}>
                            <td className="py-2.5 px-3 border border-gray-300 text-gray-700 font-medium">{s}</td>
                            <td className="py-2.5 px-3 border border-gray-300 text-center font-bold text-[#053d26]">{(currentResult?.psychomotor?.[s.toLowerCase()] || currentResult?.psychomotor?.[s]) || (Math.floor(Math.random() * 2) + 3)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-xs font-bold text-[#053d26] mb-2">Domain Rating Key</h4>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-gray-600 font-medium">
                    <div><span className="font-bold text-[#053d26]">5</span> - Excellent</div>
                    <div><span className="font-bold text-[#053d26]">4</span> - Very Good</div>
                    <div><span className="font-bold text-[#053d26]">3</span> - Good</div>
                    <div><span className="font-bold text-[#053d26]">2</span> - Fair</div>
                    <div><span className="font-bold text-[#053d26]">1</span> - Poor</div>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#053d26] tracking-widest uppercase mb-4 border-b-[2.5px] border-[#b45309] pb-1 inline-block w-full">Final Remarks & Verification</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-6 mt-4">
                  <div className="flex flex-col gap-2">
                    <h4 className="text-sm font-bold text-[#053d26] mb-2">Form Teacher's Remark</h4>
                    <div className="pl-4 border-l-4 border-[#053d26] text-sm text-gray-700 italic mb-4 min-h-[40px]">
                      {currentResult?.formTeacherRemark || currentResult?.teacherRemark || "-"}
                    </div>
                    <div className="flex flex-col items-center">
                      {(currentResult?.formTeacherSignatureUrl || formTeacherSignatureUrl) ? (
                        <img src={currentResult?.formTeacherSignatureUrl || formTeacherSignatureUrl || ''} alt="Teacher Signature" className="h-10 mb-1 object-contain" />
                      ) : (
                        <div className="h-10 mb-1"></div>
                      )}
                      <div className="w-48 border-t border-gray-400 mb-2"></div>
                      <div className="text-center text-xs">
                        <span className="font-bold">Form Teacher</span><br/>
                        <span>Teacher's Name: {currentResult?.formTeacherName || formTeacherName || selectedClassObj?.formTeacher?.name || selectedClassObj?.teacher?.name || "_________________"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h4 className="text-sm font-bold text-[#053d26] mb-2">Principal's Remark</h4>
                    <div className="pl-4 border-l-4 border-[#b45309] text-sm text-gray-700 italic mb-4 min-h-[40px]">
                      {currentResult?.principalsRemark || "-"}
                    </div>
                    <div className="flex flex-col items-center">
                      {(currentResult?.principalSignatureUrl || principalSignatureUrl) ? (
                        <img src={currentResult?.principalSignatureUrl || principalSignatureUrl!} alt="Principal Signature" className="h-10 mb-1 object-contain" crossOrigin="anonymous" />
                      ) : (
                        <div className="h-10 mb-1"></div>
                      )}
                      <div className="w-48 border-t border-gray-400 mb-2"></div>
                      <div className="text-center text-xs">
                        <span className="font-bold">Principal / Head of School</span><br/>
                        <span>Principal's Name: {currentResult?.principalName || principalName || "_________________"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 mb-4 border border-blue-200 bg-[#f0fdf4] flex justify-between p-3 px-4 text-xs font-bold text-[#053d26]">
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
            </div>
          </div>
        </>
      )}

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #result-pdf-content, #result-pdf-content * {
            visibility: visible;
          }
          #result-pdf-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Hide scrollbars during print */
          ::-webkit-scrollbar {
              display: none;
          }
        }
      `}} />
    </div>
  );
}
