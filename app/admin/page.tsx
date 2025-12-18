// app/admin/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, Bell, LogOut, Loader2, 
  X, Save, Search, PenTool, RefreshCw, 
  CheckCircle, Clock, AlertTriangle, Menu, LayoutDashboard
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clientes, setClientes] = useState<any[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterMode, setFilterMode] = useState('all'); 
  
  // MENU MOBILE
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Estados do Modal Timeline
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newItem, setNewItem] = useState({ title: '', description: '', status: 'pending', linkUrl: '' });

  useEffect(() => {
    const token = localStorage.getItem('nevox_token');
    if (token !== 'admin_token') { router.push('/login'); return; }
    
    fetchUsers();

    // Atualiza sozinho a cada 3 segundos
    const interval = setInterval(() => fetchUsers(true), 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (filterMode === 'pending_contract') {
        setFilteredClientes(clientes.filter(c => !c.hasSignedContract));
    } else {
        setFilteredClientes(clientes);
    }
  }, [filterMode, clientes]);

  const fetchUsers = async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      // O parâmetro ?t=... obriga o navegador a buscar dados novos
      const res = await fetch(`/api/admin/users?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) {
          setClientes(data);
          if (filterMode === 'all') setFilteredClientes(data);
      }
    } catch (e) { console.error(e); } finally { 
        setLoading(false); 
        if (!isSilent) setTimeout(() => setRefreshing(false), 500);
    }
  };

  const toggleStage = async (id: string, current: string) => {
    const map: any = { 'analise': 'dev', 'dev': 'entrega', 'entrega': 'analise' };
    const newStage = map[current] || 'analise';
    setClientes(prev => prev.map(c => c.id === id ? { ...c, projectStage: newStage } : c));
    await fetch('/api/admin/update-stage', { method: 'POST', body: JSON.stringify({ userId: id, stage: newStage }) });
  };

  const toggleContract = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    // Atualização Otimista (Muda na tela antes de ir pro servidor)
    setClientes(prev => prev.map(c => c.id === id ? { ...c, hasSignedContract: newStatus } : c));
    
    await fetch('/api/admin/update-contract', { 
        method: 'POST', 
        body: JSON.stringify({ userId: id, hasSigned: newStatus }) 
    });
  };

  const handleAddItem = async () => {
    if (!newItem.title) return alert("Título obrigatório");
    await fetch('/api/admin/timeline/add', { method: 'POST', body: JSON.stringify({ userId: selectedUser.id, ...newItem }) });
    alert("Evento adicionado!");
    setNewItem({ title: '', description: '', status: 'pending', linkUrl: '' });
    setSelectedUser(null);
  };

  const handleLogout = () => { localStorage.removeItem('nevox_token'); router.push('/login'); };

  // Métricas
  const totalUsers = clientes.length;
  const pendingContracts = clientes.filter(c => !c.hasSignedContract).length;
  const activeProjects = clientes.filter(c => c.projectStage === 'dev').length;

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-purple-600 w-10 h-10"/></div>;

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans flex flex-col md:flex-row overflow-hidden">
      
      {/* HEADER MOBILE */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0a0a0a]">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold">Z</div>
            <span className="font-bold text-lg">Admin Nevox</span>
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-400 hover:text-white">
            {isMobileMenuOpen ? <X /> : <Menu />}
         </button>
      </div>

      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/80 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}

      {/* SIDEBAR RESPONSIVA */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-black/90 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex`}>
        <div className="hidden md:flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold shadow-lg">Z</div>
            <span className="font-bold text-lg tracking-tight">Admin Nevox</span>
        </div>
        <nav className="flex-1 space-y-2 mt-4 md:mt-0">
          <NavItem icon={<Activity />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Users />} label="Clientes" active={activeTab === 'clientes'} onClick={() => { setActiveTab('clientes'); setIsMobileMenuOpen(false); }} />
        </nav>
        <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-2 px-2 py-3 mt-auto rounded-lg hover:bg-red-500/10 transition-colors w-full"><LogOut size={16}/> Sair do Sistema</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-[url('https://grainy-gradients.vercel.app/noise.svg')] h-screen">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div><h1 className="text-2xl md:text-3xl font-bold tracking-tight">Painel de Controle</h1><p className="text-gray-400 text-sm">Visão geral da operação.</p></div>
          <div className="flex items-center gap-4 self-end md:self-auto">
             <button onClick={() => fetchUsers(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors"><RefreshCw className={`w-5 h-5 text-gray-400 ${refreshing ? 'animate-spin text-purple-500' : ''}`} /></button>
             <div className="p-2 bg-white/5 rounded-full border border-white/10"><Bell className="w-5 h-5 text-gray-400" /></div>
          </div>
        </header>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            <div 
                onClick={() => setFilterMode(filterMode === 'pending_contract' ? 'all' : 'pending_contract')}
                className={`p-6 rounded-2xl border cursor-pointer transition-all flex items-center justify-between
                ${filterMode === 'pending_contract' ? 'bg-yellow-500/20 border-yellow-500 ring-1 ring-yellow-500' : 'bg-[#0a0a0a]/80 border-white/10'}`}
            >
                <div>
                    <p className="text-gray-400 text-xs uppercase font-bold mb-1">Contratos Pendentes</p>
                    <h3 className="text-3xl font-bold text-white">{pendingContracts}</h3>
                    <p className="text-[10px] text-yellow-500 font-bold mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Requer atenção</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500"><PenTool /></div>
            </div>

            <div onClick={() => setFilterMode('all')} className="p-6 bg-[#0a0a0a]/80 border border-white/10 rounded-2xl flex items-center justify-between cursor-pointer hover:border-white/30">
                <div>
                    <p className="text-gray-400 text-xs uppercase font-bold mb-1">Base Total</p>
                    <h3 className="text-3xl font-bold text-white">{totalUsers}</h3>
                </div>
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white"><Users /></div>
            </div>

            <div className="p-6 bg-[#0a0a0a]/80 border border-white/10 rounded-2xl flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-xs uppercase font-bold mb-1">Em Desenvolvimento</p>
                    <h3 className="text-3xl font-bold text-white">{activeProjects}</h3>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500"><Activity /></div>
            </div>
        </div>

        {/* TABELA RESPONSIVA */}
        <div className="bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl overflow-x-auto">
          <div className="p-4 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-black/40">
             <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">Clientes</h3>
                {filterMode === 'pending_contract' && <span className="bg-yellow-500 text-black text-[10px] px-2 py-0.5 rounded-full font-bold">Pendentes</span>}
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 w-full md:w-auto">
                <Search className="w-4 h-4 text-gray-500" />
                <input placeholder="Buscar..." className="bg-transparent text-sm outline-none placeholder:text-gray-600 w-full md:w-40" />
             </div>
          </div>

          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-white/5 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
              <tr><th className="p-5">Cliente</th><th className="p-5">Plano</th><th className="p-5">Contrato</th><th className="p-5">Fase</th><th className="p-5 text-right">Ações</th></tr>
            </thead>
            <tbody className="text-sm divide-y divide-white/5">
              {filteredClientes.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center font-bold text-xs">{c.name?.charAt(0)}</div>
                    <div><p className="font-bold">{c.name}</p><p className="text-[10px] text-gray-500">{c.email}</p></div>
                  </td>
                  <td className="p-5"><span className="bg-white/5 px-2 py-1 rounded text-xs">{c.plan}</span></td>
                  
                  <td className="p-5">
                    <button 
                        onClick={() => toggleContract(c.id, c.hasSignedContract)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border w-fit transition-all text-[10px] font-bold uppercase tracking-wide
                            ${c.hasSignedContract 
                                ? 'text-green-400 bg-green-500/10 border-green-500/20 hover:bg-green-500/20' 
                                : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20 animate-pulse'
                            }`}
                    >
                        {c.hasSignedContract ? <CheckCircle className="w-3 h-3"/> : <Clock className="w-3 h-3"/>}
                        {c.hasSignedContract ? 'Assinado' : 'Pendente'}
                    </button>
                  </td>

                  <td className="p-5">
                    <button onClick={() => toggleStage(c.id, c.projectStage)} className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${c.projectStage === 'dev' ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' : c.projectStage === 'entrega' ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'}`}>
                      {c.projectStage === 'dev' ? 'Dev' : c.projectStage === 'entrega' ? 'Entregue' : 'Análise'}
                    </button>
                  </td>
                  <td className="p-5 text-right">
                    <button onClick={() => setSelectedUser(c)} className="text-purple-400 hover:text-white text-xs font-bold bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20">Timeline</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL TIMELINE (Mantido) */}
      {selectedUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                  <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold">Timeline</h3><button onClick={() => setSelectedUser(null)}><X className="text-gray-500 hover:text-white"/></button></div>
                  {/* ... campos de input (mantidos iguais) ... */}
                  <div className="space-y-4">
                      <input value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} placeholder="Título" className="w-full bg-black border border-white/20 rounded-lg p-3 text-white text-sm" />
                      <textarea value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} placeholder="Descrição..." className="w-full bg-black border border-white/20 rounded-lg p-3 text-white text-sm h-24 resize-none" />
                      <button onClick={handleAddItem} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl">Salvar</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: any) {
  return <button onClick={onClick} className={`flex items-center gap-3 p-3 rounded-xl w-full text-left mb-1 transition-all ${active ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>{icon} <span className="text-sm font-medium">{label}</span></button>
}