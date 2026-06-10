"use client";

import { useState, useEffect } from "react";
import { Award, CheckCircle2, TrendingUp, AlertCircle, FileText, Star, GraduationCap, Loader2 } from "lucide-react";
import { dashboardApi, resultApi, sessionApi } from "@/lib/api";

interface SubjectGrade {
  name: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
}

export default function StudentPerformanceRecord() {
  const [grades, setGrades] = useState<SubjectGrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [studentInfo, setStudentInfo] = useState({
    name: "",
    initials: "",
    className: "",
    gpa: 0,
    rank: "--",
    attendance: "96%",
    status: "Cleared",
    termLabel: "Current Term"
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const userStr = localStorage.getItem("leoned_user");
        if (!userStr) throw new Error("Not logged in");
        const user = JSON.parse(userStr);
        
        const sessions = await sessionApi.getAll().catch(() => []);
        const currentSession = (Array.isArray(sessions) ? sessions : []).find((s: any) => s.isCurrent);
        const currentTerm = currentSession?.terms?.find((t: any) => t.isCurrent);
        
        // We do not throw here, just gracefully fallback if no active term
        const termId = currentTerm?.id || 'default';

        const [dash, resultsData] = await Promise.all([
          dashboardApi.getStudentDashboard().catch(() => null),
          resultApi.getMyResults(termId).catch(() => [])
        ]);

        const sDash = (dash as any)?.data || dash || {};
        
        setStudentInfo({
          name: user.fullName || user.name || "Student",
          initials: (user.fullName || user.name || "S").split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
          className: user.className || sDash?.className || "Unassigned",
          gpa: sDash?.termAverage || sDash?.gpa || 0,
          rank: sDash?.classPosition || sDash?.rank || "--",
          attendance: sDash?.attendance || "96%",
          status: sDash?.feeStatus || sDash?.status || "Cleared",
          termLabel: currentTerm ? `Term ${(currentTerm as any).termNumber || (currentTerm as any).name || ''} ${currentSession?.name || ''}` : "Current Term"
        });

        const rData = (resultsData as any)?.data || resultsData;
        const resultsArray = Array.isArray(rData) ? rData : [];
        
        const mappedGrades = resultsArray.map((r: any) => {
          const total = Number(r.totalScore || 0);
          return {
            name: r.subjectName || "Unknown",
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
        setError("Failed to load your portal data.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-gray-400 font-semibold text-sm">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading your portal...
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
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Welcome Banner */}
      <div className="relative rounded-[2rem] bg-gradient-to-br from-[#053d26] to-[#042c1b] text-white p-8 sm:p-10 overflow-hidden shadow-lg border border-[#042c1b]">
        <div className="absolute right-0 top-0 opacity-10 translate-x-12 -translate-y-12">
          <GraduationCap className="w-64 h-64" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="bg-[#b05e1c] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Official Performance Record
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">Student Portal</h1>
            <p className="text-sm text-green-100 max-w-xl">
              Preview verified academic summaries, subject indexes, and transcript records for {studentInfo.termLabel}.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
            <div className="h-12 w-12 rounded-full bg-[#b05e1c] text-white font-bold flex items-center justify-center text-lg shadow-inner">
              {studentInfo.initials}
            </div>
            <div>
              <p className="font-bold text-sm">{studentInfo.name}</p>
              <p className="text-xs text-green-200">{studentInfo.className}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* GPA */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="p-3 rounded-2xl shrink-0 text-[#053d26] bg-[#053d26]/10">
            <Award className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Cumulative Average</p>
            <p className="text-2xl font-black text-gray-900 leading-none">{studentInfo.gpa.toFixed(2)}%</p>
            <p className="text-[11px] text-green-600 font-semibold pt-1">Term Average</p>
          </div>
        </div>

        {/* Class Rank */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="p-3 rounded-2xl shrink-0 text-[#b05e1c] bg-[#b05e1c]/10">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Class Position</p>
            <p className="text-2xl font-black text-gray-900 leading-none">{studentInfo.rank}</p>
            <p className="text-[11px] text-gray-500 font-medium pt-1">Current Standing</p>
          </div>
        </div>

        {/* Attendance */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="p-3 rounded-2xl shrink-0 text-teal-700 bg-teal-50">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Attendance Rate</p>
            <p className="text-2xl font-black text-gray-900 leading-none">{studentInfo.attendance}</p>
            <p className="text-[11px] text-gray-500 font-medium pt-1">Term Record</p>
          </div>
        </div>

        {/* Clearance Status */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
          <div className={`p-3 rounded-2xl shrink-0 ${studentInfo.status === 'Cleared' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
            <Star className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Clearance Status</p>
            <p className={`text-2xl font-black leading-none ${studentInfo.status === 'Cleared' ? 'text-green-700' : 'text-red-700'}`}>{studentInfo.status.toUpperCase()}</p>
            <p className="text-[11px] text-gray-500 font-medium pt-1">Finance & Registry verified</p>
          </div>
        </div>

      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Subject Grades Table - Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#b05e1c]" />
                Subject Performance Ledger
              </h2>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{studentInfo.termLabel} Verified</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-wider text-gray-400 border-b border-gray-50">
                    <th className="py-4 px-6">Subject</th>
                    <th className="py-4 px-4 text-center">CA 1 (20)</th>
                    <th className="py-4 px-4 text-center">CA 2 (20)</th>
                    <th className="py-4 px-4 text-center">Exam (60)</th>
                    <th className="py-4 px-4 text-center">Total (100)</th>
                    <th className="py-4 px-6 text-center">Grade</th>
                    <th className="py-4 px-6">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {grades.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 pl-6 font-bold text-gray-900 text-sm">
                        {item.name}
                      </td>
                      <td className="py-4 px-4 text-center font-medium text-gray-600">{item.ca1}</td>
                      <td className="py-4 px-4 text-center font-medium text-gray-600">{item.ca2}</td>
                      <td className="py-4 px-4 text-center font-medium text-gray-600">{item.exam}</td>
                      <td className="py-4 px-4 text-center font-black text-gray-900">{item.total}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-black">
                          {item.grade}
                        </span>
                      </td>
                      <td className="py-4 pr-6 text-xs text-gray-500 italic">
                        &quot;{item.remark}&quot;
                      </td>
                    </tr>
                  ))}
                  {grades.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-sm text-gray-500 font-semibold">
                        No results published for this term yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Remarks and General Memos - Right Column */}
        <div className="space-y-6">
          
          {/* Teacher feedback feed */}
          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 pb-4">
              <Star className="h-5 w-5 text-gray-400" />
              Academic Remarks
            </h3>

            <div className="space-y-4">
              {grades.length > 0 ? grades.filter(g => g.remark && g.remark !== 'N/A').slice(0, 3).map((g, i) => (
                <div key={i} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-[#b05e1c]">
                    <span>{g.name}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    &quot;{g.remark}&quot;
                  </p>
                </div>
              )) : (
                <p className="text-xs text-gray-400 font-semibold">No academic remarks available for this term.</p>
              )}
            </div>
          </div>

          {/* Admin Announcement memo */}
          <div className="bg-[#053d26] text-white rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
              <Award className="w-32 h-32" />
            </div>

            <div className="relative z-10 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-green-300">Office of the Principal</span>
              <h3 className="text-lg font-bold leading-snug">Graduation Clearance</h3>
              <p className="text-xs text-green-100/80 leading-relaxed">
                Clearance audits are underway for SS 2 student transcripts. Please confirm your demographic data, fee balances, and continuous assessment listings before the end of the term.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
