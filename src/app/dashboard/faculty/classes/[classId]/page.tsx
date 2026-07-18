"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, CheckSquare, UserCheck, FileSpreadsheet, ChevronLeft, ArrowRight, ShieldCheck, Loader2, AlertCircle, Clock } from "lucide-react";
import { teacherPortalApi, dashboardApi, attendanceApi } from "@/lib/api";

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
  const [debugInfo, setDebugInfo] = useState<any[]>([]);

  useEffect(() => {
    const fetchClassHubData = async () => {
      if (!classId) return;
      
      try {
        setIsLoading(true);
        
        // Get teacher dashboard (it contains assignments with class info)
        const stats = await dashboardApi.getTeacherDashboard().catch(() => null);
        const dashData = (stats as any)?.data || stats;
        
        // Find class details from assignments
        const assignments = dashData?.assignments || [];
        const matchingAssignment = assignments.find((a: any) => a.classId === classId);
        
        if (matchingAssignment) {
          setClassDetails({
            id: matchingAssignment.classId,
            name: matchingAssignment.className,
            ...matchingAssignment,
          });
        }
        
        // Determine if they are the form teacher
        const userStr = localStorage.getItem("leoned_user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const userId = user.id || user._id || user.teacher?.id || user.teacher?._id;
          
          let myFormClasses: any[] = [];
          if (dashData?.formClasses) {
            myFormClasses = Array.isArray(dashData.formClasses) ? dashData.formClasses : [dashData.formClasses];
          } else if (dashData?.formClass) {
            myFormClasses = Array.isArray(dashData.formClass) ? dashData.formClass : [dashData.formClass];
          }
          
          if (user?.teacher?.formClass) {
             const userFc = Array.isArray(user.teacher.formClass) ? user.teacher.formClass : [user.teacher.formClass];
             userFc.forEach((fc: any) => {
               if (!myFormClasses.find((m: any) => (m.classId || m.id || m._id) === (fc.classId || fc.id || fc._id || fc))) {
                 myFormClasses.push(fc);
               }
             });
          }

          let fetchedFormClasses: any[] = [];
          try {
            const formClassesRes = await attendanceApi.getMyFormClasses();
            const unwrapped = Array.isArray(formClassesRes) ? formClassesRes : ((formClassesRes as any).data || (formClassesRes as any).items || (formClassesRes as any).classes || (formClassesRes as any).formClasses || []);
            fetchedFormClasses = Array.isArray(unwrapped) ? unwrapped : [];
            fetchedFormClasses.forEach(fc => {
               const fcIdStr = typeof fc === 'string' ? fc : String(fc.id || fc.classId || fc._id);
               if (!myFormClasses.some(mfc => {
                 const mfcId = typeof mfc === 'string' ? mfc : String(mfc.id || mfc.classId || mfc._id);
                 return mfcId === fcIdStr;
               })) {
                 myFormClasses.push(fc);
               }
            });
            
            // Also fetch all classes and check formTeacherId directly!
            const allClassesRes = await teacherPortalApi.getClasses();
            const classList = Array.isArray(allClassesRes) ? allClassesRes : ((allClassesRes as any)?.data || (allClassesRes as any)?.items || []);
            const myPortalClasses = classList.filter((c: any) => c.formTeacherId === userId || c.formTeacher?.id === userId || c.formTeacher?._id === userId);
            
            myPortalClasses.forEach((fc: any) => {
               const fcIdStr = typeof fc === 'string' ? fc : String(fc.id || fc.classId || fc._id);
               if (!myFormClasses.some(mfc => {
                 const mfcId = typeof mfc === 'string' ? mfc : String(mfc.id || mfc.classId || mfc._id);
                 return mfcId === fcIdStr;
               })) {
                 myFormClasses.push(fc);
               }
            });
            
          } catch (e) {}
          
          let isFormTeacherForThisClass = myFormClasses.some((fc: any) => {
            const fcIdStr = typeof fc === 'string' ? fc : String(fc.classId || fc.id || fc._id);
            return fcIdStr === String(classId);
          });
          
          // Absolute fallback using localStorage mirroring the Class List page logic exactly
          if (!isFormTeacherForThisClass && user?.teacher?.formClass) {
            const userFcs = Array.isArray(user.teacher.formClass) ? user.teacher.formClass : [user.teacher.formClass];
            if (userFcs.some((fc: any) => {
              const fcIdStr = typeof fc === 'string' ? fc : String(fc.classId || fc.id || fc._id);
              return fcIdStr === String(classId);
            })) {
              isFormTeacherForThisClass = true;
            }
          }
          
          if (!isFormTeacherForThisClass && dashData?.formClass) {
             const dFcs = Array.isArray(dashData.formClass) ? dashData.formClass : [dashData.formClass];
             if (dFcs.some((fc: any) => {
                const fcIdStr = typeof fc === 'string' ? fc : String(fc.classId || fc.id || fc._id);
                return fcIdStr === String(classId);
             })) {
                isFormTeacherForThisClass = true;
             }
          }
          
          if (isFormTeacherForThisClass) {
            setIsFormTeacher(true);
          }
        }
      } catch (err) {
        console.error("Failed to load class hub data", err);
        setError("Failed to load class information");
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

        {/* Form Teacher Exclusive Features */}
        {isFormTeacher && (
          <>
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
            <Link href={`/dashboard/faculty/form-class-results?classId=${classId}`} className="group relative rounded-[2rem] border p-7 shadow-sm bg-white flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-[#053d26]/30">
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
          </>
        )}
      </div>
    </div>
  );
}
