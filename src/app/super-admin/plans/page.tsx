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
  Globe
} from "lucide-react";

import { dashboardApi, schoolApi } from "@/lib/api";

export default function BillingPlansManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsData, plansData] = await Promise.all([
          dashboardApi.getSuperAdminDashboard(),
          schoolApi.getPlans()
        ]);
        setStats(statsData?.data || statsData);
        setPlans(plansData?.data || plansData || []);
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
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Billing & Subscription Architecture</h1>
          <p className="text-gray-600 font-medium">Monitor revenue streams and manage institutional subscription tiers.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#053d26] text-white px-6 py-3 rounded-full font-bold hover:bg-[#042c1b] transition-all shadow-lg hover:shadow-xl">
          <Plus className="h-5 w-5" />
          Create New Plan
        </button>
      </div>

      {/* Revenue Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-[#053d26] border border-green-100">
              <TrendingUp className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Total Platform Revenue</p>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-bold text-gray-900 tracking-tight">${(stats?.totalRevenue || 0).toLocaleString()}</h3>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">Live</span>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <CreditCard className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Active Subscriptions</p>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-bold text-gray-900 tracking-tight">{stats?.activeSubscriptions || 0}</h3>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Validated</span>
          </div>
        </div>

        <div className="bg-[#053d26] rounded-[2.5rem] p-8 shadow-xl text-white relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/5 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-green-200">
                <Globe className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-bold text-green-200 uppercase tracking-[0.15em]">Market Reach</p>
            </div>
            <h3 className="text-4xl font-bold tracking-tight">{stats?.activeCountries || 1} Region</h3>
            <p className="text-[11px] text-green-200/70 mt-1 font-bold uppercase tracking-widest">Platform Coverage</p>
          </div>
        </div>
      </div>

      {/* Plan Management */}
      <h2 className="text-2xl font-bold text-gray-900 pt-4 tracking-tight">Subscription Tiers</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {plans.length > 0 ? plans.map((plan) => (
          <div key={plan.id || plan.name} className="bg-white rounded-[2.5rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between hover:shadow-xl transition-all group">
            <div>
              <div className="flex justify-between items-start mb-8">
                <div className="px-4 py-1.5 rounded-full bg-gray-50 text-[#053d26] border border-gray-100 text-[10px] font-bold uppercase tracking-[0.1em]">
                  {plan.name}
                </div>
                <button className="text-gray-300 hover:text-gray-900 transition-colors">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-10">
                <h4 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                  {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                  <span className="text-sm font-bold text-gray-400">/mo</span>
                </h4>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{plan.studentLimit || 'Unlimited'} Students</p>
              </div>

              <div className="space-y-4 mb-10">
                {(plan.features || []).map((feature: string) => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-[#053d26] opacity-60" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Subscribed Institutions</p>
                <p className="text-2xl font-bold text-gray-900">{plan.schoolCount || 0}</p>
              </div>
              <button className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#053d26] group-hover:text-white transition-all shadow-sm">
                <ArrowUpRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        )) : (
          <div className="lg:col-span-3 py-20 text-center bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
             <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
             <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No subscription plans configured</p>
          </div>
        )}
      </div>
    </div>
  );
}
