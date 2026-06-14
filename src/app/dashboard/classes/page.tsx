"use client";

import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, BookOpen, Settings, MoreVertical, Edit2, ChevronRight, Calculator, BookText, Banknote, X, Loader2, AlertCircle, Trash2, CheckCircle2, ArrowLeft, Users, UserPlus, UserMinus, ArrowLeftRight, Check, BookOpenCheck } from 'lucide-react';
import { classApi, subjectApi, sessionApi, studentApi, teacherApi, SchoolClass, Subject, AcademicSession, CreateClassRequest, CreateSubjectRequest, Student, Teacher } from '@/lib/api';
import Link from 'next/link';

type ModalType = 'createClass' | 'subjectLibrary' | null;

export default function AcademicFlow() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentSession, setCurrentSession] = useState<AcademicSession | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Class detail screen state
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'students' | 'subjects'>('students');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showMoveStudentModal, setShowMoveStudentModal] = useState<Student | null>(null);
  const [targetClassId, setTargetClassId] = useState('');
  const [showAssignSubjectsModal, setShowAssignSubjectsModal] = useState(false);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [studentSearchText, setStudentSearchText] = useState('');

  // Form Teacher Assignment Modal
  const [showAssignFormTeacherModal, setShowAssignFormTeacherModal] = useState<SchoolClass | null>(null);
  const [formTeacherId, setFormTeacherId] = useState('');

  // Create Class form
  const [className, setClassName] = useState('');
  const [classArm, setClassArm] = useState('');

  // Create Subject form
  const [subjectName, setSubjectName] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [classData, subjectData, sessionData, studentData, teacherData] = await Promise.all([
        classApi.getAll(),
        subjectApi.getAll(),
        sessionApi.getAll().catch(() => []),
        studentApi.getAll().catch(() => []),
        teacherApi.getAll().catch(() => []),
      ]);
      const classItems = Array.isArray(classData) ? classData : [];
      const subjectItems = Array.isArray(subjectData) ? subjectData : [];
      const studentItems = Array.isArray(studentData) ? studentData : [];
      const teacherItems = Array.isArray(teacherData) ? teacherData : [];
      setClasses(classItems);
      setSubjects(subjectItems);
      setAllStudents(studentItems);
      setAllTeachers(teacherItems);

      // Find current session
      const sessions = Array.isArray(sessionData) ? sessionData : [];
      const active = sessions.find(s => s.isCurrent);
      setCurrentSession(active || null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load academic data";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-clear success messages
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!className.trim()) {
      setFormError("Class name is required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: CreateClassRequest = {
        name: className.trim(),
        arm: classArm.trim() || undefined,
      };
      // Include current session ID if available
      if (currentSession?.id) {
        payload.academicSessionId = currentSession.id;
      }
      
      await classApi.create(payload);
      
      // Success — close modal, reset form, refresh
      setActiveModal(null);
      setClassName('');
      setClassArm('');
      setSuccessMsg(`Class "${payload.name}" created successfully!`);
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create class";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!subjectName.trim()) {
      setFormError("Subject name is required.");
      return;
    }
    setIsSubmitting(true);
    try {
      await subjectApi.create({ name: subjectName.trim() });
      setSubjectName('');
      setFormError("");
      setSuccessMsg(`Subject "${subjectName.trim()}" added!`);
      // Refresh subjects list
      const freshSubjects = await subjectApi.getAll();
      setSubjects(Array.isArray(freshSubjects) ? freshSubjects : []);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to create subject");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      await subjectApi.delete(id);
      setSubjects(prev => prev.filter(s => s.id !== id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete subject");
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    try {
      await classApi.delete(id);
      setClasses(prev => prev.filter(c => c.id !== id));
      setSuccessMsg("Class deleted successfully.");
      if (selectedClassId === id) {
        setSelectedClassId(null);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete class");
    }
  };

  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to remove ${studentName} from this class?`)) return;
    try {
      setIsSubmitting(true);
      await studentApi.update(studentId, { classId: "" });
      setSuccessMsg(`${studentName} removed from class.`);
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to remove student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showMoveStudentModal || !targetClassId) return;
    const student = showMoveStudentModal;
    const targetClass = classes.find(c => c.id === targetClassId);
    try {
      setIsSubmitting(true);
      await studentApi.update(student.id, { classId: targetClassId });
      setSuccessMsg(`${student.fullName} moved to class ${targetClass?.name || ""}.`);
      setShowMoveStudentModal(null);
      setTargetClassId('');
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to move student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddStudent = async (studentId: string, studentName: string) => {
    if (!selectedClassId) return;
    try {
      setIsSubmitting(true);
      await studentApi.update(studentId, { classId: selectedClassId });
      setSuccessMsg(`${studentName} added to class.`);
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignSubjects = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) return;
    try {
      setIsSubmitting(true);
      await classApi.assignSubjects(selectedClassId, { subjectIds: selectedSubjectIds });
      setSuccessMsg("Class subjects updated successfully.");
      setShowAssignSubjectsModal(false);
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to assign subjects");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignFormTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAssignFormTeacherModal) return;
    try {
      setIsSubmitting(true);
      await classApi.update(showAssignFormTeacherModal.id, { formTeacherId });
      setSuccessMsg(`Form teacher assigned to ${showAssignFormTeacherModal.name} successfully.`);
      setShowAssignFormTeacherModal(null);
      setFormTeacherId('');
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to assign form teacher");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalStudents = classes.reduce((acc, c) => acc + (c.studentCount || 0), 0);
  const currentClass = classes.find(c => c.id === selectedClassId);
  const classStudents = allStudents.filter(s => s.classId === selectedClassId);
  const unassignedStudents = allStudents.filter(s => !s.classId || s.classId === "");
  const filteredUnassigned = unassignedStudents.filter(s =>
    s.fullName.toLowerCase().includes(studentSearchText.toLowerCase()) ||
    (s.admissionNumber && s.admissionNumber.toLowerCase().includes(studentSearchText.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10 pb-10">
      
      {/* Success Toast */}
      {successMsg && (
        <div className="fixed top-6 right-6 z-[60] animate-in slide-in-from-top fade-in duration-300">
          <div className="flex items-center gap-3 bg-[#053d26] text-white px-6 py-4 rounded-2xl shadow-2xl">
            <CheckCircle2 className="h-5 w-5 text-green-300 shrink-0" />
            <span className="text-sm font-semibold">{successMsg}</span>
            <button onClick={() => setSuccessMsg("")} className="text-green-200 hover:text-white ml-2">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {selectedClassId && currentClass ? (
        /* Detailed Class Screen */
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Back button & Class Info Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <button
                onClick={() => { setSelectedClassId(null); setActiveTab('students'); }}
                className="p-3 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-950 transition-all shadow-sm shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-extrabold text-[#053d26]">{currentClass.name}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {currentClass.arm ? `Arm/Section: ${currentClass.arm} • ` : ""}
                  {classStudents.length} Students enrolled
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              {activeTab === 'students' ? (
                <button
                  onClick={() => { setShowAddStudentModal(true); setStudentSearchText(''); }}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors shadow-sm text-sm"
                >
                  <UserPlus className="h-4 w-4" /> Add Student
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedSubjectIds(currentClass.subjects?.map(s => s.id) || []);
                    setShowAssignSubjectsModal(true);
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors shadow-sm text-sm"
                >
                  <BookOpenCheck className="h-4 w-4" /> Assign Subjects
                </button>
              )}
              <button
                onClick={() => {
                  setFormTeacherId(currentClass.formTeacherId || '');
                  setShowAssignFormTeacherModal(currentClass);
                }}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-orange-100 text-[#b05e1c] font-bold hover:bg-orange-200 transition-colors shadow-sm text-sm"
              >
                <UserPlus className="h-4 w-4" /> Form Teacher
              </button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('students')}
              className={`py-4 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'students'
                  ? 'border-[#053d26] text-[#053d26]'
                  : 'border-transparent text-gray-500 hover:text-gray-950'
              }`}
            >
              <Users className="h-4 w-4" /> Class Members ({classStudents.length})
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`py-4 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'subjects'
                  ? 'border-[#053d26] text-[#053d26]'
                  : 'border-transparent text-gray-500 hover:text-gray-950'
              }`}
            >
              <BookText className="h-4 w-4" /> Curriculum Subjects ({currentClass.subjects?.length || 0})
            </button>
          </div>

          {/* Tab Contents */}
          {activeTab === 'students' ? (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
              {classStudents.length === 0 ? (
                <div className="py-20 text-center text-gray-500">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No students in this class</h3>
                  <p className="text-sm text-gray-400 mb-6">Assign existing students or enroll new ones.</p>
                  <button
                    onClick={() => { setShowAddStudentModal(true); setStudentSearchText(''); }}
                    className="px-5 py-2.5 rounded-full border border-gray-200 font-bold hover:bg-gray-50 text-xs transition-colors"
                  >
                    Add Member
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="py-4 px-8 font-bold text-gray-400 text-xs uppercase tracking-wider">Student Profile</th>
                        <th className="py-4 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Admission No</th>
                        <th className="py-4 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Status</th>
                        <th className="py-4 px-8 font-bold text-gray-400 text-xs uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {classStudents.map(student => (
                        <tr key={student.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="py-5 px-8">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-green-50 text-[#053d26] border border-green-100 flex items-center justify-center font-bold text-sm uppercase">
                                {student.fullName[0]}
                              </div>
                              <span className="font-bold text-gray-900">{student.fullName}</span>
                            </div>
                          </td>
                          <td className="py-5 px-4 text-sm font-medium text-gray-700">{student.admissionNumber || '—'}</td>
                          <td className="py-5 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                              student.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                            }`}>
                              {student.status}
                            </span>
                          </td>
                          <td className="py-5 px-8 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setShowMoveStudentModal(student)}
                                className="p-2 text-gray-400 hover:text-[#053d26] hover:bg-green-50 rounded-xl transition-all"
                                title="Move to another class"
                              >
                                <ArrowLeftRight className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveStudent(student.id, student.fullName)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                title="Remove from class"
                              >
                                <UserMinus className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
              {!currentClass.subjects || currentClass.subjects.length === 0 ? (
                <div className="py-20 text-center text-gray-500">
                  <BookText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No subjects assigned</h3>
                  <p className="text-sm text-gray-400 mb-6">Assign curriculum subjects to this class tier.</p>
                  <button
                    onClick={() => {
                      setSelectedSubjectIds([]);
                      setShowAssignSubjectsModal(true);
                    }}
                    className="px-5 py-2.5 rounded-full border border-gray-200 font-bold hover:bg-gray-50 text-xs transition-colors"
                  >
                    Assign Subjects
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="py-4 px-8 font-bold text-gray-400 text-xs uppercase tracking-wider">Subject Name</th>
                        <th className="py-4 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Type</th>
                        <th className="py-4 px-8 font-bold text-gray-400 text-xs uppercase tracking-wider text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {currentClass.subjects.map(sub => (
                        <tr key={sub.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="py-5 px-8">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-orange-50 text-[#b05e1c] border border-orange-100 flex items-center justify-center">
                                <BookText className="h-4 w-4" />
                              </div>
                              <span className="font-bold text-gray-900">{sub.name}</span>
                            </div>
                          </td>
                          <td className="py-5 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Core Curriculum</td>
                          <td className="py-5 px-8 text-right">
                            <button
                              onClick={() => {
                                const newSelection = currentClass.subjects?.filter(s => s.id !== sub.id).map(s => s.id) || [];
                                classApi.assignSubjects(currentClass.id, { subjectIds: newSelection })
                                  .then(() => {
                                    setSuccessMsg("Subject unassigned.");
                                    fetchData();
                                  })
                                  .catch(err => toast.error(err.message));
                              }}
                              className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                            >
                              Unassign
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Academic Flow Main Screen */
        <>
          {/* Header Area */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl font-bold text-[#053d26] mb-3">Academic Flow</h1>
              <p className="text-gray-600 text-sm leading-relaxed">
                Manage classroom tiers, departmental alignment, and subject distribution across all grade levels.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <button
                onClick={() => { setActiveModal('createClass'); setFormError(''); }}
                className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors shadow-sm text-sm"
              >
                <Plus className="h-5 w-5" />
                Add New Class
              </button>
              <button
                onClick={() => { setActiveModal('subjectLibrary'); setFormError(''); }}
                className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-full bg-white border border-gray-200 text-gray-900 font-bold hover:bg-gray-50 transition-colors shadow-sm text-sm"
              >
                <BookOpen className="h-5 w-5" />
                Subject Library
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#b05e1c] mb-4">Total Classes</p>
              <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">{classes.length}</div>
              <p className="text-xs text-gray-500 font-semibold">Registered Classes</p>
            </div>
            <div className="bg-white rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#b05e1c] mb-4">Curriculum Units</p>
              <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">{subjects.length}</div>
              <p className="text-xs text-gray-500 font-semibold">Registered Subjects</p>
            </div>
            <div className="bg-[#053d26] rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 shadow-sm text-white relative overflow-hidden flex flex-col justify-between">
              <div className="absolute right-0 bottom-0 opacity-10">
                 <Settings className="w-32 h-32 -mb-8 -mr-8" />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-green-200/80 mb-4">Total Student Slots</p>
                <div className="text-4xl sm:text-5xl font-bold mb-2">{totalStudents.toLocaleString()}</div>
                <p className="text-xs text-green-100 font-semibold">Students across all classes</p>
              </div>
            </div>
          </div>

          {/* Classes Section */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#053d26]" />
              <span className="ml-3 text-gray-500 font-medium">Loading academic data...</span>
            </div>
          ) : error ? (
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to load academic data</h3>
              <p className="text-sm text-gray-500 mb-6">{error}</p>
              <button onClick={fetchData} className="px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors">
                Retry
              </button>
            </div>
          ) : classes.length === 0 ? (
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No classes created yet</h3>
              <p className="text-sm text-gray-500 mb-6">Add your first class to start building your academic structure.</p>
              {!currentSession && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 inline-block">
                  <p className="text-sm text-amber-800 font-medium">
                    💡 Tip: <Link href="/dashboard/rollover" className="underline font-bold hover:text-amber-900">Create an academic session</Link> first for best results.
                  </p>
                </div>
              )}
              <div>
                <button
                  onClick={() => { setActiveModal('createClass'); setFormError(''); }}
                  className="px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors"
                >
                  Add New Class
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">All Classes</h2>
                <div className="bg-gray-100 rounded-full p-1 flex text-xs font-bold">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-1.5 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    Grid View
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-1.5 rounded-full transition-colors ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    List View
                  </button>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {classes.map((cls) => (
                    <div key={cls.id} className="bg-white rounded-2xl sm:rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-[#053d26] text-white flex items-center justify-center text-lg font-bold">
                          {cls.name.slice(0, 3).toUpperCase()}
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2 py-1 rounded-full bg-[#b2f2bb] text-[#053d26] text-[10px] font-bold uppercase tracking-widest mb-1">
                            Active
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900">{cls.name}</h3>
                        <p className="text-xs text-gray-500">
                          {cls.arm ? `Arm: ${cls.arm} • ` : ''}{cls.studentCount ?? 0} Students
                        </p>
                      </div>

                      {cls.subjects && cls.subjects.length > 0 && (
                        <div className="space-y-2 mb-6 flex-1">
                          {cls.subjects.slice(0, 3).map(subject => (
                            <div key={subject.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm">
                                  <BookText className="h-3.5 w-3.5 text-gray-600" />
                                </div>
                                <span className="text-sm font-bold text-gray-900">{subject.name}</span>
                              </div>
                            </div>
                          ))}
                          {cls.subjects.length > 3 && (
                            <p className="text-xs text-gray-400 text-center">+{cls.subjects.length - 3} more subjects</p>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => setSelectedClassId(cls.id)}
                          className="flex-1 py-3 rounded-full bg-[#053d26] text-white hover:bg-[#042c1b] transition-colors text-xs font-bold flex items-center justify-center gap-2"
                        >
                          View Class
                        </button>
                        <button
                          onClick={() => handleDeleteClass(cls.id)}
                          className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                          title="Delete Class"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add another class card */}
                  <button
                    onClick={() => { setActiveModal('createClass'); setFormError(''); }}
                    className="bg-gray-50 rounded-2xl sm:rounded-[2rem] p-8 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center min-h-[240px] hover:border-gray-400 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm text-[#b05e1c] mb-4">
                      <Plus className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Add New Class</h3>
                    <p className="text-sm text-gray-500">Create a new class level</p>
                  </button>
                </div>
              ) : (
                /* List View */
                <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {classes.map(cls => (
                      <div key={cls.id} className="flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center gap-4 cursor-pointer animate-in fade-in" onClick={() => setSelectedClassId(cls.id)}>
                          <div className="h-12 w-12 rounded-2xl bg-[#053d26] text-white flex items-center justify-center text-sm font-bold shrink-0">
                            {cls.name.slice(0, 3).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-[#053d26] transition-colors">{cls.name}</div>
                            <div className="text-xs text-gray-500">{cls.arm ? `${cls.arm} • ` : ''}{cls.studentCount ?? 0} students • {cls.subjects?.length ?? 0} subjects</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-[#b2f2bb] text-[#053d26] text-[10px] font-bold uppercase tracking-wider">Active</span>
                          <button
                            onClick={() => setSelectedClassId(cls.id)}
                            className="text-xs font-bold text-[#053d26] hover:underline px-2"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteClass(cls.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1.5"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Create Class Modal */}
      {activeModal === 'createClass' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl sm:rounded-[2rem] w-full max-w-lg p-6 sm:p-8 shadow-2xl relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-bold text-[#053d26] mb-2">Add New Class</h2>
            <p className="text-sm text-gray-500 mb-6">Create a new class level for your school.</p>

            {/* No-session warning */}
            {!currentSession && (
              <div className="mb-6 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
                <strong>Note:</strong> No active academic session found. It&apos;s recommended to{' '}
                <Link href="/dashboard/rollover" className="underline font-bold" onClick={() => setActiveModal(null)}>
                  create a session
                </Link>{' '}
                first, but you can still create a class.
              </div>
            )}

            {/* Session badge */}
            {currentSession && (
              <div className="mb-6 p-3 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <span className="text-sm text-green-800">
                  Session: <strong>{currentSession.name}</strong> (will be auto-linked)
                </span>
              </div>
            )}

            {formError && (
              <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{formError}</div>
            )}

            <form onSubmit={handleCreateClass} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Class Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                  placeholder="e.g. SSS 1, JSS 2, Grade 5"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Arm / Section (optional)</label>
                <input
                  type="text"
                  value={classArm}
                  onChange={(e) => setClassArm(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                  placeholder="e.g. Science, Arts, Gold"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-3 rounded-full border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors" disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : <><Plus className="h-4 w-4" /> Create Class</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Library Modal */}
      {activeModal === 'subjectLibrary' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl sm:rounded-[2rem] w-full max-w-lg p-6 sm:p-8 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button onClick={() => setActiveModal(null)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-bold text-[#053d26] mb-2">Subject Library</h2>
            <p className="text-sm text-gray-500 mb-6">Manage your school&apos;s curriculum subjects.</p>

            {/* Add new subject form */}
            <form onSubmit={handleCreateSubject} className="flex gap-2 mb-6">
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                placeholder="New subject name..."
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting || !subjectName.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#053d26] text-white font-bold text-sm hover:bg-[#042c1b] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
              </button>
            </form>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{formError}</div>
            )}

            {/* Subject list */}
            <div className="overflow-y-auto flex-1 -mx-2 px-2">
              {subjects.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">No subjects yet. Add one above.</div>
              ) : (
                <div className="space-y-2">
                  {subjects.map(subject => (
                    <div key={subject.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                          <BookText className="h-4 w-4 text-[#053d26]" />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{subject.name}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteSubject(subject.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => setActiveModal(null)} className="w-full py-3 rounded-full border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student to Class Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl sm:rounded-[2rem] w-full max-w-lg p-6 sm:p-8 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button onClick={() => setShowAddStudentModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-bold text-[#053d26] mb-2">Add Student to Class</h2>
            <p className="text-sm text-gray-500 mb-6">Assign unassigned students to {currentClass?.name}.</p>

            <div className="relative mb-6">
              <input
                type="text"
                value={studentSearchText}
                onChange={(e) => setStudentSearchText(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                placeholder="Search by student name or admission number..."
              />
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {filteredUnassigned.length === 0 ? (
                <p className="text-center py-8 text-sm text-gray-400">No unassigned students found.</p>
              ) : (
                filteredUnassigned.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-all">
                    <div>
                      <div className="font-bold text-sm text-gray-900">{student.fullName}</div>
                      <div className="text-xs text-gray-500">{student.admissionNumber || 'No Admission No'}</div>
                    </div>
                    <button
                      onClick={() => handleAddStudent(student.id, student.fullName)}
                      className="px-4 py-1.5 rounded-full bg-[#053d26] text-white font-bold text-xs hover:bg-[#042c1b] transition-colors"
                    >
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => setShowAddStudentModal(false)} className="w-full py-3 rounded-full border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Student Modal */}
      {showMoveStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl sm:rounded-[2rem] w-full max-w-lg p-6 sm:p-8 shadow-2xl relative">
            <button onClick={() => setShowMoveStudentModal(null)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-bold text-[#053d26] mb-2">Move Student</h2>
            <p className="text-sm text-gray-500 mb-6">Reassign <strong>{showMoveStudentModal.fullName}</strong> to another class.</p>

            <form onSubmit={handleMoveStudent} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Target Class</label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                  required
                >
                  <option value="">-- Select Class --</option>
                  {classes.filter(c => c.id !== selectedClassId).map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.arm ? `(${c.arm})` : ''}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowMoveStudentModal(null)} className="flex-1 py-3 rounded-full border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors flex items-center justify-center gap-2">
                  <ArrowLeftRight className="h-4 w-4" /> Move Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Subjects Modal */}
      {showAssignSubjectsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl sm:rounded-[2rem] w-full max-w-lg p-6 sm:p-8 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button onClick={() => setShowAssignSubjectsModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-bold text-[#053d26] mb-2">Assign Subjects</h2>
            <p className="text-sm text-gray-500 mb-6">Select subjects to assign to <strong>{currentClass?.name}</strong>.</p>

            <form onSubmit={handleAssignSubjects} className="flex-1 flex flex-col overflow-hidden">
              <div className="overflow-y-auto flex-1 space-y-3 pr-1">
                {subjects.length === 0 ? (
                  <p className="text-center py-8 text-sm text-gray-400">No subjects in library. Please add some first.</p>
                ) : (
                  subjects.map(subject => {
                    const isChecked = selectedSubjectIds.includes(subject.id);
                    return (
                      <label key={subject.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-all cursor-pointer">
                        <span className="font-bold text-sm text-gray-900">{subject.name}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubjectIds(prev => [...prev, subject.id]);
                            } else {
                              setSelectedSubjectIds(prev => prev.filter(id => id !== subject.id));
                            }
                          }}
                          className="h-5 w-5 rounded text-[#053d26] focus:ring-[#053d26] accent-[#053d26]"
                        />
                      </label>
                    );
                  })
                )}
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setShowAssignSubjectsModal(false)} className="flex-1 py-3 rounded-full border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors">
                  Save Assignments
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Assign Form Teacher Modal */}
      {showAssignFormTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowAssignFormTeacherModal(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold text-[#053d26] mb-2">Assign Form Teacher</h2>
            <p className="text-sm text-gray-500 mb-8">Assign a form teacher to {showAssignFormTeacherModal.name}</p>

            <form onSubmit={handleAssignFormTeacher} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teacher</label>
                <select
                  value={formTeacherId}
                  onChange={(e) => setFormTeacherId(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                  required
                >
                  <option value="">Select a Teacher</option>
                  {allTeachers.map(t => (
                    <option key={t.id} value={t.id}>{t.fullName}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAssignFormTeacherModal(null)}
                  className="flex-1 py-3 rounded-full border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Assign
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
