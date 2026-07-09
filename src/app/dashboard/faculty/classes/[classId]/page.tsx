"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, CheckSquare, UserCheck, FileSpreadsheet, ChevronLeft, ArrowRight, ShieldCheck, Loader2, AlertCircle, Clock } from "lucide-react";
import { classApi, dashboardApi } from "@/lib/api";

export default function ClassHub({ params }: { params: Promise<{ classId: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const classId = resolvedParams.classId;
  const subjectId = searchParams.get("subjectId");
  
  const [classDetails, setClassDetails] = useState<any>(null);
  const [isFormTeacher, setIsFormTeacher] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClassHubData = async () => {
      if (!classId) return;
      
      try {
        setIsLoading(true);
        // Fetch class details
        const clsRes = await classApi.getById(classId).catch(() => null);
        const cls = (clsRes as any)?.data || clsRes;
        if (cls) setClassDetails(cls);

        // Determine if they are the form teacher
        const userStr = localStorage.getItem("leoned_user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const userId = user.id || user._id || user.teacher?.id || user.teacher?._id;
          if (cls && (cls.formTeacherId === userId)) {
            setIsFormTeacher(true);
          } else {
            // Check dashboard stats just in case
            const stats = await dashboardApi.getTeacherDashboard().catch(() => null);
            const myFormClass = (stats as any)?.formClass || null;
            const fcId = myFormClass?.classId || myFormClass?.id || myFormClass?._id;
            if (fcId === classId) {
              setIsFormTeacher(true);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load class hub data", err);
        setError("Could not load class details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassHubData();
  }, [classId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#053d26] mb-4" />
        <p className="text-gray-500 font-medium">Loading class hub...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-orange-100 text-[#b05e1c] flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Error</h2>
        <p className="text-sm text-gray-500">{error}</p>
        <button onClick={() => router.back()} className="px-6 py-2.5 bg-[#053d26] text-white rounded-full font-bold text-sm hover:bg-[#042c1b]">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.push("/dashboard/faculty/classes")}
          className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-[#053d26]/10 text-[#053d26] px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
              Class Hub
            </span>
            {isFormTeacher && (
              <span className="bg-green-100 text-green-700 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Form Class
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            {classDetails?.name || classDetails?.className || "Class"} {classDetails?.arm ? `(${classDetails.arm})` : ''}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* Score Entry Card */}
        <Link href={`/dashboard/faculty/result-entry?classId=${classId}${subjectId ? `&subjectId=${subjectId}` : ''}`} className="group relative rounded-[2rem] border p-7 shadow-sm bg-white flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-[#053d26]/30">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-orange-50 text-[#b05e1c] flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#053d26] transition-colors">Score Entry</h3>
              <p className="text-sm text-gray-500 mt-2">Enter CA and Exam scores for your assigned subjects.</p>
            </div>
          </div>
          <div className="mt-6 flex items-center text-sm font-bold text-[#b05e1c] group-hover:text-[#053d26]">
            Open Ledger <ArrowRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Attendance Card */}
        <Link href={`/dashboard/faculty/attendance?classId=${classId}`} className="group relative rounded-[2rem] border p-7 shadow-sm bg-white flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-[#053d26]/30">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#053d26] transition-colors">Attendance</h3>
              <p className="text-sm text-gray-500 mt-2">Take daily attendance for this class.</p>
            </div>
          </div>
          <div className="mt-6 flex items-center text-sm font-bold text-teal-600 group-hover:text-[#053d26]">
            Mark Register <ArrowRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Attendance History Card */}
        <Link href={`/dashboard/faculty/attendance/history?classId=${classId}`} className="group relative rounded-[2rem] border p-7 shadow-sm bg-white flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-[#053d26]/30">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#053d26] transition-colors">Attendance History</h3>
              <p className="text-sm text-gray-500 mt-2">View past attendance records for this class.</p>
            </div>
          </div>
          <div className="mt-6 flex items-center text-sm font-bold text-blue-600 group-hover:text-[#053d26]">
            View History <ArrowRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Form Class Results Card */}
        {isFormTeacher && (
          <Link href={`/dashboard/faculty/form-class-results`} className="group relative rounded-[2rem] border p-7 shadow-sm bg-white flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-[#053d26]/30">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-[#053d26]/10 text-[#053d26] flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#053d26] transition-colors">Process Results</h3>
                <p className="text-sm text-gray-500 mt-2">Compile and publish end-of-term broadsheets and report cards.</p>
              </div>
            </div>
            <div className="mt-6 flex items-center text-sm font-bold text-[#053d26]">
              View Broadsheet <ArrowRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
