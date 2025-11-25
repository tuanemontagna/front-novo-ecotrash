"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Home, MapPin, House, Sparkles, User2, Menu, ClipboardList, X } from "lucide-react";

const links = [
  { href: "/empresa/home", label: "Início", Icon: Home },
  { href: "/empresa/perfil", label: "Perfil", Icon: User2 },
  { href: "/empresa/coletas", label: "Coletas", Icon: ClipboardList },
  { href: "/empresa/pontos-coleta", label: "Pontos de Coleta", Icon: MapPin },
  { href: "/empresa/campanhas", label: "Campanhas", Icon: Sparkles },
];

export default function EmpresaSidebar({ open = true }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHome = useMemo(() => pathname === "/empresa/home" || pathname === "/empresa", [pathname]);
  if (isHome) return null;

  function NavList({ onNavigate }) {
    return (
      <nav className="p-3">
        {links.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${active ? 'bg-emerald-50 text-[#2d5016] font-semibold' : 'text-zinc-700 hover:bg-zinc-50'}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <>
      {/* Desktop sidebar (persistent) */}
      <aside className={`hidden md:flex md:flex-col fixed top-0 left-0 w-64 h-screen bg-white border-r border-zinc-200 shadow-sm z-50 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-zinc-100">
            <span className="font-bold text-[#2d5016] text-lg">EcoTrash</span>
        </div>
        <NavList />
      </aside>

      {/* Mobile toggle button */}
      <button
        aria-label="Abrir menu"
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed z-40 left-4 top-4 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] text-white text-sm shadow"
      >
        <Menu size={16}/> Menu
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 left-0 h-screen w-72 bg-white border-r border-zinc-200 shadow-xl z-[60]">
            <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-100">
              <span className="font-bold text-[#2d5016] text-lg">EcoTrash</span>
              <button onClick={() => setMobileOpen(false)} className="text-zinc-500"><X size={20}/></button>
            </div>
            <NavList onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
