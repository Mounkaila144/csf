'use client';

import { ToastContainer, useToast } from '@/components/admin/Toast';
import { createContext, useContext } from 'react';

// Contexte pour les toasts
const ToastContext = createContext<ReturnType<typeof useToast> | null>(null);

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminRootLayout({ children }: AdminLayoutProps) {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      <div className="min-h-screen bg-gray-100">
        {children}
        <ToastContainer messages={toast.messages} onClose={toast.removeToast} />
      </div>
    </ToastContext.Provider>
  );
}
