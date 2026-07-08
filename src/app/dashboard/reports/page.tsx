"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  Users, 
  Activity, 
  Banknote, 
  TrendingUp, 
  AlertCircle,
  Loader2,
  Calendar,
  Printer
} from "lucide-react";
import { reportApi } from "@/lib/api";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DataTable, Column } from '@/components/ui/DataTable';

export default function ReportsHub() {
  const [activeTab, setActiveTab] = useState<"academic" | "financial" | "admin">("academic");
  const [activeReport, setActiveReport] = useState<string>("enrollment");
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);

  const reportTypes = [
    { id: "enrollment", name: "Enrollment Status", icon: Users, desc: "Current student numbers" },
    { id: "attendance", name: "Attendance Records", icon: Calendar, desc: "Daily & term attendance" },
    { id: "performance", name: "Academic Performance", icon: TrendingUp, desc: "Grades and analytics" },
    { id: "feepayment", name: "Fee Payments", icon: Banknote, desc: "Payment histories" },
    { id: "revenue", name: "School Revenue", icon: Activity, desc: "Total income vs expected" },
    { id: "studentstatus", name: "Student Status", icon: AlertCircle, desc: "Active vs inactive" },
    { id: "staff", name: "Staff Directory", icon: Users, desc: "Teachers and roles" },
    { id: "outstandingfees", name: "Outstanding Fees", icon: AlertCircle, desc: "Pending balances" },
  ];

  const fetchReport = async (type: string) => {
    setIsLoading(true);
    setReportData([]);
    try {
      let res: any;
      switch (type) {
        case "enrollment": res = await reportApi.getEnrollment(); break;
        case "attendance": res = await reportApi.getAttendance(); break;
        case "performance": res = await reportApi.getPerformance(); break;
        case "feepayment": res = await reportApi.getFeePayment(); break;
        case "revenue": res = await reportApi.getRevenue(); break;
        case "studentstatus": res = await reportApi.getStudentStatus(); break;
        case "staff": res = await reportApi.getStaff(); break;
        case "outstandingfees": res = await reportApi.getOutstandingFees(); break;
      }
      let fetchedData = res?.data || res || [];
      if (fetchedData && !Array.isArray(fetchedData)) {
        fetchedData = fetchedData.items || fetchedData.records || fetchedData.results || fetchedData.students || fetchedData.staff || fetchedData.data || [];
      }
      setReportData(Array.isArray(fetchedData) ? fetchedData : []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load report");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(activeReport);
  }, [activeReport]);

  const handleExportExcel = () => {
    if (!reportData || reportData.length === 0) {
      toast.error("No data to export");
      return;
    }
    const rt = reportTypes.find(r => r.id === activeReport);
    const filename = `LeonEd Report ${rt?.name || 'Data'} ${new Date().getFullYear()}.xlsx`;
    
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, filename);
    toast.success("Excel Export Downloaded");
  };

  const handleExportPDF = () => {
    if (!reportData || reportData.length === 0) {
      toast.error("No data to export");
      return;
    }
    const rt = reportTypes.find(r => r.id === activeReport);
    const filename = `LeonEd Report ${rt?.name || 'Data'} ${new Date().getFullYear()}.pdf`;

    const doc = new jsPDF();
    const columns = Object.keys(reportData[0]);
    const rows = reportData.map((row: any) => columns.map(col => {
      const val = row[col];
      if (val && typeof val === 'object') return JSON.stringify(val);
      return String(val ?? '');
    }));

    doc.setFontSize(18);
    doc.text(`LeonEd Official Report: ${rt?.name}`, 14, 22);
    
    autoTable(doc, {
      head: [columns.map(key => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))],
      body: rows,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [5, 61, 38] }
    });

    doc.save(filename);
    toast.success("PDF Export Downloaded");
  };

  const handlePrint = () => {
    if (!reportData || reportData.length === 0) {
      toast.error("No data to print");
      return;
    }
    window.print();
  };

  const generateColumns = (data: any[]): Column<any>[] => {
    if (!Array.isArray(data) || data.length === 0 || !data[0]) return [];
    return Object.keys(data[0]).map(key => ({
      header: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      accessor: key,
      render: (val: any) => {
        if (typeof val === 'boolean') return val ? 'Yes' : 'No';
        if (val && typeof val === 'object') return JSON.stringify(val);
        return String(val ?? '-');
      }
    }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
        <div>
          <h1 className="text-4xl font-bold text-[#053d26] mb-2">Reports Hub</h1>
          <p className="text-gray-600">Comprehensive analytics and printable reports for all school operations.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Printer className="h-5 w-5" />
            Print
          </button>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-[#053d26] font-bold hover:bg-[#053d26]/5 transition-colors shadow-sm"
          >
            <Download className="h-5 w-5" />
            Excel
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#053d26] text-white font-bold hover:bg-[#042c1b] transition-colors shadow-sm"
          >
            <FileText className="h-5 w-5" />
            PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Selectors */}
        <div className="lg:col-span-1 space-y-2 print:hidden">
          {reportTypes.map((rt) => {
            const Icon = rt.icon;
            const isActive = activeReport === rt.id;
            return (
              <button
                key={rt.id}
                onClick={() => setActiveReport(rt.id)}
                className={`w-full flex items-start gap-4 p-4 rounded-2xl transition-all border text-left ${
                  isActive 
                    ? "bg-white border-[#053d26]/20 shadow-sm ring-1 ring-[#053d26]" 
                    : "bg-transparent border-transparent hover:bg-white hover:border-gray-200"
                }`}
              >
                <div className={`p-2 rounded-xl ${isActive ? "bg-[#053d26]/10 text-[#053d26]" : "bg-gray-100 text-gray-500"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={`font-bold ${isActive ? "text-[#053d26]" : "text-gray-700"}`}>{rt.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{rt.desc}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Report Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 min-h-[500px] print:shadow-none print:border-none print:p-0">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 flex items-center gap-3">
              <FileText className="h-6 w-6 text-[#20c997] print:hidden" />
              {reportTypes.find(r => r.id === activeReport)?.name}
            </h2>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4 print:hidden">
                <Loader2 className="h-10 w-10 animate-spin text-[#053d26]" />
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Generating Report...</p>
              </div>
            ) : !reportData || reportData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center print:hidden">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Data Available</h3>
                <p className="text-gray-500 max-w-sm">There is currently no data to display for this report type in the active academic session.</p>
              </div>
            ) : (
              <div className="overflow-x-auto print:overflow-visible">
                <DataTable 
                  columns={generateColumns(reportData)}
                  data={reportData}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: landscape; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
        }
      `}} />
    </div>
  );
}
