// app/admin/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, DollarSign, Activity, Bell, FileText, Loader2, LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Estado REAL dos clientes
  const [clientes, setClientes] = useState<any[]>([]);
  const [stats, setStats] = useState({ receita: 0, ativos: 0, novos: 0 });

  // 1. Verificação de Segurança e Carregamento
  useEffect(() => {
    const token = localStorage.getItem('nevox_token'); // ou 'zm_access_token' se usou o outro login
    
    // Se não for o token de admin que definimos no login hardcoded
    if (token !== 'admin_token') {
      alert("Acesso restrito.");
      router.push('/login');
      return;
    }

    fetchUsers();
  }, []);

  // 2. Busca dados do Banco
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setClientes(data);
        calcularMetricas(data);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Calcula os números dos cards
  const calcularMetricas = (users: any[]) => {
    const ativos = users.filter(u => u.status === 'ACTIVE').length;
    // Simulação de receita baseada nos planos ativos
    const receita = users.reduce((acc, u) => {
        if (u.status !== 'ACTIVE') return acc;
        if (u.plan === 'Start') return acc + 199;
        if (u.plan === 'Growth') return acc + 499;
        if (u.plan === 'Enterprise') return acc + 999;
        return acc;
    }, 0);

    setStats({
        receita,
        ativos,
        novos: users.length
    });
  };

  // 4. Mágica de Controle (Atualiza no Banco)
  const toggleStatus = async (id: string, currentStage: string) => {
    let newStage = 'analise';
    if (currentStage === 'analise') newStage = 'dev';
    else if (currentStage === 'dev') newStage = 'entrega';
    else if (currentStage === 'entrega') newStage = 'analise'; // Loop para reiniciar se quiser

    // Atualização Otimista (Muda na tela antes de confirmar no banco pra ser rápido)
    setClientes(prev => prev.map(c => c.id === id ? { ...c, projectStage: newStage } : c));

    try {
        await fetch('/api/admin/update-stage', {
            method: 'POST',
            body: JSON.stringify({ userId: id, stage: newStage })
        });
    } catch (error) {
        alert("Erro ao salvar status.");
        fetchUsers(); // Reverte se der erro
    }
  };

  const handleLogout = () => {
      localStorage.removeItem('nevox_token');
      router.push('/login');
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center"><Loader2 className="animate-spin text-purple-600 w-10 h-10"/></div>;

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans flex overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-20 lg:w-64 border-r border-white/10 flex flex-col bg-black transition-all duration-300">
        <div className="p-6 flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-white">ZM</div>
          <span className="font-bold text-xl tracking-tighter hidden lg:block">Admin</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<Activity />} label="Visão Geral" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Users />} label="Clientes" active={activeTab === 'clientes'} onClick={() => setActiveTab('clientes')} />
          <NavItem icon={<DollarSign />} label="Financeiro" active={activeTab === 'financeiro'} onClick={() => setActiveTab('financeiro')} />
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center font-bold text-xs">AD</div>
            <div className="hidden lg:block">
              <p className="text-sm font-bold">Admin</p>
              <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mt-1"> <LogOut size={10}/> Sair</button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto bg-[#09090b]">
        
        {/* Header Comum */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold capitalize">{activeTab === 'dashboard' ? 'Dashboard Geral' : activeTab}</h1>
            <p className="text-gray-400">Gestão em tempo real da Nevox.</p>
          </div>
          <button className="p-2 bg-white/5 rounded-full hover:bg-white/10 relative">
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>
        </header>

        {/* --- DASHBOARD TAB --- */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <MetricCard 
                title="Receita Estimada" 
                value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.receita)} 
                change="Mensal" positive 
                icon={<DollarSign className="text-green-400" />} 
              />
              <MetricCard title="Assinaturas Ativas" value={stats.ativos} change="Clientes Pagantes" positive icon={<Activity className="text-blue-400" />} />
              <MetricCard title="Total Cadastrados" value={stats.novos} change="Base Total" positive icon={<Users className="text-purple-400" />} />
            </div>

            {/* Tabela Principal */}
            <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-lg">Gerenciamento de Clientes</h3>
                <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                   <span className="text-xs text-gray-400">Banco de Dados Conectado</span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5 text-gray-400 text-xs uppercase font-medium">
                    <tr>
                      <th className="p-4">Cliente</th>
                      <th className="p-4">Plano</th>
                      <th className="p-4">Pagamento</th>
                      <th className="p-4">Fase do Projeto (Clique para Mudar)</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {clientes.map((c) => (
                      <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                        <td className="p-4 font-medium flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center font-bold text-xs uppercase">
                            {c.name ? c.name.charAt(0) : '?'}
                          </div>
                          <div>
                            <p className="text-white font-bold">{c.name || 'Sem Nome'}</p>
                            <p className="text-xs text-gray-500">{c.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded text-xs font-bold mr-2">
                             {c.plan === 'None' ? 'Sem Plano' : c.plan}
                          </span>
                        </td>
                        <td className="p-4">
                           {c.status === 'ACTIVE' ? (
                               <span className="text-green-400 text-xs font-bold border border-green-500/20 bg-green-500/10 px-2 py-1 rounded-md">Ativo</span>
                           ) : (
                               <span className="text-yellow-400 text-xs font-bold border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 rounded-md">Pendente</span>
                           )}
                        </td>
                        <td className="p-4">
                          {/* BOTÃO INTERATIVO DE STATUS */}
                          <button 
                            onClick={() => toggleStatus(c.id, c.projectStage)}
                            className={`
                              flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all hover:scale-105 active:scale-95 w-32 justify-center
                              ${(!c.projectStage || c.projectStage === 'analise') ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20' : ''}
                              ${c.projectStage === 'dev' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20' : ''}
                              ${c.projectStage === 'entrega' ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20' : ''}
                            `}
                          >
                            <div className={`w-2 h-2 rounded-full ${
                              (!c.projectStage || c.projectStage === 'analise') ? 'bg-yellow-400 animate-pulse' : 
                              c.projectStage === 'dev' ? 'bg-blue-400' : 'bg-green-400'
                            }`}></div>
                            {(!c.projectStage || c.projectStage === 'analise') && 'Em Análise'}
                            {c.projectStage === 'dev' && 'Desenvolvendo'}
                            {c.projectStage === 'entrega' && 'Entregue'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- OUTRAS ABAS (Placeholder) --- */}
        {(activeTab === 'clientes' || activeTab === 'financeiro') && (
           <div className="flex flex-col items-center justify-center h-64 text-gray-500 animate-in fade-in">
             <DollarSign className="w-16 h-16 mb-4 opacity-20" />
             <p>Use a aba Visão Geral para gerenciar tudo por enquanto.</p>
          </div>
        )}

      </main>
    </div>
  );
}

// --- COMPONENTES VISUAIS ---
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
          {change}
        </span>
      </div>
      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
        {icon}
      </div>
    </div>
  )
}