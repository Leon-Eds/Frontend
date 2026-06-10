"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Input } from '../ui/form/Input';
import { DatePicker } from '../ui/form/DatePicker';
import { Select } from '../ui/form/Select';
import { Camera, X } from 'lucide-react';
import { CreateStudentRequest, sessionApi } from '@/lib/api';

interface Step1Props {
  data: Partial<CreateStudentRequest>;
  updateData: (updates: Partial<CreateStudentRequest>) => void;
  onNext: () => void;
  onCancel: () => void;
}

export const Step1BasicInfo: React.FC<Step1Props> = ({ data, updateData, onNext, onCancel }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string>("");
  const [sessionName, setSessionName] = useState("Loading...");

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessions = await sessionApi.getAll();
        const current = sessions.find((s: any) => s.isCurrent);
        if (current) {
          setSessionName(current.name);
        } else {
          setSessionName("No Active Session");
        }
      } catch {
        setSessionName("2024/2025");
      }
    };
    fetchSession();
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      alert('Please upload a JPG or PNG image.');
      return;
    }

    // Validate size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be smaller than 2MB.');
      return;
    }

    setPhotoFileName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-white rounded-3xl p-10 shadow-sm">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 1: Primary Information</h2>
          <p className="text-gray-500 max-w-2xl">
            Please provide the foundational details of the applicant as they appear on official identity documentation.
          </p>
        </div>
        <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-[#053d26]">
          ACADEMIC YEAR {sessionName}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-8">
        {/* Photo Upload Area */}
        <div className="lg:col-span-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
            Profile Portrait
          </label>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          {photoPreview ? (
            <div className="relative rounded-[2rem] overflow-hidden h-72 bg-gray-100 group">
              <img
                src={photoPreview}
                alt="Student portrait preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-full bg-white text-gray-900 text-xs font-bold hover:bg-gray-100 transition-colors"
                >
                  Change Photo
                </button>
                <button
                  type="button"
                  onClick={removePhoto}
                  className="px-4 py-2 rounded-full bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> Remove
                </button>
              </div>
              <p className="absolute bottom-3 left-3 right-3 text-[10px] text-white bg-black/50 rounded-full px-3 py-1 truncate text-center">
                {photoFileName}
              </p>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-[2rem] bg-gray-50 h-72 flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-colors"
            >
              <Camera className="h-10 w-10 text-gray-400 mb-4" />
              <span className="font-bold text-gray-700">Click to Upload</span>
              <span className="text-xs text-gray-500 mt-2">Standard passport size image, JPG or PNG (max 2MB)</span>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="lg:col-span-8 space-y-6">
          <Input
            label="Full Name (Legal)"
            placeholder="Enter student's full name"
            value={data.fullName || ''}
            onChange={(e) => updateData({ fullName: e.target.value })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DatePicker
              label="Date of Birth"
              value={data.dateOfBirth || ''}
              onChange={(e) => updateData({ dateOfBirth: e.target.value })}
            />
            <Select
              label="Blood Group"
              options={[
                { label: 'Select blood group', value: '' },
                { label: 'A+', value: 'A+' },
                { label: 'A-', value: 'A-' },
                { label: 'B+', value: 'B+' },
                { label: 'B-', value: 'B-' },
                { label: 'AB+', value: 'AB+' },
                { label: 'AB-', value: 'AB-' },
                { label: 'O+', value: 'O+' },
                { label: 'O-', value: 'O-' },
              ]}
              value={data.bloodGroup || ''}
              onChange={(e) => updateData({ ...data, bloodGroup: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              Gender Identity
            </label>
            <div className="flex gap-4">
              {['Male', 'Female', 'Other'].map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => updateData({ gender: gender as 'Male' | 'Female' | 'Other' })}
                  className={`flex-1 py-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    data.gender === gender
                      ? 'bg-white border-2 border-[#053d26] text-[#053d26] shadow-sm'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100">
        <button
          onClick={onCancel}
          className="font-bold text-gray-600 hover:text-gray-900 transition-colors"
        >
          &larr; Cancel
        </button>
        <div className="flex gap-4">
          <button
            onClick={onNext}
            disabled={!data.fullName || !data.dateOfBirth || !data.gender}
            className="px-8 py-3 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Continue to Step 2 &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
