"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/header";
import api from "@/utils/axios";
import { Building2, MapPin, Clock, Plus, Pencil, Trash2, Search, AlertTriangle, CheckCircle2, QrCode } from "lucide-react";

function formatEndereco(e) {
  if (!e) return "";
  const parts = [e.logradouro, e.numero, e.bairro, e.cidade, e.estado, e.cep].filter(Boolean);
  return parts.join(", ");
}

const COLORS = [
  'bg-red-100 text-red-800 border-red-200',
  'bg-orange-100 text-orange-800 border-orange-200',
  'bg-amber-100 text-amber-800 border-amber-200',
  'bg-yellow-100 text-yellow-800 border-yellow-200',
  'bg-lime-100 text-lime-800 border-lime-200',
  'bg-green-100 text-green-800 border-green-200',
  'bg-emerald-100 text-emerald-800 border-emerald-200',
  'bg-teal-100 text-teal-800 border-teal-200',
  'bg-cyan-100 text-cyan-800 border-cyan-200',
  'bg-sky-100 text-sky-800 border-sky-200',
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-indigo-100 text-indigo-800 border-indigo-200',
  'bg-violet-100 text-violet-800 border-violet-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
  'bg-pink-100 text-pink-800 border-pink-200',
  'bg-rose-100 text-rose-800 border-rose-200',
  'bg-slate-100 text-slate-800 border-slate-200',
  'bg-stone-100 text-stone-800 border-stone-200',
];

function getResiduoColor(id) {
  if (!id) return `border ${COLORS[0]}`;
  return `border ${COLORS[id % COLORS.length]}`;
}

export default function PontosColetaEmpresaPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [userId, setUserId] = useState(null);
  const [empresaId, setEmpresaId] = useState(null);
  const [pontos, setPontos] = useState([]);
  const [tiposResiduo, setTiposResiduo] = useState([]);
  const [q, setQ] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // ponto sendo editado
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [viewCode, setViewCode] = useState(null); // ponto para ver código

  const [form, setForm] = useState({
    nomePonto: "",
    horarioFuncionamento: "",
    ativo: true,
    itensAceitos: [], // IDs dos tipos de resíduo
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
      const token = typeof window !== 'undefined' ? (localStorage.getItem('accessToken') || localStorage.getItem('token')) : null;
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
        
        // Buscar empresa do usuário logado
        const empRes = await api.get('/empresas/me');
        const empresa = empRes?.data?.data;

        if (empresa && active) {
          setEmpresaId(empresa.id);
          setUserId(empresa.usuarioId);
        }

        // Buscar tipos de resíduo
        const tiposRes = await api.get('/tipos-residuo');
        if (active) {
          setTiposResiduo(Array.isArray(tiposRes?.data?.data) ? tiposRes.data.data : []);
        }
      } catch (e) {
        if (active) setError('Não foi possível carregar seus dados de empresa.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

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
      itensAceitos: [],
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
      itensAceitos: p.tiposResiduosAceitos ? p.tiposResiduosAceitos.map(t => t.id) : [],
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

  function toggleTipoResiduo(id) {
    setForm(prev => {
      const current = prev.itensAceitos || [];
      if (current.includes(id)) {
        return { ...prev, itensAceitos: current.filter(x => x !== id) };
      } else {
        return { ...prev, itensAceitos: [...current, id] };
      }
    });
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

  async function fetchDailyCode(ponto) {
    try {
      setError("");
      const res = await api.get(`/empresas/${empresaId}/pontos-coleta/${ponto.id}/codigo-diario`);
      const codeData = res?.data?.data;
      if (codeData) {
        setViewCode({ ponto, code: codeData.codigo, points: codeData.pontosValor });
      } else {
        alert("Código não encontrado para hoje.");
      }
    } catch (e) {
      alert(e?.response?.data?.message || "Erro ao buscar código diário.");
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      
      <main className="container mx-auto max-w-6xl w-full px-4 md:px-6 pt-0 pb-12 flex-1">
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
                  {p.tiposResiduosAceitos && p.tiposResiduosAceitos.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.tiposResiduosAceitos.map(t => (
                        <span key={t.id} className={`text-xs px-2 py-1 rounded-full font-medium ${getResiduoColor(t.id)}`}>
                          {t.nome}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="pt-2 flex gap-2 justify-end">
                    <button onClick={()=>fetchDailyCode(p)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-300 text-emerald-700 text-sm font-bold hover:bg-emerald-50" title="Ver código do dia"><QrCode size={16}/> Código</button>
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

              <div>
                <label className="block text-sm font-medium text-[#2d5016] mb-2">Itens aceitos</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                  {tiposResiduo.map(t => (
                    <label key={t.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-zinc-50 p-1 rounded text-zinc-800">
                      <input 
                        type="checkbox" 
                        checked={form.itensAceitos?.includes(t.id)} 
                        onChange={() => toggleTipoResiduo(t.id)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="truncate" title={t.nome}>{t.nome}</span>
                    </label>
                  ))}
                </div>
                {tiposResiduo.length === 0 && <p className="text-xs text-zinc-500 mt-1">Nenhum tipo de resíduo cadastrado no sistema.</p>}
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

      {/* View Code Modal */}
      {viewCode && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-100">
            <div className="bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] p-6 text-center relative">
              <button onClick={()=>setViewCode(null)} className="absolute top-4 right-4 text-white/80 hover:text-white">✕</button>
              <h3 className="text-white font-bold text-lg mb-1">Código do Dia</h3>
              <p className="text-emerald-100 text-sm">{viewCode.ponto.nomePonto}</p>
            </div>
            <div className="p-8 flex flex-col items-center space-y-6">
              <div className="text-center space-y-2">
                <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Código de Validação</span>
                <div className="text-4xl font-mono font-bold text-zinc-800 tracking-widest border-2 border-dashed border-zinc-300 px-6 py-3 rounded-xl bg-zinc-50">
                  {viewCode.code}
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium">
                <CheckCircle2 size={16} />
                Vale {viewCode.points} pontos
              </div>

              <p className="text-center text-xs text-zinc-500 max-w-[200px]">
                Forneça este código aos usuários que realizarem o descarte correto hoje.
              </p>

              <button onClick={()=>setViewCode(null)} className="w-full py-3 rounded-xl bg-zinc-100 text-zinc-700 font-bold hover:bg-zinc-200 transition">
                Fechar
              </button>
            </div>
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
