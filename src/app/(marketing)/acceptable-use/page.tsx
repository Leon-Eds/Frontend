import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal/LegalContent";

export const metadata: Metadata = {
  title: "Acceptable Use Policy | LeonEd",
  description: "The rules every administrator, teacher, parent and student agrees to when using LeonEd.",
};

export default function AcceptableUsePage() {
  return <LegalPage slug="acceptable-use" />;
}
