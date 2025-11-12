"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axios";
import Link from "next/link";

const cards = [
  { key: 'usuarios', title: 'Usuários', path: '/admin/usuarios' },
  { key: 'empresas', title: 'Empresas', path: '/admin/empresas' },
  { key: 'campanhas', title: 'Campanhas', path: '/admin/campanhas' },
  { key: 'vouchers', title: 'Vouchers', path: '/admin/vouchers' },
  { key: 'artigos', title: 'Artigos', path: '/admin/artigos' },
  { key: 'tipos', title: 'Tipos de Resíduo', path: '/admin/tipos-residuo' },
  { key: 'pontos', title: 'Pontos de Coleta', path: '/admin/pontos-coleta' },
  { key: 'agendamentos', title: 'Agendamentos', path: '/admin/agendamentos' },
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

        const empresasList = (e?.data?.data||[]);
        let pontosTotal = 0;
        let agendamentosTotal = 0;
        try {
          if (empresasList.length > 0) {
            const [pontosArrs, agendsArrs] = await Promise.all([
              Promise.all(empresasList.map(emp =>
                api.get(`/empresas/${emp.id}/pontos-coleta`).then(r => (r?.data?.data||[])).catch(()=>[])
              )),
              Promise.all(empresasList.map(emp =>
                api.get(`/empresas/${emp.id}/agendamentos`).then(r => (r?.data?.data||[])).catch(()=>[])
              )),
            ]);
            pontosTotal = pontosArrs.reduce((sum, arr) => sum + (Array.isArray(arr)? arr.length : 0), 0);
            agendamentosTotal = agendsArrs.reduce((sum, arr) => sum + (Array.isArray(arr)? arr.length : 0), 0);
          }
        } catch {}

        setCounts({
          usuarios: (u?.data?.data||[]).length,
          empresas: (e?.data?.data||[]).length,
          campanhas: (c?.data?.data||[]).length,
          vouchers: (v?.data?.data||[]).length,
          artigos: (a?.data?.data||[]).length,
          tipos: (t?.data?.data||[]).length,
          pontos: pontosTotal,
          agendamentos: agendamentosTotal,
        });
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return ()=>{ok=false};
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-[#2d5016] tracking-tight">Painel do administrador</h1>
        <p className="text-zinc-600 mt-1 text-sm">Gerencie recursos do EcoTrash</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map(c => (
          <Link
            key={c.key}
            href={c.path}
            className="group bg-white rounded-2xl shadow-xl border border-zinc-100 p-6 transition transform hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98]"
          >
            <div className="flex flex-col h-full">
              <div className="text-sm text-zinc-500">{c.title}</div>
              <div className="mt-1 text-3xl font-semibold text-[#2d5016]">
                {loading ? '...' : (counts[c.key] === undefined ? '—' : counts[c.key])}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
