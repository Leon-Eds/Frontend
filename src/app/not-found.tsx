import type { Metadata } from "next";
import { MarketingFrame } from "@/components/marketing/MarketingFrame";
import { NotFoundContent } from "@/components/marketing/pages/HelpContent";

export const metadata: Metadata = {
  title: "Page Not Found | LeonEd",
  description: "The page you're looking for doesn't exist or may have moved.",
};

export default function NotFound() {
  return (
    <MarketingFrame>
      <NotFoundContent />
    </MarketingFrame>
  );
}
