"use client";

import { usePathname } from "next/navigation";
import UsuarioSidebar from "./_components/sidebar";

export default function UsuarioSectionLayout({ children }) {
  const pathname = usePathname();
  const isHome = pathname === "/usuario/home" || pathname === "/usuario";
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50">
      <UsuarioSidebar />
      <main className={`${isHome ? "" : "md:ml-64"} px-4 py-8 max-w-7xl mx-auto`}>{children}</main>
    </div>
  );
}
