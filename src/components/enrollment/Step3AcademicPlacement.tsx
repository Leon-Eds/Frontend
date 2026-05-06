"use client";

import React, { useEffect, useState } from 'react';
import { Input } from '../ui/form/Input';
import { Select } from '../ui/form/Select';
import { DatePicker } from '../ui/form/DatePicker';
import { Wand2, Info, CheckCircle2, Loader2 } from 'lucide-react';
import { CreateStudentRequest, classApi, SchoolClass } from '@/lib/api';

interface Step3Props {
  data: Partial<CreateStudentRequest>;
  updateData: (updates: Partial<CreateStudentRequest>) => void;
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export const Step3AcademicPlacement: React.FC<Step3Props> = ({ data, updateData, onNext, onBack, isSubmitting }) => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const result = await classApi.getAll();
        const items = Array.isArray(result) ? result : [];
        setClasses(items);
      } catch (err) {
        console.error('Failed to load classes', err);
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  const classOptions = classes.map((c) => ({ label: c.name + (c.arm ? ` – ${c.arm}` : ''), value: c.id }));

  const generateAdmissionNumber = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    updateData({ admissionNumber: `LEA-2024-${randomNum}` });
  };

  const selectedClass = classes.find((c) => c.id === data.classId);

  return (
    <div className="bg-white rounded-3xl p-10 shadow-sm">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-[#b05e1c] mb-2">PROCESS STAGE: ACADEMIC PLACEMENT</p>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Step 3: Define Academic Path</h2>
        <p className="text-gray-500 max-w-2xl">
          Assign the student to their respective academic level, section, and generate institutional identification markers.
        </p>
      </div>

      {/* Progress Bar Alternative */}
      <div className="mb-12">
        <div className="flex justify-between items-center text-xs font-bold uppercase text-gray-400 mb-2">
          <span>Progress: 100% Complete</span>
          <span>Stage 3 of 3</span>
        </div>
        <div className="h-1 w-full bg-gray-100 flex">
          <div className="h-full w-full bg-[#b05e1c]" />
        </div>
        <div className="flex justify-between mt-4 text-[10px] font-bold uppercase">
          <span className="text-gray-400 flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gray-300"></span> BIO DATA</span>
          <span className="text-[#b05e1c] flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#b05e1c]"></span> PLACEMENT</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form Area */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loadingClasses ? (
              <div className="flex items-center gap-2 py-4 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading classes...</span>
              </div>
            ) : (
              <Select
                label="Class / Grade Level"
                options={classOptions.length > 0 ? classOptions : [{ label: 'No classes available', value: '' }]}
                value={data.classId || ''}
                onChange={(e) => updateData({ classId: e.target.value })}
              />
            )}
            <Select
              label="Arm / Section"
              options={[
                { label: 'Emerald (Science)', value: 'Emerald' },
                { label: 'Ruby (Arts)', value: 'Ruby' },
                { label: 'Sapphire (Commerce)', value: 'Sapphire' },
              ]}
              defaultValue=""
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Admission Number"
                placeholder="LEA-2024-XXXX"
                value={data.admissionNumber || ''}
                readOnly
                icon={
                  <button onClick={generateAdmissionNumber} type="button" className="text-[#b05e1c] hover:text-[#965017] transition-colors p-2">
                    <Wand2 className="h-5 w-5" />
                  </button>
                }
              />
              <p className="text-[10px] text-gray-400 mt-2 italic">
                Auto-generated based on current batch. Click wand to re-roll.
              </p>
            </div>
            
            <DatePicker
              label="Enrollment Date"
              defaultValue={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100">
            <button
              onClick={onBack}
              disabled={isSubmitting}
              className="font-bold text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              &larr; Previous Step
            </button>
            <button
              onClick={onNext}
              disabled={!data.classId || !data.admissionNumber || isSubmitting}
              className="px-8 py-4 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Save and Continue'
              )}
            </button>
          </div>
        </div>

        {/* Right Info Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#053d26] rounded-3xl p-8 shadow-sm text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                <Info className="h-4 w-4" />
              </div>
              <h3 className="font-bold">Placement Logic</h3>
            </div>
            <p className="text-sm text-green-100/80 leading-relaxed mb-8">
              Academic arms are dynamically generated based on student performance profiles and stream availability. Ensure the &quot;Arm&quot; selection aligns with the student&apos;s chosen curriculum focus (Science, Arts, or Commerce).
            </p>
            <div className="bg-[#042c1b] rounded-2xl p-4 border border-white/5">
              <p className="text-xs font-bold text-green-200/50 uppercase mb-1">Selected Class</p>
              <div className="flex justify-between font-bold text-sm">
                <span>{selectedClass ? selectedClass.name : 'None selected'}</span>
                <span className="text-[#b05e1c]">{selectedClass?.studentCount ?? '—'} Students</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-6">Quick Reference</h4>
            <div className="space-y-4">
              <div className="flex gap-3 text-sm text-gray-600">
                <CheckCircle2 className="h-5 w-5 text-[#b05e1c] shrink-0" />
                <span>SS1 - SS3 require entrance exam scores.</span>
              </div>
              <div className="flex gap-3 text-sm text-gray-600">
                <CheckCircle2 className="h-5 w-5 text-[#b05e1c] shrink-0" />
                <span>Admission numbers are unique per session.</span>
              </div>
              <div className="flex gap-3 text-sm text-gray-600">
                <CheckCircle2 className="h-5 w-5 text-[#b05e1c] shrink-0" />
                <span>Enrollment date affects tuition proration.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
