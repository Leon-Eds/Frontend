"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar as CalendarIcon, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { attendanceApi, sessionApi } from "@/lib/api";

export default function StudentAttendance({ studentInfo }: { studentInfo: any }) {
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, percentage: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [terms, setTerms] = useState<any[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string>('');

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const sessions = await sessionApi.getAll().catch(() => []);
        const sList = Array.isArray(sessions) ? sessions : [];
        const tList: any[] = [];
        let currTermId = '';
        
        sList.forEach((s: any) => {
          if (s.terms) {
            s.terms.forEach((t: any) => {
              tList.push({ ...t, sessionName: s.name });
              if (t.isCurrent) currTermId = t.id || t._id;
            });
          }
        });
        
        setTerms(tList);
        if (currTermId) setSelectedTermId(currTermId);
        else if (tList.length > 0) setSelectedTermId(tList[0].id || tList[0]._id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTerms();
  }, []);

  useEffect(() => {
    if (!selectedTermId) return;
    const fetchAttendance = async () => {
      try {
        setIsLoading(true);
        console.log("[DEBUG] studentInfo in attendance:", studentInfo);
        const studentId = studentInfo?.id || studentInfo?.studentId || studentInfo?._id;
        
        let res;
        try {
          res = await attendanceApi.getMyAttendance(selectedTermId);
        } catch (e) {
          console.warn("[DEBUG] getMyAttendance failed or 404, falling back...");
          if (studentId) {
             try {
                res = await attendanceApi.getStudentAttendance(studentId, selectedTermId);
             } catch (e2) {
                console.warn("[DEBUG] getStudentAttendance also failed or 404.");
                res = [];
             }
          }
          else res = [];
        }
        
        // If myAttendance returns empty records BUT no stats, fallback to getStudentAttendance
        let data = (res as any)?.data || res;
        let records = Array.isArray(data) ? data : (data.records || data.items || data.attendance || Object.values(data).filter(v => typeof v === 'object' && (v as any).status) || []);
        
        if (records.length === 0 && studentId) {
           const fallbackRes = await attendanceApi.getStudentAttendance(studentId, selectedTermId).catch(() => []);
           data = (fallbackRes as any)?.data || fallbackRes;
           records = Array.isArray(data) ? data : (data.records || data.items || data.attendance || Object.values(data).filter(v => typeof v === 'object' && (v as any).status) || []);
        }

        console.log("[DEBUG] Raw attendance fetch result:", JSON.stringify(res, null, 2));
        console.log("[DEBUG] Extracted records:", records);
        
        // Compute stats
        let present = data?.present ?? 0;
        let absent = data?.absent ?? 0;
        let late = data?.late ?? 0;
        let percentage = data?.attendancePercentage ?? 0;

        // If the API didn't provide stats but we have records, compute manually
        if (records.length > 0 && data?.attendancePercentage === undefined) {
          present = 0; absent = 0; late = 0;
          records.forEach((r: any) => {
            if (r.status === 'Present') present++;
            else if (r.status === 'Absent') absent++;
            else if (r.status === 'Late') late++;
          });
          const total = present + absent + late;
          percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
        }
        
        setAttendanceRecords(records);
        setStats({ present, absent, late, percentage });
      } catch (err) {
        console.error(err);
        setError("Failed to load attendance records.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendance();
  }, [selectedTermId]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Term Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-[#b05e1c]" />
          <h2 className="text-xl font-bold text-gray-900">Attendance Tracker</h2>
        </div>
        <select
          value={selectedTermId}
          onChange={(e) => setSelectedTermId(e.target.value)}
          className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#053d26] focus:border-[#053d26] block w-full sm:w-auto p-2.5 font-semibold"
        >
          {terms.map((t, idx) => (
            <option key={idx} value={t.id || t._id}>
              Term {t.termNumber || t.name} ({t.sessionName})
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[30vh] text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading attendance...
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[30vh] text-red-500">
          <AlertCircle className="w-6 h-6 mr-2" /> {error}
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Overall %</span>
              <div className="text-3xl font-extrabold text-[#053d26]">{stats.percentage}%</div>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-6 shadow-sm border border-emerald-100 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-2" />
              <div className="text-2xl font-extrabold text-emerald-700">{stats.present}</div>
              <span className="text-xs font-bold text-emerald-600 uppercase mt-1">Present</span>
            </div>
            <div className="bg-red-50 rounded-2xl p-6 shadow-sm border border-red-100 flex flex-col items-center justify-center text-center">
              <XCircle className="w-6 h-6 text-red-500 mb-2" />
              <div className="text-2xl font-extrabold text-red-600">{stats.absent}</div>
              <span className="text-xs font-bold text-red-500 uppercase mt-1">Absent</span>
            </div>
            <div className="bg-amber-50 rounded-2xl p-6 shadow-sm border border-amber-100 flex flex-col items-center justify-center text-center">
              <Clock className="w-6 h-6 text-amber-500 mb-2" />
              <div className="text-2xl font-extrabold text-amber-600">{stats.late}</div>
              <span className="text-xs font-bold text-amber-500 uppercase mt-1">Late</span>
            </div>
          </div>

          {/* Records List */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Daily Records</h3>
            {attendanceRecords.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No attendance records found for this term.</p>
            ) : (
              <div className="space-y-3">
                {attendanceRecords.map((record, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
                        <CalendarIcon className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        {record.remarks && <p className="text-xs text-gray-500 mt-0.5">{record.remarks}</p>}
                      </div>
                    </div>
                    <div>
                      {record.status === 'Present' && <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full uppercase tracking-wider">Present</span>}
                      {record.status === 'Absent' && <span className="px-3 py-1 bg-red-100 text-red-700 font-bold text-xs rounded-full uppercase tracking-wider">Absent</span>}
                      {record.status === 'Late' && <span className="px-3 py-1 bg-amber-100 text-amber-700 font-bold text-xs rounded-full uppercase tracking-wider">Late</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
