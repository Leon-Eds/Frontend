"use client";

import React, { useState, useEffect } from "react";
import { promotionApi, schoolApi, classApi, SchoolClass, AcademicSession } from "@/lib/api";
import { Loader2, AlertCircle, CheckCircle, GraduationCap, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";

export default function PromotionsManager({ currentSession, sessions }: { currentSession?: AcademicSession, sessions: AcademicSession[] }) {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [targetClassId, setTargetClassId] = useState("");
  const [targetSessionId, setTargetSessionId] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await classApi.getAll();
        setClasses(data);
      } catch (err) {
        console.error("Failed to load classes", err);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      setSelectedStudents([]);
      return;
    }
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('leoned_token');
        const res = await fetch(`/api/student?classId=${selectedClassId}&pageSize=1000`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const stds = data.data || data.items || data || [];
        setStudents(stds);
        setSelectedStudents(stds.map((s: any) => s.id || s._id));
      } catch (err) {
        console.error("Failed to load students", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [selectedClassId]);

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handlePromote = async () => {
    if (!targetClassId || !targetSessionId || selectedStudents.length === 0) {
      toast.error("Please select a target class, session, and at least one student.");
      return;
    }
    if (!window.confirm(`Are you sure you want to promote ${selectedStudents.length} students?`)) return;

    setIsProcessing(true);
    try {
      await promotionApi.promote({
        studentIds: selectedStudents,
        targetClassId,
        targetAcademicSessionId: targetSessionId
      });
      toast.success("Students promoted successfully!");
      setStudents(students.filter(s => !selectedStudents.includes(s.id || s._id)));
      setSelectedStudents([]);
    } catch (e: any) {
      toast.error(e.message || "Failed to promote students");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGraduate = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student to graduate.");
      return;
    }
    if (!window.confirm(`Are you sure you want to graduate ${selectedStudents.length} students?`)) return;

    setIsProcessing(true);
    try {
      await promotionApi.graduate({ studentIds: selectedStudents });
      toast.success("Students graduated successfully!");
      setStudents(students.filter(s => !selectedStudents.includes(s.id || s._id)));
      setSelectedStudents([]);
    } catch (e: any) {
      toast.error(e.message || "Failed to graduate students");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Source Selection */}
        <div className="space-y-6 md:col-span-1 border-r border-gray-100 pr-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">1. Select Source Class</h3>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#053d26]/20"
            >
              <option value="">-- Choose Class --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.arm || ''}</option>
              ))}
            </select>
          </div>

          {selectedClassId && (
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">2. Select Target</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Next Academic Session</label>
                  <select
                    value={targetSessionId}
                    onChange={(e) => setTargetSessionId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#053d26]/20"
                  >
                    <option value="">-- Choose Session --</option>
                    {sessions.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Next Class</label>
                  <select
                    value={targetClassId}
                    onChange={(e) => setTargetClassId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#053d26]/20"
                  >
                    <option value="">-- Choose Class --</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name} {c.arm || ''}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {selectedClassId && (
            <div className="pt-6 border-t border-gray-100 space-y-3">
              <button
                onClick={handlePromote}
                disabled={isProcessing || selectedStudents.length === 0 || !targetClassId || !targetSessionId}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                Promote Selected
              </button>
              
              <button
                onClick={handleGraduate}
                disabled={isProcessing || selectedStudents.length === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#b05e1c] text-white font-bold hover:bg-[#8e4a15] transition-colors disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <GraduationCap className="h-5 w-5" />}
                Graduate Selected
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Students List */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">3. Select Students</h3>
            <span className="text-sm font-bold text-[#053d26] bg-[#053d26]/10 px-3 py-1 rounded-full">
              {selectedStudents.length} / {students.length} Selected
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#053d26]" />
            </div>
          ) : !selectedClassId ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-500 font-medium">Select a source class to view students</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-200">
              <p className="text-gray-500 font-medium">No active students found in this class.</p>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto pr-2 space-y-2">
              <button 
                onClick={() => setSelectedStudents(selectedStudents.length === students.length ? [] : students.map(s => s.id || s._id))}
                className="text-xs font-bold text-[#20c997] hover:underline mb-2 block"
              >
                {selectedStudents.length === students.length ? "Deselect All" : "Select All"}
              </button>
              {students.map(student => {
                const id = student.id || student._id;
                const isSelected = selectedStudents.includes(id);
                return (
                  <div 
                    key={id}
                    onClick={() => toggleStudent(id)}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${
                      isSelected ? "bg-[#053d26]/5 border-[#053d26]/30" : "bg-white border-gray-100 hover:border-gray-300"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-gray-900">{student.fullName || student.name}</p>
                      <p className="text-xs text-gray-500">{student.admissionNumber}</p>
                    </div>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ${isSelected ? "bg-[#20c997] text-white" : "border-2 border-gray-300"}`}>
                      {isSelected && <CheckCircle className="h-4 w-4" />}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
