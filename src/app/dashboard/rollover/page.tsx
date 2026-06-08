"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, ChevronRight, AlertTriangle, CheckCircle2, Loader2, Archive, Rocket, X, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { sessionApi, AcademicSession, CreateSessionRequest, CreateTermRequest } from '@/lib/api';

export default function SessionRollover() {
  const router = useRouter();

  // Role guard redirect
  useEffect(() => {
    try {
      const stored = localStorage.getItem("leoned_user");
      if (stored) {
        const user = JSON.parse(stored);
        if (user.role === "Teacher" || user.role === "Faculty") {
          router.push("/dashboard/faculty");
        } else if (user.role === "Student") {
          router.push("/dashboard/student-portal");
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [router]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Create session modal
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [newSession, setNewSession] = useState<CreateSessionRequest>({ name: '', startDate: '', endDate: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Add term modal
  const [addTermToSessionId, setAddTermToSessionId] = useState<string | null>(null);
  const [newTerm, setNewTerm] = useState<CreateTermRequest>({ termNumber: 'First', startDate: '', endDate: '' });
  const [isAddingTerm, setIsAddingTerm] = useState(false);

  // Rollover confirmation
  const [showRolloverConfirm, setShowRolloverConfirm] = useState(false);
  const [rolloverInput, setRolloverInput] = useState("");

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await sessionApi.getAll();
      const items = Array.isArray(result) ? result : [];
      setSessions(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    fetchSessions();
  }, [fetchSessions]);

  const currentSession = sessions.find(s => s.isCurrent);
  const otherSessions = sessions.filter(s => !s.isCurrent);

  const handleCreateSession = async () => {
    if (!newSession.name || !newSession.startDate || !newSession.endDate) {
      setCreateError("All fields are required");
      return;
    }
    setIsCreating(true);
    setCreateError("");
    try {
      await sessionApi.create(newSession);
      setShowCreateSession(false);
      setNewSession({ name: '', startDate: '', endDate: '' });
      fetchSessions();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create session");
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddTerm = async () => {
    if (!addTermToSessionId || !newTerm.startDate || !newTerm.endDate) return;
    setIsAddingTerm(true);
    try {
      await sessionApi.addTerm(addTermToSessionId, newTerm);
      setAddTermToSessionId(null);
      setNewTerm({ termNumber: 'First', startDate: '', endDate: '' });
      fetchSessions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add term");
    } finally {
      setIsAddingTerm(false);
    }
  };

  const handleSetCurrentSession = async (id: string) => {
    try {
      await sessionApi.setCurrent(id);
      fetchSessions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to set current session");
    }
  };

  const handleSetCurrentTerm = async (termId: string) => {
    try {
      await sessionApi.setCurrentTerm(termId);
      fetchSessions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to set current term");
    }
  };

  // Calculate session progress (based on date range)
  const getSessionProgress = (session: AcademicSession) => {
    if (!session.startDate || !session.endDate) return 0;
    const start = new Date(session.startDate).getTime();
    const end = new Date(session.endDate).getTime();
    // eslint-disable-next-line
    const now = Date.now();
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-10">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold text-[#053d26] mb-3">Academic Transition Hub</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Orchestrate the end-of-year transition with surgical precision. Manage academic sessions, terms, batch promotions, and initialize the upcoming session architecture.
          </p>
        </div>
        <button
          onClick={() => setShowCreateSession(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors shadow-sm shrink-0"
        >
          <Plus className="h-5 w-5" /> New Session
        </button>
      </div>

      {/* Loading / Error */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#053d26]" />
          <span className="ml-3 text-gray-500 font-medium">Loading academic sessions...</span>
        </div>
      ) : error ? (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to load sessions</h3>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button onClick={fetchSessions} className="px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors">Retry</button>
        </div>
      ) : (
        <>
          {/* Top Session Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Session */}
            <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-200 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#b05e1c] mb-2">Current Active Session</p>
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{currentSession?.name || 'None Set'}</div>
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-8 ${
                  currentSession ? 'bg-[#053d26] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentSession ? 'Active' : 'No active session'}
                </span>
              </div>

              {currentSession && (
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-semibold text-gray-700">Session Progress</span>
                    <span className="text-3xl font-bold text-gray-900">{getSessionProgress(currentSession)}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full mb-4 overflow-hidden">
                    <div className="h-full bg-[#053d26] rounded-full transition-all" style={{ width: `${getSessionProgress(currentSession)}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 italic">
                    {currentSession.startDate && currentSession.endDate
                      ? `${new Date(currentSession.startDate).toLocaleDateString()} — ${new Date(currentSession.endDate).toLocaleDateString()}`
                      : 'Dates not set'}
                  </p>

                  {/* Terms */}
                  {currentSession.terms && currentSession.terms.length > 0 && (
                    <div className="mt-6 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Terms</p>
                      {currentSession.terms.map(term => (
                        <div key={term.id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-100">
                          <div>
                            <span className="text-sm font-bold text-gray-900">{term.termNumber} Term</span>
                            <p className="text-[10px] text-gray-500">
                              {new Date(term.startDate).toLocaleDateString()} — {new Date(term.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          {term.isCurrent ? (
                            <span className="px-2.5 py-1 rounded-full bg-green-100 text-[#053d26] text-[10px] font-bold">Current</span>
                          ) : (
                            <button
                              onClick={() => handleSetCurrentTerm(term.id)}
                              className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold hover:bg-gray-200 transition-colors"
                            >
                              Set Current
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => { setAddTermToSessionId(currentSession.id); }}
                    className="mt-4 text-sm font-bold text-[#b05e1c] hover:text-[#965017] transition-colors"
                  >
                    + Add Term
                  </button>
                </div>
              )}
            </div>

            {/* Session List / Upcoming */}
            <div className="bg-[#053d26] rounded-[2rem] p-8 shadow-sm text-white relative overflow-hidden flex flex-col justify-between">
              <div className="absolute right-0 top-0 opacity-10">
                <Calendar className="w-64 h-64 -mt-16 -mr-16" />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-green-200/80 mb-2">All Sessions</p>
                <div className="text-2xl font-bold mb-6">{sessions.length} Total</div>
              </div>

              <div className="relative z-10 space-y-3 max-h-64 overflow-y-auto">
                {sessions.length === 0 ? (
                  <p className="text-green-200/70 text-sm">No sessions created yet. Click &quot;New Session&quot; to start.</p>
                ) : (
                  sessions.map(session => (
                    <div key={session.id} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-sm">{session.name}</div>
                        <p className="text-[10px] text-green-200/70">
                          {session.terms?.length || 0} terms • {session.isCurrent ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      {!session.isCurrent && (
                        <button
                          onClick={() => handleSetCurrentSession(session.id)}
                          className="px-3 py-1.5 rounded-full bg-white/20 text-white text-[10px] font-bold hover:bg-white/30 transition-colors shrink-0"
                        >
                          Activate
                        </button>
                      )}
                      {session.isCurrent && (
                        <span className="px-3 py-1.5 rounded-full bg-green-400/20 text-green-200 text-[10px] font-bold shrink-0">Active</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Rollover Action */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex gap-6">
              <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 border border-red-100">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Critical Action: Initialize Rollover</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-8">
                  Proceeding with the rollover will set a new session as current. Ensure all grades are finalized and fee status audits are complete before execution.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <button
                    onClick={() => setShowRolloverConfirm(true)}
                    disabled={sessions.length < 2}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Initiate Rollover <Rocket className="w-4 h-4 ml-1" />
                  </button>
                  <button
                    onClick={() => {
                      const data = JSON.stringify(sessions, null, 2);
                      const blob = new Blob([data], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `session_audit_${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="text-sm font-bold text-gray-600 hover:text-gray-900 underline underline-offset-4 decoration-gray-300 transition-colors"
                  >
                    Download Pre-Rollover Audit
                  </button>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 bg-gray-50 rounded-[2rem] p-8 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Automated Tasks</h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#053d26] border border-gray-200 shadow-sm shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-0.5">Database Backup</h4>
                    <p className="text-xs text-gray-500">Automatic backups are enabled</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#b05e1c] border border-gray-200 shadow-sm shrink-0">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-0.5">Alumni Record Migration</h4>
                    <p className="text-xs text-[#b05e1c]">Runs automatically on rollover</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 border border-gray-200 shadow-sm shrink-0">
                    <Archive className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-0.5">Archival Sequencing</h4>
                    <p className="text-xs text-gray-500">Ready for initialization</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create Session Modal */}
      {showCreateSession && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateSession(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Create Academic Session</h2>
              <button onClick={() => setShowCreateSession(false)} className="text-gray-400 hover:text-gray-600 p-1"><X className="h-6 w-6" /></button>
            </div>
            {createError && (
              <div className="bg-red-50 text-red-700 rounded-2xl p-4 mb-6 text-sm">{createError}</div>
            )}
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Session Name</label>
                <input
                  value={newSession.name}
                  onChange={e => setNewSession(s => ({ ...s, name: e.target.value }))}
                  placeholder="e.g. 2024/2025"
                  className="w-full rounded-2xl bg-gray-100 py-4 px-5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newSession.startDate}
                    onChange={e => setNewSession(s => ({ ...s, startDate: e.target.value }))}
                    className="w-full rounded-2xl bg-gray-100 py-4 px-5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">End Date</label>
                  <input
                    type="date"
                    value={newSession.endDate}
                    onChange={e => setNewSession(s => ({ ...s, endDate: e.target.value }))}
                    className="w-full rounded-2xl bg-gray-100 py-4 px-5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setShowCreateSession(false)} className="px-6 py-3 rounded-full bg-gray-200 text-gray-900 font-bold hover:bg-gray-300 transition-colors text-sm">Cancel</button>
              <button
                onClick={handleCreateSession}
                disabled={isCreating}
                className="px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {isCreating ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Term Modal */}
      {addTermToSessionId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setAddTermToSessionId(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Add Term</h2>
              <button onClick={() => setAddTermToSessionId(null)} className="text-gray-400 hover:text-gray-600 p-1"><X className="h-6 w-6" /></button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Term</label>
                <select
                  value={newTerm.termNumber}
                  onChange={e => setNewTerm(t => ({ ...t, termNumber: e.target.value as 'First' | 'Second' | 'Third' }))}
                  className="w-full rounded-2xl bg-gray-100 py-4 px-5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors appearance-none"
                >
                  <option value="First">First Term</option>
                  <option value="Second">Second Term</option>
                  <option value="Third">Third Term</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newTerm.startDate}
                    onChange={e => setNewTerm(t => ({ ...t, startDate: e.target.value }))}
                    className="w-full rounded-2xl bg-gray-100 py-4 px-5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">End Date</label>
                  <input
                    type="date"
                    value={newTerm.endDate}
                    onChange={e => setNewTerm(t => ({ ...t, endDate: e.target.value }))}
                    className="w-full rounded-2xl bg-gray-100 py-4 px-5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setAddTermToSessionId(null)} className="px-6 py-3 rounded-full bg-gray-200 text-gray-900 font-bold hover:bg-gray-300 transition-colors text-sm">Cancel</button>
              <button
                onClick={handleAddTerm}
                disabled={isAddingTerm}
                className="px-6 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isAddingTerm ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {isAddingTerm ? 'Adding...' : 'Add Term'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rollover Confirmation Modal */}
      {showRolloverConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowRolloverConfirm(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Confirm Rollover</h3>
                <p className="text-sm text-gray-500">This is a critical action.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Type <span className="font-bold text-gray-900">ROLLOVER</span> below to confirm you want to proceed with the session transition.
            </p>
            <input
              value={rolloverInput}
              onChange={e => setRolloverInput(e.target.value)}
              placeholder="Type ROLLOVER to confirm"
              className="w-full rounded-2xl bg-gray-100 py-4 px-5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors mb-6"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowRolloverConfirm(false); setRolloverInput(""); }} className="px-6 py-3 rounded-full bg-gray-200 text-gray-900 font-bold hover:bg-gray-300 transition-colors text-sm">Cancel</button>
              <button
                disabled={rolloverInput !== 'ROLLOVER'}
                onClick={() => {
                  // Activate the next non-current session
                  const next = otherSessions[0];
                  if (next) {
                    handleSetCurrentSession(next.id);
                  }
                  setShowRolloverConfirm(false);
                  setRolloverInput("");
                }}
                className="px-6 py-3 rounded-full bg-red-600 text-white font-bold hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Rocket className="h-4 w-4" /> Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
