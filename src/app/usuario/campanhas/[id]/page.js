"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/utils/axios";
import { CalendarDays, Gift, Users, Building2, MapPin, Clock, Recycle, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";

function formatBR(dateStr) {
  if (!dateStr) return "-";
  try {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(dateStr));
  } catch { return dateStr; }
}

export default function CampanhaDetalhesPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [campanha, setCampanha] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [isApoiando, setIsApoiando] = useState(false);

  function decodeJwtId() {
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('accessToken') || localStorage.getItem('token')) : null;
      if (!token) return null;
      const payload = token.split('.')[1];
      const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = JSON.parse(atob(b64));
      return json?.id ?? null;
    } catch { return null; }
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        
        // Auth check
        try {
          const me = await api.get('/usuarios/me');
          if (me?.data?.data?.id && active) {
            setUserId(me.data.data.id);
            setIsAuthed(true);
          }
        } catch {
          const uid = decodeJwtId();
          if (uid && active) { setUserId(uid); setIsAuthed(true); }
        }

        // Fetch Campaign
        const res = await api.get(`/campanhas/${id}`);
        if (active) {
            setCampanha(res.data.data);
        }

      } catch (e) {
        if (active) setError("Não foi possível carregar os detalhes da campanha.");
      } finally {
        if (active) setLoading(false);
      }
    }
    if (id) load();
    return () => { active = false; };
  }, [id]);

  // Check if user is supporting
  useEffect(() => {
    let active = true;
    async function checkApoio() {
      if (!userId || !id) return;
      try {
        const res = await api.get(`/usuarios/${userId}/campanhas-apoiadas`);
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];
        if (active) {
          const found = list.find(c => c.id === Number(id));
          setIsApoiando(!!found);
        }
      } catch {}
    }
    checkApoio();
    return () => { active = false; };
  }, [userId, id]);

  async function apoiar() {
    if (!isAuthed) {
        router.push('/login');
        return;
    }
    try {
        setError(""); setSuccess("");
        await api.post(`/usuarios/${userId}/apoiar-campanha`, { campanhaId: id });
        setIsApoiando(true);
        const pontos = Number(campanha?.pontosPorAdesao || 0);
        setSuccess(pontos > 0 ? `Você apoiou a campanha e ganhou ${pontos} pontos!` : 'Você apoiou a campanha!');
    } catch (e) {
        setError(e?.response?.data?.message || 'Erro ao apoiar campanha.');
    }
  }

  async function deixarApoiar() {
    if (!window.confirm("Tem certeza que deseja deixar de apoiar esta campanha?")) return;
    try {
        setError(""); setSuccess("");
        await api.delete(`/usuarios/${userId}/deixar-campanha`, { data: { campanhaId: id } });
        setIsApoiando(false);
        setSuccess('Você deixou de apoiar esta campanha.');
    } catch (e) {
        setError(e?.response?.data?.message || 'Erro ao deixar de apoiar.');
    }
  }

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center">Carregando...</div>;
  if (!campanha) return <div className="min-h-screen bg-white flex items-center justify-center">Campanha não encontrada.</div>;

  const ativa = campanha.ativa !== false;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      
      <main className="container mx-auto max-w-5xl w-full px-4 md:px-6 pt-6 pb-12 flex-1">
        
        <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-600 hover:text-[#2d5016] mb-6 transition">
            <ArrowLeft size={20} /> Voltar
        </button>

        {(error || success) && (
          <div className={`mb-6 rounded-2xl p-4 border-2 shadow-xl ${error ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
            {error && <div className="flex items-center gap-3 text-red-700 text-sm"><AlertTriangle size={18} />{error}</div>}
            {success && <div className="flex items-center gap-3 text-emerald-700 text-sm"><CheckCircle2 size={18} />{success}</div>}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl border border-zinc-100 overflow-hidden">
            {/* Header */}
            <div className="bg-zinc-50 p-6 md:p-10 border-b border-zinc-100">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${ativa ? 'bg-emerald-500 text-white' : 'bg-zinc-400 text-white'}`}>
                                {ativa ? 'ATIVA' : 'INATIVA'}
                            </span>
                            {Number(campanha.pontosPorAdesao) > 0 && (
                                <span className="flex items-center gap-1 text-[#48742c] text-sm font-bold bg-green-100 px-3 py-1 rounded-full">
                                    <Gift size={16} /> +{campanha.pontosPorAdesao} pts
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-[#2d5016] mb-4">{campanha.titulo}</h1>
                        <div className="flex flex-wrap gap-6 text-zinc-600 text-sm">
                            <div className="flex items-center gap-2">
                                <CalendarDays size={18} className="text-[#48742c]" />
                                <span>{formatBR(campanha.dataInicio)} até {formatBR(campanha.dataFim)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users size={18} className="text-blue-500" />
                                <span>{campanha.totalApoiadores || 0} Apoiadores</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Building2 size={18} className="text-amber-500" />
                                <span>{campanha.totalEmpresas || 0} Empresas</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 min-w-[200px]">
                        <button
                            onClick={isApoiando ? deixarApoiar : apoiar}
                            disabled={!ativa && !isApoiando}
                            className={`w-full py-3 px-6 rounded-xl font-bold shadow-lg transition transform hover:scale-[1.02] active:scale-[0.98] ${
                                isApoiando 
                                ? 'bg-white border-2 border-zinc-200 text-zinc-700 hover:bg-zinc-50' 
                                : ativa 
                                    ? 'bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] text-white' 
                                    : 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                            }`}
                        >
                            {isApoiando ? 'Deixar de Apoiar' : 'Apoiar Campanha'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-10 space-y-10">
                {/* Descrição */}
                <section>
                    <h2 className="text-xl font-bold text-zinc-800 mb-4">Sobre a Campanha</h2>
                    <p className="text-zinc-600 leading-relaxed whitespace-pre-line">{campanha.descricao}</p>
                </section>

                {/* Empresas Parceiras */}
                {campanha.empresasParceiras && campanha.empresasParceiras.length > 0 && (
                    <section>
                        <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
                            <Building2 size={24} className="text-amber-500" /> Empresas Participantes
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {campanha.empresasParceiras.map(emp => (
                                <div key={emp.id} className="p-4 rounded-xl border border-zinc-100 bg-zinc-50 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-white border flex items-center justify-center text-zinc-400 font-bold">
                                        {emp.nomeFantasia?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-zinc-800">{emp.nomeFantasia}</p>
                                        <p className="text-xs text-zinc-500">{emp.razaoSocial}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Pontos de Coleta */}
                {campanha.pontosDeColetaAssociados && campanha.pontosDeColetaAssociados.length > 0 && (
                    <section>
                        <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
                            <MapPin size={24} className="text-red-500" /> Pontos de Coleta & Resíduos Aceitos
                        </h2>
                        <div className="grid grid-cols-1 gap-6">
                            {campanha.pontosDeColetaAssociados.map(ponto => (
                                <div key={ponto.id} className="border border-zinc-200 rounded-2xl p-6 hover:border-[#48742c] transition bg-white shadow-sm">
                                    <h3 className="font-bold text-lg text-zinc-900 mb-2">{ponto.nomePonto}</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            {ponto.endereco && (
                                                <div className="flex items-start gap-2 text-zinc-600 text-sm">
                                                    <MapPin size={16} className="mt-0.5 shrink-0" />
                                                    <span>
                                                        {ponto.endereco.logradouro}, {ponto.endereco.numero}
                                                        {ponto.endereco.complemento && ` - ${ponto.endereco.complemento}`}<br/>
                                                        {ponto.endereco.bairro}, {ponto.endereco.cidade} - {ponto.endereco.estado}<br/>
                                                        CEP: {ponto.endereco.cep}
                                                    </span>
                                                </div>
                                            )}
                                            {ponto.horarioFuncionamento && (
                                                <div className="flex items-start gap-2 text-zinc-600 text-sm">
                                                    <Clock size={16} className="mt-0.5 shrink-0" />
                                                    <span className="whitespace-pre-line">{ponto.horarioFuncionamento}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-semibold text-zinc-700 mb-2 flex items-center gap-2">
                                                <Recycle size={16} className="text-green-600" /> Resíduos Aceitos
                                            </h4>
                                            {ponto.tiposResiduosAceitos && ponto.tiposResiduosAceitos.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {ponto.tiposResiduosAceitos.map(tipo => (
                                                        <span key={tipo.id} className="px-3 py-1 bg-green-50 text-green-800 text-xs font-medium rounded-full border border-green-100">
                                                            {tipo.nome}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-zinc-400 italic">Nenhum tipo de resíduo especificado.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}
