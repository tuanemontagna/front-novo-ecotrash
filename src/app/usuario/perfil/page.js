"use client";

import { useEffect, useState, useMemo } from "react";
import Header from "@/components/header";
import api from "@/utils/axios";
import { AlertTriangle, CheckCircle2, MapPin, Plus, Pencil, Trash2, Gift, Sparkles, History, RefreshCcw, Loader2 } from "lucide-react";

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

function formatDate(d) {
  if (!d) return '-';
  try { return new Intl.DateTimeFormat('pt-BR').format(new Date(d)); } catch { return d; }
}

export default function UsuarioPerfilPage() {
  const [usuario, setUsuario] = useState(null);
  const [enderecos, setEnderecos] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [campanhas, setCampanhas] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalEnderecoOpen, setModalEnderecoOpen] = useState(false);
  const [editingEndereco, setEditingEndereco] = useState(null);
  const [savingEndereco, setSavingEndereco] = useState(false);
  const [formEndereco, setFormEndereco] = useState({
    apelidoEndereco: "",
    isPrincipal: false,
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    complemento: ""
  });

  const userIdMemo = useMemo(() => decodeJwtId(), []);

  async function loadAll() {
    try {
      setLoading(true); setError("");
      // usuario/me
      try {
        const meRes = await api.get('/usuarios/me');
        setUsuario(meRes?.data?.data || null);
      } catch {
        // fallback by decoded id
        if (userIdMemo) {
          const usr = await api.get(`/usuarios/${userIdMemo}`);
          setUsuario(usr?.data?.data || null);
        }
      }
      const id = userIdMemo || usuario?.id;
      if (id) {
        // saldo e transações
        try {
          const saldoRes = await api.get(`/usuarios/${id}/saldo`);
          setSaldo(Number(saldoRes?.data?.saldo) || 0);
        } catch {}
        try {
          const txRes = await api.get(`/usuarios/${id}/transacoes-pontos`);
          setTransacoes(Array.isArray(txRes?.data?.data) ? txRes.data.data : []);
        } catch {}
        try {
          const endRes = await api.get(`/usuarios/${id}/enderecos`);
          setEnderecos(Array.isArray(endRes?.data?.data) ? endRes.data.data : []);
        } catch {}
        try {
          const vRes = await api.get(`/usuarios/${id}/vouchers-resgatados`);
          setVouchers(Array.isArray(vRes?.data?.data) ? vRes.data.data : []);
        } catch {}
        try {
          const cRes = await api.get(`/usuarios/${id}/campanhas-apoiadas`);
          setCampanhas(Array.isArray(cRes?.data?.data) ? cRes.data.data : []);
        } catch {}
      }
    } catch (e) {
      setError('Falha ao carregar perfil.');
    } finally { setLoading(false); }
  }

  useEffect(() => { loadAll(); }, []);

  function formatEndereco(e) {
    if (!e) return '';
    const parts = [e.logradouro, e.numero, e.bairro, e.cidade, e.estado, e.cep].filter(Boolean);
    return parts.join(', ');
  }

  function openNovoEndereco() {
    setEditingEndereco(null);
    setFormEndereco({ apelidoEndereco: "", isPrincipal: false, logradouro: "", numero: "", bairro: "", cidade: "", estado: "", cep: "", complemento: "" });
    setModalEnderecoOpen(true);
  }
  function openEditEndereco(e) {
    setEditingEndereco(e);
    setFormEndereco({
      apelidoEndereco: e.apelidoEndereco || "",
      isPrincipal: !!e.isPrincipal,
      logradouro: e.logradouro || "",
      numero: e.numero || "",
      bairro: e.bairro || "",
      cidade: e.cidade || "",
      estado: e.estado || "",
      cep: e.cep || "",
      complemento: e.complemento || ""
    });
    setModalEnderecoOpen(true);
  }

  async function salvarEndereco(e) {
    e?.preventDefault?.();
    const id = usuario?.id || userIdMemo;
    if (!id) return;
    try {
      setSavingEndereco(true); setError(""); setSuccess("");
      if (editingEndereco) {
        await api.patch(`/usuario/${id}/enderecos/${editingEndereco.id}`, formEndereco);
        setSuccess('Endereço atualizado.');
      } else {
        await api.post(`/usuarios/${id}/enderecos`, formEndereco);
        setSuccess('Endereço adicionado.');
      }
      setModalEnderecoOpen(false);
      await loadAll();
    } catch (e) {
      setError(e?.response?.data?.message || 'Erro ao salvar endereço.');
    } finally { setSavingEndereco(false); }
  }

  async function removerEndereco(e) {
    const id = usuario?.id || userIdMemo;
    if (!id || !e?.id) return;
    try {
      setError(""); setSuccess("");
      await api.delete(`/usuario/${id}/enderecos/${e.id}`);
      setSuccess('Endereço removido.');
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao remover endereço.');
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="container mx-auto max-w-6xl w-full px-4 md:px-6 pt-24 pb-16 flex-1">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#2d5016]">Perfil do Usuário</h1>
            <p className="text-zinc-600 mt-2 text-sm">Gerencie seus dados, endereços e acompanhe seus pontos e atividades.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white border border-zinc-200 rounded-2xl shadow p-4 min-w-[160px] text-center">
              <div className="text-xs text-zinc-600 mb-1">Saldo de Pontos</div>
              <div className="text-2xl font-bold text-[#2d5016]">{saldo}</div>
            </div>
            <button onClick={loadAll} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] text-white text-sm font-semibold shadow"><RefreshCcw size={16}/> Atualizar</button>
          </div>
        </div>

        {(error || success) && (
          <div className={`mb-8 rounded-2xl p-4 border-2 shadow ${error? 'border-red-200':'border-emerald-200'}`}> 
            {error && <div className="flex items-center gap-2 text-red-700 text-sm"><AlertTriangle size={16}/> {error}</div>}
            {success && <div className="flex items-center gap-2 text-emerald-700 text-sm"><CheckCircle2 size={16}/> {success}</div>}
          </div>
        )}

        {/* Dados principais */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow overflow-hidden">
            <div className="p-6">
              {loading && !usuario ? (
                <div className="h-24 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-500"/></div>
              ) : usuario ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-lg font-semibold text-[#2d5016] mb-2">Informações</h2>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium text-zinc-700">Nome:</span> {usuario.nome}</p>
                      <p><span className="font-medium text-zinc-700">Email:</span> {usuario.email}</p>
                      <p><span className="font-medium text-zinc-700">Telefone:</span> {usuario.telefone || '-'}</p>
                      <p><span className="font-medium text-zinc-700">Tipo:</span> {usuario.tipoUsuario || '-'}</p>
                      <p><span className="font-medium text-zinc-700">CPF:</span> {usuario.cpf || '-'}</p>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#2d5016] mb-2">Atividades</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-emerald-50 rounded-xl p-4 text-center">
                        <div className="text-xs text-emerald-700">Vouchers</div>
                        <div className="text-xl font-bold text-emerald-800">{vouchers.length}</div>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-4 text-center">
                        <div className="text-xs text-amber-700">Campanhas</div>
                        <div className="text-xl font-bold text-amber-800">{campanhas.length}</div>
                      </div>
                      <div className="bg-indigo-50 rounded-xl p-4 text-center col-span-2">
                        <div className="text-xs text-indigo-700">Transações de Pontos</div>
                        <div className="text-xl font-bold text-indigo-800">{transacoes.length}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="p-6 text-zinc-600 text-sm">Usuário não encontrado.</p>
              )}
            </div>
          </div>
        </section>

        {/* Endereços */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#2d5016]">Endereços</h2>
            <button onClick={openNovoEndereco} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] text-white text-sm font-semibold shadow"><Plus size={16}/> Novo Endereço</button>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({length:4}).map((_,i)=>(<div key={i} className="h-32 bg-white rounded-2xl shadow animate-pulse"/>))}
              </div>
            ) : enderecos.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-zinc-600 shadow border border-zinc-200">Nenhum endereço cadastrado.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enderecos.map(e => (
                  <div key={e.id} className="bg-white rounded-2xl shadow border border-zinc-200 p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-[#48742c]"/>
                        <span className="text-sm font-medium text-zinc-700">{e.apelidoEndereco || 'Endereço'}</span>
                      </div>
                      {e.isPrincipal && <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">Principal</span>}
                    </div>
                    <p className="text-sm text-zinc-700 flex-1">{formatEndereco(e)}</p>
                    {e.complemento && <p className="text-xs text-zinc-500 mt-1">{e.complemento}</p>}
                    <div className="pt-3 mt-3 border-t border-zinc-200 flex gap-2 justify-end">
                      <button onClick={()=>openEditEndereco(e)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-300 text-zinc-700 text-xs font-semibold hover:bg-zinc-50"><Pencil size={14}/>Editar</button>
                      <button onClick={()=>removerEndereco(e)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-300 text-red-700 text-xs font-semibold hover:bg-red-50"><Trash2 size={14}/>Remover</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Transações de Pontos */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[#2d5016] mb-4">Histórico de Pontos</h2>
          <div className="bg-white rounded-2xl border border-zinc-200 shadow overflow-hidden">
            <table className="w-full text-sm text-zinc-800">
              <thead className="bg-zinc-50 text-zinc-800">
                <tr>
                  <th className="text-left font-medium px-4 py-2">Data</th>
                  <th className="text-left font-medium px-4 py-2">Tipo</th>
                  <th className="text-left font-medium px-4 py-2">Descrição</th>
                  <th className="text-left font-medium px-4 py-2">Pontos</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-zinc-500">Carregando...</td></tr>
                ) : transacoes.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-zinc-500">Nenhuma transação.</td></tr>
                ) : transacoes.map(t => (
                  <tr key={t.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                    <td className="px-4 py-2">{formatDate(t.data_transacao)}</td>
                    <td className="px-4 py-2 uppercase text-xs font-semibold text-zinc-700">{t.tipoTransacao}</td>
                    <td className="px-4 py-2 text-zinc-700">{t.descricao || '-'}</td>
                    <td className={`px-4 py-2 font-medium ${Number(t.pontos) >= 0 ? 'text-emerald-700':'text-red-600'}`}>{t.pontos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Vouchers Resgatados & Campanhas */}
        <section className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-[#2d5016] mb-4">Vouchers Resgatados</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({length:4}).map((_,i)=>(<div key={i} className="h-32 bg-white rounded-2xl shadow animate-pulse"/>))}
                </div>
              ) : vouchers.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center text-zinc-600 shadow border border-zinc-200">Nenhum voucher resgatado.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {vouchers.map(v => (
                    <div key={v.id} className="bg-white rounded-2xl shadow border border-emerald-200 p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm"><Gift size={16}/> {v.voucher?.titulo || 'Voucher'}</div>
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">{v.pontosGastos} pts</span>
                      </div>
                      <p className="text-xs text-zinc-600">Código: {v.codigoVoucherGerado}</p>
                      <p className="text-xs text-zinc-600 mt-1">Resgatado em {formatDate(v.data_resgate)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#2d5016] mb-4">Campanhas Apoiadas</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({length:4}).map((_,i)=>(<div key={i} className="h-32 bg-white rounded-2xl shadow animate-pulse"/>))}
                </div>
              ) : campanhas.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center text-zinc-600 shadow border border-zinc-200">Nenhuma campanha apoiada.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {campanhas.map(c => (
                    <div key={c.id} className="bg-white rounded-2xl shadow border border-amber-200 p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm"><Sparkles size={16}/> {c.titulo}</div>
                        {c.pontosPorAdesao > 0 && <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">+{c.pontosPorAdesao} pts</span>}
                      </div>
                      <p className="text-xs text-zinc-600">Início: {formatDate(c.dataInicio)} | Fim: {formatDate(c.dataFim)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Modal de Endereço */}
        {modalEnderecoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
              <h3 className="text-lg font-semibold text-[#2d5016] mb-4">{editingEndereco? 'Editar Endereço':'Novo Endereço'}</h3>
              <form onSubmit={salvarEndereco} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#2d5016] mb-1">Apelido</label>
                    <input value={formEndereco.apelidoEndereco} onChange={e=>setFormEndereco(f=>({...f,apelidoEndereco:e.target.value}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" placeholder="Casa, Trabalho..." />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input type="checkbox" checked={formEndereco.isPrincipal} onChange={e=>setFormEndereco(f=>({...f,isPrincipal:e.target.checked}))} />
                    <span className="text-xs font-medium text-zinc-700">Principal</span>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-[#2d5016] mb-1">Logradouro</label>
                    <input value={formEndereco.logradouro} onChange={e=>setFormEndereco(f=>({...f,logradouro:e.target.value}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#2d5016] mb-1">Número</label>
                    <input value={formEndereco.numero} onChange={e=>setFormEndereco(f=>({...f,numero:e.target.value}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#2d5016] mb-1">Bairro</label>
                    <input value={formEndereco.bairro} onChange={e=>setFormEndereco(f=>({...f,bairro:e.target.value}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#2d5016] mb-1">Cidade</label>
                    <input value={formEndereco.cidade} onChange={e=>setFormEndereco(f=>({...f,cidade:e.target.value}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#2d5016] mb-1">Estado</label>
                    <input value={formEndereco.estado} onChange={e=>setFormEndereco(f=>({...f,estado:e.target.value}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#2d5016] mb-1">CEP</label>
                    <input value={formEndereco.cep} onChange={e=>setFormEndereco(f=>({...f,cep:e.target.value}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-[#2d5016] mb-1">Complemento</label>
                    <input value={formEndereco.complemento} onChange={e=>setFormEndereco(f=>({...f,complemento:e.target.value}))} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={()=>setModalEnderecoOpen(false)} className="px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700 text-sm">Cancelar</button>
                  <button disabled={savingEndereco} type="submit" className={`px-4 py-2 rounded-lg text-white text-sm font-bold ${savingEndereco? 'bg-zinc-400':'bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] shadow'}`}>{savingEndereco? 'Salvando...':(editingEndereco?'Salvar alterações':'Adicionar')}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
