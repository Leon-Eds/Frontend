"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardApi, schoolApi, paymentApi, DashboardStats } from "@/lib/api";
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
  ShieldAlert,
  GraduationCap,
  Briefcase
} from "lucide-react";
import Link from "next/link";

const getSeededGradient = (name: string) => {
  const gradients = [
    { from: 'from-emerald-500', to: 'to-teal-600', text: 'text-emerald-50' },
    { from: 'from-blue-500', to: 'to-indigo-600', text: 'text-blue-50' },
    { from: 'from-purple-500', to: 'to-fuchsia-600', text: 'text-purple-50' },
    { from: 'from-amber-500', to: 'to-orange-600', text: 'text-amber-50' },
    { from: 'from-rose-500', to: 'to-pink-600', text: 'text-rose-50' },
    { from: 'from-cyan-500', to: 'to-blue-600', text: 'text-cyan-50' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
          const [statsData, schoolsData, plansData, subscriptionData] = await Promise.all([
            dashboardApi.getSuperAdminDashboard(),
            schoolApi.getAll().catch(() => null),
            schoolApi.getPlans().catch(() => []),
            paymentApi.getSubscriptionOverview().catch(() => null)
          ]);
          let allLocalActivities: any[] = [];
          if (typeof window !== 'undefined') {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('leoned_local_activities_')) {
                try {
                  const acts = JSON.parse(localStorage.getItem(key) || '[]');
                  allLocalActivities = [...allLocalActivities, ...acts];
                } catch(e) {}
              }
            }
          }
          
          const sObj = (statsData as any)?.data || statsData || {};
          const apiActivities = sObj.recentActivities || [];
          
          const combinedActivities = [...allLocalActivities, ...apiActivities].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

          setStats({
            ...(statsData as any),
            recentActivities: combinedActivities
          });
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
          const fetchedPlans = (plansData as any)?.data || plansData || [];
          setPlans(fetchedPlans);
          setOverviewData((subscriptionData as any)?.data || subscriptionData || null);
          
          // Enrich schools with detail data (for currentTeacherCount, currentStudentCount)
          if (extractedSchools.length > 0) {
            const enriched = await Promise.all(
              extractedSchools.map(async (school: any) => {
                const id = school.id || school._id;
                if (!id) return school;
                try {
                  const detail = await schoolApi.getById(id);
                  const d = (detail as any)?.data || detail;
                  return { ...school, ...d };
                } catch {
                  return school;
                }
              })
            );
            setSchools(enriched);
          }
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
    totalStudents = schools.reduce((acc, school) => {
      return acc + Number(school.currentStudentCount || 0) + extractCount(school, ['student', 'pupil', 'learner']);
    }, 0);
  }
  if (totalTeachers === 0 && schools.length > 0) {
    totalTeachers = schools.reduce((acc, school) => {
      return acc + Number(school.currentTeacherCount || 0) + extractCount(school, ['teacher', 'staff', 'faculty']);
    }, 0);
  }

  let computedActiveSubs = 0;
  let computedTotalRev = 0;
  schools.forEach(sch => {
    if (sch.isActive !== false) {
      const planName = sch.subscriptionPlan || "Free";
      const plan = plans.find((p: any) => p.name === planName);
      if (plan && plan.name !== "Free") {
        computedActiveSubs++;
        computedTotalRev += Number(plan.amount ?? plan.price ?? 0);
      }
    }
  });

  const activeSubscriptions = overviewData?.totalSubscribers ?? computedActiveSubs; 
  const totalRevenue = overviewData?.totalRevenue ?? computedTotalRev; 
  const platformGrowth = s?.platformGrowth || "Live";

  // Data Reconciliation: If count > 0 but list is empty, we flag it as "Syncing"
  const isSyncingSchools = reportedTotalSchools > 0 && schools.length === 0;
  const displayTotalSchools = isSyncingSchools ? "0" : String(reportedTotalSchools);

  const planCounts = schools.reduce((acc: any, school: any) => {
    const plan = school.subscriptionPlan || 'Free';
    acc[plan] = (acc[plan] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="relative min-h-[80vh] w-full text-gray-900 pb-12">
      {/* Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#053d26]/[0.03] rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-[#b05e1c]/[0.03] rounded-full blur-[120px]" />

      <div className="relative z-10 space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Command Center Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200/50">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#053d26]/5 border border-[#053d26]/10 mb-4 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#053d26] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#053d26]"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#053d26]">Root Command Center</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight flex items-center gap-4">
              Platform Overview
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-3 flex items-center gap-2">
              Welcome back, <span className="font-extrabold text-gray-800">{user?.name}</span> 
              <span className="text-gray-300">•</span>
              <span className="inline-flex items-center gap-1.5 font-extrabold text-rose-700 bg-rose-50 border border-rose-100/50 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider shadow-sm">
                <ShieldAlert className="h-3 w-3" />
                Root Administrator
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link 
              href="/super-admin/schools/new"
              className="group relative flex items-center gap-2 bg-gradient-to-br from-[#053d26] to-[#042c1b] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.1em] overflow-hidden transition-all duration-300 shadow-[0_8px_30px_rgba(5,61,38,0.25)] hover:shadow-[0_12px_40px_rgba(5,61,38,0.4)] hover:-translate-y-0.5 active:translate-y-0"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <Plus className="h-5 w-5 relative z-10" />
              <span className="relative z-10">Register School</span>
            </Link>
          </div>
        </div>

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {/* Hero Stat: Total Institutions (Spans 2 cols, 2 rows logically if we wanted, but we'll do 2 cols) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#053d26] to-[#031d12] p-8 shadow-[0_20px_50px_rgba(5,61,38,0.2)] transition-all duration-500 hover:shadow-[0_25px_60px_rgba(5,61,38,0.3)] hover:-translate-y-1">
            <div className="absolute top-0 right-0 h-64 w-64 bg-white/5 rounded-full -mr-24 -mt-24 transition-transform duration-700 group-hover:scale-150 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="relative z-10 flex flex-col h-full justify-between min-h-[180px]">
              <div className="flex justify-between items-start">
                <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-inner group-hover:bg-white/20 transition-all duration-300">
                  <School className="h-7 w-7" />
                </div>
                {isSyncingSchools ? (
                  <span className="rounded-full bg-amber-500/20 px-3 py-1.5 text-[10px] font-black text-amber-200 uppercase tracking-widest border border-amber-500/30 animate-pulse backdrop-blur-md">
                    Syncing
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1.5 text-[10px] font-black text-emerald-200 uppercase tracking-widest border border-emerald-500/30 backdrop-blur-md">
                    Network Online
                  </span>
                )}
              </div>
              <div className="mt-8">
                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#053d26] mb-2 bg-emerald-400 inline-block px-2 py-0.5 rounded-md">Total Institutions</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-6xl font-black text-white tracking-tighter drop-shadow-lg">{displayTotalSchools}</p>
                  <span className="text-xs text-emerald-200/80 font-bold uppercase tracking-widest">onboarded</span>
                </div>
              </div>
            </div>
          </div>

          {/* Regular Stats */}
          {[
            { label: "Total Students", value: totalStudents.toLocaleString(), unit: "learners", icon: Briefcase, color: "emerald", trend: "Growth" },
            { label: "Total Teachers", value: totalTeachers.toLocaleString(), unit: "staff", icon: CreditCard, color: "purple", trend: "Faculty" }
          ].map((stat, i) => (
            <div key={i} className={`lg:col-span-2 md:col-span-1 col-span-1 group relative overflow-hidden rounded-[2rem] bg-white/60 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-white/80 transition-all duration-300 hover:bg-white hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1`}>
              <div className={`absolute -right-10 -top-10 h-32 w-32 bg-${stat.color}-500/5 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-150 group-hover:bg-${stat.color}-500/10`} />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-6">
                  <div className={`h-12 w-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 border border-${stat.color}-100/50 group-hover:bg-${stat.color}-500 group-hover:text-white transition-colors duration-300 shadow-sm`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <span className={`rounded-full bg-${stat.color}-50 px-2 py-1 text-[9px] font-black text-${stat.color}-700 uppercase tracking-widest border border-${stat.color}-100/50`}>
                    {stat.trend}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-400 mb-1">{stat.label}</p>
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{stat.unit}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Table Section */}
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <Database className="h-6 w-6 text-[#b05e1c]" />
                Institution Registry
              </h2>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-1">Real-time cluster node monitoring</p>
            </div>
            <Link href="/super-admin/schools" className="group text-[11px] font-black uppercase tracking-widest text-[#053d26] flex items-center gap-2 bg-[#053d26]/5 hover:bg-[#053d26]/10 px-5 py-2.5 rounded-full transition-all duration-300 border border-[#053d26]/10">
              View Entire Registry
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-white/80 overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#053d26] via-[#b05e1c] to-purple-600" />
            
            <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
              <table className="w-full text-left border-separate border-spacing-y-4 min-w-[800px]">
                <thead>
                  <tr className="text-gray-400">
                    <th className="pb-2 pl-4 font-black text-[10px] uppercase tracking-[0.25em]">School Identity</th>
                    <th className="pb-2 font-black text-[10px] uppercase tracking-[0.25em] px-4">Cluster Owner</th>
                    <th className="pb-2 font-black text-[10px] uppercase tracking-[0.25em] px-4">Usage Matrix</th>
                    <th className="pb-2 font-black text-[10px] uppercase tracking-[0.25em] px-4">Service Plan</th>
                    <th className="pb-2 font-black text-[10px] uppercase tracking-[0.25em] pr-4 text-right">Node Status</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.length > 0 ? schools.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((school) => {
                    const studentCount = extractCount(school, ['student', 'pupil', 'learner']);
                    const staffCount = extractCount(school, ['teacher', 'staff', 'faculty']);
                    const schoolGrad = getSeededGradient(school.name || 'School');
                    const adminGrad = getSeededGradient(school.adminName || 'Admin');

                    return (
                      <tr key={school.id} className="group relative bg-white hover:bg-gray-50/80 transition-all duration-300 shadow-sm hover:shadow-md rounded-2xl">
                        {/* School Identity */}
                        <td className="py-4 pl-4 pr-4 rounded-l-2xl border-y border-l border-gray-100/50 group-hover:border-[#053d26]/20 transition-colors bg-clip-padding">
                          <div className="flex items-center gap-4">
                            <div className={`h-14 w-14 rounded-[1.25rem] bg-gradient-to-br ${schoolGrad.from} ${schoolGrad.to} flex items-center justify-center font-black text-white text-lg shadow-inner transition-transform duration-500 group-hover:scale-105 uppercase shrink-0`}>
                              {school.name?.[0] || 'S'}
                            </div>
                            <div>
                              <div className="font-black text-[15px] text-gray-900 leading-tight group-hover:text-[#053d26] transition-colors">{school.name}</div>
                              <span className="inline-flex px-2 py-0.5 mt-1.5 rounded bg-gray-100 text-[10px] font-bold text-gray-500 tracking-widest">{school.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Cluster Owner */}
                        <td className="py-4 px-4 border-y border-gray-100/50 group-hover:border-[#053d26]/20 transition-colors bg-clip-padding">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${adminGrad.from} ${adminGrad.to} flex items-center justify-center text-white text-[11px] font-black uppercase shrink-0 shadow-inner`}>
                              {(school.adminName || 'RT').split(" ").filter(Boolean).map((w: string) => w[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                              <div className="text-sm font-black text-gray-800 leading-tight">{school.adminName || 'ROOT'}</div>
                              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Admin Node</div>
                            </div>
                          </div>
                        </td>

                        {/* Usage Matrix */}
                        <td className="py-4 px-4 border-y border-gray-100/50 group-hover:border-[#053d26]/20 transition-colors bg-clip-padding">
                          <div className="flex flex-col gap-1.5">
                            <span className="inline-flex items-center gap-2 text-[11px] font-bold text-gray-700">
                              <GraduationCap className="h-4 w-4 text-blue-500" />
                              {studentCount} <span className="text-gray-400 font-medium">Students</span>
                            </span>
                            <span className="inline-flex items-center gap-2 text-[11px] font-bold text-gray-700">
                              <Briefcase className="h-4 w-4 text-emerald-500" />
                              {staffCount} <span className="text-gray-400 font-medium">Staff</span>
                            </span>
                          </div>
                        </td>

                        {/* Service Plan */}
                        <td className="py-4 px-4 border-y border-gray-100/50 group-hover:border-[#053d26]/20 transition-colors bg-clip-padding">
                          <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                            school.subscriptionPlan === 'Premium' ? 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border-purple-200' :
                            school.subscriptionPlan === 'Plus' ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200' :
                            'bg-gray-50 text-gray-600 border-gray-200'
                          }`}>
                            {school.subscriptionPlan || 'Free'}
                          </span>
                        </td>

                        {/* Node Status */}
                        <td className="py-4 pl-4 pr-6 rounded-r-2xl border-y border-r border-gray-100/50 group-hover:border-[#053d26]/20 transition-colors text-right bg-clip-padding">
                          <div className="flex items-center justify-end gap-5">
                            {school.isActive === false ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-rose-600">
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                                </span>
                                OFFLINE
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-600">
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                                ACTIVE
                              </span>
                            )}
                            <Link href={`/super-admin/schools?search=${encodeURIComponent(school.name || '')}`} className="h-9 w-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-[#053d26] group-hover:border-[#053d26] group-hover:shadow-[0_4px_12px_rgba(5,61,38,0.3)] transition-all duration-300">
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : reportedTotalSchools > 0 ? (
                    <tr>
                      <td colSpan={5} className="py-24 text-center bg-white/50 rounded-2xl">
                        <div className="flex flex-col items-center gap-5">
                          <div className="relative">
                            <div className="h-16 w-16 rounded-full border-4 border-gray-100 border-t-[#053d26] animate-spin"></div>
                            <Activity className="h-6 w-6 text-[#053d26] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-base font-black text-gray-900 tracking-tight">Synchronizing Registry</p>
                            <p className="text-xs text-gray-500 font-medium">Fetching node statuses from LeonEd clusters...</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-24 text-center bg-white/50 rounded-2xl">
                        <div className="flex flex-col items-center gap-4 opacity-40">
                          <School className="h-16 w-16 text-gray-400" />
                          <div className="space-y-1">
                            <p className="text-sm font-black text-gray-500 uppercase tracking-widest">Zero Records Found</p>
                            <p className="text-xs text-gray-400 font-medium">No institutions have been onboarded to the system yet.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            {schools.length > itemsPerPage && (
              <div className="flex items-center justify-between px-4 pt-6 mt-4 border-t border-gray-100/50">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  Page <span className="text-[#053d26]">{currentPage}</span> of <span className="text-[#053d26]">{Math.ceil(schools.length / itemsPerPage)}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-[10px] font-bold text-gray-600 uppercase tracking-widest disabled:opacity-50 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm active:scale-95"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(schools.length / itemsPerPage), p + 1))}
                    disabled={currentPage === Math.ceil(schools.length / itemsPerPage)}
                    className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-[10px] font-bold text-gray-600 uppercase tracking-widest disabled:opacity-50 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm active:scale-95"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8">
            <DataTable activities={stats?.recentActivities || s?.recentActivities} />
          </div>
        </div>
      </div>
    </div>
  );
}
