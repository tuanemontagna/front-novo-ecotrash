"use client";

import { useEffect, useState } from "react";
import Header from "@/components/header";
import api from "@/utils/axios";
import Link from "next/link";
import { Truck, Calendar, Clock, MapPin, Users, CheckCircle, XCircle, Hourglass } from "lucide-react";

function formatBR(dateStr) {
  if (!dateStr) return "-";
  try {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export default function EmpresaColetasPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [userId, setUserId] = useState(null);
  const [empresaId, setEmpresaId] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
  const [tab, setTab] = useState('agendadas');
  const [submittingId, setSubmittingId] = useState(null);

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
        // resolve user
        try {
          const me = await api.get('/usuarios/me');
          if (me?.data?.data?.id && active) setUserId(me.data.data.id);
        } catch {
          const id = decodeJwtId();
          if (id && active) setUserId(id);
        }

        // fetch empresas and find one for this user
        if (active) {
          const empresasRes = await api.get('/empresas');
          const empresas = Array.isArray(empresasRes?.data?.data) ? empresasRes.data.data : [];
          const found = empresas.find(e => Number(e.usuarioId) === Number(userId));
          // if not found and userId not yet set, try again after userId resolves
          if (!found && !userId) {
            // nothing
          } else if (!found && userId) {
            // fallback: try to fetch empresa by filtering returned list where usuarioId matches
            const found2 = empresas.find(e => Number(e.usuarioId) === Number(userId));
            if (found2 && active) setEmpresaId(found2.id);
          } else if (found && active) {
            setEmpresaId(found.id);
          }
        }

        // if we already have empresaId (maybe from previous render), load agendamentos
        if (empresaId) {
          const res = await api.get(`/empresas/${empresaId}/agendamentos`);
          const data = Array.isArray(res?.data?.data) ? res.data.data : [];
          if (active) setAgendamentos(data);
        }
      } catch (e) {
        if (active) setError('Não foi possível carregar as coletas da empresa.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [userId, empresaId]);

  // helper to refresh list
  async function refreshList() {
    if (!empresaId) return;
    try {
      const res = await api.get(`/empresas/${empresaId}/agendamentos`);
      setAgendamentos(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch {}
  }

  function statusBadge(status) {
    const s = (status || '').toUpperCase();
    const color = s.includes('CANCEL') || s === 'CANCELADO' ? 'bg-red-200 text-red-800' :
      s === 'CONCLUIDO' || s === 'CONCLUÍDA' ? 'bg-emerald-200 text-emerald-800' :
      s === 'SOLICITADO' ? 'bg-yellow-100 text-yellow-800' :
      s === 'CONFIRMADA' || s === 'AGENDADA' ? 'bg-amber-100 text-amber-800' :
      'bg-zinc-100 text-zinc-800';
    return <span className={`text-xs px-3 py-1 rounded-full font-semibold ${color}`}>{status}</span>;
  }

  async function updateStatus(id, status, extra = {}) {
    try {
      setSubmittingId(id);
      setError(""); setSuccess("");
      await api.patch(`/agendamentos/${id}/status`, { status, ...extra });
      setSuccess('Status atualizado.');
      await refreshList();
    } catch (e) {
      setError(e?.response?.data?.message || 'Falha ao atualizar status.');
    } finally {
      setSubmittingId(null);
    }
  }

  // UI helpers: categorize
  const agendadas = agendamentos.filter(a => !['CONCLUIDO','CANCELADO','REJEITADA'].includes((a.status||'').toUpperCase()));
  const concluidas = agendamentos.filter(a => (a.status||'').toUpperCase() === 'CONCLUIDO');
  const pendentes = agendamentos.filter(a => (a.status||'').toUpperCase() === 'SOLICITADO');
  const processadas = agendamentos.filter(a => ['APROVADA','REJEITADA','CONFIRMADA'].includes((a.status||'').toUpperCase()));

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="container mx-auto max-w-6xl w-full px-4 md:px-6 pt-24 pb-16 flex-1">
        <div className="mb-6">
          <h1 className="text-[color:#2d5016] text-2xl md:text-3xl font-semibold">Gestão de Coletas (Empresa)</h1>
          <p className="text-zinc-600 mt-1 text-sm">Gerencie coletas recebidas, aprove solicitações e registre conclusão.</p>
        </div>

        {(error || success) && (
          <div className={`mb-6 rounded-2xl p-4 border-2 shadow-xl ${error ? 'border-red-200' : 'border-emerald-200'}`}>
            {error && <p className="text-red-700 text-sm">{error}</p>}
            {success && <p className="text-emerald-700 text-sm">{success}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 text-center shadow border border-amber-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mx-auto mb-3">
              <Hourglass className="text-amber-700" />
            </div>
            <div className="text-2xl font-bold text-amber-700">{agendadas.length}</div>
            <div className="text-sm text-zinc-600">Coletas Agendadas</div>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow border border-emerald-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mx-auto mb-3">
              <CheckCircle className="text-emerald-700" />
            </div>
            <div className="text-2xl font-bold text-emerald-700">{concluidas.length}</div>
            <div className="text-sm text-zinc-600">Coletas Concluídas</div>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow border border-yellow-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mx-auto mb-3">
              <Hourglass className="text-yellow-700" />
            </div>
            <div className="text-2xl font-bold text-yellow-700">{pendentes.length}</div>
            <div className="text-sm text-zinc-600">Solicitações Pendentes</div>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow border border-blue-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mx-auto mb-3">
              <Truck className="text-blue-700" />
            </div>
            <div className="text-2xl font-bold text-blue-700">{processadas.length}</div>
            <div className="text-sm text-zinc-600">Solicitações Processadas</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gray-50 px-4 py-3">
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => setTab('agendadas')} className={`px-3 py-2 rounded ${tab==='agendadas' ? 'bg-[#48742c] text-white' : 'text-[#48742c] bg-transparent'}`}>Agendadas ({agendadas.length})</button>
              <button onClick={() => setTab('concluidas')} className={`px-3 py-2 rounded ${tab==='concluidas' ? 'bg-[#48742c] text-white' : 'text-[#48742c] bg-transparent'}`}>Concluídas ({concluidas.length})</button>
              <button onClick={() => setTab('pendentes')} className={`px-3 py-2 rounded ${tab==='pendentes' ? 'bg-[#48742c] text-white' : 'text-[#48742c] bg-transparent'}`}>Solicitações ({pendentes.length})</button>
              <button onClick={() => setTab('processadas')} className={`px-3 py-2 rounded ${tab==='processadas' ? 'bg-[#48742c] text-white' : 'text-[#48742c] bg-transparent'}`}>Processadas ({processadas.length})</button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-40 bg-white rounded-2xl shadow animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {(tab === 'agendadas' ? agendadas : tab === 'concluidas' ? concluidas : tab === 'pendentes' ? pendentes : processadas)
                  .map(item => (
                    <article key={item.id} className="bg-white rounded-2xl shadow border border-zinc-100 p-5">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-zinc-600">#{item.id}</div>
                        <div>{statusBadge(item.status)}</div>
                      </div>

                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-zinc-700"><Users size={16} /> {item.solicitante?.nome || item.cliente || 'Solicitante'}</div>
                        {item.dataAgendada && (<div className="flex items-center gap-2 text-zinc-700"><Calendar size={16} /> {formatBR(item.dataAgendada)}</div>)}
                        <div className="flex items-center gap-2 text-zinc-700"><Clock size={16} /> Solicitado em {formatBR(item.data_solicitacao)}</div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-zinc-200 flex gap-3 justify-end">
                        {/* Actions vary by tab/status */}
                        { (tab === 'pendentes') && (
                          <>
                            <button disabled={submittingId===item.id} onClick={() => updateStatus(item.id, 'CONFIRMADA')} className="px-3 py-2 rounded bg-[#48742c] text-white">Aprovar</button>
                            <button disabled={submittingId===item.id} onClick={() => updateStatus(item.id, 'REJEITADA', { justificativaRejeicao: 'Rejeitado pela empresa' })} className="px-3 py-2 rounded border border-zinc-300 text-zinc-700">Rejeitar</button>
                          </>
                        )}
                        { (tab === 'agendadas') && (
                          <>
                            <button disabled={submittingId===item.id} onClick={() => updateStatus(item.id, 'CONCLUIDO')} className="px-3 py-2 rounded bg-emerald-600 text-white">Marcar como concluída</button>
                          </>
                        )}
                        { (tab === 'concluidas') && (
                          <Link href={`/empresa/coletas/${item.id}`} className="px-3 py-2 rounded border border-zinc-300 text-zinc-700">Ver detalhes</Link>
                        )}
                      </div>
                    </article>
                  ))}

                { ((tab === 'agendadas' && agendadas.length === 0) || (tab === 'concluidas' && concluidas.length===0) || (tab==='pendentes'&&pendentes.length===0) || (tab==='processadas'&&processadas.length===0)) && (
                  <div className="bg-white rounded-2xl p-8 text-center text-zinc-600 shadow">Nenhum item nesta aba.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
