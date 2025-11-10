"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/header";
import api from "@/utils/axios";
import { Calendar, Clock, MapPin, Building2, Recycle, Info, Plus, X, Ban } from "lucide-react";

function formatBRDate(d) {
  if (!d) return "-";
  try {
    const date = new Date(d);
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date);
  } catch {
    return d;
  }
}

export default function ColetasUsuarioPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [userId, setUserId] = useState(null);
  const [isAuthed, setIsAuthed] = useState(false);

  const [agendamentos, setAgendamentos] = useState([]);
  const [enderecos, setEnderecos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [tipos, setTipos] = useState([]);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({
    empresaId: "",
    enderecoId: "",
    data: "",
    hora: "",
    observacoes: "",
    itens: {}, // { tipoResiduoId: quantidade }
  });
  const [submitting, setSubmitting] = useState(false);

  function decodeJwtId() {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return null;
      const payload = token.split('.')[1];
      const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = JSON.parse(atob(b64));
      return json?.id ?? null;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        // user
        try {
          const me = await api.get('/usuarios/me');
          const u = me?.data?.data;
          if (u && active) {
            setIsAuthed(true);
            setUserId(u.id);
          }
        } catch {
          const id = decodeJwtId();
          if (id && active) {
            setIsAuthed(true);
            setUserId(id);
          } else if (active) {
            setIsAuthed(false);
          }
        }

        // parallel data
        const [empRes, tiposRes] = await Promise.all([
          api.get('/empresas'),
          api.get('/tipos-residuo'),
        ]);
        if (active) {
          setEmpresas(Array.isArray(empRes?.data?.data) ? empRes.data.data : []);
          setTipos(Array.isArray(tiposRes?.data?.data) ? tiposRes.data.data : []);
        }
      } catch (e) {
        if (active) setError('Falha ao carregar dados iniciais.');
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    async function loadUserData() {
      if (!userId) return;
      try {
        setError("");
        const [ends, ags] = await Promise.all([
          api.get(`/usuarios/${userId}/enderecos`),
          api.get(`/usuarios/${userId}/agendamentos`),
        ]);
        if (active) {
          setEnderecos(Array.isArray(ends?.data?.data) ? ends.data.data : []);
          setAgendamentos(Array.isArray(ags?.data?.data) ? ags.data.data : []);
        }
      } catch (e) {
        if (active) setError('Não foi possível carregar seus endereços ou agendamentos.');
      }
    }
    loadUserData();
    return () => { active = false; };
  }, [userId]);

  function toggleForm() {
    setSuccess("");
    setError("");
    setMostrarForm((v) => !v);
  }

  function setFormField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleItem(tipoResiduoId) {
    setForm((prev) => {
      const itens = { ...prev.itens };
      if (itens[tipoResiduoId]) {
        delete itens[tipoResiduoId];
      } else {
        itens[tipoResiduoId] = 1;
      }
      return { ...prev, itens };
    });
  }

  function setItemQuantidade(tipoResiduoId, qtd) {
    const n = Math.max(1, Number(qtd || 1));
    setForm((prev) => ({ ...prev, itens: { ...prev.itens, [tipoResiduoId]: n } }));
  }

  async function cancelarAgendamento(id, statusAtual) {
    try {
      setError("");
      await api.patch(`/agendamentos/${id}/status`, { status: 'CANCELADO' });
      setAgendamentos((prev) => prev.map((a) => a.id === id ? { ...a, status: 'CANCELADO' } : a));
      setSuccess('Coleta cancelada.');
    } catch (e) {
      setError(e?.response?.data?.message || 'Falha ao cancelar coleta.');
    }
  }

  async function submitAgendamento() {
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (!isAuthed || !userId) {
        setError('Faça login para agendar uma coleta.');
        return;
      }
      const { empresaId, enderecoId, data, hora, observacoes, itens } = form;
      if (!empresaId || !enderecoId || !data || !hora || !Object.keys(itens).length) {
        setError('Preencha empresa, endereço, data, hora e selecione ao menos um material.');
        return;
      }
      const dataAgendada = new Date(`${data}T${hora}:00`);
      const itensArray = Object.entries(itens).map(([tipoResiduoId, quantidade]) => ({
        tipoResiduoId: Number(tipoResiduoId),
        quantidade: Number(quantidade || 1),
      }));

      const body = {
        usuarioId: userId,
        empresaId: Number(empresaId),
        enderecoColetaId: Number(enderecoId),
        dataAgendada,
        observacoesUsuario: observacoes || undefined,
        itens: itensArray,
      };

      const res = await api.post('/agendamentos', body);
      const novo = res?.data?.data;
      if (novo?.id) {
        setSuccess('Pedido de agendamento criado com sucesso!');
        setMostrarForm(false);
        // recarrega lista
        try {
          const ags = await api.get(`/usuarios/${userId}/agendamentos`);
          setAgendamentos(Array.isArray(ags?.data?.data) ? ags.data.data : []);
        } catch {}
        // limpa form
        setForm({ empresaId: "", enderecoId: "", data: "", hora: "", observacoes: "", itens: {} });
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Falha ao criar agendamento.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="container mx-auto max-w-6xl w-full px-4 md:px-6 pt-24 pb-12 flex-1">
        <div className="mb-6">
          <h1 className="text-[color:#2d5016] text-2xl md:text-3xl font-semibold">Coletas</h1>
          <p className="text-zinc-600 mt-1 text-sm">Gerencie suas coletas e agende novas</p>
        </div>

        {(error || success) && (
          <div className={`mb-6 rounded-2xl p-4 border-2 shadow-xl ${error ? 'border-red-200' : 'border-emerald-200'}`}>
            {error && <p className="text-red-700 text-sm">{error}</p>}
            {success && <p className="text-emerald-700 text-sm">{success}</p>}
          </div>
        )}

        {/* Ações topo */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <button
            type="button"
            onClick={toggleForm}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] text-white font-semibold shadow hover:scale-[1.01] active:scale-[0.99]"
          >
            {mostrarForm ? (<><X size={18}/> Fechar</>) : (<><Plus size={18}/> Agendar nova coleta</>)}
          </button>
          {!isAuthed && (
            <p className="text-sm text-zinc-600">Faça login para agendar e ver suas coletas.</p>
          )}
        </div>

        {/* Formulário */}
        {mostrarForm && (
          <section className="mb-10">
            <div className="bg-white rounded-2xl shadow-xl border border-zinc-100 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2d5016] mb-1">Empresa Responsável *</label>
                  <select
                    value={form.empresaId}
                    onChange={(e) => setFormField('empresaId', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Selecione</option>
                    {empresas.map((em) => (
                      <option key={em.id} value={em.id}>{em.nomeFantasia || `Empresa #${em.id}`}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2d5016] mb-1">Endereço para Coleta *</label>
                  <select
                    value={form.enderecoId}
                    onChange={(e) => setFormField('enderecoId', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Selecione</option>
                    {enderecos.map((en) => (
                      <option key={en.id} value={en.id}>{[en.logradouro, en.numero, en.bairro, en.cidade].filter(Boolean).join(', ')}</option>
                    ))}
                  </select>
                  {enderecos.length === 0 && (
                    <p className="text-xs text-zinc-500 mt-1">Você não possui endereços cadastrados. Adicione um em <Link className="underline" href="/usuario/perfil">Perfil</Link>.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2d5016] mb-1">Data *</label>
                  <input type="date" value={form.data} onChange={(e) => setFormField('data', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2d5016] mb-1">Hora *</label>
                  <input type="time" value={form.hora} onChange={(e) => setFormField('hora', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#2d5016] mb-2">Materiais *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {tipos.map((t) => {
                      const selected = form.itens[t.id] != null;
                      return (
                        <div key={t.id} className={`flex items-center justify-between border rounded-lg px-3 py-2 ${selected ? 'border-emerald-400 bg-emerald-50' : 'border-zinc-200'}`}>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={selected} onChange={() => toggleItem(t.id)} />
                            <span>{t.nome}</span>
                          </label>
                          {selected && (
                            <input type="number" min={1} value={form.itens[t.id]} onChange={(e) => setItemQuantidade(t.id, e.target.value)} className="w-16 border rounded px-2 py-1 text-sm" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#2d5016] mb-1">Observações</label>
                  <textarea value={form.observacoes} onChange={(e) => setFormField('observacoes', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px]" placeholder="Informações adicionais para facilitar a coleta" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={toggleForm} className="px-4 py-2 rounded border border-zinc-300 text-sm">Cancelar</button>
                <button type="button" disabled={submitting} onClick={submitAgendamento} className={`px-4 py-2 rounded text-sm font-semibold ${submitting ? 'bg-zinc-300 text-white' : 'bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] text-white'}`}>
                  {submitting ? 'Enviando...' : 'Agendar Coleta'}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Lista de Agendamentos */}
        <section>
          <h2 className="text-xl font-semibold text-[#2d5016] mb-4">Minhas Coletas</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-36 bg-white rounded-2xl shadow animate-pulse" />
              ))}
            </div>
          ) : agendamentos.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-zinc-600 shadow">
              Nenhuma coleta agendada ainda.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agendamentos.map((a) => (
                <article key={a.id} className="bg-white rounded-2xl shadow border border-zinc-100 p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-zinc-600">#{a.id}</div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${a.status === 'CONCLUIDO' ? 'bg-emerald-500 text-white' : a.status === 'CANCELADO' ? 'bg-zinc-300 text-zinc-700' : 'bg-amber-200 text-amber-800'}`}>
                      {a.status}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-zinc-700"><Building2 size={16} /> {a.empresaResponsavel?.nomeFantasia || `Empresa #${a.empresaId}`}</div>
                    {a.dataAgendada && (
                      <div className="flex items-center gap-2 text-zinc-700"><Calendar size={16} /> {formatBRDate(a.dataAgendada)}</div>
                    )}
                    <div className="flex items-center gap-2 text-zinc-700"><Clock size={16} /> Solicitado em {formatBRDate(a.data_solicitacao)}</div>
                  </div>
                  {a.status !== 'CONCLUIDO' && a.status !== 'CANCELADO' && (
                    <div className="pt-3 mt-3 border-t border-zinc-200 flex justify-end">
                      <button type="button" onClick={() => cancelarAgendamento(a.id, a.status)} className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded border border-zinc-300 text-zinc-700 hover:bg-zinc-50">
                        <Ban size={14}/> Cancelar
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
