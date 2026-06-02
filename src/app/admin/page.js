"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/utils/axios";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const OPCOES_STATUS = ["CONCLUIDO", "PENDENTE", "CANCELADO", "EM_ANDAMENTO"];
const CORES_GRAFICO = ["#2d5016","#4a7c22","#6aa329","#a3d65c","#c9e89a","#1a3009","#83b820","#e3f2c1"];
const COR_VERDE        = "#2d5016";
const COR_VERDE_MEDIO  = "#6aa329";
const COR_DESTAQUE     = "#a3d65c";
const ESTILO_TOOLTIP   = {
  background: "#fff",
  border: "1px solid #e4edda",
  borderRadius: 12,
  fontSize: 13,
  color: "#2d5016",
  padding: "8px 14px",
};


// ─── HOOK GENÉRICO ────────────────────────────────────────────────────────────

function useDashboard(endpoint, filtros) {
  const [dados,        setDados]        = useState(null);
  const [carregando,   setCarregando]   = useState(true);
  const [erro,         setErro]         = useState(null);

  const buscar = useCallback(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);

    const queryString = new URLSearchParams(
      Object.fromEntries(
        Object.entries(filtros).filter(([, valor]) => valor !== "" && valor !== null && valor !== undefined)
      )
    ).toString();

    api.get(`${endpoint}${queryString ? `?${queryString}` : ""}`)
      .then(resposta => {
        if (!ativo) return;
        const payload = resposta?.data?.data ?? resposta?.data ?? null;
        setDados(payload);
      })
      .catch(erroResposta => {
        if (!ativo) return;
        setErro(erroResposta?.response?.data?.message ?? "Erro ao carregar dados.");
      })
      .finally(() => { if (ativo) setCarregando(false); });

    return () => { ativo = false; };
  }, [endpoint, JSON.stringify(filtros)]);

  useEffect(() => {
    const limpar = buscar();
    return limpar;
  }, [buscar]);

  return { dados, carregando, erro, recarregar: buscar };
}

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────

function Rotulo({ children }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, color: "#8a9e78",
      textTransform: "uppercase", letterSpacing: "0.08em",
      display: "block", marginBottom: 4,
    }}>
      {children}
    </span>
  );
}

function Selecionar({ valor, aoMudar, opcoes, placeholder = "Todos" }) {
  return (
    <select
      value={valor}
      onChange={e => aoMudar(e.target.value)}
      className="text-xs px-3 py-1.5 rounded-lg border border-[#d4e6b8] bg-[#f7faf2] text-[#2d5016] outline-none cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {opcoes.map(op => {
        const v = typeof op === "object" ? op.value : op;
        const l = typeof op === "object" ? op.label : op;
        return <option key={v} value={v}>{l}</option>;
      })}
    </select>
  );
}

function EntradaData({ rotulo, valor, aoMudar }) {
  return (
    <div>
      <Rotulo>{rotulo}</Rotulo>
      <input
        type="date"
        value={valor}
        onChange={e => aoMudar(e.target.value)}
        className="text-xs px-3 py-1.5 rounded-lg border border-[#d4e6b8] bg-[#f7faf2] text-[#2d5016] outline-none"
      />
    </div>
  );
}

function GrupoFiltro({ rotulo, children }) {
  return (
    <div>
      <Rotulo>{rotulo}</Rotulo>
      {children}
    </div>
  );
}

function BarraFiltros({ children }) {
  return (
    <div className="flex flex-wrap gap-3 items-end bg-[#f0f7e6] rounded-xl px-4 py-3 mb-5">
      {children}
    </div>
  );
}

function Cartao({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-[#e8f0e0] shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

function TituloSecao({ children }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="inline-block w-1 h-4 rounded-full bg-[#a3d65c]" />
      <h2 className="text-sm font-bold text-[#2d5016] m-0">{children}</h2>
    </div>
  );
}

function EstadoGrafico({ carregando, erro, vazio, altura = 220 }) {
  if (!carregando && !erro && !vazio) return null;
  return (
    <div style={{ height: altura }} className="flex flex-col items-center justify-center gap-2 text-zinc-400 text-sm">
      {carregando && <><span className="animate-spin text-[#6aa329] text-xl">⟳</span> Carregando...</>}
      {!carregando && erro && <><span className="text-red-400 text-lg">!</span> {erro}</>}
      {!carregando && !erro && vazio && (
        <>
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="#c9e89a" strokeWidth="2"/>
            <path d="M8 12h8" stroke="#c9e89a" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Nenhum dado para os filtros selecionados
        </>
      )}
    </div>
  );
}

// ─── SEÇÃO: TOTAIS KG / M³ ────────────────────────────────────────────────────

function SecaoTotais({ tiposResiduos }) {
  const [dataInicio,  setDataInicio]  = useState("");
  const [dataFim,     setDataFim]     = useState("");
  const [tipoResiduo, setTipoResiduo] = useState("");

  const { dados, carregando, erro } = useDashboard("/dashboard/totais-coleta", {
    data_inicio:  dataInicio,
    data_fim:     dataFim,
    tipo_residuo: tipoResiduo,
    status:       "CONCLUIDO",
  });

  const vazio = !carregando && !erro && !dados?.total_peso_kg && !dados?.total_volume_m3;

  return (
    <Cartao className="mb-4">
      <TituloSecao>Total de Lixo Eletrônico Arrecadado</TituloSecao>
      <BarraFiltros>
        <EntradaData rotulo="De"  valor={dataInicio} aoMudar={setDataInicio} />
        <EntradaData rotulo="Até" valor={dataFim}    aoMudar={setDataFim} />
        <GrupoFiltro rotulo="Tipo de Resíduo">
          <Selecionar valor={tipoResiduo} aoMudar={setTipoResiduo} opcoes={tiposResiduos} placeholder="Todos os tipos" />
        </GrupoFiltro>
      </BarraFiltros>

      {(carregando || erro || vazio) ? (
        <EstadoGrafico carregando={carregando} erro={erro} vazio={vazio} altura={120} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { rotulo: "Peso Total",   valor: dados?.total_peso_kg,   unidade: "kg" },
            { rotulo: "Volume Total", valor: dados?.total_volume_m3,  unidade: "m³" },
          ].map(({ rotulo, valor, unidade }) => (
            <div key={rotulo} className="bg-[#f7faf2] rounded-xl px-6 py-5">
              <span className="text-xs font-bold text-[#8a9e78] uppercase tracking-widest">{rotulo}</span>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-4xl font-extrabold text-[#2d5016] leading-none">
                  {Number(valor ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                </span>
                <span className="text-base font-bold text-[#6aa329] mb-1">{unidade}</span>
              </div>
              <span className="text-xs text-[#b0bfa0] mt-1 block">Status fixo: CONCLUÍDO</span>
            </div>
          ))}
        </div>
      )}
    </Cartao>
  );
}

// ─── SEÇÃO: BAIRROS ───────────────────────────────────────────────────────────

function SecaoBairros() {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim,    setDataFim]    = useState("");
  const [status,     setStatus]     = useState("");

  const { dados: retorno, carregando, erro } = useDashboard("/dashboard/descartes-por-bairro", {
    data_inicio: dataInicio,
    data_fim:    dataFim,
    status,
  });

  const lista = Array.isArray(retorno)
    ? retorno.slice(0, 8).map(item => ({ ...item, total_coletas: Number(item.total_coletas) }))
    : [];
  const vazio  = !carregando && !erro && lista.length === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      <Cartao>
        <TituloSecao>Descartes por Bairro</TituloSecao>
        <BarraFiltros>
          <EntradaData rotulo="De"  valor={dataInicio} aoMudar={setDataInicio} />
          <EntradaData rotulo="Até" valor={dataFim}    aoMudar={setDataFim} />
          <GrupoFiltro rotulo="Status">
            <Selecionar valor={status} aoMudar={setStatus} opcoes={OPCOES_STATUS} />
          </GrupoFiltro>
        </BarraFiltros>
        {(carregando || erro || vazio) ? (
          <EstadoGrafico carregando={carregando} erro={erro} vazio={vazio} />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={lista} dataKey="total_coletas" nameKey="bairro" cx="50%" cy="50%" outerRadius={80}>
                {lista.map((_, indice) => <Cell key={indice} fill={CORES_GRAFICO[indice % CORES_GRAFICO.length]} />)}
              </Pie>
              <Tooltip contentStyle={ESTILO_TOOLTIP} formatter={v => [v, "Coletas"]} />
              <Legend iconType="circle" iconSize={8} formatter={nome => <span className="text-xs text-[#4a7c22]">{nome}</span>} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Cartao>

      <Cartao>
        <TituloSecao>Ranking de Bairros</TituloSecao>
        <div className="mt-16">
          {(carregando || erro || vazio) ? (
            <EstadoGrafico carregando={carregando} erro={erro} vazio={vazio} />
          ) : lista.map((item, indice) => {
            const maximo      = lista[0]?.total_coletas || 1;
            const porcentagem = Math.round((item.total_coletas / maximo) * 100);
            return (
              <div key={item.bairro} className="flex items-center gap-3 text-sm mb-2.5">
                <span className="w-5 text-right text-zinc-400 font-mono text-xs">{indice + 1}</span>
                <span className="w-36 truncate font-semibold text-zinc-700">{item.bairro}</span>
                <div className="flex-1 h-2 bg-[#f0f5e8] rounded-full overflow-hidden">
                  <div style={{ width: `${porcentagem}%`, background: CORES_GRAFICO[indice % CORES_GRAFICO.length] }} className="h-2 rounded-full" />
                </div>
                <span className="w-9 text-right font-bold text-[#4a7c22]">{item.total_coletas}</span>
              </div>
            );
          })}
        </div>
      </Cartao>
    </div>
  );
}

// ─── SEÇÃO: RESÍDUOS ──────────────────────────────────────────────────────────

function SecaoResiduos({ empresas, bairros, tiposResiduos }) {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim,    setDataFim]    = useState("");
  const [status,     setStatus]     = useState("CONCLUIDO");
  const [empresa,    setEmpresa]    = useState("");
  const [bairro,     setBairro]     = useState("");

  const { dados: retorno, carregando, erro } = useDashboard("/dashboard/top-residuos", {
    data_inicio: dataInicio,
    data_fim:    dataFim,
    status,
    empresa_id:  empresa,
    bairro,
  });

  const lista = Array.isArray(retorno)
    ? retorno.slice(0, 8).map(item => ({ ...item, quantidade_total: Number(item.quantidade_total) }))
    : [];
  const vazio  = !carregando && !erro && lista.length === 0;

  return (
    <Cartao className="mb-4">
      <TituloSecao>Top Tipos de Resíduos Descartados</TituloSecao>
      <BarraFiltros>
        <EntradaData rotulo="De"  valor={dataInicio} aoMudar={setDataInicio} />
        <EntradaData rotulo="Até" valor={dataFim}    aoMudar={setDataFim} />
        <GrupoFiltro rotulo="Status">
          <Selecionar valor={status} aoMudar={setStatus} opcoes={OPCOES_STATUS} />
        </GrupoFiltro>
        <GrupoFiltro rotulo="Empresa">
          <Selecionar valor={empresa} aoMudar={setEmpresa} opcoes={empresas} placeholder="Todas as empresas" />
        </GrupoFiltro>
        <GrupoFiltro rotulo="Bairro">
          <Selecionar valor={bairro} aoMudar={setBairro} opcoes={bairros} placeholder="Todos os bairros" />
        </GrupoFiltro>
      </BarraFiltros>
      {(carregando || erro || vazio) ? (
        <EstadoGrafico carregando={carregando} erro={erro} vazio={vazio} />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={lista} dataKey="quantidade_total" nameKey="tipo_residuo" cx="50%" cy="50%" outerRadius={90} innerRadius={40}>
              {lista.map((_, indice) => <Cell key={indice} fill={CORES_GRAFICO[indice % CORES_GRAFICO.length]} />)}
            </Pie>
            <Tooltip contentStyle={ESTILO_TOOLTIP} formatter={v => [v, "Qtd"]} />
            <Legend iconType="circle" iconSize={8} formatter={nome => <span className="text-xs text-[#4a7c22]">{nome}</span>} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Cartao>
  );
}

// ─── SEÇÃO: VOUCHERS ──────────────────────────────────────────────────────────

function SecaoVouchers() {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim,    setDataFim]    = useState("");

  const { dados: retorno, carregando, erro } = useDashboard("/dashboard/top-vouchers", {
    data_inicio: dataInicio,
    data_fim:    dataFim,
  });

  const lista = Array.isArray(retorno) ? retorno : [];
  const vazio  = !carregando && !erro && lista.length === 0;

  return (
    <Cartao className="mb-4">
      <TituloSecao>Ranking de Vouchers Mais Resgatados</TituloSecao>
      <BarraFiltros>
        <EntradaData rotulo="De"  valor={dataInicio} aoMudar={setDataInicio} />
        <EntradaData rotulo="Até" valor={dataFim}    aoMudar={setDataFim} />
      </BarraFiltros>
      {(carregando || erro || vazio) ? (
        <EstadoGrafico carregando={carregando} erro={erro} vazio={vazio} />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={lista} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f5e8" />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#9aab89" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="titulo" width={160} tick={{ fontSize: 11, fill: "#4a7c22" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={ESTILO_TOOLTIP} formatter={v => [v, "Resgates"]} />
            <Bar dataKey="total_resgates" radius={[0, 6, 6, 0]} fill={COR_VERDE_MEDIO} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Cartao>
  );
}

// ─── SEÇÃO: EMPRESAS ──────────────────────────────────────────────────────────

function SecaoEmpresas({ bairros }) {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim,    setDataFim]    = useState("");
  const [bairro,     setBairro]     = useState("");
  const [status,     setStatus]     = useState("CONCLUIDO");

  const { dados: retorno, carregando, erro } = useDashboard("/dashboard/top-empresas", {
    data_inicio: dataInicio,
    data_fim:    dataFim,
    bairro,
    status,
  });

  const lista = Array.isArray(retorno) ? retorno.slice(0, 8) : [];
  const vazio  = !carregando && !erro && lista.length === 0;

  return (
    <Cartao className="mb-4">
      <TituloSecao>Ranking de Empresas Mais Eficientes</TituloSecao>
      <BarraFiltros>
        <EntradaData rotulo="De"  valor={dataInicio} aoMudar={setDataInicio} />
        <EntradaData rotulo="Até" valor={dataFim}    aoMudar={setDataFim} />
        <GrupoFiltro rotulo="Bairro">
          <Selecionar valor={bairro} aoMudar={setBairro} opcoes={bairros} placeholder="Todos os bairros" />
        </GrupoFiltro>
        <GrupoFiltro rotulo="Status">
          <Selecionar valor={status} aoMudar={setStatus} opcoes={OPCOES_STATUS} />
        </GrupoFiltro>
      </BarraFiltros>
      {(carregando || erro || vazio) ? (
        <EstadoGrafico carregando={carregando} erro={erro} vazio={vazio} />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={lista} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f5e8" />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#9aab89" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="razao_social" width={150} tick={{ fontSize: 11, fill: "#4a7c22" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={ESTILO_TOOLTIP} formatter={v => [v, "Coletas concluídas"]} />
            <Bar dataKey="total_coletas_concluidas" radius={[0, 6, 6, 0]} fill={COR_VERDE} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Cartao>
  );
}

// ─── SEÇÃO: PONTOS DE COLETA ──────────────────────────────────────────────────

function SecaoPontos({ bairros, pontosColeta }) {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim,    setDataFim]    = useState("");
  const [bairro,     setBairro]     = useState("");
  const [ponto,      setPonto]      = useState("");

  const { dados: retorno, carregando, erro } = useDashboard("/dashboard/top-pontos-coleta", {
    data_inicio:     dataInicio,
    data_fim:        dataFim,
    bairro,
    ponto_coleta_id: ponto,
  });

  const lista = Array.isArray(retorno) ? retorno : [];
  const vazio  = !carregando && !erro && lista.length === 0;

  return (
    <Cartao className="mb-4">
      <TituloSecao>Utilização de Pontos de Coleta Físicos</TituloSecao>
      <BarraFiltros>
        <EntradaData rotulo="De"  valor={dataInicio} aoMudar={setDataInicio} />
        <EntradaData rotulo="Até" valor={dataFim}    aoMudar={setDataFim} />
        <GrupoFiltro rotulo="Bairro">
          <Selecionar valor={bairro} aoMudar={setBairro} opcoes={bairros} placeholder="Todos os bairros" />
        </GrupoFiltro>
        <GrupoFiltro rotulo="Ponto de Coleta">
          <Selecionar valor={ponto} aoMudar={setPonto} opcoes={pontosColeta} placeholder="Todos os pontos" />
        </GrupoFiltro>
      </BarraFiltros>
      {(carregando || erro || vazio) ? (
        <EstadoGrafico carregando={carregando} erro={erro} vazio={vazio} />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={lista} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f5e8" />
            <XAxis dataKey="nome_ponto" tick={{ fontSize: 10, fill: "#4a7c22" }} axisLine={false} tickLine={false} angle={-25} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 11, fill: "#9aab89" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={ESTILO_TOOLTIP} formatter={v => [v, "Resgates"]} />
            <Bar dataKey="total_resgates_codigos" radius={[6, 6, 0, 0]} fill={COR_DESTAQUE} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Cartao>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [opcoes, setOpcoes] = useState({
    bairros: [], empresas: [], tiposResiduos: [], pontosColeta: [],
  });

  useEffect(() => {
    api.get("/dashboard/opcoes-filtros")
      .then(r => {
        const d = r?.data?.data;
        if (d) setOpcoes(d);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#f7faf2] px-4 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#2d5016] tracking-tight">Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">Visão geral das operações do EcoTrash</p>
      </div>
      <SecaoTotais tiposResiduos={opcoes.tiposResiduos} />
      <SecaoBairros />
      <SecaoResiduos empresas={opcoes.empresas} bairros={opcoes.bairros} tiposResiduos={opcoes.tiposResiduos} />
      <SecaoVouchers />
      <SecaoEmpresas bairros={opcoes.bairros} />
      <SecaoPontos   bairros={opcoes.bairros} pontosColeta={opcoes.pontosColeta} />
    </div>
  );
}
