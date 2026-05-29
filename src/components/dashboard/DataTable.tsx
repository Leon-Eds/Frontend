"use client";

import { DashboardActivity } from "@/lib/api";
import { ArrowRight, Clock } from "lucide-react";

interface DataTableProps {
  activities?: DashboardActivity[];
}

export default function DataTable({ activities }: DataTableProps) {
  const hasActivities = activities && activities.length > 0;

  return (
    <div className="w-full bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-gray-100 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500/20 via-[#b05e1c]/40 to-orange-500/10" />

      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recent Activities</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Real-time system actions ledger</p>
        </div>
        <button className="text-xs font-bold text-[#b05e1c] flex items-center gap-1.5 hover:underline bg-[#b05e1c]/5 hover:bg-[#b05e1c]/10 px-3.5 py-2 rounded-full transition-all duration-300">
          View All History <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
      
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 relative z-10">
        <div className="min-w-[600px]">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 pb-4 border-b border-gray-100 text-[9px] font-bold uppercase tracking-[0.25em] text-gray-400">
            <div className="col-span-2 pl-2">Timestamp</div>
            <div className="col-span-5">Activity Details</div>
            <div className="col-span-3">Domain Category</div>
            <div className="col-span-2 text-right pr-2">Ledger Status</div>
          </div>
          
          {/* Rows List */}
          <div className="space-y-2 mt-3">
            {hasActivities ? (
              activities.map((activity) => {
                const initials = activity.userName
                  ? activity.userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                  : '?';

                // Format nice initials colors
                const avatarBg = 
                  activity.category?.toLowerCase().includes('grade') || activity.category?.toLowerCase().includes('approval')
                    ? 'bg-emerald-50 text-[#053d26] border-emerald-100/50'
                    : activity.category?.toLowerCase().includes('finance') || activity.category?.toLowerCase().includes('billing')
                    ? 'bg-amber-50 text-amber-700 border-amber-100/50'
                    : 'bg-blue-50 text-blue-700 border-blue-100/50';

                return (
                  <div 
                    key={activity.id} 
                    className="grid grid-cols-12 gap-4 items-center p-3.5 bg-gray-50/20 hover:bg-gray-50/60 border border-gray-100/40 hover:border-gray-200/50 rounded-2xl transition-all duration-300 group shadow-[0_2px_6px_rgba(0,0,0,0.005)]"
                  >
                    {/* Timestamp */}
                    <div className="col-span-2 pl-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-gray-400 group-hover:text-[#053d26] transition-colors" />
                        <span className="text-xs font-extrabold text-gray-900 leading-none">
                          {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mt-1 pl-4.5">
                        {new Date(activity.date).getFullYear()}
                      </span>
                    </div>
                    
                    {/* Details */}
                    <div className="col-span-5 flex items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[10px] font-black border uppercase shadow-sm ${avatarBg}`}>
                        {initials}
                      </div>
                      <span className="text-xs font-extrabold text-gray-900 leading-snug group-hover:text-[#053d26] transition-colors">
                        {activity.description || activity.userName || 'Activity'}
                      </span>
                    </div>
                    
                    {/* Category */}
                    <div className="col-span-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-gray-100/60 text-gray-500 border border-gray-200/40 uppercase tracking-wider">
                        {activity.category}
                      </span>
                    </div>
                    
                    {/* Status */}
                    <div className="col-span-2 text-right pr-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] shadow-sm ${
                        activity.status?.toUpperCase() === 'VERIFIED' || activity.status?.toUpperCase() === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/80'
                          : activity.status?.toUpperCase() === 'PENDING' || activity.status?.toUpperCase() === 'PENDING REVIEW'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100/80 animate-pulse'
                          : 'bg-gray-50 text-gray-600 border border-gray-200/80'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center">
                <div className="flex flex-col items-center gap-3 opacity-30">
                  <Clock className="h-8 w-8 text-gray-400" />
                  <div>
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">No activities recorded</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Activities will register automatically on ledger changes.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

