"use client";

import React, { forwardRef } from "react";
import QRCode from "react-qr-code";
import { UserPlus, User, Phone, Users, IdCard as IdCardIcon, GraduationCap, Shield, Calendar } from "lucide-react";
import { LeonEdLogoText } from "@/components/ui/LeonEdText";

interface IdCardProps {
  student: any;
  schoolInfo: {
    name: string;
    address?: string;
    phone?: string;
    logo?: string;
    theme?: string;
  };
  principalName?: string;
}

const IdCard = forwardRef<HTMLDivElement, IdCardProps>(
  ({ student, schoolInfo, principalName = "Principal" }, ref) => {
    const themeColor = schoolInfo.theme || "#053d26";
    const accentColor = "#eab308"; // Gold/Yellow accent from design

    const issueDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, ' / ');

    return (
      <div 
        ref={ref} 
        className="flex flex-col sm:flex-row gap-6 items-center print:flex-row print:gap-4 print:items-start bg-gray-50 p-6 rounded-2xl border border-gray-200 id-card-container"
      >
        {/* FRONT CARD */}
        <div 
          className="bg-white overflow-hidden shadow-xl relative flex flex-col shrink-0 print:shadow-none print:rounded-none"
          style={{ width: '3.375in', height: '5.375in', borderRadius: '1rem' }}
        >
          {/* Lanyard Hole */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-3 bg-gray-100 rounded-full z-50 shadow-inner border border-gray-200" />

          {/* Top Background Shape */}
          <div className="absolute top-0 left-0 w-full h-32 z-0">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              <path d="M0,0 L100,0 L100,60 C70,90 30,70 0,50 Z" fill={themeColor}/>
              <path d="M0,50 C30,70 70,90 100,60 L100,65 C70,95 30,75 0,55 Z" fill={accentColor}/>
            </svg>
          </div>

          <div className="flex-1 flex flex-col items-center px-6 pt-12 relative z-10 w-full">
            {/* School Logo & Name */}
            <div className="flex flex-col items-center mb-3">
              {schoolInfo.logo ? (
                <img src={schoolInfo.logo} alt="School Logo" className="h-10 object-contain mb-1" crossOrigin="anonymous" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-white text-gray-900 flex items-center justify-center font-black text-xl mb-1 shadow-sm">
                  {schoolInfo.name?.charAt(0) || "S"}
                </div>
              )}
            </div>

            {/* Photo */}
            <div className="w-28 h-32 rounded-2xl overflow-hidden bg-gray-50 border-[3px] border-white shadow-[0_0_15px_rgba(0,0,0,0.1)] mb-3 relative">
              {student.profilePictureUrl || student.profilePicture || student.image ? (
                <img src={student.profilePictureUrl || student.profilePicture || student.image} alt={student.fullName} className="w-full h-full object-cover" crossOrigin="anonymous" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
                  <UserPlus className="h-10 w-10" />
                </div>
              )}
            </div>

            {/* Name and Pill */}
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide text-center leading-tight mb-1" style={{ color: themeColor }}>
              {student.fullName}
            </h2>
            <div className="px-4 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-widest mb-4" style={{ backgroundColor: accentColor }}>
              STUDENT
            </div>

            {/* Details List */}
            <div className="w-full space-y-2.5 mt-2">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: themeColor }}>
                  <IdCardIcon className="w-3 h-3 text-white" />
                </div>
                <div className="flex text-[10px] font-bold">
                  <span className="text-gray-500 w-20">STUDENT ID:</span>
                  <span className="text-gray-900 uppercase">{student.admissionNumber || student.studentId || 'N/A'}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: themeColor }}>
                  <GraduationCap className="w-3 h-3 text-white" />
                </div>
                <div className="flex text-[10px] font-bold">
                  <span className="text-gray-500 w-20">CLASS:</span>
                  <span className="text-gray-900 uppercase">{student.className || student.formClass || student.class?.name || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: themeColor }}>
                  <Shield className="w-3 h-3 text-white" />
                </div>
                <div className="flex text-[10px] font-bold">
                  <span className="text-gray-500 w-20">HOUSE:</span>
                  <span className="text-gray-900 uppercase">{student.house || 'UNITY'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: themeColor }}>
                  <Calendar className="w-3 h-3 text-white" />
                </div>
                <div className="flex text-[10px] font-bold">
                  <span className="text-gray-500 w-20">ISSUE DATE:</span>
                  <span className="text-gray-900 uppercase">{issueDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Background Shape */}
          <div className="absolute bottom-0 left-0 w-full h-20 z-0">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              <path d="M0,100 L100,100 L100,5 C70,40 30,20 0,30 Z" fill={themeColor}/>
              <path d="M0,30 C30,20 70,40 100,5 L100,10 C70,45 30,25 0,35 Z" fill={accentColor}/>
            </svg>
          </div>
        </div>

        {/* BACK CARD */}
        <div 
          className="bg-white overflow-hidden shadow-xl relative flex flex-col shrink-0 print:shadow-none print:rounded-none"
          style={{ width: '3.375in', height: '5.375in', borderRadius: '1rem' }}
        >
          {/* Lanyard Hole */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-3 bg-gray-100 rounded-full z-50 shadow-inner border border-gray-200" />

          {/* Top Background Shape (Deep Green) */}
          <div className="absolute top-0 left-0 w-full h-[40%] z-0">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              <path d="M0,0 L100,0 L100,80 C50,110 0,80 0,80 Z" fill={themeColor}/>
            </svg>
          </div>

          <div className="w-full pt-10 pb-2 flex justify-center relative z-10">
             {schoolInfo.logo ? (
                <img src={schoolInfo.logo} alt="School Logo" className="h-10 object-contain" crossOrigin="anonymous" />
              ) : (
                <div className="h-10 flex items-center justify-center font-black text-white text-xl">
                  {schoolInfo.name}
                </div>
              )}
          </div>

          <div className="flex-1 flex flex-col w-full px-6 relative z-10 mt-10">
            <h4 className="text-[9px] font-black text-center text-gray-900 mb-4">
              IN CASE OF EMERGENCY,<br/>PLEASE CONTACT:
            </h4>

            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: themeColor }}>
                  <User className="w-3 h-3 text-white" />
                </div>
                <div className="flex flex-col text-[9px] font-bold">
                  <span className="text-gray-500">NAME:</span>
                  <span className="text-gray-900 uppercase">{student.emergencyContactName || student.parentName || student.guardianName || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: themeColor }}>
                  <Phone className="w-3 h-3 text-white" />
                </div>
                <div className="flex flex-col text-[9px] font-bold">
                  <span className="text-gray-500">PHONE:</span>
                  <span className="text-gray-900 uppercase">{student.emergencyContactPhone || student.parentPhone || student.guardianPhone || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: themeColor }}>
                  <Users className="w-3 h-3 text-white" />
                </div>
                <div className="flex flex-col text-[9px] font-bold">
                  <span className="text-gray-500">RELATIONSHIP:</span>
                  <span className="text-gray-900 uppercase">{student.emergencyContactRelation || student.parentRelationship || 'PARENT/GUARDIAN'}</span>
                </div>
              </div>
            </div>

            <div className="w-full border-t border-gray-200 mb-2"></div>

            <h4 className="text-[8px] font-black text-center text-gray-900 mb-2">TERMS & CONDITIONS</h4>
            <ul className="text-[7px] text-gray-600 font-medium space-y-1 pl-2 list-disc ml-2">
              <li>This card is the property of the school.</li>
              <li>It must be worn at all times on school premises.</li>
              <li>This card is non-transferable.</li>
              <li>Report loss of this card to the school office immediately.</li>
            </ul>
          </div>

          {/* Bottom Background Shape & QR Code */}
          <div className="absolute bottom-0 left-0 w-full h-[25%] z-0 flex flex-col items-center justify-end pb-3">
            <svg viewBox="0 0 100 100" className="absolute bottom-0 left-0 w-full h-full z-0" preserveAspectRatio="none">
              <path d="M0,100 L100,100 L100,40 C70,10 30,30 0,20 Z" fill={themeColor}/>
              <path d="M0,20 C30,30 70,10 100,40 L100,45 C70,15 30,35 0,25 Z" fill={accentColor}/>
            </svg>
            
            <div className="bg-white p-1 rounded z-10 shadow-sm relative mb-1 -mt-8 border-2 border-white">
              <QRCode 
                value={JSON.stringify({ s: schoolInfo.name, n: student.fullName, id: student.admissionNumber || student.studentId })} 
                size={50}
                level="L"
              />
            </div>
            
            <p className="text-[7px] text-white font-medium z-10 tracking-widest uppercase opacity-90 relative">
              {schoolInfo.address || "www.leonedu.com"}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

IdCard.displayName = "IdCard";

export default IdCard;
