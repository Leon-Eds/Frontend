"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
  Clock,
  Download,
} from "lucide-react";
import { attendanceApi, teacherPortalApi } from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

function AttendanceHistoryInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialClassId = searchParams.get("classId") || "";
  
  const [formClasses, setFormClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId);
  const [selectedClassName, setSelectedClassName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Week navigation
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const [students, setStudents] = useState<any[]>([]);
  // weekRecords: { [date]: { [studentId]: status } }
  const [weekRecords, setWeekRecords] = useState<Record<string, Record<string, string>>>({});

  // Get the 5 weekdays (Mon-Fri) for the current week
  const getWeekDays = useCallback(() => {
    const days: Date[] = [];
    for (let i = 0; i < 5; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  }, [weekStart]);

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const formatShortDay = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "short" });
  const formatDayNum = (d: Date) => d.getDate();
  const formatMonthRange = () => {
    const days = getWeekDays();
    const first = days[0];
    const last = days[4];
    const opts: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" };
    if (first.getMonth() === last.getMonth()) {
      return `${first.getDate()} – ${last.getDate()} ${first.toLocaleDateString("en-US", opts)}`;
    }
    return `${first.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${last.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  const isToday = (d: Date) => {
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const isFuture = (d: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d > today;
  };

  // Fetch form classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const userStr = localStorage.getItem("leoned_user");
        if (!userStr) return;
        const user = JSON.parse(userStr);
        const userId = user.id || user._id || user.teacher?.id || user.teacher?._id;
        const role = user.role?.toLowerCase();

        let myFormClasses: any[] = [];

        // Admins can see all classes
        if (role === "admin" || role === "superadmin" || role === "school_admin") {
          try {
            const allClasses = await teacherPortalApi.getClasses();
            const classList = Array.isArray(allClasses)
              ? allClasses
              : (allClasses as any)?.data || (allClasses as any)?.items || [];
            myFormClasses = Array.isArray(classList) ? classList : [];
          } catch (e) {
            console.error("Failed to fetch classes:", e);
          }
        } else if (userId) {
          // Teachers: get form classes
          try {
            const formClassResult = await attendanceApi.getMyFormClasses();
            const unwrapped = Array.isArray(formClassResult)
              ? formClassResult
              : (formClassResult as any)?.data || (formClassResult as any)?.items || [];
            myFormClasses = Array.isArray(unwrapped) ? unwrapped : [];
          } catch (_) {
            try {
              const allClasses = await teacherPortalApi.getClasses();
              const classList = Array.isArray(allClasses)
                ? allClasses
                : (allClasses as any)?.data || (allClasses as any)?.items || [];
              myFormClasses = classList.filter(
                (c: any) =>
                  c.formTeacherId === userId || c.formTeacher?.id === userId
              );
            } catch (e2) {
              console.error("Fallback class fetch failed:", e2);
            }
          }
        }

        setFormClasses(myFormClasses);
        if (myFormClasses.length > 0) {
          const firstId = myFormClasses[0].classId || myFormClasses[0].id || myFormClasses[0]._id;
          setSelectedClassId(firstId);
          setSelectedClassName(myFormClasses[0].name || myFormClasses[0].className || "");
        }
      } catch (err) {
        console.error("Failed to fetch classes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // Fetch students + weekly records when class or week changes
  useEffect(() => {
    const fetchWeekData = async () => {
      if (!selectedClassId) return;
      setLoadingRecords(true);

      try {
        // Fetch students for this class
        const classStudents = await teacherPortalApi.getClassStudents(selectedClassId);
        const studentList = Array.isArray(classStudents)
          ? classStudents
          : (classStudents as any)?.data || (classStudents as any)?.items || [];
        setStudents(studentList);

        // Fetch attendance for each day of the week
        const days = getWeekDays();
        const records: Record<string, Record<string, string>> = {};

        const fetchPromises = days.map(async (day) => {
          const dateStr = formatDate(day);
          try {
            const data = await attendanceApi.getClassAttendance(selectedClassId, dateStr);
            const recs = (data as any)?.records || data || [];
            const returnedDate = (data as any)?.date;
            
            const dayMap: Record<string, string> = {};
            const isWrongDate = returnedDate && returnedDate !== dateStr && !returnedDate.startsWith(dateStr);
            
            if (Array.isArray(recs) && !isWrongDate) {
              recs.forEach((r: any) => {
                if (r.studentId && r.status) {
                  if (r.date && r.date !== dateStr && !r.date.startsWith(dateStr)) return;
                  dayMap[r.studentId] = r.status;
                }
              });
            }
            records[dateStr] = dayMap;
          } catch {
            records[dateStr] = {};
          }
        });

        await Promise.all(fetchPromises);
        setWeekRecords(records);
      } catch (err) {
        console.error("Failed to fetch attendance history:", err);
        toast.error("Failed to load attendance records.");
      } finally {
        setLoadingRecords(false);
      }
    };
    fetchWeekData();
  }, [selectedClassId, weekStart, getWeekDays]);

  const navigateWeek = (direction: "prev" | "next") => {
    setWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction === "next" ? 7 : -7));
      return newDate;
    });
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);
    setWeekStart(monday);
  };

  // Stats for the week
  const getWeekStats = () => {
    const days = getWeekDays();
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalMarked = 0;

    days.forEach((day) => {
      const dateStr = formatDate(day);
      const dayRecords = weekRecords[dateStr] || {};
      Object.values(dayRecords).forEach((status) => {
        totalMarked++;
        if (status === "Present") totalPresent++;
        else if (status === "Absent") totalAbsent++;
        else if (status === "Late") totalLate++;
      });
    });

    return { totalPresent, totalAbsent, totalLate, totalMarked };
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case "Present":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "Absent":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "Late":
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <span className="w-4 h-4 block rounded-full border-2 border-dashed border-gray-200" />;
    }
  };

  const getStatusLabel = (status: string | undefined) => {
    switch (status) {
      case "Present": return "P";
      case "Absent": return "A";
      case "Late": return "L";
      default: return "–";
    }
  };

  const stats = getWeekStats();
  const weekDays = getWeekDays();

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
        <h2 className="text-xl font-bold text-gray-900">No Classes Found</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          No form classes were found for your account. Attendance history will appear here once you are assigned as a form teacher.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors shrink-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#053d26]">Attendance History</h1>
            <p className="text-gray-600 text-sm mt-1">
              View past attendance records for your form classes.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link 
            href={`/dashboard/faculty/attendance?classId=${selectedClassId}`}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#053d26]/5 text-[#053d26] hover:bg-[#053d26] hover:text-white transition-colors border border-[#053d26]/10"
          >
            Mark Today
          </Link>
          {/* Class selector */}
          {formClasses.length > 1 && (
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                const cls = formClasses.find(
                  (c) => (c.classId || c.id || c._id) === e.target.value
                );
                setSelectedClassName(cls?.name || cls?.className || "");
              }}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#053d26] focus:ring-1 focus:ring-[#053d26]"
            >
              {formClasses.map((c) => (
                <option key={c.classId || c.id || c._id} value={c.classId || c.id || c._id}>
                  {c.name || c.className}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Week Navigator */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <button
          onClick={() => navigateWeek("prev")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="relative flex items-center gap-3 font-medium text-gray-900 group cursor-pointer">
          <input 
            type="date"
            className="absolute inset-0 opacity-0 cursor-pointer w-full"
            value={formatDate(weekStart)}
            onChange={(e) => {
              if (e.target.value) {
                const selectedDate = new Date(e.target.value);
                const dayOfWeek = selectedDate.getDay();
                const monday = new Date(selectedDate);
                monday.setDate(selectedDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
                monday.setHours(0, 0, 0, 0);
                setWeekStart(monday);
              }
            }}
          />
          <Calendar className="h-5 w-5 text-[#053d26] group-hover:scale-110 transition-transform" />
          <span className="group-hover:text-[#053d26] transition-colors">{formatMonthRange()}</span>
          {isToday(weekStart) && (
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 font-bold uppercase tracking-wide">
              This Week
            </span>
          )}
        </div>
        <button
          onClick={() => navigateWeek("next")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-30"
          disabled={isFuture(weekDays[4])}
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Week Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Marked</p>
          <p className="text-2xl font-black text-gray-900">{stats.totalMarked}</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Present</p>
          <p className="text-2xl font-black text-emerald-700">{stats.totalPresent}</p>
        </div>
        <div className="bg-red-50 rounded-2xl border border-red-100 p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-1">Absent</p>
          <p className="text-2xl font-black text-red-600">{stats.totalAbsent}</p>
        </div>
        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">Late</p>
          <p className="text-2xl font-black text-amber-600">{stats.totalLate}</p>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden relative">
        {loadingRecords && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#053d26]" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-5 text-[10px] font-black uppercase tracking-wider text-gray-400 sticky left-0 bg-gray-50 min-w-[180px]">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    Student
                  </div>
                </th>
                {weekDays.map((day) => (
                  <th
                    key={formatDate(day)}
                    className={`py-4 px-4 text-center min-w-[80px] ${
                      isToday(day) ? "bg-[#053d26]/5" : ""
                    } ${!isFuture(day) ? "hover:bg-gray-100 cursor-pointer transition-colors" : ""}`}
                  >
                    {isFuture(day) ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {formatShortDay(day)}
                        </span>
                        <span className="text-sm font-black text-gray-300">
                          {formatDayNum(day)}
                        </span>
                      </div>
                    ) : (
                      <Link href={`/dashboard/faculty/attendance?classId=${selectedClassId}&date=${formatDate(day)}`} className="flex flex-col items-center gap-0.5 group">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-[#053d26] transition-colors">
                          {formatShortDay(day)}
                        </span>
                        <span
                          className={`text-sm font-black transition-colors ${
                            isToday(day)
                              ? "text-white bg-[#053d26] w-7 h-7 rounded-full flex items-center justify-center group-hover:bg-[#032517]"
                              : "text-gray-700 group-hover:text-[#053d26]"
                          }`}
                        >
                          {formatDayNum(day)}
                        </span>
                      </Link>
                    )}
                  </th>
                ))}
                <th className="py-4 px-4 text-center text-[10px] font-black uppercase tracking-wider text-gray-400 min-w-[80px]">
                  Summary
                </th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && !loadingRecords ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <p className="text-sm font-semibold text-gray-400">
                      No students found in this class.
                    </p>
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const sId = student.studentId || student.id || student._id;
                  // Calculate per-student weekly stats
                  let pCount = 0, aCount = 0, lCount = 0;
                  weekDays.forEach((day) => {
                    const status = weekRecords[formatDate(day)]?.[sId];
                    if (status === "Present") pCount++;
                    else if (status === "Absent") aCount++;
                    else if (status === "Late") lCount++;
                  });
                  const totalDays = pCount + aCount + lCount;
                  const attendanceRate = totalDays > 0 ? Math.round(((pCount + lCount) / totalDays) * 100) : 0;

                  return (
                    <tr
                      key={sId}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3 px-5 sticky left-0 bg-white">
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
                            <p className="text-xs font-bold text-gray-900 leading-tight">
                              {student.fullName || student.name}
                            </p>
                            <p className="text-[10px] text-gray-400 font-semibold">
                              {student.admissionNumber || sId.slice(0, 12)}
                            </p>
                          </div>
                        </div>
                      </td>
                      {weekDays.map((day) => {
                        const dateStr = formatDate(day);
                        const status = weekRecords[dateStr]?.[sId];
                        return (
                          <td
                            key={dateStr}
                            className={`py-3 px-4 text-center relative group ${
                              isToday(day) ? "bg-[#053d26]/5" : ""
                            }`}
                          >
                            {!isFuture(day) ? (
                              <Link 
                                href={`/dashboard/faculty/attendance?classId=${selectedClassId}&date=${dateStr}`}
                                className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 bg-[#053d26]/10 transition-opacity z-10 rounded-lg m-1"
                                title="Edit Attendance"
                              >
                                <span className="text-[10px] font-bold text-[#053d26] uppercase tracking-wider bg-white px-2 py-0.5 rounded-md shadow-sm">Edit</span>
                              </Link>
                            ) : null}
                            <div className={`flex flex-col items-center gap-0.5 transition-opacity ${!isFuture(day) ? 'group-hover:opacity-30' : ''}`}>
                              {getStatusIcon(status)}
                              <span
                                className={`text-[10px] font-black ${
                                  status === "Present"
                                    ? "text-emerald-600"
                                    : status === "Absent"
                                    ? "text-red-500"
                                    : status === "Late"
                                    ? "text-amber-500"
                                    : "text-gray-300"
                                }`}
                              >
                                {getStatusLabel(status)}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-center">
                        {totalDays > 0 ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <span
                              className={`text-sm font-black ${
                                attendanceRate >= 90
                                  ? "text-emerald-600"
                                  : attendanceRate >= 70
                                  ? "text-amber-500"
                                  : "text-red-500"
                              }`}
                            >
                              {attendanceRate}%
                            </span>
                            <span className="text-[9px] text-gray-400 font-semibold">
                              {pCount}P {aCount}A {lCount}L
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-300 font-bold">–</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs font-semibold text-gray-500">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Present
        </div>
        <div className="flex items-center gap-1.5">
          <XCircle className="w-3.5 h-3.5 text-red-500" /> Absent
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-500" /> Late
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 block rounded-full border-2 border-dashed border-gray-300" /> Not Recorded
        </div>
      </div>
    </div>
  );
}

export default function AttendanceHistory() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh] text-gray-400 font-semibold text-sm">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading...
      </div>
    }>
      <AttendanceHistoryInner />
    </Suspense>
  );
}
