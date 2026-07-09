"use client";

import { useState, useEffect } from "react";
import { User, BookOpen, Clock, CreditCard, MessageSquare, GraduationCap, Loader2, AlertCircle } from "lucide-react";

import StudentProfile from "@/components/student-portal/StudentProfile";
import StudentAcademics from "@/components/student-portal/StudentAcademics";
import StudentFinance from "@/components/student-portal/StudentFinance";
import StudentAttendance from "@/components/student-portal/StudentAttendance";
import StudentMessages from "@/components/student-portal/StudentMessages";
import { studentApi, dashboardApi } from "@/lib/api";

export default function StudentPortal() {
  const [activeTab, setActiveTab] = useState('profile');
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const userStr = localStorage.getItem("leoned_user");
        if (!userStr) throw new Error("Not logged in");
        const user = JSON.parse(userStr);
        const studentId = user.studentId || user.id || user._id;
        
        // Fetch detailed profile from the student dashboard endpoint
        const detailsResponse = await dashboardApi.getStudentDashboard().catch(() => null);
        const details = (detailsResponse as any)?.data || (detailsResponse as any)?.student || (detailsResponse as any)?.user || detailsResponse;
        
        let profilePic = user.profilePictureUrl || user.image || user.imageUrl || null;
        if (user.role === 'student' && !profilePic) {
          const sDash = typeof window !== 'undefined' ? (window as any).debug_sDash || {} : {};
          profilePic = sDash.studentImage || null;
        }

        const mergedInfo = { 
          ...user, 
          ...(user.student || {}), 
          ...(details || {}), 
          ...((details as any)?.student || {}),
          _rawDetails: detailsResponse,
          profilePictureUrl: profilePic || (details as any)?.profilePictureUrl || (details as any)?.student?.profilePictureUrl || null,
          admissionNumber: user.admissionNumber || (details as any)?.admissionNumber || (user.email ? user.email.split('@')[0].toUpperCase() : ""),
          className: user.className || user.formClass || (details as any)?.className || "",
          gender: user.gender || (details as any)?.gender || "",
          dateOfBirth: user.dateOfBirth || (details as any)?.dateOfBirth || null
        };
        setStudentInfo(mergedInfo);
      } catch (err) {
        setError("Failed to load user info");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInfo();
  }, []);

  if (isLoading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (error) return <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4"><AlertCircle className="h-10 w-10 text-red-500" /><p className="text-red-500 font-bold">{error}</p></div>;

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'academics', label: 'Academics', icon: BookOpen },
    { id: 'finance', label: 'Finance & Receipts', icon: CreditCard },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-12">
      {/* TEMP DEBUG BOX */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-black text-green-400 p-4 rounded-xl text-xs overflow-auto max-h-64">
          <p className="text-white mb-2 font-bold">RAW DASHBOARD DATA (Please show AI):</p>
          <pre>{JSON.stringify(studentInfo?._rawDetails || "No raw details", null, 2)}</pre>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="relative rounded-[2rem] bg-[#053d26] text-white p-8 sm:p-10 overflow-hidden shadow-lg border border-[#042c1b]">
        <div className="absolute right-0 top-0 opacity-10 translate-x-12 -translate-y-12">
          <GraduationCap className="w-64 h-64" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="bg-[#b05e1c] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Student Portal
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">Welcome, {studentInfo?.fullName || studentInfo?.name}</h1>
            <p className="text-sm text-green-100 max-w-xl">
              Manage your academic profile, view term results, track fee payments, and access important messages from the school.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
            <div className="h-12 w-12 rounded-full bg-[#b05e1c] text-white font-bold flex items-center justify-center text-lg shadow-inner overflow-hidden border-2 border-white/20">
              {studentInfo?.profilePictureUrl ? (
                <img src={studentInfo.profilePictureUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User className="h-6 w-6" />
              )}
            </div>
            <div>
              <p className="font-bold text-sm">{studentInfo?.fullName || studentInfo?.name}</p>
              <p className="text-xs text-green-200">{studentInfo?.admissionNumber || studentInfo?.studentId || 'Student'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2 border-b border-gray-100">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#053d26] text-white shadow-md'
                  : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="mt-6 min-h-[400px]">
        {activeTab === 'profile' && <StudentProfile studentInfo={studentInfo} />}
        {activeTab === 'academics' && <StudentAcademics studentInfo={studentInfo} />}
        {activeTab === 'finance' && <StudentFinance studentInfo={studentInfo} />}
        {activeTab === 'attendance' && <StudentAttendance studentInfo={studentInfo} />}
        {activeTab === 'messages' && <StudentMessages studentInfo={studentInfo} />}
      </div>
    </div>
  );
}
