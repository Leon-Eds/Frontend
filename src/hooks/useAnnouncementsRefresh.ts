"use client";

import { useEffect, useRef } from "react";

const REFRESH_INTERVAL_MS = 60000;

/**
 * Keeps announcements fresh by calling `onUpdate` every minute while the page is visible,
 * and straight away when the user returns to the tab.
 * (The backend runs on Vercel serverless functions, which cannot hold WebSocket connections.)
 */
export function useAnnouncementsRefresh(onUpdate: () => void) {
  // Keep the latest callback without restarting the timer when the page re-renders
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") onUpdateRef.current();
    };

    const timer = setInterval(refreshIfVisible, REFRESH_INTERVAL_MS);
    document.addEventListener("visibilitychange", refreshIfVisible);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, []);
}
