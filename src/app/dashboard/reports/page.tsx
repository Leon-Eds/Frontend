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
import { reportApi, classApi, sessionApi } from "@/lib/api";
import toast from "react-hot-toast";
import { DataTable, Column } from '@/components/ui/DataTable';

// Where each report endpoint puts its rows
const REPORT_LIST_KEYS: Record<string, string> = {
  enrollment: "students",
  attendance: "students",
  performance: "scores",
  feepayment: "payments",
  revenue: "transactions",
  studentstatus: "students",
  outstandingfees: "debtors",
};

const humanize = (key: string) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).trim();

function extractRows(type: string, payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (type === "staff") {
    const teachers = (payload.teachers || []).map((t: any) => ({ role: "Teacher", ...t }));
    const bursars = (payload.bursars || []).map((b: any) => ({ role: "Bursar", fullName: b.name, ...b }));
    return [...teachers, ...bursars];
  }
  const rows = payload[REPORT_LIST_KEYS[type]];
  return Array.isArray(rows) ? rows : [];
}

// Top-level totals (numbers/strings, and one level of nested counts) shown above the table
function extractSummary(payload: any): { label: string; value: string }[] {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [];
  const skip = /id$|date$/i;
  const items: { label: string; value: string }[] = [];
  for (const [key, value] of Object.entries(payload)) {
    if (skip.test(key)) continue;
    if (typeof value === "number" || typeof value === "string") {
      items.push({ label: humanize(key), value: typeof value === "number" ? value.toLocaleString() : value });
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const [subKey, subValue] of Object.entries(value)) {
        if (typeof subValue === "number") items.push({ label: `${humanize(key)}: ${humanize(subKey)}`, value: subValue.toLocaleString() });
      }
    }
  }
  return items;
}

export default function ReportsHub() {
  const [activeTab, setActiveTab] = useState<"academic" | "financial" | "admin">("academic");
  const [activeReport, setActiveReport] = useState<string>("enrollment");
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportSummary, setReportSummary] = useState<{ label: string; value: string }[]>([]);

  const [classes, setClasses] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedTermId, setSelectedTermId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]);

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

  // Filters each report actually uses on the backend
  const needsClass = ["attendance", "performance"].includes(activeReport);
  const needsTerm = ["attendance", "performance", "feepayment", "outstandingfees"].includes(activeReport);
  const needsDates = activeReport === "revenue";

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [classesData, sessionsData] = await Promise.all([
          classApi.getAll().catch((e) => { console.error(e); return []; }),
          sessionApi.getAll().catch((e) => { console.error(e); return []; })
        ]);
        
        const validClasses = Array.isArray(classesData) ? classesData : [];
        setClasses(validClasses);
        if (validClasses.length > 0) {
          setSelectedClassId(validClasses[0].id || (validClasses[0] as any)._id || (validClasses[0] as any).classId);
        }

        const validSessions = Array.isArray(sessionsData) ? sessionsData : [];
        setAllSessions(validSessions);
        const activeSession = validSessions.find((s: any) => s.isCurrent) || validSessions[0];
        if (activeSession) {
          const sId = activeSession.id || (activeSession as any)._id || (activeSession as any).academicSessionId;
          setSelectedSessionId(sId);
        }
      } catch (err) {
        console.error("Failed to load filters for reports", err);
      }
    };
    loadFilters();
  }, []);

  useEffect(() => {
    if (!selectedSessionId || allSessions.length === 0) return;
    const session = allSessions.find(s => (s.id || s._id) === selectedSessionId);
    if (session && Array.isArray(session.terms)) {
      setTerms(session.terms);
      if (session.terms.length > 0) {
        const activeTerm = session.terms.find((t: any) => t.isCurrent) || session.terms[0];
        setSelectedTermId(activeTerm.id || activeTerm._id);
      }
    } else {
      setTerms([]);
    }
  }, [selectedSessionId, allSessions]);

  const fetchReport = async (type: string, classId: string, termId: string) => {
    setReportData([]);
    setReportSummary([]);
    // Wait until the filters this report needs have loaded
    if ((["attendance", "performance"].includes(type) && !classId) ||
        (["attendance", "performance", "feepayment", "outstandingfees"].includes(type) && !termId)) {
      return;
    }

    setIsLoading(true);
    try {
      let res: any;
      switch (type) {
        case "enrollment": res = await reportApi.getEnrollment(undefined, selectedSessionId); break;
        case "attendance": res = await reportApi.getAttendance(classId, termId, selectedSessionId); break;
        case "performance": res = await reportApi.getPerformance(classId, termId, selectedSessionId); break;
        case "feepayment": res = await reportApi.getFeePayment(termId, selectedSessionId); break;
        case "revenue": res = await reportApi.getRevenue(startDate, endDate); break;
        case "studentstatus": res = await reportApi.getStudentStatus(termId, undefined, selectedSessionId); break;
        case "staff": res = await reportApi.getStaff(); break;
        case "outstandingfees": res = await reportApi.getOutstandingFees(termId, selectedSessionId); break;
      }
      const payload = res?.data ?? res ?? {};
      setReportData(extractRows(type, payload));
      setReportSummary(extractSummary(payload));
    } catch (e: any) {
      toast.error(e.message || "Failed to load report");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(activeReport, selectedClassId, selectedTermId);
  }, [activeReport, selectedClassId, selectedTermId, selectedSessionId, startDate, endDate]);

  // The Excel and PDF libraries are large, so they load only when an export is requested
  const handleExportExcel = async () => {
    if (!reportData || reportData.length === 0) {
      toast.error("No data to export");
      return;
    }
    const rt = reportTypes.find(r => r.id === activeReport);
    const filename = `LeonEd Report ${rt?.name || 'Data'} ${new Date().getFullYear()}.xlsx`;
    const XLSX = await import("xlsx");
    
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, filename);
    toast.success("Excel Export Downloaded");
  };

  const handleExportPDF = async () => {
    if (!reportData || reportData.length === 0) {
      toast.error("No data to export");
      return;
    }
    const rt = reportTypes.find(r => r.id === activeReport);
    const filename = `LeonEd Report ${rt?.name || 'Data'} ${new Date().getFullYear()}.pdf`;
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);

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
          {allSessions.length > 0 && (
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] shadow-sm appearance-none min-w-[150px]"
            >
              {allSessions.map(s => (
                <option key={s.id || s._id} value={s.id || s._id}>
                  {s.name || s.sessionName || "Session"} {s.isCurrent ? '(Current)' : ''}
                </option>
              ))}
            </select>
          )}
          {needsClass && classes.length > 0 && (
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] shadow-sm appearance-none min-w-[120px]"
            >
              {classes.map(c => (
                <option key={c.id || c._id || c.classId} value={c.id || c._id || c.classId}>
                  {c.name || c.className || "Class"}
                </option>
              ))}
            </select>
          )}
          {needsTerm && terms.length > 0 && (
            <select
              value={selectedTermId}
              onChange={(e) => setSelectedTermId(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] shadow-sm appearance-none min-w-[150px]"
            >
              {terms.map(t => (
                <option key={t.id || t._id || t.termId} value={t.id || t._id || t.termId}>
                  {t.name || t.termName || (t.termNumber ? `${t.termNumber} Term` : "Term")}
                </option>
              ))}
            </select>
          )}
          {needsDates && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] shadow-sm"
              />
              <span className="text-gray-400 font-bold">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] shadow-sm"
              />
            </div>
          )}
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

            {!isLoading && reportSummary.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {reportSummary.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{item.label}</p>
                    <p className="text-lg font-black text-[#053d26] mt-1 break-words">{item.value}</p>
                  </div>
                ))}
              </div>
            )}

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
