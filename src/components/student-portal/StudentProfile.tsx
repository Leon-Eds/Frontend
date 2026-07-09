"use client";

import { User, Mail, Hash, BookOpen, Calendar, Shield, ShieldCheck, CreditCard, Link as LinkIcon, Download } from "lucide-react";
import Link from "next/link";

export default function StudentProfile({ studentInfo }: { studentInfo: any }) {
  if (!studentInfo) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Personal Details</h2>
          <Link 
            href="/dashboard/student-portal/id-card"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Download ID Card
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Item */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-3 mb-2 text-gray-500">
              <User className="w-5 h-5 text-[var(--theme-primary,theme('colors.green.800'))]" />
              <span className="text-xs font-bold uppercase tracking-wider">Full Name</span>
            </div>
            <p className="font-bold text-gray-900 text-lg">{studentInfo.fullName || studentInfo.name}</p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-3 mb-2 text-gray-500">
              <Hash className="w-5 h-5 text-[var(--theme-primary,theme('colors.green.800'))]" />
              <span className="text-xs font-bold uppercase tracking-wider">Admission Number</span>
            </div>
            <p className="font-bold text-gray-900 text-lg">{studentInfo.admissionNumber || studentInfo.studentId || "—"}</p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-3 mb-2 text-gray-500">
              <Mail className="w-5 h-5 text-[var(--theme-primary,theme('colors.green.800'))]" />
              <span className="text-xs font-bold uppercase tracking-wider">Email Address</span>
            </div>
            <p className="font-bold text-gray-900 text-lg break-all">{studentInfo.email || "—"}</p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-3 mb-2 text-gray-500">
              <BookOpen className="w-5 h-5 text-[var(--theme-primary,theme('colors.green.800'))]" />
              <span className="text-xs font-bold uppercase tracking-wider">Form Class</span>
            </div>
            <p className="font-bold text-gray-900 text-lg">{studentInfo.className || studentInfo.formClass || "—"}</p>
          </div>

          {studentInfo.dateOfBirth && (
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-3 mb-2 text-gray-500">
                <Calendar className="w-5 h-5 text-[var(--theme-primary,theme('colors.green.800'))]" />
                <span className="text-xs font-bold uppercase tracking-wider">Date of Birth</span>
              </div>
              <p className="font-bold text-gray-900 text-lg">{new Date(studentInfo.dateOfBirth).toLocaleDateString()}</p>
            </div>
          )}

          {studentInfo.gender && (
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-3 mb-2 text-gray-500">
                <ShieldCheck className="w-5 h-5 text-[var(--theme-primary,theme('colors.green.800'))]" />
                <span className="text-xs font-bold uppercase tracking-wider">Gender</span>
              </div>
              <p className="font-bold text-gray-900 text-lg capitalize">{studentInfo.gender}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Parent Information if available */}
      {(studentInfo.parentEmail || studentInfo.parentPhone) && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Guardian / Contact Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50">
              <div className="flex items-center gap-3 mb-2 text-amber-700">
                <Mail className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Guardian Email</span>
              </div>
              <p className="font-bold text-gray-900 text-lg">{studentInfo.parentEmail || "N/A"}</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50">
              <div className="flex items-center gap-3 mb-2 text-amber-700">
                <Hash className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Guardian Phone</span>
              </div>
              <p className="font-bold text-gray-900 text-lg">{studentInfo.parentPhone || "N/A"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
