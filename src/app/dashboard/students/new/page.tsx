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
        const userRole = user.role?.toLowerCase();
        if (userRole === "teacher" || userRole === "faculty") {
          router.push("/dashboard/faculty");
        } else if (userRole === "student" || userRole === "parent" || userRole === "guardian") {
          router.push("/dashboard/student-portal");
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [router]);

  return <StudentEnrollmentWizard />;
}
