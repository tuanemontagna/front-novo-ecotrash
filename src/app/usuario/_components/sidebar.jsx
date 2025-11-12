"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Home, MapPin, House, Gift, Sparkles, User2, Menu } from "lucide-react";

const links = [
  { href: "/usuario/home", label: "Início", Icon: Home },
  { href: "/usuario/pontos-coleta", label: "Pontos de Coleta", Icon: MapPin },
  { href: "/usuario/coletas", label: "Agendar Coleta", Icon: House },
  { href: "/usuario/campanhas", label: "Campanhas", Icon: Sparkles },
  { href: "/usuario/recompensas", label: "Recompensas", Icon: Gift },
  { href: "/usuario/perfil", label: "Perfil", Icon: User2 },
];

export default function UsuarioSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isHome = useMemo(() => pathname === "/usuario/home" || pathname === "/usuario", [pathname]);
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
      <aside className="hidden md:flex md:flex-col fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white border-r border-zinc-200 shadow-sm z-30">
        <div className="px-4 py-3 text-xs font-semibold text-[#2d5016]">Menu</div>
        <NavList />
      </aside>

      {/* Mobile toggle button */}
      <button
        aria-label="Abrir menu"
        onClick={() => setOpen(true)}
        className="md:hidden fixed z-40 left-4 top-20 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] text-white text-sm shadow"
      >
        <Menu size={16}/> Menu
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden">
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />
          <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-white border-r border-zinc-200 shadow-xl z-50">
            <div className="px-4 py-3 text-xs font-semibold text-[#2d5016]">Menu</div>
            <NavList onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
