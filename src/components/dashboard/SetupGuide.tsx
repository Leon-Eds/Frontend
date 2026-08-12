"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import { LeonEdLogoText } from "@/components/ui/LeonEdText";

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
  const carouselRef = useRef<HTMLDivElement>(null);

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

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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
            <div className="mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-green-200/80">Institutional Setup Hub</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1">
              {allDone ? 'System configuration complete' : <>Configure your <LeonEdLogoText /> school dashboard</>}
            </h2>
            <p className="text-sm text-green-100">
              {allDone
                ? 'All setup steps are complete. You\'re ready to manage your school!'
                : `Progress checklist to initialize your campus profile and class tiers.`}
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
            <div className="text-right hidden sm:block">
              <div className="text-3xl font-bold">{progress}%</div>
              <div className="text-xs text-green-200 font-medium">{doneCount} of {totalSteps} done</div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => scroll('left')} 
                className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-colors"
                aria-label="Scroll left"
              >
                &larr;
              </button>
              <button 
                onClick={() => scroll('right')} 
                className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-colors"
                aria-label="Scroll right"
              >
                &rarr;
              </button>
              <button
                onClick={handleDismiss}
                className="text-green-200 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10 ml-2"
                title="Dismiss guide"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
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

      {/* Carousel Deck */}
      <div className="p-6">
        <div 
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto snap-x scrollbar-hide pb-4 px-1 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {steps.map((step, index) => {
            return (
              <div 
                key={step.id}
                className={`w-[290px] sm:w-[325px] shrink-0 snap-start rounded-[2rem] border p-6 flex flex-col justify-between transition-all shadow-sm ${
                  step.done 
                    ? 'bg-gradient-to-br from-green-50/40 to-emerald-50/20 border-green-100 hover:shadow-md' 
                    : 'bg-white border-gray-100 hover:border-[#b05e1c]/30 hover:shadow-md'
                }`}
              >
                <div className="space-y-4">
                  {/* Card Status Indicator */}
                  <div className="flex justify-between items-center">
                    <div className={`p-2.5 rounded-2xl shrink-0 ${step.done ? 'bg-green-100 text-[#053d26]' : 'bg-gray-100 text-gray-500'}`}>
                      {step.icon}
                    </div>
                    {step.done ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-[#053d26] text-[10px] font-black uppercase tracking-wider">
                        <CheckCircle2 className="h-3 w-3" /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider">
                        <Clock className="h-3 w-3" /> Pending
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-extrabold">{index + 1}.</span>
                      {step.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Footer Count Badge and CTA */}
                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between gap-4">
                  {step.count !== undefined && step.count > 0 ? (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-800 px-2 py-0.5 rounded-md">
                      {step.count} Logged
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-gray-400">Step {index + 1} of {totalSteps}</span>
                  )}

                  <Link
                    href={step.href}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 shrink-0 ${
                      step.done 
                        ? 'bg-white border border-gray-250 text-gray-700 hover:bg-gray-50' 
                        : 'bg-[#053d26] text-white hover:bg-[#042c1b]'
                    }`}
                  >
                    {step.ctaLabel}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
