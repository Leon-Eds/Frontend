"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, School, User, Mail, Phone, MapPin, Globe, ChevronRight, ChevronLeft, CheckCircle2, Building2, Loader2, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/api";
import { useLanguage, LanguageSelector } from "@/components/LanguageProvider";

export default function RegisterSchoolPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: "",
    schoolType: "",
    address: "",
    city: "",
    state: "",
    country: "",
    studentCount: "",
    adminName: "",
    adminEmail: "",
    adminPhone: "",
    adminRole: "",
    password: "",
    confirmPassword: "",
  });

  const steps = [
    { id: 1, label: t("register.school_name") },
    { id: 2, label: t("register.admin_name") },
    { id: 3, label: t("register.review") },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field when user types
    if (errors[e.target.name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[e.target.name];
        return next;
      });
    }
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.schoolName.trim()) errs.schoolName = "School name is required";
    if (!formData.schoolType) errs.schoolType = "Please select a school type";
    if (!formData.city.trim()) errs.city = "City is required";
    if (!formData.country.trim()) errs.country = "Country is required";
    if (!formData.address.trim()) errs.address = "Address is required";
    return errs;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!formData.adminName.trim()) errs.adminName = "Full name is required";
    if (!formData.adminRole) errs.adminRole = "Please select a role";
    if (!formData.adminEmail.trim()) errs.adminEmail = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) errs.adminEmail = "Enter a valid email address";
    if (!formData.adminPhone.trim()) errs.adminPhone = "Phone number is required";
    if (!formData.password) errs.password = "Password is required";
    else if (formData.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (!formData.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const nextStep = () => {
    let stepErrors: Record<string, string> = {};
    if (currentStep === 1) stepErrors = validateStep1();
    if (currentStep === 2) stepErrors = validateStep2();

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setApiError("");
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleRegister = async () => {
    setIsSubmitting(true);
    setApiError("");
    try {
      await authApi.register({
        schoolName: formData.schoolName,
        adminName: formData.adminName,
        email: formData.adminEmail,
        password: formData.password,
        phone: formData.adminPhone || undefined,
        address: formData.address || undefined,
      });
      router.push("/login");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-white to-[#fef3c7] flex flex-col">
      {/* Navigation */}
      <nav className="w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="LeonEd Africa" width={40} height={40} className="object-contain" />
              <span className="text-xl font-bold text-gray-900">LeonEd Africa</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/#architecture" className="text-sm font-semibold text-gray-500 hover:text-[#053d26] transition-colors">{t("nav.overview")}</Link>
              <Link href="/#why-leoned" className="text-sm font-semibold text-gray-500 hover:text-[#053d26] transition-colors">{t("nav.schedule")}</Link>
            </div>

            {/* Right side Actions */}
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <Link href="/login" className="px-6 py-2.5 rounded-full bg-[#053d26] text-white text-sm font-bold hover:bg-[#042c1b] transition-colors">
                {t("nav.login")}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold text-[#053d26] bg-green-100 mb-4">
              <School className="h-3.5 w-3.5 mr-1.5" />
              {t("register.title").toUpperCase()}
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-[#053d26] mb-2">
              {t("register.title")}
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">
              {t("register.subtitle")}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-0 mb-10">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      currentStep > step.id
                        ? "bg-[#053d26] text-white"
                        : currentStep === step.id
                        ? "bg-[#b05e1c] text-white shadow-lg shadow-orange-900/20"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${
                      currentStep >= step.id ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-20 h-0.5 mx-3 mb-5 transition-colors ${
                      currentStep > step.id ? "bg-[#053d26]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl border border-gray-100">
            {/* Step 1 — School Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#b05e1c]" />
                    {t("register.school_name")}
                  </h2>
                  <p className="text-sm text-gray-500">Tell us about your institution.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("register.school_name")} <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <School className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleChange}
                        className={`block w-full rounded-xl border ${errors.schoolName ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"} py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors`}
                        placeholder="e.g. St. Patrick's Academy"
                      />
                    </div>
                    {errors.schoolName && <p className="text-xs text-red-500 mt-1">{errors.schoolName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("register.school_type")} <span className="text-red-500">*</span></label>
                    <select
                      name="schoolType"
                      value={formData.schoolType}
                      onChange={handleChange}
                      className={`block w-full rounded-xl border ${errors.schoolType ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"} py-3 px-4 text-gray-900 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors appearance-none`}
                    >
                      <option value="">Select school type</option>
                      <option value="primary">Primary School</option>
                      <option value="secondary">Secondary School</option>
                      <option value="combined">Combined (Primary &amp; Secondary)</option>
                      <option value="tertiary">Tertiary Institution</option>
                    </select>
                    {errors.schoolType && <p className="text-xs text-red-500 mt-1">{errors.schoolType}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("register.city")} <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`block w-full rounded-xl border ${errors.city ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"} py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors`}
                        placeholder="Lagos"
                      />
                      {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("register.state")}</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                        placeholder="Lagos State"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("register.country")} <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                          <Globe className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className={`block w-full rounded-xl border ${errors.country ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"} py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors`}
                          placeholder="Nigeria"
                        />
                      </div>
                      {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("register.est_students")}</label>
                      <input
                        type="number"
                        name="studentCount"
                        value={formData.studentCount}
                        onChange={handleChange}
                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                        placeholder="500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("register.address")} <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className={`block w-full rounded-xl border ${errors.address ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"} py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors`}
                        placeholder="12 Academy Drive, Ikeja"
                      />
                    </div>
                    {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Admin Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <User className="h-5 w-5 text-[#b05e1c]" />
                    {t("register.admin_name")}
                  </h2>
                  <p className="text-sm text-gray-500">This will be the primary admin account for your school.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("register.admin_name")} <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="adminName"
                        value={formData.adminName}
                        onChange={handleChange}
                        className={`block w-full rounded-xl border ${errors.adminName ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"} py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors`}
                        placeholder="Dr. Aisha Johnson"
                      />
                    </div>
                    {errors.adminName && <p className="text-xs text-red-500 mt-1">{errors.adminName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("register.official_role")} <span className="text-red-500">*</span></label>
                    <select
                      name="adminRole"
                      value={formData.adminRole}
                      onChange={handleChange}
                      className={`block w-full rounded-xl border ${errors.adminRole ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"} py-3 px-4 text-gray-900 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors appearance-none`}
                    >
                      <option value="">Select your role</option>
                      <option value="principal">Principal / Headmaster</option>
                      <option value="vp">Vice Principal</option>
                      <option value="admin">School Administrator</option>
                      <option value="it">IT Administrator</option>
                      <option value="owner">School Owner / Director</option>
                    </select>
                    {errors.adminRole && <p className="text-xs text-red-500 mt-1">{errors.adminRole}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("login.email")} <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="adminEmail"
                        value={formData.adminEmail}
                        onChange={handleChange}
                        className={`block w-full rounded-xl border ${errors.adminEmail ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"} py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors`}
                        placeholder="admin@school.edu.ng"
                      />
                    </div>
                    {errors.adminEmail && <p className="text-xs text-red-500 mt-1">{errors.adminEmail}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("register.phone")} <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="adminPhone"
                        value={formData.adminPhone}
                        onChange={handleChange}
                        className={`block w-full rounded-xl border ${errors.adminPhone ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"} py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors`}
                        placeholder="+234 801 234 5678"
                      />
                    </div>
                    {errors.adminPhone && <p className="text-xs text-red-500 mt-1">{errors.adminPhone}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("login.password")} <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className={`block w-full rounded-xl border ${errors.password ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"} py-3 pl-4 pr-12 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("register.confirm_password")} <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`block w-full rounded-xl border ${errors.confirmPassword ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"} py-3 pl-4 pr-12 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Confirmation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-[#053d26]" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{t("register.review")}</h2>
                  <p className="text-sm text-gray-500">{t("register.review_sub")}</p>
                </div>

                {apiError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                    {apiError}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#b05e1c] mb-4">{t("register.school_name")}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">{t("register.school_name")}</span>
                        <span className="text-sm font-semibold text-gray-900">{formData.schoolName || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">{t("register.school_type")}</span>
                        <span className="text-sm font-semibold text-gray-900 capitalize">{formData.schoolType || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">{t("register.city")}</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formData.city && formData.country ? `${formData.city}, ${formData.country}` : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">{t("register.est_students")}</span>
                        <span className="text-sm font-semibold text-gray-900">{formData.studentCount || "—"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#b05e1c] mb-4">{t("register.admin_name")}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">{t("register.admin_name")}</span>
                        <span className="text-sm font-semibold text-gray-900">{formData.adminName || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">{t("login.email")}</span>
                        <span className="text-sm font-semibold text-gray-900">{formData.adminEmail || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">{t("register.phone")}</span>
                        <span className="text-sm font-semibold text-gray-900">{formData.adminPhone || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">{t("register.official_role")}</span>
                        <span className="text-sm font-semibold text-gray-900 capitalize">{formData.adminRole || "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-gray-600 font-bold hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("register.back")}
                </button>
              ) : (
                <Link
                  href="/"
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-gray-600 font-bold hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Home
                </Link>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors shadow-lg shadow-green-900/20"
                >
                  {t("register.continue")}
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRegister}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#b05e1c] text-white font-bold hover:bg-[#965017] transition-all shadow-lg shadow-orange-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("register.registering")}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      {t("register.complete")}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Trust badge */}
          <div className="text-center mt-8 flex items-center justify-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-gray-400" />
            <p className="text-xs text-gray-400">
              Your data is encrypted and protected under our{" "}
              <span className="underline underline-offset-2">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
