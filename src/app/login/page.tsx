"use client";

import { useState, useEffect } from "react";
import { User, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useLanguage, LanguageSelector } from "@/components/LanguageProvider";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [displayLogo, setDisplayLogo] = useState("/logo.png");


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
        role: selectedRole.toLowerCase()
      });
      
      const r = response as Record<string, any>;
      const token = r.token;
      const refreshToken = r.refreshToken;
      const tokenExpiry = r.tokenExpiry;
      let userObj = { ...(r.user || r.teacher || r.student || r.parent || r.guardian || r) };
      
      // Merge nested teacher data into userObj if present separately
      if (r.teacher && typeof r.teacher === 'object') {
        userObj = { ...userObj, teacher: r.teacher };
        if (!userObj.profilePictureUrl && r.teacher.profilePictureUrl) {
          userObj.profilePictureUrl = r.teacher.profilePictureUrl;
        }
        if (!userObj.name && r.teacher.fullName) {
          userObj.name = r.teacher.fullName;
        }
      }

      // Merge nested student data into userObj
      if (r.student && typeof r.student === 'object') {
        userObj = { ...userObj, student: r.student, ...r.student };
      }

      // Merge school data (address, phone) if returned in login
      if (r.school && typeof r.school === 'object') {
        if (!userObj.address && r.school.address) userObj.address = r.school.address;
        if (!userObj.phone && r.school.phone) userObj.phone = r.school.phone;
        if (!userObj.logoUrl && r.school.logoUrl) userObj.logoUrl = r.school.logoUrl;
        if (r.school.theme) userObj.schoolTheme = r.school.theme;
        if (r.school.font) userObj.schoolFont = r.school.font;
      }
      
      if (!userObj.logoUrl && r.logoUrl) userObj.logoUrl = r.logoUrl;
      
      // Explicitly set role if backend wraps it in specific keys but omits the role string
      if (r.student && !userObj.role) userObj.role = 'student';
      if (r.teacher && !userObj.role) userObj.role = 'teacher';
      if (r.faculty && !userObj.role) userObj.role = 'faculty';
      if (r.parent && !userObj.role) userObj.role = 'parent';
      
      // Additional fallback heuristics
      if (!userObj.role) {
        if (userObj.admissionNumber || userObj.parentEmail) userObj.role = 'student';
        else if (userObj.subscriptionPlan || userObj.adminName) userObj.role = 'schooladmin';
      }

      // Ensure schoolId is captured from all possible response locations
      if (!userObj.schoolId) {
        const possibleSchoolId = r.schoolId || r.school?.id || r.school?._id 
          || userObj.school?.id || userObj.school?._id;
        if (possibleSchoolId) {
          userObj.schoolId = possibleSchoolId;
        }
      }

      // Fallback: extract schoolId from JWT token's `sid` claim (.NET convention)
      if (!userObj.schoolId && token) {
        try {
          const jwtPayload = JSON.parse(atob(token.split('.')[1]));
          const fromJwt = jwtPayload.schoolId || jwtPayload.SchoolId || jwtPayload.sid;
          if (fromJwt) {
            userObj.schoolId = fromJwt;
          }
        } catch {}
      }

      // Restore logo from local cache if backend didn't return it
      if (userObj.schoolId && !userObj.logoUrl && typeof window !== 'undefined') {
        const savedLogo = localStorage.getItem(`leoned_logo_${userObj.schoolId}`);
        if (savedLogo) {
          userObj.logoUrl = savedLogo;
        }
      }

      console.log("[Login] User object to store:", JSON.stringify(userObj));

      // Validate that the returned role matches the selected login role
      const returnedRole = (userObj.role || '').toLowerCase().trim();
      const selectedRoleLower = selectedRole.toLowerCase();
      
      // Map selected role names to what the backend might return
      const roleMatches = (returned: string, selected: string): boolean => {
        if (selected === 'admin') {
          return ['schooladmin', 'admin', 'school_admin', ''].includes(returned) 
            || (!['teacher', 'faculty', 'student', 'parent', 'guardian', 'bursar'].includes(returned));
        }
        if (selected === 'teacher') {
          return ['teacher', 'faculty'].includes(returned);
        }
        if (selected === 'student') {
          return ['student', 'parent', 'guardian'].includes(returned);
        }
        if (selected === 'bursar') {
          return ['bursar'].includes(returned);
        }
        return true;
      };

      if (returnedRole && !roleMatches(returnedRole, selectedRoleLower)) {
        throw new Error(`This account is registered as ${returnedRole === 'schooladmin' ? 'a School Admin' : 'a ' + returnedRole.charAt(0).toUpperCase() + returnedRole.slice(1)}. Please select the correct role and try again.`);
      }

      if (!token) {
        console.error("[Login] No token found in response:", r);
        throw new Error("Login succeeded but no security token was returned. Please contact support.");
      }

      // Store auth data
      localStorage.setItem("leoned_token", token);
      if (refreshToken) localStorage.setItem("leoned_refresh_token", refreshToken);
      if (tokenExpiry) localStorage.setItem("leoned_token_expiry", tokenExpiry);

      if (Object.keys(userObj).length > 0) {
        localStorage.setItem("leoned_user", JSON.stringify(userObj));
        if (userObj.logoUrl) {
          // Remove persistent logo saving to keep login generic
        }
        if (userObj.schoolId) {
          if (userObj.schoolTheme && typeof userObj.schoolTheme === 'string') localStorage.setItem(`leoned_theme_${userObj.schoolId}`, userObj.schoolTheme);
          if (userObj.schoolFont) localStorage.setItem(`leoned_font_${userObj.schoolId}`, userObj.schoolFont);
        }
      } else {
        localStorage.setItem("leoned_user", JSON.stringify({ role: selectedRoleLower, name: "User" }));
      }
      
      // Store selected role for portal context across the app
      localStorage.setItem("leoned_demo_role", selectedRole);
      
      // Synchronously apply the theme BEFORE client-side navigation to prevent FOUC (delay)
      try {
        // ALWAYS reset to default first so a previous school's theme doesn't bleed over
        document.documentElement.classList.remove('theme-forest', 'theme-ocean', 'theme-sunset', 'theme-royal', 'font-sans', 'font-serif', 'font-mono');
        document.documentElement.style.removeProperty('--theme-primary');
        document.documentElement.style.removeProperty('--theme-secondary');
        document.documentElement.style.removeProperty('--theme-accent');

        const sId = userObj.schoolId || userObj.SchoolId;
        if (sId) {
          const themeStr = localStorage.getItem(`leoned_theme_${sId}`);
          if (themeStr && themeStr !== '[object Object]') {
            document.documentElement.classList.add(`theme-${themeStr}`);
          }
          const fontStr = localStorage.getItem(`leoned_font_${sId}`);
          if (fontStr && fontStr !== '[object Object]') {
            document.documentElement.classList.add(`font-${fontStr}`);
          }
        }
        
        // Handle object format returned directly by the API
        if (userObj.schoolTheme && typeof userObj.schoolTheme === 'object') {
          if (userObj.schoolTheme.primaryColor) document.documentElement.style.setProperty('--theme-primary', userObj.schoolTheme.primaryColor);
          if (userObj.schoolTheme.secondaryColor) document.documentElement.style.setProperty('--theme-secondary', userObj.schoolTheme.secondaryColor);
          if (userObj.schoolTheme.accentColor) document.documentElement.style.setProperty('--theme-accent', userObj.schoolTheme.accentColor);
          if (userObj.schoolTheme.font) document.documentElement.classList.add(`font-${userObj.schoolTheme.font.toLowerCase()}`);
        } else if (typeof userObj.schoolTheme === 'string') {
          document.documentElement.classList.add(`theme-${userObj.schoolTheme}`);
        }
      } catch (e) {}
      
      // Redirect based on role — use selectedRole as primary since it's user intent
      const effectiveRole = returnedRole || selectedRoleLower;
      if (effectiveRole === "superadmin") {
        router.push("/super-admin");
      } else if (selectedRoleLower === "student" || effectiveRole === "student" || effectiveRole === "parent" || effectiveRole === "guardian") {
        router.push("/dashboard/student-portal");
      } else if (selectedRoleLower === "teacher" || effectiveRole === "teacher" || effectiveRole === "faculty") {
        router.push("/dashboard/faculty");
      } else if (selectedRoleLower === "bursar" || effectiveRole === "bursar") {
        router.push("/dashboard/bursar");
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
          <Image
            src={displayLogo}
            alt="LeonEd"
            width={100}
            height={100}
            className="object-contain mb-2"
            priority
          />
        </div>

        {/* Login Form */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t("login.title")}</h2>
          <p className="text-sm text-gray-500 dark:text-[#a1a1aa] mb-6">{t("login.subtitle")}</p>
          
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Login As</p>
            <div className="grid grid-cols-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              {["Admin", "Teacher", "Student", "Bursar"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                    selectedRole === r
                      ? "bg-white dark:bg-gray-700 text-[#053d26] dark:text-green-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  {r === "Admin" ? "School Admin" : r}
                </button>
              ))}
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} autoComplete="new-password">
            <div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="email"
                  id="email"
                  autoComplete="new-password"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                  placeholder={selectedRole === "Student" ? "Admission / Registration Number" : t("login.email")}
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
                <label htmlFor="remember-me" className="ml-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t("login.remember")}
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-semibold text-gray-600 dark:text-gray-400 hover:text-[#053d26] dark:hover:text-blue-400">
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
