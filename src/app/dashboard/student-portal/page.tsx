"use client";

import { useState, useEffect } from "react";
import { User, BookOpen, Clock, CreditCard, MessageSquare, GraduationCap, Loader2, AlertCircle } from "lucide-react";

import StudentProfile from "@/components/student-portal/StudentProfile";
import StudentAcademics from "@/components/student-portal/StudentAcademics";
import StudentFinance from "@/components/student-portal/StudentFinance";
import StudentAttendance from "@/components/student-portal/StudentAttendance";
import StudentMessages from "@/components/student-portal/StudentMessages";
import { studentApi, dashboardApi, announcementApi } from "@/lib/api";

export default function StudentPortal() {
  const [activeTab, setActiveTab] = useState('profile');
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNewMessages, setHasNewMessages] = useState(false);

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
        
        // Fetch announcements to check for new messages
        const msgs = await announcementApi.getAll().catch(() => []);
        if (msgs && msgs.length > 0) {
          setHasNewMessages(true);
        }
        
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
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-700 pb-12">
      {/* Welcome Banner */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#053d26] via-[#065c3a] to-[#042416] text-white p-8 sm:p-12 overflow-hidden shadow-[0_20px_50px_rgba(5,61,38,0.25)] border border-white/10 group">
        {/* Dynamic Background Glows */}
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-[40rem] h-[40rem] bg-[#b05e1c]/20 rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-700 mix-blend-screen" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[30rem] h-[30rem] bg-emerald-500/20 rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-700 mix-blend-screen" />
        
        {/* Background Icon */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.07] transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-700 pointer-events-none">
          <GraduationCap className="w-80 h-80" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-50">
                Student Portal
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight drop-shadow-sm">
              Welcome back, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-200">
                {studentInfo?.fullName?.split(' ')[0] || studentInfo?.name?.split(' ')[0] || 'Student'}
              </span>
            </h1>
            <p className="text-emerald-100/90 text-lg leading-relaxed max-w-xl font-medium">
              Your academic hub is ready. View your latest results, track fee payments, and stay updated with school announcements.
            </p>
          </div>

          <div className="flex items-center gap-5 shrink-0 bg-white/10 backdrop-blur-xl px-6 py-5 rounded-[2rem] border border-white/20 shadow-2xl transform hover:scale-105 transition-transform duration-500 group/card">
            <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-[#b05e1c] to-[#8a4a16] text-white font-bold flex items-center justify-center text-xl shadow-inner overflow-hidden border border-white/30 group-hover/card:shadow-[0_0_20px_rgba(176,94,28,0.4)] transition-shadow duration-500">
              {studentInfo?.profilePictureUrl ? (
                <img src={studentInfo.profilePictureUrl} alt="Profile" className="h-full w-full object-cover transform group-hover/card:scale-110 transition-transform duration-500" />
              ) : (
                <User className="h-8 w-8" />
              )}
            </div>
            <div>
              <p className="font-bold text-lg text-white drop-shadow-sm">{studentInfo?.fullName || studentInfo?.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-black/20 text-emerald-200">
                  {studentInfo?.className || 'Student'}
                </span>
                <span className="text-sm font-medium text-emerald-200/80">
                  {studentInfo?.admissionNumber || studentInfo?.studentId}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="relative mx-auto w-full overflow-hidden">
        <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1.5 bg-white/60 backdrop-blur-xl rounded-2xl border border-gray-200/60 shadow-sm w-max max-w-full relative z-10">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'messages') setHasNewMessages(false);
                }}
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 relative group ${
                  isActive
                    ? 'text-[#053d26]'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] ring-1 ring-black/5 -z-10" />
                )}
                <div className="relative">
                  <tab.icon className={`w-4 h-4 transition-colors duration-300 ${isActive ? 'text-[#b05e1c]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  {tab.id === 'messages' && hasNewMessages && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                  )}
                </div>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-8 min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'profile' && <StudentProfile studentInfo={studentInfo} />}
        {activeTab === 'academics' && <StudentAcademics studentInfo={studentInfo} />}
        {activeTab === 'finance' && <StudentFinance studentInfo={studentInfo} />}
        {activeTab === 'attendance' && <StudentAttendance studentInfo={studentInfo} />}
        {activeTab === 'messages' && <StudentMessages studentInfo={studentInfo} />}
      </div>
    </div>
  );
}
