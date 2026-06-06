"use client";

import { useState, useEffect } from "react";
import {
  Server,
  Database,
  Cpu,
  Layers,
  CheckCircle,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Clock,
  Radio,
  FileCode
} from "lucide-react";

const initialCheckLogs = [
  { time: "14:26:01", component: "LoadBalancer", status: "HEALTHY", desc: "Egress routing balanced across all 24 staging/prod nodes." },
  { time: "14:24:12", component: "PostgreSQL", status: "HEALTHY", desc: "Replica lag at 0.12s. All tables synchronized." },
  { time: "14:20:00", component: "RedisCache", status: "HEALTHY", desc: "Memory utilization stable at 512MB. Evictions: 0." },
  { time: "14:15:30", component: "GatewayAPI", status: "HEALTHY", desc: "Active handshake check successful with billing endpoints." },
];

export default function SystemHealthPage() {
  const [logs, setLogs] = useState(initialCheckLogs);
  const [latency, setLatency] = useState(42);
  const [cpu, setCpu] = useState(18);
  const [connections, setConnections] = useState(2840);
  const [cacheHit, setCacheHit] = useState(96.4);

  // Live updates to simulate active server vitals
  useEffect(() => {
    const timer = setInterval(() => {
      setLatency(prev => {
        const delta = (Math.random() - 0.5) * 3;
        return Number(Math.max(38, Math.min(48, prev + delta)).toFixed(0));
      });
      setCpu(prev => {
        const delta = (Math.random() - 0.5) * 2;
        return Number(Math.max(14, Math.min(25, prev + delta)).toFixed(0));
      });
      setConnections(prev => {
        const delta = (Math.random() - 0.5) * 80;
        return Number(Math.max(2600, Math.min(3100, prev + delta)).toFixed(0));
      });
      setCacheHit(prev => {
        const delta = (Math.random() - 0.5) * 0.2;
        return Number(Math.max(95.2, Math.min(98.1, prev + delta)).toFixed(1));
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Live health logs generator
  useEffect(() => {
    const logTimer = setInterval(() => {
      const components = ["PostgreSQL", "RedisCache", "GatewayAPI", "LoadBalancer", "StorageNode-4"];
      const randomComponent = components[Math.floor(Math.random() * components.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];

      const newLog = {
        time: timeStr,
        component: randomComponent,
        status: "HEALTHY",
        desc: `Routine diagnostic check completed. Response code: 200 OK. Vitals normal.`
      };

      setLogs(prev => [newLog, ...prev].slice(0, 10)); // Keep latest 10 logs
    }, 8000);

    return () => clearInterval(logTimer);
  }, []);

  return (
    <>
      {/* Title Block */}
      <div className="space-y-1">
        <p className="text-[10px] font-extrabold tracking-widest text-[#b05e1c] uppercase">
          System Infrastructure
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          System Health
        </h1>
        <p className="text-sm text-gray-500 font-medium max-w-2xl leading-relaxed">
          Real-time cluster vitals, load balance routing, database replica synchrony,
          and cache hit metrics.
        </p>
      </div>

      {/* Grid: 4 Core Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Latency */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Average Latency</span>
            <h3 className="text-2xl font-extrabold text-gray-900">{latency}ms</h3>
            <span className="text-[10px] text-emerald-600 font-extrabold tracking-wide uppercase">Baseline: 45ms</span>
          </div>
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* CPU */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">CPU Load</span>
            <h3 className="text-2xl font-extrabold text-gray-900">{cpu}%</h3>
            <span className="text-[10px] text-[#0ca678] font-extrabold tracking-wide uppercase animate-pulse">24 Nodes Active</span>
          </div>
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <Cpu className="h-5 w-5" />
          </div>
        </div>

        {/* Connections */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Connections</span>
            <h3 className="text-2xl font-extrabold text-gray-900">{connections.toLocaleString()} /s</h3>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Load Balanced</span>
          </div>
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
        </div>

        {/* Redis Cache hit rate */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Cache Hit Rate</span>
            <h3 className="text-2xl font-extrabold text-gray-900">{cacheHit}%</h3>
            <span className="text-[10px] text-[#b05e1c] font-extrabold tracking-wide uppercase">Optimal Performance</span>
          </div>
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <Layers className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Row 2: Database health + Redis stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Database cluster */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-950">
              Database Clusters
            </h3>
            <Database className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {/* Database Row 1 */}
            <div className="flex justify-between items-center p-3 bg-gray-50/50 border border-gray-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-gray-900">Cluster-A (Primary)</span>
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Online</span>
            </div>

            {/* Database Row 2 */}
            <div className="flex justify-between items-center p-3 bg-gray-50/50 border border-gray-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-gray-900">Cluster-B (Failover)</span>
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Online</span>
            </div>

            {/* Database Row 3 */}
            <div className="flex justify-between items-center p-3 bg-gray-50/50 border border-gray-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-bold text-gray-900">Replica lag</span>
              </div>
              <span className="text-xs font-extrabold text-emerald-600">0.12s (Optimal)</span>
            </div>
          </div>
        </div>

        {/* Redis Cache */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-950">
              Redis Cache Vitals
            </h3>
            <Radio className="h-5 w-5 text-[#b05e1c]" />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-xs">
              <span className="text-gray-400 font-semibold">Memory Allocated</span>
              <span className="font-extrabold text-gray-800">512 MB / 2 GB</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-xs">
              <span className="text-gray-400 font-semibold">Cache Evictions</span>
              <span className="font-extrabold text-gray-800">0</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-xs">
              <span className="text-gray-400 font-semibold">Expired Keys</span>
              <span className="font-extrabold text-gray-800">4,284 / hr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Live diagnostic health check logs */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-gray-950">
            Live Health Diagnostics
          </h3>
          <span className="bg-[#e6fcf5] text-[#0ca678] text-[9px] font-extrabold tracking-wider px-2.5 py-1 rounded-full uppercase animate-pulse">
            Active polling
          </span>
        </div>

        {/* Scrollable logs */}
        <div className="space-y-3.5">
          {logs.map((log, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50/50 border border-gray-100 rounded-2xl gap-4 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white border border-gray-200/50 shadow-sm flex items-center justify-center text-[#2b8a3e] shrink-0">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                    <span>{log.component}</span>
                    <span className="bg-[#e6fcf5] text-[#2b8a3e] text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                      {log.status}
                    </span>
                  </h4>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5 leading-relaxed">
                    {log.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold whitespace-nowrap">
                <Clock className="h-3.5 w-3.5" />
                <span>{log.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
