"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { UserPlus, X, Loader2, AlertCircle, Calendar, BookOpen, Clock, Users, ArrowRight, CheckCircle2, ChevronRight, Award, TrendingUp, Plus, ClipboardList, CheckSquare, FileText, Sparkles, BookText, Megaphone } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { teacherApi, Teacher, CreateTeacherRequest } from '@/lib/api';

export function FacultyDirectory() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [formData, setFormData] = useState<CreateTeacherRequest>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });

  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await teacherApi.getAll(page, 20);
      // Safely unwrap data from .NET paginated wrapper structures
      let extractedItems: unknown = response;
      if (response?.data) {
        extractedItems = Array.isArray(response.data) ? response.data : ((response.data as any).items || (response.data as any).data || response.data);
      } else if (response?.items) {
        extractedItems = response.items;
      }
      
      const validItems = Array.isArray(extractedItems) ? extractedItems : [];
      setTeachers(validItems);
      setTotalCount(typeof response === 'object' && !Array.isArray(response) ? (response.totalCount ?? validItems.length) : validItems.length);
      setTotalPages(typeof response === 'object' && !Array.isArray(response) ? (response.totalPages ?? 1) : 1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load teachers";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    // eslint-disable-next-line
    fetchTeachers();
  }, [fetchTeachers]);

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim()) {
      setFormError("Full name, email, and password are required.");
      return;
    }

    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await teacherApi.create(formData);
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
          <div className="h-12 w-12 rounded-full bg-[#053d26] text-white font-bold flex items-center justify-center text-sm">
            {teacher.fullName ? teacher.fullName.split(' ').filter(Boolean).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : 'T'}
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm leading-tight">{teacher.fullName || 'Unnamed Teacher'}</div>
            <div className="text-xs text-gray-500 mt-1">{teacher.email || 'No email'}</div>
          </div>
        </div>
      ),
      className: 'w-1/3'
    },
    {
      header: 'Contact Info',
      accessor: (teacher) => (
        <div>
          <div className="text-sm font-semibold text-gray-700">{teacher.email}</div>
          <div className="text-xs text-gray-500 mt-0.5">{teacher.phone || 'No phone'}</div>
        </div>
      ),
      className: 'w-1/4'
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
      className: 'w-1/5'
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
          <div className="text-5xl font-bold text-[#053d26] mb-2">{totalCount}</div>
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
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">On This Page</p>
          <div className="text-5xl font-bold text-[#053d26] mb-2">{teachers.length}</div>
          <p className="text-xs text-gray-500">Showing this page</p>
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
              Showing {teachers.length} of {totalCount} Educators
            </div>
          </div>

          {/* Table Wrapper */}
          <div className="[&>div]:border-none [&>div]:shadow-none [&_table]:w-full">
            <DataTable 
              columns={columns} 
              data={teachers} 
              actions={(teacher) => (
                <button
                  onClick={async () => {
                    try {
                      await teacherApi.updateStatus(teacher.id, !teacher.isActive);
                      fetchTeachers();
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Failed to update status");
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
              )}
            />
          </div>

          {/* Pagination Footer */}
          <div className="flex justify-between items-center p-6 border-t border-gray-50">
            <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-full bg-[#053d26] text-white text-xs font-bold hover:bg-[#042c1b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

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
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
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
    </div>
  );
}

// ==========================================
// Faculty Homepage Component (Dr. Elena)
// ==========================================

export function FacultyHomepage() {
  const [currentDate, setCurrentDate] = useState("");
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('en-US', options));

    // Synchronize administrative announcements broadcast by School Admin
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("leoned_announcements");
      if (stored) {
        setAnnouncements(JSON.parse(stored));
      }
    }
  }, []);

  const stats = [
    { title: "Assigned Classes", value: "3", desc: "SS2 Math, SS1 Further Math, JSS3 Tech", icon: BookOpen, color: "text-[#053d26] bg-[#053d26]/10" },
    { title: "Students Taught", value: "114", desc: "Across all class arms", icon: Users, color: "text-[#b05e1c] bg-[#b05e1c]/10" },
    { title: "Average Performance", value: "84%", desc: "Term 2 class average", icon: TrendingUp, color: "text-green-600 bg-green-50" },
    { title: "Active Tasks", value: "2 Pending", desc: "Grade submissions due soon", icon: Clock, color: "text-orange-600 bg-orange-50" }
  ];

  const schedule = [
    { id: "1", subject: "Mathematics", time: "09:00 AM - 10:30 AM", class: "SS2-A Math", status: "Complete", color: "bg-green-500" },
    { id: "2", subject: "Further Mathematics", time: "11:30 AM - 01:00 PM", class: "SS1-B Further Math", status: "In Progress", color: "bg-amber-500 animate-pulse" },
    { id: "3", subject: "Basic Technology", time: "02:00 PM - 03:00 PM", class: "JSS3-C Tech", status: "Upcoming", color: "bg-gray-300" }
  ];

  const classPerformance = [
    { name: "SS2 Mathematics", average: 87, count: 42, color: "bg-[#053d26]" },
    { name: "SS1 Further Mathematics", average: 78, count: 38, color: "bg-[#b05e1c]" },
    { name: "JSS3 Basic Technology", average: 81, count: 34, color: "bg-teal-600" }
  ];

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
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">Welcome Back, Dr. Elena</h1>
            <p className="text-sm text-green-100 max-w-xl">
              Academic Fellow • Department of Mathematical Sciences. View your schedules, manage classes, and enter grades below.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
            <div className="h-12 w-12 rounded-full bg-[#b05e1c] text-white font-bold flex items-center justify-center text-lg shadow-inner">
              ER
            </div>
            <div>
              <p className="font-bold text-sm">Dr. Elena Rodriguez</p>
              <p className="text-xs text-green-200">Senior Teacher</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-start gap-4 transition-all hover:shadow-md hover:scale-[1.01]">
            <div className={`p-3 rounded-2xl shrink-0 ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{stat.title}</p>
              <p className="text-2xl font-black text-gray-900 leading-none">{stat.value}</p>
              <p className="text-[11px] text-gray-500 font-medium pt-1">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Schedule & Class Performance */}
        <div className="lg:col-span-2 space-y-8">

          {/* Administrative Broadcasts Megaphone Board */}
          {announcements.length > 0 && (
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-[#b05e1c]" />
                  Administrative Broadcasts
                </h2>
                <span className="text-[9px] font-black text-[#053d26] bg-[#053d26]/5 border border-[#053d26]/10 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#053d26] animate-pulse"></span>
                  Active Notices
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {announcements.slice(0, 2).map((ann, idx) => (
                  <div 
                    key={ann.id || idx} 
                    className="p-5 rounded-2xl bg-gray-50/20 hover:bg-gray-50/60 border border-gray-100 hover:border-gray-200 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                        <span className={`px-2 py-0.5 rounded ${
                          ann.category === "Academic" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                          ann.category === "Finance" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                          ann.category === "Emergency" ? "bg-rose-50 text-rose-700 border border-rose-100 animate-pulse" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {ann.category}
                        </span>
                        <span>
                          {new Date(ann.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-gray-900 text-sm leading-snug">{ann.title}</h4>
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed line-clamp-3">{ann.content}</p>
                    </div>
                    <div className="pt-3 mt-4 border-t border-gray-100/60 flex justify-between items-center text-[9px] text-gray-400 font-semibold uppercase tracking-wider">
                      <span>By: {ann.author}</span>
                      <span className="text-emerald-600 font-extrabold">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Today's Schedule */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#b05e1c]" />
                Today's Schedule
              </h2>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">3 sessions today</span>
            </div>

            <div className="relative border-l border-gray-100 pl-6 ml-3 space-y-8">
              {schedule.map((item) => (
                <div key={item.id} className="relative group">
                  {/* Dot indicator */}
                  <span className={`absolute -left-[31px] top-1.5 h-4.5 w-4.5 rounded-full border-4 border-white shadow-sm ring-1 ring-gray-100 ${item.color}`} />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-all">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#b05e1c] uppercase tracking-wider">{item.time}</p>
                      <h4 className="font-extrabold text-gray-900 text-base">{item.subject}</h4>
                      <p className="text-xs text-gray-500 font-semibold">{item.class} • Room 104</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        item.status === "Complete" 
                          ? "bg-green-100 text-green-800" 
                          : item.status === "In Progress"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {item.status}
                      </span>
                      {item.status === "In Progress" && (
                        <Link 
                          href="/dashboard/faculty/result-entry" 
                          className="px-4 py-2 rounded-full bg-[#053d26] text-white text-xs font-bold hover:bg-[#042c1b] transition-all flex items-center gap-1 shadow-sm"
                        >
                          Result Entry <ChevronRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Class Performance Overview */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#b05e1c]" />
                Class Performance Overview
              </h2>
              <span className="text-xs font-bold text-[#053d26] bg-[#053d26]/10 px-3 py-1 rounded-full">Term 2 Analytics</span>
            </div>

            <div className="space-y-6">
              {classPerformance.map((classData, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold text-gray-900">
                    <span>{classData.name} <span className="text-xs text-gray-400 font-semibold">({classData.count} students)</span></span>
                    <span className="text-[#053d26] font-extrabold">{classData.average}% Avg</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden flex items-center">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${classData.color}`} 
                      style={{ width: `${classData.average}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Column: Quick Actions & Alerts */}
        <div className="space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 pb-4">
              <Sparkles className="h-4.5 w-4.5 text-[#b05e1c]" />
              Quick Actions
            </h3>

            <div className="grid grid-cols-1 gap-3">
              <Link 
                href="/dashboard/faculty/result-entry" 
                className="w-full rounded-2xl bg-[#053d26] p-4 text-left flex items-center gap-3 transition-transform hover:scale-[1.02] text-white shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white shrink-0">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">Submit Grades</div>
                  <div className="text-[11px] text-green-200">Enter CA and Exam marks</div>
                </div>
              </Link>

              <Link 
                href="/dashboard/faculty/classes" 
                className="w-full rounded-2xl bg-[#b05e1c] p-4 text-left flex items-center gap-3 transition-transform hover:scale-[1.02] text-white shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white shrink-0">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">View Classes</div>
                  <div className="text-[11px] text-orange-100">Review SS2, SS1, and JSS3 class files</div>
                </div>
              </Link>

              <Link 
                href="/dashboard/students" 
                className="w-full rounded-2xl border border-gray-200 p-4 text-left flex items-center gap-3 transition-transform hover:scale-[1.02] bg-gray-50/50 hover:bg-gray-100 text-gray-800"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600 shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-900">Student Directory</div>
                  <div className="text-[11px] text-gray-500">Access student profiles and contacts</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Pending Tasks & Memos */}
          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 pb-4">
              <ClipboardList className="h-4.5 w-4.5 text-gray-400" />
              Pending Tasks
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-gray-900">Enter CA 2 grades for SS2 Math</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Due in 2 days</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-gray-900">Approve SS1 Further Math CA 1 submissions</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Due tomorrow</p>
                </div>
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
      setDemoRole(localStorage.getItem("leoned_demo_role") || "Admin");
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
