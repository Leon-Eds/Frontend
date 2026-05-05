import { Settings, Bell, Lock, Palette, Globe, Building2 } from "lucide-react";

export default function SettingsPage() {
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
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer group">
          <div className="h-12 w-12 rounded-2xl bg-green-100 text-[#053d26] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">School Profile</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Update school name, address, logo, and contact information.</p>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer group">
          <div className="h-12 w-12 rounded-2xl bg-orange-100 text-[#b05e1c] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Bell className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Notifications</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Configure email alerts, SMS reminders, and in-app notifications.</p>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer group">
          <div className="h-12 w-12 rounded-2xl bg-green-100 text-[#053d26] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Security</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Manage passwords, two-factor authentication, and access logs.</p>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer group">
          <div className="h-12 w-12 rounded-2xl bg-orange-100 text-[#b05e1c] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Palette className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Appearance</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Customize branding colors, report card templates, and themes.</p>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer group">
          <div className="h-12 w-12 rounded-2xl bg-green-100 text-[#053d26] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Globe className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Localization</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Set timezone, language preferences, and regional formatting.</p>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer group">
          <div className="h-12 w-12 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Settings className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Advanced</h3>
          <p className="text-sm text-gray-500 leading-relaxed">API keys, data export, integrations, and developer options.</p>
        </div>
      </div>
    </div>
  );
}
