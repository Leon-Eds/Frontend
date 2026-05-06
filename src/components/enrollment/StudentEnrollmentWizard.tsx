"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateStudentRequest, studentApi } from '@/lib/api';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2GuardianInfo } from './Step2GuardianInfo';
import { Step3AcademicPlacement } from './Step3AcademicPlacement';
import { Step4Success } from './Step4Success';

export const StudentEnrollmentWizard = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateStudentRequest>>({
    fullName: '',
    admissionNumber: '',
    gender: '',
    dateOfBirth: '',
    classId: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
  });

  const updateData = (updates: Partial<CreateStudentRequest>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = async () => {
    if (currentStep === 3) {
      setIsSubmitting(true);
      try {
        await studentApi.create(formData as CreateStudentRequest);
        setCurrentStep(4);
      } catch (error) {
        console.error("Failed to submit student", error);
        alert(error instanceof Error ? error.message : "Failed to enroll student. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved data will be lost.')) {
      router.push('/dashboard/students');
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      admissionNumber: '',
      gender: '',
      dateOfBirth: '',
      classId: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
    });
    setCurrentStep(1);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Top Header Section inside the page (optional, matches design) */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <button onClick={() => router.push('/dashboard')} className="hover:text-gray-900 transition-colors">Dashboard</button>
          <span>&rsaquo;</span>
          <button onClick={() => router.push('/dashboard/students')} className="font-semibold text-gray-900 hover:text-[#b05e1c] transition-colors">Students</button>
          <span>&rsaquo;</span>
          <span>Add New Student</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Student Enrollment</h1>
      </div>

      {/* Progress Indicator (Global) */}
      {currentStep < 4 && (
        <div className="flex items-center justify-between mb-12 relative px-4">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200 -z-10" />
          
          {[
            { step: 1, label: 'BASIC INFO' },
            { step: 2, label: 'GUARDIAN' },
            { step: 3, label: 'ACADEMIC' },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center gap-2 bg-[#f8f9fa] px-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-colors ${
                currentStep >= item.step 
                  ? 'bg-[#053d26] text-white' 
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {item.step}
              </div>
              <span className={`text-[10px] font-bold tracking-widest ${
                currentStep >= item.step ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Step Content */}
      <div className="mt-8">
        {currentStep === 1 && (
          <Step1BasicInfo
            data={formData}
            updateData={updateData}
            onNext={handleNext}
            onCancel={handleCancel}
          />
        )}
        {currentStep === 2 && (
          <Step2GuardianInfo
            data={formData}
            updateData={updateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {currentStep === 3 && (
          <Step3AcademicPlacement
            data={formData}
            updateData={updateData}
            onNext={handleNext}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        )}
        {currentStep === 4 && (
          <Step4Success
            data={formData as CreateStudentRequest}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
};
