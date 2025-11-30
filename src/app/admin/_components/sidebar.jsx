"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Users2, Building2, Megaphone, TicketPercent, FileText, Recycle, MapPin, CalendarClock, Menu, X } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Usuários", icon: Users2 },
  { href: "/admin/empresas", label: "Empresas", icon: Building2 },
  { href: "/admin/campanhas", label: "Campanhas", icon: Megaphone },
  { href: "/admin/vouchers", label: "Vouchers", icon: TicketPercent },
  { href: "/admin/artigos", label: "Artigos", icon: FileText },
  { href: "/admin/tipos-residuo", label: "Tipos de Resíduo", icon: Recycle },
  { href: "/admin/pontos-coleta", label: "Pontos de Coleta", icon: MapPin },
  { href: "/admin/enderecos", label: "Endereços", icon: MapPin },
  { href: "/admin/agendamentos", label: "Agendamentos", icon: CalendarClock },
];

export default function AdminSidebar({ open = true }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function NavList({ onNavigate }) {
    return (
      <nav className="p-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href + "/"));
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
      <aside className={`hidden md:flex md:flex-col fixed top-0 left-0 w-64 h-screen bg-white border-r border-zinc-200 shadow-sm z-50 transition-transform duration-300 pt-16 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <NavList />
      </aside>

      {/* Mobile toggle button */}
      <button
        aria-label="Abrir menu"
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed z-40 left-4 top-20 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] text-white text-sm shadow"
      >
        <Menu size={16}/> Menu
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 left-0 h-screen w-72 bg-white border-r border-zinc-200 shadow-xl z-[60]">
            <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-100">
              <span className="font-bold text-[#2d5016] text-lg">EcoTrash Admin</span>
              <button onClick={() => setMobileOpen(false)} className="text-zinc-500"><X size={20}/></button>
            </div>
            <NavList onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
