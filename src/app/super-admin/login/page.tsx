"use client";

import { useState } from "react";
import { ShieldAlert, Lock, Mail, Loader2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useLanguage, LanguageSelector } from "@/components/LanguageProvider";

export default function SuperAdminLoginPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth) - 0.5;
        const y = (clientY / window.innerHeight) - 0.5;
        setMousePos({ x, y });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError("Please enter both email and password.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await authApi.login({
                email: email.trim(),
                password: password.trim(),
                role: 'superadmin'
            });

            const r = response as Record<string, any>;
            const token = r.token;
            const refreshToken = r.refreshToken;
            const tokenExpiry = r.tokenExpiry;
            let userObj = { ...(r.user || r) };

            // Ensure role is set correctly for super admin
            if (!userObj.role || userObj.role.toLowerCase() !== 'superadmin') {
                userObj.role = 'SuperAdmin';
            }

            if (!token) {
                console.error("[SuperAdmin Login] No token found in response:", r);
                throw new Error("Login succeeded but no security token was returned. Please contact support.");
            }

            // Store auth data
            localStorage.setItem("leoned_token", token);
            if (refreshToken) localStorage.setItem("leoned_refresh_token", refreshToken);
            if (tokenExpiry) localStorage.setItem("leoned_token_expiry", tokenExpiry);
            localStorage.setItem("leoned_user", JSON.stringify(userObj));

            // Redirect to super admin dashboard
            router.push("/super-admin");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Login failed. Please check your credentials.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            onMouseMove={handleMouseMove}
            className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-white to-[#fef3c7] dark:from-[#051c11] dark:via-[#111111] dark:to-[#2b1605] flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-500"
        >
            {/* Decorative background meshes with drifting animations and interactive mouse parallax */}
            <div
                className="absolute inset-0 pointer-events-none transition-transform duration-700 ease-out"
                style={{
                    transform: `translate(${mousePos.x * 50}px, ${mousePos.y * 50}px)`
                }}
            >
                {/* Primary forest green glow */}
                <div
                    className="absolute top-[-20%] left-[-15%] w-[65%] h-[65%] rounded-full blur-[130px] animate-drift-one"
                    style={{ backgroundColor: '#053d26', opacity: 0.16 }}
                />
                {/* Accent warm amber glow */}
                <div
                    className="absolute bottom-[-25%] right-[-15%] w-[65%] h-[65%] rounded-full blur-[130px] animate-drift-two"
                    style={{ backgroundColor: '#b05e1c', opacity: 0.18 }}
                />
                {/* Secondary soft sky/teal glow */}
                <div
                    className="absolute top-[25%] left-[20%] w-[45%] h-[45%] rounded-full blur-[140px] animate-drift-one"
                    style={{ backgroundColor: '#0ea5e9', opacity: 0.08 }}
                />
            </div>
            {/* Subtle transparent dot grid on top of the mesh */}
            <div className="absolute inset-0 dot-grid-overlay pointer-events-none" />

            {/* Floating Home Button */}
            <Link
                href="/"
                className="absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-black/60 border border-gray-200/60 dark:border-white/10 shadow-sm text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-[#053d26] dark:hover:text-white hover:bg-white dark:hover:bg-black transition-all backdrop-blur-sm"
            >
                <span className="text-lg leading-none">&larr;</span>
                <span>Home</span>
            </Link>

            {/* Top Right Floating Language Switcher */}
            <div className="absolute top-4 right-4 z-50">
                <LanguageSelector />
            </div>

            <div className="max-w-md w-full bg-white/95 dark:bg-[#151515]/95 rounded-3xl shadow-xl dark:shadow-none p-10 border border-gray-100/80 dark:border-white/10 backdrop-blur-md relative z-10 transition-colors duration-300">

                {/* Logo Section */}
                <div className="flex flex-col items-center justify-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#053d26] to-[#0a6640] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <ShieldAlert className="h-8 w-8 text-white" />
                    </div>
                    <Image
                        src="/logo.png"
                        alt="LeonEd"
                        width={80}
                        height={80}
                        className="object-contain mb-2"
                        priority
                    />
                </div>

                {/* Login Form */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Platform Authority</h2>
                    <p className="text-sm text-gray-500 dark:text-[#a1a1aa] mb-6">Enter credentials for super admin access</p>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit} autoComplete="new-password">
                        <div>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    autoComplete="new-password"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1c1c1c] py-3 pl-12 pr-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white dark:focus:bg-[#222] focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
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
                                    name="password"
                                    id="password"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1c1c1c] py-3 pl-12 pr-12 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white dark:focus:bg-[#222] focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
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
                                    <>
                                        <ShieldAlert className="h-5 w-5" />
                                        <span>Access Dashboard</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center text-sm border-t border-gray-100 dark:border-gray-800 pt-6">
                        <Link href="/super-admin/onboard" className="font-semibold text-[#b05e1c] hover:underline">
                            Platform Onboarding
                        </Link>
                    </div>

                    <div className="mt-4 text-center text-xs text-gray-500">
                        For school access, use the{" "}
                        <Link href="/login" className="font-semibold text-gray-700 dark:text-gray-300 hover:underline">
                            standard login
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
