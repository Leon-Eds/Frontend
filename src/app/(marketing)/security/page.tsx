import type { Metadata } from "next";
import { SecurityContent } from "@/components/marketing/pages/SecurityContent";

export const metadata: Metadata = {
  title: "Security | LeonEd",
  description: "How LeonEd protects school data: TLS 1.3 and AES-256 encryption, audit logs, role-based access and full data ownership.",
};

export default function SecurityPage() {
  return <SecurityContent />;
}
