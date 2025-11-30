"use client";

import { useState } from "react";
import AdminSidebar from "./_components/sidebar";
import Header from "@/components/header";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header 
        showSidebarToggle={true} 
        sidebarOpen={sidebarOpen} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        className={`transition-all duration-300 right-0 ${sidebarOpen ? 'left-64' : 'left-0'}`}
        maxWidthClass={sidebarOpen ? "max-w-full" : "max-w-6xl"}
      />
      
      <AdminSidebar open={sidebarOpen} />

      <main 
        className={`
          pt-24 px-4 pb-8 mx-auto transition-all duration-300
          ${sidebarOpen ? "ml-64 max-w-[calc(100vw-16rem)]" : "max-w-6xl"}
        `}
      >
        {children}
      </main>
    </div>
  );
}
