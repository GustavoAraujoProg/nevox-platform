// app/pagamento/sucesso/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2, Zap } from 'lucide-react';

export default function PagamentoSucesso() {
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState('Verificando seu pagamento...');

  useEffect(() => {
    verificarPagamento();
  }, []);

  const verificarPagamento = async () => {
    try {
      const userId = localStorage.getItem('nevox_user_id');
      
      if (!userId) {
        throw new Error('Usuário não identificado');
      }

      // Aguarda 2 segundos pro webhook do Asaas processar
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Busca o status atualizado do usuário
      const response = await fetch('/api/user/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();

      // Verifica se o pagamento foi confirmado
      if (data.user?.hasActivePlan) {
        setStatus('success');
        setMessage('Pagamento confirmado! Redirecionando...');
        
        // Aguarda 3 segundos e redireciona pro Dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        // Se ainda não confirmou, tenta de novo em 5 segundos
        setTimeout(() => {
          verificarPagamento();
        }, 5000);
      }

    } catch (error) {
      setStatus('error');
      setMessage('Erro ao verificar pagamento. Tente fazer login novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-green-600/20 blur-[120px]"></div>
      
      <div className="relative z-10 max-w-lg w-full bg-[#0a0a0a] border border-white/10 rounded-3xl p-12 text-center shadow-2xl">
        
        {status === 'checking' && (
          <>
            <div className="w-24 h-24 mx-auto mb-6 bg-blue-500/10 rounded-full flex items-center justify-center animate-pulse">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Verificando Pagamento</h1>
            <p className="text-gray-400 mb-8">{message}</p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Aguarde alguns instantes...</span>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-24 h-24 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center animate-in zoom-in">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-green-400">Pagamento Confirmado! 🎉</h1>
            <p className="text-gray-400 mb-8">{message}</p>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-24 h-24 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-red-400">Ops! Algo deu errado</h1>
            <p className="text-gray-400 mb-8">{message}</p>
            <button 
              onClick={() => router.push('/login')}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
            >
              Voltar ao Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}