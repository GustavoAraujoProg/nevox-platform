"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, LogOut, Bell, Settings, 
  FileText, MessageSquare, Clock, CheckCircle, 
  AlertCircle, ChevronRight, Zap, Download, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const router = useRouter();
  const [activeView, setActiveView] = useState('visao-geral'); // Estado para navegação
  const [user, setUser] = useState({ name: '', plan: '', status: 'analise' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verificação de segurança inicial
    const token = localStorage.getItem('zm_access_token');
    const savedName = localStorage.getItem('zm_user_name');
    
    if (!token) {
      router.push('/');
      return;
    }

    // 2. Carregar dados iniciais
    const currentStatus = localStorage.getItem('zm_admin_status_gustavo') || 'analise';
    setUser({
      name: savedName || 'Cliente VIP',
      plan: 'Plano Growth',
      status: currentStatus
    });
    setLoading(false);

    // 3. MÁGICA DO TEMPO REAL (Escuta alterações no Admin)
    const handleStorageChange = () => {
      const newStatus = localStorage.getItem('zm_admin_status_gustavo');
      if (newStatus) {
        console.log("Status atualizado em tempo real para:", newStatus);
        setUser(prev => ({ ...prev, status: newStatus }));
      }
    };

    // Adiciona o ouvinte de eventos
    window.addEventListener('storage', handleStorageChange);

    // Limpeza
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('zm_access_token');
    localStorage.removeItem('zm_user_name');
    router.push('/');
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-bold animate-pulse">Carregando ZM Painel...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans flex overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 border-r border-white/10 hidden md:flex flex-col p-6 bg-[#0a0a0a]">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.5)]">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tighter">Nevox</span>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem 
            icon={<LayoutDashboard />} label="Visão Geral" 
            active={activeView === 'visao-geral'} 
            onClick={() => setActiveView('visao-geral')} 
          />
          <NavItem 
            icon={<FileText />} label="Meus Projetos" 
            active={activeView === 'projetos'} 
            onClick={() => setActiveView('projetos')} 
          />
          <NavItem 
            icon={<MessageSquare />} label="Suporte VIP" 
            active={activeView === 'suporte'} 
            onClick={() => setActiveView('suporte')} 
          />
          <NavItem 
            icon={<Settings />} label="Configurações" 
            active={activeView === 'config'} 
            onClick={() => setActiveView('config')} 
          />
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 text-gray-400 hover:text-red-400 transition-colors p-3 rounded-xl hover:bg-white/5 mt-auto"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair do Sistema</span>
        </button>
      </aside>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="flex-1 p-8 overflow-y-auto bg-black relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-purple-900/10 blur-[120px] pointer-events-none"></div>

        {/* Cabeçalho */}
        <header className="flex justify-between items-center mb-10 relative z-10">
          <div>
            <h1 className="text-2xl font-bold">Olá, {user.name.split(' ')[0]} 👋</h1>
            <p className="text-gray-400 text-sm">Bem-vindo ao seu painel de controle.</p>
          </div>
          <div className="flex gap-4 items-center">
             <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status Atual</span>
                <span className={`text-sm font-bold ${
                   user.status === 'analise' ? 'text-yellow-400' : 
                   user.status === 'dev' ? 'text-blue-400' : 'text-green-400'
                }`}>
                   {user.status === 'analise' && '🟡 Em Análise'}
                   {user.status === 'dev' && '🔵 Em Produção'}
                   {user.status === 'entrega' && '🟢 Finalizado'}
                </span>
             </div>
            <button className="p-2 bg-white/5 rounded-full hover:bg-white/10 relative border border-white/5">
              <Bell className="w-5 h-5 text-gray-300" />
              {user.status === 'entrega' && <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>}
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center font-bold border border-white/10 shadow-lg">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* --- CONTEÚDO DINÂMICO (Abas) --- */}
        <div className="relative z-10">
          
          {/* VISÃO GERAL */}
          {activeView === 'visao-geral' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
               <div className="grid lg:grid-cols-3 gap-6 mb-8">
                
                {/* Timeline Card */}
                <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h3 className="text-xl font-bold mb-1 text-white">Status do Projeto</h3>
                      <p className="text-sm text-gray-400">Desenvolvimento Full-Stack</p>
                    </div>
                    {user.status === 'entrega' ? (
                       <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-green-900/20 transition-all">
                          <Download className="w-4 h-4" /> Baixar Projeto
                       </button>
                    ) : (
                       <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-400 flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                          Atualização em tempo real
                       </div>
                    )}
                  </div>

                  {/* TIMELINE VISUAL */}
                  <div className="relative px-4">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full -z-10"></div>
                    <div 
                      className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-500 -translate-y-1/2 rounded-full transition-all duration-1000 ease-in-out shadow-[0_0_20px_rgba(147,51,234,0.5)]"
                      style={{ width: user.status === 'analise' ? '15%' : user.status === 'dev' ? '50%' : '100%' }}
                    ></div>

                    <div className="flex justify-between relative">
                      <TimelinePoint label="Briefing" active={true} />
                      <TimelinePoint label="Análise" active={true} current={user.status === 'analise'} />
                      <TimelinePoint label="Dev" active={user.status === 'dev' || user.status === 'entrega'} current={user.status === 'dev'} />
                      <TimelinePoint label="Entrega" active={user.status === 'entrega'} current={user.status === 'entrega'} />
                    </div>
                  </div>

                  <div className="mt-10 bg-white/5 rounded-xl p-4 text-sm text-gray-300 flex gap-4 items-center border border-white/5">
                    <AlertCircle className="w-6 h-6 text-purple-400 shrink-0" />
                    <div>
                      {user.status === 'analise' && <p>Nossa equipe está analisando seu briefing. Previsão de início: <strong>24 horas</strong>.</p>}
                      {user.status === 'dev' && <p>Mãos à obra! Estamos codando seu projeto. Fique atento às atualizações.</p>}
                      {user.status === 'entrega' && <p className="text-green-400">Seu projeto está pronto! Clique no botão acima para acessar os arquivos.</p>}
                    </div>
                  </div>
                </div>

                {/* Plano Card */}
                <div className="bg-[#111] border border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
                  <div>
                    <h3 className="text-lg font-bold mb-4">Seu Plano</h3>
                    <div className="bg-gradient-to-br from-gray-800 to-black border border-purple-500/30 p-5 rounded-2xl mb-6 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-purple-500/30 transition-all"></div>
                      <div className="flex justify-between items-center mb-2 relative z-10">
                        <span className="font-bold text-white text-lg">{user.plan}</span>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-2">
                        <div className="w-full h-full bg-green-500"></div>
                      </div>
                      <p className="text-xs text-gray-400">Renova em: 14/01/2026</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button onClick={() => window.open('https://wa.me/seunumero', '_blank')} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-lg">
                      <MessageSquare className="w-4 h-4" />
                      Falar no WhatsApp
                    </button>
                    <button className="w-full py-3 bg-transparent border border-white/10 text-white font-medium rounded-xl hover:bg-white/5 transition-colors">
                      Faturas
                    </button>
                  </div>
                </div>
               </div>

               {/* Atividades Recentes */}
               <div className="bg-[#111] border border-white/10 rounded-3xl p-8">
                 <h3 className="text-lg font-bold mb-6">Linha do Tempo</h3>
                 <div className="space-y-0 relative border-l border-white/10 ml-4 pl-8 pb-4">
                    <ActivityItem title="Status Atualizado" desc={`Projeto movido para: ${user.status.toUpperCase()}`} date="Agora mesmo" active />
                    <ActivityItem title="Pagamento Confirmado" desc="Início imediato autorizado" date="Hoje, 12:30" />
                    <ActivityItem title="Conta Criada" desc="Bem-vindo à Nevox" date="Hoje, 12:20" />
                 </div>
               </div>
             </motion.div>
          )}

          {/* MEUS PROJETOS */}
          {activeView === 'projetos' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h2 className="text-3xl font-bold">Meus Projetos</h2>
              <div className="bg-[#111] border border-white/10 rounded-2xl p-6 flex items-center gap-6 hover:border-purple-500/50 transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">Sistema SaaS {user.plan}</h3>
                  <p className="text-gray-400 text-sm">Desenvolvimento Web • React & Node.js</p>
                </div>
                <div className="text-right">
                   <div className="text-xs text-gray-500 uppercase font-bold mb-1">Status</div>
                   <div className="text-purple-400 font-bold">{user.status === 'analise' ? 'Em Análise' : user.status === 'dev' ? 'Em Produção' : 'Concluído'}</div>
                </div>
                <ChevronRight className="text-gray-600 group-hover:text-white transition-colors" />
              </div>

              {/* Projeto Bloqueado (Upsell) */}
              <div className="bg-[#111]/50 border border-white/5 rounded-2xl p-6 flex items-center gap-6 opacity-60">
                <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-gray-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1 text-gray-500">Aplicativo Mobile</h3>
                  <p className="text-gray-600 text-sm">Disponível no plano Enterprise</p>
                </div>
                <button onClick={() => alert("Contate o comercial!")} className="px-4 py-2 border border-white/10 rounded-lg text-sm hover:bg-white/10">
                  Fazer Upgrade
                </button>
              </div>
            </motion.div>
          )}

          {/* SUPORTE */}
          {activeView === 'suporte' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center py-10">
              <div className="w-24 h-24 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-500">
                <MessageSquare className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Suporte Premium</h2>
              <p className="text-gray-400 mb-8">Como cliente {user.plan}, você tem prioridade na fila de atendimento. Nos chame agora e fale com um humano.</p>
              
              <button 
                onClick={() => window.open('https://wa.me/', '_blank')}
                className="bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-lg px-8 py-4 rounded-full shadow-[0_0_30px_rgba(37,211,102,0.3)] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 mx-auto"
              >
                <MessageSquare className="w-6 h-6" />
                Iniciar Chat no WhatsApp
              </button>
              
              <p className="text-xs text-gray-600 mt-6">Tempo médio de resposta: 5 minutos</p>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

function NavItem({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all w-full text-left
      ${active ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
    >
      <div className="w-5 h-5">{icon}</div>
      <span className="font-medium">{label}</span>
    </button>
  )
}

function TimelinePoint({ label, active, current }: any) {
  return (
    <div className="flex flex-col items-center gap-3 z-10 relative group">
      <div className={`
        w-5 h-5 rounded-full border-4 transition-all duration-500 flex items-center justify-center bg-black
        ${current ? 'border-purple-500 scale-125 shadow-[0_0_20px_rgba(147,51,234,0.8)]' : 
          active ? 'border-purple-600' : 'border-gray-700'}
      `}>
        {active && !current && <div className="w-2 h-2 bg-purple-600 rounded-full"></div>}
      </div>
      <span className={`text-xs font-bold uppercase tracking-wider transition-colors absolute top-8 w-24 text-center ${current ? 'text-white' : active ? 'text-purple-300' : 'text-gray-600'}`}>
        {label}
      </span>
    </div>
  )
}

function ActivityItem({ title, desc, date, active }: any) {
  return (
    <div className="relative mb-8 last:mb-0">
       <div className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 bg-black ${active ? 'border-purple-500 shadow-[0_0_10px_rgba(147,51,234,0.5)]' : 'border-gray-700'}`}></div>
       <div className="flex justify-between items-start">
         <div>
            <h4 className={`font-bold ${active ? 'text-white' : 'text-gray-400'}`}>{title}</h4>
            <p className="text-sm text-gray-500">{desc}</p>
         </div>
         <span className="text-xs text-gray-600">{date}</span>
       </div>
    </div>
  )
}