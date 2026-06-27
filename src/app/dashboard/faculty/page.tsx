"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { UserPlus, X, Loader2, AlertCircle, Calendar, BookOpen, Clock, Users, ArrowRight, ArrowLeft, CheckCircle2, ChevronRight, Award, TrendingUp, Plus, ClipboardList, CheckSquare, FileText, Sparkles, BookText, Megaphone, MoreVertical } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { teacherApi, Teacher, CreateTeacherRequest, classApi, subjectApi, dashboardApi, announcementApi, teacherPortalApi, attendanceApi } from '@/lib/api';
import toast from 'react-hot-toast';
export function FacultyDirectory() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

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
  const [activeTeacher, setActiveTeacher] = useState<Teacher | null>(null);

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
      let profilePictureUrl = undefined;
      if (imageFile) {
        const formPayload = new FormData();
        formPayload.append('file', imageFile);
        formPayload.append('upload_preset', 'leoned_uploads');
        formPayload.append('cloud_name', 'dvjy4jjxf');

        const uploadRes = await fetch('https://api.cloudinary.com/v1_1/dvjy4jjxf/image/upload', {
          method: 'POST',
          body: formPayload,
        });

        if (uploadRes.ok) {
          const data = await uploadRes.json();
          profilePictureUrl = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
        } else {
          console.error("Cloudinary upload failed", await uploadRes.text());
        }
      }

      const teacher = await teacherApi.create({
        ...formData,
        ...(profilePictureUrl ? { profilePictureUrl } : {})
      });
      toast.success("Teacher created successfully!");
      setShowModal(false);
      setFormData({ fullName: '', email: '', phone: '', password: '' });
      setImageFile(null);
      // Refresh the list
      await fetchTeachers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create teacher";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Columns removed in favor of list view

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

          {/* List Wrapper */}
          <div className="grid grid-cols-1 gap-2 p-4">
            {teachers.map((teacher) => {
              const teacherFormClasses = classesList.filter(c => {
                const tId = c.formTeacherId || c.formTeacher?.id || c.formTeacher?._id;
                return tId === teacher.id;
              });
              
              return (
                <div 
                  key={teacher.id}
                  onClick={() => setActiveTeacher(teacher)}
                  className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md hover:bg-green-50/30 transition-all cursor-pointer bg-white gap-4 md:gap-0"
                >
                  <div className="flex items-center gap-4">
                    {teacher.imageUrl || teacher.image ? (
                      <img 
                        src={teacher.imageUrl || teacher.image} 
                        alt={teacher.fullName} 
                        className="h-12 w-12 rounded-full object-cover border border-gray-100 shadow-sm"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-[#053d26] text-white font-bold flex items-center justify-center text-sm shadow-inner group-hover:bg-[#042c1b] transition-colors shrink-0">
                        {teacher.fullName ? teacher.fullName.split(' ').filter(Boolean).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : 'T'}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-gray-900 text-base leading-tight group-hover:text-[#053d26] transition-colors">{teacher.fullName || 'Unnamed Teacher'}</div>
                      <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2">
                        <span>{teacher.email}</span>
                        {teacherFormClasses.length > 0 && (
                          <>
                            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-gray-300"></span>
                            <span className="text-[#b05e1c] font-bold">Form Teacher ({teacherFormClasses.map(c => c.name).join(', ')})</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 justify-between md:justify-end">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${
                      teacher.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${teacher.isActive ? 'bg-green-600' : 'bg-orange-500'}`}></span>
                      {teacher.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTeacher(teacher);
                      }}
                      className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
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
                      setImageFile(file);
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
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
                if (activeTeacher && activeTeacher.id === assignModal.teacherId) {
                  const updatedTeacher = await teacherApi.getAll().then(res => res.find((t: any) => t.id === activeTeacher.id));
                  if (updatedTeacher) setActiveTeacher(updatedTeacher as Teacher);
                }
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

      {/* Slide-over Detail Panel */}
      {activeTeacher && (
        <div className="fixed inset-0 z-50 overflow-hidden flex">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setActiveTeacher(null)}></div>
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Teacher Profile</h2>
              <button onClick={() => setActiveTeacher(null)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                {activeTeacher.imageUrl || activeTeacher.image ? (
                  <img src={activeTeacher.imageUrl || activeTeacher.image} className="w-20 h-20 rounded-full object-cover shadow-sm" alt="Teacher" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#053d26] text-white flex items-center justify-center text-2xl font-bold shadow-inner">
                     {activeTeacher.fullName ? activeTeacher.fullName.split(' ').filter(Boolean).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : 'T'}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{activeTeacher.fullName}</h3>
                  <p className="text-sm text-gray-500 font-medium">Faculty Member</p>
                  <div className="mt-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                      activeTeacher.isActive ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${activeTeacher.isActive ? 'bg-green-600' : 'bg-orange-500'}`}></span>
                      {activeTeacher.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</span>
                  <span className="text-sm font-semibold text-gray-700">{activeTeacher.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</span>
                  <span className="text-sm font-semibold text-gray-700">{activeTeacher.phone || 'N/A'}</span>
                </div>
              </div>

              {/* Form Class Assignments */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#b05e1c]" /> Form Class Responsibilities
                </h4>
                <div className="space-y-2">
                  {classesList.filter(c => {
                    const tId = c.formTeacherId || c.formTeacher?.id || c.formTeacher?._id;
                    return tId === activeTeacher.id;
                  }).length > 0 ? (
                    classesList.filter(c => {
                      const tId = c.formTeacherId || c.formTeacher?.id || c.formTeacher?._id;
                      return tId === activeTeacher.id;
                    }).map(c => (
                      <div key={c.id || c._id} className="flex items-center justify-between p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                         <span className="font-bold text-[#b05e1c] text-sm">{c.name}</span>
                         <span className="text-[10px] font-bold text-orange-600/70 uppercase tracking-wider bg-orange-100 px-2 py-0.5 rounded-md">Form Teacher</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl text-center border border-dashed border-gray-200">No form class assigned</div>
                  )}
                </div>
              </div>

              {/* Subject Assignments */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#053d26]" /> Subject Assignments
                  </h4>
                  <button 
                    onClick={() => { setAssignModal({ isOpen: true, teacherId: activeTeacher.id, teacherName: activeTeacher.fullName || 'Teacher' }); }}
                    className="text-xs font-bold text-[#053d26] hover:text-[#042c1b] bg-green-50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Assign Subject
                  </button>
                </div>
                <div className="space-y-2">
                  {activeTeacher.assignments && activeTeacher.assignments.length > 0 ? (
                    activeTeacher.assignments.map(a => (
                      <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-green-50/30 border border-green-100 group/assignment transition-colors hover:bg-green-50/60">
                        <div>
                          <p className="font-bold text-[#053d26] text-sm">{a.subjectName}</p>
                          <p className="text-xs text-[#053d26]/70 font-bold tracking-wide uppercase mt-0.5">{a.className}</p>
                        </div>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm(`Remove assignment: ${a.className} - ${a.subjectName}?`)) {
                              try {
                                await teacherApi.removeAssignment(a.id);
                                toast.success("Assignment removed successfully");
                                const updatedTeacher = { ...activeTeacher, assignments: activeTeacher.assignments?.filter(asg => asg.id !== a.id) };
                                setActiveTeacher(updatedTeacher as Teacher);
                                fetchTeachers();
                              } catch (err) {
                                toast.error(err instanceof Error ? err.message : "Failed to remove assignment");
                              }
                            }
                          }}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover/assignment:opacity-100"
                          title="Remove Assignment"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl text-center border border-dashed border-gray-200">No subjects assigned</div>
                  )}
                </div>
              </div>

            </div>
            
            {/* Actions Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
               <button
                  onClick={async () => {
                    if (window.confirm(`Are you sure you want to ${activeTeacher.isActive ? 'deactivate' : 'activate'} this teacher?`)) {
                      try {
                        await teacherApi.updateStatus(activeTeacher.id, !activeTeacher.isActive);
                        await fetchTeachers();
                        setActiveTeacher(null);
                        toast.success(`Status updated for ${activeTeacher.fullName || 'teacher'}`);
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Failed to update status");
                      }
                    }
                  }}
                  className={`w-full py-3.5 rounded-xl font-bold transition-all ${
                    activeTeacher.isActive
                      ? 'bg-white text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 shadow-sm'
                      : 'bg-[#053d26] text-white hover:bg-[#042c1b] shadow-md'
                  }`}
                >
                  {activeTeacher.isActive ? 'Deactivate Account' : 'Activate Account'}
                </button>
            </div>
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
  const [formClasses, setFormClasses] = useState<any[]>([]);

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
        let localStats: any = null;
        try {
          localStats = await dashboardApi.getTeacherDashboard();
          console.log("[FacultyHomepage DEBUG] Teacher stats:", JSON.stringify(localStats, null, 2));
          if (localStats.assignments) {
            assignments = (localStats.assignments as any[]).map((a: any) => {
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
          if (localStats.formClass) {
            formClass = localStats.formClass;
          }
        } catch (e) {
          console.error("Failed to fetch teacher dashboard stats", e);
        }

        let allClasses: any[] = [];
        try {
          // Fetch classes via teacher portal — returns {classId, className, arm, studentCount, subjects}
          const classesRes = await teacherPortalApi.getClasses();
          allClasses = Array.isArray(classesRes) ? classesRes : ((classesRes as any)?.data || (classesRes as any)?.items || []);
          const userId = user.id || user._id || user.teacher?.id || user.teacher?._id;
          
          let myFormClasses: any[] = [];
          
          // Use the dedicated backend endpoint for form classes
          try {
            const formClassesRes = await attendanceApi.getMyFormClasses();
            const unwrapped = Array.isArray(formClassesRes) ? formClassesRes : ((formClassesRes as any).data || (formClassesRes as any).items || (formClassesRes as any).classes || (formClassesRes as any).formClasses || []);
            myFormClasses = Array.isArray(unwrapped) ? unwrapped : [];
            
            // Map the objects correctly if they return classId instead of id
            myFormClasses = myFormClasses.map(fc => ({
              ...fc,
              id: fc.id || fc.classId || fc._id,
              name: fc.name || fc.className || "Class"
            }));
            
          } catch (e) {
            console.error("Failed to fetch my form classes from attendance API", e);
            // Fallback to localStats
            if (localStats?.formClasses && Array.isArray(localStats.formClasses)) {
               myFormClasses = localStats.formClasses;
            } else if (localStats?.formClass && typeof localStats.formClass === 'object' && Object.keys(localStats.formClass).length > 0) {
               myFormClasses = [localStats.formClass];
            }
          }
          
          // Absolute fallback if the backend API returns empty due to User/Teacher ID linkage bug
          if (myFormClasses.length === 0 && userId) {
            // Fallback: Probe the attendance endpoint. The backend restricts GET /attendance/class/{classId} to the form teacher!
            if (myFormClasses.length === 0) {
              const today = new Date().toISOString().split('T')[0];
              for (const cls of allClasses) {
                const cId = cls.classId || cls.id || cls._id;
                if (!cId) continue;
                try {
                  await attendanceApi.getClassAttendance(cId, today);
                  myFormClasses.push({ ...cls, classId: cId, className: cls.className || cls.name });
                } catch (e: any) {
                  const errorMsg = e instanceof Error ? e.message : String(e);
                  // If it's a 404, it just means no attendance record exists for today, BUT we were allowed to check!
                  // A strict 403 Forbidden means we are NOT the form teacher.
                  if (!errorMsg.includes('403')) {
                     myFormClasses.push({ ...cls, classId: cId, className: cls.className || cls.name });
                  }
                }
              }
            }
          }
          
          setFormClasses(myFormClasses);
        } catch (e) {
          console.error("Failed to fetch teacher classes", e);
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
          const cls = allClasses.find(c => (c.id || c.classId) === a.classId || c._id === a.classId);
          return sum + (cls?.studentCount || 0);
        }, 0);

        const classesNames = assignments.map(a => a.className || allClasses.find(c => (c.id || c.classId) === a.classId || c._id === a.classId)?.name || allClasses.find(c => c.classId === a.classId)?.className).filter(Boolean);
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
          const c = asm.class || allClasses.find(cls => (cls.id || cls.classId) === asm.classId || cls._id === asm.classId) || {};
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#053d26] uppercase tracking-wider mb-1">{currentDate}</p>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">Welcome, {teacherName}</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your classes, view schedules, and enter student results.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-full border border-gray-200 shadow-sm shrink-0">
          {teacherImage ? (
            <img 
              src={teacherImage} 
              alt={teacherName} 
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-[#053d26] text-white font-bold flex items-center justify-center text-sm shadow-inner">
              {teacherInitials}
            </div>
          )}
          <div className="pr-2">
            <p className="font-bold text-sm text-gray-900">{teacherName}</p>
            <p className="text-xs text-gray-500 font-medium">Faculty Member</p>
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
              {/* Form Class Indicators */}
              {formClasses && formClasses.length > 0 && formClasses.map((fc, index) => (
                <div key={fc.classId || fc.id || fc._id || index} className="group relative overflow-hidden bg-gradient-to-br from-[#053d26] to-[#042c1b] p-6 rounded-3xl flex items-center justify-between transition-all duration-500 hover:shadow-lg hover:shadow-[#053d26]/20 mb-4">
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
                        Class: {fc.className || fc.name || "Assigned Class"} {fc.arm ? `(${fc.arm})` : ''}
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard/faculty/attendance" className="relative z-10 bg-white text-[#053d26] hover:bg-green-50 px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition-colors flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Mark Attendance
                  </Link>
                </div>
              ))}

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
