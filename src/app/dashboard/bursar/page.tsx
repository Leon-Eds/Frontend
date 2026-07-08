"use client";

import React, { useState, useEffect } from "react";
import { Banknote, Search, CheckCircle, AlertCircle, Loader2, FileText, Download } from "lucide-react";
import { bursarApi, reportApi } from "@/lib/api";
import { toast } from "react-hot-toast";
export default function BursarDashboard() {
  const [activeTab, setActiveTab] = useState<"pending" | "records" | "reports">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);

  // We could fetch actual data here using bursarApi
  // For now, this is the layout and structure for the Bursar role
  
  useEffect(() => {
    const fetchBursarData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === "pending") {
          const outData = await reportApi.getOutstandingFees();
          const items = Array.isArray(outData) ? outData : (outData as any)?.items || (outData as any)?.data || [];
          setStudents(items.map((i: any) => ({
            id: i.studentId || i.id,
            name: i.studentName || i.fullName || "Unknown",
            admissionNumber: i.admissionNumber || "N/A",
            class: i.className || "N/A",
            amountPending: i.outstandingAmount || i.amountDue || 0,
            termId: i.termId || "",
            status: "Pending"
          })));
        } else if (activeTab === "records") {
          const recData = await reportApi.getFeePayment();
          const items = Array.isArray(recData) ? recData : (recData as any)?.items || (recData as any)?.data || [];
          setStudents(items.map((i: any) => ({
            id: i.studentId || i.id,
            name: i.studentName || i.fullName || "Unknown",
            admissionNumber: i.admissionNumber || "N/A",
            class: i.className || "N/A",
            amountPending: 0,
            termId: i.termId || "",
            status: "Cleared"
          })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBursarData();
  }, [activeTab]);

  const handleClearFee = async (studentId: string, termId: string) => {
    try {
      await bursarApi.clearFee(studentId, termId);
      toast.success("Fee cleared successfully");
      // Update local state
      setStudents(students.map(s => s.id === studentId ? { ...s, status: "Cleared", amountPending: 0 } : s));
    } catch (e: any) {
      toast.error(e.message || "Failed to clear fee");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-[#053d26] mb-2">Bursar Portal</h1>
          <p className="text-gray-600">Manage fee clearances, track payments, and generate financial reports.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("pending")}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "pending"
              ? "border-[#053d26] text-[#053d26]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Pending Clearances
        </button>
        <button
          onClick={() => setActiveTab("records")}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "records"
              ? "border-[#053d26] text-[#053d26]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Payment Records
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "reports"
              ? "border-[#053d26] text-[#053d26]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Financial Reports
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[400px]">
        {activeTab === "pending" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Pending Clearances</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search student or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#20c997]/20"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#053d26]" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                      <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Admission No</th>
                      <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Class</th>
                      <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Amount</th>
                      <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.filter(s => s.status === "Pending").map((student) => (
                      <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="py-4 px-4">
                          <p className="font-bold text-gray-900">{student.name}</p>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">{student.admissionNumber}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{student.class}</td>
                        <td className="py-4 px-4 text-sm font-bold text-[#b05e1c]">
                          ₦{student.amountPending.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleClearFee(student.id, student.termId)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#20c997]/10 text-[#053d26] font-bold text-sm hover:bg-[#20c997]/20 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Clear Fee
                          </button>
                        </td>
                      </tr>
                    ))}
                    {students.filter(s => s.status === "Pending").length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-gray-500">
                          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          No pending fee clearances found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "records" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Payment Records</h2>
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                      <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Admission No</th>
                      <th className="py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.filter(s => s.status === "Cleared").map((student) => (
                      <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="py-4 px-4">
                          <p className="font-bold text-gray-900">{student.name}</p>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">{student.admissionNumber}</td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3" />
                            Cleared
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Financial Reports</h2>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#053d26] text-white font-bold text-sm hover:bg-[#042c1b] transition-colors">
                  <Download className="h-4 w-4" />
                  Export All
                </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50">
                 <FileText className="h-8 w-8 text-[#053d26] mb-4" />
                 <h3 className="font-bold text-gray-900 mb-1">Fee Collection Report</h3>
                 <p className="text-sm text-gray-500 mb-4">Summary of all fees collected by class and term.</p>
                 <button className="text-sm font-bold text-[#20c997] hover:underline">Generate &rarr;</button>
               </div>
               <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50">
                 <AlertCircle className="h-8 w-8 text-[#b05e1c] mb-4" />
                 <h3 className="font-bold text-gray-900 mb-1">Outstanding Fees</h3>
                 <p className="text-sm text-gray-500 mb-4">List of all students with pending balances.</p>
                 <button className="text-sm font-bold text-[#b05e1c] hover:underline">Generate &rarr;</button>
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
