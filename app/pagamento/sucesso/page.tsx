// app/pagamento/sucesso/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2, Zap, ArrowRight, RefreshCw } from 'lucide-react';

export default function PagamentoSucesso() {
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'success' | 'waiting'>('checking');
  const [message, setMessage] = useState('Verificando seu pagamento...');
  const [tentativas, setTentativas] = useState(0);

  useEffect(() => {
    verificarPagamento();
  }, []);

  const verificarPagamento = async () => {
    try {
      const userId = localStorage.getItem('nevox_user_id');
      
      if (!userId) {
        // Se não tiver userId, espera o usuário fazer login manualmente
        setStatus('waiting');
        setMessage('Faça login para acessar seu painel');
        return;
      }

      // Busca o status do usuário
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
        
        // Aguarda 2 segundos e redireciona
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        // Se ainda não confirmou e tentou menos de 12 vezes (1 minuto)
        if (tentativas < 12) {
          setMessage(`Aguardando confirmação... (${tentativas + 1}/12)`);
          setTentativas(prev => prev + 1);
          
          // Tenta de novo em 5 segundos
          setTimeout(() => {
            verificarPagamento();
          }, 5000);
        } else {
          // Depois de 1 minuto, mostra botão manual
          setStatus('waiting');
          setMessage('O pagamento pode levar alguns minutos. Você pode aguardar ou voltar depois.');
        }
      }

    } catch (error) {
      setStatus('waiting');
      setMessage('Erro ao verificar. Tente acessar seu dashboard em alguns minutos.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/20 blur-[120px]"></div>
      
      <div className="relative z-10 max-w-lg w-full bg-[#0a0a0a] border border-white/10 rounded-3xl p-12 text-center shadow-2xl">
        
        {/* VERIFICANDO PAGAMENTO */}
        {status === 'checking' && (
          <>
            <div className="w-24 h-24 mx-auto mb-6 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Verificando Pagamento</h1>
            <p className="text-gray-400 mb-8">{message}</p>
            
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 text-sm text-blue-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="font-bold">Já pagou?</span>
              </div>
              <p className="text-xs text-gray-400">
                A confirmação pode levar de 10 segundos a 5 minutos. Estamos checando automaticamente...
              </p>
            </div>
          </>
        )}

        {/* PAGAMENTO CONFIRMADO */}
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

        {/* AGUARDANDO MANUALMENTE */}
        {status === 'waiting' && (
          <>
            <div className="w-24 h-24 mx-auto mb-6 bg-yellow-500/10 rounded-full flex items-center justify-center">
              <RefreshCw className="w-12 h-12 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-yellow-400">Quase lá!</h1>
            <p className="text-gray-400 mb-8">{message}</p>
            
            <div className="space-y-4">
              <button 
                onClick={() => {
                  setStatus('checking');
                  setTentativas(0);
                  verificarPagamento();
                }}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                Verificar Novamente
              </button>
              
              <button 
                onClick={() => router.push('/dashboard')}
                className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                Ir para Dashboard
                <ArrowRight className="w-5 h-5" />
              </button>

              <button 
                onClick={() => router.push('/')}
                className="w-full text-gray-500 hover:text-white text-sm py-2"
              >
                Voltar ao Início
              </button>
            </div>

            <div className="mt-8 bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 text-xs text-purple-200">
              <p className="font-bold mb-1">💡 Dica:</p>
              <p>Se você acabou de pagar, aguarde 1-2 minutos e clique em "Verificar Novamente".</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}