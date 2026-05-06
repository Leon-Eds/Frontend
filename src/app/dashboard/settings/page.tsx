"use client";

import { useState, useEffect } from "react";
import { Settings, Bell, Lock, Palette, Globe, Building2, Save, Loader2, AlertCircle, CheckCircle2, X } from "lucide-react";
import { authApi } from "@/lib/api";

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

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Load school info from localStorage
  useEffect(() => {
    try {
      const user = localStorage.getItem('leoned_user');
      if (user) {
        const parsed = JSON.parse(user);
        // eslint-disable-next-line
        setSchoolName(parsed.schoolName || "");
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
    // Save to localStorage for now (API for school update is admin-only)
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
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
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
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
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

      {(activeSection === 'appearance' || activeSection === 'localization' || activeSection === 'advanced') && (
        <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-gray-100 text-center">
          <div className="flex justify-end mb-4">
            <button onClick={() => setActiveSection(null)} className="text-gray-400 hover:text-gray-600 p-1"><X className="h-5 w-5" /></button>
          </div>
          <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 text-[#b05e1c] flex items-center justify-center mb-6">
            <Settings className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Coming Soon</h2>
          <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
            This settings section is being developed and will be available in a future release.
          </p>
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
