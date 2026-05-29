"use client";

import { Share2, Download, Award, Calendar, CheckCircle2, TrendingUp, BarChart2, ShieldCheck } from "lucide-react";
import Image from "next/image";

interface SubjectScore {
  name: string;
  ca: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
  isExcellent?: boolean;
}

const subjects: SubjectScore[] = [
  { name: "Mathematics (Adv.)", ca: 38, exam: 54, total: 92, grade: "A+", remark: "Exceptional aptitude in calculus and logic.", isExcellent: true },
  { name: "Physics", ca: 34, exam: 51, total: 85, grade: "A", remark: "Strong theoretical understanding, good labs.", isExcellent: true },
  { name: "Biology", ca: 31, exam: 45, total: 76, grade: "B+", remark: "Needs more focus on practical diagrams." },
  { name: "English Language", ca: 39, exam: 56, total: 95, grade: "A+", remark: "An articulate student with creative flair.", isExcellent: true }
];

export default function StudentDetailedReport() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header and Download buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#b05e1c]">
            ACTIVE ACADEMIC TERM • 2023/2024 Session
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
          <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#b05e1c] text-white font-bold hover:bg-[#965017] transition-all text-sm shadow-md">
            <Download className="h-4 w-4" />
            Download PDF Report
          </button>
        </div>
      </div>

      {/* Profile & KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Profile Card */}
        <div className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center justify-between">
          <div className="relative w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden relative shadow-inner">
              <span className="text-2xl font-black text-[#053d26] absolute inset-0 flex items-center justify-center">AM</span>
            </div>
            <span className="absolute bottom-0 right-0 w-6 h-6 bg-[#b05e1c] rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-black">✓</span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">Adebayo Maxwell</h3>
            <p className="text-xs text-gray-400 font-semibold mt-1">Student ID: LE2024-00892</p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full border-t border-gray-100 pt-4 mt-4">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Grade Level</p>
              <p className="text-xs font-bold text-gray-700 mt-0.5">Grade 11 - Science</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Age</p>
              <p className="text-xs font-bold text-gray-700 mt-0.5">16 Years</p>
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
            <p className="text-4xl font-black mt-2">89.4%</p>
          </div>
          <p className="text-[10px] text-green-200 font-bold uppercase tracking-wider pt-4 border-t border-white/10 mt-4">
            +4.2% from last term
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
            <p className="text-4xl font-black mt-2 text-[#b05e1c]">04 / 42</p>
          </div>
          <p className="text-[10px] text-[#b05e1c] font-bold uppercase tracking-wider pt-4 border-t border-[#b05e1c]/10 mt-4">
            Top 10% of Class
          </p>
        </div>

        {/* Attendance Rate KPI */}
        <div className="rounded-3xl bg-gray-100 p-6 shadow-sm border border-gray-200/5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-5 translate-x-4 -translate-y-4">
            <Calendar className="w-36 h-36" />
          </div>
          <div>
            <div className="w-10 h-10 rounded-2xl bg-white/50 border border-gray-200 flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5 text-gray-500" />
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Attendance Rate</p>
            <p className="text-4xl font-black mt-2 text-gray-900">98%</p>
          </div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider pt-4 border-t border-gray-200 mt-4">
            48 of 49 days present
          </p>
        </div>
      </div>

      {/* Subject Performance Breakdown Section */}
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
                <th className="pb-3 pl-4">Teacher's Remark</th>
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
                    "{sub.remark}"
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Trend Analysis & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend chart */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Historical Trend Analysis</h2>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Progress over the last 4 academic terms</p>
            </div>
            <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-gray-200" />
                <span className="text-gray-500">Average</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#053d26]" />
                <span className="text-[#053d26]">Top Class Avg</span>
              </div>
            </div>
          </div>

          {/* Simple Visual Chart */}
          <div className="h-64 flex items-end justify-between gap-4 pt-4 px-4 border-b border-gray-100 relative">
            <span className="absolute top-4 right-4 bg-orange-600 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
              Peak Performance
            </span>
            
            {/* Term 1 */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center gap-1.5 h-44">
                <div className="w-5 sm:w-8 bg-gray-200 rounded-t-lg h-3/4" />
                <div className="w-5 sm:w-8 bg-[#053d26] rounded-t-lg h-[82%]" />
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Term 1 '23</span>
            </div>

            {/* Term 2 */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center gap-1.5 h-44">
                <div className="w-5 sm:w-8 bg-gray-200 rounded-t-lg h-[80%]" />
                <div className="w-5 sm:w-8 bg-[#053d26] rounded-t-lg h-[75%]" />
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Term 2 '23</span>
            </div>

            {/* Term 3 */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center gap-1.5 h-44">
                <div className="w-5 sm:w-8 bg-gray-200 rounded-t-lg h-[85%]" />
                <div className="w-5 sm:w-8 bg-[#053d26] rounded-t-lg h-[82%]" />
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Term 3 '23</span>
            </div>

            {/* Current */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center gap-1.5 h-44">
                <div className="w-5 sm:w-8 bg-gray-200 rounded-t-lg h-[90%]" />
                <div className="w-5 sm:w-8 bg-[#053d26] rounded-t-lg h-[95%]" />
              </div>
              <span className="text-[10px] text-gray-900 font-extrabold uppercase tracking-wider">Current Term</span>
            </div>
          </div>
        </div>

        {/* Academic Insights and Recommendations */}
        <div className="space-y-6">
          {/* Insights */}
          <div className="bg-[#053d26] text-white rounded-[2rem] p-6 sm:p-8 border border-[#042c1b] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-green-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Academic Insights
            </h3>
            <div className="space-y-3 text-xs leading-relaxed text-green-100/90 font-medium">
              <div className="flex gap-2">
                <span className="text-green-300">📈</span>
                <p>Maxwell is showing steady growth in STEM subjects, with an 8% increase in mathematical accuracy.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-green-300">★</span>
                <p>Currently ranked #1 in the school for advanced English comprehension.</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gray-100 rounded-[2rem] p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Teacher Recommendations</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              Consider enrolling in the Science Olympiad preparatory course for the next session to further challenge his potential in Physics.
            </p>

            <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
              <div className="w-9 h-9 rounded-full bg-green-50 border border-gray-200 text-[#053d26] font-bold flex items-center justify-center text-xs">
                TW
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Theophilus Williams</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Principal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
