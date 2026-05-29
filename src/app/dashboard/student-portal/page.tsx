"use client";

import { useState } from "react";
import { Award, BookOpen, Clock, Calendar, CheckCircle2, TrendingUp, AlertCircle, FileText, Star, GraduationCap } from "lucide-react";
import Link from "next/link";

interface SubjectGrade {
  name: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
}

const studentGrades: SubjectGrade[] = [
  { name: "Mathematics", ca1: 19, ca2: 18, exam: 45, total: 82, grade: "A", remark: "Outstanding logic and analytical skills shown." },
  { name: "Further Mathematics", ca1: 18, ca2: 17, exam: 42, total: 77, grade: "B", remark: "Strong quantitative aptitude and execution." },
  { name: "Basic Technology", ca1: 17, ca2: 16, exam: 48, total: 81, grade: "A", remark: "Excellent practical project design submission." },
  { name: "Physics", ca1: 16, ca2: 18, exam: 40, total: 74, grade: "B", remark: "Good grasp of mechanics and thermodynamics." },
  { name: "English Language", ca1: 15, ca2: 17, exam: 41, total: 73, grade: "B", remark: "Commendable expression and essay structure." }
];

export default function StudentPerformanceRecord() {
  const gpa = 3.84;
  const rank = "2nd of 42";
  const attendance = "96%";

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
              Preview verified academic summaries, subject indexes, and transcript records for Term 2, 2024.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
            <div className="h-12 w-12 rounded-full bg-[#b05e1c] text-white font-bold flex items-center justify-center text-lg shadow-inner">
              TO
            </div>
            <div>
              <p className="font-bold text-sm">Tunde Oke</p>
              <p className="text-xs text-green-200">SS 2 Science Arm A</p>
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
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Cumulative GPA</p>
            <p className="text-2xl font-black text-gray-900 leading-none">{gpa.toFixed(2)} / 4.00</p>
            <p className="text-[11px] text-green-600 font-semibold pt-1">First Class Standing</p>
          </div>
        </div>

        {/* Class Rank */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="p-3 rounded-2xl shrink-0 text-[#b05e1c] bg-[#b05e1c]/10">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Class Position</p>
            <p className="text-2xl font-black text-gray-900 leading-none">{rank}</p>
            <p className="text-[11px] text-gray-500 font-medium pt-1">Top 5% of cohort</p>
          </div>
        </div>

        {/* Attendance */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="p-3 rounded-2xl shrink-0 text-teal-700 bg-teal-50">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Attendance Rate</p>
            <p className="text-2xl font-black text-gray-900 leading-none">{attendance}</p>
            <p className="text-[11px] text-gray-500 font-medium pt-1">Excellent attendance record</p>
          </div>
        </div>

        {/* Clearance Status */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="p-3 rounded-2xl shrink-0 text-green-600 bg-green-50">
            <Star className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Clearance Status</p>
            <p className="text-2xl font-black text-green-700 leading-none">FULLY CLEARED</p>
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
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Term 2 Verified</span>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {studentGrades.map((subject, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-gray-900">{subject.name}</p>
                          <p className="text-xs text-gray-400 italic mt-0.5 max-w-[280px] truncate" title={subject.remark}>
                            {subject.remark}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-gray-700">{subject.ca1}</td>
                      <td className="py-4 px-4 text-center font-bold text-gray-700">{subject.ca2}</td>
                      <td className="py-4 px-4 text-center font-bold text-gray-700">{subject.exam}</td>
                      <td className="py-4 px-4 text-center font-black text-gray-900">{subject.total}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${
                          subject.grade === "A"
                            ? "bg-green-100 text-[#053d26]"
                            : "bg-green-50 text-green-700"
                        }`}>
                          {subject.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
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
              <Star className="h-4.5 w-4.5 text-gray-400" />
              Academic Remarks
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-[#b05e1c]">
                  <span>Dr. Elena Rodriguez (Math)</span>
                  <span>Yesterday</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  "Tunde displays exceptional command over mathematical proofs. His test submissions are logically rigorous and well presented."
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-[#b05e1c]">
                  <span>Prof. Kwame Mensah (Socials)</span>
                  <span>Oct 15</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  "Excellent active participation in class seminar discussions. Highly analytical essays and peer support skills."
                </p>
              </div>
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
