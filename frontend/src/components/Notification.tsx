import React, { useState, useEffect } from 'react';

interface NotificationProps {
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
  onDismiss?: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ 
  type, 
  message, 
  duration = 4000, 
  onDismiss 
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  if (!visible) return null;

  const bgColor = {
    success: 'bg-green-50 dark:bg-green-900/30',
    error: 'bg-red-50 dark:bg-red-900/30',
    info: 'bg-blue-50 dark:bg-blue-900/30'
  }[type];

  const borderColor = {
    success: 'border-green-200 dark:border-green-800',
    error: 'border-red-200 dark:border-red-800',
    info: 'border-blue-200 dark:border-blue-800'
  }[type];

  const textColor = {
    success: 'text-green-800 dark:text-green-200',
    error: 'text-red-800 dark:text-red-200',
    info: 'text-blue-800 dark:text-blue-200'
  }[type];

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  }[type];

  return (
    <div className={`fixed top-4 right-4 z-[100] ${bgColor} border ${borderColor} ${textColor} px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md animate-in fade-in slide-in-from-top-2`}>
      <span className="text-xl font-bold">{icon}</span>
      <p className="flex-1">{message}</p>
      <button 
        onClick={() => setVisible(false)}
        className="ml-2 text-xl font-bold opacity-50 hover:opacity-100 transition"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
};

export interface UseNotificationReturn {
  notification: NotificationProps | null;
  showNotification: (type: 'success' | 'error' | 'info', message: string, duration?: number) => void;
  dismissNotification: () => void;
}

export const useNotification = (): UseNotificationReturn => {
  const [notification, setNotification] = useState<NotificationProps | null>(null);

  const showNotification = (type: 'success' | 'error' | 'info', message: string, duration = 4000) => {
    setNotification({ type, message, duration });
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  return {
    notification,
    showNotification,
    dismissNotification
  };
};
