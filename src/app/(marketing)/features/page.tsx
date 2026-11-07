import type { Metadata } from "next";
import { FeaturesContent } from "@/components/marketing/pages/FeaturesContent";

export const metadata: Metadata = {
  title: "Features | LeonEd School Management System",
  description: "Digital student records, automated results, secure portals, multi-school management, fees, attendance, scheme of work and more.",
};

export default function FeaturesPage() {
  return <FeaturesContent />;
}
