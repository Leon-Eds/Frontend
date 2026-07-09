import React from 'react';
import { ShieldCheck, User, UserPlus, LayoutDashboard, CheckCircle2, Building2 } from 'lucide-react';
import Link from 'next/link';
import { CreateStudentRequest } from '@/lib/api';

interface Step4Props {
  data: CreateStudentRequest & { id?: string };
  onReset: () => void;
}

export const Step4Success: React.FC<Step4Props> = ({ data, onReset }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Main Success Area */}
      <div className="lg:col-span-8 bg-white rounded-3xl p-10 md:p-16 shadow-sm flex flex-col items-center justify-center text-center">
        {(data as any).profilePictureUrl ? (
          <img 
            src={(data as any).profilePictureUrl} 
            alt="Student Passport" 
            className="h-24 w-24 rounded-full object-cover border-4 border-[#053d26] mb-8 shadow-lg shadow-green-900/20"
          />
        ) : (
          <div className="h-24 w-24 rounded-full bg-[#053d26] flex items-center justify-center mb-8 shadow-lg shadow-green-900/20">
            <User className="h-12 w-12 text-white" />
          </div>
        )}
        
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 max-w-md leading-tight">
          Student Successfully Enrolled
        </h2>
        
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          The academic records for <span className="font-bold text-gray-900">{data.fullName || "Student"}</span> have been architected and finalized.
        </p>

        <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-[#053d26] mb-12">
          <Building2 className="h-4 w-4" />
          <span>Admission ID: {data.admissionNumber || "N/A"}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mb-8">
          <Link
            href="/dashboard/students"
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors"
          >
            <User className="h-5 w-5" />
            View Student List
          </Link>
          <button 
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full bg-gray-200 text-gray-900 font-bold hover:bg-gray-300 transition-colors"
          >
            <UserPlus className="h-5 w-5" />
            Add Another Student
          </button>
        </div>

        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-[#b05e1c] hover:text-[#965017] transition-colors">
          <LayoutDashboard className="h-5 w-5" />
          Go to Dashboard
        </Link>
      </div>

      {/* Right Info Sidebar */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-[#053d26] rounded-3xl p-8 shadow-sm text-white">
          <h3 className="text-xl font-bold mb-4">Student Credentials</h3>
          <p className="text-sm text-green-100/80 mb-6">
            Please share these credentials with the student or parent. They will be required for portal access.
          </p>
          
          <div className="space-y-4 bg-[#042c1b] p-5 rounded-2xl border border-green-800">
            <div>
              <p className="text-xs text-green-300 font-bold uppercase tracking-widest mb-1">Email / Admission No.</p>
              <p className="font-bold text-lg">{data.admissionNumber || "N/A"}</p>
            </div>
            
            <div className="h-px bg-green-800/50 w-full"></div>
            
            <div>
              <p className="text-xs text-green-300 font-bold uppercase tracking-widest mb-1">Password</p>
              <div className="flex items-center justify-between">
                <p className="font-bold text-lg tracking-wider">{data.password || "password"}</p>
                <span className="text-[10px] bg-green-500/20 text-green-200 px-2 py-1 rounded font-bold">DEFAULT</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">Registration Snapshot</p>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <span className="text-sm text-gray-500">Full Name</span>
              <span className="text-sm font-bold text-gray-900">{data.fullName || "—"}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <span className="text-sm text-gray-500">Gender</span>
              <span className="text-sm font-bold text-gray-900">{data.gender || "—"}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <span className="text-sm text-gray-500">Guardian</span>
              <span className="text-sm font-bold text-gray-900">{data.parentName || "—"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Payment Status</span>
              <span className="px-2 py-1 rounded-md bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider">Pending</span>
            </div>
          </div>
        </div>

        {/* Database Sync Toast */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Database Sync Complete</h4>
            <p className="text-xs text-gray-500">All regional nodes updated.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
