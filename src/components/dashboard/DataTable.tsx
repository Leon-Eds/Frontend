"use client";

import { DashboardActivity } from "@/lib/api";

interface DataTableProps {
  activities?: DashboardActivity[];
}

export default function DataTable({ activities }: DataTableProps) {
  const hasActivities = activities && activities.length > 0;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
        <button className="text-sm font-semibold text-[#b05e1c] hover:underline">
          View All History
        </button>
      </div>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 border-b border-gray-100 bg-gray-50/50 p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <div className="col-span-2 pl-2">Date</div>
          <div className="col-span-5">Activity</div>
          <div className="col-span-3">Category</div>
          <div className="col-span-2 text-right pr-2">Status</div>
        </div>
        
        <div className="divide-y divide-gray-100 p-2">
          {hasActivities ? (
            activities.map((activity) => {
              const initials = activity.userName
                ? activity.userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                : '?';

              return (
                <div key={activity.id} className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="col-span-2 pl-1">
                    <span className="text-sm font-medium text-gray-600 block">
                      {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-sm text-gray-500 block">
                      {new Date(activity.date).getFullYear()}
                    </span>
                  </div>
                  
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold bg-green-100 text-green-700">
                      {initials}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {activity.description || activity.userName || 'Activity'}
                    </span>
                  </div>
                  
                  <div className="col-span-3">
                    <span className="text-sm text-gray-600">{activity.category}</span>
                  </div>
                  
                  <div className="col-span-2 text-right">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${
                      activity.status?.toUpperCase() === 'VERIFIED' || activity.status?.toUpperCase() === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : activity.status?.toUpperCase() === 'PENDING' || activity.status?.toUpperCase() === 'PENDING REVIEW'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-400 text-sm">
              No recent activities to display.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
