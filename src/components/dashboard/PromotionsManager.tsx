"use client";

import React, { useState, useEffect } from "react";
import { promotionApi, classApi, SchoolClass, AcademicSession } from "@/lib/api";
import { Loader2, ArrowRight, GraduationCap, AlertCircle, Save } from "lucide-react";
import { toast } from "react-hot-toast";

export default function PromotionsManager({ currentSession, sessions }: { currentSession?: AcademicSession, sessions: AcademicSession[] }) {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mapping states: sourceClassId -> targetClassId | 'GRADUATE'
  const [mappings, setMappings] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(true);
      try {
        const data = await classApi.getAll();
        setClasses(data);
      } catch (err) {
        console.error("Failed to load classes", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const otherSessions = sessions.filter(s => !s.isCurrent);
  const [selectedSourceSessionId, setSelectedSourceSessionId] = useState<string>("");

  useEffect(() => {
    if (otherSessions.length > 0 && !selectedSourceSessionId) {
      setSelectedSourceSessionId(otherSessions[0].id);
    }
  }, [otherSessions, selectedSourceSessionId]);

  const sourceClasses = classes.filter(c => c.academicSessionId === selectedSourceSessionId);
  const currentClasses = classes.filter(c => c.academicSessionId === currentSession?.id);

  const handleMappingChange = (sourceId: string, targetId: string) => {
    setMappings(prev => ({ ...prev, [sourceId]: targetId }));
  };

  const handlePromoteAll = async () => {
    const toPromote: { sourceClassId: string, targetClassId: string }[] = [];
    const toGraduate: string[] = [];

    Object.entries(mappings).forEach(([source, target]) => {
      if (!target) return;
      if (target === 'GRADUATE') {
        toGraduate.push(source);
      } else {
        toPromote.push({ sourceClassId: source, targetClassId: target });
      }
    });

    if (toPromote.length === 0 && toGraduate.length === 0) {
      toast.error("No mappings configured. Please map at least one class.");
      return;
    }

    if (!window.confirm(`Are you sure you want to run this promotion? This action is atomic.`)) return;

    setIsProcessing(true);
    let successCount = 0;

    try {
      if (toPromote.length > 0) {
        const res = await promotionApi.promote({ mappings: toPromote });
        successCount += (res as any)?.totalPromoted || 0;
      }
      
      for (const classId of toGraduate) {
        await promotionApi.graduate({ classId });
      }
      
      toast.success(`Promotion successful!`);
      // Clear mapped ones
      setMappings({});
    } catch (e: any) {
      toast.error(e.message || "Failed to promote classes");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!currentSession) {
    return (
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500" />
        <p className="text-gray-600 font-medium">Please set an active academic session first to use the promotion tool.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Bulk Class Promotion</h3>
          <p className="text-sm text-gray-500">Map previous session classes to the new current session ({currentSession.name}).</p>
        </div>
        
        <div className="w-full md:w-72">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Source Session</label>
          <select
            value={selectedSourceSessionId}
            onChange={(e) => setSelectedSourceSessionId(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#053d26]/20"
          >
            <option value="">-- Select Old Session --</option>
            {otherSessions.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#053d26]" />
        </div>
      ) : !selectedSourceSessionId ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">Select a source session to load classes for promotion.</p>
        </div>
      ) : sourceClasses.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">No classes found in this session.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
            <div className="font-bold text-gray-700 uppercase tracking-wider text-xs px-2">Old Class (Source)</div>
            <div className="w-8"></div>
            <div className="font-bold text-gray-700 uppercase tracking-wider text-xs px-2">New Class (Target)</div>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
            {sourceClasses.map(sc => (
              <div key={sc.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-gray-200 bg-white shadow-sm transition-colors">
                <div className="flex-1 px-3 py-2 bg-gray-50 rounded-lg">
                  <p className="font-bold text-gray-900">{sc.name} {sc.arm || ''}</p>
                </div>
                
                <div className="text-gray-400">
                  <ArrowRight className="w-5 h-5" />
                </div>
                
                <div className="flex-1">
                  <select
                    value={mappings[sc.id] || ""}
                    onChange={(e) => handleMappingChange(sc.id, e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border font-medium focus:outline-none focus:ring-2 focus:ring-[#053d26]/20 ${
                      mappings[sc.id] === 'GRADUATE' ? 'bg-[#b05e1c]/10 border-[#b05e1c]/30 text-[#b05e1c]' :
                      mappings[sc.id] ? 'bg-[#053d26]/5 border-[#053d26]/30 text-[#053d26]' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <option value="">-- Do Not Promote --</option>
                    <option value="GRADUATE">🎓 Graduate Students</option>
                    <optgroup label="Promote to Class:">
                      {currentClasses.map(cc => (
                        <option key={cc.id} value={cc.id}>{cc.name} {cc.arm || ''}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={handlePromoteAll}
              disabled={isProcessing || Object.values(mappings).filter(Boolean).length === 0}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-all disabled:opacity-50 shadow-md"
            >
              {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Execute Promotion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
