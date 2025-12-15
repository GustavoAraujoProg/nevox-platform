"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Clock, CheckCircle, AlertCircle, FileText, 
  MessageSquare, Settings, LogOut, Copy, X 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('Cliente');
  const [loadingPix, setLoadingPix] = useState(false);
  
  // Estados do Modal de Pix
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState<any>(null);

  useEffect(() => {
    // Carrega nome salvo no login
    const storedName = localStorage.getItem('zm_user_name');
    if (storedName) setUserName(storedName);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('zm_access_token');
    router.push('/login');
  };

  // --- FUNÇÃO QUE GERA O PIX ---
  const handleGerarPix = async () => {
    setLoadingPix(true);
    try {
      const response = await fetch('/api/payment/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor: 1.00, // Valor simbólico de teste (R$ 1,00)
          email: 'cliente@email.com', // Em produção, pegaria do banco
          nome: userName
        })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setPixData(data);
        setShowPixModal(true);
      } else {
        alert('Erro ao gerar Pix: ' + (data.error || 'Tente novamente.'));
      }

    } catch (error) {
      alert('Erro de conexão.');
    } finally {
      setLoadingPix(false);
    }
  };

  // Função para copiar o código Pix
  const copyToClipboard = () => {
    navigator.clipboard.writeText(pixData.qr_code);
    alert('Código Pix copiado!');
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex">
      {/* Sidebar Lateral */}
      <aside className="w-64 border-r border-white/10 p-6 hidden md:flex flex-col">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold">N</div>
          <span className="text-xl font-bold">Nevox</span>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem icon={<Activity />} label="Visão Geral" active />
          <NavItem icon={<FileText />} label="Meus Projetos" />
          <NavItem icon={<MessageSquare />} label="Suporte VIP" />
          <NavItem icon={<Settings />} label="Configurações" />
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors mt-auto">
          <LogOut className="w-5 h-5" /> Sair do Sistema
        </button>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold">Olá, {userName} 👋</h1>
            <p className="text-gray-400">Bem-vindo ao seu painel de controle.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500 uppercase font-bold">Status Atual</span>
              <span className="text-yellow-400 flex items-center gap-1 text-sm font-medium">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span> Em Análise
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold">
              {userName.charAt(0)}
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card Principal de Status */}
          <div className="md:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20"><Activity className="w-24 h-24" /></div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <h3 className="text-xl font-bold mb-2">Status do Projeto</h3>
                <p className="text-gray-400">Desenvolvimento Full-Stack</p>
              </div>
              <span className="bg-white/5 px-3 py-1 rounded-full text-xs text-gray-400 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div> Atualização em tempo real
              </span>
            </div>

            {/* Barra de Progresso */}
            <div className="relative pt-8 pb-4 z-10">
              <div className="h-1 bg-gray-800 rounded-full mb-8">
                <div className="h-full bg-purple-600 w-[25%] rounded-full relative">
                  <div className="absolute -right-2 -top-1.5 w-4 h-4 bg-purple-400 rounded-full border-4 border-black shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                </div>
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                <span className="text-purple-400">Briefing</span>
                <span className="text-white">Análise</span>
                <span>Dev</span>
                <span>Entrega</span>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 mt-4 flex items-center gap-4 border border-white/5">
              <AlertCircle className="text-purple-400 w-5 h-5" />
              <p className="text-sm text-gray-300">Nossa equipe está analisando seu briefing. Previsão de início: <span className="text-white font-bold">24 horas.</span></p>
            </div>
          </div>

          {/* Card Lateral - Pagamento */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 flex flex-col">
            <h3 className="font-bold mb-6">Seu Plano</h3>
            
            <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 p-4 rounded-xl mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">Plano Growth</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-[80%]"></div>
              </div>
              <p className="text-[10px] text-gray-500 mt-2">Renova em: 14/01/2026</p>
            </div>

            <button className="w-full py-3 bg-white text-black font-bold rounded-xl mb-3 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
              <MessageSquare className="w-4 h-4" /> Falar no WhatsApp
            </button>
            
            {/* BOTÃO DE PAGAMENTO ATUALIZADO */}
            <button 
              onClick={handleGerarPix} 
              disabled={loadingPix}
              className="w-full py-3 bg-transparent border border-white/20 hover:bg-white/5 text-white font-medium rounded-xl transition-all disabled:opacity-50"
            >
              {loadingPix ? 'Gerando Pix...' : 'Pagar Fatura (Pix)'}
            </button>
          </div>
        </div>

        {/* Linha do Tempo */}
        <div className="mt-8 bg-[#0a0a0a] border border-white/10 rounded-3xl p-8">
          <h3 className="font-bold mb-6">Linha do Tempo</h3>
          <div className="space-y-6 border-l-2 border-white/10 pl-6 ml-2 relative">
             <TimelineItem title="Status Atualizado" desc="Projeto movido para: ANALISE" date="Agora mesmo" active />
             <TimelineItem title="Pagamento Confirmado" desc="Início imediato autorizado" date="Hoje, 12:30" />
             <TimelineItem title="Conta Criada" desc="Bem-vindo à Nevox" date="Hoje, 12:20" />
          </div>
        </div>
      </main>

      {/* MODAL DO PIX (Aparece quando gera o QR Code) */}
      <AnimatePresence>
        {showPixModal && pixData && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-[#111] border border-white/10 p-8 rounded-3xl max-w-md w-full relative shadow-2xl"
            >
              <button onClick={() => setShowPixModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Pagar com Pix 💠</h2>
                <p className="text-gray-400 text-sm">Escaneie o QR Code ou copie o código abaixo para liberar seu projeto.</p>
              </div>

              {/* QR Code Imagem (Base64) */}
              <div className="bg-white p-4 rounded-xl mb-6 mx-auto w-64 h-64 flex items-center justify-center">
                 {pixData.qr_code_base64 ? (
                   <img src={`data:image/png;base64,${pixData.qr_code_base64}`} alt="QR Code Pix" className="w-full h-full object-contain" />
                 ) : (
                   <div className="text-black text-center">QR Code indisponível</div>
                 )}
              </div>

              {/* Código Copia e Cola */}
              <div className="space-y-3">
                <p className="text-xs text-gray-500 uppercase font-bold text-center">Pix Copia e Cola</p>
                <div className="flex gap-2">
                  <input readOnly value={pixData.qr_code} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 text-xs text-gray-400 truncate" />
                  <button onClick={copyToClipboard} className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-green-400 text-sm flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" /> Aguardando pagamento...
                </p>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Componentes menores para limpar o código
function NavItem({ icon, label, active = false }: any) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      {React.cloneElement(icon, { size: 20 })}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function TimelineItem({ title, desc, date, active = false }: any) {
  return (
    <div className="relative">
      <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-[#0a0a0a] ${active ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-gray-800'}`}></div>
      <h4 className={`text-sm font-bold ${active ? 'text-white' : 'text-gray-500'}`}>{title}</h4>
      <p className="text-xs text-gray-600 mt-1">{desc}</p>
      <span className="absolute right-0 top-1 text-[10px] text-gray-700">{date}</span>
    </div>
  );
}