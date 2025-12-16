"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ArrowLeft, ArrowRight, Loader2, Building2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const BackgroundGrid = () => (
  <div className="fixed inset-0 z-0 overflow-hidden bg-black pointer-events-none">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px]"></div>
    <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/20 blur-[120px]"></div>
  </div>
);

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // Estado para erros
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    cpf: ''
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage(''); // Limpa erro ao digitar
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
if (!isLogin) {
      try {
        console.log("Enviando dados..."); // Debug no navegador
        
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Cadastro realizado! Agora faça login.");
          setIsLogin(true);
          setFormData({ ...formData, senha: '' });
        } else {
          // Mostra o erro que veio da API
          alert("Erro: " + data.error);
        }
      } catch (error) {
        console.error(error);
        alert("Erro de conexão. Verifique se o terminal do VS Code mostra algum erro.");
      } finally {
        setIsLoading(false); // <--- OBRIGATÓRIO: Desliga o loading aconteça o que acontecer
      }
      return;
    }
    // --- LÓGICA DE LOGIN ---
    // (Por enquanto simulada para Usuários, Real para Admin)
    setTimeout(() => {
      if (isLogin) {
        // 1. Admin
        if (formData.email === 'admin@nevox.com') {
           if (formData.senha === 'admin') {
              localStorage.setItem('te_access_token', 'admin_token');
              router.push('/admin');
           } else {
              setErrorMessage("Senha incorreta para Administrador.");
              setIsLoading(false);
           }
           return;
        }

        // 2. Cliente (Simulação temporária até criarmos a API de Login)
        // Isso permite você testar o dashboard logo após criar a conta
        localStorage.setItem('te_access_token', 'true');
        
        // Se não tiver nome salvo, tenta usar o do form ou um genérico
        if (!localStorage.getItem('te_user_name')) {
             localStorage.setItem('te_user_name', formData.nome || 'Cliente TeVox');
        }

        router.push('/dashboard');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4 relative">
      <BackgroundGrid />
      
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors z-50 bg-black/50 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
        <ArrowLeft className="w-4 h-4" /> <span className="text-sm">Voltar</span>
      </Link>

      <div className="w-full max-w-4xl grid md:grid-cols-2 bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10 min-h-[600px]">
        
        <div className="relative hidden md:flex flex-col justify-center p-12 bg-purple-900/10 border-r border-white/5">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
          <h2 className="text-4xl font-bold mb-6 leading-tight">Acesse o <br/><span className="text-purple-400">Painel TeVox.</span></h2>
          <p className="text-gray-400 mb-8 text-lg">Gerencie seus projetos e automações em um só lugar com inteligência e segurança.</p>
          
          <div className="mt-auto flex items-center gap-4 text-sm text-gray-500">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-black"></div>
              <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-black"></div>
              <div className="w-8 h-8 rounded-full bg-gray-600 border-2 border-black flex items-center justify-center text-[10px]">+2k</div>
            </div>
            <p>Empresas já cadastradas</p>
          </div>
        </div>

        <div className="p-8 md:p-12 flex flex-col justify-center bg-[#0a0a0a]">
          
          <div className="flex bg-white/5 p-1 rounded-xl mb-8 w-full">
            <button onClick={() => { setIsLogin(true); setErrorMessage(''); }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${isLogin ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Login</button>
            <button onClick={() => { setIsLogin(false); setErrorMessage(''); }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${!isLogin ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Cadastro</button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <AnimatePresence mode='wait'>
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }} 
                  className="space-y-4 overflow-hidden"
                >
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    <input name="nome" required onChange={handleChange} placeholder="Nome Completo" className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:bg-white/10 transition-all" />
                  </div>
                  
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    <input name="cpf" required onChange={handleChange} placeholder="CNPJ ou CPF" className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:bg-white/10 transition-all" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <input name="email" type="email" required onChange={handleChange} placeholder="Seu E-mail Corporativo" className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:bg-white/10 transition-all" />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <input name="senha" type="password" required onChange={handleChange} placeholder="Sua Senha" className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:bg-white/10 transition-all" />
            </div>

            {/* Mensagem de Erro (Se houver) */}
            {errorMessage && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4" /> {errorMessage}
              </div>
            )}

            <button disabled={isLoading} className="w-full h-12 mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Acessar Conta' : 'Criar Conta Grátis')}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-600">
            Ao se cadastrar, você concorda com os <a href="#" className="text-gray-400 hover:text-white underline">Termos de Uso</a> da TeVox.
          </p>
        </div>
      </div>
    </div>
  );
}