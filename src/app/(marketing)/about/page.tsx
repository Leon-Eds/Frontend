import type { Metadata } from "next";
import { AboutContent } from "@/components/marketing/pages/AboutContent";

export const metadata: Metadata = {
  title: "About LeonEd | School Management System",
  description: "LeonEd is a smart School Management System that helps schools organize their operations, manage important records and connect administrators, teachers, bursars and parents through one platform.",
};

export default function AboutPage() {
  return <AboutContent />;
}
