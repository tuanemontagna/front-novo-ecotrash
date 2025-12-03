"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api, { fetchMe } from "@/utils/axios";
import { MapPin, Award, Leaf, ArrowRight, History, Plus, Calendar, Recycle, BookOpen, Sparkles } from "lucide-react";

export default function UsuarioHomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ points: 0, coletas: 0, campanhas: 0 });
  const [recentColetas, setRecentColetas] = useState([]);
  const [greeting, setGreeting] = useState("Olá");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Bom dia");
    else if (hour < 18) setGreeting("Boa tarde");
    else setGreeting("Boa noite");

    async function loadData() {
      try {
        // Tenta usar fetchMe (/auth/me) primeiro, fallback para /usuarios/me se necessário
        let userData;
        try {
            userData = await fetchMe();
        } catch (e) {
            const meRes = await api.get('/usuarios/me');
            userData = meRes.data.data;
        }
        
        setUser(userData);

        // Garante que temos os dados mais recentes do usuário
        try {
            const fullUserRes = await api.get(`/usuarios/${userData.id}`);
            if (fullUserRes.data?.data) {
                userData = fullUserRes.data.data;
                setUser(userData);
            }
        } catch (e) {
            console.error("Erro ao atualizar dados do usuário", e);
        }

        // Busca saldo de pontos atualizado
        try {
            const saldoRes = await api.get(`/usuarios/${userData.id}/saldo`);
            if (saldoRes.data && typeof saldoRes.data.saldo === 'number') {
                setStats(prev => ({ ...prev, points: saldoRes.data.saldo }));
            } else {
                 setStats(prev => ({ ...prev, points: userData.pontos || 0 }));
            }
        } catch (e) {
             console.error("Erro ao carregar saldo", e);
             setStats(prev => ({ ...prev, points: userData.pontos || 0 }));
        }

        try {
            const coletasRes = await api.get(`/usuarios/${userData.id}/agendamentos`);
            const coletas = Array.isArray(coletasRes.data.data) ? coletasRes.data.data : [];
            setRecentColetas(coletas.slice(0, 5));
            setStats(prev => ({ ...prev, coletas: coletas.length }));
        } catch {}

        try {
            const campRes = await api.get(`/usuarios/${userData.id}/campanhas-apoiadas`);
            const camps = Array.isArray(campRes.data.data) ? campRes.data.data : [];
            setStats(prev => ({ ...prev, campanhas: camps.length }));
        } catch {}
        
        // setStats(prev => ({ ...prev, points: userData.pontos || 0 })); // Já setado pelo saldo

      } catch (e) {
        console.error("Erro ao carregar dashboard", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-zinc-400 font-medium tracking-tight">Carregando seu espaço...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 relative overflow-hidden">
      {/* Background Blobs for "Organic" feel - kept for ambiance but UI will be sharp */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

      <main className="w-full px-6 md:px-12 py-10 relative z-10">
        
        {/* 1. Hero Section - Sharp Modern Card */}
        <div className="bg-[#1a3b10] p-8 md:p-10 shadow-2xl shadow-emerald-900/20 mb-10 relative overflow-hidden group border-l-4 border-emerald-500">
            {/* Abstract Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
            <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#2d5016] to-transparent opacity-50" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                        {greeting}, {user?.nome?.split(' ')[0]}
                    </h1>
                    <p className="text-emerald-100/80 text-lg max-w-md leading-relaxed">
                        Você já contribuiu para um planeta mais limpo hoje. Vamos continuar?
                    </p>
                    
                    <div className="mt-8 flex items-center gap-4">
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 px-5 py-3 flex flex-col">
                            <span className="text-xs text-emerald-200 uppercase tracking-wider font-semibold">Seus Pontos</span>
                            <span className="text-2xl font-bold text-white flex items-center gap-2">
                                <Award size={20} className="text-yellow-400" />
                                {stats.points}
                            </span>
                        </div>
                    </div>
                </div>

                <Link 
                    href="/usuario/coletas/" 
                    className="group/btn relative overflow-hidden bg-white text-[#1a3b10] px-8 py-4 font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        <Plus size={20} strokeWidth={3} />
                        Nova Coleta
                    </span>
                    <div className="absolute inset-0 bg-emerald-50 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left duration-300" />
                </Link>
            </div>
        </div>

        {/* 2. Main Actions - Sharp Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            <ActionCard 
                href="/usuario/pontos-coleta"
                icon={MapPin}
                title="Pontos de Coleta"
                desc="Encontre locais"
                gradient="from-blue-500 to-blue-600"
                shadow="shadow-blue-500/20"
            />
            <ActionCard 
                href="/usuario/campanhas"
                icon={Leaf}
                title="Campanhas"
                desc="Participe agora"
                gradient="from-emerald-500 to-emerald-600"
                shadow="shadow-emerald-500/20"
            />
            <ActionCard 
                href="/usuario/recompensas"
                icon={Award}
                title="Recompensas"
                desc="Troque pontos"
                gradient="from-purple-500 to-purple-600"
                shadow="shadow-purple-500/20"
            />
            <ActionCard 
                href="/artigos"
                icon={BookOpen}
                title="Conteúdos"
                desc="Aprenda mais"
                gradient="from-amber-500 to-amber-600"
                shadow="shadow-amber-500/20"
            />
        </div>

        {/* 3. Recent Activity - Sharp List */}
        <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xl font-bold text-zinc-800 tracking-tight flex items-center gap-2">
                Atividades Recentes
            </h2>
            <Link href="/usuario/coletas" className="text-sm font-semibold text-[#2d5016] hover:text-[#1a3b10] transition flex items-center gap-1">
                Ver histórico <ArrowRight size={16} />
            </Link>
        </div>

        <div className="space-y-4">
            {recentColetas.length === 0 ? (
                <div className="bg-white p-12 text-center border border-zinc-100 shadow-sm">
                    <div className="inline-flex h-16 w-16 bg-zinc-50 items-center justify-center text-zinc-300 mb-4">
                        <Calendar size={28} />
                    </div>
                    <p className="text-zinc-500 font-medium">Nenhuma atividade recente.</p>
                    <p className="text-zinc-400 text-sm mt-1">Suas coletas aparecerão aqui.</p>
                </div>
            ) : (
                recentColetas.map((coleta) => (
                    <div key={coleta.id} className="group bg-white p-5 border border-zinc-100/50 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between border-l-4 border-l-transparent hover:border-l-[#2d5016]">
                        <div className="flex items-center gap-5">
                            <div className={`h-12 w-12 flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${
                                coleta.status === 'CONCLUIDA' ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-500'
                            }`}>
                                <Recycle size={22} />
                            </div>
                            <div>
                                <p className="font-bold text-zinc-800 text-lg">Coleta #{coleta.id}</p>
                                <p className="text-sm text-zinc-500 font-medium">
                                    {new Date(coleta.dataAgendada || coleta.createdAt).toLocaleDateString('pt-BR', {
                                        weekday: 'long', day: 'numeric', month: 'long'
                                    })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <StatusBadge status={coleta.status} />
                            <div className="h-8 w-8 bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:bg-[#2d5016] group-hover:text-white transition-colors duration-300">
                                <ArrowRight size={14} />
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>

      </main>
    </div>
  );
}

function ActionCard({ href, icon: Icon, title, desc, gradient, shadow }) {
    return (
        <Link href={href} className="group relative bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-zinc-100/50 overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-5 transition-opacity group-hover:opacity-10`} />
            
            <div className={`h-14 w-14 bg-gradient-to-br ${gradient} ${shadow} flex items-center justify-center text-white mb-4 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={26} />
            </div>
            
            <h3 className="font-bold text-lg text-zinc-800 mb-1 tracking-tight">{title}</h3>
            <p className="text-sm text-zinc-500 font-medium">{desc}</p>
        </Link>
    );
}

function StatusBadge({ status }) {
    const styles = {
        'CONCLUIDA': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'CANCELADA': 'bg-red-50 text-red-600 border-red-100',
        'PENDENTE': 'bg-amber-50 text-amber-700 border-amber-100',
        'AGENDADA': 'bg-blue-50 text-blue-700 border-blue-100'
    };
    
    const defaultStyle = 'bg-zinc-100 text-zinc-600 border-zinc-200';
    
    return (
        <span className={`px-4 py-1.5 text-xs font-bold border ${styles[status] || defaultStyle}`}>
            {status || 'PENDENTE'}
        </span>
    );
}
