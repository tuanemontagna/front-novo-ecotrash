"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axios";
import Modal from "../_components/modal";
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function AdminTiposResiduoPage() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [form, setForm] = useState({ nome: "", descricao: "" });

  function openCreate() {
    setEditing(null);
    setForm({ nome: "", descricao: "" });
    setModalOpen(true);
  }
  function openEdit(t) {
    setEditing(t);
    setForm({ nome: t.nome||"", descricao: t.descricao||"" });
    setModalOpen(true);
  }
  async function load() {
    try {
      setLoading(true); setError("");
      const res = await api.get('/tipos-residuo');
      setTipos(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (e) { setError('Falha ao carregar tipos de resíduo.'); } finally { setLoading(false); }
  }
  useEffect(()=>{ load(); }, []);

  async function save(e){
    e?.preventDefault?.();
    try {
      setSaving(true); setError(""); setSuccess("");
      if (editing) {
        await api.patch(`/tipos-residuo/${editing.id}`, form);
        setSuccess('Tipo atualizado.');
      } else {
        await api.post('/tipos-residuo', form);
        setSuccess('Tipo criado.');
      }
      setModalOpen(false);
      await load();
    } catch (e) { setError(e?.response?.data?.message || 'Erro ao salvar tipo.'); } finally { setSaving(false); }
  }
  async function excluir(){
    if (!confirmDel) return;
    try {
      setError(""); setSuccess("");
      await api.delete(`/tipos-residuo/${confirmDel.id}`);
      setSuccess('Tipo excluído.');
      setConfirmDel(null);
      await load();
    } catch (e){ setError(e?.response?.data?.message || 'Erro ao excluir tipo.'); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[#2d5016] text-xl font-semibold">Tipos de Resíduo</h1>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] text-white text-sm font-bold shadow"><Plus size={16}/> Novo</button>
      </div>

      {(error || success) && (
        <div className={`mb-6 rounded-2xl p-4 border-2 shadow ${error? 'border-red-200':'border-emerald-200'}`}> 
          {error && <div className="flex items-center gap-2 text-red-700 text-sm"><AlertTriangle size={16}/> {error}</div>}
          {success && <div className="flex items-center gap-2 text-emerald-700 text-sm"><CheckCircle2 size={16}/> {success}</div>}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-zinc-200 shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr>
              <th className="text-left font-medium px-4 py-2">ID</th>
              <th className="text-left font-medium px-4 py-2">Nome</th>
              <th className="text-left font-medium px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-zinc-500">Carregando...</td></tr>
            ) : tipos.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-zinc-500">Nenhum tipo cadastrado.</td></tr>
            ) : (
              tipos.map(t => (
                <tr key={t.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                  <td className="px-4 py-2">{t.id}</td>
                  <td className="px-4 py-2">{t.nome}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button onClick={()=>openEdit(t)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-300 text-zinc-700 text-xs font-bold hover:bg-zinc-50"><Pencil size={14}/>Editar</button>
                      <button onClick={()=>setConfirmDel(t)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-300 text-red-700 text-xs font-bold hover:bg-red-50"><Trash2 size={14}/>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title={editing? 'Editar tipo':'Novo tipo'} onClose={()=>setModalOpen(false)}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#2d5016] mb-1">Nome</label>
              <input value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#2d5016] mb-1">Descrição</label>
              <textarea value={form.descricao} onChange={e=>setForm(f=>({...f,descricao:e.target.value}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm min-h-[120px]" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={()=>setModalOpen(false)} className="px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700 text-sm">Cancelar</button>
            <button disabled={saving} type="submit" className={`px-4 py-2 rounded-lg text-white text-sm font-bold ${saving? 'bg-zinc-400':'bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] shadow'}`}>{saving? 'Salvando...':(editing?'Salvar alterações':'Criar tipo')}</button>
          </div>
        </form>
      </Modal>

      {confirmDel && (
        <Modal open={!!confirmDel} title="Confirmar exclusão" onClose={()=>setConfirmDel(null)}>
          <p className="text-sm text-zinc-700 mb-4">Excluir tipo <strong>{confirmDel.nome}</strong>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={()=>setConfirmDel(null)} className="px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700 text-sm">Cancelar</button>
            <button onClick={excluir} className="px-4 py-2 rounded-lg text-white text-sm font-bold bg-red-600">Excluir</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
