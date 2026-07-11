"use client";

import { useState, useRef, useEffect } from "react";
import { User, Mail, Hash, BookOpen, Calendar, Shield, ShieldCheck, CreditCard, Link as LinkIcon, Download, Eye, X, Printer } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { studentApi, schoolApi } from "@/lib/api";
import IdCard from "@/components/shared/IdCard";

export default function StudentProfile({ studentInfo }: { studentInfo: any }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [schoolInfo, setSchoolInfo] = useState({ name: '', address: '', phone: '', logo: '', theme: '#053d26' });
  const idCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Attempt to load school info
    try {
      const user = JSON.parse(localStorage.getItem('leoned_user') || '{}');
      if (user?.schoolId || user?.SchoolId) {
        schoolApi.getById(user.schoolId || user.SchoolId).then((res: any) => {
          setSchoolInfo({
            name: res.name || user.schoolName || '',
            address: res.address || '',
            phone: res.contactPhone || res.phone || '',
            logo: res.logoUrl || localStorage.getItem(`leoned_logo_${res.id}`) || '',
            theme: res.theme || localStorage.getItem(`leoned_theme_${res.id}`) || '#053d26',
          });
        }).catch(() => {});
      }
    } catch {}
  }, []);

  if (!studentInfo) return null;

  const handlePreviewId = () => {
    setShowPreview(true);
  };

  const handleDownloadFromPreview = async () => {
    if (!idCardRef.current) return;
    const toastId = toast.loading('Generating PDF...');
    const opt: any = {
      margin:       0.5,
      filename:     `ID-Card-${studentInfo.admissionNumber || studentInfo.fullName}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf().set(opt).from(idCardRef.current).save().then(() => {
      toast.success('Downloaded successfully!', { id: toastId });
    }).catch((err: any) => {
      toast.error('Failed to generate PDF', { id: toastId });
      console.error(err);
    });
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#053d26]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        {/* Subtle inner top glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#053d26]/20 to-transparent" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Personal Details</h2>
            <p className="text-gray-500 text-sm mt-1 font-medium">Your official school records and information</p>
          </div>
          <button 
            onClick={handlePreviewId}
            className="group flex items-center gap-2.5 px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="w-6 h-6 rounded-md bg-[#053d26]/10 text-[#053d26] flex items-center justify-center group-hover:bg-[#053d26] group-hover:text-white transition-colors duration-300">
              <Eye className="w-3.5 h-3.5" />
            </div>
            Preview ID Card
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Items */}
          {[
            { icon: User, label: "Full Name", value: studentInfo.fullName || studentInfo.name },
            { icon: Hash, label: "Admission Number", value: studentInfo.admissionNumber || studentInfo.studentId || "—" },
            { icon: BookOpen, label: "Form Class", value: studentInfo.className || studentInfo.formClass || "—" },
            ...(studentInfo.dateOfBirth ? [{ icon: Calendar, label: "Date of Birth", value: new Date(studentInfo.dateOfBirth).toLocaleDateString() }] : []),
            ...(studentInfo.gender ? [{ icon: ShieldCheck, label: "Gender", value: studentInfo.gender, capitalize: true }] : [])
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="group p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-[#053d26]/20 hover:shadow-[0_8px_20px_rgba(5,61,38,0.04)] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#053d26]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-center gap-4 mb-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-500 group-hover:text-[#053d26] group-hover:border-[#053d26]/20 group-hover:bg-[#053d26]/5 transition-colors duration-300">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[#053d26]/70 transition-colors duration-300">{item.label}</span>
              </div>
              <p title={String(item.value)} className={`font-bold text-gray-900 text-lg relative z-10 truncate ${item.capitalize ? 'capitalize' : ''}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Parent Information if available */}
      {(studentInfo.parentEmail || studentInfo.parentPhone) && (
        <div className="relative bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#b05e1c]/20 to-transparent" />
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Guardian / Contact Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50">
              <div className="flex items-center gap-3 mb-2 text-amber-700">
                <Mail className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Guardian Email</span>
              </div>
              <p className="font-bold text-gray-900 text-lg">{studentInfo.parentEmail || "N/A"}</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50">
              <div className="flex items-center gap-3 mb-2 text-amber-700">
                <Hash className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Guardian Phone</span>
              </div>
              <p className="font-bold text-gray-900 text-lg">{studentInfo.parentPhone || "N/A"}</p>
            </div>
          </div>
        </div>
      )}

      {/* ID Card Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 print:bg-white print:p-0 print:z-auto print:static">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 print:shadow-none print:p-0 print:m-0 print:bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-100 bg-gray-50 shrink-0 gap-4 print:hidden">
              <h3 className="font-bold text-lg text-gray-800">ID Card Preview</h3>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button onClick={() => window.print()} className="p-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:text-[#053d26] shadow-sm hover:bg-gray-50 transition-all" title="Print ID Card">
                  <Printer className="h-4 w-4" />
                </button>
                <button 
                  onClick={handleDownloadFromPreview}
                  className="flex items-center gap-2 px-4 py-2 bg-[#053d26] hover:bg-[#042c1b] text-white rounded-lg font-bold text-sm transition-colors"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
                <button 
                  onClick={closePreview}
                  className="p-2 hover:bg-gray-200 text-gray-500 rounded-lg transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 bg-gray-100 p-8 overflow-y-auto flex items-center justify-center print:bg-white print:p-0 print:overflow-visible">
              <div className="scale-75 sm:scale-90 md:scale-100 origin-top flex justify-center print:scale-100 print:transform-none">
                <IdCard 
                  ref={idCardRef}
                  student={studentInfo}
                  schoolInfo={schoolInfo}
                  principalName="Principal / Admin"
                />
              </div>
            </div>
            
            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{__html: `
              @media print {
                body * { visibility: hidden; }
                .id-card-container, .id-card-container * { visibility: visible; }
                .id-card-container {
                  position: absolute;
                  left: 0;
                  top: 0;
                  transform: scale(0.9);
                  transform-origin: top left;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                @page { size: landscape; margin: 0; }
              }
            `}} />
          </div>
        </div>
      )}
    </div>
  );
}
