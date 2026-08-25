"use client";

import { useEffect, useState } from "react";
import { Loader2, Download, Printer, CreditCard } from "lucide-react";
import QRCode from "react-qr-code";
import { studentApi } from "@/lib/api";

export default function IDCardPage() {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const userStr = localStorage.getItem("leoned_user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.id || user._id) {
            const data = await studentApi.getById(user.id || user._id);
            setStudent(data);
          }
        }
      } catch (err) {
        console.error("Failed to load student data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, []);

  const handleDownloadPDF = async () => {
    try {
      const blob = await studentApi.downloadMyIdCardPdf();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${student?.fullName?.replace(/\s+/g, '_')}_ID_Card.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#053d26]" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-20 text-gray-500">
        <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Failed to load student data. Please try again later.</p>
      </div>
    );
  }

  const qrValue = JSON.stringify({
    id: student.id || student._id,
    type: "STUDENT",
    name: student.fullName
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#053d26]">Digital ID Card</h1>
          <p className="text-gray-600 text-sm mt-1">Download or print your official school ID card.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors shadow-sm"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-12 border border-gray-100 shadow-sm flex items-center justify-center">
        {/* ID Card Wrapper - specific size for CR-80 card ratio (roughly 3.375" x 2.125") */}
        <div 
          id="id-card" 
          className="relative overflow-hidden bg-white shadow-xl w-[3.375in] h-[2.125in] print:shadow-none"
          style={{ width: "3.375in", height: "2.125in", fontSize: "10px" }}
        >
          {/* Card Background Design */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#053d26]/10 to-white/50 z-0"></div>
          <div className="absolute top-0 left-0 right-0 h-1/4 bg-[#053d26] z-10 flex items-center px-4">
            <h2 className="text-white font-bold text-sm tracking-widest uppercase">
              {student.school?.name || "LeonEd Institution"}
            </h2>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#b05e1c] z-10"></div>

          {/* Content Wrapper */}
          <div className="absolute inset-0 top-1/4 bottom-2 p-3 z-20 flex gap-4">
            {/* Left side: Photo & QR */}
            <div className="w-1/3 flex flex-col justify-between items-center h-full pt-1">
              {student.profilePictureUrl ? (
                <img src={student.profilePictureUrl} alt="Student" className="w-[1.2in] h-[1.2in] object-cover rounded-md border-2 border-white shadow-sm" />
              ) : (
                <div className="w-[1in] h-[1in] bg-gray-200 rounded-md border-2 border-white shadow-sm flex items-center justify-center">
                  <span className="text-gray-400 font-bold">No Photo</span>
                </div>
              )}
            </div>

            {/* Right side: Details & QR */}
            <div className="w-2/3 flex flex-col justify-between h-full pt-1 pr-1">
              <div>
                <h3 className="font-black text-[#053d26] uppercase leading-tight truncate text-base" style={{ fontSize: "14px" }}>
                  {student.fullName}
                </h3>
                <p className="text-[#b05e1c] font-bold text-[10px] uppercase tracking-wider mb-1">Student</p>
                
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] mt-2">
                  <div>
                    <p className="text-gray-400 uppercase tracking-widest" style={{ fontSize: "7px" }}>Class</p>
                    <p className="font-bold text-gray-900 truncate">{student.className || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 uppercase tracking-widest" style={{ fontSize: "7px" }}>ID Number</p>
                    <p className="font-bold text-gray-900 truncate">{student.admissionNumber || "N/A"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400 uppercase tracking-widest" style={{ fontSize: "7px" }}>Emergency</p>
                    <p className="font-bold text-gray-900 truncate">{student.parentPhone || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* QR Code at the bottom right */}
              <div className="absolute bottom-3 right-3 bg-white p-1 rounded-sm shadow-sm">
                <QRCode value={qrValue} size={40} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
