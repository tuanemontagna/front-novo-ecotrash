"use client";
import { useState } from "react";
import { requestPasswordReset, resetPassword } from "@/utils/axios";
import { Loader2, ArrowLeft, Mail, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RecoverPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email, 2: Code+Pwd, 3: Success
  const [email, setEmail] = useState('');
  
  // Step 2 states
  const [codigo, setCodigo] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSendCode(e) {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Por favor, informe seu email.');
      return;
    }
    if (!emailRegex.test(email)) {
      setError('Email inválido.');
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email);
      setStep(2);
    } catch (err) {
      setError(err?.response?.data?.message || 'Falha ao solicitar código.');
    } finally {
      setLoading(false);
    }
  }

  async function onResetPassword(e) {
    e.preventDefault();
    setError('');

    if (!codigo || codigo.length < 6) {
      setError('Código inválido.');
      return;
    }
    if (senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, codigo, senha);
      setStep(3);
    } catch (err) {
      setError(err?.response?.data?.message || 'Falha ao redefinir senha. Verifique o código.');
    } finally {
      setLoading(false);
    }
  }

  if (step === 3) {
    return (
      <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={32} />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-[#2d5016]">Senha alterada!</h3>
          <p className="text-zinc-600 text-sm">Sua senha foi redefinida com sucesso. Você já pode acessar sua conta.</p>
        </div>
        <Link href="/login" className="block w-full rounded-lg bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] px-5 py-3 text-sm font-semibold text-white shadow hover:brightness-105 text-center">
          Ir para o Login
        </Link>
      </div>
    );
  }

  if (step === 2) {
    return (
      <form onSubmit={onResetPassword} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300" noValidate>
        <div className="space-y-1 text-center">
            <p className="text-sm text-zinc-600">Enviamos um código para <strong>{email}</strong></p>
            <button type="button" onClick={() => setStep(1)} className="text-xs text-emerald-600 hover:underline">Corrigir email</button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#2d5016]">Código de Verificação</label>
          <input 
            type="text" 
            value={codigo} 
            onChange={e => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))} 
            className="w-full rounded-lg border-2 border-zinc-200 bg-zinc-50 px-4 py-3 text-center text-lg tracking-widest font-mono focus:border-emerald-600 focus:bg-white outline-none" 
            placeholder="000000" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#2d5016]">Nova Senha</label>
          <div className="relative">
            <input 
              type={showPwd ? 'text' : 'password'} 
              value={senha} 
              onChange={e => setSenha(e.target.value)} 
              className="w-full rounded-lg border-2 border-zinc-200 bg-zinc-50 px-4 py-3 text-sm pr-12 focus:border-emerald-600 focus:bg-white outline-none" 
              placeholder="••••••" 
            />
            <button type="button" onClick={()=>setShowPwd(s=>!s)} className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-700">
              {showPwd ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#2d5016]">Confirmar Nova Senha</label>
          <div className="relative">
            <input 
              type={showPwd2 ? 'text' : 'password'} 
              value={confirmarSenha} 
              onChange={e => setConfirmarSenha(e.target.value)} 
              className="w-full rounded-lg border-2 border-zinc-200 bg-zinc-50 px-4 py-3 text-sm pr-12 focus:border-emerald-600 focus:bg-white outline-none" 
              placeholder="••••••" 
            />
            <button type="button" onClick={()=>setShowPwd2(s=>!s)} className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-700">
              {showPwd2 ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>}

        <button disabled={loading} className="w-full rounded-lg bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] px-5 py-3 text-sm font-semibold text-white shadow hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2">
          {loading && <Loader2 size={18} className="animate-spin"/>}
          Redefinir Senha
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSendCode} className="space-y-6" noValidate>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#2d5016]">Email</label>
        <div className="relative">
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full rounded-lg border-2 border-zinc-200 bg-zinc-50 px-4 py-3 pl-11 text-sm focus:border-emerald-600 focus:bg-white outline-none" 
            placeholder="email@exemplo.com" 
          />
          <Mail className="absolute left-3 top-3 text-zinc-400" size={20} />
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>}

      <button disabled={loading} className="w-full rounded-lg bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] px-5 py-3 text-sm font-semibold text-white shadow hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2">
        {loading && <Loader2 size={18} className="animate-spin"/>}
        Enviar Código
      </button>

      <div className="text-center pt-2">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-[#2d5016] transition-colors">
          <ArrowLeft size={16} /> Voltar para o login
        </Link>
      </div>
    </form>
  );
}
