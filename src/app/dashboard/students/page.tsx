import React from 'react';
import { Eye, Edit2, Check, Download, TrendingUp, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { mockAdmissions } from '@/lib/mocks/apiClient';

export default function AdmissionsHub() {
  const columns: Column<typeof mockAdmissions[0]>[] = [
    {
      header: 'Applicant',
      accessor: (admission) => (
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-[#e8f5e9] text-[#053d26] font-bold flex items-center justify-center text-sm">
            {admission.applicantInitials}
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm leading-tight">{admission.applicantName}</div>
            <div className="text-xs text-gray-500 mt-1">{admission.applicantEmail}</div>
          </div>
        </div>
      ),
      className: 'w-1/3'
    },
    {
      header: 'Class',
      accessor: (admission) => (
        <div className="text-sm font-bold text-gray-900">
          {admission.classApplied}
        </div>
      ),
      className: 'w-1/5'
    },
    {
      header: 'Applied Date',
      accessor: (admission) => (
        <div className="text-sm text-gray-600">
          {admission.appliedDate}
        </div>
      ),
      className: 'w-1/5'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-10">
      
      {/* Header Area */}
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold text-[#053d26] mb-3">Admission Review</h1>
        <p className="text-gray-600 text-sm leading-relaxed">
          Review and manage incoming applications for the 2024/25 Academic Session.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Total Applications</p>
          <div className="text-5xl font-bold text-[#053d26] mb-4">1,284</div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
            <TrendingUp className="h-4 w-4 text-[#20c997]" /> +12% from last week
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between border-b-4 border-b-[#b05e1c]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Pending Review</p>
          <div className="text-5xl font-bold text-[#b05e1c] mb-4">452</div>
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider">
              Action Required
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Approved</p>
          <div className="text-5xl font-bold text-[#053d26] mb-4">618</div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-[#20c997]" /> Enrollment process started
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Rejected</p>
          <div className="text-5xl font-bold text-gray-700 mb-4">214</div>
          <div className="flex items-center gap-1.5 text-xs text-red-500 font-semibold">
            <AlertCircle className="h-4 w-4" /> Mostly eligibility criteria gaps
          </div>
        </div>
      </div>

      {/* Directory Section */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-2">
        {/* Filters Header */}
        <div className="flex flex-col md:flex-row justify-between items-center p-6 border-b border-gray-50 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Filter By:</span>
            <select className="bg-gray-100 rounded-full px-4 py-2 text-xs font-bold text-gray-600 focus:outline-none appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%234B5563%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:8px_8px] bg-[right_12px_center]">
              <option>Class Applied for</option>
            </select>
            <button className="bg-gray-100 rounded-full px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors">
              Application Date
            </button>
          </div>
          <button className="flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-gray-900 transition-colors">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {/* Table Wrapper */}
        <div className="[&>div]:border-none [&>div]:shadow-none [&_table]:w-full">
          <DataTable 
            columns={columns} 
            data={mockAdmissions} 
            actions={() => (
              <div className="flex items-center gap-2 text-gray-400">
                <button className="hover:text-gray-600 transition-colors p-1.5"><Eye className="h-5 w-5" /></button>
                <button className="hover:text-gray-600 transition-colors p-1.5"><Edit2 className="h-4 w-4" /></button>
                <button className="hover:text-gray-600 transition-colors p-1.5"><Check className="h-5 w-5" /></button>
              </div>
            )}
          />
        </div>

        {/* Pagination Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-50">
          <span className="text-xs text-gray-500 font-medium">Showing 3 of 452 pending applications</span>
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

      {/* Bottom Insights Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#053d26] rounded-3xl p-8 shadow-sm text-white relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10">
             <TrendingUp className="w-48 h-48 -mb-12 -mr-12" />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-4">Admissions Insights</h3>
              <p className="text-green-100/80 text-sm leading-relaxed max-w-sm mb-8">
                Current trends show a 15% increase in STEM applications compared to the previous cycle. Ensure laboratory capacity is scaled accordingly.
              </p>
            </div>
            <button className="self-start px-6 py-3 rounded-full bg-[#b05e1c] text-white font-bold hover:bg-[#965017] transition-colors shadow-sm">
              Download Full Report
            </button>
          </div>
        </div>

        <div className="bg-gray-100 rounded-3xl p-8 shadow-sm border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Automated Verification</h3>
          <p className="text-gray-600 text-sm leading-relaxed max-w-sm mb-8">
            Our AI assistant has flagged 12 documents for blurred scanning or potential inconsistency. Review them now to speed up the process.
          </p>
          <div className="flex gap-4">
            <button className="px-6 py-3 rounded-full bg-white text-gray-900 font-bold hover:bg-gray-50 transition-colors shadow-sm">
              Review Flags (12)
            </button>
            <button className="px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors shadow-sm">
              Mark All Verified
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
