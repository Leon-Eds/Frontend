"use client";

import { useEffect, useState } from "react";
import { 
  Settings, 
  Shield, 
  Key, 
  Bell, 
  Globe, 
  Database, 
  Lock, 
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  BookOpen
} from "lucide-react";
import { authApi, gradingApi } from "@/lib/api";

export default function SuperAdminSettings() {
  const [activeTab, setActiveTab] = useState("Security");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("leoned_user");
      if (storedUser) setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSave = () => {
    setIsLoading(true);
    // Simulate API call for settings
    setTimeout(() => {
      setIsLoading(false);
      setMessage({ type: "success", text: `${activeTab} settings updated successfully.` });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }, 1500);
  };

  const tabs = [
    { id: "Security", name: "Security & Authority", icon: Shield },
    { id: "Grading", name: "Academic Grading", icon: BookOpen },
  ];

  const [gradingRules, setGradingRules] = useState<any[]>([]);

  useEffect(() => {
    gradingApi.getRules().then(rules => {
      if (rules && rules.length > 0) {
        setGradingRules(rules);
      } else {
        setGradingRules([
          { grade: "A", minScore: 75, maxScore: 100, remark: "Excellent" },
          { grade: "B", minScore: 60, maxScore: 74, remark: "Good" },
          { grade: "C", minScore: 50, maxScore: 59, remark: "Credit" },
          { grade: "D", minScore: 40, maxScore: 49, remark: "Pass" },
          { grade: "F", minScore: 0, maxScore: 39, remark: "Fail" },
        ]);
      }
    }).catch(() => {
      setGradingRules([
        { grade: "A", minScore: 75, maxScore: 100, remark: "Excellent" },
        { grade: "B", minScore: 60, maxScore: 74, remark: "Good" },
        { grade: "C", minScore: 50, maxScore: 59, remark: "Credit" },
        { grade: "D", minScore: 40, maxScore: 49, remark: "Pass" },
        { grade: "F", minScore: 0, maxScore: 39, remark: "Fail" },
      ]);
    });
  }, []);

  const handleSaveGrading = async () => {
    setIsLoading(true);
    try {
      await gradingApi.setRules({ rules: gradingRules });
      setMessage({ type: "success", text: "Grading rules updated successfully." });
    } catch (e) {
      setMessage({ type: "error", text: "Failed to update grading rules." });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Configuration</h1>
        <p className="text-gray-600">Manage global platform parameters, security policies, and system-wide defaults.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
          message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
        }`}>
          {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all border ${
                activeTab === tab.id 
                  ? "bg-[#053d26] text-white shadow-md border-[#053d26]" 
                  : "bg-white text-gray-600 hover:bg-gray-50 border-transparent"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          {activeTab === "Security" ? (
            <>
              {/* Security Section */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <Lock className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Security Policies</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Two-Factor Authentication (2FA)</p>
                      <p className="text-xs text-gray-500">Enforce 2FA for all Super Admin accounts.</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out bg-green-500 rounded-full cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 transition duration-200 ease-in-out transform translate-x-6 bg-white rounded-full"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Session Timeout</p>
                      <p className="text-xs text-gray-500">Automatically logout inactive users after 30 minutes.</p>
                    </div>
                    <select className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#053d26]">
                      <option>30 Minutes</option>
                      <option>1 Hour</option>
                      <option>4 Hours</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Master Key Section */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-6 text-gray-900">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-[#053d26]">
                    <Key className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Authority Secret Key</h2>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Changing the system secret key will invalidate the current onboarding workflow until updated in the backend configuration.
                  </p>
                  <div className="relative">
                    <input 
                      type="password" 
                      value="••••••••••••••••" 
                      readOnly
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 font-mono text-sm"
                    />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#053d26] hover:underline uppercase tracking-wider">
                      Rotate Key
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === "Grading" ? (
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Academic Grading Rules</h2>
              </div>
              <div className="space-y-4">
                {gradingRules.map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-16">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Grade</label>
                      <input 
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-900"
                        value={rule.grade}
                        onChange={(e) => {
                          const newRules = [...gradingRules];
                          newRules[idx].grade = e.target.value;
                          setGradingRules(newRules);
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Min Score</label>
                      <input 
                        type="number"
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-900"
                        value={rule.minScore}
                        onChange={(e) => {
                          const newRules = [...gradingRules];
                          newRules[idx].minScore = Number(e.target.value);
                          setGradingRules(newRules);
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Max Score</label>
                      <input 
                        type="number"
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-900"
                        value={rule.maxScore}
                        onChange={(e) => {
                          const newRules = [...gradingRules];
                          newRules[idx].maxScore = Number(e.target.value);
                          setGradingRules(newRules);
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Remark</label>
                      <input 
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-900"
                        value={rule.remark}
                        onChange={(e) => {
                          const newRules = [...gradingRules];
                          newRules[idx].remark = e.target.value;
                          setGradingRules(newRules);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-gray-100 text-center space-y-4">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                <Settings className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{activeTab} Settings</h2>
              <p className="text-gray-500 text-sm">Advanced configuration options for {activeTab.toLowerCase()} are coming soon.</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button className="px-6 py-3 rounded-2xl font-bold text-sm text-gray-500 hover:bg-gray-100 transition-all">
              Cancel
            </button>
            <button 
              onClick={activeTab === "Grading" ? handleSaveGrading : handleSave}
              disabled={isLoading}
              className="px-8 py-3 rounded-2xl bg-[#053d26] text-white font-bold text-sm shadow-lg hover:bg-[#042c1b] transition-all flex items-center gap-2 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
