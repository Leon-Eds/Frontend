import type { Metadata } from "next";
import { AboutContent } from "@/components/marketing/pages/AboutContent";

export const metadata: Metadata = {
  title: "About LeonEd | School Management System",
  description: "LeonEd is digitizing African classrooms, one school at a time, with one secure system for owners, administrators, teachers, students and parents.",
};

export default function AboutPage() {
  return <AboutContent />;
}
