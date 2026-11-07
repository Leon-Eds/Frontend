import type { Metadata } from "next";
import { ContactContent } from "@/components/marketing/pages/ContactContent";

export const metadata: Metadata = {
  title: "Contact Sales | LeonEd",
  description: "See how LeonEd can transform your school's academic management. Our team will walk you through the platform.",
};

export default function ContactPage() {
  return <ContactContent />;
}
