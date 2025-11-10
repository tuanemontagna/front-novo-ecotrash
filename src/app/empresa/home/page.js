"use client";

import Link from "next/link";
import Header from "@/components/header";
import { MapPin, Truck, Newspaper, Briefcase, BarChart3, Leaf } from "lucide-react";

export default function EmpresaHomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="container mx-auto max-w-6xl w-full px-4 md:px-6 pt-24 pb-16 flex-1">
        {/* Hero */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-xl overflow-hidden">
            <div className="p-8 md:p-10">
              <h1 className="text-2xl md:text-3xl font-semibold text-[color:#2d5016]">
                Gestão inteligente de resíduos empresariais
              </h1>
              <p className="mt-2 text-zinc-600 max-w-2xl">
                Plataforma corporativa para gestão eficiente de coletas, análise de impacto e relatórios de sustentabilidade.
              </p>
            </div>
          </div>
        </section>

        {/* Ações principais */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-[#2d5016]">Painel de Gestão Empresarial</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HomeCard
              href="/empresa/pontos-coleta"
              title="Meus Pontos de Coleta"
              description="Encontre pontos de coleta corporativos para descarte responsável"
              Icon={MapPin}
            />
            <HomeCard
              href="/empresa/coletas"
              title="Gerenciar Coletas"
              description="Agende, acompanhe e gerencie as coletas da empresa"
              Icon={Truck}
            />
            <HomeCard
              href="/information"
              title="Informações"
              description="Acesse guias e conteúdos sobre gestão sustentável empresarial"
              Icon={Newspaper}
            />
          </div>
        </section>

        {/* Sobre EcoTrash Empresarial */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-[#2d5016]">EcoTrash Empresarial</h2>
            <p className="text-zinc-600 mt-2 max-w-3xl mx-auto">
              Solução completa para empresas que buscam excelência em gestão de resíduos eletrônicos, compliance ambiental e otimização de processos sustentáveis.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PillarCard
              title="Gestão Corporativa"
              description="Ferramentas para controle de processos de coleta e descarte de resíduos empresariais."
              Icon={Briefcase}
            />
            <PillarCard
              title="Análise e Relatórios"
              description="Relatórios de impacto ambiental, métricas de sustentabilidade e dashboards executivos."
              Icon={BarChart3}
            />
            <PillarCard
              title="Compliance Ambiental"
              description="Conformidade com regulamentações ambientais e certificações de sustentabilidade."
              Icon={Leaf}
            />
          </div>
        </section>

        {/* Impacto */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-xl p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-semibold text-[#2d5016] text-center">Resultados Empresariais</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
              <ImpactStat value="50+" label="Empresas Ativas" />
              <ImpactStat value="25K+" label="Equipamentos Processados" />
              <ImpactStat value="95%" label="Taxa de Reciclagem" />
              <ImpactStat value="100%" label="Compliance Ambiental" />
            </div>
          </div>
        </section>

        {/* Mensagem */}
        <section>
          <div className="text-center">
            <h3 className="text-xl md:text-2xl font-semibold text-[#2d5016]">Sua empresa está fazendo a diferença!</h3>
            <p className="text-zinc-600 mt-2 max-w-2xl mx-auto">
              Continue contribuindo para um futuro mais sustentável com práticas responsáveis de descarte.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8">
        <div className="container mx-auto max-w-6xl px-4 md:px-6 text-center text-zinc-600 text-sm">
          © 2025 EcoTrash Empresarial. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}

function HomeCard({ href, title, description, Icon }) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl shadow-xl border border-zinc-100 p-6 transition transform hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="flex flex-col h-full">
        <div className="w-12 h-12 rounded-full bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] flex items-center justify-center shadow text-white">
          <Icon size={22} />
        </div>
        <h3 className="mt-4 text-[#2d5016] font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-zinc-600 leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}

function PillarCard({ title, description, Icon }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-zinc-100 p-6">
      <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#2d5016] flex items-center justify-center">
        <Icon size={24} />
      </div>
      <h4 className="mt-4 text-[#2d5016] font-semibold">{title}</h4>
      <p className="mt-1 text-sm text-zinc-600 leading-relaxed">{description}</p>
    </div>
  );
}

function ImpactStat({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-2xl md:text-4xl font-bold text-[#2d5016]">{value}</div>
      <div className="text-xs md:text-sm text-zinc-600 mt-1">{label}</div>
    </div>
  );
}
