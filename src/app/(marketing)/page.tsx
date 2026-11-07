import type { Metadata } from "next";
import { HomeContent } from "@/components/marketing/home/HomeContent";

export const metadata: Metadata = {
  title: "LeonEd | School Management System",
  description:
    "The complete digital academic management platform for African schools. Manage student records, result processing, and secure portal access.",
};

export default function HomePage() {
  return <HomeContent />;
}
