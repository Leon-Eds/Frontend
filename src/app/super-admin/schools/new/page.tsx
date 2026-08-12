"use client";

import { useState } from "react";
import { 
  School, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  ArrowLeft,
  Loader2,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { LeonEdLogoText } from "@/components/ui/LeonEdText";
import toast from "react-hot-toast";

export default function RegisterNewSchool() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: "",
    adminName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    subscriptionPlan: "Free" as any
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      await authApi.register(formData);
      setIsSuccess(true);
      setTimeout(() => router.push("/super-admin/schools"), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Institution Registered</h2>
        <p className="text-gray-500 max-w-md mx-auto">The school has been successfully onboarded to <LeonEdLogoText />. Redirecting to registry...</p>
        <Loader2 className="h-6 w-6 animate-spin text-[#053d26]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/super-admin/schools" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Registry
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Register New Institution</h1>
        <p className="text-gray-600">Onboard a new school to the <LeonEdLogoText /> ecosystem.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-6 text-gray-900">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-[#053d26]">
              <School className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Institutional Profile</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">School Name</label>
              <input 
                type="text" 
                required
                placeholder="Ex: LeonEd Academy"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-[#053d26] transition-all"
                value={formData.schoolName}
                onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Primary Admin Name</label>
              <input 
                type="text" 
                required
                placeholder="Ex: Joshua Uzoigwe"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-[#053d26] transition-all"
                value={formData.adminName}
                onChange={(e) => setFormData({...formData, adminName: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Credentials */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-6 text-gray-900">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Access & Security</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="email" 
                  required
                  placeholder="admin@school.com"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[#053d26] transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">System Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[#053d26] transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[#053d26] transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Plan Selection */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-6 text-gray-900">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Subscription Plan</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Free', 'Plus', 'Premium'].map((plan) => (
              <button
                key={plan}
                type="button"
                onClick={() => setFormData({...formData, subscriptionPlan: plan as any})}
                className={`p-6 rounded-[2rem] border-2 transition-all text-left space-y-2 ${
                  formData.subscriptionPlan === plan 
                    ? "border-[#053d26] bg-green-50/50" 
                    : "border-gray-100 bg-gray-50 hover:border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">{plan}</span>
                  {formData.subscriptionPlan === plan && <CheckCircle2 className="h-5 w-5 text-[#053d26]" />}
                </div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{plan === 'Free' ? '$0/mo' : plan === 'Plus' ? '$49/mo' : '$99/mo'}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/super-admin/schools" className="px-8 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all">
            Discard
          </Link>
          <button 
            type="submit"
            disabled={isLoading}
            className="px-10 py-4 rounded-2xl bg-[#053d26] text-white font-bold text-lg shadow-xl hover:bg-[#042c1b] transition-all flex items-center gap-3 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ShieldCheck className="h-6 w-6" />}
            Register Institution
          </button>
        </div>
      </form>
    </div>
  );
}
