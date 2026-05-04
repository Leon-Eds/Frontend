import React from 'react';
import { Input } from '../ui/form/Input';
import { DatePicker } from '../ui/form/DatePicker';
import { Select } from '../ui/form/Select';
import { Camera } from 'lucide-react';
import { CreateStudentRequest } from '@/lib/mocks/apiClient';

interface Step1Props {
  data: Partial<CreateStudentRequest>;
  updateData: (updates: Partial<CreateStudentRequest>) => void;
  onNext: () => void;
  onCancel: () => void;
}

export const Step1BasicInfo: React.FC<Step1Props> = ({ data, updateData, onNext, onCancel }) => {
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
          ACADEMIC YEAR 2024/25
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-8">
        {/* Photo Upload Area */}
        <div className="lg:col-span-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
            Profile Portrait
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-[2rem] bg-gray-50 h-72 flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:bg-gray-100 transition-colors">
            <Camera className="h-10 w-10 text-gray-400 mb-4" />
            <span className="font-bold text-gray-700">Click to Upload</span>
            <span className="text-xs text-gray-500 mt-2">Standard passport size image, JPG or PNG (max 2MB)</span>
          </div>
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
                { label: 'A+', value: 'A+' },
                { label: 'O+', value: 'O+' },
                { label: 'B+', value: 'B+' },
                { label: 'AB+', value: 'AB+' },
              ]}
              defaultValue=""
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
                  onClick={() => updateData({ gender: gender as any })}
                  className={`flex-1 py-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    data.gender === gender
                      ? 'bg-white border-2 border-[#053d26] text-[#053d26] shadow-sm'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {/* Just simple text for now, could add icons if requested */}
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
          <button className="px-6 py-3 rounded-full bg-gray-200 text-gray-900 font-bold hover:bg-gray-300 transition-colors">
            Save Draft
          </button>
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
