"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, CheckCircle2, LogIn, LogOut, AlertCircle, Loader2, Search } from "lucide-react";
import QRScanner from "@/components/dashboard/QRScanner";
import { attendanceApi, ScanResult } from "@/lib/api";

interface ScanEntry {
  id: number;
  admissionNumber: string;
  studentName?: string;
  event?: ScanResult["event"];
  error?: string;
  at: Date;
}

// The same card read again within this window is a duplicate camera read
const DUPLICATE_WINDOW_MS = 5000;

const eventCopy: Record<ScanResult["event"], { label: string; tone: string; Icon: typeof CheckCircle2 }> = {
  CheckIn: { label: "Checked in", tone: "bg-green-50 border-green-200 text-green-800", Icon: LogIn },
  CheckOut: { label: "Checked out", tone: "bg-blue-50 border-blue-200 text-blue-800", Icon: LogOut },
  Marked: { label: "Marked present", tone: "bg-green-50 border-green-200 text-green-800", Icon: CheckCircle2 },
  AlreadyCheckedIn: { label: "Already checked in", tone: "bg-amber-50 border-amber-200 text-amber-800", Icon: AlertCircle },
  AlreadyCheckedOut: { label: "Already checked out today", tone: "bg-amber-50 border-amber-200 text-amber-800", Icon: AlertCircle },
  NotCheckedIn: { label: "Not checked in today", tone: "bg-amber-50 border-amber-200 text-amber-800", Icon: AlertCircle },
};

type ScanMode = "checkIn" | "checkOut";
const MODE_STORAGE_KEY = "leoned_scanner_mode";

/** Student cards encode JSON with an admissionNumber; older cards hold the number as plain text. */
function readAdmissionNumber(decodedText: string): { admissionNumber?: string; error?: string } {
  try {
    const data = JSON.parse(decodedText);
    if (data?.type === "staff") return { error: "This is a staff ID card, not a student card." };
    const admissionNumber = data?.admissionNumber || data?.studentId || data?.id;
    return admissionNumber ? { admissionNumber: String(admissionNumber) } : { error: "This QR code is not a student ID card." };
  } catch {
    return decodedText.trim() ? { admissionNumber: decodedText.trim() } : { error: "Empty QR code." };
  }
}

const todayLocal = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in the device's time zone

export default function AttendanceScannerPage() {
  const [isScanning, setIsScanning] = useState(true);
  // Explicit check-in/check-out so a student scanned in twice is never checked out by mistake
  const [mode, setMode] = useState<ScanMode>("checkIn");
  const [manualNumber, setManualNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entries, setEntries] = useState<ScanEntry[]>([]);
  const lastRead = useRef<{ text: string; at: number } | null>(null);
  const nextId = useRef(1);

  useEffect(() => {
    try {
      if (localStorage.getItem(MODE_STORAGE_KEY) === "checkOut") setMode("checkOut");
    } catch {}
  }, []);

  const changeMode = (next: ScanMode) => {
    setMode(next);
    lastRead.current = null; // let the same card be scanned straight away in the new mode
    try { localStorage.setItem(MODE_STORAGE_KEY, next); } catch {}
  };

  const record = async (admissionNumber: string) => {
    setIsSubmitting(true);
    const entry: ScanEntry = { id: nextId.current++, admissionNumber, at: new Date() };
    try {
      const result = await attendanceApi.scanIdCard(admissionNumber, todayLocal(), "Present", "Scanned QR Code", mode);
      entry.studentName = result?.studentName;
      entry.event = result?.event || "Marked";
    } catch (err) {
      entry.error = err instanceof Error ? err.message : "Could not record attendance.";
    } finally {
      setEntries(prev => [entry, ...prev].slice(0, 50));
      setIsSubmitting(false);
    }
  };

  const handleScan = (decodedText: string) => {
    const now = Date.now();
    if (lastRead.current && lastRead.current.text === decodedText && now - lastRead.current.at < DUPLICATE_WINDOW_MS) return;
    lastRead.current = { text: decodedText, at: now };

    const { admissionNumber, error } = readAdmissionNumber(decodedText);
    if (error || !admissionNumber) {
      setEntries(prev => [{ id: nextId.current++, admissionNumber: "", error, at: new Date() }, ...prev].slice(0, 50));
      return;
    }
    record(admissionNumber);
  };

  const latest = entries[0];
  const latestCopy = latest?.event ? eventCopy[latest.event] : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#053d26]">Scan Attendance</h1>
          <p className="text-gray-600 text-sm mt-1">
            Scan a student&apos;s ID card to record attendance for {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}.
          </p>
        </div>
        <button
          onClick={() => setIsScanning(s => !s)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 bg-white font-bold text-gray-700 hover:bg-gray-50"
        >
          {isScanning ? <><CameraOff className="h-4 w-4" /> Stop camera</> : <><Camera className="h-4 w-4" /> Start camera</>}
        </button>
      </div>

      <div role="radiogroup" aria-label="Scan mode" className="grid grid-cols-2 gap-2 bg-gray-100 p-1.5 rounded-2xl">
        {([
          { value: "checkIn", label: "Check in", hint: "Arriving at school", Icon: LogIn },
          { value: "checkOut", label: "Check out", hint: "Leaving school", Icon: LogOut },
        ] as const).map(option => {
          const selected = mode === option.value;
          return (
            <button
              key={option.value}
              role="radio"
              aria-checked={selected}
              onClick={() => changeMode(option.value)}
              className={`flex items-center justify-center gap-3 rounded-xl py-3 px-4 transition-colors ${selected
                ? option.value === "checkIn" ? "bg-[#053d26] text-white shadow-sm" : "bg-blue-700 text-white shadow-sm"
                : "text-gray-600 hover:bg-white"}`}
            >
              <option.Icon className="h-5 w-5" />
              <span className="text-left">
                <span className="block font-bold">{option.label}</span>
                <span className={`block text-xs ${selected ? "text-white/80" : "text-gray-500"}`}>{option.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      {latest && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-2xl border p-5 flex items-center gap-4 ${latest.error ? "bg-red-50 border-red-200 text-red-800" : latestCopy?.tone}`}
        >
          {latest.error ? <AlertCircle className="h-8 w-8 shrink-0" /> : latestCopy && <latestCopy.Icon className="h-8 w-8 shrink-0" />}
          <div>
            <p className="text-lg font-black">{latest.error ? "Not recorded" : latestCopy?.label}</p>
            <p className="text-sm">
              {latest.error || `${latest.studentName || latest.admissionNumber} · ${latest.at.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true })}`}
            </p>
          </div>
        </div>
      )}

      {isScanning && (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <QRScanner onScanSuccess={handleScan} />
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (manualNumber.trim()) {
            record(manualNumber.trim());
            setManualNumber("");
          }
        }}
        className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3"
      >
        <label htmlFor="manual-admission" className="sr-only">Admission number</label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            id="manual-admission"
            value={manualNumber}
            onChange={(e) => setManualNumber(e.target.value)}
            placeholder="Card won't scan? Type the admission number"
            className="w-full rounded-xl bg-gray-100 pl-9 pr-4 py-3 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26]"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !manualNumber.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#053d26] text-white font-bold hover:bg-[#042c1b] disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "checkIn" ? "Check in" : "Check out"}
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900">Scans this session ({entries.length})</h2>
        {entries.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-500 text-center">No scans yet. Hold a student&apos;s ID card up to the camera.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {entries.map(entry => (
              <li key={entry.id} className="px-5 py-3 flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{entry.studentName || entry.admissionNumber || "Unreadable card"}</p>
                  <p className={`text-xs ${entry.error ? "text-red-600" : "text-gray-500"}`}>
                    {entry.error || (entry.event ? eventCopy[entry.event].label : "")}
                  </p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {entry.at.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
