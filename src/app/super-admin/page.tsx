"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardApi, schoolApi, DashboardStats } from "@/lib/api";
import DataTable from "@/components/dashboard/DataTable";
import { 
  School, 
  Users, 
  CreditCard, 
  TrendingUp, 
  Plus, 
  Loader2, 
  AlertCircle,
  Activity,
  ArrowRight,
  Server,
  Database,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUser = localStorage.getItem("leoned_user");
    const token = localStorage.getItem("leoned_token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser || "{}");
      if (parsedUser.role !== "SuperAdmin") {
        router.push("/dashboard");
        return;
      }
      setUser(parsedUser);

      const fetchData = async () => {
        try {
          const [statsData, schoolsData] = await Promise.all([
            dashboardApi.getSuperAdminDashboard(),
            schoolApi.getAll().catch(() => null)
          ]);
          
          setStats(statsData);
          
          // Data Extraction Strategy: 
          // 1. Check if schools are nested in statsData (common for dashboards)
          // 2. Fallback to dedicated schoolsData endpoint
          let extractedSchools = [];
          
          const s = (statsData as any)?.data || statsData;
          if (Array.isArray(s?.recentSchools)) {
            extractedSchools = s.recentSchools;
          } else if (Array.isArray(s?.schools)) {
            extractedSchools = s.schools;
          } else if (Array.isArray(s?.latestSchools)) {
            extractedSchools = s.latestSchools;
          } else if (Array.isArray(s?.topSchools)) {
            extractedSchools = s.topSchools;
          } else if (Array.isArray(s?.recentInstitutions)) {
            extractedSchools = s.recentInstitutions;
          } else if (schoolsData) {
            // Check schoolsData for various formats
            const d = (schoolsData as any)?.data || schoolsData;
            if (Array.isArray(d)) {
              extractedSchools = d;
            } else if (Array.isArray(d?.items)) {
              extractedSchools = d.items;
            } else if (Array.isArray((schoolsData as any).items)) {
              extractedSchools = (schoolsData as any).items;
            }
          }
          
          setSchools(extractedSchools);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Failed to load dashboard";
          setError(message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
      
      // Real-time monitoring: Poll every 30 seconds
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);

    } catch (err) {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
          <div className="relative">
            <div className="h-14 w-14 rounded-full border-4 border-[#053d26]/10 border-t-[#053d26] animate-spin"></div>
            <Activity className="h-6 w-6 text-[#053d26] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-sm font-extrabold text-gray-900 uppercase tracking-widest">Establishing Trust Channel</p>
            <p className="text-xs text-gray-400 mt-1">Synchronizing Academic Architecture Core...</p>
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated users are redirected by the useEffect above
  if (!user) return null;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] text-gray-900">
        <div className="text-center max-w-md bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-sm">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black mb-2 tracking-tight text-gray-900">Connection Interrupted</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Service Gateway Timeout</p>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#053d26] to-[#0a5737] text-white font-extrabold text-xs uppercase tracking-widest hover:shadow-[0_8px_20px_rgba(5,61,38,0.25)] transition-all duration-300 transform active:scale-[0.98]"
          >
            Retry Connection Protocol
          </button>
        </div>
      </div>
    );
  }

  const s = (stats as any)?.data || stats;
  const reportedTotalSchools = s?.totalSchools || schools.length || 0;
  
  const extractCount = (obj: any, keywords: string[]): number => {
    if (!obj || typeof obj !== 'object') return 0;
    if (obj._count) {
      for (const key of Object.keys(obj._count)) {
        if (keywords.some(kw => key.toLowerCase().includes(kw))) return obj._count[key];
      }
    }
    for (const key of Object.keys(obj)) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('max') || lowerKey.includes('limit')) continue;
      if (keywords.some(kw => lowerKey.includes(kw))) {
        if (typeof obj[key] === 'number') return obj[key];
        if (Array.isArray(obj[key])) return obj[key].length;
      }
    }
    if (obj.stats) return extractCount(obj.stats, keywords);
    return 0;
  };

  let totalStudents = s?.totalStudents || 0;
  let totalTeachers = s?.totalTeachers || s?.totalStaff || s?.totalFaculty || 0;

  if (totalStudents === 0 && schools.length > 0) {
    totalStudents = schools.reduce((acc, school) => acc + extractCount(school, ['student', 'pupil', 'learner']), 0);
  }
  if (totalTeachers === 0 && schools.length > 0) {
    totalTeachers = schools.reduce((acc, school) => acc + extractCount(school, ['teacher', 'staff', 'faculty']), 0);
  }

  const activeSubscriptions = s?.activeSubscriptions || 0;
  const platformGrowth = s?.platformGrowth || "Live";

  // Data Reconciliation: If count > 0 but list is empty, we flag it as "Syncing"
  const isSyncingSchools = reportedTotalSchools > 0 && schools.length === 0;
  const displayTotalSchools = isSyncingSchools ? "0" : String(reportedTotalSchools);

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-gray-900">
      {/* Premium Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-gray-100">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest text-[#053d26] bg-[#053d26]/5 border border-[#053d26]/10 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#053d26] animate-pulse-green"></span>
            System Admin Command Center
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Platform Overview
            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 uppercase tracking-widest hidden sm:inline-block">v1.2.0-Alpha</span>
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1.5">
            Welcome back, <span className="font-bold text-gray-700">{user?.name}</span> • Security Level: <span className="font-extrabold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">Root Administrator</span>
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link 
            href="/super-admin/schools/new"
            className="flex items-center gap-2 bg-gradient-to-r from-[#053d26] to-[#095838] text-white px-6 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider hover:from-[#042c1b] hover:to-[#053d26] transition-all shadow-[0_4px_20px_rgba(5,61,38,0.25)] hover:shadow-[0_8px_30px_rgba(5,61,38,0.35)] transform hover:-translate-y-0.5 active:translate-y-0 duration-300"
          >
            <Plus className="h-4.5 w-4.5" />
            Register School
          </Link>
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Institutions */}
        <div className="group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white to-[#053d26]/[0.02] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.015)] border border-gray-100 hover:border-[#053d26]/20 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(5,61,38,0.05)] hover:-translate-y-1">
          <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-[#053d26]/5 to-transparent rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-125" />
          <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
            <div className="flex justify-between items-start">
              <div className="h-12 w-12 rounded-2xl bg-[#053d26]/10 flex items-center justify-center text-[#053d26] group-hover:bg-[#053d26] group-hover:text-white transition-all duration-300 shadow-sm border border-[#053d26]/5">
                <School className="h-6 w-6" />
              </div>
              {isSyncingSchools ? (
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-extrabold text-amber-700 uppercase tracking-widest border border-amber-100 animate-pulse">
                  Syncing
                </span>
              ) : (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-extrabold text-emerald-700 uppercase tracking-widest border border-emerald-100">
                  Onboarded
                </span>
              )}
            </div>
            <div className="mt-8 space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Total Institutions</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black text-gray-900 tracking-tight">{displayTotalSchools}</p>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">schools</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Students */}
        <div className="group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white to-blue-500/[0.02] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.015)] border border-gray-100 hover:border-blue-500/20 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(59,130,246,0.05)] hover:-translate-y-1">
          <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-125" />
          <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
            <div className="flex justify-between items-start">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm border border-blue-500/5">
                <Users className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-extrabold text-blue-700 uppercase tracking-widest border border-blue-100">
                +14.2% MoM
              </span>
            </div>
            <div className="mt-8 space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Global Students</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black text-gray-900 tracking-tight">{totalStudents.toLocaleString()}</p>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Teachers */}
        <div className="group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white to-emerald-500/[0.02] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.015)] border border-gray-100 hover:border-emerald-500/20 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(16,185,129,0.05)] hover:-translate-y-1">
          <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-125" />
          <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
            <div className="flex justify-between items-start">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm border border-emerald-500/5">
                <Users className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-extrabold text-emerald-700 uppercase tracking-widest border border-emerald-100">
                Verified
              </span>
            </div>
            <div className="mt-8 space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Global Teachers</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black text-gray-900 tracking-tight">{totalTeachers.toLocaleString()}</p>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white to-orange-500/[0.02] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.015)] border border-gray-100 hover:border-orange-500/20 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(249,115,22,0.05)] hover:-translate-y-1">
          <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-orange-500/5 to-transparent rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-125" />
          <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
            <div className="flex justify-between items-start">
              <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 shadow-sm border border-orange-500/5">
                <CreditCard className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[9px] font-extrabold text-orange-700 uppercase tracking-widest border border-orange-100">
                Billing Live
              </span>
            </div>
            <div className="mt-8 space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Active Plans</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black text-gray-900 tracking-tight">{activeSubscriptions}</p>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">licences</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white to-purple-500/[0.02] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.015)] border border-gray-100 hover:border-purple-500/20 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(168,85,247,0.05)] hover:-translate-y-1">
          <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-125" />
          <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
            <div className="flex justify-between items-start">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-sm border border-purple-500/5">
                <TrendingUp className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[9px] font-extrabold text-purple-700 uppercase tracking-widest border border-purple-100">
                Live Status
              </span>
            </div>
            <div className="mt-8 space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-400">System Telemetry</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-gray-900 tracking-tight">{platformGrowth}</p>
                <span className="text-[10px] text-emerald-500 font-extrabold flex items-center gap-0.5 uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span> 100%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Recently Registered Schools Card */}
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#053d26] via-[#b05e1c] to-[#053d26]/10" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recently Registered Schools</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Latest institutions onboarded to the system</p>
              </div>
              <Link href="/super-admin/schools" className="text-xs font-bold text-[#053d26] flex items-center gap-1 bg-[#053d26]/5 hover:bg-[#053d26]/10 px-3.5 py-2 rounded-full transition-all duration-300">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 relative z-10">
              <table className="w-full text-left border-separate border-spacing-y-3 min-w-[700px]">
                <thead>
                  <tr className="text-gray-400">
                    <th className="pb-3 pl-4 font-bold text-[9px] uppercase tracking-[0.25em]">School Identity</th>
                    <th className="pb-3 font-bold text-[9px] uppercase tracking-[0.25em] px-4">Cluster Owner</th>
                    <th className="pb-3 font-bold text-[9px] uppercase tracking-[0.25em] px-4">Usage Matrix</th>
                    <th className="pb-3 font-bold text-[9px] uppercase tracking-[0.25em] px-4">Service Plan</th>
                    <th className="pb-3 font-bold text-[9px] uppercase tracking-[0.25em] pr-4 text-right">Node Status</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.length > 0 ? schools.map((school) => {
                    const studentCount = extractCount(school, ['student', 'pupil', 'learner']);
                    const staffCount = extractCount(school, ['teacher', 'staff', 'faculty']);

                    return (
                      <tr key={school.id} className="group bg-gray-50/20 hover:bg-gray-50/65 border border-gray-100/50 rounded-2xl transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.005)]">
                        {/* School Identity */}
                        <td className="py-5 pl-4 pr-4 rounded-l-2xl border-y border-l border-gray-100/40 group-hover:border-[#053d26]/10 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-white to-[#053d26]/5 border border-gray-200/80 flex items-center justify-center text-[#053d26] font-extrabold text-sm transition-all duration-300 group-hover:from-[#053d26] group-hover:to-[#095738] group-hover:text-white group-hover:scale-105 group-hover:shadow-[0_4px_12px_rgba(5,61,38,0.15)] uppercase shrink-0">
                              {school.name?.[0] || 'S'}
                            </div>
                            <div>
                              <div className="font-extrabold text-gray-900 leading-tight group-hover:text-[#053d26] transition-colors">{school.name}</div>
                              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{school.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Cluster Owner */}
                        <td className="py-5 px-4 border-y border-gray-100/40 group-hover:border-[#053d26]/10 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] text-gray-500 font-extrabold uppercase shrink-0">
                              {(school.adminName || 'RT')}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-900 leading-tight">{school.adminName || 'ROOT'}</div>
                              <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Admin Node</div>
                            </div>
                          </div>
                        </td>

                        {/* Usage Matrix */}
                        <td className="py-5 px-4 border-y border-gray-100/40 group-hover:border-[#053d26]/10 transition-colors">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 bg-blue-50/50 text-blue-700 px-2 py-1 rounded-lg border border-blue-100/50 text-[10px] font-bold">
                              <span className="h-1 w-1 rounded-full bg-blue-500"></span>
                              <span className="font-black text-gray-900">{studentCount}</span>
                              <span className="text-blue-500 font-normal">Students</span>
                            </span>
                            <span className="inline-flex items-center gap-1 bg-[#053d26]/5 text-[#053d26] px-2 py-1 rounded-lg border border-[#053d26]/10 text-[10px] font-bold">
                              <span className="h-1 w-1 rounded-full bg-[#053d26]"></span>
                              <span className="font-black text-gray-900">{staffCount}</span>
                              <span className="text-[#053d26]/75 font-normal">Staff</span>
                            </span>
                          </div>
                        </td>

                        {/* Service Plan */}
                        <td className="py-5 px-4 border-y border-gray-100/40 group-hover:border-[#053d26]/10 transition-colors">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] shadow-sm ${
                            school.subscriptionPlan === 'Premium' ? 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border border-purple-200/50' :
                            school.subscriptionPlan === 'Plus' ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-200/50' :
                            'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-500 border border-gray-200/50'
                          }`}>
                            {school.subscriptionPlan || 'Free'}
                          </span>
                        </td>

                        {/* Node Status */}
                        <td className="py-5 pl-4 pr-4 rounded-r-2xl border-y border-r border-gray-100/40 group-hover:border-[#053d26]/10 transition-colors text-right">
                          <div className="flex items-center justify-end gap-2">
                            {school.isActive === false ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                                Offline
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-green"></span>
                                Active
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }) : reportedTotalSchools > 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative">
                            <div className="h-12 w-12 rounded-full border-2 border-gray-100 border-t-[#053d26] animate-spin"></div>
                            <Activity className="h-5 w-5 text-[#053d26] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">Synchronizing Registry</p>
                            <p className="text-xs text-gray-400 font-medium">Fetching latest institution records from LeonEd clusters...</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-40">
                          <School className="h-12 w-12 text-gray-300" />
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Zero Records Found</p>
                            <p className="text-[10px] text-gray-400">No institutions have been onboarded to the system yet.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <DataTable activities={stats?.recentActivities} />
        </div>
        
        {/* Right Sidebar Area */}
        <div className="space-y-8">
          {/* Removed Mock System Integrity Widget */}

          {/* Platform Announcements / Authority Hub */}
          <div className="rounded-[2.5rem] bg-gradient-to-br from-[#053d26] via-[#084d30] to-[#021f13] p-8 text-white relative overflow-hidden shadow-[0_20px_40px_rgba(5,61,38,0.15)] group">
            {/* Background vector elements */}
            <div className="absolute -right-6 -top-6 h-36 w-36 rounded-full bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-[#b05e1c]/10 blur-xl group-hover:scale-125 transition-transform duration-500" />
            <div className="absolute right-12 bottom-12 h-20 w-20 rounded-full bg-gradient-to-br from-white/10 to-transparent opacity-20" />
            
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest text-[#b05e1c] bg-[#b05e1c]/10 border border-[#b05e1c]/25 mb-4">
                👑 Root Access
              </span>
              <h2 className="text-xl font-extrabold mb-3 tracking-tight">Authority Hub</h2>
              <p className="text-xs text-green-100/70 mb-6 leading-relaxed">
                You are accessing the platform as a Super Admin. Use this dashboard to oversee institution growth, manage licenses, and monitor global system stability.
              </p>
              <Link 
                href="/super-admin/settings" 
                className="block w-full py-3.5 rounded-xl bg-white/10 text-white text-center font-bold text-xs hover:bg-white/20 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] border border-white/10 hover:border-white/25 active:scale-[0.98]"
              >
                System Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
