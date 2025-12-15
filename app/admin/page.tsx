"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, DollarSign, Activity, Search, Filter, 
  MoreVertical, CheckCircle, Clock, AlertCircle, 
  ChevronRight, FileText, TrendingUp, Bell
} from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Estado dos clientes (Simulando Banco de Dados)
  const [clientes, setClientes] = useState([
    { 
      id: 1, 
      nome: 'Gustavo Santos', 
      plano: 'Growth', 
      projeto: 'Sistema SaaS', 
      valor: 'R$ 499,00',
      status: 'analise',
      data: '14/12/2025'
    },
    { 
      id: 2, 
      nome: 'Imobiliária Silva', 
      plano: 'Start', 
      projeto: 'Site Institucional', 
      valor: 'R$ 199,00', 
      status: 'dev',
      data: '13/12/2025'
    },
  ]);

  // Carrega status salvo anteriormente
  useEffect(() => {
    const savedStatus = localStorage.getItem('zm_admin_status_gustavo');
    if (savedStatus) {
      setClientes(prev => prev.map(c => c.id === 1 ? { ...c, status: savedStatus } : c));
    }
  }, []);

  // --- MÁGICA DE CONTROLE ---
  const toggleStatus = (id: number) => {
    setClientes(prev => prev.map(cliente => {
      if (cliente.id === id) {
        let newStatus = 'analise';
        if (cliente.status === 'analise') newStatus = 'dev';
        else if (cliente.status === 'dev') newStatus = 'entrega';
        
        // Salva e dispara evento para outras abas
        if (id === 1) {
          localStorage.setItem('zm_admin_status_gustavo', newStatus);
          // Força atualização manual do evento de storage para a mesma janela (se necessário)
          window.dispatchEvent(new Event("storage"));
        }

        return { ...cliente, status: newStatus };
      }
      return cliente;
    }));
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans flex overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-20 lg:w-64 border-r border-white/10 flex flex-col bg-black transition-all duration-300">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-white">ZM</div>
          <span className="font-bold text-xl tracking-tighter hidden lg:block">Admin</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<Activity />} label="Visão Geral" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Users />} label="Clientes" active={activeTab === 'clientes'} onClick={() => setActiveTab('clientes')} />
          <NavItem icon={<DollarSign />} label="Financeiro" active={activeTab === 'financeiro'} onClick={() => setActiveTab('financeiro')} />
          <NavItem icon={<FileText />} label="Chamados" active={activeTab === 'chamados'} onClick={() => setActiveTab('chamados')} />
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center font-bold text-xs">AD</div>
            <div className="hidden lg:block">
              <p className="text-sm font-bold">Admin</p>
              <p className="text-xs text-green-400">Online</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto bg-[#09090b]">
        
        {/* Header Comum */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold capitalize">{activeTab}</h1>
            <p className="text-gray-400">Gestão em tempo real do sistema.</p>
          </div>
          <button className="p-2 bg-white/5 rounded-full hover:bg-white/10 relative">
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>
        </header>

        {/* --- CONTEÚDO DINÂMICO --- */}
        
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <MetricCard title="Receita Mensal" value="R$ 12.450" change="+15%" positive icon={<DollarSign className="text-green-400" />} />
              <MetricCard title="Projetos Ativos" value="14" change="+2" positive icon={<Activity className="text-blue-400" />} />
              <MetricCard title="Novos Clientes" value="3" change="+1" positive icon={<Users className="text-purple-400" />} />
            </div>

            {/* Tabela Principal */}
            <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-lg">Gerenciamento de Pedidos</h3>
                <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                   <span className="text-xs text-gray-400">Sincronização Ativa</span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5 text-gray-400 text-xs uppercase font-medium">
                    <tr>
                      <th className="p-4">Cliente</th>
                      <th className="p-4">Plano / Projeto</th>
                      <th className="p-4">Status (Controle)</th>
                      <th className="p-4 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {clientes.map((c) => (
                      <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                        <td className="p-4 font-medium flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center font-bold text-xs">
                            {c.nome.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-bold">{c.nome}</p>
                            <p className="text-xs text-gray-500">{c.data}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded text-xs font-bold mr-2">{c.plano}</span>
                          <span className="text-gray-400 text-xs">{c.projeto}</span>
                        </td>
                        <td className="p-4">
                          {/* BOTÃO INTERATIVO DE STATUS */}
                          <button 
                            onClick={() => toggleStatus(c.id)}
                            className={`
                              flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all hover:scale-105 active:scale-95
                              ${c.status === 'analise' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20' : ''}
                              ${c.status === 'dev' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20' : ''}
                              ${c.status === 'entrega' ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20' : ''}
                            `}
                          >
                            <div className={`w-2 h-2 rounded-full ${
                              c.status === 'analise' ? 'bg-yellow-400 animate-pulse' : 
                              c.status === 'dev' ? 'bg-blue-400' : 'bg-green-400'
                            }`}></div>
                            {c.status === 'analise' && 'Em Análise'}
                            {c.status === 'dev' && 'Desenvolvendo'}
                            {c.status === 'entrega' && 'Entregue'}
                          </button>
                        </td>
                        <td className="p-4 text-right font-mono text-gray-300">{c.valor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financeiro' && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 animate-in fade-in">
             <DollarSign className="w-16 h-16 mb-4 opacity-20" />
             <p>Módulo Financeiro Completo em Breve</p>
          </div>
        )}

      </main>
    </div>
  );
}

// --- Componentes Menores ---

function NavItem({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all w-full text-left
        ${active ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
    >
      <div className="w-5 h-5">{icon}</div>
      <span className="hidden lg:block font-medium">{label}</span>
    </button>
  )
}

function MetricCard({ title, value, change, positive, icon }: any) {
  return (
    <div className="bg-[#111] border border-white/10 p-6 rounded-2xl flex items-start justify-between hover:border-purple-500/30 transition-colors">
      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <h3 className="text-3xl font-bold mb-2">{value}</h3>
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${positive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {change} esse mês
        </span>
      </div>
      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
        {icon}
      </div>
    </div>
  )
}