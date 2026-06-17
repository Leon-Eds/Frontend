"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, AlertCircle, Save, Loader2 } from 'lucide-react';
import { studentApi, classApi, attendanceApi } from '@/lib/api';

export default function FacultyAttendance() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({});

  const [formClass, setFormClass] = useState<any>(null);

  useEffect(() => {
    const fetchClassStudents = async () => {
      setLoading(true);
      try {
        const userStr = localStorage.getItem("leoned_user");
        if (!userStr) return;
        const user = JSON.parse(userStr);

        // Find the class where this user is the form teacher
        let myFormClass: any = null;
        try {
          const stats = await dashboardApi.getTeacherDashboard();
          myFormClass = (stats as any).formClass || null;
        } catch (e) {
          console.error("Failed to fetch teacher dashboard for attendance", e);
        }
        
        setFormClass(myFormClass);

        let classStudents: any[] = [];
        if (myFormClass) {
          try {
            const allStudents = await studentApi.getAll();
            classStudents = (Array.isArray(allStudents) ? allStudents : []).filter((s: any) => s.classId === myFormClass.id || s?.class?._id === myFormClass.id);
          } catch (e) {
            console.warn("getAll students failed, trying search fallback...");
            try {
              const searchedStudents = await studentApi.search("");
              classStudents = (Array.isArray(searchedStudents) ? searchedStudents : []).filter((s: any) => s.classId === myFormClass.id || s?.class?._id === myFormClass.id);
            } catch (err) {
               console.error("Search fallback also failed", err);
            }
          }
        } else {
          classStudents = [];
        }
        setStudents(classStudents);
        
        // Load existing attendance
        let savedAttendance: Record<string, string> = {};
        if (myFormClass) {
          try {
             const existingData = await attendanceApi.getClassAttendance(myFormClass.id, date).catch(() => null);
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
        }

        const defaultAtt: Record<string, 'Present' | 'Absent' | 'Late'> = {};
        classStudents.forEach((s: any) => {
          defaultAtt[s.id] = (savedAttendance[s.id] as any) || 'Present';
        });
        setAttendance(defaultAtt);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClassStudents();
  }, [date]);

  const handleMark = (id: string, status: 'Present' | 'Absent' | 'Late') => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const handleSave = async () => {
    if (!formClass) {
      toast.error("You are not assigned as a form teacher for any class.");
      return;
    }
    setIsSaving(true);
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status
      }));
      await attendanceApi.recordDailyAttendance(formClass.id, date, records);
      toast.success("Attendance saved successfully!");
    } catch (err) {
      toast.error("Failed to save attendance.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
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
          <p className="text-gray-600 text-sm mt-1">Mark students present, absent, or late for your form class.</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-[#053d26] focus:ring-1 focus:ring-[#053d26]"
          />
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors shadow-sm disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Register
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-400">
              <th className="py-4 px-6">Student Name</th>
              <th className="py-4 px-6 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 font-bold text-gray-900 text-sm">
                  {student.fullName || student.name}
                  <div className="text-xs text-gray-400 font-medium">{student.admissionNumber || "N/A"}</div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => handleMark(student.id, 'Present')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        attendance[student.id] === 'Present' 
                          ? 'bg-green-100 text-green-700 ring-2 ring-green-500/20' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Present
                    </button>
                    <button 
                      onClick={() => handleMark(student.id, 'Absent')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        attendance[student.id] === 'Absent' 
                          ? 'bg-red-100 text-red-700 ring-2 ring-red-500/20' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      <XCircle className="h-3.5 w-3.5" /> Absent
                    </button>
                    <button 
                      onClick={() => handleMark(student.id, 'Late')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        attendance[student.id] === 'Late' 
                          ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-500/20' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      <AlertCircle className="h-3.5 w-3.5" /> Late
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={2} className="py-12 text-center text-sm text-gray-500">
                  No students found in your assigned form class.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
