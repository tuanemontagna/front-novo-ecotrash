"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Menu, X } from "lucide-react";
import api from "@/utils/axios";

export default function Header({ maxWidthClass = "max-w-6xl", showSidebarToggle = false, sidebarOpen = false, onToggleSidebar }) {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    let active = true;
    async function loadName() {
      try {
        const res = await api.get('/usuarios/me');
        const nome = res?.data?.data?.nome;
        if (active) setUserName(nome || 'Usuário');
      } catch {
        try {
          const stored = typeof window !== 'undefined' ? localStorage.getItem('userName') : null;
          if (active) setUserName((stored && stored.trim()) || 'Usuário');
        } catch {
          if (active) setUserName('Usuário');
        }
      }
    }
    loadName();
    return () => { active = false };
  }, []);

  const initials = useMemo(() => {
    if (!userName) return "U";
    const parts = userName.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "U";
  }, [userName]);

  return (
    <div className="fixed top-0 inset-x-0 z-50 shadow-lg bg-[linear-gradient(135deg,#48742c_0%,#3a5e23_100%)]">
      <div className={`mx-auto w-full ${maxWidthClass} h-16 px-4 md:px-6 flex items-center justify-between`}>
        <div className="flex items-center gap-3 text-white">
          {showSidebarToggle && (
            <button
              type="button"
              aria-label="Alternar menu"
              onClick={onToggleSidebar}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/15 hover:bg-white/25 transition-colors backdrop-blur-sm shadow"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
          <Link href="/" className="flex items-center gap-3">
          <div className="relative h-7 w-[140px]">
            <Image src="/images/ecotrash.png" alt="EcoTrash" fill className="object-contain invert-0 brightness-200" />
          </div>
          <span className="sr-only">EcoTrash</span>
          </Link>
        </div>

        <div className="flex items-center gap-3 text-white">
          <span className="hidden sm:block text-sm font-medium">Olá, {userName}</span>
          <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-semibold">
            {initials}
          </div>
        </div>
      </div>
    </div>
  );
}
