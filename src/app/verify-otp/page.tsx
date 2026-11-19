"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";
import { KeyRound, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useLanguage } from "@/components/LanguageProvider";

function VerifyOtpContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error(t("auth.otp_required"));
      return;
    }
    if (!email) {
      toast.error(t("auth.email_missing"));
      return;
    }

    setIsLoading(true);
    try {
      await authApi.verifyOtp({ email, otp });
      toast.success(t("auth.verified"));
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message || t("auth.otp_invalid"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error(t("auth.email_missing"));
      return;
    }
    setIsResending(true);
    try {
      await authApi.resendOtp({ email });
      toast.success(t("auth.otp_resent"));
    } catch (err: any) {
      toast.error(err.message || t("auth.resend_failed"));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-white to-[#fef3c7] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] p-8 md:p-10 shadow-xl border border-gray-100 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#053d26] to-[#b05e1c]" />
        
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 border border-orange-100">
            <KeyRound className="h-8 w-8 text-[#b05e1c]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("auth.verify_title")}</h1>
          <p className="text-sm text-gray-500">
            {t("auth.verify_d")} <br />
            <span className="font-semibold text-gray-900">{email || t("auth.your_email")}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          {!emailParam && (
             <div>
               <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("enr.s2.email")}</label>
               <input
                 type="email"
                 required
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors text-center font-medium"
                 placeholder={t("auth.email_ph")}
                 disabled={isLoading || isResending}
               />
             </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-center">{t("auth.enter_otp")}</label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // only digits
              className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-4 px-4 text-gray-900 placeholder:text-gray-300 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors text-center text-2xl font-bold tracking-[0.5em]"
              placeholder="000000"
              disabled={isLoading || isResending}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !otp || otp.length < 4}
            className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-[#053d26] hover:bg-[#042c1b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#053d26] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {t("auth.verify_btn")} <ArrowRight className="h-5 w-5 ml-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">{t("auth.no_code")}</p>
          <button
            onClick={handleResend}
            disabled={isResending || isLoading}
            className="text-sm font-bold text-[#b05e1c] hover:underline disabled:opacity-50"
          >
            {isResending ? t("auth.resending") : t("auth.resend")}
          </button>
        </div>
      </div>
      
      <div className="mt-8">
        <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900">
          {t("forgot.back_login")}
        </Link>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#053d26]" /></div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
