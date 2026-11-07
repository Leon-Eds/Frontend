import type { Metadata } from "next";
import { SupportContent } from "@/components/marketing/pages/HelpContent";

export const metadata: Metadata = {
  title: "Help Center | LeonEd",
  description: "24/7 technical assistance for the LeonEd community: email support, live concierge and system status.",
};

export default function SupportPage() {
  return <SupportContent />;
}
