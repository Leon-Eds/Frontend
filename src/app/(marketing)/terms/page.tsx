import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal/LegalContent";

export const metadata: Metadata = {
  title: "Terms of Service | LeonEd",
  description: "The terms that apply when your school and its users access LeonEd.",
};

export default function TermsPage() {
  return <LegalPage slug="terms" />;
}
