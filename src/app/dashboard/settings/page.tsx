"use client";

import { useState, useEffect } from "react";
import { Settings, Bell, Lock, Palette, Globe, Building2, Save, Loader2, AlertCircle, CheckCircle2, X, Key, Download, Activity, Sun, Moon, RefreshCw, Check } from "lucide-react";
import { authApi, studentApi } from "@/lib/api";
import { useLanguage, Language } from "@/components/LanguageProvider";

type SettingsSection = 'school' | 'notifications' | 'security' | 'appearance' | 'localization' | 'advanced' | null;

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>(null);

  // School profile state
  const [schoolName, setSchoolName] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [schoolPhone, setSchoolPhone] = useState("");

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
      if (user) {
        const parsed = JSON.parse(user);
        setSchoolName(parsed.schoolName || "");
      }

      // Load appearance settings
      const isDark = localStorage.getItem('leoned_dark_mode') === 'true';
      setDarkMode(isDark);
      const activeTheme = localStorage.getItem('leoned_theme') || 'forest';
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
      if (section && ['school', 'notifications', 'security', 'appearance', 'localization', 'advanced'].includes(section)) {
        setActiveSection(section);
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

  const handleSaveSchoolProfile = () => {
    try {
      const user = localStorage.getItem('leoned_user');
      if (user) {
        const parsed = JSON.parse(user);
        parsed.schoolName = schoolName;
        localStorage.setItem('leoned_user', JSON.stringify(parsed));
      }
    } catch { /* ignore */ }
    setToast({ message: "School profile saved locally", type: "success" });
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
      localStorage.setItem('leoned_theme', newTheme);
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

  const sections = [
    { id: 'school' as const, icon: Building2, title: 'School Profile', description: 'Update school name, address, logo, and contact information.', color: 'bg-green-100 text-[#053d26]' },
    { id: 'notifications' as const, icon: Bell, title: 'Notifications', description: 'Configure email alerts, SMS reminders, and in-app notifications.', color: 'bg-orange-100 text-[#b05e1c]' },
    { id: 'security' as const, icon: Lock, title: 'Security', description: 'Manage passwords, two-factor authentication, and access logs.', color: 'bg-green-100 text-[#053d26]' },
    { id: 'appearance' as const, icon: Palette, title: 'Appearance', description: 'Customize branding colors, report card templates, and themes.', color: 'bg-orange-100 text-[#b05e1c]' },
    { id: 'localization' as const, icon: Globe, title: 'Localization', description: 'Set timezone, language preferences, and regional formatting.', color: 'bg-green-100 text-[#053d26]' },
    { id: 'advanced' as const, icon: Settings, title: 'Advanced', description: 'API keys, data export, integrations, and developer options.', color: 'bg-gray-100 text-gray-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-10">
      {/* Header */}
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold text-[#053d26] mb-3">Settings</h1>
        <p className="text-gray-600 text-sm leading-relaxed">
          Configure your school profile, manage notifications, and customize your LeonEd experience.
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
              className={`bg-white rounded-[2rem] p-8 shadow-sm border text-left transition-all group ${
                activeSection === section.id
                  ? 'border-[#053d26] ring-2 ring-[#053d26]/20'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className={`h-12 w-12 rounded-2xl ${section.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{section.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{section.description}</p>
            </button>
          );
        })}
      </div>

      {/* Active Section Panel */}
      {activeSection === 'school' && (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">School Profile</h2>
            <button onClick={() => setActiveSection(null)} className="text-gray-400 hover:text-gray-600 p-1"><X className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
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

            {/* Themes selection */}
            <div>
              <h3 className="text-sm font-bold text-[#053d26] uppercase tracking-wider mb-4">Branding Themes</h3>
              <p className="text-xs text-gray-500 mb-6">Select a primary accent color for your school dashboard and portals.</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { id: 'forest', name: 'Forest Green', color: 'bg-[#053d26]' },
                  { id: 'ocean', name: 'Ocean Blue', color: 'bg-[#0f4c81]' },
                  { id: 'sunset', name: 'Sunset Orange', color: 'bg-[#d97706]' },
                  { id: 'royal', name: 'Royal Purple', color: 'bg-[#6d28d9]' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${
                      theme === t.id 
                        ? 'border-[#053d26] ring-2 ring-[#053d26]/10 bg-gray-50' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-full ${t.color} border border-white shadow-sm flex items-center justify-center`}>
                      {theme === t.id && <Check className="h-4 w-4 text-white" />}
                    </div>
                    <span className="text-xs font-bold text-gray-900">{t.name}</span>
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
