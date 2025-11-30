"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import UsuarioSidebar from "./_components/sidebar";
import Header from "@/components/header";

export default function UsuarioSectionLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isHome = pathname === "/usuario/home" || pathname === "/usuario";

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header 
        showSidebarToggle={!isHome} 
        sidebarOpen={sidebarOpen} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        className={`transition-all duration-300 right-0 ${!isHome && sidebarOpen ? 'left-64' : 'left-0'}`}
        maxWidthClass={isHome ? "max-w-full px-6 md:px-12" : (sidebarOpen ? "max-w-full" : "max-w-6xl")}
      />
      
      {!isHome && (
        <UsuarioSidebar open={sidebarOpen} />
      )}

      <main 
        className={`
          pt-24 pb-8 mx-auto transition-all duration-300
          ${isHome ? "w-full max-w-none px-0" : (sidebarOpen ? "ml-64 px-4 max-w-[calc(100vw-16rem)]" : "max-w-6xl px-4")}
        `}
      >
        {children}
      </main>
    </div>
  );
}
