import React from 'react';
import { UserPlus, MoreVertical, Search, Bell } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { mockTeachers } from '@/lib/mocks/apiClient';

export default function FacultyDirectory() {
  const columns: Column<typeof mockTeachers[0]>[] = [
    {
      header: 'Faculty Member',
      accessor: (teacher) => (
        <div className="flex items-center gap-4">
          <img src={teacher.avatar} alt={teacher.name} className="h-12 w-12 rounded-full border-2 border-white shadow-sm object-cover" />
          <div>
            <div className="font-bold text-gray-900 text-sm leading-tight">{teacher.name}</div>
            <div className="text-xs text-gray-500 mt-1">ID: {teacher.id.split('-')[1]}-{teacher.id.split('-')[2]} • {teacher.role}</div>
          </div>
        </div>
      ),
      className: 'w-1/3'
    },
    {
      header: 'Academic Focus',
      accessor: (teacher) => (
        <div className="flex flex-col gap-1.5 items-start">
          {teacher.subjects.map((sub, i) => (
            <span key={i} className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${i === 0 ? 'bg-[#b2f2bb] text-[#053d26]' : 'bg-gray-100 text-gray-600'}`}>
              {sub}
            </span>
          ))}
        </div>
      ),
      className: 'w-1/4'
    },
    {
      header: 'Contact Intel',
      accessor: (teacher) => (
        <div>
          <div className="text-sm font-semibold text-gray-700">{teacher.email}</div>
          <div className="text-xs text-gray-500 mt-0.5">{teacher.phone}</div>
        </div>
      ),
      className: 'w-1/4'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-10">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold text-[#053d26] mb-3">Staff Directory</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Manage your intellectual capital. Coordinate faculty assignments, track performance indicators, and maintain pedagogical standards across all departments.
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors shadow-sm shrink-0">
          <UserPlus className="h-5 w-5" />
          Add New Teacher
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Total Faculty</p>
          <div className="text-5xl font-bold text-[#053d26] mb-2">142</div>
          <p className="text-xs text-[#20c997] font-semibold">+4 this academic term</p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Active Now</p>
          <div className="text-5xl font-bold text-[#053d26] mb-4">128</div>
          <div className="flex gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#20c997]"></span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#20c997]/80"></span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#20c997]/50"></span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#20c997]/20"></span>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">On Leave</p>
          <div className="text-5xl font-bold text-[#b05e1c] mb-2">14</div>
          <p className="text-xs text-[#c92a2a] font-semibold">Requires sub coverage</p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Avg. Load</p>
          <div className="text-5xl font-bold text-[#053d26] mb-2">18<span className="text-2xl ml-1">hr</span></div>
          <p className="text-xs text-gray-500">Per week average</p>
        </div>
      </div>

      {/* Directory Section */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-2">
        {/* Filters Header */}
        <div className="flex flex-col md:flex-row justify-between items-center p-6 border-b border-gray-50 gap-4">
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select className="bg-gray-100 rounded-full px-4 py-2 text-xs font-bold text-gray-600 focus:outline-none appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%234B5563%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:8px_8px] bg-[right_12px_center]">
              <option>Department: All</option>
            </select>
            <select className="bg-gray-100 rounded-full px-4 py-2 text-xs font-bold text-gray-600 focus:outline-none appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%234B5563%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:8px_8px] bg-[right_12px_center]">
              <option>Status: Active</option>
            </select>
            <select className="bg-gray-100 rounded-full px-4 py-2 text-xs font-bold text-gray-600 focus:outline-none appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%234B5563%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:8px_8px] bg-[right_12px_center]">
              <option>Sort: Name (A-Z)</option>
            </select>
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Showing 142 Educators
          </div>
        </div>

        {/* Table Wrapper (remove border/shadow since outer div has it) */}
        <div className="[&>div]:border-none [&>div]:shadow-none [&_table]:w-full">
          <DataTable 
            columns={columns} 
            data={mockTeachers} 
            actions={() => (
              <button className="text-gray-400 hover:text-[#053d26] transition-colors p-2">
                <MoreVertical className="h-5 w-5" />
              </button>
            )}
          />
        </div>

        {/* Pagination Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-50">
          <span className="text-xs text-gray-500">Showing page 1 of 8</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 transition-colors">
              Previous
            </button>
            <button className="px-4 py-2 rounded-full bg-[#053d26] text-white text-xs font-bold hover:bg-[#042c1b] transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
