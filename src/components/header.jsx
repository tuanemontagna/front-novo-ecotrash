"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import api from "@/utils/axios";

export default function Header() {
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
      <div className="mx-auto w-full max-w-6xl h-16 px-4 md:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 text-white">
          <div className="relative h-7 w-[120px]">
            <Image src="/images/logo.png" alt="Logo EcoTrash" fill className="object-contain invert-0 brightness-200" />
            <Image src="/images/ecotrash.png" alt="EcoTrash" fill className="object-contain invert-0 brightness-200" />
          </div>
          <span className="sr-only">EcoTrash</span>
        </Link>

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
