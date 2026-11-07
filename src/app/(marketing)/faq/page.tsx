import type { Metadata } from "next";
import { FaqContent } from "@/components/marketing/pages/HelpContent";

export const metadata: Metadata = {
  title: "FAQ | LeonEd",
  description: "Answers to common questions from schools, parents and students about LeonEd.",
};

export default function FaqPage() {
  return <FaqContent />;
}
