"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import EmpresaSidebar from "./_components/sidebar";
import Header from "@/components/header";

export default function EmpresaSectionLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isHome = pathname === "/empresa/home" || pathname === "/empresa";

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header 
        showSidebarToggle={!isHome} 
        sidebarOpen={sidebarOpen} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        className={`transition-all duration-300 right-0 ${!isHome && sidebarOpen ? 'left-64' : 'left-0'}`}
        maxWidthClass={!isHome && sidebarOpen ? "max-w-full" : "max-w-6xl"}
      />
      
      {!isHome && (
        <EmpresaSidebar open={sidebarOpen} />
      )}

      <main 
        className={`
          pt-24 px-4 pb-8 mx-auto transition-all duration-300
          ${isHome ? "max-w-6xl" : (sidebarOpen ? "ml-64 max-w-[calc(100vw-16rem)]" : "max-w-6xl")}
        `}
      >
        {children}
      </main>
    </div>
  );
}
