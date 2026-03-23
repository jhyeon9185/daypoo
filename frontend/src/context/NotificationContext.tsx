import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { NotificationToast, ToastType } from '../components/NotificationToast';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  icon?: string;
}

interface NotificationContextType {
  showToast: (title: string, message: string, type?: ToastType, icon?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((title: string, message: string, type: ToastType = 'info', icon?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type, icon }]);
    
    // 5초 후에 자동 삭제
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 left-6 z-[3000] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <NotificationToast
              key={toast.id}
              {...toast}
              onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
