"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/axios";
import { MapPin, Award, Leaf, ArrowRight, History, Plus, Calendar, Recycle, BookOpen } from "lucide-react";

export default function UsuarioHomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ points: 0, coletas: 0, campanhas: 0 });
  const [recentColetas, setRecentColetas] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await api.get('/usuarios/me');
        const userData = meRes.data.data;
        setUser(userData);

        // Load recent coletas
        try {
            const coletasRes = await api.get(`/usuarios/${userData.id}/coletas`);
            const coletas = Array.isArray(coletasRes.data.data) ? coletasRes.data.data : [];
            setRecentColetas(coletas.slice(0, 5)); // Top 5
            setStats(prev => ({ ...prev, coletas: coletas.length }));
        } catch {}

        // Load campaigns
        try {
            const campRes = await api.get(`/usuarios/${userData.id}/campanhas-apoiadas`);
            const camps = Array.isArray(campRes.data.data) ? campRes.data.data : [];
            setStats(prev => ({ ...prev, campanhas: camps.length }));
        } catch {}
        
        setStats(prev => ({ ...prev, points: userData.pontos || 0 }));

      } catch (e) {
        console.error("Erro ao carregar dashboard", e);
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
        
        {/* 1. Hero / Welcome Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="relative z-10">
                <h1 className="text-3xl md:text-4xl font-bold text-zinc-800 mb-2">
                    Olá, {user?.nome?.split(' ')[0]}!
                </h1>
                <p className="text-zinc-500 mb-4">O que vamos reciclar hoje?</p>
                
                <div className="inline-flex items-center gap-3 bg-zinc-50 border border-zinc-100 rounded-full px-4 py-2">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold">
                        <Award size={18} />
                        <span>{stats.points}</span>
                    </div>
                    <span className="text-zinc-300">|</span>
                    <span className="text-zinc-500 text-sm">Seus pontos acumulados</span>
                </div>
            </div>

            <div className="relative z-10 w-full md:w-auto">
                <Link 
                    href="/usuario/coletas/nova" 
                    className="w-full md:w-auto bg-[#48742c] hover:bg-[#3a6122] text-white px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-emerald-900/10 transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                    <Plus size={20} />
                    Agendar Coleta
                </Link>
            </div>
            
            {/* Decorative background element */}
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-emerald-50/50 to-transparent pointer-events-none" />
        </div>

        {/* 2. Main Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <ActionCard 
                href="/usuario/pontos-coleta"
                icon={MapPin}
                title="Pontos de Coleta"
                desc="Encontre locais próximos"
                colorClass="bg-blue-50 text-blue-600 group-hover:bg-blue-100"
            />
            <ActionCard 
                href="/usuario/campanhas"
                icon={Leaf}
                title="Campanhas"
                desc="Participe de ações"
                colorClass="bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"
            />
            <ActionCard 
                href="/usuario/recompensas"
                icon={Award}
                title="Recompensas"
                desc="Troque seus pontos"
                colorClass="bg-purple-50 text-purple-600 group-hover:bg-purple-100"
            />
            <ActionCard 
                href="/artigos"
                icon={BookOpen}
                title="Dicas & Artigos"
                desc="Aprenda sobre sustentabilidade"
                colorClass="bg-amber-50 text-amber-600 group-hover:bg-amber-100"
            />
        </div>

        {/* 3. Recent Activity List */}
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-50 flex items-center justify-between">
                <h2 className="font-bold text-lg text-zinc-800 flex items-center gap-2">
                    <History size={20} className="text-zinc-400" />
                    Histórico Recente
                </h2>
                <Link href="/usuario/coletas" className="text-sm font-medium text-[#48742c] hover:underline flex items-center gap-1">
                    Ver tudo <ArrowRight size={14} />
                </Link>
            </div>
            
            <div className="divide-y divide-zinc-50">
                {recentColetas.length === 0 ? (
                    <div className="p-10 text-center">
                        <div className="inline-flex h-12 w-12 rounded-full bg-zinc-50 items-center justify-center text-zinc-300 mb-3">
                            <Calendar size={24} />
                        </div>
                        <p className="text-zinc-500">Nenhuma coleta realizada recentemente.</p>
                    </div>
                ) : (
                    recentColetas.map((coleta) => (
                        <div key={coleta.id} className="p-5 hover:bg-zinc-50/50 transition flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center transition ${
                                    coleta.status === 'CONCLUIDA' ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-500'
                                }`}>
                                    <Recycle size={18} />
                                </div>
                                <div>
                                    <p className="font-medium text-zinc-800">Coleta #{coleta.id}</p>
                                    <p className="text-xs text-zinc-500">
                                        {new Date(coleta.dataAgendada || coleta.createdAt).toLocaleDateString('pt-BR', {
                                            day: '2-digit', month: 'long', year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    coleta.status === 'CONCLUIDA' ? 'bg-emerald-100 text-emerald-700' : 
                                    coleta.status === 'CANCELADA' ? 'bg-red-100 text-red-700' : 
                                    'bg-amber-100 text-amber-700'
                                }`}>
                                    {coleta.status || 'PENDENTE'}
                                </span>
                                <ArrowRight size={16} className="text-zinc-300 group-hover:text-zinc-500 transition" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

      </main>
    </div>
  );
}

function ActionCard({ href, icon: Icon, title, desc, colorClass }) {
    return (
        <Link href={href} className="group bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-start h-full">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${colorClass}`}>
                <Icon size={24} />
            </div>
            <h3 className="font-bold text-lg text-zinc-800 mb-1 group-hover:text-[#48742c] transition-colors">{title}</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
        </Link>
    );
}
