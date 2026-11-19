"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { UserPlus, X, Loader2, AlertCircle, Calendar, BookOpen, Clock, Users, ArrowRight, ArrowLeft, CheckCircle2, ChevronRight, Award, TrendingUp, Plus, ClipboardList, CheckSquare, FileText, Sparkles, BookText, Megaphone, MoreVertical, Wallet, ShieldAlert, CreditCard } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { teacherApi, Teacher, CreateTeacherRequest, UpdateTeacherRequest, classApi, subjectApi, dashboardApi, announcementApi, teacherPortalApi, attendanceApi, bursarApi, resultApi, sessionApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAnnouncementsRefresh } from "@/hooks/useAnnouncementsRefresh";
import TeacherMessages from '@/components/faculty/TeacherMessages';
import { useLanguage, localeFor, interpolate } from "@/components/LanguageProvider";
export function FacultyDirectory() {
  const { t } = useLanguage();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showBursarModal, setShowBursarModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [bursarData, setBursarData] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [confirmBursarPassword, setConfirmBursarPassword] = useState("");

  const [formData, setFormData] = useState<CreateTeacherRequest>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [confirmTeacherPassword, setConfirmTeacherPassword] = useState("");

  const [assignModal, setAssignModal] = useState<{isOpen: boolean, teacherId: string, teacherName: string}>({isOpen: false, teacherId: '', teacherName: ''});
  const [editModal, setEditModal] = useState<{isOpen: boolean, teacher: Teacher | null}>({isOpen: false, teacher: null});
  const [editFormData, setEditFormData] = useState<UpdateTeacherRequest>({
    fullName: '',
    phone: '',
  });
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
      const message = err instanceof Error ? err.message : t("fac.load_failed");
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
      setFormError(t("fac.required"));
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setFormError(t("fac.pw_len"));
      return;
    }

    if (formData.password !== confirmTeacherPassword) {
      setFormError(t("fac.pw_match"));
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
      toast.success(t("fac.created"));
      setShowModal(false);
      setFormData({ fullName: '', email: '', phone: '', password: '' });
      setConfirmTeacherPassword('');
      setImageFile(null);
      // Refresh the list
      await fetchTeachers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("fac.create_failed");
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.teacher) return;
    setFormError("");

    if (!editFormData.fullName?.trim()) {
      setFormError(t("fac.name_required"));
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
        }
      }

      const updated = await teacherApi.update(editModal.teacher.id, {
        ...editFormData,
        ...(profilePictureUrl ? { profilePictureUrl } : {})
      });
      
      toast.success(t("fac.updated"));
      setEditModal({isOpen: false, teacher: null});
      setImageFile(null);
      if (activeTeacher && activeTeacher.id === editModal.teacher.id) {
         setActiveTeacher({ ...activeTeacher, ...updated, ...(profilePictureUrl ? { profilePictureUrl } : {}) });
      }
      await fetchTeachers();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : t("fac.update_failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBursarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (bursarData.password !== confirmBursarPassword) {
      setFormError(t("fac.pw_match"));
      return;
    }
    setIsSubmitting(true);
    try {
      await bursarApi.create(bursarData);
      toast.success(t("fac.bursar_created"));
      setShowBursarModal(false);
      setBursarData({ fullName: '', email: '', phone: '', password: '' });
      setConfirmBursarPassword('');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : t("fac.bursar_failed"));
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
          <h1 className="text-4xl font-bold text-[#053d26] mb-3">{t("fac.title")}</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            {t("fac.subtitle")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors shadow-sm shrink-0"
          >
            <UserPlus className="h-5 w-5" />
            {t("fac.add")}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">{t("fac.total")}</p>
          <div className="text-5xl font-bold text-[#053d26] mb-2">{teachers.length}</div>
          <p className="text-xs text-[#20c997] font-semibold">{t("fac.all_registered")}</p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">{t("fac.active_now")}</p>
          <div className="text-5xl font-bold text-[#053d26] mb-4">{activeCount}</div>
          <div className="flex gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#20c997]"></span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#20c997]/80"></span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#20c997]/50"></span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#20c997]/20"></span>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">{t("fac.inactive")}</p>
          <div className="text-5xl font-bold text-[#b05e1c] mb-2">{inactiveCount}</div>
          <p className="text-xs text-gray-500 font-semibold">{t("fac.currently_inactive")}</p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">{t("fac.displayed")}</p>
          <div className="text-5xl font-bold text-[#053d26] mb-2">{teachers.length}</div>
          <p className="text-xs text-gray-500">{t("fac.currently_showing")}</p>
        </div>
      </div>

      {/* Directory Section */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#053d26]" />
          <span className="ml-3 text-gray-500 font-medium">{t("fac.loading")}</span>
        </div>
      ) : error ? (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">{t("fac.load_failed")}</h3>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button
            onClick={fetchTeachers}
            className="px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors"
          >
            {t("common.retry")}
          </button>
        </div>
      ) : teachers.length === 0 ? (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{t("fac.empty")}</h3>
          <p className="text-sm text-gray-500 mb-6">{t("fac.empty_d")}</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors"
          >
            {t("fac.add")}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-2">
          {/* Filters Header */}
          <div className="flex flex-col md:flex-row justify-between items-center p-6 border-b border-gray-50 gap-4">
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <select className="bg-gray-100 rounded-full px-4 py-2 text-xs font-bold text-gray-600 focus:outline-none appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%234B5563%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:8px_8px] bg-[right_12px_center]">
                <option>{t("stu.status_all")}</option>
              </select>
              <select className="bg-gray-100 rounded-full px-4 py-2 text-xs font-bold text-gray-600 focus:outline-none appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%234B5563%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:8px_8px] bg-[right_12px_center]">
                <option>{t("fac.sort")}</option>
              </select>
            </div>
            <div className="text-xs text-gray-500 font-medium">
              {t("fac.showing", { n: teachers.length })}
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
                    {teacher.profilePictureUrl || teacher.imageUrl || teacher.image ? (
                      <img 
                        src={teacher.profilePictureUrl || teacher.imageUrl || teacher.image} 
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
                      <div className="font-bold text-gray-900 text-base leading-tight group-hover:text-[#053d26] transition-colors">{teacher.fullName || t("fac.unnamed")}</div>
                      <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2">
                        <span>{teacher.email}</span>
                        {teacherFormClasses.length > 0 && (
                          <>
                            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-gray-300"></span>
                            <span className="text-[#b05e1c] font-bold">{t("fac.form_teacher_of", { classes: teacherFormClasses.map(c => c.name).join(', ') })}</span>
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
                      {teacher.isActive ? t("fac.active_up") : t("fac.inactive_up")}
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
            <span className="text-xs text-gray-500">{t("fac.showing", { n: teachers.length })}</span>
          </div>
        </div>
      )}

      {/* Setup Navigation Pointers (Eye-level) */}
      <div className="mt-6 flex justify-between items-center bg-white rounded-3xl p-4 sm:p-6 border border-gray-100 shadow-sm">
        <Link href="/dashboard/classes" className="flex items-center gap-2 text-gray-500 hover:text-[#053d26] font-semibold text-sm transition-colors px-4 py-2 rounded-xl hover:bg-gray-50">
          <ArrowLeft className="w-4 h-4" /> {t("fac.prev")}
        </Link>
        <Link href="/dashboard/students" className="flex items-center gap-2 px-6 py-3 bg-[#053d26] text-white rounded-2xl font-bold text-sm hover:bg-[#042f1d] transition-colors shadow-sm">
          {t("fac.next")} <ArrowRight className="w-4 h-4" />
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

            <h2 className="text-2xl font-bold text-[#053d26] mb-2">{t("fac.add")}</h2>
            <p className="text-sm text-gray-500 mb-8">{t("fac.add_d")}</p>

            {formError && (
              <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateTeacher} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {t("fac.photo")}
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
                  {t("stu.full_name")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                  placeholder={t("fac.name_ph")}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {t("enr.s2.email")} <span className="text-red-500">*</span>
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
                  {t("enr.s2.phone")}
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
                  {t("enr.s4.password")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                  placeholder={t("fac.pw_ph")}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {t("fac.confirm_pw")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmTeacherPassword}
                  onChange={(e) => setConfirmTeacherPassword(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                  placeholder={t("fac.confirm_pw_ph")}
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
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("cls.creating")}
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      {t("fac.create")}
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

            <h2 className="text-2xl font-bold text-[#053d26] mb-2">{t("fac.assign_title")}</h2>
            <p className="text-sm text-gray-500 mb-8">{t("fac.assign_d", { name: assignModal.teacherName })}</p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await teacherApi.assign(assignModal.teacherId, assignData);
                setAssignModal({isOpen: false, teacherId: '', teacherName: ''});
                toast.success(t("fac.assigned"));
                fetchTeachers();
                if (activeTeacher && activeTeacher.id === assignModal.teacherId) {
                  const updatedTeacher = await teacherApi.getAll().then(res => res.find((t: any) => t.id === activeTeacher.id));
                  if (updatedTeacher) setActiveTeacher(updatedTeacher as Teacher);
                }
              } catch (err) {
                toast.error(err instanceof Error ? err.message : t("fac.assign_failed"));
              }
            }} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("stu.class")}</label>
                <select
                  value={assignData.classId}
                  onChange={(e) => setAssignData({ ...assignData, classId: e.target.value })}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                  required
                >
                  <option value="">{t("fac.select_class")}</option>
                  {classesList.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.arm ? `(${c.arm})` : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("fac.subject")}</label>
                <select
                  value={assignData.subjectId}
                  onChange={(e) => setAssignData({ ...assignData, subjectId: e.target.value })}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                  required
                >
                  <option value="">{t("fac.select_subject")}</option>
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
                  {t("fac.assign_btn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Bursar Modal */}
      {showBursarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowBursarModal(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{t("fac.bursar_title")}</h2>
              <button onClick={() => setShowBursarModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {formError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{formError}</p>
              </div>
            )}

            <form onSubmit={handleBursarSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("stu.full_name")}</label>
                <input required type="text" value={bursarData.fullName} onChange={e => setBursarData({...bursarData, fullName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-transparent transition-all" placeholder={t("fac.bursar_name_ph")} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("fac.email")}</label>
                <input required type="email" value={bursarData.email} onChange={e => setBursarData({...bursarData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-transparent transition-all" placeholder="jane@school.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("fac.phone")}</label>
                <input type="tel" value={bursarData.phone} onChange={e => setBursarData({...bursarData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-transparent transition-all" placeholder="+1234567890" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("enr.s4.password")}</label>
                <input required type="password" value={bursarData.password} onChange={e => setBursarData({...bursarData, password: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-transparent transition-all" placeholder={t("fac.pw_ph")} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("fac.confirm_pw")}</label>
                <input required type="password" value={confirmBursarPassword} onChange={e => setConfirmBursarPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-transparent transition-all" placeholder={t("fac.confirm_pw_ph")} />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowBursarModal(false)} className="px-6 py-3 rounded-full text-gray-600 font-bold hover:bg-gray-100 transition-colors">{t("common.cancel")}</button>
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors disabled:opacity-50">
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? t("cls.creating") : t("fac.create_bursar")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {editModal.isOpen && editModal.teacher && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setEditModal({isOpen: false, teacher: null})}></div>
            
            <div className="relative w-full max-w-md transform overflow-hidden rounded-[2rem] bg-white p-8 shadow-2xl transition-all animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-50 text-[#053d26] rounded-xl">
                    <UserPlus className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{t("fac.edit_title")}</h3>
                </div>
                <button
                  onClick={() => setEditModal({isOpen: false, teacher: null})}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-red-800">{formError}</p>
                </div>
              )}

              <form onSubmit={handleUpdateTeacher} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {t("fac.photo")}
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
                    {t("stu.full_name")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                    placeholder={t("fac.name_ph")}
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {t("enr.s2.phone")}
                  </label>
                  <input
                    type="tel"
                    autoComplete="off"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                    placeholder="+234 801 234 5678"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {t("fac.staff_no")}
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={editFormData.staffNumber || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, staffNumber: e.target.value })}
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                    placeholder={t("fac.staff_no_ph")}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">{t("fac.staff_no_note")}</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditModal({isOpen: false, teacher: null})}
                    className="w-full py-3 rounded-full bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                    disabled={isSubmitting}
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> {t("common.saving")}</>
                    ) : (
                      t("common.save_changes")
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Detail Panel */}
      {activeTeacher && (
        <div className="fixed inset-0 z-50 overflow-hidden flex">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setActiveTeacher(null)}></div>
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{t("fac.profile")}</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setEditFormData({ fullName: activeTeacher.fullName, phone: activeTeacher.phone || '', staffNumber: activeTeacher.staffNumber || '' });
                    setEditModal({ isOpen: true, teacher: activeTeacher });
                  }}
                  className="px-4 py-1.5 rounded-full text-xs font-bold text-[#053d26] bg-green-50 hover:bg-green-100 transition-colors"
                >
                  {t("fac.edit_profile")}
                </button>
                <button onClick={() => setActiveTeacher(null)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                {activeTeacher.profilePictureUrl || activeTeacher.imageUrl || activeTeacher.image ? (
                  <img src={activeTeacher.profilePictureUrl || activeTeacher.imageUrl || activeTeacher.image} className="w-20 h-20 rounded-full object-cover shadow-sm" alt={t("cls.th_teacher")} />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#053d26] text-white flex items-center justify-center text-2xl font-bold shadow-inner">
                     {activeTeacher.fullName ? activeTeacher.fullName.split(' ').filter(Boolean).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : 'T'}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{activeTeacher.fullName}</h3>
                  <p className="text-sm text-gray-500 font-medium">{t("fac.faculty_member")}</p>
                  <div className="mt-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                      activeTeacher.isActive ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${activeTeacher.isActive ? 'bg-green-600' : 'bg-orange-500'}`}></span>
                      {activeTeacher.isActive ? t("fac.active_up") : t("fac.inactive_up")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t("fac.email")}</span>
                  <span className="text-sm font-semibold text-gray-700">{activeTeacher.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t("fac.phone")}</span>
                  <span className="text-sm font-semibold text-gray-700">{activeTeacher.phone || t("common.na")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t("fac.staff_id")}</span>
                  <span className="text-sm font-semibold text-gray-700">{activeTeacher.staffNumber || t("fac.staff_id_pending")}</span>
                </div>
              </div>

              {/* Form Class Assignments */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#b05e1c]" /> {t("fac.form_resp")}
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
                         <span className="text-[10px] font-bold text-orange-600/70 uppercase tracking-wider bg-orange-100 px-2 py-0.5 rounded-md">{t("cls.ft")}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl text-center border border-dashed border-gray-200">{t("fac.no_form")}</div>
                  )}
                </div>
              </div>

              {/* Subject Assignments */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#053d26]" /> {t("fac.subj_assign")}
                  </h4>
                  <button 
                    onClick={() => { setAssignModal({ isOpen: true, teacherId: activeTeacher.id, teacherName: activeTeacher.fullName || t("cls.th_teacher") }); }}
                    className="text-xs font-bold text-[#053d26] hover:text-[#042c1b] bg-green-50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> {t("fac.assign_subject")}
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
                            if (window.confirm(t("fac.remove_confirm", { cls: a.className || "", subj: a.subjectName || "" }))) {
                              try {
                                await teacherApi.removeAssignment(a.id);
                                toast.success(t("fac.removed"));
                                const updatedTeacher = { ...activeTeacher, assignments: activeTeacher.assignments?.filter(asg => asg.id !== a.id) };
                                setActiveTeacher(updatedTeacher as Teacher);
                                fetchTeachers();
                              } catch (err) {
                                toast.error(err instanceof Error ? err.message : t("fac.remove_failed"));
                              }
                            }
                          }}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover/assignment:opacity-100"
                          title={t("fac.remove_title")}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl text-center border border-dashed border-gray-200">{t("cls.no_subjects")}</div>
                  )}
                </div>
              </div>

            </div>
            
            {/* Actions Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0 space-y-3">
               <button
                  onClick={async () => {
                    try {
                      const blob = await teacherApi.downloadIdCardPdf(activeTeacher.id);
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Staff-ID-${activeTeacher.staffNumber || activeTeacher.fullName}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);
                      // A number is assigned the first time a card is made, so refresh to show it
                      if (!activeTeacher.staffNumber) await fetchTeachers();
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : t("fac.id_failed"));
                    }
                  }}
                  className="w-full py-3.5 rounded-xl font-bold bg-white text-[#053d26] hover:bg-green-50 border border-[#053d26]/20 shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" /> {t("fac.download_id")}
                </button>
               <button
                  onClick={async () => {
                    if (window.confirm(t(activeTeacher.isActive ? "fac.confirm_deactivate" : "fac.confirm_activate"))) {
                      try {
                        await teacherApi.updateStatus(activeTeacher.id, !activeTeacher.isActive);
                        await fetchTeachers();
                        setActiveTeacher(null);
                        toast.success(t("fac.status_updated", { name: activeTeacher.fullName || t("cls.th_teacher") }));
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : t("fac.status_failed"));
                      }
                    }
                  }}
                  className={`w-full py-3.5 rounded-xl font-bold transition-all ${
                    activeTeacher.isActive
                      ? 'bg-white text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 shadow-sm'
                      : 'bg-[#053d26] text-white hover:bg-[#042c1b] shadow-md'
                  }`}
                >
                  {activeTeacher.isActive ? t("fac.deactivate") : t("fac.activate")}
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
  const { t, language } = useLanguage();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacherName, setTeacherName] = useState("");
  const [teacherInitials, setTeacherInitials] = useState("");
  const [stats, setStats] = useState<any[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<any[]>([]);

  const fetchAnnouncementsOnly = useCallback(async () => {
    try {
      const list = await announcementApi.getAll({ pageSize: 2 });
      setAnnouncements(list);
    } catch (e) {
      console.error("Failed to load announcements", e);
    }
  }, []);

  useAnnouncementsRefresh(fetchAnnouncementsOnly);
  const [teacherImage, setTeacherImage] = useState<string | null>(null);
  const [formClasses, setFormClasses] = useState<any[]>([]);
  const [revisionClasses, setRevisionClasses] = useState<{classId: string, className: string, comment: string}[]>([]);

  useEffect(() => {

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
        
        const pic = user.profilePictureUrl || user.imageUrl || user.photo || user.image || user.teacher?.profilePictureUrl || user.teacher?.imageUrl || user.teacher?.photo || user.teacher?.image || null;
        if (pic) setTeacherImage(pic);

        // Start the independent requests together instead of one after another
        const statsPromise = dashboardApi.getTeacherDashboard();
        const classesPromise = teacherPortalApi.getClasses();
        const formClassesPromise = attendanceApi.getMyFormClasses();
        const sessionsPromise = sessionApi.getAll().catch(() => []);
        const announcementsPromise = announcementApi.getAll({ pageSize: 2 });
        // Failures are handled where each one is awaited below
        [statsPromise, classesPromise, formClassesPromise, announcementsPromise].forEach(p => p.catch(() => {}));

        let assignments: any[] = [];
        let formClass: any = null;
        let localStats: any = null;
        try {
          localStats = await statsPromise;
          
          // Try to extract profile picture from dashboard stats
          if (!pic && localStats) {
            const dashPic = localStats.profilePictureUrl || localStats.imageUrl || localStats.photo ||
              localStats.teacher?.profilePictureUrl || localStats.teacher?.imageUrl || localStats.teacher?.photo ||
              localStats.teacher?.image || localStats.image || null;
            if (dashPic) setTeacherImage(dashPic);
          }
          
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
          const classesRes = await classesPromise;
          allClasses = Array.isArray(classesRes) ? classesRes : ((classesRes as any)?.data || (classesRes as any)?.items || []);
          const userId = user.id || user._id || user.teacher?.id || user.teacher?._id;
          
          let myFormClasses: any[] = [];
          
          // Use the dedicated backend endpoint for form classes
          try {
            const formClassesRes = await formClassesPromise;
            const unwrapped = Array.isArray(formClassesRes) ? formClassesRes : ((formClassesRes as any).data || (formClassesRes as any).items || (formClassesRes as any).classes || (formClassesRes as any).formClasses || []);
            myFormClasses = Array.isArray(unwrapped) ? unwrapped : [];
            // Map the objects correctly if they return classId instead of id
            myFormClasses = myFormClasses.map(fc => {
              if (typeof fc === 'string') {
                const cls = allClasses.find(c => c.classId === fc || c.id === fc || c._id === fc);
                return { id: fc, classId: fc, name: cls?.name || cls?.className || "Class" };
              }
              return {
                ...fc,
                id: fc.id || fc.classId || fc._id,
                name: fc.name || fc.className || "Class"
              };
            });
            
          } catch (e) {
            console.error("Failed to fetch my form classes from attendance API", e);
            // Fallback to localStats
            if (localStats?.formClasses && Array.isArray(localStats.formClasses)) {
               myFormClasses = localStats.formClasses;
            } else if (localStats?.formClass) {
               myFormClasses = Array.isArray(localStats.formClass) ? localStats.formClass : [localStats.formClass];
            }
            
            myFormClasses = myFormClasses.map(fc => {
              if (typeof fc === 'string') {
                const cls = allClasses.find(c => c.classId === fc || c.id === fc || c._id === fc);
                return { id: fc, classId: fc, name: cls?.name || cls?.className || "Class" };
              }
              return {
                ...fc,
                id: fc.id || fc.classId || fc._id,
                name: fc.name || fc.className || "Class"
              };
            });
          }
          
          // The probe fallback has been removed because it was erroneously granting form teacher access to non-form teachers
          
          setFormClasses(myFormClasses);

          try {
            const sessions = await sessionsPromise;
            const activeSession = sessions.find((s: any) => s.isCurrent);
            const activeTerm = activeSession?.terms?.find((t: any) => t.isCurrent);
            if (activeTerm && myFormClasses.length > 0) {
              const revs: any[] = [];
              // Check every form class's results at once
              const classResults = await Promise.all(myFormClasses.map(fc =>
                resultApi.getClassResults(fc.classId || fc.id || fc._id, activeTerm.id).catch(() => null)
              ));
              myFormClasses.forEach((fc, index) => {
                const cId = fc.classId || fc.id || fc._id;
                const cRes = classResults[index];
                if (cRes) {
                  const rData = (cRes as any)?.data || cRes;
                  const rawStatus = String((cRes as any)?.status || (cRes as any)?.approvalStatus || rData?.status || rData?.approvalStatus || "").trim().toLowerCase();
                  if (rawStatus === "revision requested" || rawStatus === "revision_requested") {
                    revs.push({
                      classId: cId,
                      className: fc.className || fc.name || "Class",
                      comment: (cRes as any)?.adminComment || rData?.adminComment || (cRes as any)?.comment || rData?.comment || ""
                    });
                  }
                }
              });
              setRevisionClasses(revs);
            }
          } catch (e) {
            console.error("Failed to check for requested revisions", e);
          }
        } catch (e) {
          console.error("Failed to fetch teacher classes", e);
        }

        // Dashboard statistics (the same response loaded above)
        let dashboardStats: any = {};
        try {
          dashboardStats = await statsPromise;
        } catch (e) {
          console.error("Failed to fetch teacher dashboard stats", e);
        }
        // Fetch announcements
        try {
          const list = await announcementsPromise;
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
            title: "fac.stat_classes", 
            value: String(assignedClassesCount), 
            desc: uniqueClassesNames, 
            descKey: "fac.no_classes", 
            icon: BookOpen
          },
          { 
            title: "fac.stat_students", 
            value: String(totalStudentsCount), 
            desc: "", 
            descKey: "fac.across", 
            icon: Users
          }
        ];
        setStats(computedStats);

        const subjectsWithDetails = assignments.map(asm => {
          const c = asm.class || allClasses.find(cls => (cls.id || cls.classId) === asm.classId || cls._id === asm.classId) || {};
          const s = asm.subject || {};
          return {
            id: asm.id || asm._id,
            classId: asm.classId || c.id || c.classId || c._id,
            subjectId: asm.subjectId || s.id || s._id,
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
        <span className="ml-3 text-gray-500 font-medium">{t("fac.loading_ws")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
        {/* Subtle decorative background */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-bl from-green-50/50 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></span>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{new Date().toLocaleDateString(localeFor(language), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
            {interpolate(t("fac.welcome"), { name: <span className="text-[#053d26]">{teacherName}</span> })}
          </h1>
          <p className="text-gray-500 text-sm mt-2 max-w-lg leading-relaxed">
            {t("fac.welcome_d")}
          </p>
        </div>
        
        <div className="relative z-10 flex items-center gap-4 bg-gray-50/80 px-5 py-3 rounded-2xl border border-gray-100 shadow-inner shrink-0">
          <div className="relative">
            {teacherImage ? (
              <img 
                src={teacherImage} 
                alt={teacherName} 
                className="h-12 w-12 rounded-xl object-cover shadow-sm"
              />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#053d26] to-[#032517] text-white font-bold flex items-center justify-center text-lg shadow-sm">
                {teacherInitials}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="pr-2 hidden sm:block">
            <p className="font-extrabold text-sm text-gray-900">{teacherName}</p>
            <p className="text-[11px] text-[#b05e1c] font-bold uppercase tracking-widest mt-0.5">{t("fac.faculty_member")}</p>
          </div>
        </div>
      </div>

      {revisionClasses.length > 0 && (
        <div className="space-y-4">
          {revisionClasses.map((rev, idx) => (
            <div key={idx} className="bg-amber-50 border border-amber-200 rounded-3xl p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white border border-amber-100 flex items-center justify-center shrink-0 shadow-sm text-amber-600">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-800">
                        {t("fac.action_req")}
                      </span>
                      <h3 className="text-base font-bold text-gray-900">{t("fac.rev_title")}</h3>
                    </div>
                    <p className="text-sm text-gray-600 font-medium mb-1">
                      {interpolate(t("fac.rev_d"), { cls: <span className="font-bold text-gray-900">{rev.className}</span> })}
                    </p>
                    <div className="bg-white/60 border border-amber-100/50 rounded-xl p-3 mt-2 text-sm text-amber-900 font-medium whitespace-pre-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-600/80 block mb-1">{t("fac.admin_comment")}</span>
                      {rev.comment || t("fac.rev_default")}
                    </div>
                  </div>
                </div>
                <Link 
                  href={`/dashboard/faculty/form-class-results?classId=${rev.classId}`}
                  className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-sm text-sm"
                >
                  {t("fac.review_fix")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {stats.map((stat, i) => {
          const accents = [
            { bg: "bg-[#053d26]", text: "text-[#053d26]", iconBg: "bg-[#053d26]/10" },
            { bg: "bg-[#b05e1c]", text: "text-[#b05e1c]", iconBg: "bg-[#b05e1c]/10" }
          ];
          const style = accents[i % accents.length];
          return (
            <div key={i} className={`relative overflow-hidden bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex items-start gap-5 group`}>
              <div className={`absolute top-0 left-0 w-full h-1.5 ${style.bg} opacity-90`}></div>
              
              <div className={`p-4 rounded-2xl shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${style.iconBg} ${style.text}`}>
                <stat.icon className="h-8 w-8" />
              </div>
              
              <div className="space-y-1.5 relative z-10 pt-1">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{t(stat.title)}</p>
                <div className="flex items-baseline gap-2">
                  <p className={`text-4xl font-black ${style.text} leading-none tracking-tight`}>{stat.value}</p>
                </div>
                <p className="text-xs text-gray-500 font-medium pt-1 line-clamp-1">{stat.desc || t(stat.descKey)}</p>
              </div>
              
              <div className={`absolute -right-8 -bottom-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700 ${style.text} pointer-events-none`}>
                <stat.icon className="w-40 h-40" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Assigned Subjects & Workload */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-8">
            <div className="flex justify-between items-center border-b border-gray-50 pb-5">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                <BookText className="h-6 w-6 text-[#053d26]" />
                {t("fac.workload")}
              </h2>
              <span className="text-xs font-bold text-[#b05e1c] bg-[#b05e1c]/10 px-3 py-1.5 rounded-xl uppercase tracking-wider">{t("fac.resp")}</span>
            </div>
            
            <div className="space-y-6">
              {/* Form Class Indicators */}
              {formClasses && formClasses.length > 0 && formClasses.map((fc, index) => (
                <div key={fc.classId || fc.id || fc._id || index} className="group relative overflow-hidden bg-gradient-to-br from-[#053d26] to-[#021f13] p-6 rounded-[2rem] flex items-center justify-between transition-all duration-500 hover:shadow-xl hover:shadow-[#053d26]/20 mb-4 border border-[#042c1b]">
                  <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-125 transition-transform duration-700 pointer-events-none">
                    <Award className="h-32 w-32 text-white" />
                  </div>
                  <div className="relative z-10 flex items-center gap-5">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-amber-400 shadow-inner">
                      <Award className="h-7 w-7" />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-xl tracking-tight">{t("cls.ft")}</h4>
                      <p className="text-emerald-100/80 font-medium text-sm flex items-center gap-2 mt-0.5">
                        {t("fac.class_label", { name: fc.className || fc.name || t("fac.assigned_class") })} {fc.arm ? `(${fc.arm})` : ''}
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard/faculty/attendance" className="relative z-10 bg-white text-[#053d26] hover:bg-emerald-50 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow transition-all flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {t("fac.mark_att")}
                  </Link>
                </div>
              ))}

              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pt-2">{t("fac.subj_assign")}</h3>
              
              {assignedSubjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {assignedSubjects.map((sub, idx) => (
                    <div key={idx} className="group p-5 rounded-3xl bg-gray-50/80 hover:bg-white border border-gray-100 hover:border-emerald-500/30 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute -right-4 -top-4 bg-emerald-50 p-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none"></div>
                      <div className="space-y-1 relative z-10">
                        <div className="flex justify-between items-start mb-3">
                          <span className="px-2.5 py-1 bg-white shadow-sm border border-gray-100 text-xs font-bold text-gray-700 rounded-lg">
                            {sub.className}
                          </span>
                          <span className="text-[11px] font-bold text-[#b05e1c] bg-[#b05e1c]/10 px-2 py-1 rounded-md uppercase tracking-wider">
                            {t("enr.s3.students", { n: sub.studentCount })}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-gray-900 text-lg tracking-tight">{sub.subject}</h4>
                      </div>
                      <div className="mt-8 relative z-10">
                        <Link 
                          href={`/dashboard/faculty/result-entry?classId=${sub.classId}&subjectId=${sub.subjectId}`}
                          className="flex items-center justify-between w-full text-sm font-bold text-[#053d26] hover:text-[#0a6c4a] transition-colors group/btn"
                        >
                          <span>{t("fac.manage_grades")}</span>
                          <div className="bg-emerald-100 p-1.5 rounded-lg group-hover/btn:bg-emerald-200 transition-colors">
                            <ArrowRight className="h-4 w-4 transform group-hover/btn:translate-x-0.5 transition-transform" />
                          </div>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50/50 border border-gray-100 rounded-3xl border-dashed">
                  <BookOpen className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium text-sm">{t("fac.no_subj_yet")}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Quick Hub & Messages */}
        <div className="space-y-6">
          <TeacherMessages />

          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2 border-b border-gray-50 pb-5">
              {t("fac.hub")}
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <Link 
                href="/dashboard/faculty/result-entry" 
                className="group w-full rounded-3xl bg-gray-50 hover:bg-[#053d26] p-4 text-left flex items-center gap-5 transition-all duration-300 border border-transparent hover:shadow-xl hover:shadow-[#053d26]/20"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#053d26] shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <CheckSquare className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-gray-900 group-hover:text-white transition-colors">{t("fac.submit_grades")}</div>
                  <div className="text-[11px] text-gray-500 font-medium group-hover:text-emerald-100/80 transition-colors mt-0.5">{t("fac.submit_grades_d")}</div>
                </div>
              </Link>

              <Link 
                href="/dashboard/faculty/classes" 
                className="group w-full rounded-3xl bg-gray-50 hover:bg-[#b05e1c] p-4 text-left flex items-center gap-5 transition-all duration-300 border border-transparent hover:shadow-xl hover:shadow-[#b05e1c]/20"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#b05e1c] shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-gray-900 group-hover:text-white transition-colors">{t("fac.rosters")}</div>
                  <div className="text-[11px] text-gray-500 font-medium group-hover:text-orange-100/80 transition-colors mt-0.5">{t("fac.rosters_d")}</div>
                </div>
              </Link>
              
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
