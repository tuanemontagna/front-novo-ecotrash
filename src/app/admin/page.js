"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axios";

const cards = [
  { key: 'usuarios', title: 'Usuários', path: '/admin/usuarios' },
  { key: 'empresas', title: 'Empresas', path: '/admin/empresas' },
  { key: 'campanhas', title: 'Campanhas', path: '/admin/campanhas' },
  { key: 'vouchers', title: 'Vouchers', path: '/admin/vouchers' },
  { key: 'artigos', title: 'Artigos', path: '/admin/artigos' },
  { key: 'tipos', title: 'Tipos de Resíduo', path: '/admin/tipos-residuo' },
];

export default function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    let ok = true;
    (async () => {
      setLoading(true);
      try {
        const [u,e,c,v,a,t] = await Promise.all([
          api.get('/usuarios').catch(()=>({data:{data:[]}})),
          api.get('/empresas').catch(()=>({data:{data:[]}})),
          api.get('/campanhas').catch(()=>({data:{data:[]}})),
          api.get('/vouchers').catch(()=>({data:{data:[]}})),
          api.get('/artigos').catch(()=>({data:{data:[]}})),
          api.get('/tipos-residuo').catch(()=>({data:{data:[]}})),
        ]);
        if (!ok) return;
        setCounts({
          usuarios: (u?.data?.data||[]).length,
          empresas: (e?.data?.data||[]).length,
          campanhas: (c?.data?.data||[]).length,
          vouchers: (v?.data?.data||[]).length,
          artigos: (a?.data?.data||[]).length,
          tipos: (t?.data?.data||[]).length,
        });
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return ()=>{ok=false};
  }, []);

  return (
    <div>
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-lime-600 text-white p-6 md:p-8 shadow mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold">Painel do administrador</h1>
        <p className="text-white/85 mt-1 text-sm">Gerencie recursos do EcoTrash</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c => (
          <a key={c.key} href={c.path} className="block bg-white rounded-2xl border border-zinc-200 shadow p-5 hover:shadow-md transition">
            <div className="text-zinc-500 text-xs">{c.title}</div>
            <div className="text-2xl font-semibold text-[#2d5016]">{loading ? '...' : (counts[c.key] ?? 0)}</div>
            <div className="text-emerald-700 text-sm mt-2 font-medium">Abrir</div>
          </a>
        ))}
      </div>
    </div>
  );
}
