"use client";

import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { useRouter } from "next/navigation";
import { 
  Megaphone, 
  Mail, 
  Bell, 
  Send, 
  Clock, 
  Users, 
  CheckCircle2, 
  Trash2, 
  FileText, 
  DollarSign, 
  Sparkles,
  Info,
  Layers,
  ChevronRight,
  Eye,
  AlertCircle,
  Loader2
} from "lucide-react";
import { announcementApi } from "@/lib/api";
import { useAnnouncementsWebSocket } from "@/hooks/useAnnouncementsWebSocket";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  date: string;
  author: string;
  channels: string[];
  views: number;
}

interface DispatchLog {
  id: string;
  subject: string;
  date: string;
  recipientsCount: number;
  channels: string[];
  deliveryRate: string;
  cost: string;
}

export default function BroadcastHub() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"terminal" | "bulletin" | "logs">("terminal");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dispatchLogs, setDispatchLogs] = useState<DispatchLog[]>([]);

  // Role guard redirect
  useEffect(() => {
    try {
      const stored = localStorage.getItem("leoned_user");
      if (stored) {
        const user = JSON.parse(stored);
        const userRole = user.role?.toLowerCase();
        if (userRole === "teacher" || userRole === "faculty") {
          router.push("/dashboard/faculty");
        } else if (userRole === "student" || userRole === "parent" || userRole === "guardian") {
          router.push("/dashboard/student-portal");
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [router]);
  
  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [targetGroup, setTargetGroup] = useState("All");
  
  // UI states
  const [isSending, setIsSending] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptDetails, setReceiptDetails] = useState<any>(null);
  const [formError, setFormError] = useState("");

  // Fetch announcements from backend
  const fetchAnnouncements = async () => {
    try {
      const data = await announcementApi.getAll();
      const mapped = data.map((ann: any) => ({
        id: ann.id,
        title: ann.title,
        content: ann.content,
        category: ann.audience === "All" ? "General" : ann.audience === "Teachers" ? "Academic" : "General",
        date: ann.createdAt || new Date().toISOString(),
        author: "School Administration",
        channels: ["megaphone"],
        views: 0
      }));
      setAnnouncements(mapped);
    } catch (err) {
      console.error("Failed to load announcements", err);
    }
  };

  // Listen to websocket events
  useAnnouncementsWebSocket(fetchAnnouncements);

  // Load existing data from localStorage (no mock seeding)
  useEffect(() => {
    if (typeof window === "undefined") return;

    fetchAnnouncements();

    const storedLogs = localStorage.getItem("leoned_dispatch_logs");
    setDispatchLogs(storedLogs ? JSON.parse(storedLogs) : []);
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim() || !content.trim()) {
      setFormError("Broadcast Title and Content details are required.");
      return;
    }

    setIsSending(true);
    try {
      const audience = targetGroup === "All" ? "All" : targetGroup === "Students" ? "Students" : targetGroup === "Parents" ? "Parents" : "Teachers";
      
      // 1. Save announcement to backend API
      await announcementApi.create({
        title,
        content,
        audience,
      });

      // 2. Save log local UI telemetry
      const newDate = new Date().toISOString();
      const targetCount = targetGroup === "All" ? 48 : targetGroup === "Math" ? 5 : 12;
      const newLog: DispatchLog = {
        id: `log-${Date.now()}`,
        subject: title,
        date: newDate,
        recipientsCount: targetCount,
        channels: ["megaphone"],
        deliveryRate: "100%",
        cost: "₦0.00"
      };
      const updatedLogs = [newLog, ...dispatchLogs];
      localStorage.setItem("leoned_dispatch_logs", JSON.stringify(updatedLogs));
      setDispatchLogs(updatedLogs);

      // Create Receipt
      setReceiptDetails({
        id: `broadcast-${Date.now()}`,
        title,
        date: newDate,
        targetGroup,
        recipientsCount: targetCount,
        channels: ["megaphone"],
        cost: "₦0.00",
        gatewayStatus: "Online",
        transmissions: [{
          channel: "megaphone",
          successRate: "100%",
          cost: "₦0.00"
        }]
      });

      setShowReceipt(true);

      // Reset Form & reload announcements
      setTitle("");
      setContent("");
      setCategory("General");
      fetchAnnouncements();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to execute broadcast");
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await announcementApi.delete(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete announcement");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-gray-900 pb-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-gray-100">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest text-[#053d26] bg-[#053d26]/5 border border-[#053d26]/10 mb-3">
            <Megaphone className="h-3 w-3" />
            LeonEd Communications
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Broadcast Hub</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Dispatch bulk notifications and bulletins to teachers using <span className="text-[#053d26] font-bold">Zero Fee</span> channels.
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 p-1.5 bg-gray-100/60 rounded-2xl w-fit shrink-0 border border-gray-200/50">
        <button
          onClick={() => setActiveTab("terminal")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === "terminal"
              ? "bg-[#053d26] text-white shadow-sm"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          Broadcast Terminal
        </button>
        <button
          onClick={() => setActiveTab("bulletin")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === "bulletin"
              ? "bg-[#053d26] text-white shadow-sm"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          Bulletin Board ({announcements.length})
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === "logs"
              ? "bg-[#053d26] text-white shadow-sm"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          Dispatch Logs
        </button>
      </div>

      {/* Main Containers */}
      {activeTab === "terminal" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Side - 7 Cols */}
          <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.015)] border border-gray-100 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#053d26]" />
            
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900">Compose Broadcast</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Specify recipients, channels and write content</p>
            </div>

            {formError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-xs font-bold text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {formError}
              </div>
            )}

            <form onSubmit={handleBroadcast} className="space-y-6">
              {/* Target & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">Target Audience</label>
                  <select 
                    value={targetGroup}
                    onChange={(e) => setTargetGroup(e.target.value)}
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-xs font-bold text-gray-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                  >
                    <option value="All">All School Staff (48)</option>
                    <option value="Students">All Students</option>
                    <option value="Parents">All Parents / Guardians</option>
                    <option value="Math">Maths Department (5)</option>
                    <option value="Science">Sciences Department (12)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">Broadcast Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-xs font-bold text-gray-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                  >
                    <option value="General">General Memo</option>
                    <option value="Academic">Academic Notice</option>
                    <option value="Finance">Financial Info</option>
                    <option value="Health">Health Alert</option>
                    <option value="Reminder">Reminder</option>
                    <option value="Summons">Summons</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider">Broadcast Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mandatory Staff Meeting: Rollout of Grade Guidelines"
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-xs font-bold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                />
              </div>

              {/* Content Textarea */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-wider">Broadcast Body</label>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{content.length} characters</span>
                </div>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Draft your announcement text here..."
                  rows={6}
                  className="block w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 px-4 text-xs font-bold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSending}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#053d26] to-[#095738] text-white font-extrabold text-xs uppercase tracking-widest hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Megaphone className="h-4 w-4" />
                    Publish Announcement
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Live Preview Side - 5 Cols */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#f8f9fa] rounded-[2.5rem] p-8 border border-gray-200/60 shadow-inner space-y-6 relative overflow-hidden">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
                <Eye className="h-4.5 w-4.5 text-gray-400" />
                <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Teacher's View Preview</h3>
              </div>

              {/* Bulletin Mock-Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-start">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                    category === "Academic" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                    category === "Finance" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                    category === "Emergency" ? "bg-rose-50 text-rose-700 border border-rose-100" :
                      category === "Health" ? "bg-red-50 text-red-700 border border-red-100" :
                      category === "Summons" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                      category === "Reminder" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      📢 {category} Announcement
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Just Now</span>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-gray-900 text-sm leading-snug">{title || "Untitled Announcement"}</h4>
                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed whitespace-pre-wrap">
                      {content || "Draft contents will automatically display in this preview card. Begin typing on the compose panel."}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-50 flex justify-between items-center text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                    <span>By: School Administration</span>
                    <span className="text-emerald-600">● Live on bulletin</span>
                  </div>
                </div>
            </div>

          </div>
        </div>
      )}

      {/* Tab 2: Active Bulletin Board */}
      {activeTab === "bulletin" && (
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.015)] border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#053d26]" />
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900">Bulletin Board Manager</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Manage administrative notices posted on teacher dashboards</p>
            </div>
            <div className="text-xs font-bold text-gray-500">{announcements.length} notices active</div>
          </div>

          <div className="space-y-4">
            {announcements.length > 0 ? (
              announcements.map((ann) => (
                <div 
                  key={ann.id} 
                  className="p-6 rounded-3xl bg-gray-50/30 hover:bg-gray-50/70 border border-gray-100 hover:border-gray-200 transition-all duration-300 flex flex-col sm:flex-row justify-between items-start gap-4"
                >
                  <div className="space-y-3 max-w-4xl">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        ann.category === "Academic" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        ann.category === "Finance" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                        ann.category === "Emergency" ? "bg-rose-50 text-rose-700 border border-rose-100" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        {ann.category}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                        {new Date(ann.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-gray-900 text-base">{ann.title}</h4>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">{ann.content}</p>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-1 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                      <span>By: {ann.author}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-gray-400" /> {ann.views} Views</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        Channels: {ann.channels.map(c => c === "megaphone" ? "📢 Bulletin" : c === "email" ? "📧 Email" : "📱 Push").join(", ")}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 hover:border-rose-200 transition-colors shrink-0"
                    title="Remove announcement"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <div className="flex flex-col items-center gap-4 opacity-30">
                  <Megaphone className="h-12 w-12 text-gray-400" />
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No Active Announcements</p>
                    <p className="text-[10px] text-gray-400 mt-1">Post bulletins via the Broadcast Terminal tab.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Dispatch Logs */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.015)] border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#053d26]" />
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900">Broadcast Dispatch Logs</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">History of broadcast transmissions and billing telemetry</p>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full text-left border-separate border-spacing-y-3 min-w-[700px]">
              <thead>
                <tr className="text-gray-400">
                  <th className="pb-3 pl-4 font-bold text-[9px] uppercase tracking-[0.25em]">Timestamp</th>
                  <th className="pb-3 font-bold text-[9px] uppercase tracking-[0.25em] px-4">Subject</th>
                  <th className="pb-3 font-bold text-[9px] uppercase tracking-[0.25em] px-4">Recipients</th>
                  <th className="pb-3 font-bold text-[9px] uppercase tracking-[0.25em] px-4">Channels</th>
                  <th className="pb-3 font-bold text-[9px] uppercase tracking-[0.25em] px-4">Delivery Rate</th>
                  <th className="pb-3 font-bold text-[9px] uppercase tracking-[0.25em] pr-4 text-right">Carrier Fees</th>
                </tr>
              </thead>
              <tbody>
                {dispatchLogs.map((log) => (
                  <tr key={log.id} className="group bg-gray-50/20 hover:bg-gray-50/65 border border-gray-100/50 rounded-2xl transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.005)]">
                    {/* Timestamp */}
                    <td className="py-4 pl-4 rounded-l-2xl border-y border-l border-gray-100/40 text-xs font-bold text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="py-4 px-4 border-y border-gray-100/40 text-xs font-extrabold text-gray-900">
                      {log.subject}
                    </td>

                    {/* Recipients */}
                    <td className="py-4 px-4 border-y border-gray-100/40 text-xs font-bold text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        {log.recipientsCount} Teachers
                      </div>
                    </td>

                    {/* Channels */}
                    <td className="py-4 px-4 border-y border-gray-100/40">
                      <div className="flex gap-1.5">
                        {log.channels.map(ch => (
                          <span key={ch} className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-gray-100 text-gray-500 border border-gray-200">
                            {ch === "megaphone" ? "📢 Bulletin" : ch === "email" ? "📧 Email" : "📱 Push"}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Delivery Rate */}
                    <td className="py-4 px-4 border-y border-gray-100/40">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
                        {log.deliveryRate}
                      </span>
                    </td>

                    {/* Fees */}
                    <td className="py-4 pr-4 rounded-r-2xl border-y border-r border-gray-100/40 text-right font-black text-emerald-700 text-xs">
                      {log.cost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transmission Success Receipt Modal */}
      {showReceipt && receiptDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-8 sm:p-10 shadow-2xl relative border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header elements */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 to-[#053d26]" />
            
            <div className="flex flex-col items-center text-center mt-4">
              <div className="h-16 w-16 bg-emerald-50 rounded-full border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-gray-900">Broadcast Dispatched Successfully</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Transaction Receipt</p>
            </div>

            {/* Receipt Parameters Grid */}
            <div className="mt-8 bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Broadcast Subject</span>
                <span className="font-extrabold text-gray-900 text-right max-w-xs truncate">{receiptDetails.title}</span>
              </div>
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Recipient Target</span>
                <span className="font-extrabold text-gray-900">
                  {receiptDetails.targetGroup === "All" ? "All School Teachers" : receiptDetails.targetGroup === "Math" ? "Maths Dept" : "Sciences Dept"}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Delivered Nodes</span>
                <span className="font-extrabold text-gray-900">{receiptDetails.recipientsCount} educators</span>
              </div>
              <div className="flex justify-between items-baseline text-xs border-t border-gray-200/60 pt-4">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Gateway Carrier Fee</span>
                <span className="font-black text-emerald-700 text-sm">₦0.00 (Free)</span>
              </div>
            </div>

            {/* Transmissions Details */}
            <div className="mt-6 space-y-3">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gateway Dispatches</h4>
              <div className="grid grid-cols-1 gap-2.5">
                {receiptDetails.transmissions.map((t: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50/50 rounded-xl border border-gray-100/60 text-xs">
                    <span className="font-bold text-gray-700 capitalize flex items-center gap-1.5">
                      {t.channel === "megaphone" ? <Megaphone className="h-3.5 w-3.5 text-gray-400" /> : t.channel === "email" ? <Mail className="h-3.5 w-3.5 text-gray-400" /> : <Bell className="h-3.5 w-3.5 text-gray-400" />}
                      {t.channel === "megaphone" ? "Megaphone board" : t.channel === "email" ? "Email blast" : "Push Notification"}
                    </span>
                    <div className="flex gap-4 items-center">
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{t.successRate} Delivered</span>
                      <span className="font-black text-gray-900">{t.cost}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => setShowReceipt(false)}
              className="mt-8 w-full py-4 rounded-xl bg-gradient-to-r from-[#053d26] to-[#0a5737] text-white font-extrabold text-xs uppercase tracking-widest hover:shadow-lg transition-all duration-300"
            >
              Acknowledge Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
