"use client";

import { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  Shield,
  ShieldCheck,
  CloudLightning,
  Clock,
  Unlock,
  KeyRound,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  TrendingDown
} from "lucide-react";

// Initial logs
const initialLogs = [
  { time: "14:22:01", type: "AUTH", text: "Administrator root login from 192.168.1.44", border: "normal", rawType: "Success:" },
  { time: "14:21:45", type: "WARN", text: "Rate limit nearing threshold on /v1/core/deploy", border: "orange", rawType: "API:" },
  { time: "14:19:30", type: "ENC", text: "Automated RSA key rotation completed successfully", border: "normal", rawType: "Rotate:" },
  { time: "14:15:12", type: "CRIT", text: "Prevented 14 unauthorized SSH attempts from 203.0.113.5", border: "red", rawType: "Block:" },
];

export default function SecurityPage() {
  const [logs, setLogs] = useState(initialLogs);
  const [lockdown, setLockdown] = useState(false);
  const [lockdownTimer, setLockdownTimer] = useState<number | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto Scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Simulated live log generator
  useEffect(() => {
    if (lockdown) return; // Stop random logs during lockdown

    const logGenerator = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];

      const logPool = [
        { type: "AUTH", text: "API Token generated for microservice-node-4", border: "normal", rawType: "Token:" },
        { type: "ENC", text: "Rotated SSL key for dev.leoned.africa", border: "normal", rawType: "Rotate:" },
        { type: "WARN", text: "Slight database query latency spike detected: 92ms", border: "orange", rawType: "DB:" },
        { type: "WARN", text: "Unexpected payload size on /api/student: 4.2MB", border: "orange", rawType: "API:" },
        { type: "CRIT", text: "Blocked SQL Injection pattern on /api/auth/login from 182.2.11.45", border: "red", rawType: "SQL:" },
        { type: "AUTH", text: "SuperAdmin console accessed by user J. Mensah", border: "normal", rawType: "Access:" }
      ];

      const randomLog = logPool[Math.floor(Math.random() * logPool.length)];
      setLogs(prev => [
        ...prev,
        { time: timeStr, ...randomLog }
      ].slice(-15)); // Keep last 15 logs
    }, 6000);

    return () => clearInterval(logGenerator);
  }, [lockdown]);

  // Handle Lockdown activation
  const triggerLockdown = () => {
    if (lockdown) {
      // Release lockdown
      setLockdown(false);
      setLockdownTimer(null);
      const timeStr = new Date().toTimeString().split(" ")[0];
      setLogs(prev => [
        ...prev,
        { time: timeStr, type: "AUTH", text: "Emergency Lockdown Protocol deactivated by admin.", border: "normal", rawType: "System:" }
      ]);
    } else {
      // Trigger lockdown countdown
      setLockdownTimer(5);
      const countdownInterval = setInterval(() => {
        setLockdownTimer(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval);
            setLockdown(true);
            const timeStr = new Date().toTimeString().split(" ")[0];
            setLogs(old => [
              ...old,
              { time: timeStr, type: "CRIT", text: "ALL PORTS LOCKED. API Gateways isolated to secure nodes.", border: "red", rawType: "LOCKDOWN:" }
            ]);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  return (
    <>
      {/* Lockdown alert banner */}
      {lockdown && (
        <div className="bg-red-600 text-white px-6 py-4 rounded-3xl flex items-center justify-between border border-red-700 shadow-md animate-pulse">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-white stroke-[2.5px]" />
            <div>
              <p className="text-sm font-extrabold tracking-wide uppercase">System Lockdown Active</p>
              <p className="text-xs text-white/80 font-medium mt-0.5">Primary API access cut. Server cluster isolated.</p>
            </div>
          </div>
          <button
            onClick={triggerLockdown}
            className="px-4 py-2 rounded-xl bg-white text-red-700 font-bold text-xs hover:bg-red-50 transition-colors uppercase tracking-wider"
          >
            Release Lockdown
          </button>
        </div>
      )}

      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-extrabold tracking-widest text-[#b05e1c] uppercase">
            System Integrity
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Security Hardening
          </h1>
          <p className="text-sm text-gray-500 font-medium max-w-2xl leading-relaxed">
            Orchestrate infrastructure defense, audit real-time encryption health, and
            manage automated redundancy protocols.
          </p>
        </div>

        {/* Action button */}
        {lockdownTimer !== null ? (
          <button
            disabled
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-orange-600 text-white font-extrabold text-xs shadow-md tracking-wider uppercase animate-pulse shrink-0"
          >
            <Clock className="h-4 w-4 animate-spin" />
            Locking in {lockdownTimer}s...
          </button>
        ) : (
          <button
            onClick={triggerLockdown}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-white font-extrabold text-xs shadow-md tracking-wider uppercase transition-colors shrink-0 ${
              lockdown
                ? "bg-emerald-700 hover:bg-emerald-800"
                : "bg-red-700 hover:bg-red-800"
            }`}
          >
            {lockdown ? (
              <>
                <Unlock className="h-4 w-4" />
                Deactivate Lockdown
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Secure Lockdown
              </>
            )}
          </button>
        )}
      </div>

      {/* Row 1: Live Security Logs + Backup Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Live Security Logs (2/3) */}
        <div className="lg:col-span-2 bg-[#f8f9fa] rounded-3xl p-6 border border-gray-200/60 shadow-sm flex flex-col justify-between min-h-[350px]">
          <div className="space-y-4 flex flex-col flex-1 overflow-hidden">
            <div className="flex justify-between items-center shrink-0">
              <h3 className="text-base font-bold text-gray-950">
                Live Security Logs
              </h3>
              <span className="bg-[#e6fcf5] text-[#0ca678] text-[9px] font-extrabold tracking-wider px-2.5 py-1 rounded-full uppercase animate-pulse">
                Monitoring
              </span>
            </div>

            {/* Logs viewport */}
            <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-5 overflow-y-auto font-mono text-[11px] leading-relaxed text-gray-700 space-y-3 max-h-[260px] no-scrollbar">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`flex gap-3 items-start border-l-2 pl-3 ${
                    log.border === "red"
                      ? "border-red-500 bg-red-50/20"
                      : log.border === "orange"
                      ? "border-amber-500 bg-amber-50/20"
                      : "border-gray-200"
                  }`}
                >
                  <span className="text-gray-400 font-medium shrink-0">{log.time}</span>
                  <span
                    className={`font-extrabold shrink-0 ${
                      log.type === "CRIT"
                        ? "text-red-600"
                        : log.type === "WARN"
                        ? "text-amber-600"
                        : log.type === "ENC"
                        ? "text-indigo-600"
                        : "text-gray-600"
                    }`}
                  >
                    [{log.type}]
                  </span>
                  <span className="text-gray-500 shrink-0 font-bold">{log.rawType}</span>
                  <span className="text-gray-800 font-semibold">{log.text}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>

        {/* Backup Status (1/3) */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 tracking-wider uppercase">
              Backup Status
            </h4>

            {/* Icon & Big title */}
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/50 shadow-sm shrink-0">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  99.9%
                </h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                  Redundancy Health
                </p>
              </div>
            </div>

            {/* Parameters list */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-gray-400">Last Snapshot</span>
                <span className="text-gray-800">4 mins ago</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-gray-400">Schedule</span>
                <span className="text-gray-800">Every 15 mins</span>
              </div>
            </div>
          </div>

          {/* Dummy action bar */}
          <div className="h-10 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Backup Node: Primary-A
          </div>
        </div>
      </div>

      {/* Row 2: Encryption Health + Traffic Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Encryption Health */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-950">
              Encryption Health
            </h3>
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <KeyRound className="h-4.5 w-4.5 text-gray-600" />
                <span className="text-xs font-bold text-gray-800">SSL/TLS Certificates</span>
              </div>
              <span className="bg-[#e6fcf5] text-[#0ca678] text-[8px] font-extrabold tracking-wider px-2.5 py-1 rounded-full uppercase">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4.5 w-4.5 text-gray-600" />
                <span className="text-xs font-bold text-gray-800">At-Rest AES-256</span>
              </div>
              <span className="bg-[#e6fcf5] text-[#0ca678] text-[8px] font-extrabold tracking-wider px-2.5 py-1 rounded-full uppercase">
                Secure
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <CloudLightning className="h-4.5 w-4.5 text-gray-600" />
                <span className="text-xs font-bold text-gray-800">Endpoint Hardening</span>
              </div>
              <span className="bg-orange-50 text-orange-600 border border-orange-100 text-[8px] font-extrabold tracking-wider px-2.5 py-1 rounded-full uppercase">
                Upgrade Req
              </span>
            </div>
          </div>
        </div>

        {/* Traffic Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-bold text-gray-950">
                Traffic Distribution
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                Global egress monitoring for anomalous patterns
              </p>
            </div>
            {/* Traffic lights indicators */}
            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
              <div className="h-2 w-2 rounded-full bg-amber-400"></div>
              <div className="h-2 w-2 rounded-full bg-red-400"></div>
            </div>
          </div>

          {/* Visual Chart with faint "METRICS" */}
          <div className="relative h-24 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden">
            <span className="absolute text-3xl font-extrabold tracking-[0.2em] text-gray-200/40 select-none uppercase">
              Metrics
            </span>
            
            {/* Overlay pillars */}
            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-8 px-4 h-full items-end">
              <div className="w-6 bg-gradient-to-t from-orange-400 to-amber-300 h-3/5 rounded-t-xl opacity-90 animate-pulse"></div>
              <div className="w-6 bg-gradient-to-t from-red-500 to-rose-400 h-2/5 rounded-t-xl opacity-90"></div>
            </div>
            
            {/* Small hovering badge icon */}
            <div className="absolute right-4 top-4 h-8 w-8 rounded-full bg-orange-800 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>

          {/* Metrics summary row */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[9px] text-gray-400 font-bold uppercase">Incoming</p>
              <p className="text-xs font-extrabold text-gray-900 mt-1">{lockdown ? "0.1 TB/s" : "1.2 TB/s"}</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 font-bold uppercase">Blocked</p>
              <p className="text-xs font-extrabold text-gray-900 mt-1">{lockdown ? "25.1k" : "4.8k"}</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 font-bold uppercase">Filtered</p>
              <p className="text-xs font-extrabold text-gray-900 mt-1">{lockdown ? "99.9%" : "92%"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Security hardening tasks list */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-gray-950">
            Recent Security Hardening Tasks
          </h3>
          <button className="text-xs text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase tracking-wider flex items-center gap-0.5">
            <span>View Full Audit Trail</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex flex-col space-y-3.5">
          {/* Task 1 */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-50/50 border border-gray-100 rounded-2xl gap-4 hover:shadow-sm transition-all">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-white border border-gray-200/50 shadow-sm flex items-center justify-center text-gray-700 shrink-0">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Patch Deployment OS-12.4</h4>
                <p className="text-[10px] text-gray-500 font-medium">Core Kernel Vulnerability Mitigation</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[10px] font-semibold">
              <div className="flex items-center gap-1">
                <span className="text-gray-400">Applied to</span>
                <span className="text-gray-800 font-bold">32 Nodes</span>
              </div>
              <span className="bg-[#e6fcf5] text-[#0ca678] font-extrabold px-2.5 py-1 rounded-full uppercase">
                Completed
              </span>
              <span className="text-gray-400 font-bold">Today, 11:20 AM</span>
              <ChevronRight className="h-4 w-4 text-gray-400 hidden md:block" />
            </div>
          </div>

          {/* Task 2 */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-50/50 border border-gray-100 rounded-2xl gap-4 hover:shadow-sm transition-all">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-white border border-gray-200/50 shadow-sm flex items-center justify-center text-gray-700 shrink-0">
                <Clock className="h-4.5 w-4.5 text-amber-600 animate-spin" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Firewall Rule Update</h4>
                <p className="text-[10px] text-gray-500 font-medium">Restricted PORT 22 access for subnet B</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[10px] font-semibold">
              <div className="flex items-center gap-1">
                <span className="text-gray-400">Applied to</span>
                <span className="text-gray-800 font-bold">Global Edge</span>
              </div>
              <span className="bg-orange-50 text-orange-600 border border-orange-100 font-extrabold px-2.5 py-1 rounded-full uppercase">
                In Progress
              </span>
              <span className="text-gray-400 font-bold">Today, 09:45 AM</span>
              <ChevronRight className="h-4 w-4 text-gray-400 hidden md:block" />
            </div>
          </div>

          {/* Task 3 */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-50/50 border border-gray-100 rounded-2xl gap-4 hover:shadow-sm transition-all">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-white border border-gray-200/50 shadow-sm flex items-center justify-center text-gray-700 shrink-0">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">MFA Force Re-Auth</h4>
                <p className="text-[10px] text-gray-500 font-medium">Mandatory token refresh for high-privilege users</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[10px] font-semibold">
              <div className="flex items-center gap-1">
                <span className="text-gray-400">Applied to</span>
                <span className="text-gray-800 font-bold">14 Users</span>
              </div>
              <span className="bg-[#e6fcf5] text-[#0ca678] font-extrabold px-2.5 py-1 rounded-full uppercase">
                Completed
              </span>
              <span className="text-gray-400 font-bold">Yesterday, 11:20 PM</span>
              <ChevronRight className="h-4 w-4 text-gray-400 hidden md:block" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
