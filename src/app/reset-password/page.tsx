"use client";

import { useState, useEffect } from "react";
import { Lock, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage, LanguageSelector } from "@/components/LanguageProvider";
import { authApi } from "@/lib/api";

import { Suspense } from "react";

function ResetPasswordForm() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword });
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 z-50">
        <LanguageSelector />
      </div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
        <div className="flex flex-col items-center justify-center mb-8">
          <Image
            src="/logo.png"
            alt="LeonEd Africa"
            width={180}
            height={60}
            className="h-12 w-auto object-contain"
            priority
          />
          <h2 className="mt-4 text-2xl font-black text-gray-900 tracking-tight text-center">
            Reset Password
          </h2>
          <p className="mt-1.5 text-sm font-semibold text-gray-500 text-center max-w-xs leading-relaxed">
            {isSuccess ? "Your password has been successfully reset." : "Enter your new password below."}
          </p>
        </div>

        {isSuccess ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="bg-emerald-50 p-4 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              </div>
            </div>

            <Link
              href="/login"
              className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-[#053d26] hover:bg-[#042c1b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#053d26] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold text-center animate-pulse">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-4 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-[#053d26] transition-all bg-gray-50/50 hover:bg-gray-50"
                    placeholder="••••••••"
                    disabled={isLoading || !token}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-4 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-[#053d26] transition-all bg-gray-50/50 hover:bg-gray-50"
                    placeholder="••••••••"
                    disabled={isLoading || !token}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-[#053d26] hover:bg-[#042c1b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#053d26] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Resetting...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>
            
            <Link href="/login" className="block text-center text-sm font-bold text-gray-500 hover:text-gray-900 mt-4 transition-colors">
              Return to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#053d26]" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
