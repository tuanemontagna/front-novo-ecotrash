"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/axios";
import { MapPin, Truck, Leaf, ArrowRight, Building2, AlertCircle, BarChart3, BookOpen, Activity } from "lucide-react";

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

  if (loading) return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-zinc-400 font-medium">Carregando painel...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#48742c_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <main className="w-full px-6 md:px-12 py-10 relative z-10">
        
        {/* 1. Header / Status - Clean & Professional */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
                <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium uppercase tracking-wider mb-2">
                    <Building2 size={16} />
                    <span>Portal Corporativo</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight">
                    {empresa ? empresa.nomeFantasia : 'Sua Empresa'}
                </h1>
            </div>
            

        </div>

        {!empresa && (
            <div className="bg-amber-50 border border-amber-100 text-amber-800 px-6 py-4 flex items-center gap-4 text-sm mb-8 shadow-sm">
                <AlertCircle size={20} className="shrink-0" />
                <span className="font-medium">Complete seu cadastro empresarial para acessar todas as funções de gestão.</span>
            </div>
        )}

        {/* 2. Management Grid - Sharp Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <ManagementCard 
                href="/empresa/pontos-coleta"
                icon={MapPin}
                title="Gerenciar Pontos"
                desc="Controle seus pontos de coleta ativos"
                stat={stats.pontos}
                statLabel="Pontos Ativos"
                gradient="from-blue-500 to-indigo-600"
            />
            <ManagementCard 
                href="/empresa/coletas"
                icon={Truck}
                title="Gerenciar Coletas"
                desc="Acompanhe o fluxo de retiradas"
                stat={stats.coletas}
                statLabel="Coletas Totais"
                gradient="from-emerald-500 to-teal-600"
            />
        </div>

        {/* 3. Secondary Actions & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campaign Card */}
            <Link href="/empresa/campanhas" className="group bg-white p-8 border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                
                <div className="relative z-10">
                    <div className="h-12 w-12 bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
                        <Leaf size={24} />
                    </div>
                    <h3 className="font-bold text-xl text-zinc-900 mb-2">Campanhas</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">Engaje sua marca em ações de impacto real.</p>
                </div>
                
                <div className="mt-8 flex items-center justify-between">
                    <span className="text-2xl font-bold text-zinc-900">{stats.campanhas} <span className="text-sm font-normal text-zinc-400">ativas</span></span>
                    <div className="h-10 w-10 border border-zinc-100 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <ArrowRight size={18} />
                    </div>
                </div>
            </Link>

            {/* Articles Card */}
            <Link href="/artigos" className="group bg-white p-8 border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                
                <div className="relative z-10">
                    <div className="h-12 w-12 bg-amber-100 text-amber-700 flex items-center justify-center mb-6">
                        <BookOpen size={24} />
                    </div>
                    <h3 className="font-bold text-xl text-zinc-900 mb-2">Educação</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">Guias de compliance e sustentabilidade.</p>
                </div>
                
                <div className="mt-8 flex items-center justify-end">
                    <div className="h-10 w-10 border border-zinc-100 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <ArrowRight size={18} />
                    </div>
                </div>
            </Link>
        </div>

      </main>
    </div>
  );
}

function ManagementCard({ href, icon: Icon, title, desc, stat, statLabel, gradient }) {
    return (
        <Link href={href} className="group relative bg-white p-8 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden border border-zinc-100">
            {/* Gradient Background on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-start justify-between mb-8">
                    <div className={`h-16 w-16 bg-zinc-50 group-hover:bg-white/20 group-hover:backdrop-blur-sm flex items-center justify-center text-zinc-700 group-hover:text-white transition-all duration-500 shadow-sm`}>
                        <Icon size={32} />
                    </div>
                    <div className="text-right">
                        <span className="block text-4xl font-bold text-zinc-900 group-hover:text-white transition-colors duration-500">{stat}</span>
                        <span className="text-xs font-bold text-zinc-400 group-hover:text-white/80 uppercase tracking-wider transition-colors duration-500">{statLabel}</span>
                    </div>
                </div>
                
                <div>
                    <h3 className="text-2xl font-bold text-zinc-900 group-hover:text-white mb-2 transition-colors duration-500">{title}</h3>
                    <p className="text-zinc-500 group-hover:text-white/90 font-medium transition-colors duration-500">{desc}</p>
                </div>
            </div>
        </Link>
    );
}


