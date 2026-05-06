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
  iconBgColor = "text-[#053d26]",
  iconTextColor = "text-[#053d26]",
  badge,
}: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] hover:-translate-y-1">
      {/* Decorative Gradient Accent */}
      <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-gray-50 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-10">
          <div className={`${iconTextColor} opacity-80 group-hover:opacity-100 transition-opacity`}>
            {/* The icon itself should be clean without a circular background */}
            <div className="scale-125">
              {icon}
            </div>
          </div>
          {badge && (
            <div className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold text-[#053d26] uppercase tracking-wider border border-green-100">
              {badge}
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-gray-900 tracking-tight">
              {value}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
