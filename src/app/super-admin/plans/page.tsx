"use client";

import { useEffect, useState } from "react";
import { 
  CreditCard, 
  TrendingUp, 
  CheckCircle2, 
  ArrowUpRight, 
  Plus, 
  MoreHorizontal,
  Package,
  Shield,
  Zap,
  Globe,
  Loader2,
  X,
  Users,
  Briefcase,
  School
} from "lucide-react";

import { dashboardApi, schoolApi, paymentPlanApi } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

const getPlanTheme = (name: string) => {
  const lowerName = (name || '').toLowerCase();
  
  if (lowerName.includes('gold') || lowerName.includes('premium')) {
    return {
      card: 'border-2 border-amber-500 shadow-[0_20px_50px_rgba(245,158,11,0.15)]',
      topBar: 'bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600',
      badge: 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-transparent',
      iconButton: 'hover:bg-amber-100 hover:text-amber-700 border-amber-100',
      price: 'text-amber-500',
      iconWrapper: 'bg-amber-50 border-amber-100',
      iconColor: 'text-amber-600',
      actionBtn: 'group-hover:bg-amber-500 group-hover:border-amber-500 group-hover:text-white',
    };
  }
  
  if (lowerName.includes('silver') || lowerName.includes('pro')) {
    return {
      card: 'border-2 border-slate-400 shadow-[0_20px_50px_rgba(148,163,184,0.15)]',
      topBar: 'bg-gradient-to-r from-slate-500 via-gray-300 to-slate-500',
      badge: 'bg-gradient-to-r from-slate-500 to-gray-400 text-white border-transparent',
      iconButton: 'hover:bg-slate-200 hover:text-slate-700 border-slate-200',
      price: 'text-slate-500',
      iconWrapper: 'bg-slate-50 border-slate-200',
      iconColor: 'text-slate-600',
      actionBtn: 'group-hover:bg-slate-500 group-hover:border-slate-500 group-hover:text-white',
    };
  }
  
  if (lowerName.includes('bronze') || lowerName.includes('basic')) {
    return {
      card: 'border-2 border-orange-700/50 shadow-[0_20px_50px_rgba(194,65,12,0.1)]',
      topBar: 'bg-gradient-to-r from-orange-800 via-orange-500 to-orange-800',
      badge: 'bg-gradient-to-r from-orange-700 to-orange-500 text-white border-transparent',
      iconButton: 'hover:bg-orange-100 hover:text-orange-800 border-orange-200',
      price: 'text-orange-600',
      iconWrapper: 'bg-orange-50 border-orange-200',
      iconColor: 'text-orange-600',
      actionBtn: 'group-hover:bg-orange-600 group-hover:border-orange-600 group-hover:text-white',
    };
  }

  // Default (Free / Standard)
  return {
    card: 'border border-gray-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl',
    topBar: null,
    badge: 'bg-gray-100 text-gray-600 border-gray-200/60',
    iconButton: 'hover:bg-gray-200 hover:text-gray-700 border-gray-200/50',
    price: 'text-gray-900',
    iconWrapper: 'bg-emerald-50 border-emerald-100',
    iconColor: 'text-emerald-600',
    actionBtn: 'group-hover:bg-[#053d26] group-hover:border-[#053d26] group-hover:text-white',
  };
};

export default function BillingPlansManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    studentLimit: "",
    teacherLimit: "",
    features: ""
  });

  const handleOpenModal = (plan?: any) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name || "",
        price: (plan.amount ?? plan.price)?.toString() || "",
        studentLimit: (plan.maxStudents ?? plan.studentLimit)?.toString() || "",
        teacherLimit: (plan.maxTeachers ?? plan.teacherLimit)?.toString() || "",
        features: (plan.features || []).join(", ")
      });
    } else {
      setEditingPlan(null);
      setFormData({ name: "", price: "", studentLimit: "", teacherLimit: "", features: "" });
    }
    setIsModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      amount: Number(formData.price),
      maxStudents: formData.studentLimit ? Number(formData.studentLimit) : null,
      maxTeachers: formData.teacherLimit ? Number(formData.teacherLimit) : null,
      features: formData.features.split(",").map(f => f.trim()).filter(Boolean)
    };
    
    const promise = (async () => {
      if (editingPlan) {
        await paymentPlanApi.update(editingPlan.id, payload);
      } else {
        await paymentPlanApi.create(payload);
      }
      // Refresh
      const plansData = await schoolApi.getPlans();
      setPlans((plansData as any)?.data || plansData || []);
      setIsModalOpen(false);
    })();
    
    toast.promise(promise, {
      loading: "Saving plan...",
      success: "Plan saved successfully!",
      error: (err) => `Failed: ${err.message || "Unknown error"}`
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsData, plansData, schoolsData] = await Promise.all([
          dashboardApi.getSuperAdminDashboard().catch(() => null),
          schoolApi.getPlans().catch(() => []),
          schoolApi.getAll().catch(() => [])
        ]);
        
        const fetchedPlans = (plansData as any)?.data || plansData || [];
        setPlans(fetchedPlans);
        
        let extractedSchools: any[] = [];
        const sData = (schoolsData as any)?.data || schoolsData;
        if (Array.isArray(sData)) extractedSchools = sData;
        else if (Array.isArray(sData?.items)) extractedSchools = sData.items;

        const planCounts: Record<string, number> = {};
        let activeSubs = 0;
        let totalRev = 0;

        extractedSchools.forEach(sch => {
          if (sch.isActive !== false) {
            const planName = sch.subscriptionPlan || "Free";
            planCounts[planName] = (planCounts[planName] || 0) + 1;
            
            const plan = fetchedPlans.find((p: any) => p.name === planName);
            if (plan && plan.name !== "Free") {
              activeSubs++;
              const amount = Number(plan.amount ?? plan.price ?? 0);
              totalRev += amount;
            }
          }
        });

        const plansWithCounts = fetchedPlans.map((p: any) => ({
          ...p,
          schoolCount: planCounts[p.name] || 0
        }));

        setPlans(plansWithCounts);

        const backendStats = (statsData as any)?.data || statsData || {};
        
        setStats({
          ...backendStats,
          activeSubscriptions: activeSubs, // Override backend if it's returning 0 incorrectly
          totalRevenue: totalRev
        });
      } catch (err) {
        console.error("Failed to fetch billing data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#053d26]" />
        <p className="text-gray-500 font-medium">Synchronizing Billing Records...</p>
      </div>
    );
  }

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
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#053d26]">Root Billing Matrix</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight flex items-center gap-4">
              Subscription Architecture
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-3 flex items-center gap-2">
              Monitor revenue streams and manage institutional subscription tiers.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => handleOpenModal()}
              className="group relative flex items-center gap-2 bg-gradient-to-br from-[#053d26] to-[#042c1b] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.1em] overflow-hidden transition-all duration-300 shadow-[0_8px_30px_rgba(5,61,38,0.25)] hover:shadow-[0_12px_40px_rgba(5,61,38,0.4)] hover:-translate-y-0.5 active:translate-y-0"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <Plus className="h-5 w-5 relative z-10" />
              <span className="relative z-10">Create New Plan</span>
            </button>
          </div>
        </div>

        {/* Bento Grid Revenue Snapshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hero Stat: Platform Revenue */}
          <div className="group relative overflow-hidden rounded-[2rem] bg-white/60 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-white/80 transition-all duration-300 hover:bg-white hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1">
            <div className="absolute -right-10 -top-10 h-40 w-40 bg-emerald-500/5 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-150 group-hover:bg-emerald-500/10" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-8">
                <div className="h-14 w-14 rounded-[1.25rem] bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100/50 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700 uppercase tracking-widest border border-emerald-100/50 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-green"></span> Live
                </span>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Total Platform Revenue</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-300">₦</span>
                  <h3 className="text-5xl font-black text-gray-900 tracking-tight">{(stats?.totalRevenue || 0).toLocaleString()}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[2rem] bg-white/60 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-white/80 transition-all duration-300 hover:bg-white hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1">
            <div className="absolute -right-10 -top-10 h-40 w-40 bg-blue-500/5 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-150 group-hover:bg-blue-500/10" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-8">
                <div className="h-14 w-14 rounded-[1.25rem] bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100/50 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                  <CreditCard className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black text-blue-700 uppercase tracking-widest border border-blue-100/50">
                  Validated
                </span>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Active Subscriptions</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-5xl font-black text-gray-900 tracking-tight">{stats?.activeSubscriptions || 0}</h3>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">licenses</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Management */}
        <div className="pt-6">
          <div className="flex items-center gap-3 mb-8">
            <Package className="h-6 w-6 text-[#b05e1c]" />
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Available Subscription Tiers</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.length > 0 ? plans.map((plan) => {
              const theme = getPlanTheme(plan.name);
              
              return (
                <div 
                  key={plan.id || plan.name} 
                  className={`relative flex flex-col bg-white/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:-translate-y-2 group
                    ${theme.card}
                  `}
                >
                  {theme.topBar && (
                    <div className={`absolute top-0 inset-x-0 h-1.5 ${theme.topBar}`} />
                  )}
                  
                  <div className="p-8 pb-6 flex-1">
                    <div className="flex justify-between items-start mb-6">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border ${theme.badge}`}>
                        {plan.name}
                      </span>
                      <button 
                        onClick={() => handleOpenModal(plan)}
                        className={`h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 transition-colors border ${theme.iconButton}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="mb-8">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-gray-400">₦</span>
                        <h4 className={`text-5xl font-black tracking-tighter ${theme.price}`}>
                          {typeof (plan.amount ?? plan.price) === 'number' ? (plan.amount ?? plan.price) : (plan.amount ?? plan.price)?.toString().replace('$', '').replace('₦', '')}
                        </h4>
                        <span className="text-sm font-bold text-gray-400">/mo</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Included Features</p>
                      
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                          <Users className="h-4 w-4 text-blue-500 mb-2" />
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Students</p>
                          <p className="text-sm font-black text-gray-900">{plan.maxStudents ?? plan.studentLimit ?? 'Unlimited'}</p>
                        </div>
                        <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                          <Briefcase className="h-4 w-4 text-emerald-500 mb-2" />
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Teachers</p>
                          <p className="text-sm font-black text-gray-900">{plan.maxTeachers ?? plan.teacherLimit ?? 'Unlimited'}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {(plan.features || []).map((feature: string) => (
                          <div key={feature} className="flex items-start gap-3">
                            <div className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center shrink-0 border ${theme.iconWrapper}`}>
                              <CheckCircle2 className={`h-3 w-3 ${theme.iconColor}`} />
                            </div>
                            <span className="text-[13px] text-gray-600 font-medium leading-tight">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Subscribed Institutions</p>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {[...Array(Math.min(3, plan.schoolCount || 0))].map((_, i) => (
                            <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
                              <School className="h-3 w-3 text-gray-400" />
                            </div>
                          ))}
                        </div>
                        <p className="text-lg font-black text-gray-900">{plan.schoolCount || 0}</p>
                      </div>
                    </div>
                    <Link 
                      href={`/super-admin/schools?search=${encodeURIComponent(plan.name)}`}
                      className={`h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 transition-all shadow-sm group-hover:shadow-md ${theme.actionBtn}`}
                    >
                      <ArrowUpRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              );
            }) : (
              <div className="lg:col-span-3 py-24 text-center bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-dashed border-gray-300">
                 <Package className="h-16 w-16 text-gray-300 mx-auto mb-5" />
                 <p className="text-gray-900 font-black text-lg tracking-tight mb-1">No subscription plans configured</p>
                 <p className="text-gray-500 font-medium text-sm">Create a new subscription tier to offer your services.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
            <div className="p-6 sm:p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{editingPlan ? "Update Subscription Plan" : "Create Subscription Plan"}</h2>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">Tier Configuration Matrix</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 rounded-full flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors shadow-sm">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSavePlan} className="p-6 sm:p-8 space-y-6">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-gray-500 mb-2">Plan Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full rounded-2xl border border-gray-200 py-3.5 px-4 font-medium text-gray-900 focus:ring-2 focus:ring-[#053d26]/20 focus:border-[#053d26] transition-all bg-gray-50 focus:bg-white"
                  placeholder="e.g. Premium Plus" 
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-gray-500 mb-2">Monthly Price (₦)</label>
                  <input 
                    type="number" 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value})} 
                    className="w-full rounded-2xl border border-gray-200 py-3.5 px-4 font-medium text-gray-900 focus:ring-2 focus:ring-[#053d26]/20 focus:border-[#053d26] transition-all bg-gray-50 focus:bg-white"
                    placeholder="0" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-gray-500 mb-2">Student Limit</label>
                  <input 
                    type="number" 
                    value={formData.studentLimit} 
                    onChange={e => setFormData({...formData, studentLimit: e.target.value})} 
                    className="w-full rounded-2xl border border-gray-200 py-3.5 px-4 font-medium text-gray-900 focus:ring-2 focus:ring-[#053d26]/20 focus:border-[#053d26] transition-all bg-gray-50 focus:bg-white"
                    placeholder="Unlimited" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-gray-500 mb-2">Teacher Limit</label>
                <input 
                  type="number" 
                  value={formData.teacherLimit} 
                  onChange={e => setFormData({...formData, teacherLimit: e.target.value})} 
                  className="w-full rounded-2xl border border-gray-200 py-3.5 px-4 font-medium text-gray-900 focus:ring-2 focus:ring-[#053d26]/20 focus:border-[#053d26] transition-all bg-gray-50 focus:bg-white"
                  placeholder="Unlimited" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-gray-500 mb-2">Features Matrix</label>
                <textarea 
                  value={formData.features} 
                  onChange={e => setFormData({...formData, features: e.target.value})} 
                  className="w-full rounded-2xl border border-gray-200 py-3.5 px-4 font-medium text-gray-900 focus:ring-2 focus:ring-[#053d26]/20 focus:border-[#053d26] transition-all bg-gray-50 focus:bg-white resize-none h-28"
                  placeholder="e.g. Advanced analytics, Custom domains, Priority support (comma separated)" 
                />
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 px-6 rounded-2xl border border-gray-200 text-gray-600 font-black uppercase tracking-widest text-[11px] hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-[2] py-4 px-6 rounded-2xl bg-gradient-to-r from-[#053d26] to-[#042c1b] text-white font-black uppercase tracking-widest text-[11px] hover:from-[#042c1b] hover:to-[#053d26] transition-all shadow-[0_8px_20px_rgba(5,61,38,0.25)] hover:shadow-[0_12px_25px_rgba(5,61,38,0.35)] transform hover:-translate-y-0.5 active:translate-y-0">
                  {editingPlan ? "Deploy Changes" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
