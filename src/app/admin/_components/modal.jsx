"use client";

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-emerald-600 to-lime-600 text-white flex items-center justify-between">
          <h2 className="font-semibold text-sm md:text-base">{title}</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white text-lg leading-none">✕</button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
