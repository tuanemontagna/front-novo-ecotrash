"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Header from "@/components/header";
import api from "@/utils/axios";

export default function DetalheAgendamento() {
  const router = useRouter();
  const pathname = usePathname();
  const id = pathname?.split("/").pop();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [agendamento, setAgendamento] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [showRejeitar, setShowRejeitar] = useState(false);
  const [justificativa, setJustificativa] = useState("");
  const [dataAgendada, setDataAgendada] = useState("");
  const [horaAgendada, setHoraAgendada] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/agendamentos/${id}`);
        const data = res?.data?.data ?? null;
        if (active) setAgendamento(data);
      } catch (e) {
        if (active) setError(e?.response?.data?.message || 'Falha ao carregar agendamento.');
      } finally {
        if (active) setLoading(false);
      }
    }
    if (id) load();
    return () => { active = false; };
  }, [id]);

  async function patchStatus(status, extra = {}) {
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      const body = { status, ...extra };
      await api.patch(`/agendamentos/${id}/status`, body);
      setSuccess('Status atualizado com sucesso.');
      // reload
      const res = await api.get(`/agendamentos/${id}`);
      setAgendamento(res?.data?.data ?? null);
    } catch (e) {
      setError(e?.response?.data?.message || 'Falha ao atualizar status.');
    } finally {
      setSubmitting(false);
    }
  }

  function onAprovar() {
    // Aprovar deve efetivar o agendamento (CONFIRMADA) e opcionalmente definir data/hora
    if (dataAgendada && horaAgendada) {
      const dt = new Date(`${dataAgendada}T${horaAgendada}:00`);
      patchStatus('CONFIRMADA', { dataAgendada: dt });
    } else {
      patchStatus('CONFIRMADA');
    }
  }

  function onRejeitar() {
    if (!justificativa) {
      setError('Informe a justificativa para rejeitar.');
      return;
    }
    patchStatus('REJEITADA', { justificativaRejeicao: justificativa });
  }

  function onConcluir() {
    // marcar como concluído (backend adiciona pontos automaticamente)
    patchStatus('CONCLUIDO');
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="container mx-auto max-w-4xl w-full px-4 md:px-6 pt-24 pb-16 flex-1">
        <div className="mb-6">
          <button onClick={() => router.back()} className="text-sm text-zinc-600 underline">&larr; Voltar</button>
          <h1 className="text-[color:#2d5016] text-2xl md:text-3xl font-semibold mt-4">Detalhe do Agendamento</h1>
          <p className="text-zinc-600 mt-1 text-sm">Visualize e gerencie este pedido de coleta</p>
        </div>

        {(error || success) && (
          <div className={`mb-6 rounded-2xl p-4 border-2 shadow-xl ${error ? 'border-red-200' : 'border-emerald-200'}`}>
            {error && <p className="text-red-700 text-sm">{error}</p>}
            {success && <p className="text-emerald-700 text-sm">{success}</p>}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="h-8 bg-zinc-100 rounded animate-pulse" />
            <div className="h-48 bg-zinc-100 rounded animate-pulse" />
          </div>
        ) : !agendamento ? (
          <div className="bg-white rounded-2xl p-8 text-center text-zinc-600 shadow">Agendamento não encontrado.</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-zinc-100 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-zinc-500">#{agendamento.id}</div>
                <h2 className="text-xl font-semibold text-[#2d5016]">{agendamento.solicitante?.nome || agendamento.cliente || 'Solicitante'}</h2>
                <div className="text-sm text-zinc-600 mt-1">Status: <span className="font-semibold">{agendamento.status}</span></div>
              </div>
              <div className="text-right">
                <div className="text-sm text-zinc-500">Solicitado em</div>
                <div className="font-medium">{agendamento.data_solicitacao ? new Date(agendamento.data_solicitacao).toLocaleString('pt-BR') : '-'}</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-[#2d5016]">Empresa Responsável</h3>
                <p className="text-sm text-zinc-700">{agendamento.empresaResponsavel?.nomeFantasia || agendamento.empresaResponsavel?.razaoSocial || '-'}</p>

                <h3 className="text-sm font-semibold text-[#2d5016] mt-4">Contato</h3>
                <p className="text-sm text-zinc-700">{agendamento.solicitante?.nome}</p>
                <p className="text-xs text-zinc-500">{agendamento.solicitante?.email}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#2d5016]">Endereço</h3>
                <p className="text-sm text-zinc-700">{agendamento.enderecoColeta ? `${agendamento.enderecoColeta.logradouro || ''} ${agendamento.enderecoColeta.numero || ''} ${agendamento.enderecoColeta.bairro || ''} ${agendamento.enderecoColeta.cidade || ''}` : '-'}</p>

                <h3 className="text-sm font-semibold text-[#2d5016] mt-4">Data Agendada</h3>
                <p className="text-sm text-zinc-700">{agendamento.dataAgendada ? new Date(agendamento.dataAgendada).toLocaleString('pt-BR') : '-'}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[#2d5016]">Materiais</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {(agendamento.itens || []).map((it) => (
                  <span key={it.id || it.tipoResiduoId} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm">{it.tipoResiduo?.nome || it.nome || 'Item'} x{it.quantidade || it.quantidade || 1}</span>
                ))}
              </div>
            </div>

            {agendamento.observacoesUsuario && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-[#2d5016]">Observações</h3>
                <p className="text-sm text-zinc-700 mt-2">{agendamento.observacoesUsuario}</p>
              </div>
            )}

            <div className="mt-6 border-t pt-4 flex flex-col md:flex-row gap-3 items-start md:items-center justify-end">
              {/* Approve: allow optional scheduling */}
              {agendamento.status && (agendamento.status.toUpperCase() === 'SOLICITADO' || agendamento.status.toUpperCase() === 'PENDENTE') && (
                <div className="w-full md:w-auto flex gap-2 items-center">
                  <input type="date" value={dataAgendada} onChange={(e) => setDataAgendada(e.target.value)} className="border rounded px-2 py-1 mr-1" />
                  <input type="time" value={horaAgendada} onChange={(e) => setHoraAgendada(e.target.value)} className="border rounded px-2 py-1 mr-1" />
                  <button disabled={submitting} onClick={onAprovar} className="px-3 py-2 rounded bg-[#48742c] text-white">Aprovar</button>
                </div>
              )}

              {/* Reject */}
              {agendamento.status && (agendamento.status.toUpperCase() === 'SOLICITADO' || agendamento.status.toUpperCase() === 'PENDENTE') && (
                <div className="w-full md:w-auto">
                  {!showRejeitar ? (
                    <button onClick={() => setShowRejeitar(true)} className="px-3 py-2 rounded border border-zinc-300">Rejeitar</button>
                  ) : (
                    <div className="flex gap-2">
                      <input placeholder="Justificativa" value={justificativa} onChange={(e) => setJustificativa(e.target.value)} className="border rounded px-2 py-1" />
                      <button disabled={submitting} onClick={onRejeitar} className="px-3 py-2 rounded bg-red-600 text-white">Confirmar rejeição</button>
                      <button onClick={() => { setShowRejeitar(false); setJustificativa(''); }} className="px-3 py-2 rounded border">Cancelar</button>
                    </div>
                  )}
                </div>
              )}

              {/* Mark as concluded */}
              {agendamento.status && !['CONCLUIDO','CANCELADO','REJEITADA'].includes(agendamento.status.toUpperCase()) && (
                <div className="w-full md:w-auto">
                  <button disabled={submitting} onClick={onConcluir} className="px-3 py-2 rounded bg-emerald-600 text-white">Marcar como concluída</button>
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
