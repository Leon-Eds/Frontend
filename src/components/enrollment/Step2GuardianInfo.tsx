"use client";

import React, { useState, useRef } from 'react';
import { Input } from '../ui/form/Input';
import { Select } from '../ui/form/Select';
import { ShieldCheck, CheckCircle2, Camera, X } from 'lucide-react';
import { CreateStudentRequest } from '@/lib/api';
import { useLanguage } from "@/components/LanguageProvider";

interface Step2Props {
  data: Partial<CreateStudentRequest>;
  updateData: (updates: Partial<CreateStudentRequest>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2GuardianInfo: React.FC<Step2Props> = ({ data, updateData, onNext, onBack }) => {
  const { t, tv } = useLanguage();
  const [isEmergencyContact, setIsEmergencyContact] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string>("");

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type)) {
      alert(t("enr.s2.bad_type"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(t("enr.s2.too_big"));
      return;
    }

    setPhotoFileName(file.name);
    updateData({ guardianIdImage: file });

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoFileName("");
    updateData({ guardianIdImage: undefined });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Sidebar Layout */}
      <div className="lg:col-span-4 space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#b05e1c] mb-2">{t("enr.s2.journey")}</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("enr.s2.title")}</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            {t("enr.s2.desc")}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-4 text-xs font-bold uppercase">
            <span>{t("enr.s2.step")}</span>
            <span className="text-gray-500">{t("enr.s2.pct")}</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full mb-8 overflow-hidden">
            <div className="h-full w-2/3 bg-[#b05e1c] rounded-full" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm font-semibold text-gray-900">
              <CheckCircle2 className="h-5 w-5 text-[#053d26]" />
              {t("enr.s2.basic")}
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-gray-900">
              <div className="h-5 w-5 rounded-full border-[5px] border-[#b05e1c]" />
              {t("enr.s2.title")}
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-gray-400">
              <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center text-[10px]">3</div>
              {t("enr.s2.placement")}
            </div>
          </div>
        </div>

        <div className="bg-[#053d26] rounded-3xl p-8 shadow-sm text-white">
          <ShieldCheck className="h-8 w-8 mb-4 text-green-300" />
          <h3 className="text-lg font-bold mb-2">{t("enr.s2.security")}</h3>
          <p className="text-sm text-green-100/80 leading-relaxed">
            {t("enr.s2.security_d")}
          </p>
        </div>
      </div>

      {/* Right Form Area */}
      <div className="lg:col-span-8 bg-white rounded-3xl p-10 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-6 w-1.5 bg-[#b05e1c] rounded-full" />
            <h3 className="text-xl font-bold text-gray-900">{t("enr.s2.primary")}</h3>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={t("enr.s2.name")}
                autoComplete="off"
                placeholder={t("enr.s2.name_ph")}
                value={data.parentName || ''}
                onChange={(e) => updateData({ parentName: e.target.value })}
              />
              <Select
                label={t("enr.s2.rel")}
                options={[
                  { label: t("stu.select_rel"), value: '' },
                  ...['Mother', 'Father', 'Guardian', 'Grandparent', 'Sibling', 'Other'].map(r => ({ label: tv("rel", r), value: r })),
                ]}
                value={data.parentRelationship || ''}
                onChange={(e) => updateData({ parentRelationship: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label={t("enr.s2.phone")}
                autoComplete="off"
                placeholder="+234 --- --- ----"
                value={data.parentPhone || ''}
                onChange={(e) => updateData({ parentPhone: e.target.value })}
              />
              <Input
                label={t("enr.s2.email")}
                autoComplete="off"
                placeholder="guardian@example.com"
                type="email"
                value={data.parentEmail || ''}
                onChange={(e) => updateData({ parentEmail: e.target.value })}
              />
              <Input
                label={t("enr.s2.portal_pw")}
                autoComplete="new-password"
                placeholder={t("enr.s2.portal_pw_ph")}
                type="password"
                value={data.password || ''}
                onChange={(e) => updateData({ password: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                {t("stu.address")}
              </label>
              <textarea
                className="w-full rounded-2xl border-0 bg-gray-100 py-4 px-5 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors resize-none h-24"
                placeholder={t("enr.s2.address_ph")}
                value={data.parentAddress || ''}
                onChange={(e) => updateData({ parentAddress: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                {t("enr.s2.id_upload")}
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {photoPreview ? (
                <div className="relative rounded-[2rem] overflow-hidden h-40 bg-gray-100 group border border-gray-200">
                  {photoFileName.endsWith('.pdf') ? (
                    <div className="flex items-center justify-center h-full text-sm font-bold text-gray-600">{t("enr.s2.pdf_selected")}</div>
                  ) : (
                    <img
                      src={photoPreview}
                      alt={t("enr.s2.id_alt")}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-full bg-white text-gray-900 text-xs font-bold hover:bg-gray-100 transition-colors"
                    >
                      {t("enr.s2.change_doc")}
                    </button>
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="px-4 py-2 rounded-full bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors flex items-center gap-1"
                    >
                      <X className="h-3 w-3" /> {t("common.remove")}
                    </button>
                  </div>
                  <p className="absolute bottom-3 left-3 right-3 text-[10px] text-white bg-black/50 rounded-full px-3 py-1 truncate text-center">
                    {photoFileName}
                  </p>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-[2rem] bg-gray-50 h-32 flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-colors"
                >
                  <Camera className="h-6 w-6 text-gray-400 mb-2" />
                  <span className="font-bold text-gray-700 text-sm">{t("enr.s2.upload_id")}</span>
                  <span className="text-[10px] text-gray-500 mt-1">{t("enr.s2.upload_id_hint")}</span>
                </div>
              )}
            </div>

            {/* Emergency Contact Toggle */}
            <label className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900 text-sm">*</span>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{t("enr.s2.emergency")}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{t("enr.s2.emergency_d")}</p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isEmergencyContact}
                  onChange={(e) => setIsEmergencyContact(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-[#053d26] transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-5 transition-transform" />
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100">
          <button
            onClick={onBack}
            className="font-bold text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
          >
            &larr; {t("enr.s2.back")}
          </button>
          <button
            onClick={onNext}
            disabled={!data.parentName || !data.parentPhone}
            className="px-8 py-4 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {t("enr.s2.continue")} &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
