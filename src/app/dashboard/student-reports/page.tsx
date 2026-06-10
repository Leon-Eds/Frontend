"use client";

import { useState, useEffect } from "react";
import { Share2, Download, Award, Calendar, CheckCircle2, TrendingUp, BarChart2, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { reportCardApi, sessionApi, studentApi } from "@/lib/api";

interface SubjectScore {
  name: string;
  ca: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
  isExcellent?: boolean;
}

export default function StudentDetailedReport() {
  const [subjects, setSubjects] = useState<SubjectScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [realStudentId, setRealStudentId] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [termAverage, setTermAverage] = useState(0);
  const [classPosition, setClassPosition] = useState("");
  const [totalStudents, setTotalStudents] = useState(0);
  const [principalName, setPrincipalName] = useState("");
  const [principalComment, setPrincipalComment] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [currentTermId, setCurrentTermId] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const loadReport = async () => {
      try {
        // Get current user info from localStorage
        const userStr = localStorage.getItem("leoned_user");
        if (!userStr) {
          setError("Please log in to view your report.");
          setIsLoading(false);
          return;
        }

        const user = JSON.parse(userStr);

        // Get all students to find the current one (for student role) or first student (for admin preview)
        const students = await studentApi.getAll();
        const allStudents = Array.isArray(students) ? students : [];

        // Get sessions to find the current term
        const sessions = await sessionApi.getAll();
        const currentSession = (Array.isArray(sessions) ? sessions : []).find((s: any) => s.isCurrent);
        if (!currentSession) {
          setError("No active academic session found.");
          setIsLoading(false);
          return;
        }
        setSessionName(currentSession.name || "");

        const currentTerm = currentSession.terms?.find((t: any) => t.isCurrent);
        if (!currentTerm) {
          setError("No active term found in the current session.");
          setIsLoading(false);
          return;
        }
        setCurrentTermId(currentTerm.id);

        // Select student - either the logged-in student or the first student for admin preview
        let targetStudent: any = null;
        if (user.role === "Student" || user.role === "Parent" || user.role === "Guardian") {
          targetStudent = allStudents.find((s: any) => s.id === user.id) || allStudents[0];
        } else {
          targetStudent = allStudents[0]; // Admin preview mode
        }

        if (!targetStudent) {
          setError("No students found to generate a report for.");
          setIsLoading(false);
          return;
        }

        setStudentName(targetStudent.fullName || "Student");
        setRealStudentId(targetStudent.id);
        setStudentId(targetStudent.admissionNumber || targetStudent.id);
        setStudentClass(targetStudent.className || "Unassigned");
        setTotalStudents(allStudents.length);

        // Fetch report card data
        const reportData: any = await reportCardApi.getData(targetStudent.id, currentTerm.id);

        // Map report card data to SubjectScore interface
        const subjectScores: SubjectScore[] = [];
        if (reportData && Array.isArray(reportData.scores || reportData.subjects || reportData.results)) {
          const items = reportData.scores || reportData.subjects || reportData.results || [];
          items.forEach((item: any) => {
            const ca = Number(item.ca || item.firstCA || 0) + Number(item.secondCA || 0);
            const exam = Number(item.exam || 0);
            const total = Number(item.total || ca + exam);
            const grade = item.grade || (total >= 75 ? "A+" : total >= 70 ? "A" : total >= 60 ? "B+" : total >= 50 ? "B" : total >= 40 ? "C" : "F");
            subjectScores.push({
              name: item.subjectName || item.name || "Unknown Subject",
              ca: ca || Number(item.ca || 0),
              exam,
              total,
              grade,
              remark: item.remark || item.teacherRemark || "",
              isExcellent: total >= 75,
            });
          });
        }

        setSubjects(subjectScores);

        // Extract aggregate data
        if (subjectScores.length > 0) {
          const avg = subjectScores.reduce((sum, s) => sum + s.total, 0) / subjectScores.length;
          setTermAverage(Math.round(avg * 10) / 10);
        }

        setClassPosition(reportData?.position || reportData?.classPosition || "--");
        setPrincipalName(reportData?.principalName || reportData?.headTeacher || "");
        setPrincipalComment(reportData?.principalComment || reportData?.headTeacherComment || reportData?.adminComment || "");

      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load report card data";
        console.error("[Student Reports]", err);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    loadReport();
  }, []);

  const handleDownloadPdf = async () => {
    if (!realStudentId || !currentTermId) {
      alert("Missing information to download report.");
      return;
    }
    
    setIsDownloading(true);
    try {
      const blob = await reportCardApi.downloadPdf(realStudentId, currentTermId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Report_Card_${studentName.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to download PDF";
      console.error("[Student Reports] PDF Download Error:", err);
      alert(message);
    } finally {
      setIsDownloading(false);
    }
  };

  const initials = studentName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-gray-400 font-semibold text-sm">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading report card...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-red-600 font-semibold text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header and Download buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#b05e1c]">
            ACTIVE ACADEMIC TERM • {sessionName || "Current Session"}
          </p>
          <h1 className="text-3xl font-bold text-[#053d26]">Detailed Academic Report</h1>
          <p className="text-gray-500 leading-relaxed text-sm">
            Comprehensive performance analysis and subject breakdown for the current semester.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button className="flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all text-sm shadow-sm">
            <Share2 className="h-4 w-4" />
            Share Report
          </button>
          <button 
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#b05e1c] text-white font-bold hover:bg-[#965017] transition-all text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {isDownloading ? "Downloading..." : "Download PDF Report"}
          </button>
        </div>
      </div>

      {/* Profile & KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Profile Card */}
        <div className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center justify-between">
          <div className="relative w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden relative shadow-inner">
              <span className="text-2xl font-black text-[#053d26] absolute inset-0 flex items-center justify-center">{initials}</span>
            </div>
            <span className="absolute bottom-0 right-0 w-6 h-6 bg-[#b05e1c] rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-black">✓</span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{studentName}</h3>
            <p className="text-xs text-gray-400 font-semibold mt-1">Student ID: {studentId}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full border-t border-gray-100 pt-4 mt-4">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Grade Level</p>
              <p className="text-xs font-bold text-gray-700 mt-0.5">{studentClass}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Subjects</p>
              <p className="text-xs font-bold text-gray-700 mt-0.5">{subjects.length}</p>
            </div>
          </div>
        </div>

        {/* Term Average KPI */}
        <div className="rounded-3xl bg-[#053d26] p-6 shadow-sm text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-5 translate-x-4 -translate-y-4">
            <TrendingUp className="w-36 h-36" />
          </div>
          <div>
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-green-300" />
            </div>
            <p className="text-xs font-bold text-green-200 uppercase tracking-wider">Term Average</p>
            <p className="text-4xl font-black mt-2">{termAverage}%</p>
          </div>
          <p className="text-[10px] text-green-200 font-bold uppercase tracking-wider pt-4 border-t border-white/10 mt-4">
            Across {subjects.length} subjects
          </p>
        </div>

        {/* Class Position KPI */}
        <div className="rounded-3xl bg-[#b05e1c]/10 p-6 shadow-sm border border-[#b05e1c]/5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-5 translate-x-4 -translate-y-4">
            <BarChart2 className="w-36 h-36" />
          </div>
          <div>
            <div className="w-10 h-10 rounded-2xl bg-[#b05e1c]/10 flex items-center justify-center mb-4">
              <BarChart2 className="w-5 h-5 text-[#b05e1c]" />
            </div>
            <p className="text-xs font-bold text-[#b05e1c] uppercase tracking-wider">Class Position</p>
            <p className="text-4xl font-black mt-2 text-[#b05e1c]">{classPosition} / {totalStudents}</p>
          </div>
          <p className="text-[10px] text-[#b05e1c] font-bold uppercase tracking-wider pt-4 border-t border-[#b05e1c]/10 mt-4">
            Overall Performance
          </p>
        </div>

        {/* Subjects Count KPI */}
        <div className="rounded-3xl bg-gray-100 p-6 shadow-sm border border-gray-200/5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-5 translate-x-4 -translate-y-4">
            <Calendar className="w-36 h-36" />
          </div>
          <div>
            <div className="w-10 h-10 rounded-2xl bg-white/50 border border-gray-200 flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5 text-gray-500" />
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Excellent Scores</p>
            <p className="text-4xl font-black mt-2 text-gray-900">{subjects.filter(s => s.isExcellent).length}</p>
          </div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider pt-4 border-t border-gray-200 mt-4">
            Subjects scoring 75%+
          </p>
        </div>
      </div>

      {/* Subject Performance Breakdown Section */}
      {subjects.length > 0 && (
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-6">
            <h2 className="text-xl font-bold text-gray-900">Subject Performance Details</h2>
            <div className="flex items-center gap-4 text-[10px] font-bold tracking-wider">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-gray-500">EXCELLENT</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                <span className="text-gray-500">NEEDS FOCUS</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-3">
                  <th className="pb-3 pr-4">Subject</th>
                  <th className="pb-3 px-4 text-center">CA (40)</th>
                  <th className="pb-3 px-4 text-center">Exam (60)</th>
                  <th className="pb-3 px-4 text-center">Total (100)</th>
                  <th className="pb-3 px-4 text-center">Grade</th>
                  <th className="pb-3 pl-4">Teacher&apos;s Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subjects.map((sub, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 pr-4 font-bold text-gray-900 text-sm flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                        sub.isExcellent ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {sub.name[0]}
                      </div>
                      {sub.name}
                    </td>
                    <td className="py-4 px-4 text-center text-sm font-semibold text-gray-700">{sub.ca}</td>
                    <td className="py-4 px-4 text-center text-sm font-semibold text-gray-700">{sub.exam}</td>
                    <td className="py-4 px-4 text-center text-sm font-extrabold text-gray-900">{sub.total}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black ${
                        sub.isExcellent ? "bg-green-100 text-[#053d26]" : "bg-gray-100 text-gray-600"
                      }`}>
                        {sub.grade}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-xs font-semibold text-gray-500 italic">
                      {sub.remark ? `"${sub.remark}"` : "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subjects.length === 0 && !isLoading && (
        <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-400 font-semibold text-sm">No subject scores available for this term yet.</p>
        </div>
      )}

      {/* Academic Insights */}
      {subjects.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Performance Summary</h2>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Subject-by-subject breakdown</p>
              </div>
            </div>

            <div className="h-48 flex items-end justify-between gap-2 pt-4 px-2 border-b border-gray-100 relative">
              {subjects.map((sub, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center gap-1 h-36">
                    <div
                      className={`w-5 sm:w-8 rounded-t-lg ${sub.isExcellent ? "bg-[#053d26]" : "bg-gray-200"}`}
                      style={{ height: `${Math.min(100, sub.total)}%` }}
                    />
                  </div>
                  <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider text-center leading-tight">
                    {sub.name.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#053d26] text-white rounded-[2rem] p-6 sm:p-8 border border-[#042c1b] shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-green-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Academic Insights
              </h3>
              <div className="space-y-3 text-xs leading-relaxed text-green-100/90 font-medium">
                <div className="flex gap-2">
                  <span className="text-green-300">📈</span>
                  <p>{studentName} achieved a term average of {termAverage}% across {subjects.length} subjects.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-green-300">★</span>
                  <p>{subjects.filter(s => s.isExcellent).length} subject{subjects.filter(s => s.isExcellent).length !== 1 ? "s" : ""} scored in the excellent range (75%+).</p>
                </div>
              </div>
            </div>

            {principalComment && (
              <div className="bg-gray-100 rounded-[2rem] p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Teacher Recommendations</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                  {principalComment}
                </p>

                {principalName && (
                  <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
                    <div className="w-9 h-9 rounded-full bg-green-50 border border-gray-200 text-[#053d26] font-bold flex items-center justify-center text-xs">
                      {principalName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{principalName}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Principal</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
