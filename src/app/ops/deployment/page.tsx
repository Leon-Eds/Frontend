"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Database,
  Terminal,
  RefreshCw,
  Rocket,
  Check,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Sparkles
} from "lucide-react";

// Mock version history data
const initialVersionHistory = [
  { version: "v4.1.8-stable", desc: "Hotfix: API throttling adjustment", date: "Oct 24, 2023", type: "STABLE" },
  { version: "v4.1.0-release", desc: "Major: LMS Integration Module", date: "Sep 15, 2023", type: "LEGACY" },
  { version: "v4.0.2-stable", desc: "Patch: UI rendering optimizations", date: "Aug 02, 2023", type: "LEGACY" }
];

export default function DeploymentPage() {
  // Simulator State
  const [version, setVersion] = useState("v4.2.0-alpha");
  const [status, setStatus] = useState("IN PROGRESS"); // IN PROGRESS, PROMOTED, IDLE
  const [percent, setPercent] = useState(74);
  const [stepNum, setStepNum] = useState(4);
  const [steps, setSteps] = useState([
    { id: 1, title: "Database Migration", desc: "Schema updates applied successfully to cluster-A.", status: "completed", type: "db" },
    { id: 2, title: "Service Containerization", desc: "New Docker images pushed to private registry.", status: "completed", type: "docker" },
    { id: 3, title: "CDN Invalidation", desc: "Purging edge cache globally for assets.", status: "running", type: "cdn" },
  ]);

  const [checklist, setChecklist] = useState([
    { id: 1, title: "Security Audit Signed-off", checked: true },
    { id: 2, title: "Load Testing Performance OK", checked: true },
    { id: 3, title: "Compliance Documentation Finalized", checked: false },
    { id: 4, title: "External API Handshake Check", checked: false },
    { id: 5, title: "Backup Restore Verification", checked: false },
  ]);

  const [versionHistory, setVersionHistory] = useState(initialVersionHistory);
  const [showNewDeploymentModal, setShowNewDeploymentModal] = useState(false);
  const [modalVersion, setModalVersion] = useState("v4.2.1-beta");
  
  // Real-time Stability Monitor Mock stats
  const [latency, setLatency] = useState(42);
  const [errorRate, setErrorRate] = useState(0.02);
  const [traffic, setTraffic] = useState(12.0);

  // Fluctuations in real-time monitor
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => {
        const diff = (Math.random() - 0.5) * 2;
        const next = prev + diff;
        return Number(Math.max(38, Math.min(50, next)).toFixed(0));
      });
      setErrorRate(prev => {
        const diff = (Math.random() - 0.5) * 0.005;
        const next = prev + diff;
        return Number(Math.max(0.01, Math.min(0.08, next)).toFixed(3));
      });
      setTraffic(prev => {
        const diff = (Math.random() - 0.5) * 0.4;
        const next = prev + diff;
        return Number(Math.max(10.5, Math.min(13.8, next)).toFixed(1));
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Listen to New Deployment trigger from layout/sidebar
  useEffect(() => {
    const handleTrigger = () => {
      setShowNewDeploymentModal(true);
    };

    window.addEventListener("trigger-new-deployment", handleTrigger);
    return () => window.removeEventListener("trigger-new-deployment", handleTrigger);
  }, []);

  // Simulate CDN Invalidation completion & promote to prod
  const handlePromote = () => {
    if (status !== "IN PROGRESS") return;
    
    // Animate CDN Invalidation finish
    setStatus("PROMOTED");
    setPercent(100);
    setStepNum(6);
    setSteps(prev =>
      prev.map(s => (s.id === 3 ? { ...s, status: "completed" } : s))
    );

    // Add to version history
    setVersionHistory(prev => [
      {
        version: version.replace("-alpha", "-stable"),
        desc: "Transitioned to active production rollout.",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        type: "STABLE"
      },
      ...prev.map(v => (v.type === "STABLE" ? { ...v, type: "LEGACY" } : v))
    ]);

    // Check compliance
    setChecklist(prev => prev.map(item => ({ ...item, checked: true })));
  };

  // Launch simulated new deployment pipeline
  const startNewDeployment = (e: React.FormEvent) => {
    e.preventDefault();
    setShowNewDeploymentModal(false);
    
    // Set to starting state
    setVersion(modalVersion);
    setStatus("IN PROGRESS");
    setPercent(10);
    setStepNum(1);
    setSteps([
      { id: 1, title: "Database Migration", desc: "Running schema changes on Cluster-A...", status: "running", type: "db" },
      { id: 2, title: "Service Containerization", desc: "Waiting for build assets...", status: "pending", type: "docker" },
      { id: 3, title: "CDN Invalidation", desc: "Pending cache invalidation...", status: "pending", type: "cdn" },
    ]);
    setChecklist(prev => prev.map(item => ({ ...item, checked: false })));

    // Mock progress over time
    let curStep = 1;
    const progressInterval = setInterval(() => {
      if (curStep === 1) {
        // Step 1 complete, Step 2 starts
        setPercent(45);
        setStepNum(2);
        setSteps([
          { id: 1, title: "Database Migration", desc: "Schema updates applied successfully to cluster-A.", status: "completed", type: "db" },
          { id: 2, title: "Service Containerization", desc: "Pushing new Docker images to private registry...", status: "running", type: "docker" },
          { id: 3, title: "CDN Invalidation", desc: "Pending cache invalidation...", status: "pending", type: "cdn" },
        ]);
        setChecklist(prev => prev.map((item, idx) => (idx === 0 ? { ...item, checked: true } : item)));
        curStep = 2;
      } else if (curStep === 2) {
        // Step 2 complete, Step 3 starts
        setPercent(74);
        setStepNum(4);
        setSteps([
          { id: 1, title: "Database Migration", desc: "Schema updates applied successfully to cluster-A.", status: "completed", type: "db" },
          { id: 2, title: "Service Containerization", desc: "New Docker images pushed to private registry.", status: "completed", type: "docker" },
          { id: 3, title: "CDN Invalidation", desc: "Purging edge cache globally for assets.", status: "running", type: "cdn" },
        ]);
        setChecklist(prev => prev.map((item, idx) => (idx <= 1 ? { ...item, checked: true } : item)));
        curStep = 3;
        clearInterval(progressInterval);
      }
    }, 5000);
  };

  const toggleChecklist = (id: number) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  return (
    <>
      {/* Top Title Section */}
      <div className="space-y-1">
        <p className="text-[10px] font-extrabold tracking-widest text-[#b05e1c] uppercase">
          Release Pipeline
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Deployment & Launch
        </h1>
        <p className="text-sm text-gray-500 font-medium max-w-3xl leading-relaxed">
          Coordinate and execute the final transition to production. Monitor stability
          metrics in real-time and manage versioning for the LeonEd ecosystem.
        </p>
      </div>

      {/* Main Grid: Left Rollout Panel (2/3) + Right Stats Panel (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Rollout Progress */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Header of Rollout */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-950">
                  Production Rollout: {version}
                </h3>
                <p className="text-xs text-gray-400 font-semibold mt-1">
                  {status === "PROMOTED"
                    ? "Deployment fully released to global users"
                    : "Estimated completion: 14:30 GMT"}
                </p>
              </div>

              {/* Status Badge */}
              <span
                className={`text-[10px] font-extrabold tracking-wider px-3 py-1.5 rounded-full ${
                  status === "PROMOTED"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : "bg-[#e6fcf5] text-[#0ca678]"
                }`}
              >
                {status}
              </span>
            </div>

            {/* Progress indicator */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="bg-[#d3f9d8] text-[#2b8a3e] px-2.5 py-1 rounded-full text-[10px]">
                  {percent}% COMPLETE
                </span>
                <span className="text-gray-500 font-medium">
                  Step {stepNum} of 6
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-800 transition-all duration-1000 ease-out"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {/* Step Rows */}
            <div className="space-y-3.5 pt-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-center justify-between p-4 bg-[#f8f9fa] border border-gray-100 rounded-2xl transition-all hover:shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    {/* Step Icon wrapper */}
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center border border-gray-200/50 shadow-sm text-gray-800 shrink-0">
                      {step.type === "db" && <Database className="h-5 w-5" />}
                      {step.type === "docker" && <Terminal className="h-5 w-5" />}
                      {step.type === "cdn" && (
                        <RefreshCw
                          className={`h-5 w-5 ${step.status === "running" ? "animate-spin text-gray-400" : ""}`}
                        />
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-gray-900 leading-tight">
                        {step.title}
                      </h4>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  {/* Tick or Spinner */}
                  <div>
                    {step.status === "completed" ? (
                      <div className="h-6 w-6 rounded-full bg-gray-900 flex items-center justify-center">
                        <Check className="h-3.5 w-3.5 text-white stroke-[3px]" />
                      </div>
                    ) : step.status === "running" ? (
                      <div className="relative h-6 w-6">
                        <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-[#b05e1c] border-t-transparent animate-spin"></div>
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full border border-gray-300 bg-white" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Server Health + Promote Portal */}
        <div className="space-y-8 flex flex-col justify-between">
          
          {/* Server Health Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-gray-400 tracking-wider uppercase">
              Server Health
            </h4>

            {/* Giant Metric */}
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-extrabold text-gray-900 tracking-tight">
                99.9
              </span>
              <span className="text-2xl font-bold text-gray-400">%</span>
            </div>

            {/* Stable across Nodes */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#20c997]">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Stable across 24 nodes</span>
            </div>

            {/* Mini Bar Chart */}
            <div className="flex items-end justify-between gap-1.5 h-12 pt-2 px-1">
              <div className="flex-1 bg-emerald-200 h-6 rounded-t-sm"></div>
              <div className="flex-1 bg-emerald-300 h-8 rounded-t-sm"></div>
              <div className="flex-1 bg-emerald-200 h-5 rounded-t-sm"></div>
              <div className="flex-1 bg-emerald-300 h-7 rounded-t-sm"></div>
              <div className="flex-1 bg-emerald-400 h-10 rounded-t-sm"></div>
              <div className="flex-1 bg-emerald-300 h-9 rounded-t-sm"></div>
              <div className="flex-1 bg-emerald-300 h-9 rounded-t-sm"></div>
            </div>
          </div>

          {/* Promote Card */}
          <div
            className={`rounded-3xl p-6 shadow-md transition-all duration-300 flex flex-col justify-between min-h-[200px] ${
              status === "PROMOTED"
                ? "bg-emerald-800 text-white border border-emerald-700"
                : "bg-[#f76707] text-white border border-[#e8590c]"
            }`}
          >
            <div className="space-y-2">
              <h4 className="text-lg font-bold">
                {status === "PROMOTED" ? "Rollout Completed" : "Promote to Production"}
              </h4>
              <p className="text-xs font-medium text-white/80 leading-relaxed">
                {status === "PROMOTED"
                  ? "Global traffic routing is active. High availability protocols operational."
                  : `Unlock final gate for global traffic routing to ${version.replace("-alpha", "")}.`}
              </p>
            </div>

            {status === "PROMOTED" ? (
              <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-2xl p-3 border border-white/10 text-xs font-bold">
                <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
                <span>Active Release Version: {version.replace("-alpha", "")}</span>
              </div>
            ) : (
              <button
                onClick={handlePromote}
                className="mt-6 flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gray-950/90 text-white font-bold text-xs hover:bg-black transition-all shadow-sm tracking-wider uppercase"
              >
                <Rocket className="h-4 w-4" />
                Live Promotion
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Checklist & Version Log */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Launch Checklist */}
        <div className="bg-[#e9ecef]/40 rounded-3xl p-8 border border-gray-200/50 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-gray-950">
            Launch Checklist
          </h3>

          <div className="flex flex-col space-y-4">
            {checklist.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleChecklist(item.id)}
                className="flex items-center gap-3.5 text-left group w-full"
              >
                {item.checked ? (
                  <div className="h-5 w-5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 stroke-[3px]" />
                  </div>
                ) : (
                  <div className="h-5 w-5 border border-gray-300 rounded-full bg-white shrink-0 transition-all group-hover:border-gray-500" />
                )}
                <span
                  className={`text-xs font-bold transition-all ${
                    item.checked ? "text-gray-400 line-through font-medium" : "text-gray-800"
                  }`}
                >
                  {item.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Version History */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-950">
              Version History
            </h3>
            <button className="text-xs text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase tracking-wider">
              View All Logs
            </button>
          </div>

          <div className="flex flex-col space-y-4 divide-y divide-gray-50">
            {versionHistory.map((v, index) => (
              <div
                key={v.version}
                className={`flex justify-between items-center ${index > 0 ? "pt-4" : ""}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-gray-900">{v.version}</span>
                    <span
                      className={`text-[8px] font-extrabold tracking-wider px-2 py-0.5 rounded-full ${
                        v.type === "STABLE"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {v.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-semibold">{v.desc}</p>
                </div>
                <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap">
                  {v.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Real-Time Stability Monitor */}
      <div className="bg-[#e9ecef]/40 rounded-3xl p-8 border border-gray-200/50 shadow-sm space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
            Real-time Stability Monitor
          </h3>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            Tracking global latency and error rates across all African nodes. Our current
            baseline is 45ms average response time.
          </p>
        </div>

        {/* Statistics Columns */}
        <div className="grid grid-cols-3 gap-4 divide-x divide-gray-300/60 pt-4">
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-[9px] font-extrabold text-[#b05e1c] tracking-widest uppercase">
              Latency
            </span>
            <span className="text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">
              {latency}ms
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-[9px] font-extrabold text-[#b05e1c] tracking-widest uppercase">
              Errors
            </span>
            <span className="text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">
              {errorRate}%
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-[9px] font-extrabold text-[#b05e1c] tracking-widest uppercase">
              Traffic
            </span>
            <span className="text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">
              {traffic}k/s
            </span>
          </div>
        </div>
      </div>

      {/* New Deployment Modal */}
      {showNewDeploymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-xl border border-gray-100 relative space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-950">
                Trigger New Deployment
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Configure release version and staging pipelines.
              </p>
            </div>

            <form onSubmit={startNewDeployment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 block">
                  Version String
                </label>
                <input
                  type="text"
                  required
                  value={modalVersion}
                  onChange={(e) => setModalVersion(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#053d26]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 block">
                  Target Cluster
                </label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#053d26]">
                  <option>Nairobi Region (Cluster-A)</option>
                  <option>Lagos Hub (Cluster-B)</option>
                  <option>Global Cluster (All Nodes)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewDeploymentModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#053d26] text-white text-xs font-bold hover:bg-[#042d1c]"
                >
                  Start Rollout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
