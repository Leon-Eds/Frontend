import type { Metadata } from "next";
import { LegalHub } from "@/components/marketing/legal/LegalContent";

export const metadata: Metadata = {
  title: "Legal Center | LeonEd",
  description: "Privacy, terms, student data, data processing, cookies, acceptable use and accessibility policies for LeonEd.",
};

export default function LegalPage() {
  return <LegalHub />;
}
