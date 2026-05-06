"use client";

import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
  badge?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  iconBgColor = "bg-green-100",
  iconTextColor = "text-green-700",
  badge,
}: StatCardProps) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col h-full justify-between">
      <div className="flex justify-between items-start mb-6">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBgColor} ${iconTextColor}`}>
          {icon}
        </div>
        {badge && (
          <div className="rounded-full bg-orange-100 px-2 py-1 text-xs font-bold text-orange-700">
            {badge}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">
          {title}
        </p>
        <p className="text-4xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
