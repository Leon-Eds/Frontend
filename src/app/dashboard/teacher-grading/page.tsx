"use client";

import { useState } from "react";
import { Search, Save, Send, AlertCircle, ArrowLeft, ArrowRight, BookOpen, Clock, FileText } from "lucide-react";
import Link from "next/link";

interface StudentScore {
  id: string;
  name: string;
  avatarUrl?: string;
  admNo: string;
  ca1: number | string;
  ca2: number | string;
  exam: number | string;
  total: number | string;
  grade: string;
  pos: string;
  isMissingExam?: boolean;
}

const initialStudents: StudentScore[] = [
  { id: "1", name: "Adeola Akindele", admNo: "ADM/2022/0452", ca1: 18, ca2: 17, exam: 52, total: 87, grade: "A", pos: "1st" },
  { id: "2", name: "Chidi Nwosu", admNo: "ADM/2022/0319", ca1: 15, ca2: 14, exam: 48, total: 77, grade: "B", pos: "4th" },
  { id: "3", name: "Emeka Okafor", admNo: "ADM/2022/0122", ca1: 12, ca2: 11, exam: "", total: "", grade: "N/A", pos: "--", isMissingExam: true },
  { id: "4", name: "Fatima Bello", admNo: "ADM/2022/0881", ca1: 19, ca2: 18, exam: 45, total: 82, grade: "A", pos: "2nd" },
  { id: "5", name: "Ibrahim Musa", admNo: "ADM/2022/0912", ca1: 14, ca2: 15, exam: 41, total: 70, grade: "B", pos: "5th" },
  { id: "6", name: "Ngozi Okeke", admNo: "ADM/2022/0188", ca1: 17, ca2: 16, exam: 48, total: 81, grade: "A", pos: "3rd" },
];

export default function ScoreEntryLedger() {
  const [students, setStudents] = useState<StudentScore[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");

  const handleScoreChange = (id: string, field: "ca1" | "ca2" | "exam", value: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== id) return s;

      const numVal = value === "" ? "" : Number(value);
      const updated = { ...s, [field]: numVal };

      // Recalculate total, grade, isMissingExam
      const ca1 = updated.ca1 === "" ? 0 : Number(updated.ca1);
      const ca2 = updated.ca2 === "" ? 0 : Number(updated.ca2);
      const exam = updated.exam === "" ? 0 : Number(updated.exam);

      updated.isMissingExam = updated.exam === "";

      if (updated.exam === "") {
        updated.total = "";
        updated.grade = "N/A";
      } else {
        const total = ca1 + ca2 + exam;
        updated.total = total;
        
        if (total >= 75) updated.grade = "A";
        else if (total >= 60) updated.grade = "B";
        else if (total >= 50) updated.grade = "C";
        else if (total >= 40) updated.grade = "D";
        else updated.grade = "F";
      }

      return updated;
    }));
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.admNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Breadcrumb Tags and Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-orange-100 text-[#b05e1c] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Term 2, 2024
            </span>
            <span className="bg-green-100 text-[#053d26] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Mathematics (SS2-A)
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">Score Entry Ledger</h1>
          <p className="text-gray-500 max-w-2xl leading-relaxed text-sm">
            Entering continuous assessment and examination results for Senior Secondary 2 - Mathematics. Grades are computed in real-time based on the 20/20/60 weighting.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button className="flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all text-sm shadow-sm">
            <Save className="h-4 w-4" />
            Save Draft
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-all text-sm shadow-md">
            <Send className="h-4 w-4" />
            Submit for Approval
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry Progress */}
        <div className="lg:col-span-2 rounded-3xl bg-white p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Entry Progress</h3>
            <span className="text-2xl font-black text-[#053d26]">84%</span>
          </div>

          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-8">
            <div className="bg-[#053d26] h-full rounded-full transition-all duration-500" style={{ width: "84%" }} />
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Students Enrolled</p>
              <p className="text-2xl font-black text-gray-900">42</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Scores Entered</p>
              <p className="text-2xl font-black text-gray-900">35/42</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Pending Verification</p>
              <p className="text-2xl font-black text-orange-600">07</p>
            </div>
          </div>
        </div>

        {/* Class Average */}
        <div className="rounded-3xl bg-[#b05e1c]/10 p-8 shadow-sm border border-[#b05e1c]/10 flex justify-between relative overflow-hidden">
          <div className="flex flex-col justify-between relative z-10">
            <div>
              <p className="text-xs font-bold text-[#b05e1c] uppercase tracking-wider mb-2">Class Average</p>
              <p className="text-5xl font-black text-[#b05e1c]">72.4%</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#b05e1c] font-bold mt-6">
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#b05e1c] text-white font-extrabold">↑</span>
              <span>+4.2% from CA 1</span>
            </div>
          </div>
          
          <div className="absolute right-4 bottom-4 text-[#b05e1c]/10">
            {/* simple bar icon mockup */}
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="12" width="4" height="8" rx="1" />
              <rect x="10" y="8" width="4" height="12" rx="1" />
              <rect x="17" y="4" width="4" height="16" rx="1" />
            </svg>
          </div>
        </div>
      </div>

      {/* Score Ledger Sheet */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar Header */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-transparent transition-colors"
              placeholder="Filter by name or ID..."
            />
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
            <span>Weighting:</span>
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <span className="text-gray-900">CA 1 (20)</span>
              <span className="text-gray-300">|</span>
              <span>CA 2 (20)</span>
              <span className="text-gray-300">|</span>
              <span>Exam (60)</span>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-wider text-gray-400 border-b border-gray-100">
                <th className="py-4 px-8">Student Information</th>
                <th className="py-4 px-6 text-center">CA 1 (20)</th>
                <th className="py-4 px-6 text-center">CA 2 (20)</th>
                <th className="py-4 px-6 text-center">Exam (60)</th>
                <th className="py-4 px-6 text-center">Total (100)</th>
                <th className="py-4 px-6 text-center">Grade</th>
                <th className="py-4 px-8 text-right">Pos.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student) => (
                <tr 
                  key={student.id} 
                  className={`hover:bg-gray-50/50 transition-colors ${
                    student.isMissingExam ? "bg-orange-50/20" : ""
                  }`}
                >
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-50 text-[#053d26] font-bold flex items-center justify-center text-sm shadow-inner">
                        {student.name.split(" ").map(w => w[0]).join("")}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{student.name}</p>
                        <p className="text-xs text-gray-400 font-semibold">{student.admNo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex justify-center">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={student.ca1}
                        onChange={(e) => handleScoreChange(student.id, "ca1", e.target.value)}
                        className="w-16 rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-center text-sm font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26]"
                      />
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex justify-center">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={student.ca2}
                        onChange={(e) => handleScoreChange(student.id, "ca2", e.target.value)}
                        className="w-16 rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-center text-sm font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26]"
                      />
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex justify-center">
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={student.exam}
                        onChange={(e) => handleScoreChange(student.id, "exam", e.target.value)}
                        className={`w-20 rounded-xl border px-3 py-2 text-center text-sm font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] ${
                          student.isMissingExam ? "border-orange-300 bg-orange-50/50 text-orange-700" : "border-gray-200 bg-gray-50/50"
                        }`}
                        placeholder="--"
                      />
                    </div>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <span className="font-extrabold text-gray-900 text-sm">
                      {student.total || "--"}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${
                      student.grade === "A"
                        ? "bg-green-100 text-[#053d26]"
                        : student.grade === "B"
                        ? "bg-green-50 text-green-700"
                        : student.grade === "C"
                        ? "bg-yellow-50 text-yellow-700"
                        : student.grade === "D"
                        ? "bg-orange-50 text-orange-700"
                        : "bg-red-50 text-red-700"
                    }`}>
                      {student.grade}
                    </span>
                  </td>
                  <td className="py-5 px-8 text-right font-bold text-gray-500 text-sm">
                    {student.pos}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer controls & Legend */}
        <div className="p-6 bg-gray-50/60 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
            <button className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50" disabled>
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span>Page 1 of 5</span>
            <button className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-6 text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
              <span className="text-gray-500">MISSING EXAM SCORE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-gray-500">PASSED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scale Notes and Memo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Grading Scale Notes */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-gray-400" />
            Grading Scale Notes
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-gray-100 pb-3 text-sm">
              <span className="font-semibold text-gray-500">Distinction (A)</span>
              <span className="font-bold text-gray-900">75 - 100</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-3 text-sm">
              <span className="font-semibold text-gray-500">Credit (B/C)</span>
              <span className="font-bold text-gray-900">50 - 74</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-3 text-sm">
              <span className="font-semibold text-gray-500">Pass (D/E)</span>
              <span className="font-bold text-[#b05e1c]">40 - 49</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-gray-500">Fail (F)</span>
              <span className="font-bold text-red-600">0 - 39</span>
            </div>
          </div>
        </div>

        {/* Internal Memo */}
        <div className="bg-[#053d26] text-white rounded-3xl p-8 shadow-sm border border-[#042c1b] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-green-300 font-bold mb-4">
              <Clock className="h-4 w-4" />
              INTERNAL MEMO
            </div>
            <h3 className="text-xl font-bold mb-3">Deadlines for Approval</h3>
            <p className="text-green-100/80 leading-relaxed text-sm">
              Please ensure all Mathematics SS2 scores are entered and submitted by Thursday, Oct 24th for the Vice Principal's review. Incomplete records will delay the generation of Term 2 report cards.
            </p>
          </div>
          
          <button className="flex items-center gap-2 text-sm font-bold text-green-300 hover:text-white transition-colors mt-8 w-fit">
            View Academic Calendar
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
