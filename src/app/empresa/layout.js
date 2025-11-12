"use client";

import { usePathname } from "next/navigation";
import EmpresaSidebar from "./_components/sidebar";

export default function EmpresaSectionLayout({ children }) {
  const pathname = usePathname();
  const isHome = pathname === "/empresa/home" || pathname === "/empresa";
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50">
      <EmpresaSidebar />
      <main className={`${isHome ? "" : "md:ml-64"} px-4 py-8 max-w-7xl mx-auto`}>{children}</main>
    </div>
  );
}
