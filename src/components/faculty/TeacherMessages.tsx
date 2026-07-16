"use client";

import { useState, useEffect } from "react";
import { Megaphone, Calendar, Loader2, AlertCircle } from "lucide-react";
import { announcementApi } from "@/lib/api";

export default function TeacherMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const data = await announcementApi.getAll().catch(() => []);
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load messages.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[20vh] text-gray-400 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading announcements...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[20vh] text-red-500 gap-2 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
        <AlertCircle className="w-8 h-8" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-5">
          <Megaphone className="w-6 h-6 text-[#053d26]" />
          <h2 className="text-xl font-black text-gray-900">School Bulletins & Announcements</h2>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No new announcements at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow group">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 gap-2">
                  <h3 className="font-extrabold text-gray-900 text-lg tracking-tight group-hover:text-[#053d26] transition-colors">{msg.title || "Announcement"}</h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-bold uppercase tracking-widest bg-white px-3 py-1.5 rounded-xl border border-gray-200 w-fit">
                    <Calendar className="w-3.5 h-3.5" />
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : "Recent"}
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{msg.content || msg.message}</p>
                {msg.senderName && (
                  <p className="text-[10px] text-gray-400 mt-4 font-bold uppercase tracking-widest">
                    From: {msg.senderName}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
