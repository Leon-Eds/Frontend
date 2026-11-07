import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal/LegalContent";

export const metadata: Metadata = {
  title: "Privacy Policy | LeonEd",
  description: "How LeonEd protects the integrity of institutional and academic data.",
};

export default function PrivacyPage() {
  return <LegalPage slug="privacy" />;
}
