"use client";

import { useEffect, useState } from "react";
import Header from "@/components/header";
import api from "@/utils/axios";
import { Building2, MapPin, AlertTriangle, CheckCircle2, Pencil, Trash2, Plus, Leaf, Loader2, RefreshCcw, Users, Sparkles } from "lucide-react";

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

function formatEndereco(e) {
  if (!e) return '';
  const parts = [e.logradouro, e.numero, e.bairro, e.cidade, e.estado, e.cep].filter(Boolean);
  return parts.join(', ');
}

export default function EmpresaPerfilPage() {
  const [empresa, setEmpresa] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tiposResiduos, setTiposResiduos] = useState([]);
  const [campanhas, setCampanhas] = useState([]);

  // associação de tipo de resíduo
  const [modalTipoOpen, setModalTipoOpen] = useState(false);
  const [modalCampanhaOpen, setModalCampanhaOpen] = useState(false);
  const [tiposDisponiveis, setTiposDisponiveis] = useState([]);
  const [campanhasDisponiveis, setCampanhasDisponiveis] = useState([]);
  const [tipoSelecionado, setTipoSelecionado] = useState("");
  const [campanhaSelecionada, setCampanhaSelecionada] = useState("");
  const [savingAssociacao, setSavingAssociacao] = useState(false);

  async function loadAll() {
    try {
      setLoading(true); setError("");
      // resolve usuario base
      let userId;
      try {
        const me = await api.get('/usuarios/me');
        if (me?.data?.data?.id) {
          userId = me.data.data.id;
          setUsuario(me.data.data);
        }
      } catch {
        userId = decodeJwtId();
      }
      // carregar lista completa de empresas e achar vinculada ao usuario
      if (userId) {
        const empRes = await api.get('/empresas');
        const lista = Array.isArray(empRes?.data?.data) ? empRes.data.data : [];
        const found = lista.find(e => Number(e.usuarioId) === Number(userId));
        if (found) {
          // buscar empresa completa
          const det = await api.get(`/empresas/${found.id}`);
          const data = det?.data?.data || found;
          setEmpresa(data);
          setTiposResiduos(Array.isArray(data.tiposResiduosAceitos) ? data.tiposResiduosAceitos : []);
          setCampanhas(Array.isArray(data.campanhas) ? data.campanhas : []);
        }
      }
      // carregar opções disponíveis para associação
      try {
        const tiposRes = await api.get('/tipos-residuo');
        setTiposDisponiveis(Array.isArray(tiposRes?.data?.data) ? tiposRes.data.data : []);
      } catch {}
      try {
        const campRes = await api.get('/campanhas');
        setCampanhasDisponiveis(Array.isArray(campRes?.data?.data) ? campRes.data.data : []);
      } catch {}
    } catch (e) {
      setError('Falha ao carregar perfil da empresa.');
    } finally { setLoading(false); }
  }

  useEffect(() => { loadAll(); }, []);

  async function associarTipo(e) {
    e?.preventDefault?.();
    if (!empresa?.id || !tipoSelecionado) return;
    try {
      setSavingAssociacao(true); setError(""); setSuccess("");
      await api.post(`/empresas/${empresa.id}/tipos-residuo`, { tipoResiduoId: tipoSelecionado });
      setSuccess('Tipo de resíduo associado.');
      setModalTipoOpen(false); setTipoSelecionado("");
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao associar tipo.');
    } finally { setSavingAssociacao(false); }
  }

  async function associarCampanha(e) {
    e?.preventDefault?.();
    if (!empresa?.id || !campanhaSelecionada) return;
    try {
      setSavingAssociacao(true); setError(""); setSuccess("");
      await api.post(`/empresas/${empresa.id}/campanhas`, { campanhaId: campanhaSelecionada });
      setSuccess('Campanha associada à empresa.');
      setModalCampanhaOpen(false); setCampanhaSelecionada("");
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao associar campanha.');
    } finally { setSavingAssociacao(false); }
  }

  async function removerCampanha(c) {
    if (!empresa?.id || !c?.id) return;
    try {
      setError(""); setSuccess("");
      await api.delete(`/empresas/${empresa.id}/campanhas/${c.id}`);
      setSuccess('Campanha removida.');
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao remover campanha.');
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="container mx-auto max-w-6xl w-full px-4 md:px-6 pt-24 pb-16 flex-1">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#2d5016]">Perfil da Empresa</h1>
            <p className="text-zinc-600 mt-2 text-sm">Gerencie informações, tipos de resíduos aceitos e campanhas vinculadas.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={loadAll} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] text-white text-sm font-semibold shadow"><RefreshCcw size={16}/> Atualizar</button>
          </div>
        </div>

        {(error || success) && (
          <div className={`mb-8 rounded-2xl p-4 border-2 shadow ${error? 'border-red-200':'border-emerald-200'}`}> 
            {error && <div className="flex items-center gap-2 text-red-700 text-sm"><AlertTriangle size={16}/> {error}</div>}
            {success && <div className="flex items-center gap-2 text-emerald-700 text-sm"><CheckCircle2 size={16}/> {success}</div>}
          </div>
        )}

        {/* Dados da empresa */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow overflow-hidden">
            <div className="p-6">
              {loading && !empresa ? (
                <div className="h-24 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-500"/></div>
              ) : empresa ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-lg font-semibold text-[#2d5016] mb-2">Informações</h2>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium text-zinc-700">Razão Social:</span> {empresa.razaoSocial}</p>
                      <p><span className="font-medium text-zinc-700">Nome Fantasia:</span> {empresa.nomeFantasia || '-'}</p>
                      <p><span className="font-medium text-zinc-700">CNPJ:</span> {empresa.cnpj}</p>
                      <p><span className="font-medium text-zinc-700">Telefone:</span> {usuario?.telefone || '-'}</p>
                      <p><span className="font-medium text-zinc-700">Email:</span> {usuario?.email || '-'}</p>
                      <p><span className="font-medium text-zinc-700">Endereço:</span> {formatEndereco(empresa.endereco) || '-'}</p>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#2d5016] mb-2">Indicadores</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-emerald-50 rounded-xl p-4 text-center">
                        <div className="text-xs text-emerald-700">Tipos Aceitos</div>
                        <div className="text-xl font-bold text-emerald-800">{tiposResiduos.length}</div>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-4 text-center">
                        <div className="text-xs text-amber-700">Campanhas</div>
                        <div className="text-xl font-bold text-amber-800">{campanhas.length}</div>
                      </div>
                      <div className="bg-indigo-50 rounded-xl p-4 text-center col-span-2">
                        <div className="text-xs text-indigo-700">Usuário Vinculado</div>
                        <div className="text-xl font-bold text-indigo-800">{usuario?.nome || '-'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="p-6 text-zinc-600 text-sm">Empresa não encontrada para este usuário.</p>
              )}
            </div>
          </div>
        </section>

        {/* Tipos de Resíduo Aceitos */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#2d5016]">Tipos de Resíduo Aceitos</h2>
            <button onClick={()=>setModalTipoOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] text-white text-sm font-semibold shadow"><Plus size={16}/> Associar Tipo</button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({length:4}).map((_,i)=>(<div key={i} className="h-24 bg-white rounded-2xl shadow animate-pulse"/>))}
            </div>
          ) : tiposResiduos.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-zinc-600 shadow border border-zinc-200">Nenhum tipo associado.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tiposResiduos.map(t => (
                <div key={t.id} className="bg-white rounded-2xl shadow border border-emerald-200 p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-2 text-emerald-700 font-semibold text-sm"><Leaf size={16}/> {t.nome}</div>
                  <p className="text-xs text-zinc-600 flex-1">{t.descricao || 'Sem descrição.'}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Campanhas Associadas */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#2d5016]">Campanhas</h2>
            <button onClick={()=>setModalCampanhaOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] text-white text-sm font-semibold shadow"><Plus size={16}/> Associar Campanha</button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({length:4}).map((_,i)=>(<div key={i} className="h-24 bg-white rounded-2xl shadow animate-pulse"/>))}
            </div>
          ) : campanhas.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-zinc-600 shadow border border-zinc-200">Nenhuma campanha vinculada.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campanhas.map(c => (
                <div key={c.id} className="bg-white rounded-2xl shadow border border-amber-200 p-5 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm"><Sparkles size={16}/> {c.titulo}</div>
                    <button onClick={()=>removerCampanha(c)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-red-300 text-red-700 text-xs font-semibold hover:bg-red-50"><Trash2 size={14}/>Remover</button>
                  </div>
                  <p className="text-xs text-zinc-600 flex-1">{c.descricao || 'Sem descrição.'}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Modais */}
        {modalTipoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-[#2d5016] mb-4">Associar Tipo de Resíduo</h3>
              <form onSubmit={associarTipo} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#2d5016] mb-1">Selecione</label>
                  <select value={tipoSelecionado} onChange={e=>setTipoSelecionado(e.target.value)} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm">
                    <option value="">-- escolher --</option>
                    {tiposDisponiveis.filter(t=> !tiposResiduos.some(a=>a.id===t.id)).map(t => (
                      <option key={t.id} value={t.id}>{t.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={()=>setModalTipoOpen(false)} className="px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700 text-sm">Cancelar</button>
                  <button disabled={savingAssociacao || !tipoSelecionado} type="submit" className={`px-4 py-2 rounded-lg text-white text-sm font-bold ${(savingAssociacao||!tipoSelecionado)? 'bg-zinc-400':'bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] shadow'}`}>{savingAssociacao? 'Salvando...':'Associar'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {modalCampanhaOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-[#2d5016] mb-4">Associar Campanha</h3>
              <form onSubmit={associarCampanha} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#2d5016] mb-1">Selecione</label>
                  <select value={campanhaSelecionada} onChange={e=>setCampanhaSelecionada(e.target.value)} className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm">
                    <option value="">-- escolher --</option>
                    {campanhasDisponiveis.filter(c=> !campanhas.some(a=>a.id===c.id)).map(c => (
                      <option key={c.id} value={c.id}>{c.titulo}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={()=>setModalCampanhaOpen(false)} className="px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700 text-sm">Cancelar</button>
                  <button disabled={savingAssociacao || !campanhaSelecionada} type="submit" className={`px-4 py-2 rounded-lg text-white text-sm font-bold ${(savingAssociacao||!campanhaSelecionada)? 'bg-zinc-400':'bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] shadow'}`}>{savingAssociacao? 'Salvando...':'Associar'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
