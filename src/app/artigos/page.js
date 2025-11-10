"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/header";
import api from "@/utils/axios";
import Link from "next/link";
import { BookOpen, Search, CalendarDays, AlertTriangle } from "lucide-react";

function formatBR(dateStr) {
  if (!dateStr) return "-";
  try { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(dateStr)); } catch { return dateStr; }
}

export default function ArtigosPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [artigos, setArtigos] = useState([]);

  const [q, setQ] = useState("");
  const [onlyPublished, setOnlyPublished] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true); setError("");
        const res = await api.get('/artigos');
        const data = Array.isArray(res?.data?.data) ? res.data.data : [];
        if (active) setArtigos(data);
      } catch (e) {
        if (active) setError('Não foi possível carregar os artigos.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    let items = [...artigos];
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      items = items.filter(a => (a.titulo || '').toLowerCase().includes(needle) || (a.conteudo || '').toLowerCase().includes(needle));
    }
    if (onlyPublished) items = items.filter(a => a.publicado !== false);
    return items;
  }, [artigos, q, onlyPublished]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="container mx-auto max-w-6xl w-full px-4 md:px-6 pt-24 pb-12 flex-1">
        <div className="mb-6">
          <h1 className="text-[color:#2d5016] text-2xl md:text-3xl font-semibold">Conteúdos educativos</h1>
          <p className="text-zinc-600 mt-1 text-sm">Aprenda sobre reciclagem, descarte responsável e sustentabilidade</p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl p-4 border-2 shadow-xl border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        {/* Filtros */}
        <section className="bg-white rounded-2xl shadow-xl border border-zinc-100 p-4 md:p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#2d5016] mb-1">Buscar</label>
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
                <Search size={16} className="text-zinc-500" />
                <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Título ou conteúdo" className="flex-1 outline-none text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input id="onlyPublished" type="checkbox" checked={onlyPublished} onChange={(e)=>setOnlyPublished(e.target.checked)} />
              <label htmlFor="onlyPublished" className="text-sm text-zinc-700">Somente publicados</label>
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
          <div className="bg-white rounded-2xl p-8 text-center text-zinc-600 shadow">Nenhum artigo encontrado.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(a => (
              <article key={a.id} className="bg-white rounded-2xl shadow border-2 overflow-hidden transition hover:-translate-y-1 hover:shadow-2xl">
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-[#2d5016] text-sm font-semibold"><BookOpen size={16}/> Artigo</span>
                    <span className="text-xs text-zinc-600 inline-flex items-center gap-1"><CalendarDays size={14}/> {formatBR(a.data_publicacao)}</span>
                  </div>
                  <h3 className="text-[#2d5016] font-semibold leading-snug line-clamp-2">{a.titulo}</h3>
                  <p className="text-sm text-zinc-600 line-clamp-3">{a.conteudo}</p>
                  <div className="pt-2">
                    <Link href={`/artigos/${a.id}`} className="text-sm font-bold text-[#48742c] hover:underline">Ler mais</Link>
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
