"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Save, Send, AlertCircle, ArrowLeft, ArrowRight, BookOpen, Clock, FileText, CheckCircle2, Loader2, Settings, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { scoreApi, classApi, subjectApi, sessionApi, dashboardApi, teacherPortalApi } from "@/lib/api";

interface StudentScore {
  id: string;
  name: string;
  avatarUrl?: string;
  admNo: string;
  ca1: number | string;
  ca2: number | string;
  exam: number | string;
  total: number | string;
  grade: string;
  pos: string;
  isMissingExam?: boolean;
}

function calculatePositions(students: StudentScore[]): StudentScore[] {
  const sorted = [...students].sort((a, b) => {
    const totalA = typeof a.total === 'number' ? a.total : 0;
    const totalB = typeof b.total === 'number' ? b.total : 0;
    return totalB - totalA;
  });

  let currentRank = 1;
  let currentScore = -1;
  const rankMap = new Map<string, string>();
  
  sorted.forEach((s, index) => {
    const total = typeof s.total === 'number' ? s.total : 0;
    
    if (total !== currentScore) {
      currentRank = index + 1;
      currentScore = total;
    }

    let suffix = "th";
    const lastDigit = currentRank % 10;
    const lastTwo = currentRank % 100;
    if (lastDigit === 1 && lastTwo !== 11) suffix = "st";
    else if (lastDigit === 2 && lastTwo !== 12) suffix = "nd";
    else if (lastDigit === 3 && lastTwo !== 13) suffix = "rd";

    if (s.ca1 === "" && s.ca2 === "" && s.exam === "") {
      rankMap.set(s.id, "--");
    } else {
      rankMap.set(s.id, `${currentRank}${suffix}`);
    }
  });

  return students.map(s => ({
    ...s,
    pos: rankMap.get(s.id) || "--"
  }));
}

export default function FacultyResultEntry() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentScore[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [saveStatus, setSaveStatus] = useState("All changes saved");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [currentTermId, setCurrentTermId] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState("");
  const [currentSessionName, setCurrentSessionName] = useState("");
  const gradingConfig = { ca1: 20, ca2: 20, exam: 60 };

  // Fetch teacher assignments and current term on mount
  useEffect(() => {
    const init = async () => {
      try {
        const storedUser = localStorage.getItem("leoned_user");
        if (!storedUser) return;
        const user = JSON.parse(storedUser);

        // Fetch teacher's assignments via teacher portal API
        const [assignmentsRes, sessionData, dashboardStats] = await Promise.all([
          teacherPortalApi.getAssignments().catch(() => []),
          sessionApi.getAll().catch(() => []),
          dashboardApi.getTeacherDashboard().catch(() => ({}))
        ]);

        const unwrappedAssignments = Array.isArray(assignmentsRes) 
          ? assignmentsRes 
          : ((assignmentsRes as any)?.data || (assignmentsRes as any)?.items || []);
        
        const assignments = unwrappedAssignments;
        
        // Extract unique classes and subjects from assignments
        const uniqueClasses = new Map();
        const uniqueSubjects = new Map();
        
        assignments.forEach((a: any) => {
          const cId = a.classId || a.class?.id || a.class?._id;
          const cName = a.className || a.class?.name || "Class";
          const sId = a.subjectId || a.subject?.id || a.subject?._id;
          const sName = a.subjectName || a.subject?.name || "Subject";
          
          if (cId) uniqueClasses.set(cId, { id: cId, name: cName });
          if (sId) uniqueSubjects.set(sId, { id: sId, name: sName });
        });

        const classList = Array.from(uniqueClasses.values());
        const subjectList = Array.from(uniqueSubjects.values());
        
        setClasses(classList);
        setSubjects(subjectList);

        let foundTermId = "";
        const currentSession = (Array.isArray(sessionData) ? sessionData : []).find((s: any) => s.isCurrent);
        if (currentSession) {
          setCurrentSessionId(currentSession.id || "");
          setCurrentSessionName(currentSession.name || "");
          const currentTerm = currentSession.terms?.find((t: any) => t.isCurrent);
          if (currentTerm) {
            foundTermId = currentTerm.id;
            setCurrentTermId(foundTermId);
          }
        } else if (dashboardStats) {
          // Fallback to dashboardStats if sessionApi fails due to 403
          const stats = dashboardStats as any;
          if (stats.currentSessionId) setCurrentSessionId(stats.currentSessionId);
          if (stats.currentSession) setCurrentSessionName(stats.currentSession);
          if (stats.currentTermId) {
            foundTermId = stats.currentTermId;
            setCurrentTermId(foundTermId);
          }
        }

        if (classList.length > 0) setSelectedClass(classList[0].id);
        if (subjectList.length > 0) setSelectedSubject(subjectList[0].id);
        
        // If we have nothing selected, we must end loading here.
        // Otherwise, fetchScoresheet will take over and end loading when it finishes.
        if (classList.length === 0 || subjectList.length === 0 || !foundTermId) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[Result Entry] Failed to load initial data:", err);
        setError("Failed to load classes and subjects.");
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Fetch scoresheet when class/subject/term change
  const fetchScoresheet = useCallback(async () => {
    if (!selectedClass || !selectedSubject || !currentTermId) return;

    setIsLoading(true);
    setError("");
    try {
      const data = await scoreApi.getScoresheet(selectedClass, selectedSubject, currentTermId);
      let scores: any[] = [];
      if (Array.isArray(data)) {
        scores = data;
      } else if (data && typeof data === 'object') {
        const d = data as any;
        scores = d.scores || d.data || d.items || [];
      }
      
      // If no scores exist yet for this class/subject/term, fetch the students and initialize empty score rows
      if (scores.length === 0) {
        const classStudentsRes = await teacherPortalApi.getClassStudents(selectedClass).catch(() => []);
        const classStudents = Array.isArray(classStudentsRes) 
          ? classStudentsRes 
          : (classStudentsRes as any)?.data || (classStudentsRes as any)?.items || (classStudentsRes as any)?.students || [];
          
        scores = classStudents.map((s: any) => ({
          studentId: s.id || s._id || s.studentId,
          studentName: s.fullName || s.name || s.studentName,
          admissionNumber: s.admissionNumber || s.admissionNo || "",
          ca1: "",
          ca2: "",
          exam: "",
        }));
      }

      const mapped: StudentScore[] = scores.map((s: any, idx: number) => {
        const ca1 = s.firstCA ?? s.ca1 ?? "";
        const ca2 = s.secondCA ?? s.ca2 ?? "";
        const exam = s.exam ?? "";
        const ca1Num = ca1 === "" ? 0 : Number(ca1);
        const ca2Num = ca2 === "" ? 0 : Number(ca2);
        const examNum = exam === "" ? 0 : Number(exam);
        const isMissing = exam === "" || exam === null || exam === undefined;
        const total = ca1Num + ca2Num + examNum;
        let grade = "N/A";
        const t = total as number;
        const maxTotal = gradingConfig.ca1 + gradingConfig.ca2 + gradingConfig.exam;
        const percentage = maxTotal > 0 ? (t / maxTotal) * 100 : 0;
        if (percentage >= 75) grade = "A";
        else if (percentage >= 60) grade = "B";
        else if (percentage >= 50) grade = "C";
        else if (percentage >= 40) grade = "D";
        else grade = "F";
        return {
          id: s.studentId || s.id || String(idx),
          name: s.studentName || s.student?.fullName || s.fullName || "Unknown",
          admNo: s.admissionNumber || s.student?.admissionNumber || s.admNo || "",
          ca1,
          ca2,
          exam: exam ?? "",
          total,
          grade: s.grade || grade,
          pos: s.position || "--",
          isMissingExam: isMissing,
        };
      });
      setStudents(calculatePositions(mapped));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load scoresheet";
      console.error("[Result Entry] Scoresheet error:", err);
      setError(message);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedClass, selectedSubject, currentTermId]);

  useEffect(() => {
    fetchScoresheet();
  }, [fetchScoresheet]);

  const handleScoreChange = (id: string, field: "ca1" | "ca2" | "exam", value: string) => {
    setSaveStatus("Unsaved changes...");
    setIsSaving(true);

    setStudents(prev => {
      const mapped = prev.map(s => {
      if (s.id !== id) return s;

      let numVal: number | "" = value === "" ? "" : Number(value);
      if (numVal !== "") {
        if (field === "ca1" || field === "ca2") {
          if (numVal > 20) numVal = 20;
          if (numVal < 0) numVal = 0;
        } else if (field === "exam") {
          if (numVal > 60) numVal = 60;
          if (numVal < 0) numVal = 0;
        }
      }

      const updated = { ...s, [field]: numVal };

      const ca1 = updated.ca1 === "" ? 0 : Number(updated.ca1);
      const ca2 = updated.ca2 === "" ? 0 : Number(updated.ca2);
      const exam = updated.exam === "" ? 0 : Number(updated.exam);

      updated.isMissingExam = updated.exam === "";
      
      const total = ca1 + ca2 + exam;
      updated.total = total;
      
      const maxTotal = gradingConfig.ca1 + gradingConfig.ca2 + gradingConfig.exam;
      const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
      
      if (percentage >= 75) updated.grade = "A";
      else if (percentage >= 60) updated.grade = "B";
      else if (percentage >= 50) updated.grade = "C";
      else if (percentage >= 40) updated.grade = "D";
      else updated.grade = "F";

      return updated;
      });
      return calculatePositions(mapped);
    });

    setIsSaving(false);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.admNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedClassName = classes.find(c => c.id === selectedClass)?.name || "";
  const selectedSubjectName = subjects.find(s => s.id === selectedSubject)?.name || "";

  const handleSaveDraft = async () => {
    if (!selectedClass || !selectedSubject || !currentTermId || !currentSessionId) {
      setError("Please select a class and subject, and ensure the current session is active.");
      return;
    }

    setSaveStatus("Saving draft...");
    setIsSaving(true);
    setError("");
    try {
      const payload = {
        subjectId: selectedSubject,
        classId: selectedClass,
        termId: currentTermId,
        academicSessionId: currentSessionId,
        scores: students.map(s => ({
          studentId: s.id,
          firstCA: s.ca1 === "" ? null : Number(s.ca1),
          secondCA: s.ca2 === "" ? null : Number(s.ca2),
          exam: s.exam === "" ? null : Number(s.exam),
          remark: s.grade === "N/A" || s.grade === "--" ? undefined : s.grade
        }))
      };

      await scoreApi.bulkEnter(payload);
      setSaveStatus("Draft saved successfully");
      setTimeout(() => setSaveStatus("All changes saved"), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save draft";
      console.error("[Result Entry] Save draft error:", err);
      setError(message);
      setSaveStatus("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitScores = async () => {
    if (!selectedClass || !selectedSubject || !currentTermId || !currentSessionId) {
      setError("Please select a class and subject, and ensure the current session is active.");
      return;
    }

    setSaveStatus("Submitting ledger...");
    setIsSaving(true);
    setError("");
    try {
      const payload = {
        subjectId: selectedSubject,
        classId: selectedClass,
        termId: currentTermId,
        academicSessionId: currentSessionId,
        scores: students.map(s => ({
          studentId: s.id,
          firstCA: s.ca1 === "" ? null : Number(s.ca1),
          secondCA: s.ca2 === "" ? null : Number(s.ca2),
          exam: s.exam === "" ? null : Number(s.exam),
          remark: s.grade === "N/A" || s.grade === "--" ? undefined : s.grade
        }))
      };

      await scoreApi.bulkEnter(payload);
      setSaveStatus("Ledger submitted successfully");
      
      // Trigger notification to Admin
      try {
        const storedUser = localStorage.getItem("leoned_user");
        const userName = storedUser ? JSON.parse(storedUser).name : "A teacher";
        const { notificationsApi } = await import("@/lib/notifications");
        notificationsApi.addNotification({
          title: "New Ledger Submitted",
          message: `${userName || 'A teacher'} has submitted a ledger for ${selectedClassName} - ${selectedSubjectName}. It is now awaiting approval.`,
          type: "info",
          targetRole: "Admin",
          link: "/dashboard/approvals"
        });
      } catch (e) {
        console.error("Failed to send notification", e);
      }

      setTimeout(() => setSaveStatus("All changes saved"), 3000);
      // Optionally refresh scoresheet
      fetchScoresheet();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit scores";
      console.error("[Result Entry] Score submission error:", err);
      setError(message);
      setSaveStatus("Submission failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors shrink-0 mt-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-orange-100 text-[#b05e1c] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {currentSessionName || "Current Session"}
              </span>
              <span className="bg-green-100 text-[#053d26] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {selectedClassName} {selectedSubjectName}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">Teacher Score Entry Ledger</h1>
            <p className="text-gray-500 max-w-2xl leading-relaxed text-sm">
              Enter and verify results for the selected class and subject. Auto-saves changes securely.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={handleSaveDraft}
            disabled={isSaving || isLoading || students.length === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving && saveStatus === "Saving draft..." ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Draft
          </button>
          <button 
            onClick={handleSubmitScores}
            disabled={isSaving || isLoading || students.length === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-all text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving && saveStatus === "Submitting ledger..." ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isSaving && saveStatus === "Submitting ledger..." ? "Submitting..." : "Submit Ledger"}
          </button>
        </div>
      </div>

      {/* Class/Subject Selectors */}
      <div className="flex flex-wrap gap-4">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#053d26]"
        >
          <option value="">Select Class</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#053d26]"
        >
          <option value="">Select Subject</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${isSaving ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-700"}`}>
          {isSaving ? <Clock className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          {saveStatus}
        </div>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <div className="flex items-center justify-center py-16 text-gray-400 font-semibold text-sm">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading scoresheet...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-semibold">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Score Table */}
      {!isLoading && !error && (
        <>
          {/* Search */}
          <div className="relative max-w-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-full border border-gray-200 bg-white py-2.5 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-transparent transition-colors"
              placeholder="Search by name or admission no..."
            />
          </div>

          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50/80 text-[10px] font-black uppercase tracking-wider text-gray-400 border-b border-gray-100">
                    <th className="py-4 pl-6 pr-2 w-10">#</th>
                    <th className="py-4 px-4">Student</th>
                    <th className="py-4 px-4 w-20">Adm No</th>
                    <th className="py-4 px-4 text-center w-20">CA 1 (20)</th>
                    <th className="py-4 px-4 text-center w-20">CA 2 (20)</th>
                    <th className="py-4 px-4 text-center w-20">Exam (60)</th>
                    <th className="py-4 px-4 text-center w-20">Total</th>
                    <th className="py-4 px-4 text-center w-16">Grade</th>
                    <th className="py-4 px-4 text-center w-16">Pos</th>
                    <th className="py-4 pr-6 pl-4 w-20">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredStudents.length > 0 ? filteredStudents.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 pl-6 pr-2 text-xs font-bold text-gray-400">{idx + 1}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-50 text-[#053d26] font-bold text-xs flex items-center justify-center border border-gray-200/50 shrink-0">
                            {s.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-gray-900 text-sm">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold text-gray-500">{s.admNo}</td>
                      <td className="py-4 px-4 text-center">
                        <input type="number" min="0" max={20} value={s.ca1}
                          onChange={(e) => handleScoreChange(s.id, "ca1", e.target.value)}
                          className="w-14 text-center py-1.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-transparent"
                        />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <input type="number" min="0" max={20} value={s.ca2}
                          onChange={(e) => handleScoreChange(s.id, "ca2", e.target.value)}
                          className="w-14 text-center py-1.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-transparent"
                        />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <input type="number" min="0" max={60} value={s.exam}
                          onChange={(e) => handleScoreChange(s.id, "exam", e.target.value)}
                          className={`w-14 text-center py-1.5 rounded-lg border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-transparent ${s.isMissingExam ? "border-red-300 bg-red-50 text-red-600" : "border-gray-200 text-gray-700"}`}
                        />
                      </td>
                      <td className="py-4 px-4 text-center font-extrabold text-gray-900 text-sm">{s.total || "--"}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black ${
                          s.grade === "A" ? "bg-green-100 text-[#053d26]" :
                          s.grade === "B" ? "bg-blue-100 text-blue-700" :
                          s.grade === "C" ? "bg-gray-100 text-gray-600" :
                          s.grade === "D" ? "bg-orange-100 text-orange-700" :
                          s.grade === "F" ? "bg-red-100 text-red-700" :
                          "bg-gray-100 text-gray-400"
                        }`}>
                          {s.grade}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-xs font-bold text-gray-500">{s.pos}</td>
                      <td className="py-4 pr-6 pl-4">
                        {s.isMissingExam ? (
                          <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full uppercase">Missing</span>
                        ) : (
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase">Complete</span>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={10} className="py-16 text-center text-gray-400 font-semibold text-sm">
                        {searchTerm ? "No students match your search." : "No scoresheet data available. Select a class and subject."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
