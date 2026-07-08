"use client";

import { useEffect, useState } from "react";
import { CreditCard, Download, Search, AlertCircle, Loader2 } from "lucide-react";
import { DataTable, Column } from "@/components/ui/DataTable";
import { getAuthHeaders } from "@/lib/api";

const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? '/backend-api'
  : 'https://leoned.vercel.app/api';

export default function PaymentsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

    const [rawApiData, setRawApiData] = useState<any>(null);

    useEffect(() => {
      const fetchLogs = async () => {
        try {
          const token = localStorage.getItem("leoned_token");
          const headers = {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            };
          
          // Fetch from both sources in parallel to get all logs
          const [resAll, resPaystack, resManual] = await Promise.all([
            fetch(`${API_BASE_URL}/subscription-logs?pageSize=100`, { headers }),
            fetch(`${API_BASE_URL}/subscription-logs?pageSize=100&source=Paystack`, { headers }),
            fetch(`${API_BASE_URL}/subscription-logs?pageSize=100&source=Manual`, { headers }),
          ]);
          
          const findArray = (obj: any): any[] | null => {
            if (!obj) return null;
            if (Array.isArray(obj)) return obj;
            if (typeof obj === 'object') {
              for (const key of Object.keys(obj)) {
                if (Array.isArray(obj[key])) return obj[key];
              }
              for (const key of Object.keys(obj)) {
                if (typeof obj[key] === 'object') {
                  const arr = findArray(obj[key]);
                  if (arr) return arr;
                }
              }
            }
            return null;
          };

          // Collect all logs from all responses
          const allLogs: any[] = [];
          for (const res of [resAll, resPaystack, resManual]) {
            if (res.ok) {
              const data = await res.json();
              const arr = findArray(data) || [];
              allLogs.push(...arr);
            }
          }
          
          // Deduplicate by id
          const seen = new Set<string>();
          const uniqueLogs = allLogs.filter(log => {
            if (!log.id || seen.has(log.id)) return false;
            seen.add(log.id);
            return true;
          });
          
          // Sort by date descending
          uniqueLogs.sort((a, b) => new Date(b.paidAt || b.createdAt || 0).getTime() - new Date(a.paidAt || a.createdAt || 0).getTime());
          
          setLogs(uniqueLogs);
        } catch (err: any) {
          setError(err.message || "Failed to load payment logs");
        } finally {
          setIsLoading(false);
        }
      };

      fetchLogs();
    }, []);

  const columns: Column<any>[] = [
    { header: "School", accessor: (log: any) => log.school?.name || "Unknown School" },
    { header: "Plan",
      accessor: (log: any) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#b05e1c]/10 text-[#b05e1c]">
          {log.plan?.name || "Unknown"}
        </span>
      )
    },
    { header: "Amount",
      accessor: (log: any) => <span className="font-bold text-[#053d26]">₦{Number(log.amount || 0).toLocaleString()}</span>
    },
    { header: "Status",
      accessor: (log: any) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
          log.status === "PENDING" ? "bg-amber-100 text-amber-800" :
          log.status === "FAILED" ? "bg-red-100 text-red-800" :
          "bg-green-100 text-green-800"
        }`}>
          {log.status || "COMPLETED"}
        </span>
      )
    },
    { header: "Date",
      accessor: (log: any) => {
        const d = new Date(log.paidAt || log.createdAt || Date.now());
        return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
    }
  ];

  const filteredLogs = logs.filter(log => 
    (log.school?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (log.plan?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 px-4 sm:px-6 lg:px-8 pt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Payment Logs</h1>
          <p className="text-gray-500 font-medium">Track all subscription payments and renewals across the platform.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors shadow-sm">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by school or plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#053d26]/20 transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#053d26]" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-rose-400" />
            <p>{error}</p>
          </div>
        ) : (
          <div className="[&>div]:border-none [&>div]:shadow-none [&_table]:w-full">
            <DataTable
              columns={columns}
              data={filteredLogs}
            />
            {filteredLogs.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                <p className="mb-4">No payment logs found.</p>
                {rawApiData && (
                  <div className="text-left mt-8 p-4 bg-gray-50 rounded-lg overflow-auto text-xs border border-gray-200">
                    <p className="font-bold mb-2">Raw API Response (Debug):</p>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(rawApiData, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
