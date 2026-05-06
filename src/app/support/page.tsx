"use client";

import { HelpCircle, Mail, MessageSquare, Phone, ArrowLeft, ExternalLink, Activity } from "lucide-react";
import Link from "next/link";

export default function SystemSupport() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 md:p-20">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#053d26] transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Terminal
        </Link>

        <div className="space-y-4">
          <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-[2rem] flex items-center justify-center">
            <HelpCircle className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">System Support</h1>
          <p className="text-xl text-gray-500">24/7 technical assistance for the LeonEd Africa community.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-100 space-y-4 hover:border-blue-500 transition-all group">
            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Mail className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Email Support</h2>
            <p className="text-sm text-gray-500 leading-relaxed">Send us a detailed report of your technical issues or feature requests.</p>
            <a href="mailto:support@leoned.africa" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
              support@leoned.africa <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-100 space-y-4 hover:border-green-500 transition-all group">
            <div className="h-12 w-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Live Concierge</h2>
            <p className="text-sm text-gray-500 leading-relaxed">Connect with a LeonEd support specialist via WhatsApp or live chat.</p>
            <button className="text-sm font-bold text-green-600 hover:underline">
              Start Live Chat
            </button>
          </div>
        </div>

        <div className="bg-[#053d26] rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-300">
              <Activity className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-widest">System Status</span>
            </div>
            <h3 className="text-2xl font-bold">All Systems Operational</h3>
            <p className="text-sm text-green-100/70">Monitoring API clusters and database clusters in real-time.</p>
          </div>
          <button className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-all whitespace-nowrap">
            View Incident History
          </button>
        </div>
      </div>
    </div>
  );
}
