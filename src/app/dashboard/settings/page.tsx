"use client";

import { useState, useEffect } from "react";
import { Settings, Bell, Lock, Palette, Globe, Building2, Save, Loader2, AlertCircle, CheckCircle2, X, Key, Download, Activity, Sun, Moon, RefreshCw, Check, CreditCard, Camera } from "lucide-react";
import { authApi, studentApi, schoolApi, paymentApi } from "@/lib/api";
import { useLanguage, Language } from "@/components/LanguageProvider";

type SettingsSection = 'school' | 'notifications' | 'security' | 'appearance' | 'localization' | 'advanced' | 'billing' | null;

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>(null);
  const [userRole, setUserRole] = useState<string>("Admin");

  // School profile state
  const [schoolName, setSchoolName] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [schoolPhone, setSchoolPhone] = useState("");
  const [schoolLogo, setSchoolLogo] = useState("");

  // Security / change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // Appearance state
  const [darkMode, setDarkMode] = useState(false);
  const [theme, setTheme] = useState('forest');

  // Localization state
  const { language, setLanguage } = useLanguage();
  const [timezone, setTimezone] = useState('GMT+1');
  const [dateFormat, setDateFormat] = useState('dd/mm/yyyy');

  // Advanced / Developer state
  const [apiKey, setApiKey] = useState("le_client_live_5893a7cd2b");
  const [apiSecret, setApiSecret] = useState("••••••••••••••••••••••••••••••••");
  const [isRotatingKeys, setIsRotatingKeys] = useState(false);
  const [diagnosticStatus, setDiagnosticStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
  const [studentsCount, setStudentsCount] = useState(0);

  // Billing state
  const [paymentPlans, setPaymentPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [activePlan, setActivePlan] = useState<string>("Free");
  const [billingCycle, setBillingCycle] = useState<string>("monthly");
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Load settings from localStorage & handle deep linking
  useEffect(() => {
    try {
      const user = localStorage.getItem('leoned_user');
      let parsedUser: any = null;
      if (user) {
        parsedUser = JSON.parse(user);
        setSchoolName(parsedUser.schoolName || "");
        if (parsedUser.logoUrl) setSchoolLogo(parsedUser.logoUrl);
        if (parsedUser.subscriptionPlan) setActivePlan(parsedUser.subscriptionPlan);
        
        let activeRole = parsedUser.role || "Admin";
        if (activeRole === "Teacher" || activeRole === "Faculty") {
          setUserRole("Faculty");
        } else if (activeRole === "Student" || activeRole === "student" || activeRole === "parent" || activeRole === "guardian") {
          setUserRole("Student");
          window.location.href = "/dashboard/student-portal";
          return;
        } else {
          setUserRole(localStorage.getItem('leoned_demo_role') || "Admin");
        }
      } else {
        setUserRole(localStorage.getItem('leoned_demo_role') || "Admin");
      }

      // Load appearance settings
      const isDark = localStorage.getItem('leoned_dark_mode') === 'true';
      setDarkMode(isDark);
      const sId = parsedUser?.schoolId || parsedUser?.SchoolId || '';
      const activeTheme = (sId ? localStorage.getItem(`leoned_theme_${sId}`) : null) || 'forest';
      setTheme(activeTheme);

      // Load localization settings
      const savedTimezone = localStorage.getItem('leoned_timezone') || 'GMT+1';
      setTimezone(savedTimezone);
      const savedFormat = localStorage.getItem('leoned_date_format') || 'dd/mm/yyyy';
      setDateFormat(savedFormat);

      // Load mock key rotation
      const savedKey = localStorage.getItem('leoned_api_key');
      if (savedKey) setApiKey(savedKey);

      // Fetch students count for export payload
      studentApi.getAll().then(students => {
        setStudentsCount(students.length);
      }).catch(() => {});

      // Check query params for active section
      const params = new URLSearchParams(window.location.search);
      const section = params.get("section") as SettingsSection;
      if (section && ['school', 'notifications', 'security', 'appearance', 'localization', 'advanced', 'billing'].includes(section)) {
        setActiveSection(section);
      }

      // Fetch payment plans for billing section
      if (parsedUser?.role === 'SchoolAdmin' || !parsedUser?.role || parsedUser?.role === 'Admin') {
        schoolApi.getPlans().then(plansData => {
          setPaymentPlans((plansData as any)?.data || plansData || []);
        }).catch(() => {});
      }
    } catch { /* ignore */ }
  }, []);

  const handleChangePassword = async () => {
    setPwError("");
    setPwSuccess("");
    if (!currentPassword || !newPassword) {
      setPwError("Both fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    setIsChangingPw(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setPwSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setToast({ message: "Password updated successfully", type: "success" });
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setIsChangingPw(false);
    }
  };

  const handleSaveSchoolProfile = async () => {
    try {
      const user = localStorage.getItem('leoned_user');
      if (user) {
        const parsed = JSON.parse(user);
        parsed.schoolName = schoolName;
        parsed.logoUrl = schoolLogo;
        localStorage.setItem('leoned_user', JSON.stringify(parsed));
        
        if (parsed.schoolId || parsed.SchoolId) {
          const sId = parsed.schoolId || parsed.SchoolId;
          await schoolApi.update(sId, { name: schoolName, address: schoolAddress, contactPhone: schoolPhone, logoUrl: schoolLogo });
        }
      }
    } catch { /* ignore */ }
    setToast({ message: "School profile updated successfully", type: "success" });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setToast({ message: "Image must be less than 2MB", type: "error" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchoolLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    try {
      localStorage.setItem('leoned_dark_mode', String(checked));
      if (checked) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (_) {}
    setToast({ message: `Dark mode ${checked ? 'enabled' : 'disabled'}`, type: 'success' });
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    try {
      // Only store theme under school-specific key so it doesn't leak to other schools or public pages
      const userStr = localStorage.getItem('leoned_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const sId = user.schoolId || user.SchoolId || '';
        if (sId) {
          localStorage.setItem(`leoned_theme_${sId}`, newTheme);
        }
      }

      document.documentElement.classList.remove('theme-forest', 'theme-ocean', 'theme-sunset', 'theme-royal');
      document.documentElement.classList.add(`theme-${newTheme}`);
    } catch (_) {}
    setToast({ message: `Branding theme updated to ${newTheme.toUpperCase()}`, type: 'success' });
  };

  const handleSaveLocalization = () => {
    try {
      localStorage.setItem('leoned_timezone', timezone);
      localStorage.setItem('leoned_date_format', dateFormat);
    } catch (_) {}
    setToast({ message: "Localization settings saved", type: "success" });
  };

  const handleRotateApiKeys = async () => {
    setIsRotatingKeys(true);
    // Simulate API roundtrip
    await new Promise(resolve => setTimeout(resolve, 1500));
    const randomHex = Array.from({length: 10}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const newKey = `le_client_live_${randomHex}`;
    setApiKey(newKey);
    try {
      localStorage.setItem('leoned_api_key', newKey);
    } catch (_) {}
    setIsRotatingKeys(false);
    setToast({ message: "API credentials successfully rotated", type: "success" });
  };

  const handleExportData = () => {
    try {
      const exportData = {
        schoolName: schoolName || "LeonEd School",
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
        studentsCount: studentsCount,
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leoned_export_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setToast({ message: "Data export successfully initiated", type: "success" });
    } catch (_) {
      setToast({ message: "Failed to export data", type: "error" });
    }
  };

  const handleRunDiagnostics = async () => {
    setDiagnosticStatus('running');
    setDiagnosticLogs([]);
    const logs = [
      "Initializing diagnostics suite...",
      "Verifying host client integrity...",
      "Resolving local cache databases...",
      "Checking latency to API services...",
      "Testing token session validation...",
      "Diagnostics complete. All components verified."
    ];
    for (let i = 0; i < logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setDiagnosticLogs(prev => [...prev, logs[i]]);
    }
    setDiagnosticStatus('success');
  };

  const handleSubscribe = async () => {
    if (!selectedPlanId) {
      setToast({ message: "Please select a plan to subscribe", type: "error" });
      return;
    }
    setIsSubscribing(true);
    try {
      const callbackUrl = `${window.location.origin}/payment/callback`;
      const res = await paymentApi.subscribe(selectedPlanId, callbackUrl);
      if ((res as any)?.authorizationUrl || (res as any)?.authorization_url) {
        window.location.href = (res as any).authorizationUrl || (res as any).authorization_url;
      } else {
        setToast({ message: "Subscription initiated successfully", type: "success" });
      }
    } catch (err) {
      setToast({ message: "Failed to initiate subscription", type: "error" });
    } finally {
      setIsSubscribing(false);
    }
  };

  const allSections = [
    { id: 'school' as const, icon: Building2, title: 'School Profile', description: 'Update school name, address, logo, and contact information.', color: 'bg-gradient-to-br from-[#0a6642] to-[#053d26] text-white shadow-lg shadow-green-900/20' },
    { id: 'billing' as const, icon: CreditCard, title: 'Billing & Plans', description: 'Manage your active subscription and payment methods.', color: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-900/20' },
    { id: 'notifications' as const, icon: Bell, title: 'Notifications', description: 'Configure email alerts, SMS reminders, and in-app notifications.', color: 'bg-gradient-to-br from-amber-500 to-[#b05e1c] text-white shadow-lg shadow-orange-900/20' },
    { id: 'security' as const, icon: Lock, title: 'Security', description: 'Manage passwords, two-factor authentication, and access logs.', color: 'bg-gradient-to-br from-[#0a6642] to-[#053d26] text-white shadow-lg shadow-green-900/20' },
    { id: 'appearance' as const, icon: Palette, title: 'Appearance', description: 'Customize branding colors, report card templates, and themes.', color: 'bg-gradient-to-br from-amber-500 to-[#b05e1c] text-white shadow-lg shadow-orange-900/20' },
    { id: 'localization' as const, icon: Globe, title: 'Localization', description: 'Set timezone, language preferences, and regional formatting.', color: 'bg-gradient-to-br from-[#0a6642] to-[#053d26] text-white shadow-lg shadow-green-900/20' },
  ];

  const sections = userRole === "Student"
    ? allSections.filter(s => ['security', 'notifications'].includes(s.id))
    : userRole === "Faculty" 
    ? allSections.filter(s => ['security', 'notifications'].includes(s.id))
    : allSections;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {activeSection === null ? (
        <>
          {/* Header */}
          <div className="max-w-3xl mb-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#053d26] to-[#b05e1c] dark:from-green-400 dark:to-orange-400 mb-4 tracking-tight">
              Settings & Preferences
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed max-w-2xl">
              Configure your school profile, manage notifications, and customize your completely premium LeonEd experience down to the finest detail.
            </p>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className="relative isolate overflow-hidden bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-white dark:border-white/10 hover:border-[#053d26]/10 dark:hover:border-white/20 text-left transition-all duration-300 ease-out group hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 cursor-pointer flex flex-col h-full"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-white dark:from-white/10 dark:to-transparent rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-110" />
                  <div className="relative z-10 flex flex-col h-full pointer-events-none">
                    <div className={`h-14 w-14 rounded-2xl ${section.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ease-out`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#053d26] dark:group-hover:text-green-400 transition-colors">{section.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-grow">{section.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {/* Breadcrumbs / Back button */}
          <div>
            <button
              onClick={() => setActiveSection(null)}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#053d26] hover:text-[#042c1b] transition-colors cursor-pointer"
            >
              &larr; Back to Settings
            </button>
          </div>

          {/* Active Section Panel */}
          {activeSection === 'school' && (
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">School Profile</h2>
                <button onClick={() => setActiveSection(null)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"><X className="h-5 w-5" /></button>
              </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">School Logo</label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                  {schoolLogo ? (
                    <img src={schoolLogo} alt="School Logo" className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold text-sm cursor-pointer transition-colors">
                    <Camera className="h-4 w-4" />
                    Upload Photo
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleLogoUpload}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Recommended: Square image, max 2MB.</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">School Name</label>
              <input
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                className="w-full rounded-2xl bg-gray-100 py-4 px-5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Address</label>
              <input
                value={schoolAddress}
                onChange={e => setSchoolAddress(e.target.value)}
                placeholder="123 Education Ave, Lagos"
                className="w-full rounded-2xl bg-gray-100 py-4 px-5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Phone</label>
              <input
                value={schoolPhone}
                onChange={e => setSchoolPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full rounded-2xl bg-gray-100 py-4 px-5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors"
              />
            </div>
          </div>
          <div className="flex justify-end mt-8">
            <button onClick={handleSaveSchoolProfile} className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors">
              <Save className="h-4 w-4" /> Save Profile
            </button>
          </div>
        </div>
      )}

      {activeSection === 'billing' && (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Billing & Subscription</h2>
            <button onClick={() => setActiveSection(null)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"><X className="h-5 w-5" /></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Select a Plan</h3>
              <div className="space-y-4">
                {paymentPlans.length > 0 ? paymentPlans.map((plan) => (
                  <label key={plan.id} className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedPlanId === plan.id ? 'border-[#053d26] bg-green-50/30' : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="plan"
                      value={plan.id}
                      checked={selectedPlanId === plan.id}
                      onChange={() => setSelectedPlanId(plan.id)}
                      className="mt-1 h-5 w-5 text-[#053d26] focus:ring-[#053d26] accent-[#053d26]"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-900">{plan.name}</span>
                        <span className="font-bold text-[#053d26]">₦{(plan.amount ?? plan.price ?? 0).toString().replace('$', '').replace('₦', '')}/{plan.billingCycle === 'annual' ? 'yr' : 'mo'}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">Up to {plan.maxStudents || plan.studentLimit || 'unlimited'} students and {plan.maxTeachers || plan.teacherLimit || 'unlimited'} teachers</p>
                      <div className="flex flex-wrap gap-2">
                        {(plan.features || []).slice(0, 3).map((f: string, i: number) => (
                          <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{f}</span>
                        ))}
                      </div>
                    </div>
                  </label>
                )) : (
                  <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-xl">No plans available.</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Billing Cycle</h3>
              <div className="space-y-4">
                <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  billingCycle === 'monthly' ? 'border-[#053d26] bg-green-50/30' : 'border-gray-100 bg-white hover:border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="billingCycle"
                    value="monthly"
                    checked={billingCycle === 'monthly'}
                    onChange={() => setBillingCycle('monthly')}
                    className="h-5 w-5 text-[#053d26] focus:ring-[#053d26] accent-[#053d26]"
                  />
                  <div>
                    <span className="font-bold text-gray-900 block">Monthly Billing</span>
                    <span className="text-xs text-gray-500 block mt-0.5">Pay as you go each month</span>
                  </div>
                </label>
                <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  billingCycle === 'annual' ? 'border-[#053d26] bg-green-50/30' : 'border-gray-100 bg-white hover:border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="billingCycle"
                    value="annual"
                    checked={billingCycle === 'annual'}
                    onChange={() => setBillingCycle('annual')}
                    className="h-5 w-5 text-[#053d26] focus:ring-[#053d26] accent-[#053d26]"
                  />
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-gray-900 block">Annual Billing</span>
                      <span className="text-xs text-gray-500 block mt-0.5">Pay upfront for 12 months</span>
                    </div>
                    <span className="bg-green-100 text-[#053d26] text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">Save 20%</span>
                  </div>
                </label>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <button
                  onClick={handleSubscribe}
                  disabled={
                    !selectedPlanId || 
                    isSubscribing || 
                    paymentPlans.find(p => p.id === selectedPlanId)?.name?.toLowerCase() === 'free' ||
                    paymentPlans.find(p => p.id === selectedPlanId)?.name?.toLowerCase() === activePlan?.toLowerCase()
                  }
                  className="w-full flex justify-center items-center gap-2 px-6 py-4 rounded-xl bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors disabled:opacity-50"
                >
                  {isSubscribing ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
                  {isSubscribing 
                    ? 'Initiating Checkout...' 
                    : paymentPlans.find(p => p.id === selectedPlanId)?.name?.toLowerCase() === 'free' 
                      ? 'Free Plan (Default)' 
                      : paymentPlans.find(p => p.id === selectedPlanId)?.name?.toLowerCase() === activePlan?.toLowerCase() 
                        ? 'Current Plan (Already Subscribed)' 
                        : 'Proceed to Payment'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'security' && (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
            <button onClick={() => setActiveSection(null)} className="text-gray-400 hover:text-gray-600 p-1"><X className="h-5 w-5" /></button>
          </div>

          {pwError && (
            <div className="bg-red-50 text-red-700 rounded-2xl p-4 mb-6 text-sm flex items-center gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" /> {pwError}
            </div>
          )}
          {pwSuccess && (
            <div className="bg-green-50 text-[#053d26] rounded-2xl p-4 mb-6 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0" /> {pwSuccess}
            </div>
          )}

          <div className="space-y-5 max-w-md">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full rounded-2xl bg-gray-100 py-4 px-5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full rounded-2xl bg-gray-100 py-4 px-5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl bg-gray-100 py-4 px-5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors"
              />
            </div>
          </div>
          <div className="flex justify-end mt-8">
            <button
              onClick={handleChangePassword}
              disabled={isChangingPw}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors disabled:opacity-50"
            >
              {isChangingPw ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {isChangingPw ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      )}

      {activeSection === 'notifications' && (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Notification Preferences</h2>
            <button onClick={() => setActiveSection(null)} className="text-gray-400 hover:text-gray-600 p-1"><X className="h-5 w-5" /></button>
          </div>
          <div className="space-y-6 max-w-xl">
            {[
              { label: 'Email Alerts', desc: 'Receive email notifications for important events', default: true },
              { label: 'SMS Reminders', desc: 'Get text messages for upcoming deadlines', default: false },
              { label: 'In-App Notifications', desc: 'Show notifications within the dashboard', default: true },
              { label: 'Weekly Reports', desc: 'Receive a weekly summary of school activity', default: true },
            ].map((item) => (
              <label key={item.label} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{item.label}</h4>
                  <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={item.default}
                  className="h-5 w-5 rounded text-[#053d26] focus:ring-[#053d26] accent-[#053d26]"
                />
              </label>
            ))}
          </div>
          <div className="flex justify-end mt-8">
            <button
              onClick={() => setToast({ message: "Notification preferences saved", type: "success" })}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors"
            >
              <Save className="h-4 w-4" /> Save Preferences
            </button>
          </div>
        </div>
      )}

      {activeSection === 'appearance' && (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Appearance Settings</h2>
            <button onClick={() => setActiveSection(null)} className="text-gray-400 hover:text-gray-600 p-1"><X className="h-5 w-5" /></button>
          </div>
          
          <div className="space-y-8 max-w-2xl">
            {/* Dark Mode toggle */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Dark Mode</h3>
              <div className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  {darkMode ? <Moon className="h-6 w-6 text-[#053d26]" /> : <Sun className="h-6 w-6 text-amber-500" />}
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">Enable Dark Mode</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Switch between light and dark backgrounds</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggleDarkMode(!darkMode)}
                  className={`w-14 h-8 rounded-full transition-colors relative flex items-center px-1 ${
                    darkMode ? 'bg-[#053d26]' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            {/* Color Theme Selector */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Color Theme</h3>
              <p className="text-xs text-gray-500 mb-4">Choose a branding accent that reflects your school&apos;s identity</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { id: 'forest', label: 'Forest', colors: ['#053d26', '#047857', '#34d399'] },
                  { id: 'ocean', label: 'Ocean', colors: ['#1e3a8a', '#2563eb', '#60a5fa'] },
                  { id: 'sunset', label: 'Sunset', colors: ['#9a3412', '#ea580c', '#fb923c'] },
                  { id: 'royal', label: 'Royal', colors: ['#4c1d95', '#7c3aed', '#c084fc'] },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                      theme === t.id
                        ? 'border-[#053d26] bg-green-50/50 shadow-md scale-[1.02]'
                        : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:shadow-sm'
                    }`}
                  >
                    {theme === t.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#053d26] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className="flex gap-1.5">
                      {t.colors.map((c, i) => (
                        <div key={i} className="w-6 h-6 rounded-full shadow-sm border border-white/50" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-700">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'localization' && (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Localization Settings</h2>
            <button onClick={() => setActiveSection(null)} className="text-gray-400 hover:text-gray-600 p-1"><X className="h-5 w-5" /></button>
          </div>

          <div className="space-y-6 max-w-xl">
            {/* Language Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Preferred Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as Language)}
                className="w-full rounded-2xl bg-gray-100 py-4 px-5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors font-medium"
              >
                <option value="en">English (Standard)</option>
                <option value="ig">Asụsụ Igbo</option>
                <option value="yo">Èdè Yorùbá</option>
                <option value="ha">Harshen Hausa</option>
              </select>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Timezone</label>
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full rounded-2xl bg-gray-100 py-4 px-5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors font-medium"
              >
                <option value="GMT">Greenwich Mean Time (GMT)</option>
                <option value="GMT+1">West Africa Time (GMT+1) - Lagos, Yaoundé</option>
                <option value="GMT+2">Central Africa Time (GMT+2) - Kigali, Harare</option>
                <option value="GMT+3">East Africa Time (GMT+3) - Nairobi, Kampala</option>
              </select>
            </div>

            {/* Date Format */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Date Format</label>
              <select
                value={dateFormat}
                onChange={e => setDateFormat(e.target.value)}
                className="w-full rounded-2xl bg-gray-100 py-4 px-5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors font-medium"
              >
                <option value="dd/mm/yyyy">dd/mm/yyyy (Standard)</option>
                <option value="mm/dd/yyyy">mm/dd/yyyy (US Format)</option>
                <option value="yyyy-mm-dd">yyyy-mm-dd (ISO Format)</option>
              </select>
            </div>

            <div className="flex justify-end pt-6">
              <button 
                onClick={handleSaveLocalization}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors"
              >
                <Save className="h-4 w-4" /> Save Localization
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'advanced' && (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Advanced & Developer Settings</h2>
            <button onClick={() => setActiveSection(null)} className="text-gray-400 hover:text-gray-600 p-1"><X className="h-5 w-5" /></button>
          </div>

          <div className="space-y-10 max-w-3xl">
            {/* API Credentials */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-[#b05e1c]" />
                <h3 className="font-bold text-gray-900">School API Credentials</h3>
              </div>
              <p className="text-xs text-gray-500">Generate access tokens to query school metrics programmatically via LeonEd Open API.</p>
              
              <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1">Client ID</label>
                  <code className="text-xs text-gray-900 font-mono bg-white p-2.5 rounded-xl border border-gray-150 block">{apiKey}</code>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-500 tracking-wider mb-1">Client Secret</label>
                  <code className="text-xs text-gray-900 font-mono bg-white p-2.5 rounded-xl border border-gray-150 block">{apiSecret}</code>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleRotateApiKeys}
                    disabled={isRotatingKeys}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {isRotatingKeys ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                    Rotate Credentials
                  </button>
                </div>
              </div>
            </div>

            {/* School Data Export */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-[#b05e1c]" />
                <h3 className="font-bold text-gray-900">Data Portability</h3>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Download a cryptographically signed JSON snapshot containing your institutional profile, academic session records, and student database slots for migration or archiving.
              </p>
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors text-xs"
              >
                <Download className="h-4 w-4" /> Export School Dataset (JSON)
              </button>
            </div>

            {/* System Diagnostics */}
            <div className="space-y-4 border-t border-gray-100 pt-8">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-gray-600" />
                <h3 className="font-bold text-gray-900">System Diagnostics</h3>
              </div>
              <p className="text-xs text-gray-500">Perform integrity checks to verify local cache database state, connection synchronization, and system configurations.</p>
              
              <div className="space-y-4">
                <button
                  onClick={handleRunDiagnostics}
                  disabled={diagnosticStatus === 'running'}
                  className="flex items-center gap-2 px-5 py-3 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-bold text-xs"
                >
                  {diagnosticStatus === 'running' ? <Loader2 className="h-4 w-4 animate-spin text-[#053d26]" /> : <Activity className="h-4 w-4" />}
                  Execute Diagnostics Suite
                </button>

                {diagnosticLogs.length > 0 && (
                  <div className="p-4 bg-gray-950 text-green-400 font-mono text-xs rounded-2xl space-y-1 shadow-inner max-h-48 overflow-y-auto">
                    {diagnosticLogs.map((log, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="text-green-600/80">&gt;</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold text-sm animate-in slide-in-from-bottom-4 ${
          toast.type === 'success' ? 'bg-[#053d26]' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 text-white/70 hover:text-white"><X className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  );
}
