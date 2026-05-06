"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Plus, BookOpen, Settings, MoreVertical, Edit2, ChevronRight, Calculator, BookText, Banknote, X, Loader2, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { classApi, subjectApi, sessionApi, SchoolClass, Subject, AcademicSession, CreateClassRequest, CreateSubjectRequest } from '@/lib/api';
import Link from 'next/link';

type ModalType = 'createClass' | 'subjectLibrary' | null;

export default function AcademicFlow() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentSession, setCurrentSession] = useState<AcademicSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Create Class form
  const [className, setClassName] = useState('');
  const [classArm, setClassArm] = useState('');

  // Create Subject form
  const [subjectName, setSubjectName] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [classData, subjectData, sessionData] = await Promise.all([
        classApi.getAll(),
        subjectApi.getAll(),
        sessionApi.getAll().catch(() => []),
      ]);
      const classItems = Array.isArray(classData) ? classData : [];
      const subjectItems = Array.isArray(subjectData) ? subjectData : [];
      setClasses(classItems);
      setSubjects(subjectItems);

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
      
      console.log('[Create Class] Sending payload:', JSON.stringify(payload));
      await classApi.create(payload);
      
      // Success — close modal, reset form, refresh
      setActiveModal(null);
      setClassName('');
      setClassArm('');
      setSuccessMsg(`Class "${payload.name}" created successfully!`);
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create class";
      console.error('[Create Class] Error:', msg);
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
      alert(err instanceof Error ? err.message : "Failed to delete subject");
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    try {
      await classApi.delete(id);
      setClasses(prev => prev.filter(c => c.id !== id));
      setSuccessMsg("Class deleted successfully.");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete class");
    }
  };

  const totalStudents = classes.reduce((acc, c) => acc + (c.studentCount || 0), 0);

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
                      onClick={() => handleDeleteClass(cls.id)}
                      className="flex-1 py-3 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-600 transition-colors text-xs font-bold text-gray-900 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                    <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors shrink-0">
                      <MoreVertical className="w-5 h-5" />
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
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-[#053d26] text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {cls.name.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{cls.name}</div>
                        <div className="text-xs text-gray-500">{cls.arm ? `${cls.arm} • ` : ''}{cls.studentCount ?? 0} students • {cls.subjects?.length ?? 0} subjects</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-[#b2f2bb] text-[#053d26] text-[10px] font-bold uppercase tracking-wider">Active</span>
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
    </div>
  );
}
