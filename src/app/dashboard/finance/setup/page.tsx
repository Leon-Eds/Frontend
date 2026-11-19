"use client";

import { useState, useEffect } from "react";
import { feeStructureApi, FeeStructure, classApi } from "@/lib/api";
import { Plus, Edit, Trash2, Save, X, Settings2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export default function FeeStructureSetup() {
  const { t } = useLanguage();
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
      toast.error(t("fs.load_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingStructure?.name?.trim() || !editingStructure.amount || editingStructure.amount <= 0) {
      toast.error(t("fs.name_amount_req"));
      return;
    }
    const type = editingStructure.type || 'base';
    if (type === 'base' && !(editingStructure.applicableLevels || []).length) {
      toast.error(t("fs.classes_req"));
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
      toast.success(t("fs.saved"));
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || t("fs.save_failed"));
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
      toast.success(t("fs.deleted"));
      setFeeToDelete(null);
    } catch (err: any) {
      toast.error(err?.message || t("fs.delete_failed"));
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
      toast.success(t(created.length === 1 ? "fs.imported_one" : "fs.imported_many", { n: created.length }));
    } catch (err: any) {
      toast.error(err?.message || t("fs.import_failed"));
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
            <h1 className="text-3xl font-bold text-[#053d26]">{t("fs.title")}</h1>
            <p className="text-gray-600 text-sm mt-1">{t("fs.subtitle")}</p>
          </div>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          {t("fs.add")}
        </button>
      </div>

      {!loading && legacyData && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-amber-900">{t("fs.legacy_title")}</p>
            <p className="text-sm text-amber-800 mt-1">
              {t(legacyData.structures.length === 1 ? "fs.legacy_one" : "fs.legacy_many", { n: legacyData.structures.length })}
            </p>
          </div>
          <button
            onClick={handleImportLegacy}
            disabled={isImporting}
            className="shrink-0 px-5 py-2.5 rounded-full bg-amber-600 text-white font-bold hover:bg-amber-700 disabled:opacity-60 transition-colors"
          >
            {isImporting ? t("fs.importing") : t("fs.import")}
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
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">{t("fs.base")}</h2>
            <p className="text-sm text-gray-500 mb-4">{t("fs.base_d")}</p>
            {baseFees.length === 0 && <p className="text-sm text-gray-400 italic">{t("fs.no_base")}</p>}
            
            {baseFees.map(fee => (
              <div key={fee.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative group">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{fee.name}</h3>
                    <p className="text-[#053d26] font-black text-lg mt-1">₦{fee.amount.toLocaleString()}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {fee.applicableLevels?.map(lvl => (
                        <span key={lvl} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-bold uppercase tracking-wider">
                          {lvl === 'All' ? t("fs.all_classes") : lvl}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openModal(fee)} aria-label={t("fs.edit_aria", { name: fee.name })} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg">
                      <Edit className="w-3.5 h-3.5" /> {t("ah.edit")}
                    </button>
                    <button onClick={() => handleDelete(fee.id)} aria-label={t("fs.delete_aria", { name: fee.name })} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5" /> {t("common.delete")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Fees Column */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">{t("fs.custom")}</h2>
            <p className="text-sm text-gray-500 mb-4">{t("fs.custom_d")}</p>
            {customFees.length === 0 && <p className="text-sm text-gray-400 italic">{t("fee.no_custom")}</p>}
            
            {customFees.map(fee => (
              <div key={fee.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative group">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{fee.name}</h3>
                    <p className="text-amber-600 font-black text-lg mt-1">₦{fee.amount.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openModal(fee)} aria-label={t("fs.edit_aria", { name: fee.name })} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg">
                      <Edit className="w-3.5 h-3.5" /> {t("ah.edit")}
                    </button>
                    <button onClick={() => handleDelete(fee.id)} aria-label={t("fs.delete_aria", { name: fee.name })} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5" /> {t("common.delete")}
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
                {editingStructure.id ? t("fs.edit_fee") : t("fs.add")}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                {([
                  { type: 'base', title: t("fs.base_fee"), desc: t("fs.base_fee_d") },
                  { type: 'custom', title: t("fs.custom_fee"), desc: t("fs.custom_fee_d") },
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
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("fs.fee_name")}</label>
                <input 
                  type="text" 
                  value={editingStructure.name || ''} 
                  onChange={e => setEditingStructure({ ...editingStructure, name: e.target.value })}
                  placeholder={t("fs.fee_name_ph")}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 font-medium text-gray-900 outline-none focus:border-[#053d26] focus:ring-1 focus:ring-[#053d26] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("fs.amount")}</label>
                <input 
                  type="number" 
                  min="0"
                  value={editingStructure.amount ?? ''} 
                  onChange={e => setEditingStructure({ ...editingStructure, amount: e.target.value === '' ? undefined : Number(e.target.value) })}
                  placeholder={t("fs.amount_ph")}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 font-medium text-gray-900 outline-none focus:border-[#053d26] focus:ring-1 focus:ring-[#053d26] transition-all"
                />
              </div>

              {(editingStructure.type || 'base') === 'base' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("fs.applies")}</label>
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
                          {level === 'All' ? t("fs.all_classes") : level}
                        </button>
                      );
                    })}
                  </div>
                  {availableLevels.length === 0 && (
                    <p className="text-xs text-gray-500 mt-2">{t("fs.no_classes")}</p>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-500">{t("fs.bank_note")}</p>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-full font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] disabled:opacity-60 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" />
                {isSaving ? t("common.saving") : t("fs.save_fee")}
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
            <h3 className="font-bold text-xl text-gray-900">{t("fs.delete_title")}</h3>
            <p className="text-gray-500 text-sm">
              {t("fs.delete_d")}
            </p>
            <div className="flex items-center gap-3 pt-4">
              <button 
                onClick={() => setFeeToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 rounded-full bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-sm"
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
