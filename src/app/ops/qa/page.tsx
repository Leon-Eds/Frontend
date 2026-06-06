"use client";

import { useState } from "react";
import {
  Inbox,
  AlertCircle,
  Clock,
  Play,
  TrendingUp,
  Sliders,
  ChevronRight,
  Sparkles,
  X,
  User
} from "lucide-react";

// Mock Staging vs Production QA datasets
const stagingData = {
  coverage: "94.2%",
  failuresText: "1,204 tests passed, 2 failures detected in the User Authentication module.",
  openAnomalies: 18,
  criticalCount: 4,
  matrix: { latency: "42ms", cpu: "12%", err: "0.04%" },
  revisions: [
    { name: "LeonEd Primary - v2.4", desc: "Update on Payment Gateway logic required.", time: "2 HOURS AGO", border: "brown" },
    { name: "South Hub - UX Fix", desc: "Alignment fixes on mobile dashboard.", time: "YESTERDAY", border: "grey" }
  ],
  backlog: [
    { id: "#BUG-4029", title: "Auth Token Expiry Failure", desc: "Refresh mechanism fails on slow cellular connections.", severity: "CRITICAL", status: "In Progress", statusColor: "bg-amber-500", reporter: "J. Mensah", initials: "JM" },
    { id: "#BUG-3981", title: "PDF Export Layout Offset", desc: "Certificates rendering with broken margins in Webkit.", severity: "MEDIUM", status: "Pending Review", statusColor: "bg-gray-400", reporter: "A. Okoro", initials: "AO" },
    { id: "#BUG-4105", title: "Zero-State Null Pointer", desc: "Empty search result triggers app crash in QA node.", severity: "CRITICAL", status: "Triaged", statusColor: "bg-[#b05e1c]", reporter: "K. Boateng", initials: "KB" }
  ]
};

const productionData = {
  coverage: "98.7%",
  failuresText: "2,408 tests passed, 0 failures detected across system modules.",
  openAnomalies: 5,
  criticalCount: 1,
  matrix: { latency: "35ms", cpu: "24%", err: "0.01%" },
  revisions: [
    { name: "Production Rollout - v4.2.0", desc: "Stable launch sequence initiated.", time: "1 HOUR AGO", border: "brown" },
    { name: "Backup Cluster-B Sync", desc: "Replication node consistency check completed.", time: "12 HOURS AGO", border: "grey" }
  ],
  backlog: [
    { id: "#BUG-3945", title: "Billing Invoice Rounding", desc: "Cent rounding discrepancy on annual invoices.", severity: "MEDIUM", status: "In Progress", statusColor: "bg-amber-500", reporter: "J. Mensah", initials: "JM" },
    { id: "#BUG-3882", title: "Session Timeout Disconnect", desc: "Teacher portal triggers timeout 2 mins early.", severity: "CRITICAL", status: "Pending Review", statusColor: "bg-gray-400", reporter: "A. Okoro", initials: "AO" }
  ]
};

export default function QAConsolePage() {
  const [activeTab, setActiveTab] = useState<"staging" | "prod">("staging");
  const [showBugBoard, setShowBugBoard] = useState(false);
  const data = activeTab === "staging" ? stagingData : productionData;

  // Custom Bug Board Kanban Mock
  const kanbanColumns = [
    { title: "To Do", tasks: data.backlog.filter(t => t.status === "Triaged") },
    { title: "In Progress", tasks: data.backlog.filter(t => t.status === "In Progress") },
    { title: "In Review", tasks: data.backlog.filter(t => t.status === "Pending Review") },
    { title: "Done", tasks: [] }
  ];

  return (
    <>
      {/* Title Block & Toggle tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            QA Testing
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Enterprise System Validation & Quality Assurance Console
          </p>
        </div>

        {/* Staging vs Prod Switcher */}
        <div className="bg-[#e9ecef] p-1 rounded-2xl flex items-center shrink-0 shadow-inner">
          <button
            onClick={() => setActiveTab("staging")}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "staging"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Staging
          </button>
          <button
            onClick={() => setActiveTab("prod")}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "prod"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Production QA
          </button>
        </div>
      </div>

      {/* Row 1: Test Suite Status (2/3) + Open Anomalies (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Test Suite Status Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[300px]">
          <div className="space-y-4">
            <div>
              <span className="bg-[#d3f9d8] text-[#2b8a3e] text-[9px] font-extrabold tracking-wider px-2.5 py-1 rounded-full uppercase">
                Test Suite Status
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Automated Coverage
                </span>
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">
                {data.coverage}
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed max-w-xl">
                The last full regression cycle completed 14 minutes ago. {data.failuresText}
              </p>
            </div>
          </div>

          {/* Graphical arches representation */}
          <div className="relative h-20 flex items-end justify-between px-4 pt-4 border-t border-gray-50 overflow-hidden">
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:100%_12px] opacity-40"></div>
            
            <div className="flex-1 max-w-[28px] bg-gray-200/60 h-2/5 rounded-t-full"></div>
            <div className="flex-1 max-w-[28px] bg-gray-200/60 h-4/5 rounded-t-full mx-1"></div>
            <div className="flex-1 max-w-[28px] bg-gray-200/60 h-3/5 rounded-t-full mx-1"></div>
            <div className="flex-1 max-w-[28px] bg-[#b05e1c] h-3/4 rounded-t-full mx-1"></div>
            <div className="flex-1 max-w-[28px] bg-gray-200/60 h-2/5 rounded-t-full mx-1"></div>
            <div className="flex-1 max-w-[28px] bg-gray-200/60 h-3/5 rounded-t-full mx-1"></div>
            <div className="flex-1 max-w-[28px] bg-[#053d26] h-full rounded-t-full mx-1"></div>
          </div>
        </div>

        {/* Open Anomalies (Forest green) */}
        <div className="bg-[#032d1d] text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
          <div className="space-y-4">
            <span className="text-[10px] text-green-200/70 font-extrabold uppercase tracking-wider block">
              Open Anomalies
            </span>

            <div>
              <h2 className="text-6xl font-extrabold tracking-tight">
                {data.openAnomalies}
              </h2>
              <p className="text-xs text-green-100/80 font-medium mt-3 leading-relaxed">
                Active bugs across all modules. {data.criticalCount} labeled as Critical (Level 0).
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowBugBoard(true)}
            className="w-full py-3.5 rounded-2xl bg-[#b05e1c] text-white font-bold text-xs hover:bg-[#965017] transition-all tracking-wider uppercase shadow-sm mt-6"
          >
            View Bug Board
          </button>
        </div>
      </div>

      {/* Row 2: Client Revision Log + Node Stability Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Client Revision Log */}
        <div className="bg-[#e9ecef]/40 rounded-3xl p-6 border border-gray-200/50 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-950">
            Client Revision Log
          </h3>

          <div className="space-y-3">
            {data.revisions.map((rev, index) => (
              <div
                key={index}
                className={`p-4 bg-white border border-gray-100 rounded-2xl flex flex-col border-l-4 ${
                  rev.border === "brown" ? "border-l-[#b05e1c]" : "border-l-gray-400"
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-gray-900">{rev.name}</h4>
                  <span className="text-[9px] text-gray-400 font-extrabold tracking-wider">{rev.time}</span>
                </div>
                <p className="text-[10px] text-gray-500 font-medium mt-1 leading-relaxed">
                  {rev.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Node Stability Matrix */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-950">
              Node Stability Matrix
            </h3>
            {/* Environment tags */}
            <div className="flex gap-2">
              <span className="bg-[#e6fcf5] text-[#0ca678] text-[8px] font-extrabold tracking-wider px-2 py-0.5 rounded-md uppercase">
                Staging-01
              </span>
              <span className="bg-[#e6fcf5] text-[#0ca678] text-[8px] font-extrabold tracking-wider px-2 py-0.5 rounded-md uppercase">
                Staging-02
              </span>
            </div>
          </div>

          {/* Stats sliders lists */}
          <div className="grid grid-cols-3 gap-4">
            
            {/* Latency */}
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col justify-between h-24">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Latency (avg)</span>
              <div>
                <p className="text-base font-extrabold text-gray-900">{data.matrix.latency}</p>
                {/* Horizontal bar */}
                <div className="w-full h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <div className="bg-gray-700 h-full w-2/5"></div>
                </div>
              </div>
            </div>

            {/* CPU Load */}
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col justify-between h-24">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">CPU Load</span>
              <div>
                <p className="text-base font-extrabold text-gray-900">{data.matrix.cpu}</p>
                {/* Horizontal bar */}
                <div className="w-full h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <div className="bg-gray-700 h-full w-1/5"></div>
                </div>
              </div>
            </div>

            {/* Error Rate */}
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col justify-between h-24">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Err. Rate</span>
              <div>
                <p className="text-base font-extrabold text-[#b05e1c]">{data.matrix.err}</p>
                {/* Horizontal bar */}
                <div className="w-full h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <div className="bg-[#b05e1c] h-full w-1/12"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Defect Backlog Section */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-gray-950">
            Critical Defect Backlog
          </h3>
          <button className="text-xs text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase tracking-wider flex items-center gap-0.5">
            <span>Expand Full Report</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Backlog Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                <th className="pb-3 pl-2 w-28">Defect ID</th>
                <th className="pb-3">Issue Description</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pl-4">Reporter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {data.backlog.length > 0 ? (
                data.backlog.map((bug) => (
                  <tr key={bug.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 pl-2 font-bold text-gray-900 whitespace-nowrap">{bug.id}</td>
                    <td className="py-4 pr-4">
                      <div className="space-y-1">
                        <span className="font-bold text-gray-900 block">{bug.title}</span>
                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed max-w-xl">
                          {bug.desc}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      <span
                        className={`text-[8px] font-extrabold tracking-wider px-2.5 py-1 rounded-full uppercase ${
                          bug.severity === "CRITICAL"
                            ? "bg-rose-50 text-rose-600 border border-rose-100"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {bug.severity}
                      </span>
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 font-bold text-gray-700 text-[11px]">
                        <span className={`h-2 w-2 rounded-full ${bug.statusColor}`}></span>
                        <span>{bug.status}</span>
                      </div>
                    </td>
                    <td className="py-4 pl-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {/* Reporter Avatar */}
                        <div className="h-6 w-6 rounded-full bg-[#053d26] text-white flex items-center justify-center font-extrabold text-[9px] shrink-0 border border-white shadow-sm">
                          {bug.initials}
                        </div>
                        <span className="font-semibold text-gray-700">{bug.reporter}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 font-medium">
                    <Inbox className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    No defects found in this environment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bug Board Kanban Modal */}
      {showBugBoard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-5xl h-[80vh] rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col relative space-y-6 animate-scale-in">
            {/* Close button */}
            <button
              onClick={() => setShowBugBoard(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-[9px] font-extrabold tracking-widest text-[#b05e1c] uppercase">
                Interactive Board
              </span>
              <h3 className="text-xl font-bold text-gray-950 mt-1">
                QA Bug board - {activeTab === "staging" ? "Staging Nodes" : "Production Node Cluster"}
              </h3>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-4 gap-4 flex-1 min-h-0 overflow-y-auto no-scrollbar pt-2">
              {kanbanColumns.map((col, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-4 flex flex-col min-h-0 border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">{col.title}</h4>
                    <span className="bg-white text-gray-500 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-gray-200">
                      {col.tasks.length}
                    </span>
                  </div>

                  <div className="flex flex-col space-y-3 overflow-y-auto flex-1 pr-1 no-scrollbar">
                    {col.tasks.map((task) => (
                      <div key={task.id} className="bg-white p-3.5 rounded-xl border border-gray-150 shadow-sm space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-extrabold text-[#b05e1c]">{task.id}</span>
                          <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                            task.severity === "CRITICAL" ? "bg-rose-50 text-rose-600" : "bg-gray-100 text-gray-500"
                          }`}>
                            {task.severity}
                          </span>
                        </div>
                        
                        <h5 className="text-xs font-bold text-gray-900 leading-tight">{task.title}</h5>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                          <div className="flex items-center gap-1.5 text-[9px] text-gray-500 font-semibold">
                            <User className="h-3 w-3 text-gray-400" />
                            <span>{task.reporter}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {col.tasks.length === 0 && (
                      <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Empty</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
