"use client";
import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !senha) {
      setError("Preencha email e senha.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Email inválido.");
      return;
    }
    if (senha.length < 6) {
      setError("Senha deve ter ao menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await login(email, senha);
      setSuccess('Login realizado. Redirecionando...');
      // O AuthProvider cuidará do redirecionamento
    } catch (err) {
      setError(err?.response?.data?.message || 'Falha no login.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-[#2d5016]">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border-2 border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-[#2d5016] focus:border-emerald-600 focus:bg-white focus:outline-none"
          placeholder="seuemail@exemplo.com"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="senha" className="block text-sm font-medium text-[#2d5016]">Senha</label>
        <div className="relative">
          <input
            id="senha"
            type={showPwd ? 'text' : 'password'}
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full rounded-lg border-2 border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-[#2d5016] pr-12 focus:border-emerald-600 focus:bg-white focus:outline-none"
            placeholder="••••••"
          />
          <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-700">
            {showPwd ? <EyeOff size={18}/> : <Eye size={18}/>}
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] px-5 py-3 text-sm font-semibold text-white shadow hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={18} className="animate-spin"/>}
        Entrar
      </button>

      <div className="flex items-center justify-between text-xs pt-2">
        <button type="button" onClick={() => router.push('/recuperar-senha')} className="text-emerald-700 hover:underline">Esqueceu a senha?</button>
        <button type="button" onClick={() => router.push('/criar-conta')} className="text-emerald-700 hover:underline">Criar conta</button>
      </div>
    </form>
  );
}
