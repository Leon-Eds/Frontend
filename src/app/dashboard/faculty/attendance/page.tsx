"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { CheckCircle2, XCircle, AlertCircle, Save, Loader2, QrCode, ChevronLeft } from "lucide-react";
import { teacherPortalApi, dashboardApi, attendanceApi } from "@/lib/api";
import toast from "react-hot-toast";
import QRScanner from "@/components/dashboard/QRScanner";
import { useSearchParams, useRouter } from "next/navigation";

function FacultyAttendanceInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialClassId = searchParams.get("classId") || "";
  const initialDate = searchParams.get("date") || (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({});
  const [date, setDate] = useState<string>(initialDate);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formClasses, setFormClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId);
  const [isScanning, setIsScanning] = useState(false);

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
          // Use the dedicated form-classes endpoint (only returns classes where teacher is form teacher)
          try {
            const formClassResult = await attendanceApi.getMyFormClasses();
            const unwrapped = Array.isArray(formClassResult) 
              ? formClassResult 
              : (formClassResult as any)?.data || (formClassResult as any)?.items || [];
            const rawClasses = Array.isArray(unwrapped) ? unwrapped : [];
            myFormClasses = rawClasses.map(fc => {
               if (typeof fc === 'string') {
                 return { id: fc, classId: fc, name: "Class", className: "Class" };
               }
               return fc;
            });
          } catch (_) {
            // Fallback: fetch all classes and filter by formTeacherId
            try {
              const allClasses = await teacherPortalApi.getClasses();
              const classList = Array.isArray(allClasses) 
                ? allClasses 
                : (allClasses as any)?.data || (allClasses as any)?.items || [];
              myFormClasses = classList.filter((c: any) => 
                c.formTeacherId === userId || c.formTeacher?.id === userId
              );
            } catch (e2) {
              console.error("Fallback class fetch failed:", e2);
            }
          }
        }
        
        setFormClasses(myFormClasses);
        if (initialClassId && myFormClasses.some((c: any) => (c.classId || c.id || c._id) === initialClassId)) {
          setSelectedClassId(initialClassId);
        } else if (myFormClasses.length > 0) {
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
        // First, fetch the baseline roster of students for this class
        const classStudentsRes = await teacherPortalApi.getClassStudents(selectedClassId).catch(() => []);
        console.log("[ATTENDANCE DEBUG] Raw getClassStudents response:", JSON.stringify(classStudentsRes, null, 2));
        const baselineStudents = Array.isArray(classStudentsRes) 
          ? classStudentsRes 
          : (classStudentsRes as any)?.data || (classStudentsRes as any)?.items || (classStudentsRes as any)?.students || [];
        console.log("[ATTENDANCE DEBUG] Parsed baselineStudents:", JSON.stringify(baselineStudents, null, 2));

        // Second, fetch today's attendance sheet
        const existingData = await attendanceApi.getClassAttendance(selectedClassId, date).catch(() => []);
        console.log("[ATTENDANCE DEBUG] Raw getClassAttendance response:", JSON.stringify(existingData, null, 2));
        const existingRecords = (existingData as any)?.records || (existingData as any)?.items || (existingData as any)?.data || (Array.isArray(existingData) ? existingData : []);
        const returnedDate = (existingData as any)?.date;
        
        let loadedStudents: any[] = [];
        let savedAttendance: Record<string, string> = {};

        const isWrongDate = returnedDate && returnedDate !== date && !returnedDate.startsWith(date);
        
        if (Array.isArray(existingRecords) && !isWrongDate) {
          existingRecords.forEach(r => {
            const sId = r.studentId || r.student?.id || r.student?._id || r.id || r._id;
            if (sId && r.status) {
              if (r.date && r.date !== date && !r.date.startsWith(date)) return;
              savedAttendance[sId] = r.status;
            }
          });
        }
        
        if (Array.isArray(baselineStudents) && baselineStudents.length > 0) {
          loadedStudents = baselineStudents.map(s => {
            const resolvedId = s.student?.id || s.student?._id || s.studentId || s.id || s._id;
            console.log("[ATTENDANCE DEBUG] Student mapping:", { rawKeys: Object.keys(s), resolvedId, fullName: s.fullName || s.name || s.student?.fullName });
            return {
              ...s,
              studentId: resolvedId
            };
          });
        } else if (Array.isArray(existingRecords)) {
          loadedStudents = existingRecords.map((r: any) => {
            const studentObj = r.student || r;
            return {
              ...studentObj,
              studentId: r.studentId || studentObj.id || studentObj._id
            };
          });
        }
        
        console.log("[ATTENDANCE DEBUG] Final loadedStudents:", loadedStudents.map(s => ({ studentId: s.studentId, name: s.fullName || s.name })));
        setStudents(loadedStudents);

        const defaultAtt: Record<string, 'Present' | 'Absent' | 'Late'> = {};
        loadedStudents.forEach((s: any) => {
          const resolvedId = s.studentId;
          defaultAtt[resolvedId] = (savedAttendance[resolvedId] as any) || 'Present';
        });
        console.log("[ATTENDANCE DEBUG] Default attendance map:", defaultAtt);
        setAttendance(defaultAtt);
      } catch (err) {
        console.error("Failed to fetch attendance sheet", err);
        toast.error("Failed to fetch attendance sheet");
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
        return {
          studentId: id,
          status
        };
      });
      console.log("[ATTENDANCE SAVE] Saving attendance with payload:", JSON.stringify({ selectedClassId, date, records }, null, 2));
      const saveResult = await attendanceApi.recordDailyAttendance(selectedClassId, date, records);
      console.log("[ATTENDANCE SAVE] Save result from backend:", JSON.stringify(saveResult, null, 2));
      toast.success("Attendance saved successfully!");
    } catch (err) {
      console.error("[ATTENDANCE SAVE] Failed to save attendance:", err);
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

  if (!loading && formClasses.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center space-y-4 animate-in fade-in duration-500">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Form Teacher Access Only</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Attendance marking is restricted to form teachers. You are not currently assigned as a form teacher for any class. 
          If you believe this is an error, please contact administration.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors shrink-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#053d26]">Daily Attendance</h1>
            <p className="text-gray-600 text-sm mt-1">Mark students present, absent, or late for your form classes.</p>
          </div>
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
            onClick={() => setIsScanning(!isScanning)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-colors shadow-sm ${
              isScanning ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            <QrCode className="h-4 w-4" />
            {isScanning ? "Close Scanner" : "Scan ID"}
          </button>
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

      {isScanning && (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm animate-in zoom-in duration-300">
          <h3 className="text-lg font-bold text-center mb-4">Scan Student ID Card</h3>
          <QRScanner 
            onScanSuccess={(decodedText) => {
              // Extract student ID from QR text
              let studentId = decodedText;
              try {
                // Handle JSON format if encoded
                const data = JSON.parse(decodedText);
                studentId = data.admissionNumber || data.id || data.studentId || decodedText;
              } catch(e) {}
              
              // Verify student is in this class (we can check by id or admissionNumber)
              const student = students.find(s => 
                (s.student?.id || s.id || s._id || s.studentId) === studentId || (s.student?.admissionNumber || s.admissionNumber) === studentId
              );
              
              if (student) {
                const sId = student.student?.id || student.id || student._id || student.studentId;
                handleMark(sId, 'Present');
                
                // Fire the new backend API endpoint for immediate QR scanning
                attendanceApi.scanIdCard(student.admissionNumber || sId, date, 'Present', 'Scanned via QR Code')
                  .then(() => toast.success(`${student.fullName || student.name} marked present!`))
                  .catch((err) => {
                     console.error("QR Scan Sync Error:", err);
                     // Note: We still marked them present locally, so they can hit "Save Register" later as a fallback
                     toast.success(`${student.fullName || student.name} marked present locally. (Sync failed)`);
                  });
              } else {
                toast.error(`Student ${studentId} not found in this class.`);
              }
            }}
          />
        </div>
      )}

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
                const sId = student.studentId;
                return (
                <tr key={sId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-gray-900 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#053d26] flex items-center justify-center text-white text-[10px] font-black shrink-0 relative overflow-hidden">
                        {student.profilePictureUrl ? (
                          <img src={student.profilePictureUrl} alt={student.fullName || student.name || "Student"} className="w-full h-full object-cover" />
                        ) : (
                          (student.fullName || student.name || "?")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        )}
                      </div>
                      <div>
                        {student.fullName || student.name}
                        <div className="text-xs text-gray-400 font-medium">{student.admissionNumber || "N/A"}</div>
                      </div>
                    </div>
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

export default function FacultyAttendance() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh] text-gray-400 font-semibold text-sm">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading...
      </div>
    }>
      <FacultyAttendanceInner />
    </Suspense>
  );
}
