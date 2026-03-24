import React from 'react';
import type { Notification, NotificationType } from '../hooks/useNotifications';

interface NotificationComponentProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const TYPE_CONFIG: Record<NotificationType, { classes: string; icon: string }> = {
  info:    { icon: 'ℹ',  classes: 'bg-sky-50 dark:bg-sky-950/70 border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-200' },
  success: { icon: '💚', classes: 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200' },
  warning: { icon: '⚠',  classes: 'bg-amber-50 dark:bg-amber-950/70 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200' },
  error:   { icon: '✕',  classes: 'bg-red-50 dark:bg-red-950/70 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200' },
};

/**
 * NotificationComponent — Romantic toast notifications
 * Requirements: 3.3, 4.4, 6.4, 7.4, 7.5
 */
const NotificationComponent: React.FC<NotificationComponentProps> = ({
  notifications,
  onDismiss,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notificaciones"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {notifications.map((notification) => {
        const config = TYPE_CONFIG[notification.type];
        return (
          <div
            key={notification.id}
            role="alert"
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg pointer-events-auto animate-slide-down backdrop-blur-sm font-sans text-sm font-medium ${config.classes}`}
          >
            <span className="flex-shrink-0 text-base leading-none mt-0.5">{config.icon}</span>
            <p className="flex-1">{notification.message}</p>
            <button
              onClick={() => onDismiss(notification.id)}
              aria-label="Cerrar notificación"
              className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity text-xs leading-none mt-0.5"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationComponent;
