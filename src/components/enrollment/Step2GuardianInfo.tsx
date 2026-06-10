"use client";

import React, { useState } from 'react';
import { Input } from '../ui/form/Input';
import { Select } from '../ui/form/Select';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { CreateStudentRequest } from '@/lib/api';

interface Step2Props {
  data: Partial<CreateStudentRequest>;
  updateData: (updates: Partial<CreateStudentRequest>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2GuardianInfo: React.FC<Step2Props> = ({ data, updateData, onNext, onBack }) => {
  const [relationship, setRelationship] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [isEmergencyContact, setIsEmergencyContact] = useState(true);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Sidebar Layout */}
      <div className="lg:col-span-4 space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#b05e1c] mb-2">Enrollment Journey</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Guardian Details</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Provide legal guardian information to ensure seamless emergency communication and academic reporting channels.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-4 text-xs font-bold uppercase">
            <span>Step 2 of 3</span>
            <span className="text-gray-500">66% Complete</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full mb-8 overflow-hidden">
            <div className="h-full w-2/3 bg-[#b05e1c] rounded-full" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm font-semibold text-gray-900">
              <CheckCircle2 className="h-5 w-5 text-[#053d26]" />
              Basic Information
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-gray-900">
              <div className="h-5 w-5 rounded-full border-[5px] border-[#b05e1c]" />
              Guardian Details
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-gray-400">
              <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center text-[10px]">3</div>
              Academic Placement
            </div>
          </div>
        </div>

        <div className="bg-[#053d26] rounded-3xl p-8 shadow-sm text-white">
          <ShieldCheck className="h-8 w-8 mb-4 text-green-300" />
          <h3 className="text-lg font-bold mb-2">Data Security</h3>
          <p className="text-sm text-green-100/80 leading-relaxed">
            Guardian data is encrypted and only accessible to authorized administrative personnel.
          </p>
        </div>
      </div>

      {/* Right Form Area */}
      <div className="lg:col-span-8 bg-white rounded-3xl p-10 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-6 w-1.5 bg-[#b05e1c] rounded-full" />
            <h3 className="text-xl font-bold text-gray-900">Primary Guardian Information</h3>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Primary Guardian Name"
                placeholder="Full Legal Name"
                value={data.parentName || ''}
                onChange={(e) => updateData({ parentName: e.target.value })}
              />
              <Select
                label="Relationship to Student"
                options={[
                  { label: 'Select relationship', value: '' },
                  { label: 'Mother', value: 'Mother' },
                  { label: 'Father', value: 'Father' },
                  { label: 'Guardian', value: 'Guardian' },
                  { label: 'Grandparent', value: 'Grandparent' },
                  { label: 'Sibling', value: 'Sibling' },
                  { label: 'Other', value: 'Other' },
                ]}
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Phone Number"
                placeholder="+254 --- --- ---"
                value={data.parentPhone || ''}
                onChange={(e) => updateData({ parentPhone: e.target.value })}
              />
              <Input
                label="Email Address"
                placeholder="guardian@example.com"
                type="email"
                value={data.parentEmail || ''}
                onChange={(e) => updateData({ parentEmail: e.target.value })}
              />
              <Input
                label="Portal Password"
                placeholder="Password for portal"
                type="password"
                value={data.parentPassword || ''}
                onChange={(e) => updateData({ parentPassword: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                Home Address
              </label>
              <textarea
                className="w-full rounded-2xl border-0 bg-gray-100 py-4 px-5 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-colors resize-none h-24"
                placeholder="Street, City, County, Postal Code"
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
              />
            </div>

            {/* Emergency Contact Toggle */}
            <label className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900 text-sm">*</span>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Emergency Contact</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Use these details as primary emergency contact?</p>
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
            &larr; Back to Bio Data
          </button>
          <button
            onClick={onNext}
            disabled={!data.parentName || !data.parentPhone}
            className="px-8 py-4 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Continue to Academic Placement &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
