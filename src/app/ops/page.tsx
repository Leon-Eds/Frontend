"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OpsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/ops/deployment");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-gray-500 font-semibold text-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b05e1c]" />
        <span>Loading Admin Console...</span>
      </div>
    </div>
  );
}
