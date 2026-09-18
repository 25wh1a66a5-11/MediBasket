import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type ToastType = 'success' | 'error' | 'info' | 'savings';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: ToastType, title: string, message?: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: ToastMessage = { id, type, title, message };
    setToasts(prev => [...prev.slice(-3), newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map(toast => {
            const icons = {
              success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
              error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
              info: <Info className="w-5 h-5 text-teal-600 shrink-0" />,
              savings: <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />,
            };

            const bgBorders = {
              success: 'border-emerald-200 bg-white/95 text-slate-800 shadow-emerald-500/10',
              error: 'border-rose-200 bg-white/95 text-slate-800 shadow-rose-500/10',
              info: 'border-teal-200 bg-white/95 text-slate-800 shadow-teal-500/10',
              savings: 'border-amber-300 bg-amber-50/95 text-amber-950 shadow-amber-500/15',
            };

            return (
              <motion.div
                key={toast.id}
                id={`toast-${toast.id}`}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-sm ${bgBorders[toast.type]}`}
              >
                {icons[toast.type]}
                <div className="flex-1 text-sm">
                  <div className="font-semibold">{toast.title}</div>
                  {toast.message && <div className="text-xs text-slate-500 mt-0.5">{toast.message}</div>}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
                  aria-label="Dismiss toast"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}
