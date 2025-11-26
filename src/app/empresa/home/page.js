"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/axios";
import { MapPin, Truck, Leaf, ArrowRight, Building2, AlertCircle, BarChart3, BookOpen } from "lucide-react";

export default function EmpresaHomePage() {
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pontos: 0, coletas: 0, campanhas: 0 });

  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await api.get('/usuarios/me');
        const userId = meRes.data.data.id;

        const empRes = await api.get('/empresas');
        const empresas = Array.isArray(empRes.data.data) ? empRes.data.data : [];
        const myEmpresa = empresas.find(e => Number(e.usuarioId) === Number(userId));

        if (myEmpresa) {
            setEmpresa(myEmpresa);
            
            try {
                const pontosRes = await api.get(`/empresas/${myEmpresa.id}/pontos-coleta`);
                const pontos = Array.isArray(pontosRes.data.data) ? pontosRes.data.data : [];
                setStats(prev => ({ ...prev, pontos: pontos.length }));
            } catch {}

            try {
                const campRes = await api.get(`/empresas/${myEmpresa.id}`);
                const camps = campRes.data.data.campanhas || [];
                setStats(prev => ({ ...prev, campanhas: camps.length }));
            } catch {}
        }

      } catch (e) {
        console.error("Erro ao carregar dashboard empresa", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-zinc-500">Carregando...</div>;

  return (
    <div className="min-h-screen bg-zinc-50/30 pb-20">
      <main className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
        
        {/* 1. Header / Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
                <h1 className="text-3xl font-bold text-zinc-800 mb-1">
                    {empresa ? empresa.nomeFantasia : 'Painel Empresarial'}
                </h1>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-sm text-zinc-500 font-medium">Sistema Operacional</span>
                </div>
            </div>
            
            {!empresa && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
                    <AlertCircle size={18} />
                    <span>Complete seu cadastro empresarial para acessar todas as funções.</span>
                </div>
            )}
        </div>

        {/* 2. Management Grid (Big Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <ManagementCard 
                href="/empresa/pontos-coleta"
                icon={MapPin}
                title="Gerenciar Pontos"
                desc="Adicione ou edite seus pontos de coleta"
                stat={stats.pontos}
                statLabel="Pontos Ativos"
                colorClass="bg-blue-50 text-blue-600"
            />
            <ManagementCard 
                href="/empresa/coletas"
                icon={Truck}
                title="Gerenciar Coletas"
                desc="Acompanhe solicitações e agendamentos"
                stat={stats.coletas}
                statLabel="Coletas Totais"
                colorClass="bg-indigo-50 text-indigo-600"
            />
        </div>

        {/* 3. Secondary Actions & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Campaign Card */}
            <Link href="/empresa/campanhas" className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition group">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Leaf size={24} />
                    </div>
                    <ArrowRight size={20} className="text-zinc-300 group-hover:text-emerald-600 transition" />
                </div>
                <h3 className="font-bold text-lg text-zinc-800 mb-1">Campanhas</h3>
                <p className="text-sm text-zinc-500 mb-4">Participe de ações sustentáveis</p>
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 bg-zinc-50 px-3 py-1.5 rounded-lg w-fit">
                    <span>{stats.campanhas}</span>
                    <span className="text-zinc-400">Ativas</span>
                </div>
            </Link>

            {/* Articles Card */}
            <Link href="/artigos" className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition group">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <BookOpen size={24} />
                    </div>
                    <ArrowRight size={20} className="text-zinc-300 group-hover:text-amber-600 transition" />
                </div>
                <h3 className="font-bold text-lg text-zinc-800 mb-1">Conteúdo Educativo</h3>
                <p className="text-sm text-zinc-500 mb-4">Guias de sustentabilidade</p>
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 bg-zinc-50 px-3 py-1.5 rounded-lg w-fit">
                    <span className="text-zinc-400">Acessar</span>
                </div>
            </Link>

            {/* Analytics Placeholder */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-zinc-50/50 pattern-grid-lg opacity-50" />
                <div className="relative z-10">
                    <div className="h-12 w-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-3">
                        <BarChart3 size={24} />
                    </div>
                    <h3 className="font-bold text-zinc-800">Relatórios</h3>
                    <p className="text-sm text-zinc-500 mt-1 max-w-xs mx-auto">
                        Em breve
                    </p>
                </div>
            </div>
        </div>

      </main>
    </div>
  );
}

function ManagementCard({ href, icon: Icon, title, desc, stat, statLabel, colorClass }) {
    return (
        <Link href={href} className="group bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition flex flex-col h-full">
            <div className="flex items-start justify-between mb-6">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${colorClass}`}>
                    <Icon size={28} />
                </div>
                <div className="text-right">
                    <span className="block text-3xl font-bold text-zinc-800">{stat}</span>
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{statLabel}</span>
                </div>
            </div>
            <div className="mt-auto">
                <h3 className="text-xl font-bold text-zinc-800 mb-1 group-hover:text-zinc-600 transition">{title}</h3>
                <p className="text-zinc-500">{desc}</p>
            </div>
        </Link>
    );
}
