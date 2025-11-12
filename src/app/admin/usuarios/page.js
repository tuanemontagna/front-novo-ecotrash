"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axios";
import Modal from "../_components/modal";
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [form, setForm] = useState({ nome: "", email: "", senha: "", telefone: "", tipoUsuario: "PESSOA_FISICA", cpf: "" });

  function openCreate() {
    setEditing(null);
    setForm({ nome: "", email: "", senha: "", telefone: "", tipoUsuario: "PESSOA_FISICA", cpf: "" });
    setModalOpen(true);
  }
  function openEdit(u) {
    setEditing(u);
    setForm({ nome: u.nome || "", email: u.email || "", senha: "", telefone: u.telefone || "", tipoUsuario: u.tipoUsuario, cpf: u.cpf || "" });
    setModalOpen(true);
  }

  async function load() {
    try {
      setLoading(true); setError("");
      const res = await api.get('/usuarios');
      setUsuarios(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (e) {
      setError('Falha ao carregar usuários.');
    } finally { setLoading(false); }
  }

  useEffect(()=>{ load(); }, []);

  async function save(e){
    e?.preventDefault?.();
    try {
      setSaving(true); setError(""); setSuccess("");
      if (editing) {
        await api.patch(`/usuarios/${editing.id}`, { nome: form.nome, email: form.email, telefone: form.telefone, tipoUsuario: form.tipoUsuario, cpf: form.cpf, ...(form.senha?{senha:form.senha}:{}) });
        setSuccess('Usuário atualizado.');
      } else {
        if (!form.senha) { setError('Senha obrigatória para novo usuário'); return; }
        await api.post('/usuarios', form);
        setSuccess('Usuário criado.');
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Erro ao salvar usuário.');
    } finally { setSaving(false); }
  }

  async function excluir(){
    if (!confirmDel) return;
    try {
      setError(""); setSuccess("");
      await api.delete(`/usuarios/${confirmDel.id}`);
      setSuccess('Usuário excluído.');
      setConfirmDel(null);
      await load();
    } catch (e){
      setError(e?.response?.data?.message || 'Erro ao excluir usuário.');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[#2d5016] text-xl font-semibold">Usuários</h1>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] text-white text-sm font-bold shadow"><Plus size={16}/> Novo</button>
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
              <th className="text-left font-medium px-4 py-2">Email</th>
              <th className="text-left font-medium px-4 py-2">Tipo</th>
              <th className="text-left font-medium px-4 py-2">Telefone</th>
              <th className="text-left font-medium px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-zinc-500">Carregando...</td></tr>
            ) : usuarios.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-zinc-500">Nenhum usuário cadastrado.</td></tr>
            ) : (
              usuarios.map(u => (
                <tr key={u.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                  <td className="px-4 py-2">{u.id}</td>
                  <td className="px-4 py-2">{u.nome}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.tipoUsuario}</td>
                  <td className="px-4 py-2">{u.telefone || '-'}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button onClick={()=>openEdit(u)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-300 text-zinc-700 text-xs font-bold hover:bg-zinc-50"><Pencil size={14}/>Editar</button>
                      <button onClick={()=>setConfirmDel(u)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-300 text-red-700 text-xs font-bold hover:bg-red-50"><Trash2 size={14}/>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title={editing? 'Editar usuário':'Novo usuário'} onClose={()=>setModalOpen(false)}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#2d5016] mb-1">Nome</label>
              <input value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#2d5016] mb-1">Email</label>
              <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#2d5016] mb-1">Telefone</label>
              <input value={form.telefone} onChange={e=>setForm(f=>({...f,telefone:e.target.value}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#2d5016] mb-1">Tipo de Usuário</label>
              <select value={form.tipoUsuario} onChange={e=>setForm(f=>({...f,tipoUsuario:e.target.value}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-800">
                <option value="PESSOA_FISICA">PESSOA_FISICA</option>
                <option value="EMPRESA">EMPRESA</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#2d5016] mb-1">CPF</label>
              <input value={form.cpf} onChange={e=>setForm(f=>({...f,cpf:e.target.value}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#2d5016] mb-1">Senha {editing && <span className="text-zinc-500 font-normal">(preencha para alterar)</span>}</label>
              <input type="password" value={form.senha} onChange={e=>setForm(f=>({...f,senha:e.target.value}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={()=>setModalOpen(false)} className="px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700 text-sm">Cancelar</button>
            <button disabled={saving} type="submit" className={`px-4 py-2 rounded-lg text-white text-sm font-bold ${saving? 'bg-zinc-400':'bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] shadow'}`}>{saving? 'Salvando...':(editing?'Salvar alterações':'Criar usuário')}</button>
          </div>
        </form>
      </Modal>

      {confirmDel && (
        <Modal open={!!confirmDel} title="Confirmar exclusão" onClose={()=>setConfirmDel(null)}>
          <p className="text-sm text-zinc-700 mb-4">Tem certeza que deseja excluir o usuário <strong>{confirmDel.nome}</strong>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={()=>setConfirmDel(null)} className="px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700 text-sm">Cancelar</button>
            <button onClick={excluir} className="px-4 py-2 rounded-lg text-white text-sm font-bold bg-red-600">Excluir</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
