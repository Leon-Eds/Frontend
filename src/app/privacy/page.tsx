"use client";

import { Shield, Lock, Eye, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LeonEdLogoText } from "@/components/ui/LeonEdText";

export default function PrivacyProtocol() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 md:p-20">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#053d26] transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Terminal
        </Link>

        <div className="space-y-4">
          <div className="h-16 w-16 bg-[#053d26]/10 text-[#053d26] rounded-[2rem] flex items-center justify-center">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Privacy Protocol</h1>
          <p className="text-xl text-gray-500">How <LeonEdLogoText /> protects institutional and academic data integrity.</p>
        </div>

        <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-gray-100 space-y-10">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[#053d26]">
              <Lock className="h-5 w-5" />
              <h2 className="text-xl font-bold">Data Encryption</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              All data transmitted within the <LeonEdLogoText /> ecosystem is encrypted using industry-standard TLS 1.3. At rest, sensitive academic and financial records are protected using AES-256 encryption.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[#053d26]">
              <Eye className="h-5 w-5" />
              <h2 className="text-xl font-bold">Access Transparency</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              We maintain strict audit logs for all administrative actions. Super Admins have the authority to monitor system-wide activity, but individual student data access is restricted to authorized school personnel.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[#053d26]">
              <FileText className="h-5 w-5" />
              <h2 className="text-xl font-bold">Data Sovereignty</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Institutions retain full ownership of their data. In the event of subscription termination, schools have a 30-day window to export all records before permanent deletion from our primary clusters.
            </p>
          </section>
        </div>

        <div className="text-center text-sm text-gray-400 font-medium">
          Last Updated: May 06, 2026
        </div>
      </div>
    </div>
  );
}
