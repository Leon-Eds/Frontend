"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Ms } from "../Ms";
import { useMk } from "../useMk";

// Chromium-only event; not in the standard DOM typings
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "leoned_install_dismissed";
const DISMISS_DAYS = 7;
const SHOW_DELAY_MS = 3000;

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  const ua = navigator.userAgent;
  // iPadOS reports itself as a Mac, so also check for touch support
  return /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
}

function recentlyDismissed() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return at > 0 && Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

/** "Install app" banner for the landing page. Uses the native prompt where supported, and shows Add to Home Screen steps on iOS. */
export function InstallPrompt() {
  const { t, r } = useMk();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [mode, setMode] = useState<"native" | "ios" | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    if (isStandalone() || recentlyDismissed()) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      timer = setTimeout(() => setMode("native"), SHOW_DELAY_MS);
    };
    const onInstalled = () => {
      setMode(null);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    if (isIos()) timer = setTimeout(() => setMode("ios"), SHOW_DELAY_MS);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    setMode(null);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    if (outcome === "accepted") setMode(null);
    else dismiss();
  };

  if (!mode) return null;

  return (
    <div className="install-prompt" role="dialog" aria-labelledby="install-prompt-title">
      <Image src="/icons/icon-192.png" alt="" width={52} height={52} className="install-prompt-icon" />
      <div className="install-prompt-body">
        <strong id="install-prompt-title">{t("mk.install.title")}</strong>
        {mode === "native" ? (
          <p>{t("mk.install.lead")}</p>
        ) : (
          <p>
            {r("mk.install.ios", {
              share: (c) => (
                <span className="install-prompt-step">
                  <Ms name="ios_share" /> {c}
                </span>
              ),
              add: (c) => (
                <span className="install-prompt-step">
                  <Ms name="add_box" /> {c}
                </span>
              ),
            })}
          </p>
        )}
        {mode === "native" && (
          <div className="install-prompt-actions">
            <button type="button" className="btn btn-primary" onClick={install}>
              <Ms name="install_mobile" /> {t("mk.install.cta")}
            </button>
            <button type="button" className="install-prompt-later" onClick={dismiss}>
              {t("mk.install.later")}
            </button>
          </div>
        )}
      </div>
      <button type="button" className="install-prompt-close" onClick={dismiss} aria-label={t("mk.install.close")}>
        <Ms name="close" />
      </button>
    </div>
  );
}
