"use client";

import AdminSidebar from "./_components/sidebar";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Header from "@/components/header";
// Acesso restrito temporariamente desativado
export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="min-h-screen flex bg-white">
      {/* Sidebar (desktop collapsible) */}
      <div className={`hidden md:block transition-all duration-300 ${open? 'w-64':'w-0'} overflow-hidden`}> 
        {open && <AdminSidebar />}
      </div>
      {/* Mobile sidebar overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-64 bg-white border-r border-zinc-200 shadow-xl">
            <AdminSidebar />
          </div>
          <div onClick={()=>setOpen(false)} className="flex-1 bg-black/40" />
        </div>
      )}
      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Shared Header Wrapper */}
        <div className="relative z-30">
          <Header
            maxWidthClass="max-w-7xl"
            showSidebarToggle
            sidebarOpen={open}
            onToggleSidebar={() => setOpen(o=>!o)}
          />
        </div>
        <main className="pt-20 p-4 md:p-6 max-w-7xl w-full mx-auto flex-1 min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}
