"use client";

import { useState } from "react";
import {
  Search,
  BookOpen,
  FileText,
  ShieldCheck,
  Code2,
  ExternalLink,
  ChevronRight,
  Inbox,
  X,
  FileDown,
  User,
  Clock,
  AlertTriangle,
  Building
} from "lucide-react";

// Mock tickets data
const initialTickets = [
  {
    id: "TIC-8092",
    title: "M-Pesa Integration Timeout",
    desc: "Regional payment gateway in Nairobi region reporting 404 errors during peak hours.",
    client: "Kenya Central",
    severity: "CRITICAL",
    status: "IN PROGRESS",
    opened: "10 mins ago",
    assigned: "K. Boateng",
    timeline: [
      { time: "14:20 GMT", event: "Ticket created automatically via error monitoring." },
      { time: "14:22 GMT", event: "Severity set to CRITICAL. System engineers notified." },
      { time: "14:25 GMT", event: "Assigned to K. Boateng. Log diagnostics started." }
    ]
  },
  {
    id: "TIC-7890",
    title: "LMS Dashboard Latency",
    desc: "Educators reporting high load times for analytics widgets on mobile devices.",
    client: "Lagos Hub",
    severity: "MEDIUM",
    status: "RESOLVED",
    opened: "2 hours ago",
    assigned: "A. Okoro",
    timeline: [
      { time: "12:10 GMT", event: "Reported by Lagos Hub lead educator." },
      { time: "12:45 GMT", event: "DB index optimized. Cache TTL increased." },
      { time: "13:30 GMT", event: "Resolved. Verified response latency decreased from 4s to 120ms." }
    ]
  },
  {
    id: "TIC-8045",
    title: "Bulk Enrollment Failure",
    desc: "CSV parser failing to recognize UTF-8 characters for specific regional names.",
    client: "Pretoria Tech",
    severity: "HIGH",
    status: "QUEUED",
    opened: "45 mins ago",
    assigned: "J. Mensah",
    timeline: [
      { time: "13:45 GMT", event: "Ticket raised by Pretoria Tech admin." },
      { time: "13:50 GMT", event: "Triaged to J. Mensah. Queued for dev sprint." }
    ]
  }
];

// Documentation cards data
const initialDocs = [
  { id: "infra", title: "Core Infrastructure Guide", badge: "TRAINING MANUALS", desc: "Comprehensive walkthrough of the LeonEd server architecture, load balancing configurations, and regional data replication protocols.", category: "manuals" },
  { id: "api", title: "API Reference v2.4", badge: "NEW CONTENT", desc: "Latest updates on regional payment gateways and enrollment webhooks.", category: "api" },
  { id: "handover", title: "Handover Logs", desc: "Transition documents from the Q3 deployment phase.", category: "handover" },
  { id: "compliance", title: "Compliance Docs", desc: "Legal and technical compliance frameworks for African markets.", category: "compliance" },
  { id: "sandbox", title: "Dev Sandbox", desc: "Environment variables and mock data sets for staging tests.", category: "sandbox" }
];

export default function SupportPage() {
  const [tickets, setTickets] = useState(initialTickets);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<typeof initialTickets[0] | null>(null);

  // Download states for files
  const [downloadState, setDownloadState] = useState<string>("Download PDF");

  const handleDownload = () => {
    setDownloadState("Preparing file...");
    setTimeout(() => {
      setDownloadState("Downloading...");
      setTimeout(() => {
        setDownloadState("File Downloaded ✅");
        setTimeout(() => {
          setDownloadState("Download PDF");
        }, 2000);
      }, 1500);
    }, 1000);
  };

  // Filter manuals and tickets by search query
  const filteredTickets = tickets.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDocs = initialDocs.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Title section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-extrabold tracking-widest text-[#b05e1c] uppercase">
            Technical Handover & Knowledge
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Support & Documentation Center
          </h1>
          <p className="text-sm text-gray-500 font-medium max-w-2xl leading-relaxed">
            Access the technical blueprint of LeonEd. Manage handover documentation,
            system manuals, and track post-launch tickets in real-time.
          </p>
        </div>

        {/* Circular badges */}
        <div className="flex gap-4 items-center shrink-0">
          <div className="h-16 w-16 rounded-full bg-white border border-gray-100 shadow-sm flex flex-col items-center justify-center p-2 text-center shrink-0">
            <span className="text-sm font-extrabold text-gray-900">24</span>
            <span className="text-[7px] text-gray-400 font-bold uppercase tracking-wider">Active</span>
          </div>

          <div className="h-16 w-16 rounded-full bg-white border border-gray-100 shadow-sm flex flex-col items-center justify-center p-2 text-center shrink-0">
            <span className="text-sm font-extrabold text-emerald-600">98%</span>
            <span className="text-[7px] text-gray-400 font-bold uppercase tracking-wider">SLA Health</span>
          </div>
        </div>
      </div>

      {/* Search Bar Container */}
      <div className="relative flex items-center bg-white rounded-3xl p-2.5 border border-gray-100 shadow-sm gap-2">
        <div className="pointer-events-none pl-4 text-gray-400 shrink-0">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent"
          placeholder="Search technical manuals, API docs, or handover logs..."
        />
        <button
          className="px-6 py-3.5 rounded-2xl bg-[#b05e1c] text-white text-xs font-bold hover:bg-[#965017] transition-all tracking-wider uppercase shrink-0"
        >
          Search Library
        </button>
      </div>

      {/* Grid: Training Manuals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Core Infrastructure Guide (2/3 width) */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[200px]">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              {/* Icon wrapper */}
              <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200/40 shrink-0">
                <BookOpen className="h-5 w-5 text-gray-700" />
              </div>
              <span className="bg-[#e6fcf5] text-[#0ca678] text-[8px] font-extrabold tracking-wider px-2.5 py-1 rounded-full uppercase">
                Training Manuals
              </span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-gray-900 leading-tight">
                Core Infrastructure Guide
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-2 leading-relaxed">
                Comprehensive walkthrough of the LeonEd server architecture, load
                balancing configurations, and regional data replication protocols.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-50 flex justify-center">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-gray-900 transition-colors uppercase tracking-wider"
            >
              <FileDown className="h-4 w-4 text-gray-400" />
              <span>{downloadState}</span>
            </button>
          </div>
        </div>

        {/* API Reference (1/3 width, Forest Green background) */}
        <div className="bg-[#032d1d] text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[200px]">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="bg-emerald-800 text-emerald-200 text-[8px] font-extrabold tracking-wider px-2.5 py-1 rounded-full uppercase">
                New Content
              </span>
            </div>

            <div>
              <h3 className="text-base font-extrabold leading-tight">
                API Reference v2.4
              </h3>
              <p className="text-xs text-green-200/80 font-medium mt-2 leading-relaxed">
                Latest updates on regional payment gateways and enrollment webhooks.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <button className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-green-200 transition-colors uppercase tracking-wider">
              <span>Explore Docs</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Row of three smaller modules: Handover Logs, Compliance, Sandbox */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Handover Logs */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[160px]">
          <div className="space-y-3">
            <FileText className="h-6 w-6 text-[#b05e1c]" />
            <h4 className="text-sm font-extrabold text-gray-900">Handover Logs</h4>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
              Transition documents from the Q3 deployment phase.
            </p>
          </div>
          <button className="text-[10px] font-extrabold tracking-wider text-[#b05e1c] hover:text-[#965017] transition-all uppercase pt-4 block text-left">
            View Archive
          </button>
        </div>

        {/* Compliance Docs */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[160px]">
          <div className="space-y-3">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            <h4 className="text-sm font-extrabold text-gray-900">Compliance Docs</h4>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
              Legal and technical compliance frameworks for African markets.
            </p>
          </div>
          <button className="text-[10px] font-extrabold tracking-wider text-gray-800 hover:text-gray-950 transition-all uppercase pt-4 block text-left">
            Review Files
          </button>
        </div>

        {/* Dev Sandbox */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[160px]">
          <div className="space-y-3">
            <Code2 className="h-6 w-6 text-[#b05e1c]" />
            <h4 className="text-sm font-extrabold text-gray-900">Dev Sandbox</h4>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
              Environment variables and mock data sets for staging tests.
            </p>
          </div>
          <button className="text-[10px] font-extrabold tracking-wider text-[#b05e1c] hover:text-[#965017] transition-all uppercase pt-4 block text-left">
            Access Sandbox
          </button>
        </div>
      </div>

      {/* Support Queue Section */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-base font-bold text-gray-950">
            Live Support Queue
          </h3>
          <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block"></span>
              <span className="text-rose-500">Critical: 2</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-600 inline-block"></span>
              <span className="text-amber-600">Standard: 14</span>
            </div>
          </div>
        </div>

        {/* Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                <th className="pb-3 pl-2">Issue Description</th>
                <th className="pb-3">Client</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 pl-2 pr-4">
                      <div className="space-y-1">
                        <span className="font-bold text-gray-900 block">{t.title}</span>
                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed max-w-xl">
                          {t.desc}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 font-bold text-gray-700 whitespace-nowrap">{t.client}</td>
                    <td className="py-4 whitespace-nowrap">
                      <span
                        className={`text-[8px] font-extrabold tracking-wider px-2.5 py-1 rounded-full uppercase ${
                          t.severity === "CRITICAL"
                            ? "bg-rose-50 text-rose-600 border border-rose-100"
                            : t.severity === "HIGH"
                            ? "bg-amber-50 text-amber-600 border border-amber-100"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {t.severity}
                      </span>
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      <span
                        className={`text-[8px] font-extrabold tracking-wider px-2.5 py-1 rounded-full uppercase ${
                          t.status === "RESOLVED"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : t.status === "IN PROGRESS"
                            ? "bg-orange-50 text-orange-600 border border-orange-100"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="text-gray-400 hover:text-gray-800 transition-colors p-1"
                      >
                        <ExternalLink className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 font-medium">
                    <Inbox className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    No support tickets found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* View All Logs link */}
        <div className="pt-2 border-t border-gray-50 text-center">
          <button className="text-xs text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase tracking-wider flex items-center gap-1 mx-auto">
            <span>View Full Support History</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Ticket Details Slide-over Drawer */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/55 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg h-full flex flex-col p-6 space-y-6 shadow-xl relative animate-slide-in">
            {/* Close button */}
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-[9px] font-extrabold tracking-widest text-[#b05e1c] uppercase">
                {selectedTicket.id}
              </span>
              <h3 className="text-lg font-bold text-gray-900 mt-1">
                {selectedTicket.title}
              </h3>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Client</p>
                  <p className="font-semibold text-gray-700">{selectedTicket.client}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Assignee</p>
                  <p className="font-semibold text-gray-700">{selectedTicket.assigned}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Opened</p>
                  <p className="font-semibold text-gray-700">{selectedTicket.opened}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Severity</p>
                  <p className="font-semibold text-gray-700">{selectedTicket.severity}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Problem Description
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                {selectedTicket.desc}
              </p>
            </div>

            {/* Timeline */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Activity Log
              </h4>
              <div className="relative border-l-2 border-gray-100 pl-4 space-y-4">
                {selectedTicket.timeline.map((event, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle marker */}
                    <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-gray-300 border border-white"></span>
                    <p className="text-[10px] font-extrabold text-[#b05e1c]">{event.time}</p>
                    <p className="text-xs text-gray-600 font-semibold mt-0.5">{event.event}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
