"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/utils/axios";
import Modal from "../_components/modal";
import { AlertTriangle, CheckCircle2, Eye, Trash2 } from "lucide-react";

const STATUS_OPCOES = [
  'SOLICITADO',
  'AGENDADA',
  'CONFIRMADA',
  'REJEITADA',
  'CANCELADO',
  'CONCLUIDO',
];

export default function AdminAgendamentosPage() {
  const [modo, setModo] = useState('empresa'); // 'empresa' | 'usuario'
  const [empresas, setEmpresas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [empresaId, setEmpresaId] = useState("");
  const [usuarioId, setUsuarioId] = useState("");

  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [detalhe, setDetalhe] = useState(null); // objeto do GET /agendamentos/:id
  const [abrirDetalhe, setAbrirDetalhe] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadEmpresas() {
    try {
      const r = await api.get('/empresas');
      const list = Array.isArray(r?.data?.data) ? r.data.data : [];
      setEmpresas(list);
      if (!empresaId && list.length) setEmpresaId(String(list[0].id));
    } catch { /* noop */ }
  }
  async function loadUsuarios() {
    try {
      const r = await api.get('/usuarios');
      const list = Array.isArray(r?.data?.data) ? r.data.data : [];
      setUsuarios(list);
      if (!usuarioId && list.length) setUsuarioId(String(list[0].id));
    } catch { /* noop */ }
  }

  async function loadAgendamentos() {
    try {
      setLoading(true); setError("");
      if (modo === 'empresa' && empresaId) {
        const r = await api.get(`/empresas/${empresaId}/agendamentos`);
        setItens(Array.isArray(r?.data?.data) ? r.data.data : []);
      } else if (modo === 'usuario' && usuarioId) {
        const r = await api.get(`/usuarios/${usuarioId}/agendamentos`);
        setItens(Array.isArray(r?.data?.data) ? r.data.data : []);
      } else {
        setItens([]);
      }
    } catch (e) {
      setError('Falha ao carregar agendamentos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadEmpresas(); loadUsuarios(); }, []);
  useEffect(() => { loadAgendamentos(); }, [modo, empresaId, usuarioId]);

  const nomeEmpresaSelecionada = useMemo(() => {
    const e = empresas.find(x => String(x.id) === String(empresaId));
    return e ? (e.nomeFantasia || e.razaoSocial || `Empresa #${e.id}`) : '';
  }, [empresas, empresaId]);
  const nomeUsuarioSelecionado = useMemo(() => {
    const u = usuarios.find(x => String(x.id) === String(usuarioId));
    return u ? (u.nome || u.email || `Usuário #${u.id}`) : '';
  }, [usuarios, usuarioId]);

  async function abrirModalDetalhe(item) {
    try {
      setError("");
      const r = await api.get(`/agendamentos/${item.id}`);
      setDetalhe(r?.data?.data || null);
      setAbrirDetalhe(true);
    } catch (e) {
      setError('Falha ao carregar detalhes do agendamento.');
    }
  }

  async function salvarStatus(e) {
    e?.preventDefault?.();
    if (!detalhe?.id) return;
    try {
      setSaving(true); setError(""); setSuccess("");
      const payload = {
        status: detalhe.status,
        dataAgendada: detalhe.dataAgendada || null,
        justificativaRejeicao: detalhe.justificativaRejeicao || null,
      };
      await api.patch(`/agendamentos/${detalhe.id}/status`, payload);
      setSuccess('Status atualizado.');
      setAbrirDetalhe(false);
      await loadAgendamentos();
    } catch (e) {
      setError(e?.response?.data?.message || 'Erro ao atualizar status.');
    } finally {
      setSaving(false);
    }
  }

  async function excluir(item) {
    if (!item) return;
    if (!confirm(`Excluir agendamento #${item.id}?`)) return;
    try {
      setError(""); setSuccess("");
      await api.delete(`/agendamentos/${item.id}`);
      setSuccess('Agendamento excluído.');
      await loadAgendamentos();
    } catch (e) {
      setError(e?.response?.data?.message || 'Erro ao excluir agendamento.');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#2d5016] text-xl font-semibold">Agendamentos</h1>
          <p className="text-xs text-zinc-600">Liste e atualize o status dos agendamentos</p>
        </div>
  <div className="flex items-center gap-2">
          <button onClick={()=>setModo('empresa')} className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${modo==='empresa' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'border-zinc-300 text-zinc-700'}`}>Por empresa</button>
          <button onClick={()=>setModo('usuario')} className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${modo==='usuario' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'border-zinc-300 text-zinc-700'}`}>Por usuário</button>
          {modo==='empresa' ? (
            <select value={empresaId} onChange={e=>setEmpresaId(e.target.value)} className="ml-2 border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-800">
              <option value="">Selecione a empresa</option>
              {empresas.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nomeFantasia || emp.razaoSocial || `Empresa #${emp.id}`}</option>
              ))}
            </select>
          ) : (
            <select value={usuarioId} onChange={e=>setUsuarioId(e.target.value)} className="ml-2 border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-800">
              <option value="">Selecione o usuário</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>{u.nome || u.email || `Usuário #${u.id}`}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {(error || success) && (
        <div className={`mb-6 rounded-2xl p-4 border-2 shadow ${error? 'border-red-200':'border-emerald-200'}`}>
          {error && <div className="flex items-center gap-2 text-red-700 text-sm"><AlertTriangle size={16}/> {error}</div>}
          {success && <div className="flex items-center gap-2 text-emerald-700 text-sm"><CheckCircle2 size={16}/> {success}</div>}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-zinc-200 shadow overflow-hidden">
        <table className="w-full text-sm text-zinc-800">
          <thead className="bg-zinc-50 text-zinc-800">
            <tr>
              <th className="text-left font-medium px-4 py-2">ID</th>
              <th className="text-left font-medium px-4 py-2">Status</th>
              <th className="text-left font-medium px-4 py-2">{modo==='empresa' ? 'Solicitante' : 'Empresa'}</th>
              <th className="text-left font-medium px-4 py-2">Solicitado em</th>
              <th className="text-left font-medium px-4 py-2">Agendado para</th>
              <th className="text-left font-medium px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-zinc-500">Carregando...</td></tr>
            ) : itens.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-zinc-500">{(modo==='empresa'? empresaId : usuarioId) ? 'Nenhum agendamento encontrado.' : 'Selecione um filtro para visualizar.'}</td></tr>
            ) : (
              itens.map(item => (
                <tr key={item.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                  <td className="px-4 py-2">{item.id}</td>
                  <td className="px-4 py-2">{item.status}</td>
                  <td className="px-4 py-2">{modo==='empresa' ? (item.solicitante?.nome || `Usuário #${item.usuarioId}`) : (item.empresaResponsavel?.nomeFantasia || `Empresa #${item.empresaId}`)}</td>
                  <td className="px-4 py-2">{item.data_solicitacao ? new Date(item.data_solicitacao).toLocaleString('pt-BR') : '-'}</td>
                  <td className="px-4 py-2">{item.dataAgendada ? new Date(item.dataAgendada).toLocaleString('pt-BR') : '-'}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button onClick={()=>abrirModalDetalhe(item)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-300 text-zinc-700 text-xs font-bold hover:bg-zinc-50"><Eye size={14}/>Detalhes</button>
                      <button onClick={()=>excluir(item)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-300 text-red-700 text-xs font-bold hover:bg-red-50"><Trash2 size={14}/>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {abrirDetalhe && detalhe && (
        <Modal open={abrirDetalhe} title={`Agendamento #${detalhe.id}`} onClose={()=>setAbrirDetalhe(false)}>
          <form onSubmit={salvarStatus} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#2d5016] mb-1">Status</label>
                <select value={detalhe.status} onChange={e=>setDetalhe(d=>({...d,status:e.target.value}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-800">
                  {STATUS_OPCOES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#2d5016] mb-1">Data agendada</label>
                <input type="datetime-local" value={detalhe.dataAgendada ? new Date(detalhe.dataAgendada).toISOString().slice(0,16) : ''} onChange={e=>setDetalhe(d=>({...d,dataAgendada:e.target.value? new Date(e.target.value).toISOString(): null}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"/>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#2d5016] mb-1">Justificativa (para rejeição/cancelamento)</label>
                <textarea value={detalhe.justificativaRejeicao || ''} onChange={e=>setDetalhe(d=>({...d,justificativaRejeicao:e.target.value}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" rows={3}/>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-sm text-zinc-700">
                <div className="font-medium text-[#2d5016] mb-1">Solicitante</div>
                <div>{detalhe.solicitante?.nome || '-'}</div>
                <div className="text-xs text-zinc-500">{detalhe.solicitante?.email || ''}</div>
              </div>
              <div className="text-sm text-zinc-700">
                <div className="font-medium text-[#2d5016] mb-1">Empresa</div>
                <div>{detalhe.empresaResponsavel?.nomeFantasia || '-'}</div>
              </div>
            </div>

            <div>
              <div className="font-medium text-[#2d5016] mb-1 text-sm">Endereço de Coleta</div>
              <div className="text-sm text-zinc-700">
                {(() => {
                  const e = detalhe.enderecoColeta || {}; const linha = [e.logradouro, e.numero].filter(Boolean).join(', ');
                  const cidadeUf = [e.cidade, e.estado].filter(Boolean).join(' - ');
                  return [linha, e.bairro, cidadeUf, e.cep].filter(Boolean).join(' • ');
                })()}
              </div>
            </div>

            <div>
              <div className="font-medium text-[#2d5016] mb-1 text-sm">Itens</div>
              <ul className="list-disc pl-5 text-sm text-zinc-700">
                {(detalhe.itens || []).map((it) => (
                  <li key={it.id}>{it.quantidade}x {it.tipoResiduo?.descricao || `Tipo ${it.tipoResiduoId}`}</li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={()=>setAbrirDetalhe(false)} className="px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700 text-sm">Fechar</button>
              <button disabled={saving} type="submit" className={`px-4 py-2 rounded-lg text-white text-sm font-bold ${saving? 'bg-zinc-400':'bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] shadow'}`}>{saving? 'Salvando...':'Salvar status'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
