"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users2, Building2, Megaphone, TicketPercent, FileText, Recycle, MapPin, CalendarClock } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Usuários", icon: Users2 },
  { href: "/admin/empresas", label: "Empresas", icon: Building2 },
  { href: "/admin/campanhas", label: "Campanhas", icon: Megaphone },
  { href: "/admin/vouchers", label: "Vouchers", icon: TicketPercent },
  { href: "/admin/artigos", label: "Artigos", icon: FileText },
  { href: "/admin/tipos-residuo", label: "Tipos de Resíduo", icon: Recycle },
  { href: "/admin/pontos-coleta", label: "Pontos de Coleta", icon: MapPin },
  { href: "/admin/agendamentos", label: "Agendamentos", icon: CalendarClock },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <div className="flex flex-col h-full bg-white">
      <nav className="p-4 space-y-1">
        {links.map((l) => {
          const active = pathname === l.href;
          const Icon = l.icon;
          return (
            <Link key={l.href} href={l.href} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'text-zinc-700 hover:bg-zinc-100'}`}>
              <Icon size={18} />
              {l.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
