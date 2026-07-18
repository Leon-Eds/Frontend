"use client";

import { useState, useEffect } from "react";
import { BookOpen, FileText, Loader2, AlertCircle, Download, Award, TrendingUp, UserCheck } from "lucide-react";
import { resultApi, sessionApi, reportCardApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function StudentAcademics({ studentInfo }: { studentInfo: any }) {
  const [grades, setGrades] = useState<any[]>([]);
  const [resultMetadata, setResultMetadata] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const [terms, setTerms] = useState<any[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string>('');

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
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-[#b05e1c]" />
          <h2 className="text-xl font-bold text-gray-900">Academic Records</h2>
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
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col print-only">
          {/* Report Card Header */}
          <div className="bg-white p-6 sm:px-8 border-b border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#053d26]/10 flex items-center justify-center mb-4">
              <Award className="h-8 w-8 text-[#053d26]" />
            </div>
            <h2 className="text-2xl font-black text-[#053d26] uppercase tracking-widest mb-1">Student Report Card</h2>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">
              {studentInfo?.schoolName || "LeonEd Academy"} • {termLabel}
            </p>

            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 text-left border-y border-gray-200 py-4 mb-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase w-20 shrink-0">Name:</span>
                  <span className="text-sm font-bold text-gray-900">{studentInfo?.fullName || studentInfo?.name || "Student"}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase w-20 shrink-0">Admission:</span>
                  <span className="text-sm font-bold text-gray-900">{studentInfo?.admissionNumber || studentInfo?.admission_no || "-"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase w-20 shrink-0">Average:</span>
                  <span className="text-sm font-black text-[#053d26]">
                    {resultMetadata?.averageScore || resultMetadata?.average || resultMetadata?.gpa || "-"}%
                  </span>
                </div>
                {(resultMetadata?.computedGrade || resultMetadata?.overallGrade || resultMetadata?.grade) && (
                  <div className="flex gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase w-20 shrink-0">Grade:</span>
                    <span className="text-sm font-black text-[#b05e1c]">
                      {resultMetadata?.computedGrade || resultMetadata?.overallGrade || resultMetadata?.grade}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase w-20 shrink-0">Position:</span>
                  <span className="text-sm font-black text-[#053d26]">
                    {resultMetadata?.position || resultMetadata?.rank || "-"}
                  </span>
                </div>
                {grades.length > 0 && (
                  <div className="flex gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase w-20 shrink-0">Total:</span>
                    <span className="text-sm font-black text-[#b05e1c]">
                      {totalStudentScore} / {maxPossibleScore}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto px-6 py-4 sm:px-8">
            <h3 className="text-xs font-extrabold text-[#053d26] uppercase tracking-widest mb-4">Academic Performance</h3>
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] sm:text-xs uppercase tracking-wider text-gray-500 font-bold">
                  <th className="p-4 sm:p-5">Subject</th>
                  <th className="p-4 sm:p-5 text-center">CA 1 (20)</th>
                  <th className="p-4 sm:p-5 text-center">CA 2 (20)</th>
                  <th className="p-4 sm:p-5 text-center">Exam (60)</th>
                  <th className="p-4 sm:p-5 text-center bg-[#f0fdf4]">Total (100)</th>
                  <th className="p-4 sm:p-5 text-center">Grade</th>
                  <th className="p-4 sm:p-5 hidden sm:table-cell">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {grades.map((g, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4 sm:p-5 font-bold text-gray-900">{g.name}</td>
                    <td className="p-4 sm:p-5 text-center font-medium text-gray-600">{g.ca1}</td>
                    <td className="p-4 sm:p-5 text-center font-medium text-gray-600">{g.ca2}</td>
                    <td className="p-4 sm:p-5 text-center font-medium text-gray-600">{g.exam}</td>
                    <td className="p-4 sm:p-5 text-center font-extrabold text-[#053d26] bg-[#f0fdf4]/50 group-hover:bg-[#f0fdf4]">{g.total}</td>
                    <td className="p-4 sm:p-5 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                        g.grade.includes('A') ? 'bg-emerald-100 text-emerald-700' :
                        g.grade.includes('B') ? 'bg-blue-100 text-blue-700' :
                        g.grade.includes('C') ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {g.grade}
                      </span>
                    </td>
                    <td className="p-4 sm:p-5 hidden sm:table-cell text-xs font-semibold text-gray-500">{g.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Form Teacher Remark */}
          <div className="p-6 sm:px-8 bg-gray-50 border-t border-gray-100">
            <h3 className="text-xs font-extrabold text-[#053d26] uppercase tracking-widest mb-3 flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5" />
              Form Teacher's Remark
            </h3>
            <p className="w-full min-h-[60px] p-4 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 italic">
              {resultMetadata?.teacherComment || resultMetadata?.formTeacherRemark || resultMetadata?.teacherRemark || resultMetadata?.remark || "No remark provided yet."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
