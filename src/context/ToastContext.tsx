'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

// --- TYPES ---
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// --- TOAST ITEM COMPONENT (The Visual Card) ---
const ToastItem = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto dismiss after 4 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  // Styles based on type
  const styles = {
    success: 'border-green-500/50 bg-green-950/90 text-green-200 shadow-[0_0_15px_rgba(34,197,94,0.2)]',
    error: 'border-red-500/50 bg-red-950/90 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.2)]',
    warning: 'border-orange-500/50 bg-orange-950/90 text-orange-200 shadow-[0_0_15px_rgba(249,115,22,0.2)]',
    info: 'border-blue-500/50 bg-blue-950/90 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.2)]',
  };

  const icons = {
    success: <CheckCircle size={18} className="text-green-400" />,
    error: <AlertCircle size={18} className="text-red-400" />,
    warning: <AlertTriangle size={18} className="text-orange-400" />,
    info: <Info size={18} className="text-blue-400" />,
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border backdrop-blur-md mb-3 transition-all animate-in slide-in-from-right-full duration-300 w-80 ${styles[toast.type]}`}>
      <div className="mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 text-sm font-medium">{toast.message}</div>
      <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
        <X size={16} />
      </button>
    </div>
  );
};

// --- PROVIDER COMPONENT ---
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  // Helper functions for easier usage
  const success = useCallback((msg: string) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg: string) => addToast(msg, 'error'), [addToast]);
  const warning = useCallback((msg: string) => addToast(msg, 'warning'), [addToast]);
  const info = useCallback((msg: string) => addToast(msg, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}

      {/* Toast Container (Fixed Position) */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end pointer-events-none">
        {/* Enable pointer events only for the toasts themselves */}
        <div className="pointer-events-auto">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

// --- CUSTOM HOOK ---
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}