"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/header";
import api from "@/utils/axios";
import { Building2, MapPin, Clock, Plus, Pencil, Trash2, Search, AlertTriangle, CheckCircle2 } from "lucide-react";

function formatEndereco(e) {
  if (!e) return "";
  const parts = [e.logradouro, e.numero, e.bairro, e.cidade, e.estado, e.cep].filter(Boolean);
  return parts.join(", ");
}

export default function PontosColetaEmpresaPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [userId, setUserId] = useState(null);
  const [empresaId, setEmpresaId] = useState(null);
  const [pontos, setPontos] = useState([]);
  const [q, setQ] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // ponto sendo editado
  const [saving, setSaving] = useState(false);
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
    }
  });

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
        // resolve empresaId
        const resEmp = await api.get('/empresas');
        const empresas = Array.isArray(resEmp?.data?.data) ? resEmp.data.data : [];
        const found = empresas.find(e => Number(e.usuarioId) === Number(userId));
        if (found && active) setEmpresaId(found.id);
      } catch (e) {
        if (active) setError('Não foi possível carregar seus pontos de coleta.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [userId]);

  useEffect(() => {
    let active = true;
    async function loadPontos() {
      if (!empresaId) return;
      try {
        const res = await api.get(`/empresas/${empresaId}/pontos-coleta`);
        const data = Array.isArray(res?.data?.data) ? res.data.data : [];
        if (active) setPontos(data);
      } catch {}
    }
    loadPontos();
    return () => { active = false; };
  }, [empresaId]);

  const filtered = useMemo(() => {
    let items = [...pontos];
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      items = items.filter(p => (p.nomePonto || '').toLowerCase().includes(needle) || (formatEndereco(p.endereco)||'').toLowerCase().includes(needle));
    }
    return items;
  }, [pontos, q]);

  function openCreate() {
    setEditing(null);
    setForm({
      nomePonto: "",
      horarioFuncionamento: "",
      ativo: true,
      endereco: { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" }
    });
    setModalOpen(true);
  }
  function openEdit(p) {
    setEditing(p);
    setForm({
      nomePonto: p.nomePonto || "",
      horarioFuncionamento: p.horarioFuncionamento || "",
      ativo: p.ativo !== false,
      endereco: {
        cep: p.endereco?.cep || "",
        logradouro: p.endereco?.logradouro || "",
        numero: p.endereco?.numero || "",
        complemento: p.endereco?.complemento || "",
        bairro: p.endereco?.bairro || "",
        cidade: p.endereco?.cidade || "",
        estado: p.endereco?.estado || "",
      }
    });
    setModalOpen(true);
  }

  async function savePoint(e) {
    e?.preventDefault?.();
    try {
      setSaving(true); setError(""); setSuccess("");
      if (!empresaId) { setError('Empresa não identificada.'); return; }
      const payload = { ...form, ativo: !!form.ativo };
      if (!payload.nomePonto || !payload.endereco?.cep || !payload.endereco?.logradouro || !payload.endereco?.bairro || !payload.endereco?.cidade || !payload.endereco?.estado) {
        setError('Preencha os campos obrigatórios: nome, CEP, logradouro, bairro, cidade e estado.');
        return;
      }
      if (editing) {
        await api.patch(`/empresas/${empresaId}/pontos-coleta/${editing.id}`, payload);
        setSuccess('Ponto de coleta atualizado.');
      } else {
        await api.post(`/empresas/${empresaId}/pontos-coleta`, payload);
        setSuccess('Ponto de coleta criado.');
      }
      // refresh
      const res = await api.get(`/empresas/${empresaId}/pontos-coleta`);
      setPontos(Array.isArray(res?.data?.data) ? res.data.data : []);
      setModalOpen(false);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Falha ao salvar o ponto de coleta.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function deletePoint(p) {
    try {
      setError(""); setSuccess("");
      await api.delete(`/empresas/${empresaId}/pontos-coleta/${p.id}`);
      setSuccess('Ponto de coleta excluído.');
      setConfirmDel(null);
      const res = await api.get(`/empresas/${empresaId}/pontos-coleta`);
      setPontos(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Falha ao excluir o ponto de coleta.';
      setError(msg);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="container mx-auto max-w-6xl w-full px-4 md:px-6 pt-24 pb-12 flex-1">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-[color:#2d5016] text-2xl md:text-3xl font-semibold">Meus pontos de coleta</h1>
            <p className="text-zinc-600 mt-1 text-sm">Gerencie os locais de recebimento de resíduos da sua empresa</p>
          </div>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] text-white text-sm font-bold shadow hover:scale-[1.01] active:scale-[0.99]">
            <Plus size={16}/> Novo ponto
          </button>
        </div>

        {(error || success) && (
          <div className={`mb-6 rounded-2xl p-4 border-2 shadow-xl ${error ? 'border-red-200' : 'border-emerald-200'}`}>
            {error && <div className="flex items-center gap-3 text-red-700 text-sm"><AlertTriangle size={18} />{error}</div>}
            {success && <div className="flex items-center gap-3 text-emerald-700 text-sm"><CheckCircle2 size={18} />{success}</div>}
          </div>
        )}

        <section className="bg-white rounded-2xl shadow-xl border border-zinc-100 p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#2d5016] mb-1">Buscar</label>
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
                <Search size={16} className="text-zinc-500" />
                <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Nome do ponto ou endereço" className="flex-1 outline-none text-sm" />
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-48 shadow animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-zinc-600 shadow">Nenhum ponto cadastrado ainda.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map(p => (
              <article key={p.id} className="bg-white rounded-2xl shadow border-2 overflow-hidden">
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.ativo !== false ? 'bg-emerald-500 text-white' : 'bg-zinc-300 text-zinc-700'}`}>{p.ativo !== false ? 'Ativo' : 'Inativo'}</span>
                    <span className="inline-flex items-center gap-1 text-[#2d5016] text-xs font-semibold"><Building2 size={14}/> #{p.id}</span>
                  </div>
                  <h3 className="text-[#2d5016] font-semibold leading-snug line-clamp-2">{p.nomePonto}</h3>
                  <div className="text-sm text-zinc-700 flex items-start gap-2"><MapPin size={16} className="mt-0.5"/>{formatEndereco(p.endereco)}</div>
                  {p.horarioFuncionamento && (
                    <div className="text-sm text-zinc-700 flex items-center gap-2"><Clock size={16}/> {p.horarioFuncionamento}</div>
                  )}
                  <div className="pt-2 flex gap-2 justify-end">
                    <button onClick={()=>openEdit(p)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-300 text-zinc-700 text-sm font-bold hover:bg-zinc-50"><Pencil size={16}/> Editar</button>
                    <button onClick={()=>setConfirmDel(p)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-300 text-red-700 text-sm font-bold hover:bg-red-50"><Trash2 size={16}/> Excluir</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Modal create/edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#2d5016] font-semibold">{editing? 'Editar ponto de coleta':'Novo ponto de coleta'}</div>
              <button onClick={()=>setModalOpen(false)} className="text-zinc-500 hover:text-zinc-700">✕</button>
            </div>
            <form onSubmit={savePoint} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2d5016] mb-1">Nome do ponto</label>
                  <input value={form.nomePonto} onChange={e=>setForm(f=>({...f, nomePonto:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.ativo} onChange={e=>setForm(f=>({...f, ativo:e.target.checked}))} />
                  Ativo
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2d5016] mb-1">Horário de funcionamento</label>
                <input value={form.horarioFuncionamento} onChange={e=>setForm(f=>({...f, horarioFuncionamento:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Ex.: Seg a Sex, 9h às 18h" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2d5016] mb-1">CEP</label>
                  <input value={form.endereco.cep} onChange={e=>setForm(f=>({...f, endereco:{...f.endereco, cep:e.target.value}}))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2d5016] mb-1">Logradouro</label>
                  <input value={form.endereco.logradouro} onChange={e=>setForm(f=>({...f, endereco:{...f.endereco, logradouro:e.target.value}}))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2d5016] mb-1">Número</label>
                  <input value={form.endereco.numero} onChange={e=>setForm(f=>({...f, endereco:{...f.endereco, numero:e.target.value}}))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2d5016] mb-1">Complemento</label>
                  <input value={form.endereco.complemento} onChange={e=>setForm(f=>({...f, endereco:{...f.endereco, complemento:e.target.value}}))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2d5016] mb-1">Bairro</label>
                  <input value={form.endereco.bairro} onChange={e=>setForm(f=>({...f, endereco:{...f.endereco, bairro:e.target.value}}))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2d5016] mb-1">Cidade</label>
                  <input value={form.endereco.cidade} onChange={e=>setForm(f=>({...f, endereco:{...f.endereco, cidade:e.target.value}}))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2d5016] mb-1">Estado</label>
                  <input value={form.endereco.estado} onChange={e=>setForm(f=>({...f, endereco:{...f.endereco, estado:e.target.value}}))} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="UF" />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={()=>setModalOpen(false)} className="px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700">Cancelar</button>
                <button disabled={saving} type="submit" className={`px-4 py-2 rounded-lg text-white font-bold ${saving ? 'bg-zinc-400' : 'bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] shadow'}`}>{saving ? 'Salvando...' : (editing ? 'Salvar alterações' : 'Criar ponto')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDel && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-[#2d5016] font-semibold">Excluir ponto de coleta</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-zinc-700">Tem certeza que deseja excluir o ponto "{confirmDel?.nomePonto}"?</p>
              <div className="flex justify-end gap-3">
                <button onClick={()=>setConfirmDel(null)} className="px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700">Cancelar</button>
                <button onClick={()=>deletePoint(confirmDel)} className="px-4 py-2 rounded-lg text-white font-bold bg-red-600">Excluir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
