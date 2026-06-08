"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  ShieldAlert, 
  MoreVertical, 
  Mail, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  UserPlus
} from "lucide-react";
import { schoolApi, formatDate } from "@/lib/api";

export default function GlobalUsersManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const data = await schoolApi.getAll();
        const extractedUsers = Array.isArray(data) ? data : [];
        setUsers(extractedUsers);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Global User Directory</h1>
          <p className="text-gray-600">Manage administrative access and roles across the entire LeonEd platform.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#053d26] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#042c1b] transition-all shadow-md">
          <UserPlus className="h-5 w-5" />
          Invite Admin
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search users by name or email..."
              className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[#053d26] transition-all text-gray-900"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
            <Filter className="h-4 w-4" />
            Filter Status
          </button>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#053d26]" />
            <p className="text-gray-500 font-medium">Retrieving authorized users...</p>
          </div>
        ) : error ? (
          <div className="py-20 flex flex-col items-center gap-4 text-center px-4">
            <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-2">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <p className="text-red-600 font-bold">Failed to load directory</p>
            <p className="text-sm text-gray-500 max-w-md">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-5 px-8 font-bold text-gray-400 text-xs uppercase tracking-wider">User Profile</th>
                  <th className="py-5 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider">System Role</th>
                  <th className="py-5 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Last Activity</th>
                  <th className="py-5 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider text-right">Status</th>
                  <th className="py-5 px-8 font-bold text-gray-400 text-xs uppercase tracking-wider text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.length > 0 ? users.map((user) => (
                  <tr key={user.id} className="group hover:bg-gray-50/30 transition-colors">
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold border border-gray-200 uppercase">
                          {(user.adminName || user.name || "A")[0]}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{user.adminName || user.name || 'Unknown User'}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        SchoolAdmin
                      </span>
                    </td>
                    <td className="py-6 px-4 text-sm text-gray-500 font-medium">{formatDate(user.createdAt)}</td>
                    <td className="py-6 px-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        user.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {user.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-6 px-8 text-right">
                      <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-60">
                        <Users className="h-10 w-10 text-gray-400" />
                        <p className="text-gray-500 font-medium">No administrators found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-8 py-6 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">Showing {users.length} Registered Schools</p>
          <div className="flex items-center gap-2">
            <button disabled className="p-2 rounded-xl border border-gray-200 bg-white opacity-50"><ChevronLeft className="h-5 w-5 text-gray-400" /></button>
            <button disabled className="p-2 rounded-xl border border-gray-200 bg-white opacity-50"><ChevronRight className="h-5 w-5 text-gray-400" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
