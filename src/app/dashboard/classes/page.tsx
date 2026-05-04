import React from 'react';
import { Plus, BookOpen, Settings, MoreVertical, Edit2, ChevronRight, Calculator, BookText, Banknote } from 'lucide-react';

export default function AcademicFlow() {
  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-10">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold text-[#053d26] mb-3">Academic Flow</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Architecting the intellectual structure of LeonEd. Manage classroom tiers, departmental alignment, and subject distribution across all grade levels.
          </p>
        </div>
        <div className="flex gap-4 shrink-0">
          <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors shadow-sm">
            <Plus className="h-5 w-5" />
            Add New Class
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white border border-gray-200 text-gray-900 font-bold hover:bg-gray-50 transition-colors shadow-sm">
            <BookOpen className="h-5 w-5" />
            Subject Library
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#b05e1c] mb-4">Total Capacity</p>
          <div className="text-5xl font-bold text-gray-900 mb-2">1,240</div>
          <p className="text-xs text-gray-500 font-semibold">Active Students</p>
        </div>
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#b05e1c] mb-4">Curriculum Units</p>
          <div className="text-5xl font-bold text-gray-900 mb-2">48</div>
          <p className="text-xs text-gray-500 font-semibold">Assigned Subjects</p>
        </div>
        <div className="bg-[#053d26] rounded-[2rem] p-8 shadow-sm text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 bottom-0 opacity-10">
             <Settings className="w-32 h-32 -mb-8 -mr-8" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-green-200/80 mb-4">Academic Efficiency</p>
            <div className="text-5xl font-bold mb-2">94.2%</div>
            <p className="text-xs text-green-100 font-semibold">Staff to Student Ratio Optimized</p>
          </div>
        </div>
      </div>

      {/* Senior Secondary Level */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Senior Secondary Level</h2>
          <div className="bg-gray-100 rounded-full p-1 flex text-xs font-bold">
            <button className="px-4 py-1.5 rounded-full bg-white text-gray-900 shadow-sm">Grid View</button>
            <button className="px-4 py-1.5 rounded-full text-gray-500 hover:text-gray-900 transition-colors">List View</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* SS3 Card */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <div className="h-14 w-14 rounded-2xl bg-[#053d26] text-white flex items-center justify-center text-xl font-bold">
                SS3
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#b05e1c] uppercase tracking-widest block mb-1">Graduating Class</span>
                <div className="flex -space-x-2 justify-end">
                  <img src="https://i.pravatar.cc/150?u=a" className="w-6 h-6 rounded-full border border-white" alt="student" />
                  <img src="https://i.pravatar.cc/150?u=b" className="w-6 h-6 rounded-full border border-white" alt="student" />
                  <div className="w-6 h-6 rounded-full bg-gray-100 border border-white flex items-center justify-center text-[8px] font-bold text-gray-600">+119</div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900">Senior Secondary Three</h3>
              <p className="text-xs text-gray-500">Total Students: 121 (4 Sections)</p>
            </div>

            <div className="space-y-3 mb-8 flex-1">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Calculator className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">Science Section</span>
                </div>
                <span className="text-xs font-semibold text-gray-500">42 Students</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <BookText className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">Arts Section</span>
                </div>
                <span className="text-xs font-semibold text-gray-500">38 Students</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-xs font-bold text-gray-900 flex items-center justify-center gap-2">
                <Edit2 className="w-3 h-3" /> Configure Arms
              </button>
              <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors shrink-0">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* SS2 Card */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <div className="h-14 w-14 rounded-2xl bg-gray-200 text-gray-600 flex items-center justify-center text-xl font-bold">
                SS2
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-1 rounded-full bg-[#b2f2bb] text-[#053d26] text-[10px] font-bold uppercase tracking-widest mb-1">Active Term</span>
                <div className="flex -space-x-2 justify-end">
                  <img src="https://i.pravatar.cc/150?u=c" className="w-6 h-6 rounded-full border border-white" alt="student" />
                  <img src="https://i.pravatar.cc/150?u=d" className="w-6 h-6 rounded-full border border-white" alt="student" />
                  <div className="w-6 h-6 rounded-full bg-gray-100 border border-white flex items-center justify-center text-[8px] font-bold text-gray-600">+142</div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900">Senior Secondary Two</h3>
              <p className="text-xs text-gray-500">Total Students: 145 (5 Sections)</p>
            </div>

            <div className="space-y-3 mb-8 flex-1">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Banknote className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">Commercial Section</span>
                </div>
                <span className="text-xs font-semibold text-gray-500">55 Students</span>
              </div>
              <button className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white border-2 border-dashed border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                  <Plus className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold italic">Add New Arm</span>
              </button>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-xs font-bold text-gray-900 flex items-center justify-center gap-2">
                <Edit2 className="w-3 h-3" /> Configure Arms
              </button>
              <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors shrink-0">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Assign Subjects Action Card */}
          <div className="bg-gray-50 rounded-[2rem] p-8 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center relative h-full">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-14 h-14 rounded-full bg-[#b05e1c] text-white flex items-center justify-center shadow-lg cursor-pointer hover:bg-[#965017] transition-colors">
              <Edit2 className="w-5 h-5" />
            </div>
            
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm text-[#b05e1c] mb-6">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Assign Subjects</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-[200px]">
              Link academic curricula to specific class arms and sections.
            </p>
            <button className="text-sm font-bold text-[#b05e1c] hover:underline">
              Open Matrix Editor
            </button>
          </div>
        </div>
      </div>

      {/* Recent Subject Assignments */}
      <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Recent Subject Assignments</h2>
        <p className="text-sm text-gray-500 mb-8">Audit trail for global academic structure changes</p>

        <div className="space-y-4 mb-8">
          {/* Row 1 */}
          <div className="flex items-center justify-between p-4 rounded-full bg-white shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-[#b05e1c] flex items-center justify-center font-serif text-lg font-bold">
                Σ
              </div>
              <div>
                <div className="font-bold text-sm text-gray-900">Further Mathematics</div>
                <div className="text-[10px] text-gray-500">Stem Curriculum • Core</div>
              </div>
            </div>
            <div className="flex-1 text-sm font-bold text-gray-600">SS3 Science</div>
            <div className="flex items-center gap-3 flex-1">
              <img src="https://i.pravatar.cc/150?u=dradebayo" className="w-8 h-8 rounded-full object-cover" alt="Dr. Adebayo" />
              <span className="text-sm font-semibold text-gray-700">Dr. Adebayo</span>
            </div>
            <button className="text-gray-400 hover:text-gray-600 transition-colors px-2">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>

          {/* Row 2 */}
          <div className="flex items-center justify-between p-4 rounded-full bg-white shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 rounded-full bg-green-100 text-[#053d26] flex items-center justify-center font-bold">
                <BookText className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-gray-900">African Literature</div>
                <div className="text-[10px] text-gray-500">Humanities • Elective</div>
              </div>
            </div>
            <div className="flex-1 text-sm font-bold text-gray-600">SS2 Arts</div>
            <div className="flex items-center gap-3 flex-1">
              <img src="https://i.pravatar.cc/150?u=profnkechi" className="w-8 h-8 rounded-full object-cover" alt="Prof. Nkechi" />
              <span className="text-sm font-semibold text-gray-700">Prof. Nkechi</span>
            </div>
            <button className="text-gray-400 hover:text-gray-600 transition-colors px-2">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>

          {/* Row 3 */}
          <div className="flex items-center justify-between p-4 rounded-full bg-white shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-[#b05e1c] flex items-center justify-center">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-gray-900">Economics & Finance</div>
                <div className="text-[10px] text-gray-500">Social Sciences • Core</div>
              </div>
            </div>
            <div className="flex-1 text-sm font-bold text-gray-600">SS3 Commercial</div>
            <div className="flex items-center gap-3 flex-1">
              <img src="https://i.pravatar.cc/150?u=mribrahim" className="w-8 h-8 rounded-full object-cover" alt="Mr. Ibrahim" />
              <span className="text-sm font-semibold text-gray-700">Mr. Ibrahim</span>
            </div>
            <button className="text-gray-400 hover:text-gray-600 transition-colors px-2">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="text-center">
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-gray-200 text-gray-900 text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
            View Entire Academic Catalog <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
