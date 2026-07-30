import React, { createContext, useContext, useState, useEffect } from 'react';
import { SystemNotification } from '../types';
import { mockStorage } from '../services/mockDataService';
import { useAuth } from './AuthContext';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface NotificationContextType {
  notifications: SystemNotification[];
  unreadCount: number;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  markAsRead: (id: string) => void;
  reloadNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const reloadNotifications = () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const data = mockStorage.getNotifications(user.id);
    setNotifications(data);
  };

  useEffect(() => {
    reloadNotifications();
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, message, type };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const markAsRead = (id: string) => {
    mockStorage.markNotificationRead(id);
    reloadNotifications();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      toasts,
      showToast,
      removeToast,
      markAsRead,
      reloadNotifications
    }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-sm font-medium border animate-fade-in transition-all ${
              t.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' :
              t.type === 'error' ? 'bg-rose-600 text-white border-rose-500' :
              t.type === 'warning' ? 'bg-amber-600 text-white border-amber-500' :
              'bg-blue-600 text-white border-blue-500'
            }`}
          >
            <span>{t.message}</span>
            <button 
              onClick={() => removeToast(t.id)} 
              className="ml-auto opacity-75 hover:opacity-100 font-bold"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};
