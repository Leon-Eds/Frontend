"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  ShieldAlert, 
  MoreVertical, 
  Mail, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  UserPlus,
  GraduationCap
} from "lucide-react";
import { authApi, formatDate } from "@/lib/api";
import toast from "react-hot-toast";

export default function GlobalUsersManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [activeDropdownUserId, setActiveDropdownUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({
    admins: true,
    teachers: true,
    students: true,
  });

  const toggleGroup = (group: 'admins' | 'teachers' | 'students') => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const renderUserTable = (groupUsers: any[], emptyMessage: string) => {
    return (
      <div className="w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-y border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-4 px-6 md:px-8">User Profile</th>
              <th className="py-4 px-4 hidden sm:table-cell">System Role</th>
              <th className="py-4 px-4 hidden md:table-cell">Last Activity</th>
              <th className="py-4 px-4 text-right">Status</th>
              <th className="py-4 px-6 md:px-8 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {groupUsers.length > 0 ? groupUsers.map((user) => (
              <tr key={user.id} className="group hover:bg-gray-50/50 transition-all duration-200">
                <td className="py-4 px-6 md:px-8">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                      user.role === 'SchoolAdmin' ? 'bg-gradient-to-br from-blue-100 to-blue-50 text-blue-700 border border-blue-200/50' :
                      user.role === 'Teacher' ? 'bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 border border-emerald-200/50' :
                      'bg-gradient-to-br from-orange-100 to-orange-50 text-orange-700 border border-orange-200/50'
                    }`}>
                      {(user.name || "U")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{user.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5 truncate mt-0.5">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 hidden sm:table-cell">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                    user.role === 'SchoolAdmin' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10' :
                    user.role === 'Teacher' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10' :
                    'bg-orange-50 text-orange-700 ring-1 ring-orange-600/10'
                  }`}>
                    {user.role === 'SchoolAdmin' ? <ShieldAlert className="h-3.5 w-3.5" /> : 
                     user.role === 'Teacher' ? <Users className="h-3.5 w-3.5" /> : 
                     <ShieldCheck className="h-3.5 w-3.5" />}
                    {user.role}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-500 font-medium hidden md:table-cell">
                  {formatDate(user.createdAt)}
                </td>
                <td className="py-4 px-4 text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.isActive !== false ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' : 'bg-gray-50 text-gray-600 ring-1 ring-gray-500/20'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${user.isActive !== false ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    {user.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-4 px-6 md:px-8 text-right relative">
                  <div className="dropdown-container inline-block text-left">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownUserId(activeDropdownUserId === user.id ? null : user.id);
                      }}
                      className={`p-2 transition-all rounded-xl border ${
                        activeDropdownUserId === user.id 
                          ? 'bg-gray-100 border-gray-200 text-gray-900 shadow-inner' 
                          : 'border-transparent text-gray-400 hover:text-gray-900 hover:bg-white hover:border-gray-200 hover:shadow-sm'
                      }`}
                      aria-expanded={activeDropdownUserId === user.id}
                      aria-haspopup="true"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    {activeDropdownUserId === user.id && (
                      <div className="absolute right-8 top-12 mt-1 w-48 rounded-xl bg-white border border-gray-100 shadow-xl py-1.5 z-[100] animate-in fade-in zoom-in-95 duration-200">
                        <button
                          onClick={() => {
                            handleToggleStatus(user);
                            setActiveDropdownUserId(null);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2.5 transition-colors"
                        >
                          <ShieldAlert className="h-4 w-4 text-gray-400" />
                          {user.isActive !== false ? "Deactivate User" : "Activate User"}
                        </button>
                        <button
                          onClick={() => {
                            handleResetPassword(user);
                            setActiveDropdownUserId(null);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2.5 transition-colors"
                        >
                          <Mail className="h-4 w-4 text-gray-400" />
                          Reset Password
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Search className="h-8 w-8 mb-3 opacity-20" />
                    <p className="text-sm font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setActiveDropdownUserId(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleToggleStatus = async (user: any) => {
    const isSchoolAdmin = user.role === 'SchoolAdmin';
    const isTeacher = user.role === 'Teacher';
    const isStudent = user.role === 'Student';
    
    const promise = (async () => {
      if (isSchoolAdmin) {
        const schoolId = user.id.replace('_admin', '');
        await schoolApi.toggleStatus(schoolId);
      } else if (isTeacher) {
        await teacherApi.updateStatus(user.id);
      } else if (isStudent) {
        await studentApi.update(user.id, { 
          status: user.isActive !== false ? 'Suspended' : 'Active' 
        });
      } else {
        throw new Error('Unsupported user role');
      }

      setUsers(prev => prev.map(u => {
        if (u.id === user.id) {
          return { ...u, isActive: !u.isActive };
        }
        return u;
      }));
    })();

    toast.promise(promise, {
      loading: `Updating status for ${user.name}...`,
      success: `Successfully updated status for ${user.name}`,
      error: (err) => err instanceof Error ? err.message : `Failed to update status for ${user.name}`
    });
  };

  const handleResetPassword = async (user: any) => {
    const hasEmail = user.email && user.email !== 'No email' && user.email.includes('@');
    
    const promise = (async () => {
      if (hasEmail) {
        await authApi.forgotPassword({ email: user.email });
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    })();

    toast.promise(promise, {
      loading: `Sending password reset link for ${user.name}...`,
      success: hasEmail 
        ? `Password reset link sent to ${user.email}` 
        : `Temporary password reset link generated for ${user.name} (Simulated)`,
      error: `Failed to request password reset for ${user.name}`
    });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // Use server-side API route to bypass CORS header restrictions
        const token = typeof window !== 'undefined' ? localStorage.getItem('leoned_token') : null;
        const res = await fetch('/api/global-users', {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch users: ${res.status}`);
        }

        const data = await res.json();
        const { schools = [], teachers = [], students = [] } = data;

        const allUsers: any[] = [];

        // Add Administrators (Schools)
        schools.forEach((s: any) => {
          if (s.adminName || s.email || s.name) {
            allUsers.push({
              id: s.id + '_admin',
              name: s.adminName || s.name || 'Admin',
              email: s.email || 'No email',
              role: 'SchoolAdmin',
              createdAt: s.createdAt,
              isActive: s.isActive
            });
          }
        });

        // Add Teachers
        teachers.forEach((t: any) => {
          if (t && !allUsers.some(u => u.id === t.id)) {
            allUsers.push({
              id: t.id,
              name: t.fullName || t.name || 'Unknown',
              email: t.email || 'No email',
              role: 'Teacher',
              createdAt: t.createdAt,
              isActive: t.isActive
            });
          }
        });

        // Add Students
        students.forEach((st: any) => {
          if (st && !allUsers.some(u => u.id === st.id)) {
            allUsers.push({
              id: st.id,
              name: st.fullName || st.name || 'Unknown',
              email: st.email || st.parentEmail || 'No email',
              role: 'Student',
              createdAt: st.createdAt,
              isActive: st.isActive
            });
          }
        });

        setUsers(allUsers);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Global User Directory</h1>
          <p className="text-gray-500 text-lg max-w-2xl">Manage administrative access, faculty, and students across the entire LeonEd platform.</p>
        </div>
        <button className="group flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#053d26] to-[#0a5c3b] text-white px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-green-900/20 hover:shadow-xl hover:shadow-green-900/30 hover:-translate-y-0.5 transition-all duration-300">
          <UserPlus className="h-5 w-5 transition-transform group-hover:scale-110" />
          <span>Invite Admin</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden ring-1 ring-black/5">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/30">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#053d26] transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name or email..."
              className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-[#053d26]/20 focus:border-[#053d26] transition-all text-gray-900 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm">
            <Filter className="h-4 w-4" />
            Filter Status
          </button>
        </div>

        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-white p-4 rounded-full shadow-md border border-gray-100">
                <Loader2 className="h-8 w-8 animate-spin text-[#053d26]" />
              </div>
            </div>
            <p className="text-gray-500 font-medium text-lg animate-pulse">Retrieving authorized users...</p>
          </div>
        ) : error ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4 text-center px-4">
            <div className="h-16 w-16 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 mb-2 border border-red-100 shadow-sm">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Failed to load directory</h3>
            <p className="text-gray-500 max-w-md">{error}</p>
          </div>
        ) : (() => {
          const filteredUsers = users.filter(user => {
            const query = searchQuery.toLowerCase();
            return (
              (user.name || "").toLowerCase().includes(query) ||
              (user.email || "").toLowerCase().includes(query)
            );
          });

          const admins = filteredUsers.filter(u => u.role === 'SchoolAdmin');
          const teachers = filteredUsers.filter(u => u.role === 'Teacher');
          const students = filteredUsers.filter(u => u.role === 'Student');

          return (
            <div className="divide-y divide-gray-100">
              {/* Section 1: Admins */}
              <div className="bg-white">
                <button 
                  onClick={() => toggleGroup('admins')}
                  className="w-full flex items-center justify-between p-6 md:px-8 hover:bg-blue-50/30 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-105 group-hover:bg-blue-100 transition-all">
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-gray-900 text-lg flex items-center gap-3">
                        School Administrators
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          {admins.length} {admins.length === 1 ? 'Admin' : 'Admins'}
                        </span>
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">Manage users with school-level administrative privileges</p>
                    </div>
                  </div>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center border border-gray-200 text-gray-400 group-hover:border-blue-200 group-hover:bg-white group-hover:text-blue-600 transition-all ${expandedGroups.admins ? 'rotate-180 bg-gray-50' : ''}`}>
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </button>
                <div className={`transition-all duration-300 ease-in-out ${expandedGroups.admins ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                  {renderUserTable(admins, "No administrators found matching search criteria")}
                </div>
              </div>

              {/* Section 2: Teachers */}
              <div className="bg-white">
                <button 
                  onClick={() => toggleGroup('teachers')}
                  className="w-full flex items-center justify-between p-6 md:px-8 hover:bg-emerald-50/30 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-105 group-hover:bg-emerald-100 transition-all">
                      <Users className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-gray-900 text-lg flex items-center gap-3">
                        Faculty & Teachers
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          {teachers.length} {teachers.length === 1 ? 'Teacher' : 'Teachers'}
                        </span>
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">Manage instructional staff across all institutions</p>
                    </div>
                  </div>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center border border-gray-200 text-gray-400 group-hover:border-emerald-200 group-hover:bg-white group-hover:text-emerald-600 transition-all ${expandedGroups.teachers ? 'rotate-180 bg-gray-50' : ''}`}>
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </button>
                <div className={`transition-all duration-300 ease-in-out ${expandedGroups.teachers ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                  {renderUserTable(teachers, "No teachers found. Note: SuperAdmins cannot view teacher lists yet until backend support is added.")}
                </div>
              </div>

              {/* Section 3: Students */}
              <div className="bg-white">
                <button 
                  onClick={() => toggleGroup('students')}
                  className="w-full flex items-center justify-between p-6 md:px-8 hover:bg-orange-50/30 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-105 group-hover:bg-orange-100 transition-all">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-gray-900 text-lg flex items-center gap-3">
                        Students
                        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          {students.length} {students.length === 1 ? 'Student' : 'Students'}
                        </span>
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">Manage enrolled learners across the platform</p>
                    </div>
                  </div>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center border border-gray-200 text-gray-400 group-hover:border-orange-200 group-hover:bg-white group-hover:text-orange-600 transition-all ${expandedGroups.students ? 'rotate-180 bg-gray-50' : ''}`}>
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </button>
                <div className={`transition-all duration-300 ease-in-out ${expandedGroups.students ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                  {renderUserTable(students, "No students found. Note: SuperAdmins cannot view student lists yet until backend support is added.")}
                </div>
              </div>
            </div>
          );
        })()}

        <div className="px-6 md:px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-900">{
              users.filter(user => {
                const query = searchQuery.toLowerCase();
                return (
                  (user.name || "").toLowerCase().includes(query) ||
                  (user.email || "").toLowerCase().includes(query)
                );
              }).length
            }</span> of {users.length} Users
          </p>
          <div className="flex items-center gap-2">
            <button disabled className="p-2 rounded-xl border border-gray-200 bg-white text-gray-400 opacity-50 cursor-not-allowed"><ChevronLeft className="h-5 w-5" /></button>
            <button disabled className="p-2 rounded-xl border border-gray-200 bg-white text-gray-400 opacity-50 cursor-not-allowed"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
