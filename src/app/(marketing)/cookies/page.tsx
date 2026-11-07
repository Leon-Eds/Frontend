import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal/LegalContent";

export const metadata: Metadata = {
  title: "Cookie Policy | LeonEd",
  description: "What cookies and similar technologies LeonEd uses, and how you can control them.",
};

export default function CookiesPage() {
  return <LegalPage slug="cookies" />;
}
