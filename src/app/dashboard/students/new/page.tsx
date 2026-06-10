"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { StudentEnrollmentWizard } from '@/components/enrollment/StudentEnrollmentWizard';

export default function NewStudentPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("leoned_user");
      if (stored) {
        const user = JSON.parse(stored);
        if (user.role === "Teacher" || user.role === "Faculty") {
          router.push("/dashboard/faculty");
        } else if (user.role === "Student" || user.role === "Parent" || user.role === "Guardian") {
          router.push("/dashboard/student-portal");
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [router]);

  return <StudentEnrollmentWizard />;
}
