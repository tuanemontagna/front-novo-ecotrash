"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/header";
import api from "@/utils/axios";
import { CalendarDays, Gift, Search, CheckCircle2, AlertTriangle } from "lucide-react";

function formatBR(dateStr) {
  if (!dateStr) return "-";
  try {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(dateStr));
  } catch { return dateStr; }
}

export default function CampanhasUsuarioPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [userId, setUserId] = useState(null);
  const [isAuthed, setIsAuthed] = useState(false);

  const [campanhas, setCampanhas] = useState([]);
  const [apoios, setApoios] = useState({}); // campanhaId: true

  const [q, setQ] = useState("");
  const [onlyAtivas, setOnlyAtivas] = useState(true);
  const [onlyVigentes, setOnlyVigentes] = useState(false);
  const [minPontos, setMinPontos] = useState(0);

  function decodeJwtId() {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
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
        setLoading(true); setError("");
        // Auth
        try {
          const me = await api.get('/usuarios/me');
          if (me?.data?.data?.id && active) {
            setUserId(me.data.data.id);
            setIsAuthed(true);
          }
        } catch {
          const id = decodeJwtId();
          if (id && active) { setUserId(id); setIsAuthed(true); }
          else if (active) { setIsAuthed(false); }
        }
        // Campanhas
        const res = await api.get('/campanhas');
        const data = Array.isArray(res?.data?.data) ? res.data.data : [];
        if (active) setCampanhas(data);
      } catch (e) {
        if (active) setError('Não foi possível carregar campanhas.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  // Carrega campanhas já apoiadas pelo usuário para refletir estado persistente
  useEffect(() => {
    let active = true;
    async function loadApoios() {
      if (!userId) return;
      try {
        const res = await api.get(`/usuarios/${userId}/campanhas-apoiadas`);
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];
        if (active) {
          const map = {};
          for (const c of list) { if (c?.id) map[c.id] = true; }
          setApoios(map);
        }
      } catch {}
    }
    loadApoios();
    return () => { active = false; };
  }, [userId]);

  const filtered = useMemo(() => {
    let items = [...campanhas];
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      items = items.filter(c => (c.titulo || '').toLowerCase().includes(needle) || (c.descricao || '').toLowerCase().includes(needle));
    }
    if (onlyAtivas) items = items.filter(c => c.ativa !== false);
    if (minPontos > 0) items = items.filter(c => Number(c.pontosPorAdesao || 0) >= minPontos);
    if (onlyVigentes) {
      const now = new Date();
      items = items.filter(c => {
        const ini = c.dataInicio ? new Date(c.dataInicio) : null;
        const fim = c.dataFim ? new Date(c.dataFim) : null;
        const afterStart = !ini || ini <= now;
        const beforeEnd = !fim || fim >= now;
        return afterStart && beforeEnd;
      });
    }
    return items;
  }, [campanhas, q, onlyAtivas, onlyVigentes, minPontos]);

  async function apoiar(camp) {
    try {
      setError(""); setSuccess("");
      if (!isAuthed || !userId) {
        setError('Faça login para apoiar uma campanha.');
        return;
      }
      await api.post(`/usuarios/${userId}/apoiar-campanha`, { campanhaId: camp.id });
      setApoios(prev => ({ ...prev, [camp.id]: true }));
      const pontos = Number(camp.pontosPorAdesao || 0);
      setSuccess(pontos > 0 ? `Você apoiou a campanha e ganhou ${pontos} pontos!` : 'Você apoiou a campanha!');
    } catch (e) {
      const msg = e?.response?.data?.message || 'Falha ao apoiar a campanha.';
      setError(msg);
    }
  }

  async function deixarApoiar(camp) {
    try {
      setError(""); setSuccess("");
      if (!isAuthed || !userId) {
        setError('Faça login para gerenciar apoio.');
        return;
      }
      await api.post(`/usuarios/${userId}/deixar-campanha`, { campanhaId: camp.id });
      setApoios(prev => ({ ...prev, [camp.id]: false }));
      setSuccess('Você deixou de apoiar esta campanha.');
    } catch (e) {
      const msg = e?.response?.data?.message || 'Falha ao deixar de apoiar a campanha.';
      setError(msg);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="container mx-auto max-w-6xl w-full px-4 md:px-6 pt-24 pb-12 flex-1">
        <div className="mb-6">
          <h1 className="text-[color:#2d5016] text-2xl md:text-3xl font-semibold">Campanhas</h1>
          <p className="text-zinc-600 mt-1 text-sm">Encontre campanhas e apoie iniciativas sustentáveis</p>
        </div>

        {(error || success) && (
          <div className={`mb-6 rounded-2xl p-4 border-2 shadow-xl ${error ? 'border-red-200' : 'border-emerald-200'}`}>
            {error && (
              <div className="flex items-center gap-3 text-red-700 text-sm"><AlertTriangle size={18} />{error}</div>
            )}
            {success && (
              <div className="flex items-center gap-3 text-emerald-700 text-sm"><CheckCircle2 size={18} />{success}</div>
            )}
          </div>
        )}

        {/* Filtros */}
        <section className="bg-white rounded-2xl shadow-xl border border-zinc-100 p-4 md:p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#2d5016] mb-1">Buscar</label>
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
                <Search size={16} className="text-zinc-500" />
                <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Título ou descrição" className="flex-1 outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2d5016] mb-1">Pontos mínimos</label>
              <input type="number" min={0} value={minPontos} onChange={(e)=>setMinPontos(Number(e.target.value||0))} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <input id="onlyAtivas" type="checkbox" checked={onlyAtivas} onChange={(e)=>setOnlyAtivas(e.target.checked)} />
              <label htmlFor="onlyAtivas" className="text-sm text-zinc-700">Somente ativas</label>
            </div>
            <div className="flex items-center gap-2">
              <input id="onlyVigentes" type="checkbox" checked={onlyVigentes} onChange={(e)=>setOnlyVigentes(e.target.checked)} />
              <label htmlFor="onlyVigentes" className="text-sm text-zinc-700">Somente vigentes</label>
            </div>
          </div>
        </section>

        {/* Lista de campanhas */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-56 shadow animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-zinc-600 shadow">Nenhuma campanha encontrada.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((c) => {
                const ativa = c.ativa !== false;
                const apoiada = !!apoios[c.id];
                const pontos = Number(c.pontosPorAdesao || 0);
                return (
                  <article key={c.id} className={`bg-white rounded-2xl shadow border-2 overflow-hidden transition ${ativa ? 'hover:-translate-y-1 hover:shadow-2xl' : 'opacity-85'}`}>
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ativa ? 'bg-emerald-500 text-white' : 'bg-zinc-300 text-zinc-700'}`}>{ativa ? 'Ativa' : 'Inativa'}</span>
                        {pontos > 0 && (
                          <span className="inline-flex items-center gap-1 text-[#48742c] text-xs font-semibold"><Gift size={14}/> +{pontos} pts</span>
                        )}
                      </div>
                      <h3 className="text-[#2d5016] font-semibold leading-snug line-clamp-2">{c.titulo}</h3>
                      {c.descricao && (
                        <p className="text-sm text-zinc-600 line-clamp-3">{c.descricao}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-zinc-600">
                        <span>Início: {formatBR(c.dataInicio)}</span>
                        <span>Fim: {formatBR(c.dataFim)}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={!isAuthed || !ativa || apoiada}
                          onClick={() => apoiar(c)}
                          className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${(!isAuthed || !ativa || apoiada) ? 'bg-zinc-300 text-white cursor-not-allowed' : 'bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] text-white hover:scale-[1.01] active:scale-[0.99] shadow'}`}
                        >
                          {!isAuthed ? 'Entrar para apoiar' : apoiada ? 'Apoiando' : ativa ? 'Apoiar' : 'Indisponível'}
                        </button>
                        {apoiada && (
                          <button
                            type="button"
                            onClick={() => deixarApoiar(c)}
                            className="flex-1 rounded-lg py-2 text-sm font-bold border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                          >
                            Deixar de apoiar
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
