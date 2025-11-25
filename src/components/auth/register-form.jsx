"use client";
import { useState } from "react";
import { registerUser, registerEmpresa, login, fetchMe } from "@/utils/axios";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterForm() {
  const router = useRouter();
  const [tipo, setTipo] = useState('PESSOA_FISICA'); // or EMPRESA
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    cpf: '',
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    endereco: {
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    }
  });

  function updateField(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }
  function updateEndereco(field, value) {
    setForm(f => ({ ...f, endereco: { ...f.endereco, [field]: value } }));
  }

  function validate() {
    if (!form.nome || !form.email || !form.senha || !form.confirmarSenha) return 'Preencha os campos obrigatórios.';
    if (!emailRegex.test(form.email)) return 'Email inválido.';
    if (form.senha.length < 6) return 'Senha deve ter ao menos 6 caracteres.';
    if (form.senha !== form.confirmarSenha) return 'As senhas não coincidem.';
    if (tipo === 'PESSOA_FISICA' && !form.cpf) return 'CPF é obrigatório para pessoa física.';
    if (tipo === 'EMPRESA') {
      if (!form.razaoSocial || !form.cnpj) return 'Razão social e CNPJ são obrigatórios.';
      const e = form.endereco;
      if (!e.logradouro || !e.numero || !e.bairro || !e.cidade || !e.estado || !e.cep) return 'Preencha todos os campos de endereço.';
    }
    return null;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    const v = validate();
    if (v) { setError(v); return; }
    setLoading(true);
    try {
      if (tipo === 'PESSOA_FISICA') {
        await registerUser({
          nome: form.nome,
          email: form.email,
          senha: form.senha,
          telefone: form.telefone,
          cpf: form.cpf,
          tipoUsuario: 'PESSOA_FISICA'
        });
      } else {
        await registerEmpresa({
          nome: form.nome,
          email: form.email,
          senha: form.senha,
          telefone: form.telefone,
          razaoSocial: form.razaoSocial,
          nomeFantasia: form.nomeFantasia || form.razaoSocial,
          cnpj: form.cnpj,
          endereco: form.endereco
        });
      }
      setSuccess('Conta criada com sucesso! Efetuando login...');
      // auto login
      const auth = await login(form.email, form.senha);
      localStorage.setItem('accessToken', auth.accessToken);
      localStorage.setItem('refreshToken', auth.refreshToken);
      const me = await fetchMe();
      const tipoUsuario = me?.tipoUsuario;
      if (tipoUsuario === 'PESSOA_FISICA') router.push('/usuario/home');
      else if (tipoUsuario === 'EMPRESA') router.push('/empresa/home');
      else router.push('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Falha ao criar conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      <div className="flex gap-3 text-xs font-medium">
        <button type="button" onClick={() => setTipo('PESSOA_FISICA')} className={`flex-1 rounded-lg border-2 px-3 py-2 ${tipo==='PESSOA_FISICA' ? 'bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] text-white border-emerald-700' : 'border-zinc-300 text-[#2d5016] hover:border-emerald-600'}`}>Pessoa Física</button>
        <button type="button" onClick={() => setTipo('EMPRESA')} className={`flex-1 rounded-lg border-2 px-3 py-2 ${tipo==='EMPRESA' ? 'bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] text-white border-emerald-700' : 'border-zinc-300 text-[#2d5016] hover:border-emerald-600'}`}>Empresa</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-[#2d5016]">Nome *</label>
          <input value={form.nome} onChange={e=>updateField('nome', e.target.value)} className="w-full rounded-lg border-2 border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:border-emerald-600 focus:bg-white outline-none" placeholder="Seu nome" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#2d5016]">Email *</label>
          <input type="email" value={form.email} onChange={e=>updateField('email', e.target.value)} className="w-full rounded-lg border-2 border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:border-emerald-600 focus:bg-white outline-none" placeholder="email@exemplo.com" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#2d5016]">Telefone</label>
          <input value={form.telefone} onChange={e=>updateField('telefone', e.target.value)} className="w-full rounded-lg border-2 border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:border-emerald-600 focus:bg-white outline-none" placeholder="(11) 99999-9999" />
        </div>
        {tipo==='PESSOA_FISICA' && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2d5016]">CPF *</label>
            <input value={form.cpf} onChange={e=>updateField('cpf', e.target.value)} className="w-full rounded-lg border-2 border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:border-emerald-600 focus:bg-white outline-none" placeholder="000.000.000-00" />
          </div>
        )}
        {tipo==='EMPRESA' && (
          <>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-[#2d5016]">Razão Social *</label>
              <input value={form.razaoSocial} onChange={e=>updateField('razaoSocial', e.target.value)} className="w-full rounded-lg border-2 border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:border-emerald-600 focus:bg-white outline-none" placeholder="Razão Social" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#2d5016]">Nome Fantasia</label>
              <input value={form.nomeFantasia} onChange={e=>updateField('nomeFantasia', e.target.value)} className="w-full rounded-lg border-2 border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:border-emerald-600 focus:bg-white outline-none" placeholder="Nome Fantasia" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#2d5016]">CNPJ *</label>
              <input value={form.cnpj} onChange={e=>updateField('cnpj', e.target.value)} className="w-full rounded-lg border-2 border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:border-emerald-600 focus:bg-white outline-none" placeholder="00.000.000/0000-00" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-[#2d5016]">Endereço *</label>
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={form.endereco.logradouro} onChange={e=>updateEndereco('logradouro', e.target.value)} placeholder="Logradouro" className="rounded-lg border-2 border-zinc-200 bg-zinc-50 px-3 py-2 text-xs focus:border-emerald-600 focus:bg-white outline-none" />
                <input value={form.endereco.numero} onChange={e=>updateEndereco('numero', e.target.value)} placeholder="Número" className="rounded-lg border-2 border-zinc-200 bg-zinc-50 px-3 py-2 text-xs focus:border-emerald-600 focus:bg-white outline-none" />
                <input value={form.endereco.bairro} onChange={e=>updateEndereco('bairro', e.target.value)} placeholder="Bairro" className="rounded-lg border-2 border-zinc-200 bg-zinc-50 px-3 py-2 text-xs focus:border-emerald-600 focus:bg-white outline-none" />
                <input value={form.endereco.cidade} onChange={e=>updateEndereco('cidade', e.target.value)} placeholder="Cidade" className="rounded-lg border-2 border-zinc-200 bg-zinc-50 px-3 py-2 text-xs focus:border-emerald-600 focus:bg-white outline-none" />
                <input value={form.endereco.estado} onChange={e=>updateEndereco('estado', e.target.value)} placeholder="Estado" className="rounded-lg border-2 border-zinc-200 bg-zinc-50 px-3 py-2 text-xs focus:border-emerald-600 focus:bg-white outline-none" />
                <input value={form.endereco.cep} onChange={e=>updateEndereco('cep', e.target.value)} placeholder="CEP" className="rounded-lg border-2 border-zinc-200 bg-zinc-50 px-3 py-2 text-xs focus:border-emerald-600 focus:bg-white outline-none" />
              </div>
            </div>
          </>
        )}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#2d5016]">Senha *</label>
          <div className="relative">
            <input type={showPwd ? 'text' : 'password'} value={form.senha} onChange={e=>updateField('senha', e.target.value)} placeholder="••••••" className="w-full rounded-lg border-2 border-zinc-200 bg-zinc-50 px-4 py-3 text-sm pr-12 focus:border-emerald-600 focus:bg-white outline-none" />
            <button type="button" onClick={()=>setShowPwd(s=>!s)} className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-700">{showPwd ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#2d5016]">Confirmar Senha *</label>
          <div className="relative">
            <input type={showPwd2 ? 'text' : 'password'} value={form.confirmarSenha} onChange={e=>updateField('confirmarSenha', e.target.value)} placeholder="••••••" className="w-full rounded-lg border-2 border-zinc-200 bg-zinc-50 px-4 py-3 text-sm pr-12 focus:border-emerald-600 focus:bg-white outline-none" />
            <button type="button" onClick={()=>setShowPwd2(s=>!s)} className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-700">{showPwd2 ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
          </div>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>}
      {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">{success}</div>}

      <button disabled={loading} className="w-full rounded-lg bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] px-5 py-3 text-sm font-semibold text-white shadow hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2">
        {loading && <Loader2 size={18} className="animate-spin"/>}
        Criar Conta
      </button>

      <div className="text-xs text-center pt-2">
        Já tem uma conta? <button type="button" onClick={()=>router.push('/login')} className="text-emerald-700 hover:underline">Faça login</button>
      </div>
    </form>
  );
}
