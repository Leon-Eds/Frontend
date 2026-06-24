"use client";

import { useState, useEffect } from "react";
import { BookOpen, Users, Clock, ArrowRight, CheckCircle2, AlertCircle, ChevronRight, Search, Plus, Award, UserCheck, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { teacherApi, classApi, dashboardApi, teacherPortalApi, attendanceApi } from "@/lib/api";

interface ClassCardData {
  id: string;
  name: string;
  subject: string;
  subjectId: string;
  studentsCount: number;
  color: string;
  badgeColor: string;
  textColor: string;
}

export default function MyClasses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [classes, setClasses] = useState<ClassCardData[]>([]);
  const [formClass, setFormClass] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeacherClasses = async () => {
      setIsLoading(true);
      setError("");
      try {
        const userStr = localStorage.getItem("leoned_user");
        if (!userStr) {
          setError("No authenticated session found.");
          setIsLoading(false);
          return;
        }
        const user = JSON.parse(userStr);
        
        let assignments: any[] = [];
        let myFormClass: any = null;
        
        try {
          const stats = await dashboardApi.getTeacherDashboard();
          assignments = (stats as any).assignments || [];
          myFormClass = (stats as any).formClass || null;
        } catch (e) {
          console.error("Failed to load teacher stats", e);
        }
        
        let allClasses: any[] = [];
        try {
          const classesRes = await teacherPortalApi.getClasses();
          allClasses = Array.isArray(classesRes) ? classesRes : ((classesRes as any)?.data || (classesRes as any)?.items || []);
          // Fallback form class detection
          const userId = user.id || user._id || user.teacher?.id || user.teacher?._id;
          
          if (!myFormClass && userId) {
            try {
              const formClassesRes = await attendanceApi.getMyFormClasses();
              const unwrapped = Array.isArray(formClassesRes) ? formClassesRes : ((formClassesRes as any).data || (formClassesRes as any).items || (formClassesRes as any).classes || (formClassesRes as any).formClasses || []);
              const myFormClasses = Array.isArray(unwrapped) ? unwrapped : [];
              if (myFormClasses.length > 0) {
                const fc = myFormClasses[0];
                myFormClass = { ...fc, classId: fc.id || fc.classId || fc._id, className: fc.name || fc.className || "Class" };
              }
            } catch (e) {
              console.error("Failed to fetch my form classes", e);
            }
            
            // Absolute fallback if the backend API returns empty due to User/Teacher ID linkage bug
            // Fallback: Probe the attendance endpoint. The backend restricts GET /attendance/class/{classId} to the form teacher!
            if (!myFormClass && userId) {
              const today = new Date().toISOString().split('T')[0];
              for (const cls of allClasses) {
                const cId = cls.classId || cls.id || cls._id;
                if (!cId) continue;
                try {
                  await attendanceApi.getClassAttendance(cId, today);
                  myFormClass = { ...cls, classId: cId, className: cls.className || cls.name };
                  break;
                } catch (e: any) {
                  const errorMsg = e instanceof Error ? e.message : String(e);
                  if (!errorMsg.includes('403')) {
                    myFormClass = { ...cls, classId: cId, className: cls.className || cls.name };
                    break;
                  }
                }
              }
            }
          }
        } catch (e) {
          console.error("Failed to load classes", e);
        }
        
        setFormClass(myFormClass);
        
        // Map assignments to class details
        const teacherClasses = assignments.map((asm, idx) => {
          const clsDetails = allClasses.find(c => (c.classId || c.id) === asm.classId || c._id === asm.classId);
          
          // Rotate colors for nice look
          const colors = [
            {
              color: "border-green-100 bg-white hover:border-[#053d26]/30 hover:shadow-green-900/5",
              badgeColor: "bg-[#053d26]/10 text-[#053d26]",
              textColor: "text-[#053d26]"
            },
            {
              color: "border-orange-100 bg-white hover:border-[#b05e1c]/30 hover:shadow-orange-900/5",
              badgeColor: "bg-[#b05e1c]/10 text-[#b05e1c]",
              textColor: "text-[#b05e1c]"
            },
            {
              color: "border-teal-100 bg-white hover:border-teal-600/30 hover:shadow-teal-900/5",
              badgeColor: "bg-teal-50 text-teal-700",
              textColor: "text-teal-700"
            }
          ];
          const style = colors[idx % colors.length];

          return {
            id: asm.classId,
            name: asm.className || clsDetails?.className || clsDetails?.name || "Class",
            subject: asm.subjectName || "Subject",
            subjectId: asm.subjectId,
            studentsCount: asm.studentCount || clsDetails?.studentCount || 0,
            ...style
          };
        });
        
        setClasses(teacherClasses);
      } catch (err) {
        console.error("Failed to load teacher classes", err);
        setError("Could not load your classes. Please make sure assignments are set up by the Administrator.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeacherClasses();
  }, []);

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#053d26] mb-4" />
        <p className="text-gray-500 font-medium">Retrieving class rosters and schedules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-orange-100 text-[#b05e1c] flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Academic Overview Error</h2>
        <p className="text-sm text-gray-500">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-[#053d26] text-white rounded-full font-bold text-sm hover:bg-[#042c1b]">
          Retry Sync
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#053d26]/10 text-[#053d26] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Teacher Portal
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">My Classes</h1>
          <p className="text-gray-500 max-w-2xl leading-relaxed text-sm">
            Manage your homeroom class and active teaching assignments. Track student metrics and access grading ledgers.
          </p>
        </div>
      </div>

      {/* Form Class Section */}
      {formClass && (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#053d26] to-[#032517] p-8 sm:p-10 text-white shadow-xl shadow-[#053d26]/20 border border-[#042c1b]">
          <div className="absolute right-0 top-0 opacity-10 translate-x-12 -translate-y-12 pointer-events-none">
            <ShieldCheck className="w-64 h-64" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl">
                  <Award className="h-6 w-6 text-green-300" />
                </div>
                <span className="text-green-300 font-bold uppercase tracking-widest text-xs">Form Teacher Assignment</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black leading-none">
                {formClass.name} {formClass.arm ? `(${formClass.arm})` : ''}
              </h2>
              <p className="text-green-100 text-sm leading-relaxed max-w-lg">
                As the primary pastoral and administrative lead for this class, you are responsible for daily attendance, behavior monitoring, and general student welfare.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
              <Link 
                href="/dashboard/faculty/attendance" 
                className="group relative flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#053d26] rounded-2xl font-bold hover:bg-green-50 transition-all shadow-lg hover:shadow-white/20 hover:-translate-y-0.5"
              >
                <UserCheck className="h-5 w-5" />
                <span>Mark Attendance</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Subject Assignments Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-12 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-[#b05e1c]" />
          Subject Assignments
        </h2>
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-2xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-transparent transition-colors shadow-sm"
            placeholder="Search assigned subjects..."
          />
        </div>
      </div>

      {/* Subject Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.length === 0 ? (
          <div className="col-span-full bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm space-y-4">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400 border border-gray-100">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No subject assignments</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              You haven't been assigned any specific subjects to teach yet. Contact your administrator to update your teaching schedule.
            </p>
          </div>
        ) : (
          filteredClasses.map((cls) => (
            <div 
              key={cls.id + cls.subject} 
              className={`group rounded-[2rem] border p-7 shadow-sm bg-white flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${cls.color}`}
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${cls.badgeColor}`}>
                    {cls.name}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-xl border border-gray-100 text-xs font-bold text-gray-600">
                    <Users className="h-3.5 w-3.5" />
                    <span>{cls.studentsCount}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-[#053d26] transition-colors">{cls.subject}</h3>
                  <p className="text-sm font-medium text-gray-500">Subject Class</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50">
                <Link 
                  href={`/dashboard/faculty/result-entry?classId=${cls.id}&subjectId=${cls.subjectId}`}
                  className="flex items-center justify-between w-full py-3.5 px-5 rounded-2xl bg-gray-50 group-hover:bg-[#053d26] border border-gray-100 group-hover:border-[#053d26] text-gray-700 group-hover:text-white font-bold text-sm transition-all duration-300 shadow-sm group-hover:shadow-md"
                >
                  <span>Open Ledger</span>
                  <ChevronRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
