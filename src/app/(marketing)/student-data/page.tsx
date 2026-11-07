import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal/LegalContent";

export const metadata: Metadata = {
  title: "Student Data Policy | LeonEd",
  description: "Our commitments on student and children's data, written for parents, guardians and schools.",
};

export default function StudentDataPage() {
  return <LegalPage slug="student-data" />;
}
