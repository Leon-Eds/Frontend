import Link from "next/link";
import { mockStats, mockUpcomingEvents } from "@/lib/mocks/dashboard";
import StatCard from "@/components/dashboard/StatCard";
import DataTable from "@/components/dashboard/DataTable";
import { GraduationCap, Users, FileText, UserPlus, FileOutput, Plus } from "lucide-react";

export default function DashboardOverview() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">School Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, Academic Architect. Here is your campus overview for the <span className="text-[#b05e1c] font-semibold">{mockStats.activeTerm.term}</span>.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={mockStats.totalStudents.value}
          icon={<GraduationCap className="h-6 w-6" />}
          badge={mockStats.totalStudents.change}
        />
        <StatCard
          title="Total Teachers"
          value={mockStats.totalTeachers.value}
          icon={<Users className="h-6 w-6" />}
          iconBgColor="bg-gray-100"
          iconTextColor="text-gray-600"
        />
        <StatCard
          title="Results Pending"
          value={mockStats.resultsPending.value}
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
              {mockStats.activeTerm.term.split(' ').map((word, i) => (
                <span key={i} className="block">{word}</span>
              ))}
            </p>
            
            <div className="space-y-2">
              <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-200 rounded-full" 
                  style={{ width: `${mockStats.activeTerm.progress}%` }}
                />
              </div>
              <p className="text-xs text-green-200 font-medium">
                {mockStats.activeTerm.progress}% of term completed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Table and Quick Actions side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <DataTable />
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

          {/* Upcoming Events */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6">
              Upcoming Events
            </h3>
            <div className="space-y-6">
              {mockUpcomingEvents.map((event) => (
                <div key={event.id} className="flex gap-4">
                  <div className="text-center shrink-0">
                    <div className="text-xl font-bold text-gray-900 leading-none">{event.date}</div>
                    <div className="text-xs font-semibold text-gray-500 mt-1">{event.month}</div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 leading-tight">{event.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{event.details}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
