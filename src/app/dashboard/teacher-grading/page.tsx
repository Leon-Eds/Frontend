"use client";

import { useState, useEffect, useCallback } from "react";
import toast from 'react-hot-toast';
import { Search, Save, Send, AlertCircle, ArrowLeft, ArrowRight, BookOpen, Clock, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { scoreApi, classApi, subjectApi, sessionApi, teacherPortalApi } from "@/lib/api";

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

export default function ScoreEntryLedger() {
  const [students, setStudents] = useState<StudentScore[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [currentTermId, setCurrentTermId] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState("");
  const [currentSessionName, setCurrentSessionName] = useState("");
  const [isSubmittingScores, setIsSubmittingScores] = useState(false);

  // Fetch classes, subjects, and current term on mount
  useEffect(() => {
    const init = async () => {
      try {
        const [classData, subjectData, sessionData] = await Promise.all([
          classApi.getAll(),
          subjectApi.getAll(),
          sessionApi.getAll(),
        ]);

        const classList = Array.isArray(classData) ? classData : [];
        const subjectList = Array.isArray(subjectData) ? subjectData : [];
        setClasses(classList.map((c: any) => ({ id: c.id, name: c.name })));
        setSubjects(subjectList.map((s: any) => ({ id: s.id, name: s.name })));

        // Find current session and term
        const currentSession = (Array.isArray(sessionData) ? sessionData : []).find((s: any) => s.isCurrent);
        if (currentSession) {
          setCurrentSessionId(currentSession.id || "");
          setCurrentSessionName(currentSession.name || "");
          const currentTerm = currentSession.terms?.find((t: any) => t.isCurrent);
          if (currentTerm) {
            setCurrentTermId(currentTerm.id);
          }
        }

        // Auto-select first class and subject
        if (classList.length > 0) setSelectedClass(classList[0].id);
        if (subjectList.length > 0) setSelectedSubject(subjectList[0].id);
      } catch (err) {
        console.error("[Teacher Grading] Failed to load initial data:", err);
        setError("Failed to load classes and subjects.");
      } finally {
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
      let scores = Array.isArray(data) ? data : [];
      
      // Always fetch class students to ensure newly added students are included
      let classStudentsRes: any = null;
      try {
        classStudentsRes = await teacherPortalApi.getClassStudents(selectedClass);
      } catch (e) {
        console.error("Failed to fetch class students", e);
        classStudentsRes = [];
      }

      const classStudents = Array.isArray(classStudentsRes) 
        ? classStudentsRes 
        : (classStudentsRes as any)?.data || (classStudentsRes as any)?.items || (classStudentsRes as any)?.students || [];
        
      // Merge students with existing scores
      scores = classStudents.map((s: any) => {
        const studentId = s.id || s._id || s.studentId;
        const existingScore = scores.find((score: any) => 
          (score.studentId || score.student?.id || score.student?._id) === studentId
        );
        
        if (existingScore) {
          return {
            ...existingScore,
            studentId: studentId,
            studentName: s.fullName || s.name || s.studentName,
            admissionNumber: s.admissionNumber || s.admissionNo || "",
          };
        }
        
        return {
          studentId: studentId,
          studentName: s.fullName || s.name || s.studentName,
          admissionNumber: s.admissionNumber || s.admissionNo || "",
          ca1: "",
          ca2: "",
          exam: "",
        };
      });
      const mapped: StudentScore[] = scores.map((s: any, idx: number) => {
        const ca1 = s.firstCA ?? s.ca1 ?? "";
        const ca2 = s.secondCA ?? s.ca2 ?? "";
        const exam = s.exam ?? "";
        const ca1Num = ca1 === "" ? 0 : Number(ca1);
        const ca2Num = ca2 === "" ? 0 : Number(ca2);
        const examNum = exam === "" ? 0 : Number(exam);
        const isMissing = exam === "" || exam === null || exam === undefined;
        const total = isMissing ? "" : ca1Num + ca2Num + examNum;
        let grade = "N/A";
        if (!isMissing) {
          const t = total as number;
          if (t >= 75) grade = "A";
          else if (t >= 60) grade = "B";
          else if (t >= 50) grade = "C";
          else if (t >= 40) grade = "D";
          else grade = "F";
        }
        return {
          id: s.studentId || s.id || String(idx),
          name: s.studentName || s.fullName || "Unknown",
          admNo: s.admissionNumber || s.admNo || "",
          ca1,
          ca2,
          exam: exam ?? "",
          total,
          grade: s.grade || grade,
          pos: s.position || "--",
          isMissingExam: isMissing,
        };
      });
      setStudents(mapped);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load scoresheet";
      console.error("[Teacher Grading] Scoresheet error:", err);
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
    setStudents(prev => prev.map(s => {
      if (s.id !== id) return s;

      const numVal = value === "" ? "" : Number(value);
      const updated = { ...s, [field]: numVal };

      // Recalculate total, grade, isMissingExam
      const ca1 = updated.ca1 === "" ? 0 : Number(updated.ca1);
      const ca2 = updated.ca2 === "" ? 0 : Number(updated.ca2);
      const exam = updated.exam === "" ? 0 : Number(updated.exam);

      updated.isMissingExam = updated.exam === "";

      if (updated.exam === "") {
        updated.total = "";
        updated.grade = "N/A";
      } else {
        const total = ca1 + ca2 + exam;
        updated.total = total;
        
        if (total >= 75) updated.grade = "A";
        else if (total >= 60) updated.grade = "B";
        else if (total >= 50) updated.grade = "C";
        else if (total >= 40) updated.grade = "D";
        else updated.grade = "F";
      }

      return updated;
    }));
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.admNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedClassName = classes.find(c => c.id === selectedClass)?.name || "";
  const selectedSubjectName = subjects.find(s => s.id === selectedSubject)?.name || "";

  const handleSubmitScores = async () => {
    if (!selectedClass || !selectedSubject || !currentTermId || !currentSessionId) {
      setError("Please select a class and subject, and ensure the current session is active.");
      return;
    }

    setIsSubmittingScores(true);
    setError("");
    try {
      const payload = {
        subjectId: selectedSubject,
        classId: selectedClass,
        termId: currentTermId,
        academicSessionId: currentSessionId,
        scores: students.map(s => ({
          studentId: s.id,
          firstCA: s.ca1 === "" ? 0 : Number(s.ca1),
          secondCA: s.ca2 === "" ? 0 : Number(s.ca2),
          exam: s.exam === "" ? 0 : Number(s.exam),
          remark: s.grade
        }))
      };

      await scoreApi.bulkEnter(payload);
      toast.success("Scores submitted successfully!");
      // Optionally refresh scoresheet
      fetchScoresheet();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit scores";
      console.error("[Teacher Grading] Score submission error:", err);
      setError(message);
    } finally {
      setIsSubmittingScores(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-orange-100 text-[#b05e1c] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {currentSessionName || "Current Session"}
            </span>
            <span className="bg-green-100 text-[#053d26] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {selectedClassName} {selectedSubjectName}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">Score Entry Ledger</h1>
          <p className="text-gray-500 max-w-2xl leading-relaxed text-sm">
            Enter and verify student results. Select a class and subject to load the scoresheet.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button className="flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all text-sm shadow-sm">
            <Save className="h-4 w-4" />
            Save Draft
          </button>
          <button 
            onClick={handleSubmitScores}
            disabled={isSubmittingScores || isLoading || students.length === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-all text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmittingScores ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isSubmittingScores ? "Submitting..." : "Submit Ledger"}
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

      {/* Stats Row */}
      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#053d26] rounded-3xl p-6 text-white shadow-sm">
              <p className="text-xs font-bold text-green-200 uppercase tracking-wider">Total Students</p>
              <p className="text-4xl font-black mt-2">{students.length}</p>
            </div>
            <div className="bg-gray-100 rounded-3xl p-6 shadow-sm border border-gray-200/50">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Missing Exams</p>
              <p className="text-4xl font-black mt-2 text-[#b05e1c]">{students.filter(s => s.isMissingExam).length}</p>
            </div>
            <div className="bg-gray-100 rounded-3xl p-6 shadow-sm border border-gray-200/50">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Class Average</p>
              <p className="text-4xl font-black mt-2 text-gray-900">
                {students.filter(s => s.total !== "").length > 0 
                  ? (students.filter(s => s.total !== "").reduce((sum, s) => sum + Number(s.total), 0) / students.filter(s => s.total !== "").length).toFixed(1) + "%" 
                  : "N/A"}
              </p>
            </div>
            <div className="bg-gray-100 rounded-3xl p-6 shadow-sm border border-gray-200/50 relative overflow-hidden">
              {/* simple bar icon */}
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Highest Score</p>
              <p className="text-4xl font-black mt-2 text-[#053d26]">
                {students.filter(s => s.total !== "").length > 0 
                  ? Math.max(...students.filter(s => s.total !== "").map(s => Number(s.total))) + "%" 
                  : "N/A"}
              </p>
            </div>
          </div>

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

          {/* Score Entry Table */}
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
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={s.ca1}
                          onChange={(e) => handleScoreChange(s.id, "ca1", e.target.value)}
                          className="w-14 text-center py-1.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-transparent"
                        />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={s.ca2}
                          onChange={(e) => handleScoreChange(s.id, "ca2", e.target.value)}
                          className="w-14 text-center py-1.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-transparent"
                        />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <input
                          type="number"
                          min="0"
                          max="60"
                          value={s.exam}
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
