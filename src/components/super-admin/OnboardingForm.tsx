"use client";

import { useState } from "react";
import { ShieldAlert, Lock, User, Mail, Key, Loader2, CheckCircle2 } from "lucide-react";
import { authApi } from "@/lib/api";

interface OnboardingFormProps {
  onSuccess: () => void;
}

export default function OnboardingForm({ onSuccess }: OnboardingFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    secretKey: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!formData.name || !formData.email || !formData.password || !formData.secretKey) {
      setError("All fields are required to verify platform authority.");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.createSuperAdmin(formData);
      setIsSuccess(true);
      setTimeout(onSuccess, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authorization failed. Check your secret key.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center p-8">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authority Granted</h2>
        <p className="text-gray-500 mb-8">
          Super Admin initialized. Redirecting to terminal...
        </p>
        <Loader2 className="h-6 w-6 animate-spin text-[#053d26] mx-auto" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden max-w-xl w-full mx-auto">
      <div className="bg-[#053d26] p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <ShieldAlert className="h-6 w-6 text-orange-400" />
          <h2 className="text-2xl font-bold">Initialize Authority</h2>
        </div>
        <p className="text-green-100/70 text-sm">
          Master key required for platform architect enrollment.
        </p>
      </div>

      <form className="p-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="text"
                required
                placeholder="John Doe"
                className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[#053d26] transition-all text-gray-900"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="email"
                required
                placeholder="admin@leoned.africa"
                className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[#053d26] transition-all text-gray-900"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Master Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="password"
              required
              placeholder="••••••••••••"
              className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[#053d26] transition-all text-gray-900"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-orange-600 uppercase tracking-wider ml-1">System Secret Key</label>
          <div className="relative">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-400" />
            <input 
              type="password"
              required
              placeholder="Master Decryption Key"
              className="w-full bg-orange-50/50 border-orange-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-orange-500 transition-all font-mono text-gray-900"
              value={formData.secretKey}
              onChange={(e) => setFormData({...formData, secretKey: e.target.value})}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#053d26] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#042c1b] transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              Verifying...
            </>
          ) : (
            "Grant Authority"
          )}
        </button>
      </form>
    </div>
  );
}
