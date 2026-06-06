"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dashboardApi, DashboardStats } from "@/lib/api";
import StatCard from "@/components/dashboard/StatCard";
import DataTable from "@/components/dashboard/DataTable";
import SetupGuide from "@/components/dashboard/SetupGuide";
import { GraduationCap, Users, FileText, UserPlus, FileOutput, Plus, Loader2 } from "lucide-react";

export default function DashboardOverview() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
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
      setUser(parsedUser);

      // Redirect if user has Faculty/Teacher or Student role
      if (parsedUser.role === "Teacher" || parsedUser.role === "Faculty") {
        router.push("/dashboard/faculty");
        return;
      }
      if (parsedUser.role === "Student") {
        router.push("/dashboard/student-portal");
        return;
      }

      // 1. Fallback redirect if legacy demo role is set
      const demoRole = localStorage.getItem("leoned_demo_role");
      if (demoRole === "Faculty") {
        router.push("/dashboard/faculty");
        return;
      }
      if (demoRole === "Student") {
        router.push("/dashboard/student-portal");
        return;
      }

      const fetchDashboard = async () => {
        try {
          // Choose appropriate endpoint based on role
          const data = parsedUser.role === "SuperAdmin" 
            ? await dashboardApi.getSuperAdminDashboard()
            : await dashboardApi.getSchoolDashboard();
          
          setStats(data);
        } catch (err: unknown) {
          console.error("[Dashboard] Failed to fetch dashboard data.", err);
          setStats({});
        } finally {
          setIsLoading(false);
        }
      };

      fetchDashboard();
    } catch (err) {
      router.push("/login");
    }
  }, [router]);

  const userName = user?.name || "Admin";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#053d26]" />
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load dashboard</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Support nested data property and fallback field names
  const s = (stats as any)?.data || stats;
  const totalStudents = s?.totalStudents ?? s?.totalCount ?? 0;
  const totalTeachers = s?.totalTeachers ?? s?.totalFaculty ?? s?.facultyCount ?? 0;
  const pendingResults = s?.pendingResults ?? 0;
  const currentTerm = s?.currentTerm ?? "N/A";
  const currentSession = s?.currentSession ?? "";
  const termProgress = s?.termProgress ?? 0;
  const termLabel = currentTerm + (currentSession ? ` ${currentSession}` : "");

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">School Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {userName}. Here is your campus overview for the <span className="text-[#b05e1c] font-semibold">{termLabel}</span>.
        </p>
      </div>

      {/* Admin Setup Guide */}
      <SetupGuide />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={totalStudents.toLocaleString()}
          icon={<GraduationCap className="h-6 w-6" />}
        />
        <StatCard
          title="Total Teachers"
          value={totalTeachers.toLocaleString()}
          icon={<Users className="h-6 w-6" />}
          iconBgColor="bg-gray-100"
          iconTextColor="text-gray-600"
        />
        <StatCard
          title="Results Pending"
          value={String(pendingResults)}
          icon={<FileText className="h-6 w-6" />}
          iconBgColor="bg-orange-100"
          iconTextColor="text-orange-600"
        />
        {/* Active Term Card */}
        <div className="rounded-3xl bg-[#053d26] p-6 shadow-sm flex flex-col justify-between text-white relative overflow-hidden">
          {/* subtle decorative circles */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5" />
          <div className="absolute right-8 -bottom-8 h-32 w-32 rounded-full bg-white/5" />
          
          <div className="relative z-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-green-200 mb-4">
              Active Term
            </p>
            <p className="text-3xl font-bold mb-8 leading-tight">
              {termLabel.split(' ').map((word, i) => (
                <span key={i} className="block">{word}</span>
              ))}
            </p>
            
            <div className="space-y-2">
              <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-200 rounded-full" 
                  style={{ width: `${termProgress}%` }}
                />
              </div>
              <p className="text-xs text-green-200 font-medium">
                {termProgress}% of term completed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Table and Quick Actions side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <DataTable activities={stats?.recentActivities} />
        </div>
        
        {/* Right Sidebar Area */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <Link href="/dashboard/students/new" className="w-full rounded-2xl bg-[#053d26] p-4 text-left flex items-center gap-4 transition-transform hover:scale-[1.02]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white shrink-0">
                  <UserPlus className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-bold text-white text-lg">Add New Student</div>
                  <div className="text-sm text-green-200">Onboard a fresh learner profile</div>
                </div>
              </Link>

              <Link href="/dashboard/classes" className="w-full rounded-2xl bg-[#b05e1c] p-4 text-left flex items-center gap-4 transition-transform hover:scale-[1.02]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white shrink-0">
                  <FileOutput className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-bold text-white text-lg">Generate Report Cards</div>
                  <div className="text-sm text-orange-100 leading-tight mt-1">Bulk process academic summaries</div>
                </div>
              </Link>

              <button className="w-full rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-4 text-center transition-colors hover:border-gray-400 hover:bg-gray-100 flex flex-col items-center justify-center h-28 gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                  <Plus className="h-5 w-5" />
                </div>
                <div className="font-bold text-gray-700">Customize Shortcuts</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
