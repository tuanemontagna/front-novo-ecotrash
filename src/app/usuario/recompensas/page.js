"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Gift, History, AlertTriangle } from "lucide-react";
import api from "@/utils/axios";
import Header from "@/components/header";

function currencyDate(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("pt-BR").format(d);
  } catch {
    return dateStr;
  }
}

function ProgressBar({ value }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-zinc-600">Progresso para o próximo nível</span>
        <span className="text-sm text-zinc-600">{Math.min(100, Math.max(0, Math.round(value)))}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-zinc-200 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#48742c] to-[#5d8f3a] transition-[width] duration-300"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

export default function RecompensasPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [success, setSuccess] = useState("");
  const [redeemingId, setRedeemingId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [pontosUsuario, setPontosUsuario] = useState(0);
  const [historico, setHistorico] = useState([]);
  const [codeModal, setCodeModal] = useState({ open: false, code: "", title: "" });
  const [isAuthed, setIsAuthed] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [redeemingCode, setRedeemingCode] = useState(false);

  const proximoNivel = 2000;
  const progresso = useMemo(() => (pontosUsuario / proximoNivel) * 100, [pontosUsuario]);

  useEffect(() => {
    let active = true;
    function decodeJwtId() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) return null;
        const payload = token.split('.')[1];
        const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const json = JSON.parse(atob(b64));
        return json?.id ?? null;
      } catch {
        return null;
      }
    }

    async function load() {
      try {
        setLoading(true);
        setError("");
        // carrega vouchers públicos
        const resV = await api.get("/vouchers");
        const vouchersData = Array.isArray(resV?.data?.data) ? resV.data.data : [];
        if (active) setVouchers(vouchersData);

        // tenta buscar usuário autenticado (me); fallback para decode do token
        try {
          const resMe = await api.get('/usuarios/me');
          const u = resMe?.data?.data;
          if (u && active) {
            setUserId(u.id);
            setPontosUsuario(Number(u.saldoPontos || 0));
            setUserName(u.nome || "");
            setIsAuthed(true);
            try { if (typeof window !== 'undefined') localStorage.setItem('userName', u.nome || 'Usuário'); } catch {}
            const resHist = await api.get(`/usuarios/${u.id}/vouchers-resgatados`);
            const histData = Array.isArray(resHist?.data?.data) ? resHist.data.data : [];
            if (active) setHistorico(histData);
          }
        } catch {
          const id = decodeJwtId();
          if (id) {
            setIsAuthed(true);
            if (active) setUserId(id);
            const [resU, resHist] = await Promise.all([
              api.get(`/usuarios/${id}`),
              api.get(`/usuarios/${id}/vouchers-resgatados`),
            ]);
            const u = resU?.data?.data;
            if (u && active) {
              setPontosUsuario(Number(u.saldoPontos || 0));
              setUserName(u.nome || "");
              try { if (typeof window !== 'undefined') localStorage.setItem('userName', u.nome || 'Usuário'); } catch {}
            }
            const histData = Array.isArray(resHist?.data?.data) ? resHist.data.data : [];
            if (active) setHistorico(histData);
          } else {
            setIsAuthed(false);
          }
        }
      } catch (err) {
        if (active) setError("Não foi possível carregar as recompensas.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  function isDisponivel(v) {
    const qtd = typeof v.quantidadeDisponivel === "number" ? v.quantidadeDisponivel : Infinity;
    const validadeOk = !v.validade || new Date(v.validade) >= new Date();
    return qtd > 0 && validadeOk;
  }

  async function handleRedeem(v) {
    try {
      setError("");
      setSuccess("");
      setRedeemingId(v.id);
      const res = await api.post(`/vouchers/${v.id}/resgates`);
  const code = res?.data?.data?.usuarioVoucher?.codigoVoucherGerado;
      const novoSaldo = res?.data?.data?.saldoPontosAtual;
      const returnedVoucher = res?.data?.data?.voucher;
      if (typeof novoSaldo === 'number') {
        setPontosUsuario(novoSaldo);
      }
      if (returnedVoucher && typeof returnedVoucher.id === 'number') {
        setVouchers((prev) => prev.map((it) => it.id === returnedVoucher.id ? { ...it, quantidadeDisponivel: returnedVoucher.quantidadeDisponivel } : it));
      }
      // Atualiza histórico local puxando novamente
      if (userId) {
        try {
          const resHist = await api.get(`/usuarios/${userId}/vouchers-resgatados`);
          const histData = Array.isArray(resHist?.data?.data) ? resHist.data.data : [];
          setHistorico(histData);
        } catch {}
      }
      if (code) setCodeModal({ open: true, code, title: returnedVoucher?.titulo || v.titulo || 'Voucher' });
      setSuccess(code ? `Resgate confirmado! Código: ${code}` : 'Resgate confirmado!');
    } catch (e) {
      const msg = e?.response?.data?.message || 'Falha ao resgatar. Verifique seu login e seu saldo.';
      setError(msg);
    } finally {
      setRedeemingId(null);
    }
  }

  async function resgatarCodigoDiario() {
    try {
      setError(""); setSuccess(""); setRedeemingCode(true);
      if (!isAuthed || !userId) { setError('Faça login para resgatar um código.'); return; }
      if (!codigo.trim()) { setError('Informe o código para resgate.'); return; }
      const res = await api.post(`/usuarios/${userId}/resgatar-codigo`, { codigo: codigo.trim() });
      setCodigo("");
      const msg = res?.data?.message || 'Código resgatado com sucesso!';
      setSuccess(msg);
      // Atualiza o saldo de pontos após o resgate
      try {
        const me = await api.get('/usuarios/me');
        const u = me?.data?.data;
        if (u?.saldoPontos != null) setPontosUsuario(Number(u.saldoPontos));
      } catch {}
    } catch (e) {
      const msg = e?.response?.data?.message || 'Falha ao resgatar código.';
      setError(msg);
    } finally {
      setRedeemingCode(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Conteúdo */}
      <main className="container mx-auto max-w-6xl w-full px-4 md:px-6 pt-24 pb-10 flex-1">
        <div className="mb-6">
          <h1 className="text-[color:#2d5016] text-2xl md:text-3xl font-semibold">Recompensas</h1>
          <p className="text-zinc-600 mt-1 text-sm">Troque seus pontos por benefícios incríveis</p>
        </div>
        {/* Mensagem de erro */}
        {(error || success) && (
          <div className="bg-white border-2 border-red-200 rounded-2xl p-4 md:p-5 shadow-xl mb-6">
            {error && (
              <div className="flex items-center gap-3 text-red-700">
                <AlertTriangle size={20} />
                <p className="text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-3 text-emerald-700">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <p className="text-sm">{success}</p>
              </div>
            )}
          </div>
        )}

        {/* Painel de pontos */}
        <section className="bg-white rounded-2xl p-6 shadow-xl border border-zinc-100 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-zinc-600 font-medium">Seus Pontos EcoTrash</p>
              <div className="mt-1 flex items-center gap-2">
                <Sparkles className="text-[#48742c]" size={28} />
                <span className="text-3xl font-bold text-[#2d5016]">{pontosUsuario.toLocaleString()}</span>
                <span className="text-sm text-zinc-500">pontos</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-zinc-500 mb-1">Próximo nível em</p>
              <p className="text-[#48742c] font-bold">{(proximoNivel - pontosUsuario).toLocaleString()} pts</p>
            </div>
          </div>
          <ProgressBar value={progresso} />
        </section>

        {/* Resgatar código diário de ponto de coleta */}
        <section className="bg-white rounded-2xl p-6 shadow-xl border border-zinc-100 mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-[#2d5016]">Código diário do ponto de coleta</h2>
            <p className="text-sm text-zinc-600 mt-1">Cole aqui o código que você obteve em um ponto de coleta para ganhar pontos.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#2d5016] mb-1">Código</label>
              <input
                value={codigo}
                onChange={(e)=>setCodigo(e.target.value)}
                placeholder="Ex.: ABC123"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <button
                disabled={redeemingCode}
                onClick={resgatarCodigoDiario}
                className={`w-full rounded-lg py-2 text-sm font-bold ${redeemingCode ? 'bg-zinc-400 text-white' : 'bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] text-white shadow'}`}
              >
                {redeemingCode ? 'Resgatando...' : 'Resgatar código'}
              </button>
            </div>
          </div>
        </section>

        {/* Recompensas disponíveis */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Gift className="text-[#48742c]" size={26} />
            <h2 className="text-2xl font-semibold text-[#2d5016]">Recompensas Disponíveis</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-56 shadow-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vouchers.map((v) => {
                const disponivel = isDisponivel(v);
                return (
                  <article
                    key={v.id}
                    className={`relative bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition ${
                      disponivel ? "hover:-translate-y-1.5 hover:shadow-2xl" : "opacity-80"
                    }`}
                  >
                    {/* Flag disponível/esgotado */}
                    <div className={`absolute top-3 right-3 z-10 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md ${
                      disponivel ? "bg-green-500" : "bg-red-500"
                    }`}>
                      {disponivel ? "Disponível" : "Esgotado"}
                    </div>

                    {/* Banner simples (sem imagens do parceiro no backend) */}
                    <div className="h-40 w-full bg-gradient-to-br from-emerald-200/60 to-emerald-100/40 flex items-center justify-center">
                      <span className="text-emerald-800 font-semibold text-sm">
                        {v.nomeParceiro || "Parceiro"}
                      </span>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <span className="inline-block text-white text-xs font-medium mb-3 px-3 py-1 rounded-full bg-emerald-500">Voucher</span>
                        <h3 className="text-[#2d5016] font-semibold leading-snug line-clamp-2">{v.titulo}</h3>
                        {v.descricao && (
                          <p className="text-sm text-zinc-600 line-clamp-3 mt-1">{v.descricao}</p>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="text-[#48742c]" size={18} />
                            <span className="text-[#48742c] font-bold">{Number(v.custoPontos || 0).toLocaleString()}</span>
                          </div>
                          <div className="text-right text-xs text-zinc-600">
                            {v.validade ? (
                              <span>Val: {currencyDate(v.validade)}</span>
                            ) : (
                              <span>Sem validade</span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={redeemingId === v.id || !disponivel || !isAuthed || pontosUsuario < (v.custoPontos || 0)}
                          className={`w-full rounded-lg py-3 text-sm font-bold transition transform ${
                            redeemingId === v.id || !disponivel || !isAuthed || pontosUsuario < (v.custoPontos || 0)
                              ? "bg-zinc-300 text-white cursor-not-allowed"
                              : "bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] text-white hover:scale-[1.02] active:scale-[0.98] shadow"
                          }`}
                          onClick={() => {
                            if (!isAuthed) {
                              setError('Faça login para resgatar recompensas.');
                              return;
                            }
                            handleRedeem(v);
                          }}
                        >
                          {redeemingId === v.id
                            ? "Processando..."
                            : !disponivel
                            ? "Indisponível"
                            : !isAuthed
                            ? "Entrar para resgatar"
                            : pontosUsuario >= (v.custoPontos || 0)
                            ? "Resgatar Agora"
                            : `Faltam ${Number((v.custoPontos || 0) - pontosUsuario).toLocaleString()} pts`}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}

              {vouchers.length === 0 && !loading && (
                <div className="col-span-full">
                  <div className="bg-white rounded-2xl p-8 text-center text-zinc-600 shadow">
                    Nenhuma recompensa disponível no momento.
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Histórico de Resgates */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <History className="text-[#48742c]" size={26} />
            <h2 className="text-2xl font-semibold text-[#2d5016]">Histórico de Resgates</h2>
          </div>
          {historico.length === 0 ? (
            <div className="bg-white rounded-xl p-6 shadow text-sm text-zinc-600">
              Você ainda não possui resgates.
            </div>
          ) : (
            <div className="space-y-4">
              {historico.map((h) => (
                <div key={h.id} className="bg-white rounded-xl p-5 shadow border border-zinc-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#2d5016] font-medium">
                        {h?.voucher?.titulo || 'Voucher'}
                      </p>
                      <div className="mt-1 flex items-center gap-4 text-sm text-zinc-600">
                        <span>{Number(h.pontosGastos || 0)} pontos</span>
                        <span>
                          {h.data_resgate ? new Intl.DateTimeFormat('pt-BR').format(new Date(h.data_resgate)) : ''}
                        </span>
                        {h.codigoVoucherGerado && (
                          <span className="font-mono text-xs bg-zinc-100 px-2 py-1 rounded">
                            {h.codigoVoucherGerado}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${h.utilizado ? 'bg-zinc-300 text-zinc-700' : 'bg-emerald-500/90 text-white'}`}>
                      {h.utilizado ? 'Usado' : 'Ativo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      {codeModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-zinc-100">
              <h3 className="text-lg font-semibold text-[#2d5016]">Resgate confirmado</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-zinc-700">Você resgatou:</p>
              <p className="font-medium text-zinc-900">{codeModal.title}</p>
              <div>
                <p className="text-sm text-zinc-600 mb-2">Código do voucher</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm bg-zinc-100 px-3 py-2 rounded select-all">{codeModal.code}</span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(codeModal.code)}
                    className="px-3 py-2 rounded bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600"
                  >
                    Copiar
                  </button>
                </div>
              </div>
              <p className="text-xs text-zinc-500">Você também receberá um email com instruções para utilizar seu voucher.</p>
            </div>
            <div className="p-5 border-t border-zinc-100 flex gap-3">
              <button
                type="button"
                onClick={() => setCodeModal({ open: false, code: "", title: "" })}
                className="w-full px-4 py-2 rounded border border-zinc-300 text-zinc-700 text-sm font-medium hover:bg-zinc-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
