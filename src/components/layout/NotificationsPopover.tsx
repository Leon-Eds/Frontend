import { useState, useEffect, useRef } from "react";
import { Bell, Check, Info, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notificationsApi, NotificationPayload } from "@/lib/notifications";

export default function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);

  const loadNotifications = () => {
    setNotifications(notificationsApi.getNotifications());
  };

  useEffect(() => {
    loadNotifications();
    window.addEventListener('leoned_notification_updated', loadNotifications);
    return () => window.removeEventListener('leoned_notification_updated', loadNotifications);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    notificationsApi.markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    notificationsApi.markAllAsRead();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'info':
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 60000) return "Just now";
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-gray-500 hover:text-gray-900 transition-colors p-1 flex items-center justify-center"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-[#b05e1c] border border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden flex flex-col max-h-[85vh]">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-[#053d26] hover:underline font-medium flex items-center gap-1"
              >
                <Check className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1 p-2">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                No notifications right now.
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={`flex gap-3 p-3 rounded-lg transition-colors ${notif.isRead ? 'bg-white opacity-70' : 'bg-[#053d26]/5'} hover:bg-gray-50`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${notif.isRead ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-gray-500 whitespace-nowrap shrink-0 pt-0.5">
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                      {notif.link && (
                        <Link 
                          href={notif.link}
                          onClick={() => setIsOpen(false)}
                          className="text-xs text-[#053d26] font-medium hover:underline inline-block mt-2"
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                    {!notif.isRead && (
                      <button 
                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                        className="shrink-0 text-gray-400 hover:text-gray-600 p-1"
                        title="Mark as read"
                      >
                        <div className="h-2 w-2 rounded-full bg-[#b05e1c]"></div>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-gray-100 bg-gray-50 text-center shrink-0">
            <Link 
              href="/dashboard/settings?section=notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs text-gray-500 hover:text-gray-900 font-medium"
            >
              Notification Preferences
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
