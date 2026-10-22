/**
 * Global Toast Notification System.
 *
 * Provides non-blocking, accessible visual feedback to the user on operation success,
 * failures, rate limit warnings, and info notices. Supports custom durations,
 * manual dismissal, and CSS slide-in animations.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';

/** Supported toast visual severity types */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/** Individual toast notification model */
export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

/** Toast context interface */
interface ToastContextValue {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * Toast Notification Provider wrapping the application root.
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  /**
   * Remove a toast by unique ID.
   */
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /**
   * Dispatch a new toast notification.
   *
   * @param type Severity level ('success', 'error', 'info', 'warning')
   * @param title Primary headline message
   * @param message Optional detailed subtitle or error stack trace
   * @param duration Auto-dismiss time in milliseconds (defaults to 4000ms, 0 to stay indefinitely)
   */
  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration: number = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, message, duration };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  // Convenience helper callbacks
  const success = useCallback((title: string, message?: string) => showToast('success', title, message, 4000), [showToast]);
  const error = useCallback((title: string, message?: string) => showToast('error', title, message, 6000), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast('info', title, message, 4000), [showToast]);
  const warning = useCallback((title: string, message?: string) => showToast('warning', title, message, 5000), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      {/* Toast viewport fixed to bottom-right of browser window */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-xl border text-sm transition-all duration-200 animate-slide-in ${
              toast.type === 'success'
                ? 'bg-[#161b22] border-emerald-500/50 text-emerald-300'
                : toast.type === 'error'
                ? 'bg-[#161b22] border-red-500/50 text-red-300'
                : toast.type === 'warning'
                ? 'bg-[#161b22] border-amber-500/50 text-amber-300'
                : 'bg-[#161b22] border-[#30363d] text-slate-200'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{toast.title}</div>
              {toast.message && <div className="text-xs text-slate-400 mt-1 break-words">{toast.message}</div>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-1"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

/**
 * Custom hook to trigger toast notifications from any component.
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
