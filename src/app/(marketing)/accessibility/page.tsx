import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal/LegalContent";

export const metadata: Metadata = {
  title: "Accessibility Statement | LeonEd",
  description: "Our commitment to making LeonEd usable by everyone in the school community.",
};

export default function AccessibilityPage() {
  return <LegalPage slug="accessibility" />;
}
