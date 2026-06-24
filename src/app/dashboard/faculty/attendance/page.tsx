"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, AlertCircle, Save, Loader2 } from "lucide-react";
import { teacherPortalApi, dashboardApi, attendanceApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function FacultyAttendance() {
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({});
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formClasses, setFormClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const userStr = localStorage.getItem("leoned_user");
        if (!userStr) return;
        const user = JSON.parse(userStr);

        let myFormClasses: any[] = [];
        const userId = user.id || user._id || user.teacher?.id || user.teacher?._id;
        
        if (userId) {
          const allClasses = await teacherPortalApi.getClasses();
          // The backend returns classes the teacher is assigned to.
          // Each class has {classId, className, arm, studentCount, subjects}
          if (Array.isArray(allClasses)) {
            myFormClasses = allClasses;
          } else if (allClasses && typeof allClasses === 'object') {
            const unwrapped = (allClasses as any).data || (allClasses as any).items || [];
            myFormClasses = Array.isArray(unwrapped) ? unwrapped : [];
          }
        } else {
          // Fallback: derive classes from dashboard assignments
          try {
            const stats = await dashboardApi.getTeacherDashboard() as any;
            if (stats?.assignments && Array.isArray(stats.assignments)) {
              const classMap = new Map();
              stats.assignments.forEach((a: any) => {
                if (a.classId && !classMap.has(a.classId)) {
                  classMap.set(a.classId, { classId: a.classId, className: a.className || 'Class' });
                }
              });
              myFormClasses = Array.from(classMap.values());
            }
          } catch (e) {
            console.error("Dashboard fallback failed:", e);
          }
        }
        
        setFormClasses(myFormClasses);
        if (myFormClasses.length > 0) {
          setSelectedClassId(myFormClasses[0].classId || myFormClasses[0].id || myFormClasses[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch teacher classes for attendance", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchClassData = async () => {
      if (!selectedClassId) {
        setStudents([]);
        return;
      }
      setLoading(true);
      try {
        const classStudents = await teacherPortalApi.getClassStudents(selectedClassId);
        setStudents(Array.isArray(classStudents) ? classStudents : ((classStudents as any)?.data || (classStudents as any)?.items || []));
        
        let savedAttendance: Record<string, string> = {};
        try {
          const existingData = await attendanceApi.getClassAttendance(selectedClassId, date).catch(() => null);
          const existingRecords = (existingData as any)?.records || existingData || [];
          if (Array.isArray(existingRecords)) {
            existingRecords.forEach(r => {
              if (r.studentId && r.status) {
                savedAttendance[r.studentId] = r.status;
              }
            });
          }
        } catch (e) {
          console.error("No existing attendance found", e);
        }

        const defaultAtt: Record<string, 'Present' | 'Absent' | 'Late'> = {};
        const safeClassStudents = Array.isArray(classStudents) ? classStudents : ((classStudents as any)?.data || (classStudents as any)?.items || []);
        safeClassStudents.forEach((s: any) => {
          const sId = s.studentId || s.id || s._id;
          defaultAtt[sId] = (savedAttendance[sId] as any) || 'Present';
        });
        setAttendance(defaultAtt);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClassData();
  }, [selectedClassId, date]);

  const handleMark = (id: string, status: 'Present' | 'Absent' | 'Late') => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const handleSave = async () => {
    if (!selectedClassId) {
      toast.error("You are not assigned to any class.");
      return;
    }
    setIsSaving(true);
    try {
      const records = Object.entries(attendance).map(([id, status]) => {
        // Handle cases where the id might be a student object's studentId
        return {
          studentId: id,
          status
        };
      });
      console.log("Saving attendance with payload:", { selectedClassId, date, records });
      await attendanceApi.recordDailyAttendance(selectedClassId, date, records);
      toast.success("Attendance saved successfully!");
    } catch (err) {
      console.error("Failed to save attendance:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save attendance.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && formClasses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#053d26]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#053d26]">Daily Attendance</h1>
          <p className="text-gray-600 text-sm mt-1">Mark students present, absent, or late for your form classes.</p>
        </div>
        <div className="flex items-center gap-3">
          {formClasses.length > 1 && (
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-[#053d26] focus:ring-1 focus:ring-[#053d26]"
            >
              {formClasses.map((c: any) => (
                <option key={c.classId || c.id || c._id} value={c.classId || c.id || c._id}>{c.className || c.name}</option>
              ))}
            </select>
          )}
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-[#053d26] focus:ring-1 focus:ring-[#053d26]"
          />
          <button 
            onClick={handleSave}
            disabled={isSaving || !selectedClassId}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors shadow-sm disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Register
          </button>
        </div>
      </div>

      {!selectedClassId && !loading && (
        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex items-center gap-4 text-orange-800 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
          <p className="text-sm font-medium">You have not been assigned to any class.</p>
        </div>
      )}

      {selectedClassId && (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden relative">
          {loading && (
             <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#053d26]" />
             </div>
          )}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-400">
                <th className="py-4 px-6">Student Name</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map((student) => {
                const sId = student.studentId || student.id || student._id;
                return (
                <tr key={sId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-gray-900 text-sm">
                    {student.fullName || student.name}
                    <div className="text-xs text-gray-400 font-medium">{student.admissionNumber || "N/A"}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleMark(sId, 'Present')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          attendance[sId] === 'Present' 
                            ? 'bg-green-100 text-green-700 ring-2 ring-green-500/20' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Present
                      </button>
                      <button 
                        onClick={() => handleMark(sId, 'Absent')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          attendance[sId] === 'Absent' 
                            ? 'bg-red-100 text-red-700 ring-2 ring-red-500/20' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        <XCircle className="h-3.5 w-3.5" /> Absent
                      </button>
                      <button 
                        onClick={() => handleMark(sId, 'Late')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          attendance[sId] === 'Late' 
                            ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-500/20' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        <AlertCircle className="h-3.5 w-3.5" /> Late
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
              {students.length === 0 && !loading && (
                <tr>
                  <td colSpan={2} className="py-12 text-center text-sm text-gray-500">
                    No students found in your assigned form class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
