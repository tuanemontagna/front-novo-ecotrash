"use client";

import { useEffect, useState } from "react";
import Header from "@/components/header";
import api from "@/utils/axios";
import Link from "next/link";
import { BookOpen, CalendarDays, ArrowLeft, AlertTriangle } from "lucide-react";

function formatBR(dateStr) {
  if (!dateStr) return "-";
  try { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(dateStr)); } catch { return dateStr; }
}

export default function ArtigoDetalhePage({ params }) {
  const { id } = params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [artigo, setArtigo] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true); setError("");
        const res = await api.get(`/artigos/${id}`);
        const data = res?.data?.data || null;
        if (active) setArtigo(data);
      } catch (e) {
        if (active) setError('Não foi possível carregar o artigo.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [id]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="container mx-auto max-w-3xl w-full px-4 md:px-6 pt-24 pb-12 flex-1">
        <div className="mb-4">
          <Link href="/artigos" className="inline-flex items-center gap-2 text-[#48742c] text-sm font-bold hover:underline">
            <ArrowLeft size={16}/> Voltar para artigos
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl p-4 border-2 shadow-xl border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            <div className="h-8 w-2/3 bg-white rounded-lg shadow animate-pulse" />
            <div className="h-4 w-1/3 bg-white rounded-lg shadow animate-pulse" />
            <div className="h-64 bg-white rounded-2xl shadow animate-pulse" />
          </div>
        ) : !artigo ? (
          <div className="bg-white rounded-2xl p-8 text-center text-zinc-600 shadow">Artigo não encontrado.</div>
        ) : (
          <article className="bg-white">
            <div className="mb-4">
              <h1 className="text-[color:#2d5016] text-2xl md:text-3xl font-semibold">{artigo.titulo}</h1>
              <div className="text-xs text-zinc-600 inline-flex items-center gap-1 mt-1">
                <BookOpen size={14}/> Conteúdo educativo • <CalendarDays size={14}/> {formatBR(artigo.data_publicacao)}
              </div>
            </div>
            <div className="prose prose-zinc max-w-none text-zinc-800 whitespace-pre-line">
              {artigo.conteudo}
            </div>
          </article>
        )}
      </main>
    </div>
  );
}
