"use client";

import { useState, useEffect } from "react";
import { BookOpen, FileText, Loader2, AlertCircle, Download, Award, TrendingUp } from "lucide-react";
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
        
        let resultsArray: any[] = [];
        if (Array.isArray(rData)) {
          resultsArray = rData;
        } else if (rData && typeof rData === 'object') {
          resultsArray = rData.scores || rData.data || rData.items || [];
          setResultMetadata(rData);
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
          const total = Number(r.totalScore || 0);
          return {
            name: r.subjectName || r.subject?.name || "Unknown Subject",
            ca1: r.firstCA || 0,
            ca2: r.secondCA || 0,
            exam: r.examScore || 0,
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
      const studentRecordId = studentInfo.studentId || studentInfo.id || studentInfo._id;
      // Depending on API, it might be reportCardApi.downloadPdf(studentRecordId, selectedTermId)
      // or a specific endpoint for 'my'
      const blob = await reportCardApi.downloadPdf(studentRecordId, selectedTermId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Report_Card_${studentInfo.fullName || studentInfo.name || 'Student'}_Term_${selectedTermId}.pdf`.replace(/\s+/g, "_");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Results downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download results. The report card may not be generated yet.");
    } finally {
      setIsDownloading(false);
    }
  };

  const selectedTerm = terms.find(t => (t.id || t._id) === selectedTermId);
  const termLabel = selectedTerm ? `Term ${selectedTerm.termNumber || selectedTerm.name} (${selectedTerm.sessionName})` : "Selected Term";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Term Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
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
            <span className="hidden sm:inline">Download PDF</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[30vh] text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading academic records...
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-amber-500 bg-amber-50 rounded-3xl border border-amber-100 p-8 text-center gap-4">
          <AlertCircle className="w-10 h-10" /> 
          <div>
            <h3 className="font-bold text-lg mb-1">Results Unavailable</h3>
            <p className="text-amber-700 text-sm max-w-md">{error}</p>
          </div>
        </div>
      ) : grades.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-gray-400 bg-white rounded-3xl border border-gray-100 p-8 text-center gap-4">
          <FileText className="w-12 h-12 opacity-20" /> 
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">No Results Yet</h3>
            <p className="text-sm">Results for {termLabel} have not been published by the school yet.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{termLabel} Transcript</h3>
              <p className="text-xs text-gray-500">Official academic performance record.</p>
            </div>
            {resultMetadata && (
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">GPA</p>
                  <p className="text-xl font-extrabold text-[#053d26]">{resultMetadata.gpa || "--"}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Rank</p>
                  <p className="text-xl font-extrabold text-[#053d26]">{resultMetadata.rank || "--"}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
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
      )}
    </div>
  );
}
