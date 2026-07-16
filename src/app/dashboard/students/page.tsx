"use client";

import IdCard from "@/components/shared/IdCard";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { Eye, Edit2, Download, TrendingUp, AlertCircle, CheckCircle2, Loader2, UserPlus, X, Trash2, Save, GraduationCap, Power, CreditCard, Printer } from 'lucide-react';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';
import { DataTable, Column } from '@/components/ui/DataTable';
import { studentApi, schoolApi, promotionApi, classApi, Student, UpdateStudentRequest, formatDate } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Role guard redirect
  useEffect(() => {
    try {
      const stored = localStorage.getItem("leoned_user");
      if (stored) {
        const user = JSON.parse(stored);
        const userRole = user.role?.toLowerCase();
        if (userRole === "teacher" || userRole === "faculty") {
          router.push("/dashboard/faculty");
        } else if (userRole === "student" || userRole === "parent" || userRole === "guardian") {
          router.push("/dashboard/student-portal");
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [router]);

  // View modal
  const [viewStudent, setViewStudent] = useState<Student | null>(null);

  // ID Card modal
  const [idCardStudent, setIdCardStudent] = useState<Student | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [principalName, setPrincipalName] = useState<string>('Principal');
  const [schoolInfo, setSchoolInfo] = useState({ name: '', address: '', phone: '', logo: '', theme: '#053d26' });
  const idCardRef = useRef<HTMLDivElement>(null);

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("All");

  useEffect(() => {
    try {
      const user = localStorage.getItem('leoned_user');
      if (user) {
        const parsed = JSON.parse(user);
        const sId = parsed?.schoolId || parsed?.SchoolId || '';
        setSchoolInfo({
          name: parsed.schoolName || 'LeonEd Academy',
          address: parsed.address || parsed.schoolAddress || '',
          phone: parsed.phone || parsed.adminPhone || '',
          logo: parsed.logoUrl || '',
          theme: (sId ? localStorage.getItem(`leoned_theme_${sId}`) : null) || '#053d26'
        });

        if (sId) {
          schoolApi.getById(sId).then((school: any) => {
            if (school) {
              setSchoolInfo(prev => ({
                ...prev,
                address: school.address || prev.address,
                phone: school.phone || prev.phone,
                name: school.name || prev.name
              }));
              if (school.ownerName || school.principalName || school.adminName) {
                setPrincipalName(school.principalName || school.ownerName || school.adminName);
              }
            }
          }).catch(() => {});
        }
      }
    } catch {}
  }, []);

  // Edit modal
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState<UpdateStudentRequest>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await studentApi.getAll();
      setStudents(Array.isArray(data) ? data : []);
      
      const clsData = await classApi.getAll().catch(() => []);
      setClasses(Array.isArray(clsData) ? clsData : []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load students";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    fetchStudents();
  }, [fetchStudents]);

  const openEdit = (student: Student) => {
    setEditStudent(student);
    setEditForm({
      fullName: student.fullName,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth,
      classId: student.classId,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail,
      password: student.password,
      status: student.status,
    });
    setSaveError("");
  };

  const handleSaveEdit = async () => {
    if (!editStudent) return;
    setIsSaving(true);
    setSaveError("");
    try {
      await studentApi.update(editStudent.id, editForm);
      setEditStudent(null);
      fetchStudents();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordId || !newPassword) return;
    setIsResetting(true);
    try {
      await studentApi.resetPassword(resetPasswordId, newPassword);
      toast.success("Password reset successfully.");
      setResetPasswordId(null);
      setNewPassword("");
      await fetchStudents();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reset password";
      toast.error(message);
    } finally {
      setIsResetting(false);
    }
  };

  const [isMarkingLeft, setIsMarkingLeft] = useState(false);
  const handleMarkLeft = async (id: string) => {
    if (!window.confirm("Are you sure you want to mark this student as LEFT? They will lose access to the portal immediately.")) return;
    setIsMarkingLeft(true);
    try {
      await promotionApi.markLeft(id);
      toast.success("Student marked as LEFT successfully.");
      setViewStudent(null);
      fetchStudents();
    } catch (err: any) {
      toast.error(err.message || "Failed to mark student as LEFT.");
    } finally {
      setIsMarkingLeft(false);
    }
  };

  const handlePreviewIdCard = (student: Student) => {
    setViewStudent(null);
    setIdCardStudent(student);
  };

  const handleDownloadFromPreview = async () => {
    if (!idCardStudent || !idCardRef.current) return;
    const toastId = toast.loading('Generating PDF...');
    const opt: any = {
      margin:       0.5,
      filename:     `ID-Card-${idCardStudent.admissionNumber || idCardStudent.fullName}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf().set(opt).from(idCardRef.current).save().then(() => {
      toast.success('Downloaded successfully!', { id: toastId });
    }).catch((err: any) => {
      toast.error('Failed to generate PDF', { id: toastId });
      console.error(err);
    });
  };

  const closePreview = () => {
    setIdCardStudent(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await studentApi.delete(deleteId);
      setDeleteId(null);
      fetchStudents();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete student");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    if (students.length === 0) return;
    const headers = ['Full Name', 'Admission Number', 'Gender', 'Class', 'Status'];
    const rows = students.map(s => [
      s.fullName,
      s.admissionNumber || '',
      s.gender,
      s.className || 'Unassigned',
      s.status,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<Student>[] = [
    {
      header: 'Student',
      accessor: (student) => {
        const initials = student.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-4">
            {student.profilePictureUrl || (student as any).profilePicture || (student as any).image ? (
              <img src={student.profilePictureUrl || (student as any).profilePicture || (student as any).image} alt={student.fullName} className="h-10 w-10 rounded-full object-cover shadow-sm" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-[#e8f5e9] text-[#053d26] font-bold flex items-center justify-center text-sm">
                {initials}
              </div>
            )}
            <div>
              <div className="font-bold text-gray-900 text-sm leading-tight">{student.fullName}</div>
              <div className="text-xs text-gray-500 mt-1">{student.systemEmail || student.admissionNumber || 'No ID'}</div>
            </div>
          </div>
        );
      },
      className: 'w-1/3'
    },
    {
      header: 'Class',
      accessor: (student) => (
        <div className="text-sm font-bold text-gray-900">
          {student.className || 'Unassigned'}
        </div>
      ),
      className: 'w-1/5'
    },
    {
      header: 'Gender',
      accessor: (student) => (
        <div className="text-sm text-gray-600">
          {student.gender}
        </div>
      ),
      className: 'w-1/6'
    },
    {
      header: 'Enrolled',
      accessor: (student) => (
        <div className="text-sm text-gray-600">
          {formatDate(student.enrolledAt)}
        </div>
      ),
      className: 'w-1/6'
    },
    {
      header: 'Status',
      accessor: (student) => {
        const statusColors: Record<string, string> = {
          Active: 'bg-green-100 text-[#053d26]',
          Graduated: 'bg-blue-100 text-blue-700',
          Archived: 'bg-gray-100 text-gray-600',
          Suspended: 'bg-red-100 text-red-700',
        };
        return (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[student.status] || 'bg-gray-100 text-gray-600'}`}>
            {student.status}
          </span>
        );
      },
      className: 'w-1/6'
    },
  ];

  const activeCount = students.filter(s => s.status === 'Active').length;
  const graduatedCount = students.filter(s => s.status === 'Graduated').length;

  const filteredStudents = selectedClass === "All" 
    ? students 
    : students.filter(s => s.classId === selectedClass || (s as any).class?.id === selectedClass || s.className === selectedClass);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-10">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold text-[#053d26] mb-3">Student Registry</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Manage student records, enrollment, and academic placements.
          </p>
        </div>
        <Link
          href="/dashboard/students/new"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors shadow-sm shrink-0"
        >
          <UserPlus className="h-5 w-5" />
          Add New Student
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Total Students</p>
          <div className="text-5xl font-bold text-[#053d26] mb-4">{students.length.toLocaleString()}</div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
            <TrendingUp className="h-4 w-4 text-[#20c997]" /> All registered students
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between border-b-4 border-b-[#053d26]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Active</p>
          <div className="text-5xl font-bold text-[#053d26] mb-4">{activeCount}</div>
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-[#053d26] text-[10px] font-bold uppercase tracking-wider">
              Currently Active
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Loaded</p>
          <div className="text-5xl font-bold text-gray-700 mb-4">{students.length}</div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
            Students loaded
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Graduated</p>
          <div className="text-5xl font-bold text-gray-700 mb-4">{graduatedCount}</div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
            <GraduationCap className="h-4 w-4 text-[#20c997]" /> Completed program
          </div>
        </div>
      </div>

      {/* Directory Section */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#053d26]" />
          <span className="ml-3 text-gray-500 font-medium">Loading students...</span>
        </div>
      ) : error ? (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to load students</h3>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button
            onClick={fetchStudents}
            className="px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors"
          >
            Retry
          </button>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No students yet</h3>
          <p className="text-sm text-gray-500 mb-6">Enroll your first student to get started.</p>
          <Link
            href="/dashboard/students/new"
            className="inline-block px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors"
          >
            Add New Student
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-2">
          {/* Filters Header */}
          <div className="flex flex-col md:flex-row justify-between items-center p-6 border-b border-gray-50 gap-4">
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Filter By:</span>
              <select className="bg-gray-100 rounded-full px-4 py-2 text-xs font-bold text-gray-600 focus:outline-none appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%234B5563%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:8px_8px] bg-[right_12px_center]">
                <option>Status: All</option>
              </select>
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-gray-100 rounded-full px-4 py-2 text-xs font-bold text-gray-600 focus:outline-none appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%234B5563%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:8px_8px] bg-[right_12px_center]">
                <option value="All">Class: All</option>
                {classes.map(c => (
                  <option key={c.id || c._id} value={c.id || c._id}>{c.name || c.className}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>

          {/* Table Wrapper */}
          <div className="[&>div]:border-none [&>div]:shadow-none [&_table]:w-full">
            <DataTable 
              columns={columns} 
              data={filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)} 
              actions={(student) => (
                <div className="flex items-center gap-1 text-gray-400">
                  <button
                    onClick={() => setViewStudent(student)}
                    className="hover:text-[#053d26] transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                    title="View details"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => openEdit(student)}
                    className="hover:text-[#b05e1c] transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                    title="Edit student"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(student.id)}
                    className="hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                    title="Delete student"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            />
          </div>

          {/* Pagination Component */}
          {filteredStudents.length > itemsPerPage && (
            <div className="flex items-center justify-between p-6 border-t border-gray-50">
              <span className="text-xs font-medium text-gray-500">
                Showing {Math.min(filteredStudents.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredStudents.length, currentPage * itemsPerPage)} of {filteredStudents.length} students
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-xs font-bold text-gray-900">
                  Page {currentPage} of {Math.ceil(filteredStudents.length / itemsPerPage)}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredStudents.length / itemsPerPage), p + 1))}
                  disabled={currentPage === Math.ceil(filteredStudents.length / itemsPerPage)}
                  className="px-3 py-1 rounded-md text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Student Modal */}
      {viewStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewStudent(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Student Details</h2>
              <button onClick={() => setViewStudent(null)} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-8">
              {viewStudent.profilePictureUrl || (viewStudent as any).profilePicture || (viewStudent as any).image ? (
                <img src={viewStudent.profilePictureUrl || (viewStudent as any).profilePicture || (viewStudent as any).image} alt={viewStudent.fullName} className="h-16 w-16 rounded-full object-cover shadow-sm" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-[#e8f5e9] text-[#053d26] font-bold flex items-center justify-center text-xl">
                  {viewStudent.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-900">{viewStudent.fullName}</h3>
                <p className="text-sm text-gray-500">{viewStudent.admissionNumber || 'No Admission Number'}</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                ['Gender', viewStudent.gender],
                ['Date of Birth', formatDate(viewStudent.dateOfBirth)],
                ['Class', viewStudent.className || 'Unassigned'],
                ['Status', viewStudent.status],
                ['Guardian', viewStudent.parentName || '—'],
                ['Guardian Phone', viewStudent.parentPhone || '—'],
                ['Guardian Email', viewStudent.parentEmail || '—'],
                ['Guardian Password', viewStudent.password || '—'],
                ['Enrolled', formatDate(viewStudent.enrolledAt)],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-bold text-gray-900">{val}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-8">
              <button
                onClick={() => handlePreviewIdCard(viewStudent)}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 transition-colors text-sm border border-blue-100/50 shadow-sm"
              >
                <CreditCard className="h-4 w-4" /> View ID Card
              </button>
              <button
                onClick={() => setResetPasswordId(viewStudent.id)}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-colors text-sm border border-rose-100/50 shadow-sm"
              >
                <Power className="h-4 w-4" /> Reset Password
              </button>
              <button
                onClick={() => handleMarkLeft(viewStudent.id)}
                disabled={isMarkingLeft || viewStudent.status === 'Left'}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-orange-50 text-orange-600 font-bold hover:bg-orange-100 transition-colors text-sm border border-orange-100/50 shadow-sm disabled:opacity-50"
              >
                <AlertCircle className="h-4 w-4" /> {isMarkingLeft ? "Updating..." : "Mark as Left"}
              </button>
              <button
                onClick={() => { setViewStudent(null); openEdit(viewStudent); }}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors text-sm shadow-md"
              >
                <Edit2 className="h-4 w-4" /> Edit Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditStudent(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Edit Student</h2>
              <button onClick={() => setEditStudent(null)} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                <X className="h-6 w-6" />
              </button>
            </div>

            {saveError && (
              <div className="bg-red-50 text-red-700 rounded-2xl p-4 mb-6 text-sm flex items-center gap-2">
                <AlertCircle className="h-5 w-5 shrink-0" /> {saveError}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Full Name</label>
                <input
                  value={editForm.fullName || ''}
                  onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))}
                  className="w-full rounded-2xl bg-gray-100 py-4 px-5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Gender</label>
                  <select
                    value={editForm.gender || ''}
                    onChange={e => setEditForm(f => ({ ...f, gender: e.target.value as 'Male' | 'Female' }))}
                    className="w-full rounded-2xl bg-gray-100 py-4 px-5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors appearance-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Status</label>
                  <select
                    value={editForm.status || ''}
                    onChange={e => setEditForm(f => ({ ...f, status: e.target.value as 'Active' | 'Graduated' | 'Archived' | 'Suspended' | 'Left' }))}
                    className="w-full rounded-2xl bg-gray-100 py-4 px-5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors appearance-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Graduated">Graduated</option>
                    <option value="Archived">Archived</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Left">Left</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Guardian Name</label>
                <input
                  value={editForm.parentName || ''}
                  onChange={e => setEditForm(f => ({ ...f, parentName: e.target.value }))}
                  className="w-full rounded-2xl bg-gray-100 py-4 px-5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Guardian Phone</label>
                  <input
                    value={editForm.parentPhone || ''}
                    onChange={e => setEditForm(f => ({ ...f, parentPhone: e.target.value }))}
                    className="w-full rounded-2xl bg-gray-100 py-4 px-5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Guardian Email</label>
                  <input
                    value={editForm.parentEmail || ''}
                    onChange={e => setEditForm(f => ({ ...f, parentEmail: e.target.value }))}
                    className="w-full rounded-2xl bg-gray-100 py-4 px-5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setEditStudent(null)}
                className="px-6 py-3 rounded-full bg-gray-200 text-gray-900 font-bold hover:bg-gray-300 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Student</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-8">
              Are you sure you want to permanently remove this student record from the system? All associated academic data will be lost.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-6 py-3 rounded-full bg-gray-200 text-gray-900 font-bold hover:bg-gray-300 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-6 py-3 rounded-full bg-red-600 text-white font-bold hover:bg-red-700 transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ID Card Preview Modal */}
      {idCardStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-100 bg-gray-50 shrink-0 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <h3 className="font-bold text-lg text-gray-800">ID Card Preview</h3>
                <input 
                  type="text" 
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  placeholder="Principal's Name"
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#053d26] w-full sm:w-48"
                />
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button onClick={() => window.print()} className="p-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:text-[#053d26] shadow-sm hover:bg-gray-50 transition-all" title="Print ID Card">
                  <Printer className="h-4 w-4" />
                </button>
                <button 
                  onClick={handleDownloadFromPreview}
                  className="flex items-center gap-2 px-4 py-2 bg-[#053d26] hover:bg-[#042c1b] text-white rounded-lg font-bold text-sm transition-colors"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
                <button 
                  onClick={closePreview}
                  className="p-2 hover:bg-gray-200 text-gray-500 rounded-lg transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 bg-gray-100 p-8 overflow-y-auto flex items-center justify-center">
              <div className="scale-75 sm:scale-90 md:scale-100 origin-top flex justify-center">
                <IdCard 
                  ref={idCardRef}
                  student={idCardStudent}
                  schoolInfo={schoolInfo}
                  principalName={principalName}
                />
              </div>
            </div>
            
            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{__html: `
              @media print {
                body * { visibility: hidden; }
                .id-card-container, .id-card-container * { visibility: visible; }
                .id-card-container {
                  position: absolute;
                  left: 0;
                  top: 0;
                  transform: scale(0.9);
                  transform-origin: top left;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                @page { size: landscape; margin: 0; }
              }
            `}} />
          </div>
        </div>
      )}

      {/* Reset Password Confirmation Modal */}
      {resetPasswordId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setResetPasswordId(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <Power className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Reset Password</h3>
                <p className="text-sm text-gray-500">Set a new password for this student</p>
              </div>
            </div>
            <div className="mb-8">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">New Password</label>
              <input
                type="text"
                placeholder="Enter new password (min 6 chars)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full rounded-2xl bg-gray-100 py-4 px-5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setResetPasswordId(null)}
                className="px-6 py-3 rounded-full bg-gray-200 text-gray-900 font-bold hover:bg-gray-300 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={isResetting}
                className="px-6 py-3 rounded-full bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
                {isResetting ? 'Resetting...' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
