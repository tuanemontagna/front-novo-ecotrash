"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

const listeners = new Set();

export const toaster = {
  create: ({ title, description, type = "info", duration = 3000 }) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toast = { id, title, description, type, duration };
    listeners.forEach((listener) => listener(toast));
  },
  success: ({ title, description, duration }) => toaster.create({ title, description, type: 'success', duration }),
  error: ({ title, description, duration }) => toaster.create({ title, description, type: 'error', duration }),
  info: ({ title, description, duration }) => toaster.create({ title, description, type: 'info', duration }),
};

export function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const addToast = (toast) => {
      setToasts((prev) => [...prev, toast]);
      if (toast.duration) {
        setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration);
      }
    };

    listeners.add(addToast);
    return () => {
      listeners.delete(addToast);
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm p-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto
            flex items-start gap-3 p-4 rounded-lg shadow-lg border transition-all animate-in slide-in-from-right-full fade-in duration-300
            ${toast.type === 'success' ? 'bg-white border-emerald-200 text-emerald-900' : ''}
            ${toast.type === 'error' ? 'bg-white border-red-200 text-red-900' : ''}
            ${toast.type === 'info' ? 'bg-white border-blue-200 text-blue-900' : ''}
            ${!['success', 'error', 'info'].includes(toast.type) ? 'bg-white border-zinc-200 text-zinc-900' : ''}
          `}
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'success' && <CheckCircle size={18} className="text-emerald-600" />}
            {toast.type === 'error' && <AlertCircle size={18} className="text-red-600" />}
            {toast.type === 'info' && <Info size={18} className="text-blue-600" />}
          </div>
          <div className="flex-1 min-w-0">
            {toast.title && <h3 className="font-medium text-sm">{toast.title}</h3>}
            {toast.description && <p className="text-sm opacity-90 mt-1 break-words">{toast.description}</p>}
          </div>
          <button onClick={() => removeToast(toast.id)} className="shrink-0 text-zinc-400 hover:text-zinc-600">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
