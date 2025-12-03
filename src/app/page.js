"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Recycle, Coins, MapPin, CheckCircle2, Building2, BarChart3, QrCode, Megaphone } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-[140px]">
               <Image 
                 src="/images/logo.png" 
                 alt="EcoTrash" 
                 fill 
                 className="object-contain object-left"
                 priority
               />
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
            <Link href="#como-funciona" className="hover:text-[#48742c] transition-colors">Como funciona</Link>
            <Link href="#beneficios" className="hover:text-[#48742c] transition-colors">Benefícios</Link>
            <Link href="#parceiros" className="hover:text-[#48742c] transition-colors">Para Empresas</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-zinc-600 hover:text-[#48742c] transition-colors"
            >
              Entrar
            </Link>
            <Link 
              href="/criar-conta" 
              className="px-4 py-2 rounded-full bg-[#48742c] text-white text-sm font-medium hover:bg-[#3a5e23] transition-colors shadow-sm hover:shadow-md"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-50 via-white to-white -z-10" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-[#48742c] text-xs font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Sustentabilidade e Inovação
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
                  Transforme seu lixo em <span className="text-[#48742c]">oportunidades</span>
                </h1>
                
                <p className="text-lg text-zinc-600 max-w-xl leading-relaxed">
                  O EcoTrash conecta você a pontos de coleta, permitindo que o descarte correto de resíduos se transforme em pontos e recompensas exclusivas.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/criar-conta" 
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#48742c] text-white font-medium hover:bg-[#3a5e23] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Começar agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link 
                    href="#como-funciona" 
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-zinc-700 font-medium border border-zinc-200 hover:bg-zinc-50 transition-all"
                  >
                    Saiba mais
                  </Link>
                </div>
              </div>

              <div className="relative lg:h-[600px] w-full hidden lg:block">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-200/30 rounded-full blur-3xl" />
                {/* Abstract representation of the app or eco concept */}
                <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-zinc-100 p-6 rotate-3 hover:rotate-0 transition-transform duration-500">
                   <div className="aspect-[4/3] bg-zinc-50 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-90" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                        <div className="text-white">
                          <p className="font-bold text-xl">Faça a diferença</p>
                          <p className="text-sm opacity-90">Cada ação conta para um futuro melhor.</p>
                        </div>
                      </div>
                   </div>
                   <div className="mt-6 grid grid-cols-3 gap-4">
                      <div className="text-center p-3 rounded-xl bg-green-50">
                        <Recycle className="h-6 w-6 mx-auto text-[#48742c] mb-2" />
                        <p className="text-xs font-medium text-zinc-600">Recicle</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-blue-50">
                        <MapPin className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                        <p className="text-xs font-medium text-zinc-600">Localize</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-amber-50">
                        <Coins className="h-6 w-6 mx-auto text-amber-600 mb-2" />
                        <p className="text-xs font-medium text-zinc-600">Ganhe</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="como-funciona" className="py-24 bg-zinc-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">Como funciona o EcoTrash?</h2>
              <p className="text-zinc-600">Um ciclo simples e recompensador. Você ajuda o planeta e ganha benefícios exclusivos em nossos parceiros.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: MapPin,
                  title: "Encontre Pontos",
                  desc: "Localize os pontos de coleta mais próximos de você através do nosso mapa interativo.",
                  color: "text-blue-600",
                  bg: "bg-blue-50"
                },
                {
                  icon: Recycle,
                  title: "Realize o Descarte",
                  desc: "Leve seus resíduos recicláveis até o ponto escolhido e faça o descarte correto.",
                  color: "text-green-600",
                  bg: "bg-green-50"
                },
                {
                  icon: Coins,
                  title: "Ganhe Pontos",
                  desc: "Acumule pontos a cada descarte e troque por vouchers e descontos incríveis.",
                  color: "text-amber-600",
                  bg: "bg-amber-50"
                }
              ].map((feature, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 hover:shadow-md transition-shadow">
                  <div className={`h-12 w-12 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6`}>
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-3">{feature.title}</h3>
                  <p className="text-zinc-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="beneficios" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative h-[500px] rounded-2xl overflow-hidden bg-zinc-100">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop')] bg-cover bg-center" />
              </div>
              
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-zinc-900">Por que usar o EcoTrash?</h2>
                
                <div className="space-y-6">
                  {[
                    "Impacto ambiental positivo imediato",
                    "Recompensas reais em estabelecimentos parceiros",
                    "Facilidade para encontrar locais de descarte",
                    "Acompanhamento do seu histórico de sustentabilidade"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="mt-1 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-[#48742c]" />
                      </div>
                      <p className="text-lg text-zinc-700">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Link 
                    href="/criar-conta" 
                    className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-all"
                  >
                    Criar minha conta grátis
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partners/Companies Section */}
        <section id="parceiros" className="py-24 bg-[#f4f7f2] text-zinc-900 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-30">
             <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-green-200 blur-[100px]" />
             <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-blue-100 blur-[100px]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-[#48742c] text-xs font-medium mb-6 border border-green-200">
                Para Empresas e Parceiros
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-zinc-900">Impulsione sua marca com sustentabilidade</h2>
              <p className="text-zinc-600 text-lg">
                O EcoTrash oferece ferramentas poderosas para empresas que desejam fazer parte da economia circular, engajar clientes e gerenciar resíduos de forma inteligente.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: Building2,
                  title: "Gestão de Pontos",
                  desc: "Cadastre e gerencie seus pontos de coleta, definindo horários e tipos de resíduos aceitos."
                },
                {
                  icon: Megaphone,
                  title: "Campanhas de Engajamento",
                  desc: "Crie campanhas personalizadas para incentivar o descarte correto e atrair mais clientes."
                },
                {
                  icon: QrCode,
                  title: "Validação Simplificada",
                  desc: "Sistema de códigos diários para validar entregas e recompensas com segurança."
                },

              ].map((item, i) => (
                <div key={i} className="bg-white border border-zinc-200 p-6 rounded-2xl hover:shadow-lg transition-all shadow-sm">
                  <div className="h-12 w-12 rounded-xl bg-green-50 text-[#48742c] flex items-center justify-center mb-4">
                    <item.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-zinc-900">{item.title}</h3>
                  <p className="text-zinc-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-16 bg-white border border-zinc-200 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
              <div className="space-y-4 max-w-xl">
                <h3 className="text-2xl font-bold text-zinc-900">Pronto para transformar seu negócio?</h3>
                <p className="text-zinc-600">
                  Cadastre sua empresa hoje mesmo e comece a fazer a diferença no mundo enquanto fideliza seus clientes.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <Link 
                  href="/criar-conta?tipo=empresa" 
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#48742c] text-white font-medium hover:bg-[#3a5e23] transition-all shadow-lg shadow-green-900/10"
                >
                  Cadastrar Empresa
                </Link>
                <Link 
                  href="/login" 
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-zinc-100 text-zinc-900 font-medium hover:bg-zinc-200 transition-all"
                >
                  Acessar Painel
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-[#48742c]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Pronto para fazer a diferença?</h2>
            <p className="text-green-100 text-lg mb-10 max-w-2xl mx-auto">
              Junte-se a milhares de pessoas que já estão transformando o mundo, uma ação de cada vez.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/criar-conta" 
                className="px-8 py-4 rounded-full bg-white text-[#48742c] font-bold hover:bg-green-50 transition-colors"
              >
                Começar agora
              </Link>
              <Link 
                href="/login" 
                className="px-8 py-4 rounded-full bg-transparent border border-white text-white font-bold hover:bg-white/10 transition-colors"
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-zinc-50 text-zinc-600 py-12 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-[#48742c] grid place-items-center font-bold text-white">E</div>
                <span className="font-semibold text-zinc-900 tracking-tight text-xl">EcoTrash</span>
              </div>
              <p className="max-w-xs text-sm">
                Conectando pessoas, empresas e pontos de coleta para um futuro mais sustentável.
              </p>
            </div>
            
            <div>
              <h4 className="text-zinc-900 font-medium mb-4">Plataforma</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-[#48742c] transition-colors">Como funciona</Link></li>
                <li><Link href="#" className="hover:text-[#48742c] transition-colors">Pontos de Coleta</Link></li>
                <li><Link href="#" className="hover:text-[#48742c] transition-colors">Recompensas</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-zinc-900 font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-[#48742c] transition-colors">Termos de Uso</Link></li>
                <li><Link href="#" className="hover:text-[#48742c] transition-colors">Privacidade</Link></li>
                <li><Link href="#" className="hover:text-[#48742c] transition-colors">Contato</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-zinc-200 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} EcoTrash. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
