import { useState, useCallback } from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  addNotification: (message: string, type?: NotificationType) => void;
  removeNotification: (id: string) => void;
}

/**
 * useNotifications Hook
 *
 * Manages a queue of in-app toast notifications.
 * Notifications auto-dismiss after 4 seconds.
 *
 * Requirements: 3.3, 4.4, 6.4, 7.4, 7.5
 */
export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(
    (message: string, type: NotificationType = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const notification: Notification = { id, message, type };

      setNotifications((prev) => [...prev, notification]);

      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 4000);
    },
    []
  );

  return { notifications, addNotification, removeNotification };
}
