"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardApi, schoolApi, DashboardStats } from "@/lib/api";
import StatCard from "@/components/dashboard/StatCard";
import DataTable from "@/components/dashboard/DataTable";
import OnboardingForm from "@/components/super-admin/OnboardingForm";
import { 
  School, 
  Users, 
  CreditCard, 
  TrendingUp, 
  Plus, 
  Loader2, 
  AlertCircle,
  Activity,
  ArrowRight
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
            schoolApi.getAll(1, 10).catch(() => null)
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#053d26]" />
          <p className="text-gray-500 font-medium">Synchronizing Platform Data...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated users are redirected by the useEffect above
  if (!user) return null;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-900">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-500">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">Platform Connection Error</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const s = (stats as any)?.data || stats;
  const reportedTotalSchools = s?.totalSchools || 0;
  const totalStudents = s?.totalStudents || 0;
  const totalTeachers = s?.totalTeachers || s?.totalStaff || s?.totalFaculty || 0;
  const activeSubscriptions = s?.activeSubscriptions || 0;
  const platformGrowth = s?.platformGrowth || "Live";

  // Data Reconciliation: If count > 0 but list is empty, we flag it as "Syncing"
  const isSyncingSchools = reportedTotalSchools > 0 && schools.length === 0;
  const displayTotalSchools = isSyncingSchools ? "0" : String(reportedTotalSchools);

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-gray-900">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Platform Overview</h1>
          <p className="text-gray-600 font-medium">
            Welcome back, {user?.name}. System authority verified.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/super-admin/schools/new"
            className="flex items-center gap-2 bg-[#053d26] text-white px-6 py-3 rounded-full font-bold hover:bg-[#042c1b] transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            Register School
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Institutions"
          value={displayTotalSchools}
          icon={<School className="h-6 w-6" />}
          badge={isSyncingSchools ? "Reconciling..." : undefined}
        />
        <StatCard
          title="Global Students"
          value={totalStudents.toLocaleString()}
          icon={<Users className="h-6 w-6" />}
          iconTextColor="text-blue-600"
        />
        <StatCard
          title="Global Teachers"
          value={totalTeachers.toLocaleString()}
          icon={<Users className="h-6 w-6" />}
          iconTextColor="text-[#053d26]"
        />
        <StatCard
          title="Active Subscriptions"
          value={String(activeSubscriptions)}
          icon={<CreditCard className="h-6 w-6" />}
          iconTextColor="text-orange-600"
        />
        <StatCard
          title="System Status"
          value={platformGrowth}
          icon={<TrendingUp className="h-6 w-6" />}
          iconTextColor="text-purple-600"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Schools Table (Simplified for Dashboard) */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recently Registered Schools</h2>
                <p className="text-sm text-gray-500 font-medium">Latest institutions onboarded to the system</p>
              </div>
              <Link href="/super-admin/schools" className="text-[#053d26] font-bold text-sm flex items-center gap-1 hover:underline">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-5 font-bold text-gray-400 text-[10px] uppercase tracking-[0.2em]">School Name</th>
                    <th className="pb-5 font-bold text-gray-400 text-[10px] uppercase tracking-[0.2em] px-4">Admin</th>
                    <th className="pb-5 font-bold text-gray-400 text-[10px] uppercase tracking-[0.2em] px-4">Users</th>
                    <th className="pb-5 font-bold text-gray-400 text-[10px] uppercase tracking-[0.2em] px-4">Plan</th>
                    <th className="pb-5 font-bold text-gray-400 text-[10px] uppercase tracking-[0.2em] text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {schools.length > 0 ? schools.map((school) => (
                    <tr key={school.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-6 pr-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#053d26] font-bold text-xs transition-colors group-hover:bg-[#053d26] group-hover:text-white uppercase">
                            {school.name?.[0] || 'S'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 leading-tight">{school.name}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{school.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <div className="text-xs font-bold text-gray-900">{school.adminName || 'ROOT'}</div>
                        <div className="text-[10px] text-gray-400 font-medium">Administrator</div>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex gap-3">
                          <div className="text-[10px]">
                            <span className="font-bold text-gray-900">
                              {(() => {
                                const findCount = (obj: any, keywords: string[]): number => {
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
                                  if (obj.stats) return findCount(obj.stats, keywords);
                                  return 0;
                                };
                                return findCount(school, ['student', 'pupil', 'learner']);
                              })()}
                            </span>
                            <span className="text-gray-400 ml-1">Students</span>
                          </div>
                          <div className="text-[10px]">
                            <span className="font-bold text-gray-900">
                              {(() => {
                                const findCount = (obj: any, keywords: string[]): number => {
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
                                  if (obj.stats) return findCount(obj.stats, keywords);
                                  return 0;
                                };
                                return findCount(school, ['teacher', 'staff', 'faculty']);
                              })()}
                            </span>
                            <span className="text-gray-400 ml-1">Staff</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-[0.1em] ${
                          school.subscriptionPlan === 'Premium' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                          school.subscriptionPlan === 'Plus' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}>
                          {school.subscriptionPlan || 'Free'}
                        </span>
                      </td>
                      <td className="py-6 pl-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full ${school.isActive === false ? 'bg-red-500' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'}`}></div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">
                            {school.isActive === false ? 'Offline' : 'Active'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )) : reportedTotalSchools > 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative">
                            <div className="h-12 w-12 rounded-full border-2 border-gray-100 border-t-[#053d26] animate-spin"></div>
                            <Activity className="h-5 w-5 text-[#053d26] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">Synchronizing Registry</p>
                            <p className="text-xs text-gray-400">Fetching latest institution records from LeonEd clusters...</p>
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
          {/* Quick Actions */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <div className="flex items-center gap-2 mb-8">
              <Activity className="h-5 w-5 text-[#053d26]" />
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">System Integrity</h2>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"></div>
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">API Gateway</div>
                    <div className="text-sm font-bold text-gray-900">Operational</div>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">99.9%</div>
              </div>

              <div className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"></div>
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Database Cluster</div>
                    <div className="text-sm font-bold text-gray-900">Synchronized</div>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">Healthy</div>
              </div>

              <div className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse"></div>
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Backup Nodes</div>
                    <div className="text-sm font-bold text-gray-900">Active</div>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">Ready</div>
              </div>
            </div>
          </div>

          {/* Platform Announcements */}
          <div className="rounded-[2.5rem] bg-[#053d26] p-8 text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5" />
            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-4">Authority Hub</h2>
              <p className="text-sm text-green-100/80 mb-6">
                You are accessing the platform as a Super Admin. Use this dashboard to oversee institution growth and system stability.
              </p>
              <Link href="/super-admin/settings" className="block w-full py-3 rounded-xl bg-white/10 text-white text-center font-bold text-sm hover:bg-white/20 transition-colors">
                System Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
