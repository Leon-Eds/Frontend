"use client";

import { Construction } from "lucide-react";

export default function BursarDashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-in fade-in duration-500">
      <div className="bg-orange-50 text-orange-600 p-6 rounded-full mb-6">
        <Construction className="w-16 h-16" />
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
        Bursar Portal
      </h1>
      <h2 className="text-2xl font-bold text-gray-700 mb-4">
        Under Development
      </h2>
      <p className="text-gray-500 max-w-md mx-auto text-lg leading-relaxed">
        The advanced financial management tools, fee processing, and bursary workflows are currently being finalized and will be available shortly.
      </p>
    </div>
  );
}
