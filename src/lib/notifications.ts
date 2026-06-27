export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type UserRole = 'Student' | 'Teacher' | 'Admin' | 'SuperAdmin' | 'Parent' | 'Faculty';

export interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  targetRole?: UserRole | UserRole[]; // If null, target all
  targetUserId?: string; // If null, target all users of the targetRole
  type: NotificationType;
  createdAt: string;
  isRead: boolean;
  link?: string;
  schoolId?: string;
}

const STORAGE_KEY = 'leoned_notifications';

const getSchoolId = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  try {
    const user = JSON.parse(localStorage.getItem('leoned_user') || '{}');
    return user.schoolId || user.school?.id || user.school?._id;
  } catch {
    return undefined;
  }
};

export const notificationsApi = {
  // Fetch notifications applicable to the current user
  getNotifications: (): NotificationPayload[] => {
    if (typeof window === 'undefined') return [];
    try {
      const all: NotificationPayload[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const user = JSON.parse(localStorage.getItem('leoned_user') || '{}');
      const schoolId = getSchoolId();
      
      const userId = user.id || user._id || user.studentId;
      const userRole = user.role;

      return all.filter(n => {
        // Filter by school
        if (n.schoolId && n.schoolId !== schoolId) return false;
        
        // Filter by target role
        if (n.targetRole) {
          if (Array.isArray(n.targetRole)) {
            if (!n.targetRole.includes(userRole as UserRole)) return false;
          } else {
            if (n.targetRole !== userRole) return false;
          }
        }
        
        // Filter by specific user
        if (n.targetUserId && n.targetUserId !== userId) return false;

        return true;
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
      return [];
    }
  },

  // Add a new notification
  addNotification: (payload: Omit<NotificationPayload, 'id' | 'createdAt' | 'isRead' | 'schoolId'>) => {
    if (typeof window === 'undefined') return;
    try {
      const all: NotificationPayload[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const schoolId = getSchoolId();
      
      const newNotification: NotificationPayload = {
        ...payload,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
        isRead: false,
        schoolId,
      };

      all.push(newNotification);
      
      // Keep only last 500 notifications to prevent storage bloat
      if (all.length > 500) all.shift();

      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      
      // Dispatch an event so Header.tsx can listen for changes in real-time
      window.dispatchEvent(new CustomEvent('leoned_notification_updated'));
    } catch (e) {
      console.error("Failed to add notification:", e);
    }
  },

  // Mark a specific notification as read
  markAsRead: (id: string) => {
    if (typeof window === 'undefined') return;
    try {
      const all: NotificationPayload[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const updated = all.map(n => n.id === id ? { ...n, isRead: true } : n);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('leoned_notification_updated'));
    } catch (e) {
      console.error("Failed to mark notification as read:", e);
    }
  },
  
  // Mark all notifications as read for current user
  markAllAsRead: () => {
    if (typeof window === 'undefined') return;
    try {
      const all: NotificationPayload[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const user = JSON.parse(localStorage.getItem('leoned_user') || '{}');
      const schoolId = getSchoolId();
      const userId = user.id || user._id || user.studentId;
      const userRole = user.role;

      const updated = all.map(n => {
        // Only mark read if it applies to this user
        let applies = true;
        if (n.schoolId && n.schoolId !== schoolId) applies = false;
        if (n.targetRole && (Array.isArray(n.targetRole) ? !n.targetRole.includes(userRole as UserRole) : n.targetRole !== userRole)) applies = false;
        if (n.targetUserId && n.targetUserId !== userId) applies = false;
        
        if (applies) {
          return { ...n, isRead: true };
        }
        return n;
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('leoned_notification_updated'));
    } catch (e) {
      console.error("Failed to mark all as read:", e);
    }
  }
};
