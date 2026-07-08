"use client";

import { useEffect, useRef } from "react";

/**
 * Hook to connect to the backend announcements WebSocket.
 * Calls `onUpdate` whenever a relevant event (new announcement, delete, etc.) is received.
 */
export function useAnnouncementsWebSocket(onUpdate: () => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const connect = () => {
      if (!isMounted) return;

      try {
        // Construct standard websocket URL based on current host.
        // Fallback to the production backend ws URL for now.
        const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
        let wsUrl = "wss://leoned.vercel.app/api/ws/announcements";
        
        if (host === "localhost") {
          // If the backend has a local ws proxy or endpoint, it would be here
          // wsUrl = "ws://localhost:3000/backend-api/ws/announcements";
        }

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          reconnectAttempts = 0; // Reset attempts on successful connection
          // Send auth token if required by backend, otherwise standard connection
          const token = localStorage.getItem('leoned_token');
          if (token && token !== 'undefined') {
            // Optional: send auth handshake
            // ws.send(JSON.stringify({ type: 'auth', token }));
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            // Whenever we get a valid payload regarding announcements, trigger an update
            if (data?.event === "new_announcement" || data?.event === "delete_announcement" || data?.type === "announcements_updated") {
              onUpdate();
            } else {
              // Fallback: If payload shape is unknown but we get a message, trigger a generic update
              onUpdate();
            }
          } catch (e) {
            // If not JSON, still trigger update as a fallback ping
            onUpdate();
          }
        };

        ws.onclose = () => {
          wsRef.current = null;
          if (isMounted && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff max 30s
            reconnectTimeoutRef.current = setTimeout(connect, timeout);
          }
        };

        ws.onerror = (error) => {
          // Socket errors usually result in onclose being called immediately after.
          console.debug("[Announcements WS] Socket error:", error);
        };
      } catch (err) {
        console.error("Failed to setup WebSocket:", err);
      }
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [onUpdate]);

  return {
    reconnect: () => {
      if (wsRef.current) {
        wsRef.current.close(); // Will trigger auto-reconnect via onclose
      }
    }
  };
}
