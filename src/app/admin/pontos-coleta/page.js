"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/utils/axios";
import Modal from "../_components/modal";
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle2, ToggleLeft, ToggleRight } from "lucide-react";

export default function AdminPontosColetaPage() {
  const [empresas, setEmpresas] = useState([]);
  const [empresaId, setEmpresaId] = useState("");
  const [pontos, setPontos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const [form, setForm] = useState({
    nomePonto: "",
    horarioFuncionamento: "",
    ativo: true,
    endereco: {
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      latitude: "",
      longitude: "",
    },
  });

  function openCreate() {
    setEditing(null);
    setForm({
      nomePonto: "",
      horarioFuncionamento: "",
      ativo: true,
      endereco: { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", latitude: "", longitude: "" }
    });
    setModalOpen(true);
  }
  function openEdit(p) {
    setEditing(p);
    setForm({
      nomePonto: p?.nomePonto || "",
      horarioFuncionamento: p?.horarioFuncionamento || "",
      ativo: !!p?.ativo,
      endereco: {
        cep: p?.endereco?.cep || "",
        logradouro: p?.endereco?.logradouro || "",
        numero: p?.endereco?.numero || "",
        complemento: p?.endereco?.complemento || "",
        bairro: p?.endereco?.bairro || "",
        cidade: p?.endereco?.cidade || "",
        estado: p?.endereco?.estado || "",
        latitude: p?.endereco?.latitude || "",
        longitude: p?.endereco?.longitude || "",
      },
    });
    setModalOpen(true);
  }

  async function loadEmpresas() {
    try {
      const res = await api.get('/empresas');
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setEmpresas(list);
      if (!empresaId && list.length > 0) {
        setEmpresaId(String(list[0].id));
      }
    } catch (e) {
      setError('Falha ao carregar empresas.');
    }
  }

  async function loadPontos(id) {
    if (!id) { setPontos([]); return; }
    try {
      setLoading(true); setError("");
      const res = await api.get(`/empresas/${id}/pontos-coleta`);
      setPontos(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (e) {
      setError('Falha ao carregar pontos de coleta.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadEmpresas(); }, []);
  useEffect(() => { if (empresaId) loadPontos(empresaId); }, [empresaId]);

  async function save(e) {
    e?.preventDefault?.();
    if (!empresaId) { setError('Selecione uma empresa.'); return; }
    try {
      setSaving(true); setError(""); setSuccess("");
      if (editing) {
        await api.patch(`/empresas/${empresaId}/pontos-coleta/${editing.id}`, form);
        setSuccess('Ponto de coleta atualizado.');
      } else {
        await api.post(`/empresas/${empresaId}/pontos-coleta`, form);
        setSuccess('Ponto de coleta criado.');
      }
      setModalOpen(false);
      await loadPontos(empresaId);
    } catch (e) {
      setError(e?.response?.data?.message || 'Erro ao salvar ponto de coleta.');
    } finally {
      setSaving(false);
    }
  }

  async function excluir() {
    if (!confirmDel || !empresaId) return;
    try {
      setError(""); setSuccess("");
      await api.delete(`/empresas/${empresaId}/pontos-coleta/${confirmDel.id}`);
      setSuccess('Ponto de coleta excluído.');
      setConfirmDel(null);
      await loadPontos(empresaId);
    } catch (e) {
      setError(e?.response?.data?.message || 'Erro ao excluir ponto de coleta.');
    }
  }

  async function toggleAtivo(p) {
    if (!empresaId || !p) return;
    try {
      await api.patch(`/empresas/${empresaId}/pontos-coleta/${p.id}`, { ativo: !p.ativo });
      await loadPontos(empresaId);
    } catch {}
  }

  const empresaSelecionada = useMemo(() => empresas.find(e => String(e.id) === String(empresaId)), [empresas, empresaId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#2d5016] text-xl font-semibold">Pontos de Coleta</h1>
          <p className="text-xs text-zinc-600">Gerencie os pontos de coleta por empresa</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={empresaId} onChange={e=>setEmpresaId(e.target.value)} className="border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-800">
            <option value="">Selecione a empresa</option>
            {empresas.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.nomeFantasia || emp.razaoSocial || `Empresa #${emp.id}`}</option>
            ))}
          </select>
          <button onClick={openCreate} disabled={!empresaId} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold shadow ${empresaId? 'bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)]':'bg-zinc-400 cursor-not-allowed'}`}><Plus size={16}/> Novo</button>
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
              <th className="text-left font-medium px-4 py-2">Nome</th>
              <th className="text-left font-medium px-4 py-2">Endereço</th>
              <th className="text-left font-medium px-4 py-2">Horário</th>
              <th className="text-left font-medium px-4 py-2">Ativo</th>
              <th className="text-left font-medium px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-zinc-500">Carregando...</td></tr>
            ) : pontos.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-zinc-500">{empresaId? 'Nenhum ponto cadastrado para esta empresa.' : 'Selecione uma empresa para visualizar.'}</td></tr>
            ) : (
              pontos.map(p => {
                const e = p.endereco || {};
                const linha = [e.logradouro, e.numero].filter(Boolean).join(", ");
                const cidadeUf = [e.cidade, e.estado].filter(Boolean).join(" - ");
                const endStr = [linha, e.bairro, cidadeUf, e.cep].filter(Boolean).join(" • ");
                return (
                  <tr key={p.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                    <td className="px-4 py-2">{p.id}</td>
                    <td className="px-4 py-2">{p.nomePonto}</td>
                    <td className="px-4 py-2">{endStr || '-'}</td>
                    <td className="px-4 py-2">{p.horarioFuncionamento || '-'}</td>
                    <td className="px-4 py-2">
                      <button onClick={() => toggleAtivo(p)} className="inline-flex items-center gap-2 text-xs font-medium text-zinc-700">
                        {p.ativo ? <ToggleRight size={18} className="text-emerald-600"/> : <ToggleLeft size={18} className="text-zinc-400"/>}
                        {p.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-300 text-zinc-700 text-xs font-bold hover:bg-zinc-50"><Pencil size={14}/>Editar</button>
                        <button onClick={() => setConfirmDel(p)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-300 text-red-700 text-xs font-bold hover:bg-red-50"><Trash2 size={14}/>Excluir</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title={editing? 'Editar ponto de coleta' : 'Novo ponto de coleta'} onClose={() => setModalOpen(false)}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#2d5016] mb-1">Empresa</label>
              <input disabled value={empresaSelecionada ? (empresaSelecionada.nomeFantasia || empresaSelecionada.razaoSocial || `Empresa #${empresaSelecionada.id}`) : ''} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-zinc-100"/>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#2d5016] mb-1">Nome do ponto</label>
              <input value={form.nomePonto} onChange={e=>setForm(f=>({...f,nomePonto:e.target.value}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#2d5016] mb-1">Horário de funcionamento</label>
              <input value={form.horarioFuncionamento} onChange={e=>setForm(f=>({...f,horarioFuncionamento:e.target.value}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#2d5016] mb-1">Ativo</label>
              <select value={form.ativo? '1':'0'} onChange={e=>setForm(f=>({...f,ativo:e.target.value==='1'}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-800">
                <option value="1">Ativo</option>
                <option value="0">Inativo</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <h3 className="text-sm font-semibold text-[#2d5016] mb-2">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#2d5016] mb-1">CEP</label>
                <input value={form.endereco.cep} onChange={e=>setForm(f=>({...f,endereco:{...f.endereco,cep:e.target.value}}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"/>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#2d5016] mb-1">Logradouro</label>
                <input value={form.endereco.logradouro} onChange={e=>setForm(f=>({...f,endereco:{...f.endereco,logradouro:e.target.value}}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#2d5016] mb-1">Número</label>
                <input value={form.endereco.numero} onChange={e=>setForm(f=>({...f,endereco:{...f.endereco,numero:e.target.value}}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#2d5016] mb-1">Complemento</label>
                <input value={form.endereco.complemento} onChange={e=>setForm(f=>({...f,endereco:{...f.endereco,complemento:e.target.value}}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#2d5016] mb-1">Bairro</label>
                <input value={form.endereco.bairro} onChange={e=>setForm(f=>({...f,endereco:{...f.endereco,bairro:e.target.value}}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#2d5016] mb-1">Cidade</label>
                <input value={form.endereco.cidade} onChange={e=>setForm(f=>({...f,endereco:{...f.endereco,cidade:e.target.value}}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#2d5016] mb-1">Estado (UF)</label>
                <input value={form.endereco.estado} onChange={e=>setForm(f=>({...f,endereco:{...f.endereco,estado:e.target.value}}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#2d5016] mb-1">Latitude</label>
                <input value={form.endereco.latitude} onChange={e=>setForm(f=>({...f,endereco:{...f.endereco,latitude:e.target.value}}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#2d5016] mb-1">Longitude</label>
                <input value={form.endereco.longitude} onChange={e=>setForm(f=>({...f,endereco:{...f.endereco,longitude:e.target.value}}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"/>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={()=>setModalOpen(false)} className="px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700 text-sm">Cancelar</button>
            <button disabled={saving} type="submit" className={`px-4 py-2 rounded-lg text-white text-sm font-bold ${saving? 'bg-zinc-400':'bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] shadow'}`}>{saving? 'Salvando...':(editing?'Salvar alterações':'Criar ponto')}</button>
          </div>
        </form>
      </Modal>

      {confirmDel && (
        <Modal open={!!confirmDel} title="Confirmar exclusão" onClose={()=>setConfirmDel(null)}>
          <p className="text-sm text-zinc-700 mb-4">Excluir o ponto de coleta <strong>{confirmDel.nomePonto}</strong>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={()=>setConfirmDel(null)} className="px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700 text-sm">Cancelar</button>
            <button onClick={excluir} className="px-4 py-2 rounded-lg text-white text-sm font-bold bg-red-600">Excluir</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
