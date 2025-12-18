// app/login/page.tsx
"use client";

import React, { useState } from 'react';
import { User, Mail, Lock, FileText, Phone, ArrowRight, Loader2, AlertTriangle, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: '', cpf: '', email: '', phone: '', password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async () => {
    setIsLoading(true); setErrorMsg("");
    try {
      if (isRegister) {
        if (!formData.name || !formData.email || !formData.password || !formData.cpf || !formData.phone) throw new Error("Preencha todos os campos.");
        const res = await fetch('/api/auth/register', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: formData.name, email: formData.email, password: formData.password, cpf: formData.cpf.replace(/\D/g, ''), telefone: formData.phone.replace(/\D/g, '') })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao cadastrar.");
        localStorage.setItem('nevox_token', 'true'); localStorage.setItem('nevox_user_id', data.userId); localStorage.setItem('nevox_user_name', formData.name);
        router.push('/dashboard');
      } else {
        if (!formData.email || !formData.password) throw new Error("Preencha email e senha.");
        const res = await fetch('/api/auth/login', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Email ou senha inválidos.");
        localStorage.setItem('nevox_token', data.token); localStorage.setItem('nevox_user_id', data.userId); localStorage.setItem('nevox_user_name', data.name);
        if(data.role === 'admin') router.push('/admin'); else router.push('/dashboard');
      }
    } catch (error: any) { setErrorMsg(error.message); } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px]">
        
        {/* LADO ESQUERDO (Visual - Escondido no Celular 'hidden md:flex') */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-purple-900/20 to-black p-10 flex-col justify-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
           <h1 className="text-4xl font-bold mb-4 relative z-10">{isRegister ? 'Crie sua Conta' : 'Bem-vindo de volta'} <br /><span className="text-purple-500">Painel Nevox.</span></h1>
           <p className="text-gray-400 text-lg leading-relaxed relative z-10">{isRegister ? "Gerencie seus projetos e automações em um só lugar." : "Acesse seu dashboard para acompanhar projetos e faturas."}</p>
        </div>

        {/* LADO DIREITO (Formulário - Ocupa tudo no celular) */}
        <div className="w-full md:w-1/2 p-6 md:p-10 bg-[#0a0a0a] flex flex-col justify-center">
          
          {/* Logo visível só no celular */}
          <div className="md:hidden mb-8 text-center">
             <h1 className="text-2xl font-bold">Nevox <span className="text-purple-500">Tech</span></h1>
             <p className="text-gray-500 text-sm">Acesse sua conta</p>
          </div>

          <div className="flex gap-4 mb-8 bg-white/5 p-1 rounded-xl">
             <button onClick={() => { setIsRegister(false); setErrorMsg(""); }} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${!isRegister ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400'}`}>Login</button>
             <button onClick={() => { setIsRegister(true); setErrorMsg(""); }} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${isRegister ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400'}`}>Cadastro</button>
          </div>

          <div className="space-y-4">
            {isRegister && (
                <>
                    <div className="bg-white/5 border border-white/10 rounded-xl flex items-center px-4">
                        <User className="text-gray-500 w-5 h-5 shrink-0" />
                        <input name="name" placeholder="Nome Completo" onChange={handleChange} className="w-full bg-transparent p-4 outline-none text-white placeholder:text-gray-600"/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-xl flex items-center px-4">
                            <FileText className="text-gray-500 w-5 h-5 shrink-0" />
                            <input name="cpf" placeholder="CPF" maxLength={14} onChange={handleChange} className="w-full bg-transparent p-4 outline-none text-white placeholder:text-gray-600"/>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl flex items-center px-4">
                            <Phone className="text-gray-500 w-5 h-5 shrink-0" />
                            <input name="phone" placeholder="Celular" onChange={handleChange} className="w-full bg-transparent p-4 outline-none text-white placeholder:text-gray-600"/>
                        </div>
                    </div>
                </>
            )}

            <div className="bg-white/5 border border-white/10 rounded-xl flex items-center px-4">
               <Mail className="text-gray-500 w-5 h-5 shrink-0" />
               <input name="email" type="email" placeholder="seu@email.com" onChange={handleChange} className="w-full bg-transparent p-4 outline-none text-white placeholder:text-gray-600"/>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl flex items-center px-4">
               <Lock className="text-gray-500 w-5 h-5 shrink-0" />
               <input name="password" type="password" placeholder="Senha" onChange={handleChange} className="w-full bg-transparent p-4 outline-none text-white placeholder:text-gray-600"/>
            </div>
          </div>

          {errorMsg && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {errorMsg}</div>}

          <button onClick={handleAuth} disabled={isLoading} className="w-full mt-8 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (isRegister ? <>Criar Conta <ArrowRight className="w-5 h-5" /></> : <>Entrar <LogIn className="w-5 h-5" /></>)}
          </button>
        </div>
      </div>
    </div>
  );
}