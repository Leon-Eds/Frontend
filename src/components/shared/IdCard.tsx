"use client";

import React, { forwardRef } from "react";
import QRCode from "react-qr-code";
import { UserPlus } from "lucide-react";

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

    return (
      <div 
        ref={ref} 
        className="flex flex-col sm:flex-row gap-6 items-center print:flex-row print:gap-4 print:items-start bg-gray-50 p-6 rounded-2xl border border-gray-200 id-card-container"
      >
        {/* FRONT CARD */}
        <div 
          className="bg-white overflow-hidden shadow-xl relative flex flex-col shrink-0 print:shadow-none print:rounded-none"
          style={{ width: '3.375in', height: '5.375in', border: `2px solid ${themeColor}`, borderRadius: '1rem' }}
        >
          {/* Header */}
          <div 
            className="w-full pt-5 pb-3 px-4 text-center text-white flex flex-col items-center relative"
            style={{ backgroundColor: themeColor }}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
            
            {schoolInfo.logo ? (
              <img src={schoolInfo.logo} alt="School Logo" className="h-14 w-14 object-contain bg-white rounded-full p-1 mb-3 shadow-md relative z-10" crossOrigin="anonymous" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-white text-gray-900 flex items-center justify-center font-black text-2xl mb-3 shadow-md relative z-10">
                {schoolInfo.name?.charAt(0) || "S"}
              </div>
            )}
            <h2 className="text-[14px] font-black uppercase tracking-widest relative z-10 leading-tight">
              {schoolInfo.name || "School Name"}
            </h2>
            <p className="text-[10px] font-bold tracking-[0.2em] opacity-90 relative z-10 mt-1 uppercase text-white/90">Student Identity Card</p>
          </div>
          
          {/* Body */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 bg-white relative">
            {/* Photo */}
            <div className="relative mb-4 mt-2">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-50 shadow-md relative z-10">
                {student.profilePictureUrl || student.profilePicture || student.image ? (
                  <img src={student.profilePictureUrl || student.profilePicture || student.image} alt={student.fullName} className="w-full h-full object-cover" crossOrigin="anonymous" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
                    <UserPlus className="h-12 w-12" />
                  </div>
                )}
              </div>
              {/* Decorative background element behind photo */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full opacity-10" style={{ backgroundColor: themeColor }}></div>
            </div>

            {/* Info */}
            <div className="text-center w-full relative z-10">
              <h3 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-wide mb-1" style={{ color: themeColor }}>{student.fullName}</h3>
              <div className="w-16 h-1 mx-auto my-3 rounded-full opacity-20" style={{ backgroundColor: themeColor }}></div>
              <div className="flex flex-col gap-1.5 mt-4">
                <p className="text-sm font-bold text-gray-800 tracking-wider flex items-center justify-center gap-2">
                  <span className="uppercase text-gray-400 font-bold text-[11px] w-14 text-right">ID:</span> 
                  <span className="text-left w-36 truncate">{student.admissionNumber || student.studentId || 'N/A'}</span>
                </p>
                <p className="text-sm font-bold text-gray-800 tracking-wider flex items-center justify-center gap-2">
                  <span className="uppercase text-gray-400 font-bold text-[11px] w-14 text-right">Class:</span> 
                  <span className="text-left w-36 truncate">{student.className || student.formClass || 'Unassigned'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Front Footer */}
          <div 
            className="w-full py-3 px-4 text-center flex flex-col items-center justify-center border-t-4 shrink-0"
            style={{ backgroundColor: '#f8fafc', borderColor: themeColor }}
          >
            <p className="text-[10px] font-bold text-gray-600 tracking-widest uppercase">Front</p>
          </div>
        </div>

        {/* BACK CARD */}
        <div 
          className="bg-white overflow-hidden shadow-xl relative flex flex-col shrink-0 print:shadow-none print:rounded-none"
          style={{ width: '3.375in', height: '5.375in', border: `2px solid ${themeColor}`, borderRadius: '1rem' }}
        >
          {/* Back Header */}
          <div 
            className="w-full pt-4 pb-3 px-4 text-center text-white flex flex-col items-center relative shrink-0"
            style={{ backgroundColor: themeColor }}
          >
            <p className="text-[9px] font-bold tracking-wider opacity-90 leading-relaxed uppercase">
              This ID card is the property of
            </p>
            <h2 className="text-[12px] font-black uppercase tracking-widest mt-1">
              {schoolInfo.name || "School Name"}
            </h2>
          </div>

          {/* Back Body */}
          <div className="flex-1 flex flex-col items-center justify-between py-6 px-4 bg-white relative text-center">
            <div className="w-full">
              <p className="text-[10px] text-gray-600 font-semibold mb-4 px-2 leading-relaxed">
                Must be worn at all times while on school premises. Non-transferable.
              </p>
              
              {/* QR Code */}
              <div className="inline-block p-2 bg-white border-2 rounded-xl shadow-sm relative z-10" style={{ borderColor: `${themeColor}20` }}>
                <QRCode 
                  value={JSON.stringify({ s: schoolInfo.name, n: student.fullName, id: student.admissionNumber || student.studentId })} 
                  size={100}
                  level="Q"
                  fgColor={themeColor}
                />
              </div>
            </div>

            {/* Principal & Validity */}
            <div className="w-full mt-4">
              <div className="flex flex-col items-center mb-3">
                <div className="w-32 border-b-2 border-gray-400 mb-1">
                  <p className="text-lg text-gray-800" style={{ fontFamily: "'Brush Script MT', 'Bradley Hand', cursive" }}>{principalName || ' '}</p>
                </div>
                <p className="text-[9px] font-bold text-gray-500 uppercase">Principal / Admin</p>
              </div>
              
              <div className="bg-gray-100 py-1.5 px-4 rounded-full inline-block">
                <p className="text-[10px] font-bold text-gray-800">
                  VALID TILL: <span style={{ color: themeColor }}>DEC {new Date().getFullYear() + 1}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Back Footer */}
          <div 
            className="w-full py-2 px-4 text-center flex flex-col items-center justify-center border-t-4 shrink-0"
            style={{ backgroundColor: '#f8fafc', borderColor: themeColor }}
          >
            <p className="text-[9px] font-bold text-gray-600 mb-1">If found, please return to:</p>
            <p className="text-[10px] font-black text-gray-800 mb-1 leading-tight">{schoolInfo.name || "School Name"}</p>
            {schoolInfo.address && <p className="text-[8px] text-gray-500 truncate max-w-full">{schoolInfo.address}</p>}
            {schoolInfo.phone && <p className="text-[8px] text-gray-500">{schoolInfo.phone}</p>}
            
            <div className="mt-2 pt-1 border-t border-gray-200 w-1/2">
              <p className="text-[7px] font-bold text-gray-400 tracking-widest uppercase">Powered by LeonEd</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

IdCard.displayName = "IdCard";

export default IdCard;
