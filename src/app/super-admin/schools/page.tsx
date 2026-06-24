"use client";

import { useEffect, useState } from "react";
import { schoolApi, dashboardApi, formatDate } from "@/lib/api";
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Shield, 
  Settings, 
  Loader2, 
  School as SchoolIcon,
  Power,
  Mail,
  Calendar
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function SchoolsManagement() {
  const [schools, setSchools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchSchools = async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('leoned_token') : null;
      const res = await fetch(`/api/global-users?t=${Date.now()}`, {
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        cache: 'no-store'
      });
      if (!res.ok) throw new Error("Failed to load global data");
      
      const data = await res.json();
      const { schools = [], teachers = [], students = [] } = data;
      
      const schoolsWithCounts = schools.map((s: any) => ({
        ...s,
        id: s.id || s._id,
        computedCounts: {
          students: students.filter((st: any) => String(st.schoolId) === String(s.id || s._id) || String(st.SchoolId) === String(s.id || s._id)).length,
          teachers: teachers.filter((t: any) => String(t.schoolId) === String(s.id || s._id) || String(t.SchoolId) === String(s.id || s._id)).length
        }
      }));
      
      setSchools(schoolsWithCounts);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load schools");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSchools();
  };

  const handleToggleStatus = async (schoolId: string) => {
    // Optimistic UI update
    setSchools(prev => prev.map(s => {
      if (s.id === schoolId || s._id === schoolId) {
        const currentlyActive = s.isActive !== false && s.status !== 'Suspended';
        return {
          ...s,
          isActive: !currentlyActive,
          status: currentlyActive ? 'Suspended' : 'Active'
        };
      }
      return s;
    }));

    try {
      const targetSchool = schools.find(s => s.id === schoolId || s._id === schoolId);
      const currentlyActive = targetSchool ? (targetSchool.isActive !== false && targetSchool.status !== 'Suspended') : true;
      await schoolApi.toggleStatus(schoolId, !currentlyActive);
      toast.success("Status updated successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to toggle status");
      // Revert optimistic update
      fetchSchools();
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Error Loading Schools</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <button 
          onClick={() => { setError(""); fetchSchools(); }}
          className="px-6 py-2 bg-[#053d26] text-white rounded-full font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Institutional Registry</h1>
          <p className="text-gray-600">
            Manage all schools onboarded on the LeonEd Africa platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <Link 
            href="/super-admin/schools/new"
            className="flex items-center gap-2 bg-[#053d26] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#042c1b] transition-all shadow-md"
          >
            Add New School
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search institutions by name, email, or ID..."
            className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-[#053d26] transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      {/* Schools List */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#053d26]" />
            <p className="text-gray-500 font-medium">Retrieving school records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-5 px-8 font-bold text-gray-400 text-xs uppercase tracking-wider">Institution</th>
                  <th className="py-5 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Contact Info</th>
                  <th className="py-5 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Plan & Billing</th>
                  <th className="py-5 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Users</th>
                  <th className="py-5 px-8 font-bold text-gray-400 text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {schools.length > 0 ? schools.map((school) => {
                  const isSchoolActive = school.isActive !== false && school.status !== 'Suspended';
                  return (
                  <tr key={school.id} className={`group hover:bg-gray-50/30 transition-all duration-500 ${isSchoolActive ? 'opacity-100' : 'opacity-40 grayscale bg-gray-50/50'}`}>
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center text-[#053d26] font-bold text-lg border border-green-100">
                          {school.name?.[0] || 'S'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-[#053d26] transition-colors">{school.name}</div>
                          <div className="text-xs font-medium text-gray-400 flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            Joined {formatDate(school.createdAt)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-gray-900">{school.adminName || 'Admin User'}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {school.email}
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          school.subscriptionPlan === 'Premium' 
                            ? 'bg-purple-100 text-purple-700' 
                            : school.subscriptionPlan === 'Plus'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {school.subscriptionPlan || 'Free'}
                        </span>
                        <div className="text-xs text-gray-400">Next renewal: June 12, 2026</div>
                      </div>
                    </td>

                    <td className="py-6 px-4">
                      <div className="flex items-center gap-4">
                        <div className="text-xs">
                          <span className="font-bold text-gray-900">
                            {school.computedCounts?.students || 0}
                          </span>
                          <span className="text-gray-400 ml-1">Students</span>
                        </div>
                        <div className="text-xs">
                          <span className="font-bold text-gray-900">
                            {school.computedCounts?.teachers || 0}
                          </span>
                          <span className="text-gray-400 ml-1">Staff</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard`} className="p-2 text-gray-400 hover:text-[#053d26] hover:bg-green-50 rounded-xl transition-all" title="Access School Portal">
                          <ExternalLink className="h-5 w-5" />
                        </Link>
                        <Link href={`/dashboard/settings`} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all" title="Platform Settings">
                          <Settings className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(school.id)}
                          title={isSchoolActive ? "Suspend School" : "Activate School"}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:ring-offset-2 ${
                            isSchoolActive ? 'bg-[#053d26]' : 'bg-gray-300'
                          }`}
                        >
                          <span className="sr-only">Toggle school status</span>
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              isSchoolActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <SchoolIcon className="h-12 w-12 text-gray-200" />
                        <p className="text-gray-500 font-medium">No schools found matching your criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && schools.length > 0 && (
          <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing <span className="font-bold text-gray-900">{schools.length}</span> institutions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
