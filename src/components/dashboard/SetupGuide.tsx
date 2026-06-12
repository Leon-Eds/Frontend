"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  CalendarClock,
  BookOpen,
  GraduationCap,
  Users,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  X,
  Loader2,
  Clock,
  Rocket,
} from 'lucide-react';
import { sessionApi, classApi, subjectApi, teacherApi, studentApi, AcademicSession } from '@/lib/api';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  ctaLabel: string;
  done: boolean;
  count?: number;
}

export default function SetupGuide() {
  const [steps, setSteps] = useState<SetupStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('leoned_setup_dismissed') === 'true';
    }
    return false;
  });
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const checkSetup = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all data in parallel
      const [sessions, classes, subjects, teacherRes, studentRes] = await Promise.allSettled([
        sessionApi.getAll(),
        classApi.getAll(),
        subjectApi.getAll(),
        teacherApi.getAll(),
        studentApi.getAll(),
      ]);

      const sessionList: AcademicSession[] = sessions.status === 'fulfilled'
        ? (Array.isArray(sessions.value) ? sessions.value : [])
        : [];
      const classList = classes.status === 'fulfilled'
        ? (Array.isArray(classes.value) ? classes.value : [])
        : [];
      const subjectList = subjects.status === 'fulfilled'
        ? (Array.isArray(subjects.value) ? subjects.value : [])
        : [];
      
      const teacherCount = teacherRes.status === 'fulfilled'
        ? (Array.isArray(teacherRes.value) ? teacherRes.value.length : 0)
        : 0;
      
      const studentCount = studentRes.status === 'fulfilled'
        ? (Array.isArray(studentRes.value) ? studentRes.value.length : 0)
        : 0;

      const hasCurrentSession = sessionList.some(s => s.isCurrent);
      const hasTerms = sessionList.some(s => s.terms && s.terms.length > 0);

      setSteps([
        {
          id: 'session',
          title: 'Create Academic Session',
          description: 'Set up the current academic year (e.g., 2025/2026) to organize your school calendar.',
          icon: <CalendarClock className="h-5 w-5" />,
          href: '/dashboard/rollover',
          ctaLabel: hasCurrentSession ? 'Manage Sessions' : 'Create Session',
          done: hasCurrentSession,
          count: sessionList.length,
        },
        {
          id: 'terms',
          title: 'Add Terms to Session',
          description: 'Define your school terms (First, Second, Third) with start and end dates.',
          icon: <Clock className="h-5 w-5" />,
          href: '/dashboard/rollover',
          ctaLabel: hasTerms ? 'Manage Terms' : 'Add Terms',
          done: hasTerms,
        },
        {
          id: 'subjects',
          title: 'Register Subjects',
          description: 'Build your curriculum by adding all subjects taught at your school.',
          icon: <BookOpen className="h-5 w-5" />,
          href: '/dashboard/classes',
          ctaLabel: subjectList.length > 0 ? 'Manage Subjects' : 'Add Subjects',
          done: subjectList.length > 0,
          count: subjectList.length,
        },
        {
          id: 'classes',
          title: 'Create Classes',
          description: 'Set up your class levels and arms (e.g., JSS 1, SSS 2 Science).',
          icon: <BookOpen className="h-5 w-5" />,
          href: '/dashboard/classes',
          ctaLabel: classList.length > 0 ? 'Manage Classes' : 'Create Classes',
          done: classList.length > 0,
          count: classList.length,
        },
        {
          id: 'teachers',
          title: 'Add Teachers',
          description: 'Register your teaching staff with their credentials and assignments.',
          icon: <Users className="h-5 w-5" />,
          href: '/dashboard/faculty',
          ctaLabel: teacherCount > 0 ? 'Manage Staff' : 'Add Teachers',
          done: teacherCount > 0,
          count: teacherCount,
        },
        {
          id: 'students',
          title: 'Enroll Students',
          description: 'Start enrolling students into your classes to complete the setup.',
          icon: <GraduationCap className="h-5 w-5" />,
          href: '/dashboard/students/new',
          ctaLabel: studentCount > 0 ? 'View Students' : 'Enroll Students',
          done: studentCount > 0,
          count: studentCount,
        },
      ]);
    } catch {
      // Silently fail — the guide is non-critical
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    checkSetup();
  }, [checkSetup]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('leoned_setup_dismissed', 'true');
  };

  const handleUndismiss = () => {
    setDismissed(false);
    localStorage.removeItem('leoned_setup_dismissed');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-[#053d26]" />
          <span className="text-sm text-gray-500 font-medium">Checking your setup progress...</span>
        </div>
      </div>
    );
  }

  const doneCount = steps.filter(s => s.done).length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? Math.round((doneCount / totalSteps) * 100) : 0;
  const allDone = doneCount === totalSteps;

  // Find the first incomplete step
  const nextStep = steps.find(s => !s.done);

  // If all done and dismissed, show a small re-open button
  if (dismissed) {
    return (
      <button
        onClick={handleUndismiss}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
      >
        <Sparkles className="h-4 w-4 text-[#b05e1c]" />
        Show Setup Guide ({doneCount}/{totalSteps} complete)
      </button>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-[#053d26] to-[#095838] p-6 sm:p-8 text-white">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 opacity-10">
          <Rocket className="w-40 h-40 -mt-10 -mr-10" />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-[#b05e1c]" />
              <span className="text-xs font-bold uppercase tracking-widest text-green-200/80">Setup Guide</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1">
              {allDone ? 'System configuration complete' : 'Get your school up and running'}
            </h2>
            <p className="text-sm text-green-100">
              {allDone
                ? 'All setup steps are complete. You\'re ready to go!'
                : `Complete these steps to unlock the full power of LeonEd Africa.`}
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-3xl font-bold">{progress}%</div>
              <div className="text-xs text-green-200 font-medium">{doneCount} of {totalSteps} done</div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-green-200 hover:text-white transition-colors p-1 self-start"
              title="Dismiss guide"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative z-10 mt-6">
          <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-300 to-green-200 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="p-4 sm:p-6">
        {/* Next step highlight */}
        {nextStep && !allDone && (
          <div className="mb-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#b05e1c] text-white flex items-center justify-center shrink-0">
                  {nextStep.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#b05e1c] mb-0.5">Next Step</p>
                  <p className="text-sm font-bold text-gray-900">{nextStep.title}</p>
                </div>
              </div>
              <Link
                href={nextStep.href}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#b05e1c] text-white text-sm font-bold hover:bg-[#965017] transition-colors shadow-sm shrink-0"
              >
                {nextStep.ctaLabel}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Steps list */}
        <div className="space-y-1">
          {steps.map((step, index) => {
            const isExpanded = expandedStep === step.id;
            return (
              <div key={step.id}>
                <button
                  onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                  className={`w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all text-left ${
                    isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50/50'
                  }`}
                >
                  {/* Step number / check */}
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-colors ${
                    step.done
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step.done ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  {/* Title + status */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold truncate ${step.done ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {step.title}
                      </span>
                      {step.count !== undefined && step.count > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-bold shrink-0">
                          {step.count}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="ml-12 sm:ml-16 pb-3 pr-4">
                    <p className="text-sm text-gray-500 mb-3">{step.description}</p>
                    <Link
                      href={step.href}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                        step.done
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-[#053d26] text-white hover:bg-[#042c1b]'
                      }`}
                    >
                      {step.ctaLabel}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}

                {/* Connector line */}
                {index < steps.length - 1 && !isExpanded && (
                  <div className="ml-7 h-1 border-l-2 border-dashed border-gray-200" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
