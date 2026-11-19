"use client";

import React, { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { AlertCircle, Camera, ImageIcon, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: any) => void;
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const { t } = useLanguage();
  const [errorMsg, setErrorMsg] = useState("");
  const [isStarting, setIsStarting] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const onScanSuccessRef = useRef(onScanSuccess);
  const onScanErrorRef = useRef(onScanError);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
    onScanErrorRef.current = onScanError;
  }, [onScanSuccess, onScanError]);

  useEffect(() => {
    let cancelled = false;

    const startCamera = async () => {
      // Small delay for React 18 StrictMode double-mount
      await new Promise(resolve => setTimeout(resolve, 150));
      if (cancelled) return;

      try {
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (onScanSuccessRef.current) {
              onScanSuccessRef.current(decodedText);
            }
            // Pause scanning briefly after a successful scan
            scanner.pause(true);
            setTimeout(() => {
              try { scanner.resume(); } catch (e) {}
            }, 2000);
          },
          (errorMessage) => {
            // Ignore "No QR code found" messages — they fire constantly
          }
        );

        if (!cancelled) {
          setCameraActive(true);
          setIsStarting(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("Camera start failed:", err);
          setErrorMsg(
            err?.message?.includes("NotAllowed") || err?.message?.includes("Permission")
              ? "qr.denied"
              : err?.message?.includes("NotFound")
              ? "qr.no_camera"
              : `qr.start_failed|${err?.message || err}`
          );
          setIsStarting(false);
        }
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      if (scannerRef.current) {
        // stop() throws synchronously when the camera never started (e.g. permission denied)
        try {
          scannerRef.current.stop().catch(() => {});
        } catch {}
        scannerRef.current = null;
      }
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // If camera is running, stop it first
      if (scannerRef.current && cameraActive) {
        try {
          await scannerRef.current.stop();
        } catch {}
        setCameraActive(false);
      }

      const scanner = scannerRef.current || new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      const result = await scanner.scanFile(file, true);
      if (onScanSuccessRef.current) {
        onScanSuccessRef.current(result);
      }
    } catch (err: any) {
      setErrorMsg("qr.not_found");
      setTimeout(() => setErrorMsg(""), 3000);
    }

    // Reset the file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-sm mx-auto rounded-2xl border border-gray-200 shadow-sm bg-white overflow-hidden">
      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg.startsWith("qr.start_failed|") ? t("qr.start_failed", { msg: errorMsg.slice("qr.start_failed|".length) }) : t(errorMsg)}
        </div>
      )}

      {isStarting && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#053d26]" />
          <p className="text-xs font-semibold text-gray-500">{t("qr.starting")}</p>
        </div>
      )}

      <div id="qr-reader" className="w-full" />

      {/* File upload fallback */}
      <div className="p-3 border-t border-gray-100 flex justify-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
          id="qr-file-input"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          {t("qr.upload")}
        </button>
      </div>
    </div>
  );
}
