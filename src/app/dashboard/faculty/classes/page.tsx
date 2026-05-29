"use client";

import { useState } from "react";
import { BookOpen, Users, Clock, ArrowRight, CheckCircle2, AlertCircle, ChevronRight, Search, Plus, Sparkles } from "lucide-react";
import Link from "next/link";

interface ClassCardData {
  id: string;
  name: string;
  subject: string;
  studentsCount: number;
  ca1Progress: number;
  ca2Progress: number;
  examProgress: number;
  color: string;
  badgeColor: string;
  textColor: string;
}

const myClasses: ClassCardData[] = [
  {
    id: "ss2-math",
    name: "SS2-A Mathematics",
    subject: "Mathematics",
    studentsCount: 42,
    ca1Progress: 100,
    ca2Progress: 85,
    examProgress: 0,
    color: "border-green-100 bg-white hover:border-[#053d26]/30",
    badgeColor: "bg-[#053d26]/10 text-[#053d26]",
    textColor: "text-[#053d26]"
  },
  {
    id: "ss1-fmath",
    name: "SS1-B Further Mathematics",
    subject: "Further Mathematics",
    studentsCount: 38,
    ca1Progress: 100,
    ca2Progress: 40,
    examProgress: 0,
    color: "border-orange-100 bg-white hover:border-[#b05e1c]/30",
    badgeColor: "bg-[#b05e1c]/10 text-[#b05e1c]",
    textColor: "text-[#b05e1c]"
  },
  {
    id: "jss3-tech",
    name: "JSS3-C Basic Technology",
    subject: "Basic Technology",
    studentsCount: 34,
    ca1Progress: 100,
    ca2Progress: 100,
    examProgress: 0,
    color: "border-teal-100 bg-white hover:border-teal-600/30",
    badgeColor: "bg-teal-50 text-teal-700",
    textColor: "text-teal-700"
  }
];

export default function MyClasses() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClasses = myClasses.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header and Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-orange-100 text-[#b05e1c] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Term 2, 2024
            </span>
            <span className="bg-green-100 text-[#053d26] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Faculty Portal
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">My Classes</h1>
          <p className="text-gray-500 max-w-2xl leading-relaxed text-sm">
            Overview of your active teaching assignments. Track assessment completion rates and access grading ledgers.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard/faculty/result-entry"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-all text-sm shadow-md"
          >
            <Plus className="h-4 w-4" />
            Quick Result Entry
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-transparent transition-colors"
            placeholder="Search classes or subjects..."
          />
        </div>
        <div className="text-xs text-gray-500 font-bold">
          Showing {filteredClasses.length} of {myClasses.length} assigned classes
        </div>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Classes Listing - Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredClasses.map((cls) => (
              <div 
                key={cls.id} 
                className={`rounded-[2rem] border p-6 shadow-sm flex flex-col justify-between h-full transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${cls.color}`}
              >
                <div className="space-y-4">
                  {/* Badge & Student Count */}
                  <div className="flex justify-between items-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${cls.badgeColor}`}>
                      {cls.subject}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                      <Users className="h-4 w-4" />
                      <span>{cls.studentsCount} Students</span>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-gray-900">{cls.name}</h3>
                    <p className="text-xs text-gray-500 font-medium">Department of Mathematical Sciences</p>
                  </div>

                  {/* Progress bars */}
                  <div className="space-y-4 pt-4 border-t border-gray-50">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Assessment Status</h4>
                    
                    {/* CA 1 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-gray-700">
                        <span>Continuous Assessment 1</span>
                        <span>{cls.ca1Progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#053d26] h-full rounded-full" style={{ width: `${cls.ca1Progress}%` }} />
                      </div>
                    </div>

                    {/* CA 2 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-gray-700">
                        <span>Continuous Assessment 2</span>
                        <span>{cls.ca2Progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${cls.textColor === "text-[#053d26]" ? "bg-[#053d26]" : "bg-[#b05e1c]"}`} style={{ width: `${cls.ca2Progress}%` }} />
                      </div>
                    </div>

                    {/* Exam */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-gray-700">
                        <span>Semester Examination</span>
                        <span>{cls.examProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-gray-300 h-full rounded-full" style={{ width: `${cls.examProgress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 pt-4 border-t border-gray-50 flex gap-2">
                  <Link 
                    href="/dashboard/faculty/result-entry"
                    className="flex-1 py-3 rounded-full bg-[#053d26] hover:bg-[#042c1b] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
                  >
                    Enter Scores <ChevronRight className="h-4.5 w-4.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Tasks - Right Column */}
        <div className="space-y-6">
          
          {/* Upcoming Milestones */}
          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 pb-4">
              <Clock className="h-4.5 w-4.5 text-gray-400" />
              Deadlines & Tasks
            </h3>

            <div className="relative border-l border-gray-100 pl-4 ml-2 space-y-6">
              
              {/* Task 1 */}
              <div className="relative">
                <span className="absolute -left-[21px] top-1 h-3.5 w-3.5 rounded-full bg-orange-500 border-2 border-white ring-1 ring-orange-200" />
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-gray-900 leading-tight">Enter SS2 Mathematics CA 2 Scores</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Due Oct 24, 2024</p>
                  <p className="text-[11px] text-gray-500">Requires 7 remaining student CA 2 fields to be finalized.</p>
                </div>
              </div>

              {/* Task 2 */}
              <div className="relative">
                <span className="absolute -left-[21px] top-1 h-3.5 w-3.5 rounded-full bg-orange-500 border-2 border-white ring-1 ring-orange-200" />
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-gray-900 leading-tight">SS1 Further Mathematics CA 2 Open</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Due Oct 28, 2024</p>
                  <p className="text-[11px] text-gray-500">Continuous Assessment 2 grade entries are now available.</p>
                </div>
              </div>

              {/* Task 3 */}
              <div className="relative">
                <span className="absolute -left-[21px] top-1 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white ring-1 ring-green-200" />
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-gray-800 leading-tight">JSS3 Basic Tech CA 2 Submission Completed</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Approved Oct 18, 2024</p>
                  <p className="text-[11px] text-green-700/80 font-medium">All student records verified and locked.</p>
                </div>
              </div>

            </div>
          </div>

          {/* Academic Guidelines */}
          <div className="bg-[#053d26] text-white rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
              <Sparkles className="w-32 h-32" />
            </div>
            
            <div className="relative z-10 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-green-300">Pedagogical Policy</span>
              <h3 className="text-lg font-bold leading-snug">Continuous Assessment Guidelines</h3>
              <p className="text-xs text-green-100/80 leading-relaxed">
                As per institutional standards, CA 1 and CA 2 must represent 20% of the total student grade each. Real-time entries must be finalized at least 72 hours before the start of general semester exams.
              </p>
              <button className="flex items-center gap-1.5 text-xs font-bold text-green-300 hover:text-white transition-colors">
                Read Faculty Manual
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
