"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { UserPlus, X, Loader2, Users, MoreVertical, Sparkles, AlertCircle } from 'lucide-react';
import { staffApi, Staff, CreateStaffRequest, UpdateStaffRequest, bursarApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function StaffDirectory() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  
  const [formData, setFormData] = useState<CreateStaffRequest>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'Bursar',
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  const [editModal, setEditModal] = useState<{isOpen: boolean, staff: Staff | null}>({isOpen: false, staff: null});
  const [editFormData, setEditFormData] = useState<UpdateStaffRequest>({
    fullName: '',
    phone: '',
    role: '',
  });

  const [activeStaff, setActiveStaff] = useState<Staff | null>(null);

  const fetchStaffs = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data: any = await staffApi.getAll();
      let validItems: any[] = [];
      
      if (Array.isArray(data)) {
        validItems = data;
      } else if (data && typeof data === 'object') {
        // Find the first value that is an array (e.g. data.bursars, data.content, etc.)
        const arrayValues = Object.values(data).filter(v => Array.isArray(v));
        if (arrayValues.length > 0) {
          validItems = arrayValues[0] as any[];
        }
      }
      
      setStaff(validItems);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load staff";
      if (message.includes("404")) {
        setStaff([]);
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffs();
  }, [fetchStaffs]);

  const handleCreateStaff = async (e: React.FormEvent) => {
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

    if (formData.password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (formData.role === 'Bursar' || formData.role === 'Bursar / Finance Officer') {
        const { role, ...bursarPayload } = formData;
        console.log('[Staff Page] Creating Bursar with payload:', JSON.stringify(bursarPayload, null, 2));
        await bursarApi.create(bursarPayload);
      } else {
        console.log('[Staff Page] Creating Staff with payload:', JSON.stringify(formData, null, 2));
        await staffApi.create(formData);
      }
      toast.success("Staff created successfully!");
      setShowModal(false);
      setFormData({ fullName: '', email: '', phone: '', password: '', role: 'Bursar' });
      setConfirmPassword('');
      await fetchStaffs();
    } catch (err: unknown) {
      console.error('[Staff Page] Creation failed. Full error:', err);
      const message = err instanceof Error ? err.message : "Failed to create staff";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.staff) return;
    setFormError("");

    if (!editFormData.fullName?.trim()) {
      setFormError("Full name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await staffApi.update(editModal.staff.id, editFormData);
      toast.success("Staff updated successfully!");
      setEditModal({isOpen: false, staff: null});
      if (activeStaff && activeStaff.id === editModal.staff.id) {
         setActiveStaff({ ...activeStaff, ...updated });
      }
      await fetchStaffs();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to update staff");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    
    try {
      await staffApi.delete(id);
      toast.success("Staff deleted successfully");
      if (activeStaff?.id === id) setActiveStaff(null);
      await fetchStaffs();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete staff");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#053d26]" />
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Loading Support Staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-br from-white to-gray-50 p-6 lg:p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#053d26]/5 to-[#20c997]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-gray-200/60 backdrop-blur-sm mb-2 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-600">Personnel Management</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
            Support Staff
          </h1>
          <p className="text-sm lg:text-base text-gray-500 max-w-xl leading-relaxed">
            Manage your administrative and support staff. Create accounts for Bursars, Librarians, and other essential roles.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <button
            onClick={() => setShowModal(true)}
            className="group relative inline-flex items-center gap-2 rounded-2xl bg-[#053d26] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#064e31] hover:shadow-lg hover:shadow-[#053d26]/20 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <UserPlus className="h-4 w-4 relative z-10" />
            <span className="relative z-10">Add Staff</span>
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center h-[400px]">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to load staff</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md">{error}</p>
          <button 
            onClick={fetchStaffs}
            className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : staff.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center h-[400px]">
          <div className="w-16 h-16 bg-[#053d26]/5 text-[#053d26] rounded-full flex items-center justify-center mb-4 ring-8 ring-[#053d26]/[0.02]">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No staff yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md">Add your first support staff member to get started.</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2.5 rounded-xl bg-[#053d26] text-white text-sm font-semibold hover:bg-[#064e31] transition-colors inline-flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Staff
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {staff.map((s) => (
            <div key={s.id} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:border-[#20c997]/30 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#053d26] to-[#0a5c3a] text-white flex items-center justify-center text-lg font-bold shadow-sm">
                    {s.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1">{s.fullName}</h3>
                    <p className="text-xs text-gray-500">{s.email}</p>
                  </div>
                </div>
                <div className="relative">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#053d26]/10 text-[#053d26]">
                    {s.role || "Staff"}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  ID: {s.id.substring(0, 8)}
                </div>
                <button
                  onClick={() => handleDeleteStaff(s.id)}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSubmitting && setShowModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Add New Staff</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateStaff} className="p-6">
              {formError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-medium">{formError}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26]"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26]"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
                  <input
                    type="text"
                    value="Bursar / Finance Officer"
                    disabled
                    className="block w-full rounded-xl border border-gray-200 bg-gray-100 py-3 px-4 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26]"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26]"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-[#053d26] hover:bg-[#064e31] rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
