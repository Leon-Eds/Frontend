"use client";

import { Search, Bell } from "lucide-react";
import Image from "next/image";
import { mockUser } from "@/lib/mocks/user";

export default function Header() {
  return (
    <header className="flex h-20 items-center justify-between bg-gray-50/80 px-8 backdrop-blur-sm border-b border-gray-200">
      {/* Search Bar */}
      <div className="flex w-1/3 items-center">
        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-full border-0 bg-gray-200/70 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26]"
            placeholder="Search academic records..."
          />
        </div>
      </div>

      {/* Center Tabs */}
      <div className="flex space-x-6 h-full">
        <div className="flex h-full items-center border-b-2 border-[#b05e1c] px-2 text-sm font-semibold text-gray-900">
          Term Overview
        </div>
        <div className="flex h-full items-center border-b-2 border-transparent px-2 text-sm font-medium text-gray-500 hover:text-gray-900 cursor-pointer">
          Schedule
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center space-x-6">
        <button className="relative text-gray-600 hover:text-gray-900 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-[#b05e1c] border border-white"></span>
        </button>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900 leading-tight">
              {mockUser.role}
            </div>
            <div className="text-xs text-gray-500 leading-tight">
              {mockUser.institution}
            </div>
          </div>
          <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={mockUser.avatar} 
              alt={mockUser.name} 
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
