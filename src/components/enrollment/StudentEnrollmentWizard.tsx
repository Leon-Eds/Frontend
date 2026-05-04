"use client";

import React, { useState } from 'react';
import { CreateStudentRequest, submitStudentEnrollment } from '@/lib/mocks/apiClient';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2GuardianInfo } from './Step2GuardianInfo';
import { Step3AcademicPlacement } from './Step3AcademicPlacement';
import { Step4Success } from './Step4Success';

export const StudentEnrollmentWizard = () => {
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
      // Simulate API call
      try {
        const response = await submitStudentEnrollment(formData as CreateStudentRequest);
        if (response.success) {
          // Add generated ID if needed, but the mock just simulates it
          setCurrentStep(4);
        }
      } catch (error) {
        console.error("Failed to submit student", error);
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
    // In a real app, this might navigate away or show a confirmation modal
    console.log("Enrollment cancelled");
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
          <span>Dashboard</span>
          <span>&rsaquo;</span>
          <span className="font-semibold text-gray-900">Students</span>
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
            { step: 2, label: 'ACADEMIC' },
            { step: 3, label: 'PARENTAL' },
            { step: 4, label: 'REVIEW' },
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
