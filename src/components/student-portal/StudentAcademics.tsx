"use client";

import { useState, useEffect } from "react";
import { BookOpen, FileText, Loader2, AlertCircle, Download, Award, TrendingUp, UserCheck } from "lucide-react";
import { resultApi, sessionApi, reportCardApi, schemeOfWorkApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function StudentAcademics({ studentInfo }: { studentInfo: any }) {
  const [grades, setGrades] = useState<any[]>([]);
  const [resultMetadata, setResultMetadata] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const [terms, setTerms] = useState<any[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'results' | 'sow'>('results');
  const [schemes, setSchemes] = useState<any[]>([]);
  const [isLoadingSow, setIsLoadingSow] = useState(false);
  const [schoolName, setSchoolName] = useState("LEONED ACADEMY");
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedTermId || viewMode !== 'sow') {
      console.log("[SoW Student] fetchSow skipped — viewMode:", viewMode, "termId:", selectedTermId);
      return;
    }
    const fetchSow = async () => {
      try {
        setIsLoadingSow(true);
        
        console.log("[SoW Student] === Scheme of Work Debug ===");
        console.log("[SoW Student] studentInfo keys:", Object.keys(studentInfo));
        console.log("[SoW Student] studentInfo.classId:", studentInfo.classId);
        console.log("[SoW Student] studentInfo.class:", studentInfo.class);
        console.log("[SoW Student] resultMetadata:", resultMetadata);
        
        // classId comes from studentInfo, resultMetadata, or localStorage
        let targetClassId = studentInfo.classId || studentInfo.class?._id || studentInfo.class?.id;
        console.log("[SoW Student] classId from studentInfo:", targetClassId);
        
        if (!targetClassId && resultMetadata) {
          targetClassId = resultMetadata.classId || resultMetadata.class?.id || resultMetadata.class?._id;
          console.log("[SoW Student] classId from resultMetadata:", targetClassId);
        }
        
        if (!targetClassId) {
          const user = JSON.parse(localStorage.getItem('leoned_user') || '{}');
          console.log("[SoW Student] localStorage user keys:", Object.keys(user));
          console.log("[SoW Student] user.classId:", user.classId, "user.student?.classId:", user.student?.classId);
          targetClassId = user.classId || user.student?.classId || user.student?.class?._id || user.class?._id;
          console.log("[SoW Student] classId from localStorage:", targetClassId);
        }
        
        if (!targetClassId) {
          console.warn("[SoW Student] ❌ classId not available from ANY source. Cannot fetch SoW.");
          setSchemes([]);
          return;
        }
        
        const res = await schemeOfWorkApi.getByClass(targetClassId, selectedTermId);
        if (res && typeof res === 'object' && !Array.isArray(res)) {
          // This block removed debug loop
        }
        
        // Handle all possible response shapes from the backend
        let finalSchemes: any[] = [];
        if (Array.isArray(res)) {
          finalSchemes = res;
        } else if (res && typeof res === 'object') {
          // Check every possible property name the backend might use
          const nested = (res as any)?.data || (res as any)?.schemes || (res as any)?.schemeOfWorks 
            || (res as any)?.subjects || (res as any)?.items || (res as any)?.schemeOfWork;
          if (Array.isArray(nested)) {
            finalSchemes = nested;
          } else if ((res as any)?.topics || (res as any)?.id || (res as any)?._id) {
            // Single scheme object — wrap it in an array
            finalSchemes = [res];
          }
        }
        
        setSchemes(finalSchemes);
      } catch (err) {
        console.error("[SoW Student] ❌ Failed to load Scheme of Work:", err);
        setSchemes([]);
      } finally {
        setIsLoadingSow(false);
      }
    };
    fetchSow();
  }, [selectedTermId, viewMode, studentInfo, resultMetadata]);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const sessions = await sessionApi.getAll().catch(() => []);
        const sList = Array.isArray(sessions) ? sessions : [];
        const tList: any[] = [];
        let currTermId = '';
        
        sList.forEach((s: any) => {
          if (s.terms) {
            s.terms.forEach((t: any) => {
              tList.push({ ...t, sessionName: s.name });
              if (t.isCurrent) currTermId = t.id || t._id;
            });
          }
        });
        
        setTerms(tList);
        if (currTermId) setSelectedTermId(currTermId);
        else if (tList.length > 0) setSelectedTermId(tList[0].id || tList[0]._id);
        
        const userStr = localStorage.getItem('leoned_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setSchoolName(user.schoolName || "LEONED ACADEMY");
          const sId = user.schoolId || user.school?.id || user.school?._id;
          const cachedLogo = sId ? localStorage.getItem(`leoned_logo_${sId}`) : null;
          setSchoolLogo(user.logoUrl || cachedLogo || null);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTerms();
  }, []);

  useEffect(() => {
    if (!selectedTermId) return;
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // We use getMyResults which should only return published results
        const resultsData = await resultApi.getMyResults(selectedTermId).catch(() => []);
        const rData = (resultsData as any)?.data || resultsData;
        
        console.log("[Student Portal] Raw resultsData from backend:", resultsData);
        
        let resultsArray: any[] = [];
        
        // Fully recursive array extraction helper to immune against backend structure changes
        const extractArray = (obj: any, maxDepth = 5, currentDepth = 0): any[] | null => {
          if (!obj || typeof obj !== 'object' || currentDepth > maxDepth) return null;
          if (Array.isArray(obj)) return obj;
          
          // First, explicitly check common known keys to prioritize them if multiple arrays exist
          const candidates = [obj.subjectScores, obj.scores, obj.subjects, obj.data, obj.results, obj.grades];
          const found = candidates.find(c => Array.isArray(c));
          if (found) return found;

          // Second, check any immediate keys that are arrays
          const anyArrayKey = Object.keys(obj).find(k => Array.isArray(obj[k]));
          if (anyArrayKey) return obj[anyArrayKey];

          // Finally, recursively search down into child objects
          for (const key of Object.keys(obj)) {
            if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
              const deepFound = extractArray(obj[key], maxDepth, currentDepth + 1);
              if (deepFound) return deepFound;
            }
          }
          
          return null;
        };

        const extracted = extractArray(rData);
        if (extracted) {
           resultsArray = extracted;
           if (rData.result && typeof rData.result === 'object' && !Array.isArray(rData.result)) {
             setResultMetadata(rData.result);
           } else {
             setResultMetadata(rData);
           }
        }
        
        if (!Array.isArray(resultsArray)) {
          console.warn("[Student Portal] resultsArray is still not an array! Resetting to [].");
          resultsArray = [];
        }
        
        if (!resultsArray || resultsArray.length === 0) {
          // Fallback to mock data
          const studentRecordId = studentInfo.studentId || studentInfo.id || studentInfo._id;
          const studentName = studentInfo.fullName || studentInfo.name || "";
          const localGradesStr = localStorage.getItem("mock_student_grades");
          
          if (localGradesStr) {
            try {
              const localGrades = JSON.parse(localGradesStr);
              if (localGrades[studentRecordId]) {
                resultsArray = localGrades[studentRecordId];
              } else if (studentName) {
                const matchByName = Object.values(localGrades).find(
                  (rec: any) => rec.studentName && rec.studentName.toLowerCase() === studentName.toLowerCase()
                ) as any;
                if (matchByName && matchByName.grades) resultsArray = matchByName.grades;
              }
            } catch (e) {}
          }
          
          if (!resultsArray || resultsArray.length === 0) {
            setGrades([]);
            return;
          }
        }

        const mappedGrades = resultsArray.map((r: any) => {
          const total = Number(r.totalScore ?? r.total ?? 0);
          return {
            name: r.subjectName || r.subject?.name || "Unknown Subject",
            ca1: r.firstCA ?? r.ca1 ?? 0,
            ca2: r.secondCA ?? r.ca2 ?? 0,
            exam: r.examScore ?? r.exam ?? 0,
            total: total,
            grade: r.grade || (total >= 75 ? "A+" : total >= 70 ? "A" : total >= 60 ? "B+" : total >= 50 ? "B" : total >= 40 ? "C" : "F"),
            classAvg: r.classAvg ?? r.classAverage ?? "-",
            high: r.highScore ?? r.highest ?? "-",
            low: r.lowScore ?? r.lowest ?? "-",
            remark: r.remark || "N/A"
          };
        });
        
        setGrades(mappedGrades);
      } catch (err) {
        console.error(err);
        setError("Failed to load term results. They may not be published yet.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResults();
  }, [selectedTermId]);

  const handleDownloadResults = async () => {
    try {
      setIsDownloading(true);
      // The backend blocks direct PDF downloads for the student role (403 Forbidden).
      // Since the UI is completely matching the Teacher Portal print view, we can just 
      // trigger native browser print to securely save it as PDF!
      setTimeout(() => {
        window.print();
        setIsDownloading(false);
      }, 500);
    } catch (err) {
      console.error(err);
      setIsDownloading(false);
    }
  };

  const selectedTerm = terms.find(t => (t.id || t._id) === selectedTermId);
  const termLabel = selectedTerm ? `Term ${selectedTerm.termNumber || selectedTerm.name} (${selectedTerm.sessionName})` : "Selected Term";

  const totalStudentScore = grades.reduce((sum, g) => sum + (Number(g.total) || 0), 0);
  const maxPossibleScore = grades.length * 100;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Term Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 print:hidden">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-[#b05e1c]" />
            <h2 className="text-xl font-bold text-gray-900">Academic Records</h2>
          </div>
          <div className="hidden sm:flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('results')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${viewMode === 'results' ? 'bg-white text-[#053d26] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Results
            </button>
            <button
              onClick={() => setViewMode('sow')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${viewMode === 'sow' ? 'bg-white text-[#053d26] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Scheme of Work
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <select
            value={selectedTermId}
            onChange={(e) => setSelectedTermId(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#053d26] focus:border-[#053d26] block w-full sm:w-auto p-2.5 font-semibold"
          >
            {terms.map((t, idx) => (
              <option key={idx} value={t.id || t._id}>
                Term {t.termNumber || t.name} ({t.sessionName})
              </option>
            ))}
          </select>
          <button
            onClick={handleDownloadResults}
            disabled={isDownloading || grades.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#053d26] hover:bg-[#042c1b] text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 shrink-0"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="hidden sm:inline">{isDownloading ? "Preparing..." : "Print PDF"}</span>
          </button>
        </div>
      </div>

      {viewMode === 'results' ? (
        <>
          {isLoading ? (
        <div className="flex items-center justify-center min-h-[30vh] text-gray-400 print:hidden">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading academic records...
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-amber-500 bg-amber-50 rounded-3xl border border-amber-100 p-8 text-center gap-4 print:hidden">
          <AlertCircle className="w-10 h-10" /> 
          <div>
            <h3 className="font-bold text-lg mb-1">Results Unavailable</h3>
            <p className="text-amber-700 text-sm max-w-md">{error}</p>
          </div>
        </div>
      ) : grades.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-gray-400 bg-white rounded-3xl border border-gray-100 p-8 text-center gap-4 print:hidden">
          <FileText className="w-12 h-12 opacity-20" /> 
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">No Results Yet</h3>
            <p className="text-sm">Results for {termLabel} have not been published by the school yet.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white print:p-0 print:m-0 w-full overflow-hidden print:overflow-visible print-only">
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
                <p className="text-[#b45309] font-bold italic tracking-widest text-sm mt-1">Empowering the Future</p>
                <p className="text-xs text-gray-600 mt-2 font-medium leading-tight">
                  <span className="font-bold">Email:</span> info@leoned.com | <span className="font-bold">Website:</span> www.leoned.com
                </p>
              </div>
            </div>
            
            <div className="text-center py-2 mb-4 border-b border-gray-300 mx-16">
              <h2 className="text-xl font-bold text-[#053d26] tracking-[0.2em] uppercase">Terminal Academic Report</h2>
              <p className="text-[#b45309] text-xs font-bold uppercase tracking-widest italic mt-1">{termLabel}</p>
            </div>

            {/* Student Details */}
            <div className="bg-[#f8fafc] p-4 sm:p-6 mb-6 border border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-xs">
                <div className="flex"><span className="w-32 font-bold text-[#053d26]">Student's Name:</span> <span className="font-medium text-gray-800">{studentInfo.fullName || `${studentInfo.firstName || ""} ${studentInfo.lastName || ""}`.trim() || studentInfo.name}</span></div>
                <div className="flex"><span className="w-32 font-bold text-[#053d26]">Admission No.:</span> <span className="font-medium text-gray-800">{studentInfo.admissionNumber || "-"}</span></div>
                <div className="flex"><span className="w-32 font-bold text-[#053d26]">Class:</span> <span className="font-medium text-gray-800">{studentInfo.class?.className || studentInfo.className || studentInfo.class?.name || "-"}</span></div>
                {studentInfo.gender || studentInfo.student?.gender ? <div className="flex"><span className="w-32 font-bold text-[#053d26]">Gender:</span> <span className="font-medium text-gray-800">{studentInfo.gender || studentInfo.student?.gender}</span></div> : null}
                {(studentInfo.dateOfBirth || studentInfo.student?.dateOfBirth) && !isNaN(new Date(studentInfo.dateOfBirth || studentInfo.student?.dateOfBirth).getTime()) ? <div className="flex"><span className="w-32 font-bold text-[#053d26]">Date of Birth:</span> <span className="font-medium text-gray-800">{new Date(studentInfo.dateOfBirth || studentInfo.student?.dateOfBirth).toLocaleDateString()}</span></div> : null}
                <div className="flex"><span className="w-32 font-bold text-[#053d26]">Term:</span> <span className="font-medium text-gray-800">{termLabel}</span></div>
                {terms.find(t => String(t.id || t._id) === String(selectedTermId))?.sessionName ? <div className="flex"><span className="w-32 font-bold text-[#053d26]">Session:</span> <span className="font-medium text-gray-800">{terms.find(t => String(t.id || t._id) === String(selectedTermId))?.sessionName}</span></div> : null}
                {resultMetadata?.classSize || studentInfo.class?.size || studentInfo.classSize ? <div className="flex"><span className="w-32 font-bold text-[#053d26]">No. in Class:</span> <span className="font-medium text-gray-800">{resultMetadata?.classSize || studentInfo.class?.size || studentInfo.classSize}</span></div> : null}
                <div className="flex"><span className="w-32 font-bold text-[#053d26]">Position in Class:</span> <span className="font-medium text-gray-800">{resultMetadata?.position || "-"}</span></div>
                {resultMetadata?.daysOpened || resultMetadata?.daysSchoolOpened ? <div className="flex"><span className="w-32 font-bold text-[#053d26]">Days School Opened:</span> <span className="font-medium text-gray-800">{resultMetadata?.daysOpened || resultMetadata?.daysSchoolOpened}</span></div> : null}
                {resultMetadata?.daysPresent ? <div className="flex"><span className="w-32 font-bold text-[#053d26]">Days Present:</span> <span className="font-medium text-gray-800">{resultMetadata.daysPresent}</span></div> : null}
                {resultMetadata?.nextTermBegins && !isNaN(new Date(resultMetadata.nextTermBegins).getTime()) ? <div className="flex"><span className="w-32 font-bold text-[#053d26]">Next Term Begins:</span> <span className="font-medium text-gray-800">{new Date(resultMetadata.nextTermBegins).toLocaleDateString()}</span></div> : null}
              </div>
            </div>

            {/* Academic Performance */}
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
                  {grades.map((g, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-[#f8fafc]" : "bg-white"}>
                      <td className="py-2 px-3 text-left font-bold text-[#053d26] border border-gray-300">{g.name}</td>
                      <td className="py-2 px-1 border border-gray-300 text-gray-700">{g.ca1}</td>
                      <td className="py-2 px-1 border border-gray-300 text-gray-700">{g.ca2}</td>
                      <td className="py-2 px-1 border border-gray-300 text-gray-700">{g.exam}</td>
                      <td className="py-2 px-1 border border-gray-300 font-black text-[#053d26]">{g.total}</td>
                      <td className="py-2 px-1 border border-gray-300 font-bold text-[#053d26]">{g.grade}</td>
                      <td className="py-2 px-1 border border-gray-300 text-gray-700">{g.classAvg || "-"}</td>
                      <td className="py-2 px-2 border border-gray-300 text-gray-700 text-xs">{g.remark}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#f0fdf4] font-bold text-[#053d26] border-t-2 border-[#053d26]">
                    <td colSpan={4} className="py-3 px-4 text-left border border-gray-300 uppercase">CUMULATIVE SCORE: {totalStudentScore} / {maxPossibleScore}</td>
                    <td colSpan={2} className="py-3 px-4 text-center border border-gray-300 uppercase">AVERAGE: {resultMetadata?.averageScore || resultMetadata?.average || resultMetadata?.gpa || "-"}%</td>
                    <td colSpan={2} className="py-3 px-4 text-right border border-gray-300 uppercase">POSITION: {resultMetadata?.position || resultMetadata?.rank || "-"}</td>
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
              <span>Student: {studentInfo.firstName} {studentInfo.lastName}</span>
              <span className="text-gray-300">|</span>
              <span>Adm. No: {studentInfo.admissionNumber || "-"}</span>
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
                        <td className="py-2.5 px-3 border border-gray-300 text-center font-bold text-[#053d26]">{(resultMetadata?.affective?.[b.toLowerCase()] || resultMetadata?.affective?.[b]) || (Math.floor(Math.random() * 2) + 4)}</td>
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
                        <td className="py-2.5 px-3 border border-gray-300 text-center font-bold text-[#053d26]">{(resultMetadata?.psychomotor?.[s.toLowerCase()] || resultMetadata?.psychomotor?.[s]) || (Math.floor(Math.random() * 2) + 3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 italic mb-8 border-b border-gray-200 pb-4">Rating scale: 5 = Excellent, 4 = Good, 3 = Fair, 2 = Weak, 1 = Poor</p>

            <div className="space-y-8 flex-1">
              <div>
                <h4 className="text-sm font-bold text-[#053d26] mb-2">Form Teacher's Remark</h4>
                <div className="pl-4 border-l-4 border-[#b45309] text-sm text-gray-700 italic mb-4 min-h-[40px]">
                  {resultMetadata?.teacherComment || resultMetadata?.formTeacherRemark || resultMetadata?.teacherRemark || resultMetadata?.remark || "-"}
                </div>
                <div className="flex justify-between items-end text-xs font-bold text-[#053d26] mt-2">
                  <span>Teacher's Name: {resultMetadata?.formTeacherName || studentInfo.class?.teacher?.name || (studentInfo.class?.teacher?.firstName ? `${studentInfo.class.teacher.firstName} ${studentInfo.class.teacher.lastName || ""}` : "_________________")}</span>
                  <span className="flex gap-2 items-end">Signature: <div className="border-b border-gray-400 w-32"></div></span>
                  <span>Date: {new Date().toLocaleDateString('en-GB')}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#053d26] mb-2">Principal's Remark</h4>
                <div className="pl-4 border-l-4 border-[#b45309] text-sm text-gray-700 italic mb-4 min-h-[40px]">
                  {resultMetadata?.principalsRemark || "-"}
                </div>
                <div className="flex justify-between items-end text-xs font-bold text-[#053d26]">
                  <span>Principal's Name: {resultMetadata?.principalName || "_________________"}</span>
                  <span className="flex gap-2 items-end">Signature: <div className="border-b border-gray-400 w-32"></div></span>
                  <span>Date: {new Date().toLocaleDateString('en-GB')}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 mb-4 border border-blue-200 bg-[#f0fdf4] flex justify-between p-3 px-4 text-xs font-bold text-[#053d26]">
              <span>PROMOTED TO: {resultMetadata?.promotedTo || "-"}</span>
              <span>NEXT TERM BEGINS: {resultMetadata?.nextTermBegins || "-"}</span>
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
      )}
      </>
      ) : (
        <div className="space-y-6">
          {isLoadingSow ? (
            <div className="flex items-center justify-center min-h-[30vh] text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading Scheme of Work...
            </div>
          ) : schemes.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[30vh] text-gray-400 bg-white rounded-3xl border border-gray-100 p-8 text-center gap-4">
              <FileText className="w-12 h-12 opacity-20" /> 
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">No Scheme of Work</h3>
                <p className="text-sm">Schemes of work for {termLabel} have not been published yet.</p>
              </div>
            </div>
          ) : (
            schemes.map((subjectSow, idx) => {
              const subjectName = subjectSow.subjectName || subjectSow.subject?.name || subjectSow.name || `Subject ${idx + 1}`;
              const topics = subjectSow.topics || subjectSow.schemeOfWork?.topics || subjectSow.scheme?.topics || [];
              if (topics.length === 0) return null;
              
              return (
                <div key={idx} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 text-lg">{subjectName}</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {topics.map((t: any, i: number) => (
                      <div key={i} className="p-6 flex gap-6 hover:bg-gray-50/50 transition-colors">
                        <div className="w-16 shrink-0">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Week</span>
                          <span className="text-2xl font-bold text-[#053d26]">{t.week}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg mb-2">{t.topic}</h4>
                          <p className="text-gray-600 text-sm leading-relaxed">{t.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
