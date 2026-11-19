"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Calendar, Loader2, AlertCircle } from "lucide-react";
import { announcementApi } from "@/lib/api";
import { useLanguage, localeFor } from "@/components/LanguageProvider";

export default function StudentMessages({ studentInfo }: { studentInfo: any }) {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        // Assuming announcementApi.getAll returns announcements relevant to the school
        const data = await announcementApi.getAll().catch(() => []);
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("msg.load_failed");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        {t("msg.loading_msgs")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-red-500 gap-2">
        <AlertCircle className="w-8 h-8" />
        <p>{t(error)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
          <MessageSquare className="w-6 h-6 text-[#b05e1c]" />
          <h2 className="text-2xl font-bold text-gray-900">{t("msg.messages_title")}</h2>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>{t("msg.empty_msgs")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">{msg.title || t("msg.announcement")}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold bg-white px-3 py-1 rounded-full border border-gray-200">
                    <Calendar className="w-3 h-3" />
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString(localeFor(language)) : t("msg.recent")}
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{msg.content || msg.message}</p>
                {msg.senderName && (
                  <p className="text-xs text-gray-400 mt-4 font-semibold uppercase tracking-wider">
                    {t("msg.from", { name: msg.senderName })}
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
