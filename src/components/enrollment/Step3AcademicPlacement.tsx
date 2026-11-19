"use client";

import React, { useEffect, useState } from 'react';
import { Input } from '../ui/form/Input';
import { Select } from '../ui/form/Select';
import { DatePicker } from '../ui/form/DatePicker';
import { Wand2, Info, CheckCircle2, Loader2 } from 'lucide-react';
import { CreateStudentRequest, classApi, classLabel, SchoolClass } from '@/lib/api';
import { useLanguage } from "@/components/LanguageProvider";

interface Step3Props {
  data: Partial<CreateStudentRequest>;
  updateData: (updates: Partial<CreateStudentRequest>) => void;
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const getSchoolAbbreviation = (schoolName: string): string => {
  if (!schoolName) return "SCH";
  const cleanName = schoolName.replace(/[^\w\s-]/g, '').trim();
  const words = cleanName.split(/[\s-]+/).filter(Boolean);
  
  if (words.length === 1) {
    const word = words[0];
    return word.slice(0, Math.min(3, word.length)).toUpperCase();
  }
  
  const filteredWords = words.filter(w => !['of', 'and', 'the', 'for', 'in', 'ltd', 'limited', 'school', 'academy', 'college'].includes(w.toLowerCase()));
  const abbreviation = (filteredWords.length > 0 ? filteredWords : words).map(w => w[0]).join('').toUpperCase();
  
  if (abbreviation.length >= 2) {
    return abbreviation;
  }
  
  return cleanName.slice(0, 3).toUpperCase();
};

export const Step3AcademicPlacement: React.FC<Step3Props> = ({ data, updateData, onNext, onBack, isSubmitting }) => {
  const { t } = useLanguage();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [schoolPrefix, setSchoolPrefix] = useState("SCH");

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("leoned_user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user.schoolName) {
            setSchoolPrefix(getSchoolAbbreviation(user.schoolName));
          }
        }
      } catch (e) {
        console.error("Failed to parse schoolName", e);
      }
    }
  }, []);

  const classOptions = classes.map((c) => ({ label: classLabel(c), value: c.id }));



  const selectedClass = classes.find((c) => c.id === data.classId);

  return (
    <div className="bg-white rounded-3xl p-10 shadow-sm">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-[#b05e1c] mb-2">{t("enr.s3.stage")}</p>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{t("enr.s3.title")}</h2>
        <p className="text-gray-500 max-w-2xl">
          {t("enr.s3.desc")}
        </p>
      </div>

      {/* Progress Bar Alternative */}
      <div className="mb-12">
        <div className="flex justify-between items-center text-xs font-bold uppercase text-gray-400 mb-2">
          <span>{t("enr.s3.progress")}</span>
          <span>{t("enr.s3.stage_of")}</span>
        </div>
        <div className="h-1 w-full bg-gray-100 flex">
          <div className="h-full w-full bg-[#b05e1c]" />
        </div>
        <div className="flex justify-between mt-4 text-[10px] font-bold uppercase">
          <span className="text-gray-400 flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gray-300"></span> {t("enr.s3.bio")}</span>
          <span className="text-[#b05e1c] flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#b05e1c]"></span> {t("enr.s3.placement")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form Area */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loadingClasses ? (
              <div className="flex items-center gap-2 py-4 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{t("enr.s3.loading_classes")}</span>
              </div>
            ) : (
              <Select
                label={t("enr.s3.class")}
                options={classOptions.length > 0 ? classOptions : [{ label: t("enr.s3.no_classes"), value: '' }]}
                value={data.classId || ''}
                onChange={(e) => updateData({ classId: e.target.value })}
              />
            )}
            <Select
              label={t("enr.s3.arm")}
              options={[
                { label: t("enr.s3.arm_ph"), value: '' },
                { label: t("enr.s3.arm_emerald"), value: 'Emerald' },
                { label: t("enr.s3.arm_ruby"), value: 'Ruby' },
                { label: t("enr.s3.arm_sapphire"), value: 'Sapphire' },
              ]}
              value={data.arm || ''}
              onChange={(e) => updateData({ arm: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label={t("stu.admission_number")}
                placeholder={t("enr.s3.adm_ph")}
                value={t("enr.s3.adm_val")}
                readOnly
              />
              <p className="text-[10px] text-gray-400 mt-2 italic">
                {t("enr.s3.adm_note")}
              </p>
            </div>
            
            <DatePicker
              label={t("enr.s3.enroll_date")}
              defaultValue={new Date().toISOString().split('T')[0]}
              value={data.enrollmentDate || ''}
              onChange={(e) => updateData({ enrollmentDate: e.target.value })}
            />
          </div>

          <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100">
            <button
              onClick={onBack}
              disabled={isSubmitting}
              className="font-bold text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              &larr; {t("enr.s3.prev")}
            </button>
            <button
              onClick={onNext}
              disabled={!data.classId || isSubmitting}
              className="px-8 py-4 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("enr.s3.processing")}
                </>
              ) : (
                t("enr.s3.save_continue")
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
              <h3 className="font-bold">{t("enr.s3.logic")}</h3>
            </div>
            <p className="text-sm text-green-100/80 leading-relaxed mb-8">
              {t("enr.s3.logic_d")}
            </p>
            <div className="bg-[#042c1b] rounded-2xl p-4 border border-white/5">
              <p className="text-xs font-bold text-green-200/50 uppercase mb-1">{t("enr.s3.selected")}</p>
              <div className="flex justify-between font-bold text-sm">
                <span>{selectedClass ? selectedClass.name : t("enr.s3.none")}</span>
                <span className="text-[#b05e1c]">{t("enr.s3.students", { n: selectedClass?.studentCount ?? '—' })}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-6">{t("enr.s3.ref")}</h4>
            <div className="space-y-4">
              <div className="flex gap-3 text-sm text-gray-600">
                <CheckCircle2 className="h-5 w-5 text-[#b05e1c] shrink-0" />
                <span>{t("enr.s3.ref1")}</span>
              </div>
              <div className="flex gap-3 text-sm text-gray-600">
                <CheckCircle2 className="h-5 w-5 text-[#b05e1c] shrink-0" />
                <span>{t("enr.s3.ref2")}</span>
              </div>
              <div className="flex gap-3 text-sm text-gray-600">
                <CheckCircle2 className="h-5 w-5 text-[#b05e1c] shrink-0" />
                <span>{t("enr.s3.ref3")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
