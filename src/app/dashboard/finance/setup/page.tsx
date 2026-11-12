"use client";

import { useState, useEffect } from "react";
import { feeStructureApi, FeeStructure, classApi } from "@/lib/api";
import { Plus, Edit, Trash2, Save, X, Settings2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function FeeStructureSetup() {
  const router = useRouter();
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableLevels, setAvailableLevels] = useState<string[]>([]);

  // Edit/Add modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<Partial<FeeStructure> | null>(null);
  const [feeToDelete, setFeeToDelete] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [legacyData, setLegacyData] = useState<ReturnType<typeof feeStructureApi.getLegacyLocalData>>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadStructures();
  }, []);

  const loadStructures = async () => {
    setLoading(true);
    try {
      const [data, classes] = await Promise.all([
        feeStructureApi.getStructures(),
        classApi.getAll().catch(() => [])
      ]);
      setStructures(data);
      // Fees saved in this browser before fee setup moved to the server can be imported once
      setLegacyData(data.length === 0 ? feeStructureApi.getLegacyLocalData() : null);

      const levels = Array.from(new Set(classes.map(c => c.name || (c as any).className || '').filter(Boolean)));
      setAvailableLevels(levels as string[]);
    } catch (err) {
      toast.error("Failed to load fee structures");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingStructure?.name?.trim() || !editingStructure.amount || editingStructure.amount <= 0) {
      toast.error("Enter a fee name and an amount greater than zero");
      return;
    }
    const type = editingStructure.type || 'base';
    if (type === 'base' && !(editingStructure.applicableLevels || []).length) {
      toast.error("Select the classes this fee applies to, or All classes");
      return;
    }

    const payload = {
      name: editingStructure.name.trim(),
      amount: editingStructure.amount,
      type,
      applicableLevels: type === 'base' ? editingStructure.applicableLevels || [] : [],
    };

    setIsSaving(true);
    try {
      if (editingStructure.id) {
        const updated = await feeStructureApi.updateStructure(editingStructure.id, payload);
        setStructures(prev => prev.map(s => s.id === updated.id ? updated : s));
      } else {
        const created = await feeStructureApi.createStructure(payload);
        setStructures(prev => [...prev, created]);
        setLegacyData(null);
      }
      toast.success("Fee saved");
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save fee");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    setFeeToDelete(id);
  };

  const confirmDelete = async () => {
    if (!feeToDelete) return;
    try {
      await feeStructureApi.deleteStructure(feeToDelete);
      setStructures(prev => prev.filter(s => s.id !== feeToDelete));
      toast.success("Fee deleted");
      setFeeToDelete(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete fee");
    }
  };

  // Recreate fees from this browser's old local storage on the server, keeping custom fee assignments
  const handleImportLegacy = async () => {
    if (!legacyData) return;
    setIsImporting(true);
    try {
      const idMap = new Map<string, string>();
      const created: FeeStructure[] = [];
      for (const fee of legacyData.structures) {
        if (!fee.name || !(fee.amount > 0)) continue;
        const type = fee.type === 'custom' ? 'custom' : 'base';
        const levels = type === 'base' && fee.applicableLevels?.length ? fee.applicableLevels : (type === 'base' ? ['All'] : []);
        const saved = await feeStructureApi.createStructure({ name: fee.name, amount: fee.amount, type, applicableLevels: levels });
        idMap.set(fee.id, saved.id);
        created.push(saved);
      }
      for (const [studentId, feeIds] of Object.entries(legacyData.customFees || {})) {
        const mapped = feeIds.map(id => idMap.get(id)).filter((id): id is string => Boolean(id));
        if (mapped.length > 0) await feeStructureApi.saveStudentCustomFees(studentId, mapped).catch(() => {});
      }
      feeStructureApi.clearLegacyLocalData();
      setStructures(created);
      setLegacyData(null);
      toast.success(`Imported ${created.length} fee${created.length === 1 ? '' : 's'}`);
    } catch (err: any) {
      toast.error(err?.message || "Import failed. Some fees may have been imported; refresh to check.");
    } finally {
      setIsImporting(false);
    }
  };

  const openModal = (struct?: FeeStructure) => {
    if (struct) {
      setEditingStructure({ ...struct });
    } else {
      setEditingStructure({ type: 'base', applicableLevels: [], name: '' });
    }
    setIsModalOpen(true);
  };

  const toggleLevel = (level: string) => {
    if (!editingStructure) return;
    const currentLevels = editingStructure.applicableLevels || [];
    if (level === 'All') {
      setEditingStructure({ ...editingStructure, applicableLevels: currentLevels.includes('All') ? [] : ['All'] });
      return;
    }
    const withoutAll = currentLevels.filter(l => l !== 'All');
    setEditingStructure({
      ...editingStructure,
      applicableLevels: withoutAll.includes(level) ? withoutAll.filter(l => l !== level) : [...withoutAll, level],
    });
  };

  const baseFees = structures.filter(s => s.type === 'base');
  const customFees = structures.filter(s => s.type === 'custom');

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard/finance')}
            className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#053d26]">Fee Configuration</h1>
            <p className="text-gray-600 text-sm mt-1">Setup base level fees and customized additions</p>
          </div>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add New Fee
        </button>
      </div>

      {!loading && legacyData && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-amber-900">Fees found in this browser</p>
            <p className="text-sm text-amber-800 mt-1">
              {legacyData.structures.length} fee{legacyData.structures.length === 1 ? '' : 's'} were set up before fee settings were saved to your school account. Import them so every device and the bursar see the same fees.
            </p>
          </div>
          <button
            onClick={handleImportLegacy}
            disabled={isImporting}
            className="shrink-0 px-5 py-2.5 rounded-full bg-amber-600 text-white font-bold hover:bg-amber-700 disabled:opacity-60 transition-colors"
          >
            {isImporting ? "Importing..." : "Import fees"}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#053d26]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Base Fees Column */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Base Fees (By Level)</h2>
            <p className="text-sm text-gray-500 mb-4">These fees apply automatically to every student in the selected levels.</p>
            {baseFees.length === 0 && <p className="text-sm text-gray-400 italic">No base fees defined.</p>}
            
            {baseFees.map(fee => (
              <div key={fee.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative group">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{fee.name}</h3>
                    <p className="text-[#053d26] font-black text-lg mt-1">₦{fee.amount.toLocaleString()}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {fee.applicableLevels?.map(lvl => (
                        <span key={lvl} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-bold uppercase tracking-wider">
                          {lvl === 'All' ? 'All classes' : lvl}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openModal(fee)} aria-label={`Edit ${fee.name}`} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => handleDelete(fee.id)} aria-label={`Delete ${fee.name}`} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Fees Column */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Custom Fees (Ad-Hoc)</h2>
            <p className="text-sm text-gray-500 mb-4">These are optional fees (like Bus Levy) you can manually assign to specific students.</p>
            {customFees.length === 0 && <p className="text-sm text-gray-400 italic">No custom fees defined.</p>}
            
            {customFees.map(fee => (
              <div key={fee.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative group">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{fee.name}</h3>
                    <p className="text-amber-600 font-black text-lg mt-1">₦{fee.amount.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openModal(fee)} aria-label={`Edit ${fee.name}`} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => handleDelete(fee.id)} aria-label={`Delete ${fee.name}`} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && editingStructure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-lg text-gray-900">
                {editingStructure.id ? "Edit Fee" : "Add New Fee"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                {([
                  { type: 'base', title: 'Base Fee', desc: 'Applies automatically to whole classes' },
                  { type: 'custom', title: 'Custom Fee', desc: 'Assigned to individual students (e.g. Bus Levy)' },
                ] as const).map(option => {
                  const selected = (editingStructure.type || 'base') === option.type;
                  return (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => setEditingStructure({ ...editingStructure, type: option.type })}
                      className={`p-4 rounded-xl border text-left transition-colors ${selected ? 'border-[#053d26] bg-[#053d26]/5' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <div className="font-bold text-gray-900 mb-1">{option.title}</div>
                      <div className="text-xs text-gray-500">{option.desc}</div>
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fee Name</label>
                <input 
                  type="text" 
                  value={editingStructure.name || ''} 
                  onChange={e => setEditingStructure({ ...editingStructure, name: e.target.value })}
                  placeholder="e.g. Basic School Fee, Bus Levy"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 font-medium text-gray-900 outline-none focus:border-[#053d26] focus:ring-1 focus:ring-[#053d26] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amount per term (₦)</label>
                <input 
                  type="number" 
                  min="0"
                  value={editingStructure.amount ?? ''} 
                  onChange={e => setEditingStructure({ ...editingStructure, amount: e.target.value === '' ? undefined : Number(e.target.value) })}
                  placeholder="e.g. 50000"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 font-medium text-gray-900 outline-none focus:border-[#053d26] focus:ring-1 focus:ring-[#053d26] transition-all"
                />
              </div>

              {(editingStructure.type || 'base') === 'base' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Applies to</label>
                  <div className="flex flex-wrap gap-2">
                    {['All', ...availableLevels].map(level => {
                      const isSelected = editingStructure.applicableLevels?.includes(level);
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => toggleLevel(level)}
                          className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${isSelected ? 'bg-[#053d26] text-white border-[#053d26]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                          {level === 'All' ? 'All classes' : level}
                        </button>
                      );
                    })}
                  </div>
                  {availableLevels.length === 0 && (
                    <p className="text-xs text-gray-500 mt-2">No classes yet. Create classes first, or choose All classes.</p>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-500">Bank details for payments are set once for the school in Settings &rsaquo; School Profile.</p>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-full font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] disabled:opacity-60 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save Fee"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {feeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="font-bold text-xl text-gray-900">Delete Fee Structure?</h3>
            <p className="text-gray-500 text-sm">
              Are you sure you want to delete this fee? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 pt-4">
              <button 
                onClick={() => setFeeToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 rounded-full bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
