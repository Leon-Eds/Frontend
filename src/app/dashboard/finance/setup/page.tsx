"use client";

import { useState, useEffect } from "react";
import { feeStructureApi, FeeStructure } from "@/lib/api";
import { Plus, Edit, Trash2, Save, X, Settings2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AVAILABLE_LEVELS = ["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"];

export default function FeeStructureSetup() {
  const router = useRouter();
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit/Add modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<Partial<FeeStructure> | null>(null);
  const [feeToDelete, setFeeToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadStructures();
  }, []);

  const loadStructures = async () => {
    setLoading(true);
    try {
      const data = await feeStructureApi.getStructures();
      setStructures(data || []);
    } catch (err) {
      toast.error("Failed to load fee structures");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingStructure?.name || !editingStructure.amount) {
      toast.error("Name and amount are required");
      return;
    }

    let updatedStructures = [...structures];
    if (editingStructure.id) {
      updatedStructures = updatedStructures.map(s => s.id === editingStructure.id ? editingStructure as FeeStructure : s);
    } else {
      const newStruct: FeeStructure = {
        ...editingStructure,
        id: `fs_${Date.now()}`,
        type: editingStructure.type || 'base',
        applicableLevels: editingStructure.type === 'base' ? (editingStructure.applicableLevels || []) : [],
      } as FeeStructure;
      updatedStructures.push(newStruct);
    }

    try {
      await feeStructureApi.saveStructures(updatedStructures);
      setStructures(updatedStructures);
      toast.success("Fee structure saved successfully");
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Failed to save fee structure");
    }
  };

  const handleDelete = (id: string) => {
    setFeeToDelete(id);
  };

  const confirmDelete = async () => {
    if (!feeToDelete) return;
    const updatedStructures = structures.filter(s => s.id !== feeToDelete);
    try {
      await feeStructureApi.saveStructures(updatedStructures);
      setStructures(updatedStructures);
      toast.success("Fee deleted");
      setFeeToDelete(null);
    } catch (err) {
      toast.error("Failed to delete fee");
    }
  };

  const openModal = (struct?: FeeStructure) => {
    if (struct) {
      setEditingStructure({ ...struct });
    } else {
      setEditingStructure({ type: 'base', applicableLevels: [], amount: 0, name: '' });
    }
    setIsModalOpen(true);
  };

  const toggleLevel = (level: string) => {
    if (!editingStructure) return;
    const currentLevels = editingStructure.applicableLevels || [];
    if (currentLevels.includes(level)) {
      setEditingStructure({ ...editingStructure, applicableLevels: currentLevels.filter(l => l !== level) });
    } else {
      setEditingStructure({ ...editingStructure, applicableLevels: [...currentLevels, level] });
    }
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
                          {lvl}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                    <button onClick={() => openModal(fee)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(fee.id)} className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
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
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                    <button onClick={() => openModal(fee)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(fee.id)} className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
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
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">
                {editingStructure.id ? "Edit Fee" : "Add New Fee"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border cursor-pointer transition-colors ${editingStructure.type === 'base' ? 'border-[#053d26] bg-[#053d26]/5' : 'border-gray-200 hover:border-[#053d26]/30'}`} onClick={() => setEditingStructure({ ...editingStructure, type: 'base' })}>
                  <div className="font-bold text-gray-900 mb-1">Base Fee</div>
                  <div className="text-xs text-gray-500">Applies automatically to entire levels</div>
                </div>
                <div className={`p-4 rounded-xl border cursor-pointer transition-colors ${editingStructure.type === 'custom' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-500/30'}`} onClick={() => setEditingStructure({ ...editingStructure, type: 'custom' })}>
                  <div className="font-bold text-gray-900 mb-1">Custom Fee</div>
                  <div className="text-xs text-gray-500">Assigned manually per student</div>
                </div>
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
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amount (₦)</label>
                <input 
                  type="number" 
                  value={editingStructure.amount || ''} 
                  onChange={e => setEditingStructure({ ...editingStructure, amount: Number(e.target.value) })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 font-medium text-gray-900 outline-none focus:border-[#053d26] focus:ring-1 focus:ring-[#053d26] transition-all"
                />
              </div>

              {editingStructure.type === 'base' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Applicable Levels</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_LEVELS.map(level => {
                      const isSelected = editingStructure.applicableLevels?.includes(level);
                      return (
                        <button
                          key={level}
                          onClick={() => toggleLevel(level)}
                          className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${isSelected ? 'bg-[#053d26] text-white border-[#053d26]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-full font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" />
                Save Fee
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
