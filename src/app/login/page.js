import LoginForm from "@/components/auth/login-form";
import Image from "next/image";

export const metadata = { title: "Login - EcoTrash" };

export default function LoginPage() {
  return (
  <div className="min-h-screen grid md:grid-cols-2">
      {/* Painel esquerdo */}
      <div className="hidden md:flex flex-col items-center justify-center gap-8 bg-[linear-gradient(135deg,#48742c_0%,#3a5e23_100%)] px-12 py-16 text-center text-white">
        <div className="flex flex-col items-center gap-4">
          <Image src="/images/logo.png" alt="EcoTrash" width={220} height={220} className="object-contain" />
          <h1 className="text-3xl font-bold tracking-tight">EcoTrash</h1>
        </div>
        <p className="max-w-md text-lg leading-relaxed font-medium">Reciclando tecnologia, preservando o futuro!</p>
        <p className="max-w-md text-sm opacity-80 leading-relaxed">Conecte-se à plataforma que transforma lixo eletrônico em oportunidades sustentáveis.</p>
      </div>

      {/* Formulário */}
      <div className="flex items-center justify-center bg-white px-6 py-16 md:px-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold text-[#2d5016]">Bem-vindo de volta!</h2>
            <p className="text-sm text-zinc-600">Faça login para acessar sua conta</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
