"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, User, Phone, Building2, ChevronLeft, CheckCircle2, Send } from "lucide-react";

export default function RequestDemoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    schoolName: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Your name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Enter a valid email";
    if (!formData.schoolName.trim()) newErrors.schoolName = "School name is required";
    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setSubmitted(true);
  };

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

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/#architecture" className="text-sm font-semibold text-gray-500 hover:text-[#053d26] transition-colors">Term Overview</Link>
              <Link href="/#why-leoned" className="text-sm font-semibold text-gray-500 hover:text-[#053d26] transition-colors">Schedule</Link>
            </div>

            <div className="flex items-center gap-6">
              <Link href="/login" className="px-6 py-2.5 rounded-full bg-[#053d26] text-white text-sm font-bold hover:bg-[#042c1b] transition-colors">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full">
          {!submitted ? (
            <>
              <div className="text-center mb-10">
                <div className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold text-[#053d26] bg-green-100 mb-4">
                  SCHEDULE A DEMO
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-[#053d26] mb-2">
                  Request a Demo
                </h1>
                <p className="text-gray-600 max-w-md mx-auto">
                  See how LeonEd Africa can transform your school&apos;s academic management. Our team will walk you through the platform.
                </p>
              </div>

              <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl border border-gray-100">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`block w-full rounded-xl border ${errors.name ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"} py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors`}
                        placeholder="Dr. Aisha Johnson"
                      />
                    </div>
                    {errors.name && <p className="text-xs text-red-500 mt-1.5">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`block w-full rounded-xl border ${errors.email ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"} py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors`}
                        placeholder="admin@school.edu.ng"
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                        placeholder="+234 801 234 5678"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">School / Institution Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleChange}
                        className={`block w-full rounded-xl border ${errors.schoolName ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"} py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors`}
                        placeholder="St. Patrick's Academy"
                      />
                    </div>
                    {errors.schoolName && <p className="text-xs text-red-500 mt-1.5">{errors.schoolName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message (Optional)</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={3}
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors resize-none"
                      placeholder="Tell us about your school's needs..."
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                  <Link
                    href="/"
                    className="flex items-center gap-2 px-6 py-3 rounded-full text-gray-600 font-bold hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Home
                  </Link>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#b05e1c] text-white font-bold hover:bg-[#965017] transition-all shadow-lg shadow-orange-900/20"
                  >
                    <Send className="h-4 w-4" />
                    Submit Request
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-[2rem] p-10 md:p-14 shadow-xl border border-gray-100 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <CheckCircle2 className="h-8 w-8 text-[#053d26]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Demo Request Received!</h2>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                Thank you, {formData.name}. Our team will contact you at <span className="font-semibold text-gray-700">{formData.email}</span> within 24 hours to schedule your demo.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/"
                  className="px-6 py-3 rounded-full bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                >
                  Back to Home
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors"
                >
                  Register Now
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
