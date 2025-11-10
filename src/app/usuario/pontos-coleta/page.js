"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/header";
import api from "@/utils/axios";
import { MapPin, Building2, Search, Clock, AlertTriangle, Navigation } from "lucide-react";

function formatEndereco(e) {
  if (!e) return "";
  const parts = [e.logradouro, e.numero, e.bairro, e.cidade, e.estado, e.cep].filter(Boolean);
  return parts.join(", ");
}

function mapLink(e) {
  const q = encodeURIComponent(formatEndereco(e));
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export default function PontosColetaUsuarioPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pontos, setPontos] = useState([]); // [{id, nomePonto, ativo, horarioFuncionamento, endereco, empresa}]

  const [q, setQ] = useState("");
  const [cidade, setCidade] = useState("");
  const [somenteAtivos, setSomenteAtivos] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true); setError("");
        // load empresas
        const empRes = await api.get('/empresas');
        const empresas = Array.isArray(empRes?.data?.data) ? empRes.data.data : [];
        // load pontos por empresa
        const all = [];
        await Promise.all(empresas.map(async (e) => {
          try {
            const res = await api.get(`/empresas/${e.id}/pontos-coleta`);
            const list = Array.isArray(res?.data?.data) ? res.data.data : [];
            list.forEach(p => all.push({ ...p, empresa: e }));
          } catch {}
        }));
        if (active) setPontos(all);
      } catch (e) {
        if (active) setError('Não foi possível carregar os pontos de coleta.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const cidades = useMemo(() => {
    const set = new Set();
    pontos.forEach(p => p?.endereco?.cidade && set.add(p.endereco.cidade));
    return Array.from(set).sort();
  }, [pontos]);

  const filtered = useMemo(() => {
    let items = [...pontos];
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      items = items.filter(p =>
        (p.nomePonto || '').toLowerCase().includes(needle) ||
        (p.empresa?.nomeFantasia || p.empresa?.razaoSocial || '').toLowerCase().includes(needle) ||
        (formatEndereco(p.endereco) || '').toLowerCase().includes(needle)
      );
    }
    if (cidade) items = items.filter(p => (p.endereco?.cidade || '').toLowerCase() === cidade.toLowerCase());
    if (somenteAtivos) items = items.filter(p => p.ativo !== false);
    return items;
  }, [pontos, q, cidade, somenteAtivos]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="container mx-auto max-w-6xl w-full px-4 md:px-6 pt-24 pb-12 flex-1">
        <div className="mb-6">
          <h1 className="text-[color:#2d5016] text-2xl md:text-3xl font-semibold">Pontos de coleta</h1>
          <p className="text-zinc-600 mt-1 text-sm">Encontre locais próximos para descartar seus resíduos</p>
        </div>

        {error && (
          <div className={`mb-6 rounded-2xl p-4 border-2 shadow-xl border-red-200`}>
            <div className="flex items-center gap-3 text-red-700 text-sm"><AlertTriangle size={18} />{error}</div>
          </div>
        )}

        {/* Filtros */}
        <section className="bg-white rounded-2xl shadow-xl border border-zinc-100 p-4 md:p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#2d5016] mb-1">Buscar</label>
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
                <Search size={16} className="text-zinc-500" />
                <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Nome, empresa ou endereço" className="flex-1 outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2d5016] mb-1">Cidade</label>
              <select value={cidade} onChange={(e)=>setCidade(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Todas</option>
                {cidades.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input id="somenteAtivos" type="checkbox" checked={somenteAtivos} onChange={(e)=>setSomenteAtivos(e.target.checked)} />
              <label htmlFor="somenteAtivos" className="text-sm text-zinc-700">Somente ativos</label>
            </div>
          </div>
        </section>

        {/* Lista */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-48 shadow animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-zinc-600 shadow">Nenhum ponto de coleta encontrado.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => (
              <article key={p.id} className="bg-white rounded-2xl shadow border-2 overflow-hidden transition hover:-translate-y-1 hover:shadow-2xl">
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.ativo !== false ? 'bg-emerald-500 text-white' : 'bg-zinc-300 text-zinc-700'}`}>{p.ativo !== false ? 'Ativo' : 'Inativo'}</span>
                    <span className="inline-flex items-center gap-1 text-[#2d5016] text-xs font-semibold"><Building2 size={14}/> {p.empresa?.nomeFantasia || p.empresa?.razaoSocial || 'Empresa'}</span>
                  </div>
                  <h3 className="text-[#2d5016] font-semibold leading-snug line-clamp-2">{p.nomePonto}</h3>
                  <div className="text-sm text-zinc-700 flex items-start gap-2"><MapPin size={16} className="mt-0.5"/>{formatEndereco(p.endereco)}</div>
                  {p.horarioFuncionamento && (
                    <div className="text-sm text-zinc-700 flex items-center gap-2"><Clock size={16}/> {p.horarioFuncionamento}</div>
                  )}
                  <div className="pt-2 flex gap-2">
                    <a href={mapLink(p.endereco)} target="_blank" className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold border border-zinc-300 text-zinc-700 hover:bg-zinc-50"><Navigation size={16}/> Ver no mapa</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
