"use client";

import { useState } from "react";
import { User, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useLanguage, LanguageSelector } from "@/components/LanguageProvider";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      
      const r = response as Record<string, any>;
      const token = r.token;
      const refreshToken = r.refreshToken;
      const user = r.user;
      const tokenExpiry = r.tokenExpiry;
      
      if (!token) {
        console.error("[Login] No token found in response:", r);
        throw new Error("Login succeeded but no security token was returned. Please contact support.");
      }

      // Store auth data
      localStorage.setItem("leoned_token", token);
      if (refreshToken) localStorage.setItem("leoned_refresh_token", refreshToken);
      if (tokenExpiry) localStorage.setItem("leoned_token_expiry", tokenExpiry);
      if (user) localStorage.setItem("leoned_user", JSON.stringify(user));
      
      // Redirect based on role
      if (user?.role === "SuperAdmin") {
        router.push("/super-admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed. Please check your credentials.";
      setError(message);
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
            alt="LeonEd Africa"
            width={100}
            height={100}
            className="object-contain mb-2"
            priority
          />
        </div>

        {/* Login Form */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("login.title")}</h2>
          <p className="text-sm text-gray-500 mb-6">{t("login.subtitle")}</p>
          
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                  placeholder={t("login.email")}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-12 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                  placeholder={t("login.password")}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#053d26] focus:ring-[#053d26]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm font-semibold text-gray-700">
                  {t("login.remember")}
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-semibold text-gray-600 hover:text-[#053d26]">
                  {t("login.forgot")}
                </Link>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-[#053d26] hover:bg-[#042c1b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#053d26] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{t("login.signing_in")}</span>
                  </>
                ) : (
                  <span>{t("login.signin")}</span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-500">{t("login.no_account")} </span>
            <Link href="/register" className="font-semibold text-[#b05e1c] hover:underline">
              {t("login.register_here")}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
