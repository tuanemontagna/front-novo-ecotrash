"use client";

import Link from "next/link";
import Header from "@/components/header";
import { MapPin, House, Newspaper, Award, Leaf, Users, TrendingUp } from "lucide-react";

export default function UsuarioHomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="container mx-auto max-w-6xl w-full px-4 md:px-6 pt-24 pb-16 flex-1">
        {/* Hero */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-xl overflow-hidden">
            <div className="p-8 md:p-10">
              <h1 className="text-2xl md:text-3xl font-semibold text-[color:#2d5016]">
                Reciclando tecnologia, preservando o futuro
              </h1>
              <p className="mt-2 text-zinc-600 max-w-2xl">
                Plataforma inteligente para descarte responsável de eletrônicos e tecnologia sustentável.
              </p>
            </div>
          </div>
        </section>

        {/* Ações principais */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-[#2d5016]">Como podemos te ajudar?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <HomeCard
              href="/usuario/pontos-coleta"
              title="Pontos de Coleta"
              description="Encontre pontos de coleta próximos a você para descarte responsável"
              Icon={MapPin}
            />
            <HomeCard
              href="/usuario/coletas"
              title="Agendar Coleta"
              description="Agende uma coleta domiciliar para seus eletrônicos"
              Icon={House}
            />
            <HomeCard
              href="/information"
              title="Informações"
              description="Aprenda sobre reciclagem e descarte correto de eletrônicos"
              Icon={Newspaper}
            />
            <HomeCard
              href="/usuario/recompensas"
              title="Recompensas"
              description="Ganhe pontos e troque por benefícios"
              Icon={Award}
            />
          </div>
        </section>

        {/* Sobre o EcoTrash */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-[#2d5016]">Sobre o EcoTrash</h2>
            <p className="text-zinc-600 mt-2 max-w-3xl mx-auto">
              Somos uma plataforma dedicada à sustentabilidade tecnológica, conectando pessoas e empresas para o descarte responsável de eletrônicos e equipamentos tecnológicos.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PillarCard
              title="Sustentabilidade"
              description="Promovemos práticas sustentáveis no descarte de eletrônicos, reduzindo o impacto ambiental."
              Icon={Leaf}
            />
            <PillarCard
              title="Comunidade"
              description="Conectamos usuários, empresas recicladoras e pontos de coleta para maximizar o impacto positivo."
              Icon={Users}
            />
            <PillarCard
              title="Inovação"
              description="Usamos tecnologia para tornar a reciclagem mais eficiente e acessível para todos."
              Icon={TrendingUp}
            />
          </div>
        </section>

        {/* Impacto */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-xl p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-semibold text-[#2d5016] text-center">Nosso Impacto</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
              <ImpactStat value="10K+" label="Eletrônicos Reciclados" />
              <ImpactStat value="500+" label="Pontos de Coleta" />
              <ImpactStat value="5K+" label="Usuários Ativos" />
              <ImpactStat value="100+" label="Empresas Parceiras" />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="text-center">
            <h3 className="text-xl md:text-2xl font-semibold text-[#2d5016]">Pronto para fazer a diferença?</h3>
            <p className="text-zinc-600 mt-2 max-w-2xl mx-auto">
              Junte-se a milhares de pessoas que já estão contribuindo para um futuro mais sustentável.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
              <Link
                href="/usuario/coletas"
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] text-white px-6 py-3 font-semibold shadow hover:scale-[1.02] active:scale-[0.98]"
              >
                <House size={18} /> Agendar Primeira Coleta
              </Link>
              <Link
                href="/usuario/pontos-coleta"
                className="inline-flex items-center gap-2 rounded-full border-2 border-[#48742c] text-[#48742c] px-6 py-3 font-semibold hover:bg-[#48742c] hover:text-white"
              >
                <MapPin size={18} /> Encontrar Pontos
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer simples */}
      <footer className="border-t border-zinc-200 py-8">
        <div className="container mx-auto max-w-6xl px-4 md:px-6 text-center text-zinc-600 text-sm">
          © 2025 EcoTrash. Todos os direitos reservados.
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
