"use client";

import { useState } from "react";
import { ShieldAlert, Lock, User, Mail, Key, Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export default function SuperAdminOnboarding() {
  const router = useRouter();
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
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authorization failed. Check your secret key.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#053d26] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 text-center shadow-2xl">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authority Granted</h2>
          <p className="text-gray-500 mb-8">
            The Super Admin account has been successfully initialized. You are being redirected to the login terminal.
          </p>
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#053d26]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        {/* Branding */}
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo.png" alt="LeonEd" width={80} height={80} className="mb-4" />
          <h1 className="text-xl font-bold text-[#053d26] uppercase tracking-[0.3em]">Platform Authority</h1>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-[#053d26] p-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <ShieldAlert className="h-6 w-6 text-orange-400" />
              <h2 className="text-2xl font-bold">Super Admin Onboarding</h2>
            </div>
            <p className="text-green-100/70 text-sm">
              This terminal is reserved for platform architects only. Access requires the master decryption key.
            </p>
          </div>

          <form className="p-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-600 space-y-3">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <p>{error}</p>
                </div>
                {(error.toLowerCase().includes("already exists") || error.toLowerCase().includes("conflict")) && (
                  <Link 
                    href="/login" 
                    className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-red-200 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-all"
                  >
                    Login Instead
                  </Link>
                )}
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
                    className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[#053d26] transition-all"
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
                    className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[#053d26] transition-all"
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
                  className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[#053d26] transition-all"
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
                  placeholder="Input the super secret key..."
                  className="w-full bg-orange-50/50 border-orange-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-orange-500 transition-all font-mono"
                  value={formData.secretKey}
                  onChange={(e) => setFormData({...formData, secretKey: e.target.value})}
                />
              </div>
              <p className="text-[10px] text-gray-400 italic ml-1">
                * Authorization will fail if the secret key does not match the system backend.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#053d26] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#042c1b] transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Verifying Authority...
                  </>
                ) : (
                  "Initialize Super Admin"
                )}
              </button>
            </div>
          </form>

          <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
            <Link href="/login" className="text-sm font-bold text-gray-500 hover:text-[#053d26] transition-colors">
              Return to Security Terminal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
