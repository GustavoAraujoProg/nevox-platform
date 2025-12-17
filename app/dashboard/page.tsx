// app/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Activity, Clock, CheckCircle, AlertCircle, FileText, 
  MessageSquare, Settings, LogOut, DollarSign, Calendar, ExternalLink, Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('Cliente');
  const [activeTab, setActiveTab] = useState('overview'); // overview, financeiro, projetos
  
  // Dados
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loadingFinance, setLoadingFinance] = useState(false);

  useEffect(() => {
    // 1. Verifica Login
    const token = localStorage.getItem('nevox_token');
    const storedName = localStorage.getItem('nevox_user_name');
    const userId = localStorage.getItem('nevox_user_id');

    if (!token || !userId) {
      router.push('/login');
      return;
    }
    if (storedName) setUserName(storedName.split(' ')[0]);

    // 2. Carrega Financeiro
    fetchInvoices(userId);
  }, []);

  const fetchInvoices = async (userId: string) => {
    setLoadingFinance(true);
    try {
      const res = await fetch('/api/finance/invoices', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.invoices) setInvoices(data.invoices);
    } catch (error) {
      console.error("Erro financeiro", error);
    } finally {
      setLoadingFinance(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  // Função para formatar preço
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Função para traduzir status do Asaas
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'RECEIVED': return { color: 'text-green-500', bg: 'bg-green-500/10', label: 'Pago' };
      case 'PENDING': return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Pendente' };
      case 'OVERDUE': return { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Vencido' };
      default: return { color: 'text-gray-500', bg: 'bg-gray-500/10', label: status };
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 p-6 hidden md:flex flex-col">
        <div className="flex items-center gap-2 mb-10 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold">N</div>
          <span className="text-xl font-bold">Nevox</span>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem 
            icon={<Activity />} label="Visão Geral" 
            active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} 
          />
          <NavItem 
            icon={<DollarSign />} label="Financeiro" 
            active={activeTab === 'financeiro'} onClick={() => setActiveTab('financeiro')} 
          />
          <NavItem 
            icon={<FileText />} label="Projetos" 
            active={activeTab === 'projetos'} onClick={() => setActiveTab('projetos')} 
          />
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 text-gray-400 hover:text-red-500 transition-colors mt-auto">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold">Olá, {userName} 👋</h1>
            <p className="text-gray-400">Painel de Controle</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold">
            {userName.charAt(0)}
          </div>
        </header>

        {/* === ABA: VISÃO GERAL === */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 relative">
              <h3 className="text-xl font-bold mb-4">Status do Projeto</h3>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center gap-4">
                <AlertCircle className="text-purple-400 w-6 h-6" />
                <div>
                  <p className="font-bold text-white">Aguardando Pagamento Inicial</p>
                  <p className="text-sm text-gray-400">Assim que o primeiro pagamento for confirmado, iniciaremos o setup.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6">
               <h3 className="font-bold mb-4">Acesso Rápido</h3>
               <button onClick={() => setActiveTab('financeiro')} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl mb-3 transition-all flex items-center justify-center gap-2">
                 <DollarSign className="w-4 h-4 text-green-400" /> Ver Faturas
               </button>
            </div>
          </div>
        )}

        {/* === ABA: FINANCEIRO (A MÁGICA ACONTECE AQUI) === */}
        {activeTab === 'financeiro' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-end">
               <h2 className="text-2xl font-bold">Histórico de Cobranças</h2>
               <p className="text-sm text-gray-500">Gerenciado pelo Asaas</p>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden">
               {loadingFinance ? (
                 <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-purple-500" />
                    Buscando faturas...
                 </div>
               ) : invoices.length === 0 ? (
                 <div className="p-12 text-center text-gray-500">
                   Nenhuma fatura encontrada. Realize uma assinatura primeiro.
                 </div>
               ) : (
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-b border-white/10 text-gray-400 text-sm">
                       <th className="p-6 font-medium">Data Vencimento</th>
                       <th className="p-6 font-medium">Valor</th>
                       <th className="p-6 font-medium">Forma</th>
                       <th className="p-6 font-medium">Status</th>
                       <th className="p-6 font-medium text-right">Ação</th>
                     </tr>
                   </thead>
                   <tbody>
                     {invoices.map((inv) => {
                       const status = getStatusStyle(inv.status);
                       return (
                         <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                           <td className="p-6 flex items-center gap-2">
                             <Calendar className="w-4 h-4 text-gray-500" />
                             {new Date(inv.dueDate).toLocaleDateString('pt-BR')}
                           </td>
                           <td className="p-6 font-bold">{formatMoney(inv.value)}</td>
                           <td className="p-6 capitalize text-sm text-gray-300">{inv.billingType}</td>
                           <td className="p-6">
                             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${status.bg} ${status.color}`}>
                               {status.label}
                             </span>
                           </td>
                           <td className="p-6 text-right">
                             <a 
                               href={inv.bankSlipUrl || inv.invoiceUrl} 
                               target="_blank"
                               className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 border border-purple-500/30 hover:bg-purple-500/10 px-3 py-2 rounded-lg transition-all"
                             >
                               {inv.status === 'PENDING' ? 'Pagar Agora' : 'Ver Comprovante'} <ExternalLink className="w-3 h-3" />
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
        
      </main>
    </div>
  );
}

// Componente de Navegação Simples
function NavItem({ icon, label, active, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
    >
      {React.cloneElement(icon, { size: 20 })}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}