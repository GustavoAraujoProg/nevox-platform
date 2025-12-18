// app/admin/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, Bell, LogOut, Loader2, 
  X, Save, Search, FileText, PenTool, RefreshCw, AlertTriangle, CheckCircle, Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados do Modal Timeline
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newItem, setNewItem] = useState({ title: '', description: '', status: 'pending', linkUrl: '' });

  useEffect(() => {
    const token = localStorage.getItem('nevox_token');
    if (token !== 'admin_token') { router.push('/login'); return; }
    
    fetchUsers();

    // Auto-refresh a cada 2 segundos (Super Rápido para pegar a assinatura)
    const interval = setInterval(() => fetchUsers(true), 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      // Timestamp evita cache do navegador
      const res = await fetch(`/api/admin/users?t=${new Date().getTime()}`, { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) setClientes(data);
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

  // --- FUNÇÃO: FORÇAR CONTRATO (CLIQUE MANUAL) ---
  const toggleContract = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus; // Inverte
    
    // Atualiza na tela NA HORA (Feedback Instantâneo)
    setClientes(prev => prev.map(c => c.id === id ? { ...c, hasSignedContract: newStatus } : c));

    // Salva no banco
    await fetch('/api/admin/update-contract', { 
        method: 'POST', 
        body: JSON.stringify({ userId: id, hasSigned: newStatus }) 
    });
  };

  const handleAddItem = async () => {
    if (!newItem.title) return alert("Título obrigatório");
    await fetch('/api/admin/timeline/add', { method: 'POST', body: JSON.stringify({ userId: selectedUser.id, ...newItem }) });
    alert("Evento adicionado à timeline!");
    setNewItem({ title: '', description: '', status: 'pending', linkUrl: '' });
    setSelectedUser(null);
  };

  const handleLogout = () => { localStorage.removeItem('nevox_token'); router.push('/login'); };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-purple-600 w-10 h-10"/></div>;

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans flex overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-20 lg:w-64 border-r border-white/10 flex flex-col bg-black/50 backdrop-blur-xl">
        <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold shadow-lg shadow-purple-900/40">Z</div>
            <span className="font-bold text-lg tracking-tight hidden lg:block">Admin Nevox</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<Activity />} label="Visão Geral" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Users />} label="Base de Clientes" active={activeTab === 'clientes'} onClick={() => setActiveTab('clientes')} />
        </nav>
        <div className="p-4 border-t border-white/10"><button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-red-500/10 transition-colors w-full"><LogOut size={14}/> Sair</button></div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
        <header className="flex justify-between items-center mb-10">
          <div><h1 className="text-3xl font-bold tracking-tight">Gestão de Clientes</h1><p className="text-gray-400 text-sm">Controle total.</p></div>
          <div className="flex items-center gap-4">
             <button onClick={() => fetchUsers(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors" title="Atualizar Lista">
                <RefreshCw className={`w-5 h-5 text-gray-400 ${refreshing ? 'animate-spin text-purple-500' : ''}`} />
             </button>
             <div className="p-2 bg-white/5 rounded-full border border-white/10"><Bell className="w-5 h-5 text-gray-400" /></div>
          </div>
        </header>

        <div className="bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                <Search className="w-4 h-4 text-gray-500" />
                <input placeholder="Buscar cliente..." className="bg-transparent text-sm outline-none placeholder:text-gray-600 w-48" />
             </div>
             <span className="text-xs text-gray-500 font-mono">Total: {clientes.length}</span>
          </div>

          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
              <tr><th className="p-5">Cliente</th><th className="p-5">Plano</th><th className="p-5">Status do Contrato</th><th className="p-5">Pagamento</th><th className="p-5">Fase</th><th className="p-5 text-right">Ações</th></tr>
            </thead>
            <tbody className="text-sm divide-y divide-white/5">
              {clientes.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-5 font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center font-bold text-xs">{c.name?.charAt(0)}</div>
                    <div><p className="text-white font-bold">{c.name}</p><p className="text-[10px] text-gray-500">{c.email}</p></div>
                  </td>
                  <td className="p-5"><span className="bg-white/5 border border-white/10 px-2 py-1 rounded text-xs text-gray-300 font-medium">{c.plan}</span></td>
                  
                  {/* --- AQUI ESTÁ A MUDANÇA: STATUS ALERTA OU ASSINADO --- */}
                  <td className="p-5">
                    <button 
                        onClick={() => toggleContract(c.id, c.hasSignedContract)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border w-fit transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg
                            ${c.hasSignedContract 
                                ? 'text-green-400 bg-green-500/10 border-green-500/20 hover:bg-green-500/20 shadow-green-900/20' 
                                : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20 shadow-yellow-900/10 animate-pulse'
                            }`}
                    >
                        {c.hasSignedContract ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        <span className="text-[10px] font-bold uppercase tracking-wide">
                            {c.hasSignedContract ? 'Assinado' : 'Aguardando Assinatura'}
                        </span>
                    </button>
                  </td>

                  <td className="p-5">
                     {c.status === 'ACTIVE' ? <span className="text-green-500 font-bold text-xs">● Ativo</span> : <span className="text-yellow-500 font-bold text-xs">● Pendente</span>}
                  </td>
                  <td className="p-5">
                    <button onClick={() => toggleStage(c.id, c.projectStage)} className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold border transition-all hover:scale-105 uppercase tracking-wide
                      ${c.projectStage === 'analise' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : ''}
                      ${c.projectStage === 'dev' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : ''}
                      ${c.projectStage === 'entrega' ? 'bg-green-500/10 text-green-400 border-green-500/30' : ''}
                    `}>
                      {c.projectStage === 'analise' && 'Em Análise'}
                      {c.projectStage === 'dev' && 'Desenvolvendo'}
                      {c.projectStage === 'entrega' && 'Entregue'}
                    </button>
                  </td>
                  <td className="p-5 text-right">
                    <button onClick={() => setSelectedUser(c)} className="text-purple-400 hover:text-white text-xs font-bold bg-purple-500/10 hover:bg-purple-600 border border-purple-500/30 px-3 py-1.5 rounded-lg transition-all">Timeline</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL TIMELINE (MANTIDO) */}
      {selectedUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                  <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold">Evento para {selectedUser.name}</h3><button onClick={() => setSelectedUser(null)}><X className="text-gray-500 hover:text-white w-5 h-5" /></button></div>
                  <div className="space-y-4">
                      <input value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} placeholder="Título" className="w-full bg-black border border-white/20 rounded-lg p-3 text-white text-sm" />
                      <textarea value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} placeholder="Descrição..." className="w-full bg-black border border-white/20 rounded-lg p-3 text-white text-sm h-24 resize-none" />
                      <select value={newItem.status} onChange={e => setNewItem({...newItem, status: e.target.value})} className="w-full bg-black border border-white/20 rounded-lg p-3 text-white text-sm"><option value="pending">🟡 Pendente</option><option value="completed">🟢 Concluído</option><option value="late">🔴 Atrasado</option></select>
                      <button onClick={handleAddItem} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Salvar</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: any) {
  return <button onClick={onClick} className={`flex items-center gap-3 p-3 rounded-xl w-full text-left mb-1 transition-all ${active ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>{icon} <span className="hidden lg:block text-sm font-medium">{label}</span></button>
}