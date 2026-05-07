"use client";

import { useEffect, useState } from "react";
import { schoolApi, dashboardApi, PaginatedResponse } from "@/lib/api";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  ExternalLink, 
  Shield, 
  Settings, 
  Loader2, 
  School as SchoolIcon,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Mail,
  Calendar
} from "lucide-react";
import Link from "next/link";

export default function SchoolsManagement() {
  const [schools, setSchools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchSchools = async () => {
    setIsLoading(true);
    try {
      const [schoolsData, statsData] = await Promise.all([
        schoolApi.getAll(page, 10, search).catch(() => null),
        dashboardApi.getSuperAdminDashboard().catch(() => null)
      ]);
      
      let extractedSchools = [];
      
      // Fallback Strategy from Dashboard (Exhaustive search)
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
        // Normal data extraction
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
      setTotalPages((schoolsData as any)?.totalPages || 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load schools");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSchools();
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
                {schools.length > 0 ? schools.map((school) => (
                  <tr key={school.id} className="group hover:bg-gray-50/30 transition-colors">
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center text-[#053d26] font-bold text-lg border border-green-100">
                          {school.name?.[0] || 'S'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-[#053d26] transition-colors">{school.name}</div>
                          <div className="text-xs font-medium text-gray-400 flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            Joined {new Date(school.createdAt || Date.now()).toLocaleDateString()}
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
                            {(() => {
                              const findCount = (obj: any, keywords: string[]): number => {
                                if (!obj || typeof obj !== 'object') return 0;
                                // Prisma style _count
                                if (obj._count) {
                                  for (const key of Object.keys(obj._count)) {
                                    if (keywords.some(kw => key.toLowerCase().includes(kw))) return obj._count[key];
                                  }
                                }
                                // Check direct keys
                                for (const key of Object.keys(obj)) {
                                  const lowerKey = key.toLowerCase();
                                  if (lowerKey.includes('max') || lowerKey.includes('limit')) continue;
                                  if (keywords.some(kw => lowerKey.includes(kw))) {
                                    if (typeof obj[key] === 'number') return obj[key];
                                    if (Array.isArray(obj[key])) return obj[key].length;
                                  }
                                }
                                // Check nested stats objects
                                if (obj.stats) return findCount(obj.stats, keywords);
                                if (obj.statistics) return findCount(obj.statistics, keywords);
                                return 0;
                              };
                              return findCount(school, ['student', 'pupil', 'learner']);
                            })()}
                          </span>
                          <span className="text-gray-400 ml-1">Students</span>
                        </div>
                        <div className="text-xs">
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
                                if (obj.statistics) return findCount(obj.statistics, keywords);
                                return 0;
                              };
                              return findCount(school, ['teacher', 'staff', 'faculty']);
                            })()}
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
                        <Link href={`/super-admin/settings`} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all" title="Platform Settings">
                          <Settings className="h-5 w-5" />
                        </Link>
                        <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
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

        {/* Pagination */}
        {!isLoading && schools.length > 0 && (
          <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing page <span className="font-bold text-gray-900">{page}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
