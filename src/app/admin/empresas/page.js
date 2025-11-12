"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axios";
import Modal from "../_components/modal";
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function AdminEmpresasPage() {
  const [empresas, setEmpresas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [form, setForm] = useState({ usuarioId: "", razaoSocial: "", nomeFantasia: "", cnpj: "" });

  function openCreate() {
    setEditing(null);
    setForm({ usuarioId: "", razaoSocial: "", nomeFantasia: "", cnpj: "" });
    setModalOpen(true);
  }
  function openEdit(e) {
    setEditing(e);
    setForm({ usuarioId: e.usuarioId, razaoSocial: e.razaoSocial || "", nomeFantasia: e.nomeFantasia || "", cnpj: e.cnpj || "" });
    setModalOpen(true);
  }

  async function load() {
    try {
      setLoading(true); setError("");
      const [empRes, usuRes] = await Promise.all([
        api.get('/empresas'),
        api.get('/usuarios'),
      ]);
      setEmpresas(Array.isArray(empRes?.data?.data) ? empRes.data.data : []);
      setUsuarios((usuRes?.data?.data||[]).filter(u=>u.tipoUsuario==='EMPRESA'));
    } catch (e) {
      setError('Falha ao carregar empresas.');
    } finally { setLoading(false); }
  }

  useEffect(()=>{ load(); }, []);

  async function save(e){
    e?.preventDefault?.();
    try {
      setSaving(true); setError(""); setSuccess("");
      if (editing) {
        await api.patch(`/empresas/${editing.id}`, { razaoSocial: form.razaoSocial, nomeFantasia: form.nomeFantasia });
        setSuccess('Empresa atualizada.');
      } else {
        // Criar empresa exige usuário + senha? No controller create cria usuário e endereço.
        // Aqui simplificado: precisamos só dos campos exigidos. Endereço obrigatório; fornecer placeholder.
        if (!form.usuarioId) { setError('Selecione um usuário do tipo EMPRESA.'); return; }
        await api.post('/empresas', {
          razaoSocial: form.razaoSocial,
          nomeFantasia: form.nomeFantasia,
          cnpj: form.cnpj,
          usuarioId: form.usuarioId, // pode ser ignorado pelo controller atual (ele cria novo usuario). Ajuste futuro.
          nome: 'TEMP', email: 'temp@example.com', senha: '123456', telefone: '',
          endereco: { cep: '00000-000', logradouro: 'Rua', bairro: 'Bairro', cidade: 'Cidade', estado: 'ST' }
        });
        setSuccess('Empresa criada. (ajustar criação real)');
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Erro ao salvar empresa.');
    } finally { setSaving(false); }
  }

  async function excluir(){
    if (!confirmDel) return;
    try {
      setError(""); setSuccess("");
      await api.delete(`/empresas/${confirmDel.id}`);
      setSuccess('Empresa excluída.');
      setConfirmDel(null);
      await load();
    } catch (e){
      setError(e?.response?.data?.message || 'Erro ao excluir empresa.');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[#2d5016] text-xl font-semibold">Empresas</h1>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] text-white text-sm font-bold shadow"><Plus size={16}/> Nova</button>
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
              <th className="text-left font-medium px-4 py-2">Razão Social</th>
              <th className="text-left font-medium px-4 py-2">Nome Fantasia</th>
              <th className="text-left font-medium px-4 py-2">CNPJ</th>
              <th className="text-left font-medium px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-zinc-500">Carregando...</td></tr>
            ) : empresas.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-zinc-500">Nenhuma empresa cadastrada.</td></tr>
            ) : (
              empresas.map(e => (
                <tr key={e.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                  <td className="px-4 py-2">{e.id}</td>
                  <td className="px-4 py-2">{e.razaoSocial}</td>
                  <td className="px-4 py-2">{e.nomeFantasia || '-'}</td>
                  <td className="px-4 py-2">{e.cnpj}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button onClick={()=>openEdit(e)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-300 text-zinc-700 text-xs font-bold hover:bg-zinc-50"><Pencil size={14}/>Editar</button>
                      <button onClick={()=>setConfirmDel(e)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-300 text-red-700 text-xs font-bold hover:bg-red-50"><Trash2 size={14}/>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title={editing? 'Editar empresa':'Nova empresa'} onClose={()=>setModalOpen(false)}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#2d5016] mb-1">Razão Social</label>
              <input value={form.razaoSocial} onChange={e=>setForm(f=>({...f,razaoSocial:e.target.value}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#2d5016] mb-1">Nome Fantasia</label>
              <input value={form.nomeFantasia} onChange={e=>setForm(f=>({...f,nomeFantasia:e.target.value}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#2d5016] mb-1">CNPJ</label>
              <input value={form.cnpj} onChange={e=>setForm(f=>({...f,cnpj:e.target.value}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            {!editing && (
              <div>
                <label className="block text-xs font-medium text-[#2d5016] mb-1">Usuário existente (EMPRESA)</label>
                <select value={form.usuarioId} onChange={e=>setForm(f=>({...f,usuarioId:e.target.value}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-800">
                  <option value="">Selecione...</option>
                  {usuarios.map(u=> <option key={u.id} value={u.id}>{u.id} - {u.email}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={()=>setModalOpen(false)} className="px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700 text-sm">Cancelar</button>
            <button disabled={saving} type="submit" className={`px-4 py-2 rounded-lg text-white text-sm font-bold ${saving? 'bg-zinc-400':'bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] shadow'}`}>{saving? 'Salvando...':(editing?'Salvar alterações':'Criar empresa')}</button>
          </div>
        </form>
        {!editing && <p className="text-xs text-zinc-500 mt-4">Observação: fluxo de criação real da empresa cria usuário e endereço; aqui um placeholder será usado até refatorar.</p>}
      </Modal>

      {confirmDel && (
        <Modal open={!!confirmDel} title="Confirmar exclusão" onClose={()=>setConfirmDel(null)}>
          <p className="text-sm text-zinc-700 mb-4">Excluir empresa <strong>{confirmDel.razaoSocial}</strong>? Esta ação é irreversível.</p>
          <div className="flex justify-end gap-3">
            <button onClick={()=>setConfirmDel(null)} className="px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700 text-sm">Cancelar</button>
            <button onClick={excluir} className="px-4 py-2 rounded-lg text-white text-sm font-bold bg-red-600">Excluir</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
