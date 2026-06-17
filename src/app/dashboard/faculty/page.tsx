"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { UserPlus, X, Loader2, AlertCircle, Calendar, BookOpen, Clock, Users, ArrowRight, ArrowLeft, CheckCircle2, ChevronRight, Award, TrendingUp, Plus, ClipboardList, CheckSquare, FileText, Sparkles, BookText, Megaphone } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { teacherApi, Teacher, CreateTeacherRequest, classApi, subjectApi, dashboardApi, announcementApi } from '@/lib/api';
import toast from 'react-hot-toast';
export function FacultyDirectory() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState<CreateTeacherRequest>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });

  const [assignModal, setAssignModal] = useState<{isOpen: boolean, teacherId: string, teacherName: string}>({isOpen: false, teacherId: '', teacherName: ''});
  const [assignData, setAssignData] = useState({ classId: '', subjectId: '' });
  const [classesList, setClassesList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);

  useEffect(() => {
    // Fetch classes and subjects for assignment
    const loadAssignData = async () => {
      try {
        const [cls, subs] = await Promise.all([
          classApi.getAll(),
          subjectApi.getAll()
        ]);
        setClassesList(Array.isArray(cls) ? cls : []);
        setSubjectsList(Array.isArray(subs) ? subs : []);
      } catch (e) {
        console.error("Failed to load assignment data", e);
      }
    };
    loadAssignData();
  }, []);

  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await teacherApi.getAll();
      const validItems = Array.isArray(data) ? data : [];
      setTeachers(validItems);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load teachers";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    fetchTeachers();
  }, [fetchTeachers]);

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password?.trim()) {
      setFormError("Full name, email, and password are required.");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const teacher = await teacherApi.create(formData);
      if (formData.imageFile && teacher && teacher.id) {
        try {
          const base64String = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              if (reader.result) resolve(reader.result as string);
              else reject(new Error("Failed to read file"));
            };
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsDataURL(formData.imageFile as File);
          });
          await teacherApi.update(teacher.id, { profilePictureUrl: base64String });
        } catch (imgErr) {
          console.error("Failed to upload teacher image:", imgErr);
          toast.error("Teacher created, but image upload failed.");
        }
      }
      setShowModal(false);
      setFormData({ fullName: '', email: '', phone: '', password: '' });
      // Refresh the list
      await fetchTeachers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create teacher";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Teacher>[] = [
    {
      header: 'Teacher',
      accessor: (teacher) => (
        <div className="flex items-center gap-4">
          {teacher.imageUrl || teacher.image ? (
            <img 
              src={teacher.imageUrl || teacher.image} 
              alt={teacher.fullName} 
              className="h-12 w-12 rounded-full object-cover border border-gray-100 shadow-sm"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-[#053d26] text-white font-bold flex items-center justify-center text-sm shadow-inner">
              {teacher.fullName ? teacher.fullName.split(' ').filter(Boolean).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : 'T'}
            </div>
          )}
          <div>
            <div className="font-bold text-gray-900 text-sm leading-tight">{teacher.fullName || 'Unnamed Teacher'}</div>
            <div className="text-xs text-gray-500 mt-1">{teacher.email || 'No email'}</div>
          </div>
        </div>
      ),
      className: 'w-1/4'
    },
    {
      header: 'Contact Info',
      accessor: (teacher) => (
        <div>
          <div className="text-sm font-semibold text-gray-700">{teacher.email}</div>
          <div className="text-xs text-gray-500 mt-0.5">{teacher.phone || 'No phone'}</div>
        </div>
      ),
      className: 'w-1/5'
    },
    {
      header: 'Assignments',
      accessor: (teacher) => {
        const assigns = teacher.assignments || [];
        if (assigns.length === 0) return <span className="text-gray-400 text-xs italic font-medium">Unassigned</span>;
        return (
          <div className="flex flex-wrap gap-1 max-w-[250px]">
            {assigns.map((a, idx) => (
              <span key={a.id || idx} className="inline-flex items-center gap-1 rounded bg-[#053d26]/10 px-2 py-0.5 text-[10px] font-bold text-[#053d26]">
                {a.className || 'Class'}: {a.subjectName || 'Subject'}
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm(`Remove assignment: ${a.className || 'Class'} - ${a.subjectName || 'Subject'}?`)) {
                      try {
                        await teacherApi.removeAssignment(a.id);
                        toast.success("Assignment removed successfully");
                        fetchTeachers();
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Failed to remove assignment");
                      }
                    }
                  }}
                  className="text-red-500 hover:text-red-700 ml-1 font-bold text-[11px] leading-none"
                  title="Remove Assignment"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        );
      },
      className: 'w-1/3'
    },
    {
      header: 'Status',
      accessor: (teacher) => (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${
          teacher.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-orange-100 text-orange-800'
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${teacher.isActive ? 'bg-green-600' : 'bg-orange-500'}`}></span>
          {teacher.isActive ? 'ACTIVE' : 'INACTIVE'}
        </span>
      ),
      className: 'w-1/6'
    },
  ];

  const activeCount = teachers.filter(t => t.isActive).length;
  const inactiveCount = teachers.filter(t => !t.isActive).length;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-10">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold text-[#053d26] mb-3">Staff Directory</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Manage your intellectual capital. Coordinate teacher assignments, track performance indicators, and maintain pedagogical standards across all departments.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors shadow-sm shrink-0"
        >
          <UserPlus className="h-5 w-5" />
          Add New Teacher
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Total Teachers</p>
          <div className="text-5xl font-bold text-[#053d26] mb-2">{teachers.length}</div>
          <p className="text-xs text-[#20c997] font-semibold">All registered teachers</p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Active Now</p>
          <div className="text-5xl font-bold text-[#053d26] mb-4">{activeCount}</div>
          <div className="flex gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#20c997]"></span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#20c997]/80"></span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#20c997]/50"></span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#20c997]/20"></span>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Inactive</p>
          <div className="text-5xl font-bold text-[#b05e1c] mb-2">{inactiveCount}</div>
          <p className="text-xs text-gray-500 font-semibold">Currently inactive</p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Displayed</p>
          <div className="text-5xl font-bold text-[#053d26] mb-2">{teachers.length}</div>
          <p className="text-xs text-gray-500">Currently showing</p>
        </div>
      </div>

      {/* Directory Section */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#053d26]" />
          <span className="ml-3 text-gray-500 font-medium">Loading teachers...</span>
        </div>
      ) : error ? (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to load teachers</h3>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button
            onClick={fetchTeachers}
            className="px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors"
          >
            Retry
          </button>
        </div>
      ) : teachers.length === 0 ? (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No teachers yet</h3>
          <p className="text-sm text-gray-500 mb-6">Add your first teacher to get started.</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors"
          >
            Add New Teacher
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-2">
          {/* Filters Header */}
          <div className="flex flex-col md:flex-row justify-between items-center p-6 border-b border-gray-50 gap-4">
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <select className="bg-gray-100 rounded-full px-4 py-2 text-xs font-bold text-gray-600 focus:outline-none appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%234B5563%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:8px_8px] bg-[right_12px_center]">
                <option>Status: All</option>
              </select>
              <select className="bg-gray-100 rounded-full px-4 py-2 text-xs font-bold text-gray-600 focus:outline-none appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%234B5563%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:8px_8px] bg-[right_12px_center]">
                <option>Sort: Name (A-Z)</option>
              </select>
            </div>
            <div className="text-xs text-gray-500 font-medium">
              Showing {teachers.length} Educators
            </div>
          </div>

          {/* Table Wrapper */}
          <div className="[&>div]:border-none [&>div]:shadow-none [&_table]:w-full">
            <DataTable 
              columns={columns} 
              data={teachers} 
              actions={(teacher) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => setAssignModal({ isOpen: true, teacherId: teacher.id, teacherName: teacher.fullName || 'Teacher' })}
                    className="px-3 py-1.5 rounded-full text-[10px] font-bold transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    Assign
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await teacherApi.updateStatus(teacher.id);
                        await fetchTeachers();
                        toast.success(`Status updated for ${teacher.fullName || 'teacher'}`);
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Failed to update status");
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-colors ${
                      teacher.isActive
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        : 'bg-green-100 text-[#053d26] hover:bg-green-200'
                    }`}
                  >
                    {teacher.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              )}
            />
          </div>

          <div className="flex justify-between items-center p-6 border-t border-gray-50">
            <span className="text-xs text-gray-500">Showing {teachers.length} educators</span>
          </div>
        </div>
      )}

      {/* Setup Navigation Pointers (Eye-level) */}
      <div className="mt-6 flex justify-between items-center bg-white rounded-3xl p-4 sm:p-6 border border-gray-100 shadow-sm">
        <Link href="/dashboard/classes" className="flex items-center gap-2 text-gray-500 hover:text-[#053d26] font-semibold text-sm transition-colors px-4 py-2 rounded-xl hover:bg-gray-50">
          <ArrowLeft className="w-4 h-4" /> Previous Step: Classes
        </Link>
        <Link href="/dashboard/students" className="flex items-center gap-2 px-6 py-3 bg-[#053d26] text-white rounded-2xl font-bold text-sm hover:bg-[#042f1d] transition-colors shadow-sm">
          Next Step: Students <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Create Teacher Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => { setShowModal(false); setFormError(""); }}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-bold text-[#053d26] mb-2">Add New Teacher</h2>
            <p className="text-sm text-gray-500 mb-8">Fill in the details to register a new teacher.</p>

            {formError && (
              <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateTeacher} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Profile Photo (Optional)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, imageFile: file });
                    }
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#053d26] file:text-white hover:file:bg-[#042c1b] transition-colors"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                  placeholder="e.g. Dr. Aisha Johnson"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  autoComplete="off"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                  placeholder="teacher@school.edu.ng"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  autoComplete="off"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                  placeholder="+234 801 234 5678"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                  placeholder="Min 6 characters"
                  disabled={isSubmitting}
                />
              </div>



              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setFormError(""); }}
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
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Create Teacher
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {assignModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setAssignModal({isOpen: false, teacherId: '', teacherName: ''})}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-bold text-[#053d26] mb-2">Assign Teacher</h2>
            <p className="text-sm text-gray-500 mb-8">Assign {assignModal.teacherName} to a class and subject.</p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await teacherApi.assign(assignModal.teacherId, assignData);
                setAssignModal({isOpen: false, teacherId: '', teacherName: ''});
                toast.success("Teacher assigned successfully!");
                fetchTeachers();
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to assign teacher");
              }
            }} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Class</label>
                <select
                  value={assignData.classId}
                  onChange={(e) => setAssignData({ ...assignData, classId: e.target.value })}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                  required
                >
                  <option value="">Select a Class</option>
                  {classesList.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.arm ? `(${c.arm})` : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
                <select
                  value={assignData.subjectId}
                  onChange={(e) => setAssignData({ ...assignData, subjectId: e.target.value })}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                  required
                >
                  <option value="">Select a Subject</option>
                  {subjectsList.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors flex items-center justify-center gap-2"
                >
                  Assign Subject & Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// Faculty Homepage Component (Dr. Elena)
// ==========================================

export function FacultyHomepage() {
  const [currentDate, setCurrentDate] = useState("");
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacherName, setTeacherName] = useState("");
  const [teacherInitials, setTeacherInitials] = useState("");
  const [stats, setStats] = useState<any[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<any[]>([]);
  const [teacherImage, setTeacherImage] = useState<string | null>(null);
  const [formClass, setFormClass] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('en-US', options));

    const loadData = async () => {
      setLoading(true);
      try {
        const userStr = localStorage.getItem("leoned_user");
        if (!userStr) return;
        const user = JSON.parse(userStr);
        setTeacherName(user.name || "Teacher");
        const initials = (user.name || "Teacher")
          .split(" ")
          .filter(Boolean)
          .map((w: string) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        setTeacherInitials(initials);

        let assignments: any[] = [];
        let formClass: any = null;
        try {
          const stats = await dashboardApi.getTeacherDashboard();
          if (stats.assignments) {
            assignments = (stats.assignments as any[]).map((a: any) => {
              const classObj = a.class || {};
              const subjectObj = a.subject || {};
              return {
                ...a,
                id: a.id || a._id,
                classId: a.classId || classObj.id || classObj._id,
                className: a.className || classObj.name,
                subjectId: a.subjectId || subjectObj.id || subjectObj._id,
                subjectName: a.subjectName || subjectObj.name,
                studentCount: a.studentCount || classObj.studentCount || 0
              };
            });
          }
          if (stats.formClass) {
            formClass = stats.formClass;
            setFormClass(formClass);
          }
        } catch (e) {
          console.error("Failed to fetch teacher dashboard stats", e);
        }

        let allClasses: any[] = [];
        try {
          allClasses = await classApi.getAll();
        } catch (e) {
          console.error("Failed to fetch all classes", e);
        }

        // Fetch dashboard statistics
        let dashboardStats: any = {};
        try {
          dashboardStats = await dashboardApi.getTeacherDashboard();
        } catch (e) {
          console.error("Failed to fetch teacher dashboard stats", e);
        }

        // Fetch announcements
        try {
          const list = await announcementApi.getAll({ pageSize: 2 });
          setAnnouncements(list);
        } catch (e) {
          console.error("Failed to load announcements", e);
        }

        // Calculate stats
        const validClassIds = assignments.map(a => a.classId).filter(Boolean);
        const uniqueClassIds = Array.from(new Set(validClassIds));
        const assignedClassesCount = uniqueClassIds.length;
        
        const totalStudentsCount = assignments.reduce((sum, a) => {
          // Use pre-populated studentCount if available, otherwise check allClasses
          if (a.studentCount) return sum + a.studentCount;
          const cls = allClasses.find(c => c.id === a.classId || c._id === a.classId);
          return sum + (cls?.studentCount || 0);
        }, 0);

        const classesNames = assignments.map(a => a.className || allClasses.find(c => c.id === a.classId || c._id === a.classId)?.name).filter(Boolean);
        const uniqueClassesNames = Array.from(new Set(classesNames)).slice(0, 3).join(", ");

        const computedStats = [
          { 
            title: "Assigned Classes", 
            value: String(assignedClassesCount), 
            desc: uniqueClassesNames || "No assigned classes", 
            icon: BookOpen
          },
          { 
            title: "Students Taught", 
            value: String(totalStudentsCount), 
            desc: "Across all class arms", 
            icon: Users
          }
        ];
        setStats(computedStats);

        const subjectsWithDetails = assignments.map(asm => {
          const c = asm.class || allClasses.find(cls => cls.id === asm.classId || cls._id === asm.classId) || {};
          const s = asm.subject || {};
          return {
            id: asm.id || asm._id,
            subject: asm.subjectName || s.name || "Subject",
            className: asm.className || c.name || "Class",
            arm: c.arm || "",
            studentCount: asm.studentCount || c.studentCount || 0
          };
        });
        setAssignedSubjects(subjectsWithDetails);

      } catch (err) {
        console.error("Error loading faculty dashboard", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#053d26]" />
        <span className="ml-3 text-gray-500 font-medium">Loading teacher workspace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="relative rounded-[2rem] bg-[#053d26] text-white p-8 sm:p-10 overflow-hidden shadow-lg border border-[#042c1b]">
        <div className="absolute right-0 top-0 opacity-10 translate-x-12 -translate-y-12">
          <Award className="w-64 h-64" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-green-300">{currentDate}</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">Welcome Back, {teacherName}</h1>
            <p className="text-sm text-green-100 max-w-xl">
              Teacher Portal • Academic Architect. View your schedules, manage classes, and enter grades below.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
            {teacherImage ? (
              <img 
                src={teacherImage} 
                alt={teacherName} 
                className="h-12 w-12 rounded-full object-cover border border-white/25 shadow-sm"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-[#b05e1c] text-white font-bold flex items-center justify-center text-lg shadow-inner">
                {teacherInitials}
              </div>
            )}
            <div>
              <p className="font-bold text-sm">{teacherName}</p>
              <p className="text-xs text-green-200">Faculty Member</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {stats.map((stat, i) => {
          const bgGradients = [
            "from-emerald-500/10 to-teal-500/10 border-emerald-500/20",
            "from-orange-500/10 to-amber-500/10 border-orange-500/20"
          ];
          const iconColors = [
            "bg-emerald-500 text-white shadow-emerald-200",
            "bg-orange-500 text-white shadow-orange-200"
          ];
          const bgGrad = bgGradients[i % bgGradients.length];
          const iconColor = iconColors[i % iconColors.length];
          return (
            <div key={i} className={`relative overflow-hidden bg-gradient-to-br ${bgGrad} rounded-3xl p-6 shadow-sm border transition-all hover:shadow-md hover:scale-[1.02] flex items-start gap-4 group`}>
              <div className="absolute -right-6 -top-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <stat.icon className="w-32 h-32" />
              </div>
              <div className={`p-4 rounded-2xl shrink-0 shadow-lg ${iconColor}`}>
                <stat.icon className="h-7 w-7" />
              </div>
              <div className="space-y-1 relative z-10 pt-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">{stat.title}</p>
                <p className="text-3xl font-black text-gray-900 leading-none tracking-tight">{stat.value}</p>
                <p className="text-xs text-gray-600 font-medium pt-1">{stat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Assigned Subjects & Workload */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BookText className="h-5 w-5 text-[#053d26]" />
                Your Workload
              </h2>
              <span className="text-xs font-bold text-[#b05e1c] bg-[#b05e1c]/10 px-3 py-1 rounded-full">Academic Responsibilities</span>
            </div>
            
            <div className="space-y-6">
              {/* Form Class Indicator */}
              {formClass && (
                <div className="group relative overflow-hidden bg-gradient-to-br from-[#053d26] to-[#042c1b] p-6 rounded-3xl flex items-center justify-between transition-all duration-500 hover:shadow-lg hover:shadow-[#053d26]/20">
                  <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700">
                    <Award className="h-24 w-24 text-white" />
                  </div>
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl text-white shadow-inner">
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-lg tracking-wide">Form Teacher</h4>
                      <p className="text-green-100 font-medium text-sm flex items-center gap-2 mt-1">
                        Class: {formClass.name || "Assigned Class"} {formClass.arm ? `(${formClass.arm})` : ''}
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard/faculty/attendance" className="relative z-10 bg-white text-[#053d26] hover:bg-green-50 px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition-colors flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Mark Attendance
                  </Link>
                </div>
              )}

              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pt-4">Subject Assignments</h3>
              
              {assignedSubjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {assignedSubjects.map((sub, idx) => (
                    <div key={idx} className="group p-5 rounded-2xl bg-gray-50/50 hover:bg-white border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute -right-4 -top-4 bg-gray-50 p-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                      <div className="space-y-1 relative z-10">
                        <div className="flex justify-between items-start mb-2">
                          <span className="px-2 py-1 bg-white shadow-sm border border-gray-100 text-xs font-bold text-gray-700 rounded-lg">
                            {sub.className}
                          </span>
                          <span className="text-xs font-bold text-[#b05e1c] bg-[#b05e1c]/10 px-2 py-1 rounded-md">
                            {sub.studentCount} Students
                          </span>
                        </div>
                        <h4 className="font-extrabold text-gray-900 text-lg">{sub.subject}</h4>
                      </div>
                      <div className="mt-6 relative z-10">
                        <Link 
                          href={`/dashboard/faculty/result-entry?classId=${sub.id}&subjectId=${sub.id}`}
                          className="flex items-center justify-between w-full text-sm font-bold text-[#053d26] hover:text-[#0a6c4a] transition-colors group/btn"
                        >
                          <span>Manage Grades</span>
                          <ArrowRight className="h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50/50 border border-gray-100 rounded-3xl border-dashed">
                  <BookOpen className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium text-sm">You haven't been assigned to any subjects yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Quick Hub */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#053d26] to-[#b05e1c] rounded-[2rem] p-1">
            <div className="bg-white rounded-[1.8rem] p-6 h-full space-y-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 pb-4">
                <Sparkles className="h-4.5 w-4.5 text-[#b05e1c]" />
                Teacher Hub
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <Link 
                  href="/dashboard/faculty/result-entry" 
                  className="group w-full rounded-2xl bg-gray-50 hover:bg-[#053d26] p-4 text-left flex items-center gap-4 transition-all duration-300 border border-gray-100 hover:border-transparent hover:shadow-lg hover:shadow-[#053d26]/20"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#053d26] shadow-sm group-hover:scale-110 transition-transform">
                    <CheckSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-gray-900 group-hover:text-white transition-colors">Submit Grades</div>
                    <div className="text-[11px] text-gray-500 font-medium group-hover:text-green-100/80 transition-colors mt-0.5">Enter CA and Exam marks</div>
                  </div>
                </Link>

                <Link 
                  href="/dashboard/faculty/classes" 
                  className="group w-full rounded-2xl bg-gray-50 hover:bg-[#b05e1c] p-4 text-left flex items-center gap-4 transition-all duration-300 border border-gray-100 hover:border-transparent hover:shadow-lg hover:shadow-[#b05e1c]/20"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#b05e1c] shadow-sm group-hover:scale-110 transition-transform">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-gray-900 group-hover:text-white transition-colors">Class Rosters</div>
                    <div className="text-[11px] text-gray-500 font-medium group-hover:text-orange-100/80 transition-colors mt-0.5">Review assigned student lists</div>
                  </div>
                </Link>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FacultyPageWrapper() {
  const [demoRole, setDemoRole] = useState<string>("Admin");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("leoned_user");
      try {
        const user = JSON.parse(storedUser || "{}");
        if (user.role === "Teacher" || user.role === "Faculty") {
          setDemoRole("Faculty");
        } else {
          setDemoRole(localStorage.getItem("leoned_demo_role") || "Admin");
        }
      } catch (e) {
        setDemoRole(localStorage.getItem("leoned_demo_role") || "Admin");
      }
      setMounted(true);
    }
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#053d26]" />
      </div>
    );
  }

  if (demoRole === "Faculty") {
    return <FacultyHomepage />;
  }

  return <FacultyDirectory />;
}
