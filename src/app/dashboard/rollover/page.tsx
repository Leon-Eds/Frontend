import React from 'react';
import { Calendar, ChevronRight, AlertTriangle, CheckCircle2, Loader2, Archive, Rocket } from 'lucide-react';

export default function SessionRollover() {
  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-10">
      
      {/* Header Area */}
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold text-[#053d26] mb-3">Academic Transition Hub</h1>
        <p className="text-gray-600 text-sm leading-relaxed">
          Orchestrate the end-of-year transition with surgical precision. Manage batch promotions, audit academic standings, and initialize the upcoming session architecture.
        </p>
      </div>

      {/* Top Session Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Session */}
        <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-200 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#b05e1c] mb-2">Current Active Session</p>
            <div className="text-5xl font-bold text-gray-900 mb-4">2023 / 2024</div>
            <span className="inline-block px-3 py-1 rounded-full bg-[#7a2e2e] text-white text-[10px] font-bold uppercase tracking-wider mb-8">
              Status: Ending Soon
            </span>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-semibold text-gray-700">Session Progress</span>
              <span className="text-3xl font-bold text-gray-900">94%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full mb-4 overflow-hidden">
              <div className="h-full w-[94%] bg-[#053d26] rounded-full" />
            </div>
            <p className="text-xs text-gray-500 italic">
              Scheduled to conclude on July 15th, 2024
            </p>
          </div>
        </div>

        {/* Upcoming Session */}
        <div className="bg-[#053d26] rounded-[2rem] p-8 shadow-sm text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 opacity-10">
             <Calendar className="w-64 h-64 -mt-16 -mr-16" />
          </div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-green-200/80 mb-2">Upcoming Session Architecture</p>
              <div className="text-5xl font-bold mb-4">2024 / 2025</div>
            </div>
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Calendar className="w-6 h-6 text-green-100" />
            </div>
          </div>

          <div className="relative z-10 flex gap-6 mt-8">
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10 flex-1">
              <p className="text-[8px] font-bold uppercase tracking-widest text-green-200/70 mb-1">New Enrollments</p>
              <div className="text-xl font-bold text-white">1,240</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10 flex-1">
              <p className="text-[8px] font-bold uppercase tracking-widest text-green-200/70 mb-1">Tuition Fees</p>
              <div className="text-xl font-bold text-white">Updated</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10 flex-1">
              <p className="text-[8px] font-bold uppercase tracking-widest text-green-200/70 mb-1">Course Catalog</p>
              <div className="text-xl font-bold text-white">14 New</div>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Promotion Audit */}
      <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Batch Promotion Audit</h2>
            <p className="text-sm text-gray-500">Status of class eligibility based on Academic Standing & Financial Clearance.</p>
          </div>
          <button className="flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-[#b05e1c] transition-colors">
            View Full Report <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* G1 Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-full bg-[#e8f5e9] text-[#053d26] font-bold flex items-center justify-center">G1</div>
              <span className="px-2.5 py-1 rounded-full bg-[#b2f2bb] text-[#053d26] text-[10px] font-bold uppercase tracking-wider">Ready</span>
            </div>
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 text-lg">Grade 1 Senior</h3>
              <p className="text-[10px] text-gray-500 font-medium">142 Students Enrolled</p>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-bold mb-1">
                <span className="text-gray-500">Cleared for Promotion</span>
                <span className="text-gray-900">98%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-[98%] bg-[#053d26] rounded-full" />
              </div>
            </div>
          </div>

          {/* G2 Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center">G2</div>
              <span className="px-2.5 py-1 rounded-full bg-orange-100 text-[#b05e1c] text-[10px] font-bold uppercase tracking-wider">Pending</span>
            </div>
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 text-lg">Grade 2 Senior</h3>
              <p className="text-[10px] text-gray-500 font-medium">128 Students Enrolled</p>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-bold mb-1">
                <span className="text-gray-500">Cleared for Promotion</span>
                <span className="text-[#b05e1c]">72%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-[72%] bg-[#b05e1c] rounded-full" />
              </div>
            </div>
          </div>

          {/* G3 Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-full bg-[#e8f5e9] text-[#053d26] font-bold flex items-center justify-center">G3</div>
              <span className="px-2.5 py-1 rounded-full bg-[#b2f2bb] text-[#053d26] text-[10px] font-bold uppercase tracking-wider">Ready</span>
            </div>
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 text-lg">Grade 3 Senior</h3>
              <p className="text-[10px] text-gray-500 font-medium">156 Students Enrolled</p>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-bold mb-1">
                <span className="text-gray-500">Cleared for Promotion</span>
                <span className="text-gray-900">95%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-[95%] bg-[#053d26] rounded-full" />
              </div>
            </div>
          </div>

          {/* G4 Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center">G4</div>
              <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider">Review</span>
            </div>
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 text-lg">Grade 4 Senior</h3>
              <p className="text-[10px] text-gray-500 font-medium">110 Students Enrolled</p>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-bold mb-1">
                <span className="text-gray-500">Cleared for Promotion</span>
                <span className="text-red-600">48%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-[48%] bg-red-600 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Critical Action */}
        <div className="md:col-span-7 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex gap-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 border border-red-100">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Critical Action: Initialize Rollover</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-8">
              Proceeding with the rollover will permanently archive all active 2023/2024 academic records. This action cannot be undone. Ensure all grades are finalized and fee status audits are complete before execution.
            </p>
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors shadow-sm">
                Initiate 2024/2025 Rollover <Rocket className="w-4 h-4 ml-1" />
              </button>
              <button className="text-sm font-bold text-gray-600 hover:text-gray-900 underline underline-offset-4 decoration-gray-300 transition-colors">
                Download Pre-Rollover Audit
              </button>
            </div>
          </div>
        </div>

        {/* Automated Tasks */}
        <div className="md:col-span-5 bg-gray-50 rounded-[2rem] p-8 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Automated Tasks</h3>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#053d26] border border-gray-200 shadow-sm shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-0.5">Database Backup</h4>
                <p className="text-xs text-gray-500">Completed: Today, 04:30 AM</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#b05e1c] border border-gray-200 shadow-sm shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-0.5">Alumni Record Migration</h4>
                <p className="text-xs text-[#b05e1c]">Pending: 42 final year records</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 border border-gray-200 shadow-sm shrink-0">
                <Archive className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-0.5">Archival Sequencing</h4>
                <p className="text-xs text-gray-500">Ready for initialization</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
