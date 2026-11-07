import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal/LegalContent";

export const metadata: Metadata = {
  title: "Data Processing Agreement | LeonEd",
  description: "How LeonEd processes personal data on behalf of the schools that use it.",
};

export default function DpaPage() {
  return <LegalPage slug="dpa" />;
}
