"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Save, Trash2, BookOpen, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { schemeOfWorkApi, teacherPortalApi, classApi, subjectApi, sessionApi, dashboardApi } from "@/lib/api";
import toast from "react-hot-toast";

interface Topic {
  week: number;
  topic: string;
  description: string;
}

export default function SchemeOfWorkPage() {
  const router = useRouter();
  
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [currentTermId, setCurrentTermId] = useState("");
  const [currentSessionName, setCurrentSessionName] = useState("");
  
  const [topics, setTopics] = useState<Topic[]>([]);
  const [existingId, setExistingId] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const storedUser = localStorage.getItem("leoned_user");
        if (!storedUser) return;
        const user = JSON.parse(storedUser);
        const role = user.role?.toLowerCase() || "";
        const isAdmin = role === "admin" || role === "superadmin";

        let sessionData: any = null;
        let dashboardStats: any = null;
        let classList: {id: string, name: string}[] = [];
        let subjectList: {id: string, name: string}[] = [];
        
        try {
          [sessionData, dashboardStats] = await Promise.all([
            sessionApi.getAll().catch(() => []),
            dashboardApi.getTeacherDashboard().catch(() => ({}))
          ]);
        } catch (e) {}

        if (isAdmin) {
          const [cRes, sRes] = await Promise.all([
             classApi.getAll().catch(() => []),
             subjectApi.getAll().catch(() => [])
          ]);
          classList = Array.isArray(cRes) ? cRes : ((cRes as any)?.data || []);
          subjectList = Array.isArray(sRes) ? sRes : ((sRes as any)?.data || []);
        } else {
          const assignmentsRes = await teacherPortalApi.getAssignments().catch(() => []);
          const assignments = Array.isArray(assignmentsRes) 
            ? assignmentsRes 
            : ((assignmentsRes as any)?.data || (assignmentsRes as any)?.items || []);
          
          const uniqueClasses = new Map();
          const uniqueSubjects = new Map();
          
          assignments.forEach((a: any) => {
            const cId = a.classId || a.class?.id || a.class?._id;
            const cName = a.className || a.class?.name || "Class";
            const sId = a.subjectId || a.subject?.id || a.subject?._id;
            const sName = a.subjectName || a.subject?.name || "Subject";
            if (cId) uniqueClasses.set(cId, { id: cId, name: cName });
            if (sId) uniqueSubjects.set(sId, { id: sId, name: sName });
          });
          classList = Array.from(uniqueClasses.values());
          subjectList = Array.from(uniqueSubjects.values());
        }

        setClasses(classList);
        setSubjects(subjectList);

        let foundTermId = "";
        const currentSession = (Array.isArray(sessionData) ? sessionData : []).find((s: any) => s.isCurrent);
        if (currentSession) {
          setCurrentSessionName(currentSession.name || "");
          const currentTerm = currentSession.terms?.find((t: any) => t.isCurrent);
          if (currentTerm) {
            foundTermId = currentTerm.id;
            setCurrentTermId(foundTermId);
          }
        } else if (dashboardStats) {
          const stats = dashboardStats as any;
          if (stats.currentSession) setCurrentSessionName(stats.currentSession);
          if (stats.currentTermId) {
            foundTermId = stats.currentTermId;
            setCurrentTermId(foundTermId);
          }
        }

        if (classList.length > 0) setSelectedClass(classList[0].id || (classList[0] as any)._id);
        if (subjectList.length > 0) setSelectedSubject(subjectList[0].id || (subjectList[0] as any)._id);
        
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load initial data:", err);
        setError("Failed to load initial data.");
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const fetchScheme = useCallback(async () => {
    if (!selectedClass || !selectedSubject || !currentTermId) {
      console.log("[SoW Teacher] fetchScheme skipped — missing:", { selectedClass, selectedSubject, currentTermId });
      return;
    }
    console.log("[SoW Teacher] fetchScheme called with:", { classId: selectedClass, subjectId: selectedSubject, termId: currentTermId });
    setIsLoading(true);
    setTopics([]);
    setExistingId(null);
    try {
      const res = await schemeOfWorkApi.getBySubject(selectedClass, selectedSubject, currentTermId);
      console.log("[SoW Teacher] getBySubject raw response:", res);
      const data = (res as any)?.data || res;
      console.log("[SoW Teacher] getBySubject parsed data:", data);
      if (data && (data.id || data._id)) {
        setExistingId(data.id || data._id);
        setTopics(data.topics || []);
        console.log("[SoW Teacher] Loaded existing SoW id:", data.id || data._id, "topics:", data.topics?.length);
      } else if (Array.isArray(data) && data.length > 0) {
        // sometimes arrays are returned
        setExistingId(data[0].id || data[0]._id);
        setTopics(data[0].topics || []);
        console.log("[SoW Teacher] Loaded from array, id:", data[0].id || data[0]._id, "topics:", data[0].topics?.length);
      } else {
        console.log("[SoW Teacher] No existing scheme found for this combination");
      }
    } catch (err) {
      // Usually means it doesn't exist yet, which is fine
      console.warn("[SoW Teacher] Error fetching scheme:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedClass, selectedSubject, currentTermId]);

  useEffect(() => {
    fetchScheme();
  }, [fetchScheme]);

  const handleAddTopic = () => {
    const nextWeek = topics.length > 0 ? Math.max(...topics.map(t => t.week)) + 1 : 1;
    setTopics([...topics, { week: nextWeek, topic: "", description: "" }]);
  };

  const handleRemoveTopic = (index: number) => {
    const newTopics = [...topics];
    newTopics.splice(index, 1);
    setTopics(newTopics);
  };

  const handleChange = (index: number, field: keyof Topic, value: any) => {
    const newTopics = [...topics];
    newTopics[index] = { ...newTopics[index], [field]: value };
    setTopics(newTopics);
  };

  const handleSave = async () => {
    if (!selectedClass || !selectedSubject || !currentTermId) {
      toast.error("Please select a class and subject.");
      return;
    }
    
    // validate
    for (const t of topics) {
      if (!t.topic.trim() || !t.description.trim()) {
        toast.error(`Please fill all fields for Week ${t.week}`);
        return;
      }
    }

    console.log("[SoW Teacher] Saving SoW:", { classId: selectedClass, subjectId: selectedSubject, termId: currentTermId, existingId, topicCount: topics.length });
    setIsSaving(true);
    try {
      if (existingId) {
        const updateRes = await schemeOfWorkApi.update(existingId, { topics });
        console.log("[SoW Teacher] Update response:", updateRes);
        toast.success("Scheme of work updated successfully");
      } else {
        const createRes = await schemeOfWorkApi.create({
          classId: selectedClass,
          subjectId: selectedSubject,
          termId: currentTermId,
          topics
        });
        console.log("[SoW Teacher] Create response:", createRes);
        toast.success("Scheme of work created successfully");
        fetchScheme(); // to get the new ID
      }
    } catch (err: any) {
      console.error("[SoW Teacher] Save failed:", err);
      toast.error(err.message || "Failed to save scheme of work");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-[#053d26] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#053d26] mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            Scheme of Work
          </h1>
          <p className="text-gray-500 text-sm">
            Create and publish schemes of work for your assigned subjects.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
           <span className="w-2.5 h-2.5 rounded-full bg-[#20c997] animate-pulse" />
           <span className="text-sm font-bold text-gray-700">{currentSessionName || "Current Session"}</span>
        </div>
      </div>

      {/* Selectors */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6">
        <div className="flex-1 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Class</label>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-[#053d26] focus:border-[#053d26] p-3 font-semibold"
          >
            {classes.length === 0 && <option value="">No classes found</option>}
            {classes.map(c => (
              <option key={c.id || (c as any)._id} value={c.id || (c as any)._id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Subject</label>
          <select 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-[#053d26] focus:border-[#053d26] p-3 font-semibold"
          >
            {subjects.length === 0 && <option value="">No subjects found</option>}
            {subjects.map(s => (
              <option key={s.id || (s as any)._id} value={s.id || (s as any)._id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      )}

      {/* Topics Editor */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="font-bold text-gray-900 text-lg">Curriculum Topics</h2>
          <button 
            onClick={handleAddTopic}
            className="flex items-center gap-2 px-4 py-2 bg-[#e8f5e9] text-[#053d26] rounded-xl font-bold text-sm hover:bg-[#c8e6c9] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Week
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#053d26] animate-spin" />
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No scheme of work found for this subject.</p>
              <button 
                onClick={handleAddTopic}
                className="mt-4 text-[#053d26] font-bold hover:underline text-sm"
              >
                Click here to add the first week
              </button>
            </div>
          ) : (
            topics.map((t, index) => (
              <div key={index} className="flex gap-4 items-start group">
                <div className="w-20 shrink-0 pt-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Week</span>
                  <input 
                    type="number" 
                    value={t.week} 
                    onChange={(e) => handleChange(index, 'week', parseInt(e.target.value) || 1)}
                    className="w-full mt-1 bg-transparent border-0 text-xl font-bold text-[#053d26] focus:ring-0 p-0"
                    min="1"
                  />
                </div>
                
                <div className="flex-1 space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 group-hover:border-[#20c997]/30 transition-colors">
                  <input 
                    type="text" 
                    placeholder="Topic Title (e.g. Introduction to Algebra)"
                    value={t.topic} 
                    onChange={(e) => handleChange(index, 'topic', e.target.value)}
                    className="w-full bg-transparent border-0 font-bold text-gray-900 text-lg focus:ring-0 p-0 placeholder-gray-400"
                  />
                  <textarea 
                    placeholder="Detailed description or objectives..."
                    value={t.description}
                    onChange={(e) => handleChange(index, 'description', e.target.value)}
                    className="w-full bg-transparent border-0 text-gray-600 text-sm focus:ring-0 p-0 resize-none placeholder-gray-400 min-h-[60px]"
                  />
                </div>

                <button 
                  onClick={() => handleRemoveTopic(index)}
                  className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-2"
                  title="Remove Week"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
        
        {topics.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3.5 bg-[#053d26] hover:bg-[#042c1b] text-white rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? "Saving..." : existingId ? "Update Scheme" : "Publish Scheme"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
