"use client";

import { useState } from "react";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage, LanguageSelector } from "@/components/LanguageProvider";
import { authApi } from "@/lib/api";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.forgotPassword({ email: email.trim() });
      setIsSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative">
      {/* Top Right Floating Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSelector />
      </div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
        {/* Logo Section */}
        <div className="flex flex-col items-center justify-center mb-8">
          <Image
            src="/logo.png"
            alt="LeonEd"
            width={180}
            height={60}
            className="h-12 w-auto object-contain"
            priority
          />
          <h2 className="mt-4 text-2xl font-black text-gray-900 tracking-tight text-center">
            {isSubmitted ? t("forgot.success_title") : t("forgot.title")}
          </h2>
          <p className="mt-1.5 text-sm font-semibold text-gray-500 text-center max-w-xs leading-relaxed">
            {isSubmitted ? t("forgot.success_desc") : t("forgot.subtitle")}
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="bg-emerald-50 p-4 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              </div>
            </div>

            <div className="bg-gray-55/40 border border-gray-100 rounded-2xl p-4 text-center">
              <span className="text-xs text-gray-400 font-medium block mb-1">Sent to</span>
              <span className="text-sm text-gray-800 font-bold break-all">{email}</span>
            </div>

            <button
              onClick={() => {
                setIsSubmitted(false);
                setEmail("");
              }}
              className="w-full py-4 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors block text-center"
            >
              Try another email address
            </button>

            <Link
              href="/login"
              className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-[#053d26] hover:bg-[#042c1b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#053d26] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{t("forgot.back_login")}</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold text-center animate-pulse">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                {t("forgot.email")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-[#053d26] transition-all bg-gray-50/50 hover:bg-gray-50"
                  placeholder="name@school.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-[#053d26] hover:bg-[#042c1b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#053d26] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <span>{t("forgot.send")}</span>
              )}
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#053d26] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t("forgot.back_login")}</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
