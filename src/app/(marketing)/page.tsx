import type { Metadata } from "next";
import { HomeContent } from "@/components/marketing/home/HomeContent";

export const metadata: Metadata = {
  title: "LeonEd — School Management, Simplified",
  description:
    "LeonEd is a School Management System designed to simplify school administration by bringing essential school operations into one connected platform.",
};

export default function HomePage() {
  return <HomeContent />;
}
