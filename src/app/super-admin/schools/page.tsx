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
  Calendar,
  TrendingUp,
  Building2,
  CreditCard,
  Users,
  X
} from "lucide-react";
import Link from "next/link";
import { LeonEdLogoText } from "@/components/ui/LeonEdText";
import toast from "react-hot-toast";
import { useLanguage, interpolate } from "@/components/LanguageProvider";

export default function SchoolsManagement() {
  const { t, tv } = useLanguage();
  const [schools, setSchools] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [durationMonths, setDurationMonths] = useState("1");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmAdminPassword, setConfirmAdminPassword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const fetchSchools = async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('leoned_token') : null;
      const res = await fetch(`/api/global-users?t=${Date.now()}`, {
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        cache: 'no-store'
      });
      if (!res.ok) throw new Error("sas.load_failed");
      
      const data = await res.json();
      const { schools = [], teachers = [], students = [] } = data;
      
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

      const schoolsWithCounts = schools.map((s: any) => {
        const studentDirect = students.filter((st: any) => String(st.schoolId) === String(s.id || s._id) || String(st.SchoolId) === String(s.id || s._id)).length;
        const teacherDirect = teachers.filter((t: any) => String(t.schoolId) === String(s.id || s._id) || String(t.SchoolId) === String(s.id || s._id)).length;
        
        return {
          ...s,
          id: s.id || s._id,
          computedCounts: {
            students: studentDirect > 0 ? studentDirect : Number(s.currentStudentCount || 0) + extractCount(s, ['student', 'pupil', 'learner']),
            teachers: teacherDirect > 0 ? teacherDirect : Number(s.currentTeacherCount || 0) + extractCount(s, ['teacher', 'staff', 'faculty'])
          }
        };
      });
      
      setSchools(schoolsWithCounts);
      
      try {
        const { schoolApi } = await import('@/lib/api');
        const plansData = await schoolApi.getPlans();
        setPlans((plansData as any)?.data || plansData || []);
      } catch (err) {
        console.error("Failed to fetch plans", err);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "sas.load_failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const searchParam = urlParams.get('search');
      if (searchParam) {
        setSearch(searchParam);
      }
    }
    fetchSchools();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSchools();
  };

  const getIsSchoolActive = (school: any) => {

    if (school.isActive === true) return true;
    if (school.isActive === false) return false;
    return school.status !== 'Suspended';
  };

  const handleToggleStatus = async (schoolId: string) => {
    // Optimistic UI update
    setSchools(prev => prev.map(s => {
      if (s.id === schoolId || s._id === schoolId) {
        const currentlyActive = getIsSchoolActive(s);
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
      const currentlyActive = targetSchool ? getIsSchoolActive(targetSchool) : true;
      const targetActive = !currentlyActive;
      
      await schoolApi.toggleStatus(schoolId, targetActive);
      toast.success(t("sas.status_ok"));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("sas.status_failed"));
      // Optionally revert UI here
    }
  };

  const handleOpenSettingsModal = (school: any) => {
    setSelectedSchool(school);
    setSelectedPlanId("");
    setDurationMonths("1");
    setActiveTab("overview");
    setIsSettingsModalOpen(true);
  };

  const handleManualUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchool || !selectedPlanId || !durationMonths) {
      toast.error(t("sas.fill_all"));
      return;
    }
    setIsUpgrading(true);
    try {
      const { paymentApi } = await import('@/lib/api');
      await paymentApi.manualUpgrade(selectedSchool.id, selectedPlanId, parseInt(durationMonths));
      toast.success(t("sas.upgraded"));
      setIsSettingsModalOpen(false);
      fetchSchools();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("sas.upgrade_failed"));
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedSchool) return;
    if (newAdminPassword.length < 6) {
      toast.error(t("set.pw_len"));
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      toast.error(t("fac.pw_match"));
      return;
    }
    
    setIsResettingPassword(true);
    try {
      const { schoolApi } = await import('@/lib/api');
      await schoolApi.resetAdminPassword(selectedSchool.id, newAdminPassword);
      toast.success(t("sas.pw_reset"));
      setNewAdminPassword("");
      setConfirmAdminPassword("");
      setIsResetConfirmOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("stu.pw_reset_failed");
      if (message.includes("404")) {
        toast.error(t("sas.endpoint"));
      } else {
        toast.error(message);
      }
    } finally {
      setIsResettingPassword(false);
      setIsResetConfirmOpen(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{t("sas.error_title")}</h2>
        <p className="text-gray-500 mb-6">{t(error)}</p>
        <button 
          onClick={() => { setError(""); fetchSchools(); }}
          className="px-6 py-2 bg-[#053d26] text-white rounded-full font-bold"
        >
          {t("common.retry")}
        </button>
      </div>
    );
  }

  const filteredSchools = schools.filter(s => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      (s.name || '').toLowerCase().includes(term) ||
      (s.email || '').toLowerCase().includes(term) ||
      (s.adminName || '').toLowerCase().includes(term) ||
      (s.id || s._id || '').toLowerCase().includes(term) ||
      (s.subscriptionPlan || 'Free').toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredSchools.length / ITEMS_PER_PAGE);
  const paginatedSchools = filteredSchools.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("sas.title")}</h1>
          <p className="text-gray-600">
            {interpolate(t("sas.subtitle"), { brand: <LeonEdLogoText /> })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm">
            <Filter className="h-4 w-4" />
            {t("sas.filter")}
          </button>
          <Link 
            href="/super-admin/schools/new"
            className="flex items-center gap-2 bg-[#053d26] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#042c1b] transition-all shadow-md"
          >
            {t("sas.add")}
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder={t("sas.search_ph")}
            className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-[#053d26] transition-all"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </form>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#053d26]" />
            <p className="text-gray-500 font-medium">{t("sas.retrieving")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-5 px-8 font-bold text-gray-400 text-xs uppercase tracking-wider">{t("sas.th_institution")}</th>
                  <th className="py-5 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider">{t("sas.th_contact")}</th>
                  <th className="py-5 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider">{t("sas.th_plan")}</th>
                  <th className="py-5 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider">{t("sas.th_users")}</th>
                  <th className="py-5 px-8 font-bold text-gray-400 text-xs uppercase tracking-wider text-right">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedSchools.length > 0 ? paginatedSchools.map((school) => {
                  const isSchoolActive = getIsSchoolActive(school);
                  return (
                  <tr key={school.id} className={`group hover:bg-gray-50/30 transition-all duration-500 ${isSchoolActive ? 'opacity-100' : 'opacity-40 grayscale bg-gray-50/50'}`}>
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 shrink-0">
                          {school.logoUrl || (school as any).logo ? (
                            <img 
                              src={school.logoUrl || (school as any).logo} 
                              alt={school.name} 
                              className="h-full w-full rounded-full object-cover border border-gray-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(school.name || 'S')}&background=ecfdf5&color=053d26`;
                              }}
                            />
                          ) : (
                            <div className="h-full w-full rounded-full bg-green-50 flex items-center justify-center text-[#053d26] font-bold text-lg border border-green-100">
                              {school.name?.[0] || 'S'}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-[#053d26] transition-colors">{school.name}</div>
                          <div className="text-xs font-medium text-gray-400 flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {t("sas.joined", { date: formatDate(school.createdAt) })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-gray-900">{school.adminName || t("sas.admin_user")}</div>
                        {school.email && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {school.email}
                          </div>
                        )}
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
                        <div className="text-xs text-gray-400">Next renewal: {
                          school.subscriptionExpiry ? formatDate(school.subscriptionExpiry) : 
                          school.createdAt ? formatDate(new Date(new Date(school.createdAt).setMonth(new Date(school.createdAt).getMonth() + 1)).toISOString()) : 'N/A'
                        }</div>
                      </div>
                    </td>

                    <td className="py-6 px-4">
                      <div className="flex items-center gap-4">
                        <div className="text-xs">
                          <span className="font-bold text-gray-900">
                            {school.computedCounts?.students || 0}
                          </span>
                          <span className="text-gray-400 ml-1">{t("sao.students_w")}</span>
                        </div>
                        <div className="text-xs">
                          <span className="font-bold text-gray-900">
                            {school.computedCounts?.teachers || 0}
                          </span>
                          <span className="text-gray-400 ml-1">{t("sao.staff_w")}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenSettingsModal(school)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all" title={t("sas.settings_title")}>
                          <Settings className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(school.id)}
                          title={isSchoolActive ? t("sas.suspend") : t("sas.activate")}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:ring-offset-2 ${
                            isSchoolActive ? 'bg-[#053d26]' : 'bg-gray-300'
                          }`}
                        >
                          <span className="sr-only">{t("sas.toggle")}</span>
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
                        <p className="text-gray-500 font-medium">{t("sas.empty")}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredSchools.length > 0 && (
          <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {interpolate(t("sas.showing"), { range: <span className="font-bold text-gray-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredSchools.length)}</span>, total: <span className="font-bold text-gray-900">{filteredSchools.length}</span> })}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-bold rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t("common.previous")}
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 text-sm font-bold rounded-xl transition-colors ${
                      page === currentPage
                        ? 'bg-[#053d26] text-white'
                        : 'border border-gray-200 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-bold rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t("common.next")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isSettingsModalOpen && selectedSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-200 min-h-[500px]">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-6 flex flex-col shrink-0">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-green-100 text-[#053d26] flex items-center justify-center font-bold text-lg">
                  {(selectedSchool.name || "S").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 truncate w-32">{selectedSchool.name}</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">{selectedSchool.id}</p>
                </div>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    activeTab === "overview" 
                      ? "bg-white text-[#053d26] shadow-sm border border-gray-200/50" 
                      : "text-gray-500 hover:bg-gray-100/80"
                  }`}
                >
                  <Building2 className="h-4 w-4" /> {t("layout.nav.overview")}
                </button>
                <button
                  onClick={() => setActiveTab("billing")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    activeTab === "billing" 
                      ? "bg-white text-[#b05e1c] shadow-sm border border-gray-200/50" 
                      : "text-gray-500 hover:bg-gray-100/80"
                  }`}
                >
                  <CreditCard className="h-4 w-4" /> {t("sas.tab_billing")}
                </button>
              </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeTab === "overview" ? t("set.sec.school") : t("sas.plan_mgmt")}
                </h2>
                <button 
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {activeTab === "overview" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">{t("sas.administrator")}</label>
                      <p className="font-semibold text-gray-900">{selectedSchool.adminName || t("sas.admin_user")}</p>
                      {selectedSchool.email && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Mail className="h-3 w-3" /> {selectedSchool.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">{t("sas.onboarded_date")}</label>
                      <p className="font-semibold text-gray-900">{formatDate(selectedSchool.createdAt)}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#053d26]" /> {t("sas.usage")}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-2xl font-black text-gray-900">{selectedSchool.computedCounts?.students || 0}</p>
                        <p className="text-xs text-gray-500 font-medium">{t("sas.active_students")}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-2xl font-black text-gray-900">{selectedSchool.computedCounts?.teachers || 0}</p>
                        <p className="text-xs text-gray-500 font-medium">{t("dash.faculty_members")}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-rose-50 rounded-2xl p-6 border border-rose-100">
                    <h4 className="text-sm font-bold text-rose-900 mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-rose-600" /> {t("set.sec.security")}
                    </h4>
                    <p className="text-xs text-rose-700 mb-4">
                      {t("sas.force_d")}
                    </p>
                    <button 
                      onClick={() => setIsResetConfirmOpen(true)}
                      disabled={isResettingPassword}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
                    >
                      <Power className="h-4 w-4" />
                      {t("sas.force")}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "billing" && (
                <form onSubmit={handleManualUpgrade} className="space-y-6 flex flex-col h-full">
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-1">{t("sas.current_plan")}</p>
                      <p className="text-lg font-black text-gray-900">{selectedSchool.subscriptionPlan || 'Free'}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Shield className="h-6 w-6 text-orange-500" />
                    </div>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("sas.change_plan")}</label>
                      <select
                        required
                        value={selectedPlanId}
                        onChange={(e) => setSelectedPlanId(e.target.value)}
                        className="block w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:bg-white transition-colors"
                      >
                        <option value="">{t("sas.choose_plan")}</option>
                        {plans.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} - ₦{(p.amount ?? p.price)?.toLocaleString() || 0}/mo
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("sas.duration")}</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={durationMonths}
                        onChange={(e) => setDurationMonths(e.target.value)}
                        className="block w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pt-6 mt-auto">
                    <button
                      type="submit"
                      disabled={isUpgrading}
                      className="w-full py-3.5 rounded-xl font-bold text-white bg-[#b05e1c] hover:bg-[#965017] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isUpgrading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" /> {t("acr.processing")}
                        </>
                      ) : (
                        t("sas.override")
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && selectedSchool && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isResettingPassword && setIsResetConfirmOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Power className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t("sas.reset_title")}</h3>
            <p className="text-sm text-gray-500 mb-4">
              {interpolate(t("sas.reset_d"), { name: <span className="font-bold text-gray-700">{selectedSchool.name}</span> })}
            </p>
            <div className="mb-6 text-left">
              <label className="block text-xs font-bold text-gray-700 mb-1">{t("stu.new_pw")}</label>
              <input
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder={t("sas.new_pw_ph")}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-all text-sm text-gray-900 mb-3"
              />
              <label className="block text-xs font-bold text-gray-700 mb-1">{t("fac.confirm_pw")}</label>
              <input
                type="password"
                value={confirmAdminPassword}
                onChange={(e) => setConfirmAdminPassword(e.target.value)}
                placeholder={t("fac.confirm_pw_ph")}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-all text-sm text-gray-900"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                disabled={isResettingPassword}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleResetPassword}
                disabled={isResettingPassword}
                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isResettingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : t("sas.yes_reset")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
