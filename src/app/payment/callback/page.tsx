"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { schoolApi } from "@/lib/api";

import { Suspense } from "react";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  
  useEffect(() => {
    const ref = searchParams.get("reference") || searchParams.get("transaction_id") || searchParams.get("status");
    const errorMsg = searchParams.get("error");
    
    if (errorMsg || ref === "failed" || ref === "cancelled") {
      setStatus("error");
      return;
    }
    
    if (!ref) {
      setStatus("error");
      return;
    }

    // Wait for backend webhook to process, then refresh school data
    const verifyAndRefresh = async () => {
      // Give the backend webhook a moment to process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      try {
        // Refresh the user's school data to get the updated subscription plan
        const userStr = localStorage.getItem("leoned_user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.schoolId) {
            const school = await schoolApi.getById(user.schoolId);
            if (school && (school as any).subscriptionPlan) {
              // Update localStorage with the new plan
              const updatedUser = { ...user, subscriptionPlan: (school as any).subscriptionPlan };
              localStorage.setItem("leoned_user", JSON.stringify(updatedUser));
            }
          }
        }
      } catch (err) {
        console.warn("Could not refresh subscription data:", err);
      }
      
      setStatus("success");
    };

    verifyAndRefresh();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 text-center space-y-6">
        {status === "verifying" && (
          <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-16 w-16 text-[#053d26] animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900">Verifying Payment</h1>
            <p className="text-gray-500">Please wait while we confirm your subscription transaction with the payment provider.</p>
          </div>
        )}
        
        {status === "success" && (
          <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center justify-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
            <p className="text-gray-500">Your subscription has been activated successfully. The dashboard is now fully unlocked.</p>
            <Link href="/dashboard" className="mt-4 px-6 py-3 bg-[#053d26] text-white rounded-full font-bold hover:bg-[#042c1b] transition-colors w-full">
              Proceed to Dashboard
            </Link>
          </div>
        )}
        
        {status === "error" && (
          <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center justify-center space-y-4">
            <XCircle className="h-16 w-16 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">Payment Failed</h1>
            <p className="text-gray-500">We could not verify your payment. It may have been cancelled or failed processing.</p>
            <Link href="/dashboard/settings?section=billing" className="mt-4 px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-bold hover:bg-gray-200 transition-colors w-full">
              Return to Billing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="h-8 w-8 animate-spin text-[#053d26]" /></div>}>
      <PaymentCallbackContent />
    </Suspense>
  );
}
