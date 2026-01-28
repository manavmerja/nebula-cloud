"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

// --- TYPES ---
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
  warning: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// --- HOOK ---
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// --- PROVIDER COMPONENT ---
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Helper to add toast
  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const value = {
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
    info: (msg: string) => addToast(msg, 'info'),
    warning: (msg: string) => addToast(msg, 'warning'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* --- TOAST CONTAINER (Fixed Overlay) --- */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 min-w-[300px] max-w-md p-4 rounded-xl shadow-2xl backdrop-blur-md animate-in slide-in-from-right-full fade-in duration-300 border border-white/10"
            style={{
              background:
                toast.type === 'success' ? 'rgba(6, 78, 59, 0.9)' :
                toast.type === 'error' ? 'rgba(127, 29, 29, 0.9)' :
                'rgba(23, 23, 23, 0.95)',
              borderColor:
                toast.type === 'success' ? 'rgba(52, 211, 153, 0.2)' :
                toast.type === 'error' ? 'rgba(248, 113, 113, 0.2)' :
                'rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Icon */}
            <div className="mt-0.5">
              {toast.type === 'success' && <CheckCircle size={18} className="text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle size={18} className="text-red-400" />}
              {toast.type === 'info' && <Info size={18} className="text-blue-400" />}
              {toast.type === 'warning' && <AlertTriangle size={18} className="text-yellow-400" />}
            </div>

            {/* Message */}
            <p className="text-sm font-medium text-white flex-1 leading-snug">
              {toast.message}
            </p>

            {/* Close Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}