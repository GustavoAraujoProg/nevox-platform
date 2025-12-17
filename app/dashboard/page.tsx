// app/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Activity, Clock, CheckCircle, AlertCircle, FileText, 
  MessageSquare, Settings, LogOut, DollarSign, Calendar, 
  ExternalLink, Loader2, LayoutDashboard, CreditCard
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  
  // --- ESTADOS ---
  const [userData, setUserData] = useState<any>(null); // Dados do Usuário
  const [invoices, setInvoices] = useState<any[]>([]); // Faturas
  const [activeTab, setActiveTab] = useState('overview'); // Abas
  
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingFinance, setLoadingFinance] = useState(false);

  // --- CARREGAMENTO INICIAL ---
  useEffect(() => {
    const token = localStorage.getItem('nevox_token');
    const userId = localStorage.getItem('nevox_user_id');

    if (!token || !userId) {
      router.push('/login'); 
      return;
    }

    fetchUserData(userId);
    fetchInvoices(userId);
  }, []);

  // --- APIs ---
  const fetchUserData = async (userId: string) => {
    try {
      const res = await fetch('/api/user/me', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.user) setUserData(data.user);
    } catch (e) {
      console.error("Erro user", e);
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchInvoices = async (userId: string) => {
    setLoadingFinance(true);
    try {
      const res = await fetch('/api/finance/invoices', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.invoices) setInvoices(data.invoices);
    } catch (e) {
      console.error("Erro financeiro", e);
    } finally {
      setLoadingFinance(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  // --- INTELIGÊNCIA DA BARRA DE PROGRESSO (Mágica do Admin) ---
  const getProgress = (stage: string) => {
    // Define a cor e tamanho da barra baseado no que o Admin mandou
    switch(stage) {
        case 'dev': return { width: '60%', color: 'from-blue-600 to-cyan-500', label: 'Em Desenvolvimento' };
        case 'entrega': return { width: '100%', color: 'from-green-600 to-emerald-500', label: 'Projeto Entregue' };
        default: return { width: '15%', color: 'from-purple-600 to-indigo-500', label: 'Análise Inicial' };
    }
  };

  const progressInfo = getProgress(userData?.projectStage || 'analise');

  // --- FORMATADORES ---
  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR');
  
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'RECEIVED': case 'CONFIRMED': return { color: 'text-green-500', bg: 'bg-green-500/10', label: 'Pago' };
      case 'PENDING': return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Pendente' };
      case 'OVERDUE': return { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Vencido' };
      default: return { color: 'text-gray-500', bg: 'bg-gray-500/10', label: status };
    }
  };

  if (loadingUser) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-purple-600 w-10 h-10"/></div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans flex">
      
      {/* SIDEBAR (Seu Layout Original) */}
      <aside className="w-64 border-r border-white/10 p-6 hidden md:flex flex-col bg-[#0a0a0a]">
        <div className="flex items-center gap-2 mb-10 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold shadow-[0_0_15px_rgba(147,51,234,0.5)]">N</div>
          <span className="text-xl font-bold tracking-tight">Nevox</span>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem icon={<LayoutDashboard />} label="Visão Geral" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={<DollarSign />} label="Financeiro" active={activeTab === 'financeiro'} onClick={() => setActiveTab('financeiro')} />
          <NavItem icon={<FileText />} label="Projetos" active={activeTab === 'projetos'} onClick={() => setActiveTab('projetos')} />
          <NavItem icon={<Settings />} label="Configurações" active={activeTab === 'config'} onClick={() => setActiveTab('config')} />
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 text-gray-500 hover:text-red-500 transition-colors mt-auto p-2 rounded-lg hover:bg-white/5">
          <LogOut className="w-5 h-5" /> <span className="font-medium">Sair</span>
        </button>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Olá, {userData?.name?.split(' ')[0]} 👋</h1>
            <p className="text-gray-400 mt-1">Plano Atual: <strong className="text-purple-400">{userData?.plan === 'None' ? 'Nenhum' : userData?.plan}</strong></p>
          </div>
          <div className="flex items-center gap-4">
             {userData?.status === 'ACTIVE' ? (
                <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-500 text-xs font-bold uppercase flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Ativo
                </div>
             ) : (
                <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 text-xs font-bold uppercase flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div> Pendente
                </div>
             )}
             <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white shadow-lg">{userData?.name?.charAt(0)}</div>
          </div>
        </header>

        {/* VISÃO GERAL */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            {userData?.plan === 'None' ? (
               <div className="bg-gradient-to-r from-gray-900 to-black border border-white/10 rounded-3xl p-8 text-center">
                  <h2 className="text-xl font-bold mb-2">Nenhum plano ativo</h2>
                  <p className="text-gray-400 mb-6">Assine um plano para iniciar seu projeto.</p>
                  <button onClick={() => router.push('/assinatura')} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold transition-all">Ver Planos</button>
               </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                 {/* CARD DE STATUS (Com a lógica injetada aqui) */}
                 <div className="md:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity"><Activity className="w-32 h-32 text-purple-500" /></div>
                    
                    <h3 className="text-xl font-bold mb-1">Status do Projeto</h3>
                    <p className="text-sm text-gray-500 mb-8">{progressInfo.label}</p>

                    <div className="relative pt-6 pb-2">
                      <div className="h-2 bg-gray-800 rounded-full mb-8 overflow-hidden">
                        {/* AQUI A BARRA SE MEXE SOZINHA */}
                        <div 
                            className={`h-full bg-gradient-to-r ${progressInfo.color} rounded-full relative shadow-[0_0_15px_rgba(147,51,234,0.5)] transition-all duration-1000 ease-out`}
                            style={{ width: progressInfo.width }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                        <span className={userData?.projectStage === 'analise' || !userData?.projectStage ? 'text-white' : 'text-gray-600'}>Início</span>
                        <span className={userData?.projectStage === 'dev' ? 'text-blue-400' : 'text-gray-600'}>Desenvolvimento</span>
                        <span className={userData?.projectStage === 'entrega' ? 'text-green-400' : 'text-gray-600'}>Entrega</span>
                      </div>
                    </div>
                 </div>

                 {/* Card Acesso Rápido */}
                 <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 flex flex-col justify-center">
                    <h3 className="font-bold mb-4">Acesso Rápido</h3>
                    <button onClick={() => setActiveTab('financeiro')} className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl mb-3 transition-all flex items-center justify-center gap-3 text-sm font-medium">
                      <DollarSign className="w-4 h-4 text-green-400" /> Faturas & 2ª Via
                    </button>
                    <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all flex items-center justify-center gap-3 text-sm font-medium">
                      <MessageSquare className="w-4 h-4 text-blue-400" /> Falar com Suporte
                    </button>
                 </div>
              </div>
            )}
          </div>
        )}

        {/* FINANCEIRO */}
        {activeTab === 'financeiro' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-between items-end">
               <div><h2 className="text-2xl font-bold">Financeiro</h2><p className="text-sm text-gray-500">Histórico de pagamentos.</p></div>
               <div className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-lg border border-white/5">Ambiente Seguro Asaas</div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden min-h-[300px]">
               {loadingFinance ? (
                 <div className="h-full flex flex-col items-center justify-center p-20 text-gray-500 gap-3"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /> Buscando faturas...</div>
               ) : invoices.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center p-20 text-gray-500 gap-3"><FileText className="w-12 h-12 opacity-20" /><p>Nenhuma fatura encontrada.</p></div>
               ) : (
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-b border-white/10 text-gray-500 text-xs uppercase tracking-wider">
                       <th className="p-6">Vencimento</th><th className="p-6">Valor</th><th className="p-6">Método</th><th className="p-6">Status</th><th className="p-6 text-right">Ação</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                     {invoices.map((inv) => {
                       const status = getStatusStyle(inv.status);
                       return (
                         <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                           <td className="p-6 flex items-center gap-2 text-sm text-gray-300"><Calendar className="w-4 h-4 text-gray-600" />{formatDate(inv.dueDate)}</td>
                           <td className="p-6 font-bold text-white">{formatMoney(inv.value)}</td>
                           <td className="p-6 capitalize text-sm text-gray-400 flex items-center gap-2">
                              {inv.billingType === 'PIX' ? <DollarSign className="w-4 h-4 text-yellow-500"/> : <CreditCard className="w-4 h-4 text-purple-500"/>}
                              {inv.billingType}
                           </td>
                           <td className="p-6"><span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${status.bg} ${status.color}`}>{status.label}</span></td>
                           <td className="p-6 text-right">
                             <a href={inv.bankSlipUrl || inv.invoiceUrl} target="_blank" className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-white border border-purple-500/30 hover:bg-purple-600 px-4 py-2 rounded-lg transition-all">
                               {inv.status === 'PENDING' ? 'Pagar' : 'Comprovante'} <ExternalLink className="w-3 h-3" />
                             </a>
                           </td>
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
               )}
            </div>
          </div>
        )}

        {/* PROJETOS (Placeholder) */}
        {activeTab === 'projetos' && (
           <div className="flex flex-col items-center justify-center h-[50vh] text-center animate-in fade-in">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6"><Settings className="w-10 h-10 text-gray-600" /></div>
              <h2 className="text-2xl font-bold mb-2">Painel de Projetos</h2>
              <p className="text-gray-400 max-w-md">Em breve você poderá acompanhar cada tarefa.</p>
           </div>
        )}

      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: any) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all mb-1 ${active ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      {React.cloneElement(icon, { size: 20 })} <span className="text-sm font-medium">{label}</span>
    </div>
  );
}