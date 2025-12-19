// app/admin/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, Bell, LogOut, Loader2, X, Search, PenTool, 
  RefreshCw, CheckCircle, Clock, AlertTriangle, Menu, Eye, Mail, 
  Download, FileText 
} from 'lucide-react';
"use client"
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const router = useRouter();

  const [clientes, setClientes] = useState<any[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterMode, setFilterMode] = useState('all');
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Modais e Detalhes
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [clientDetails, setClientDetails] = useState<any>(null);
  const [newItem, setNewItem] = useState({ title: '', description: '', status: 'pending' });

  useEffect(() => {
    const token = localStorage.getItem('nevox_token');
    if (token !== 'admin_token') { 
       router.push('/login');
       return;
    }
    
    fetchUsers();
    
    // Auto-refresh a cada 3 segundos para pegar atualizações em tempo real
    const interval = setInterval(() => fetchUsers(true), 3000);
    return () => clearInterval(interval);
  }, []);

  // Lógica de Filtros
  useEffect(() => {
    if (filterMode === 'pending_contract') {
      setFilteredClientes(clientes.filter(c => !c.hasSignedContract && c.hasActivePlan));
    } else if (filterMode === 'no_plan') {
      setFilteredClientes(clientes.filter(c => !c.hasActivePlan));
    } else if (filterMode === 'active') {
      setFilteredClientes(clientes.filter(c => c.hasActivePlan && c.hasSignedContract));
    } else {
      setFilteredClientes(clientes);
    }
  }, [filterMode, clientes]);

  const fetchUsers = async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await fetch(`/api/admin/users?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setClientes(data);
        if (filterMode === 'all') setFilteredClientes(data);
      }
    } catch (e) { 
       console.error(e);
    } finally { 
       setLoading(false);
      if (!isSilent) setTimeout(() => setRefreshing(false), 500);
    }
  };

  const viewClientDetails = async (cliente: any) => {
    try {
      // Aqui você pode criar essa rota depois se quiser buscar mais detalhes, 
      // ou apenas usar os dados que já tem no objeto 'cliente'
      // Por enquanto, vou usar os dados locais para ser mais rápido
      setClientDetails(cliente); 
      setShowClientDetails(true);
    } catch (e) {
      alert("Erro ao carregar detalhes.");
    }
  };

  const resendContractEmail = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/resend-contract', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ userId })
      });
      const result = await res.json();
      if (result.success) {
        alert("E-mail reenviado com sucesso!");
      } else {
        alert(result.error || "Erro ao enviar.");
      }
    } catch (e) {
      alert("Erro ao reenviar.");
    }
  };

  const toggleStage = async (id: string, current: string) => {
    const map: any = { 'analise': 'dev', 'dev': 'entrega', 'entrega': 'analise' };
    const newStage = map[current] || 'analise';
    
    // Atualização Otimista
    setClientes(prev => prev.map(c => c.id === id ? { ...c, projectStage: newStage } : c));
    
    await fetch('/api/admin/update-stage', { 
       method: 'POST', 
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({ userId: id, stage: newStage }) 
     });
  };

  const toggleContract = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setClientes(prev => prev.map(c => c.id === id ? { ...c, hasSignedContract: newStatus } : c));
    
    await fetch('/api/admin/update-contract', { 
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({ userId: id, hasSigned: newStatus }) 
     });
  };

  const handleAddItem = async () => {
    if (!newItem.title) return alert("Título obrigatório");
    
    await fetch('/api/admin/timeline/add', { 
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({ userId: selectedUser.id, ...newItem }) 
     });
     
    alert("Evento adicionado!");
    setNewItem({ title: '', description: '', status: 'pending' });
    setSelectedUser(null);
  };

  const handleLogout = () => { 
     localStorage.removeItem('nevox_token');
     router.push('/login');
  };

  // Métricas
  const totalUsers = clientes.length;
  const pendingContracts = clientes.filter(c => !c.hasSignedContract && c.hasActivePlan).length;
  const activeProjects = clientes.filter(c => c.projectStage === 'dev').length;
  const noPlan = clientes.filter(c => !c.hasActivePlan).length;
  const activeClients = clientes.filter(c => c.hasActivePlan && c.hasSignedContract).length;

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-purple-600 w-10 h-10"/>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex overflow-hidden">
      
      {/* HEADER MOBILE */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0a0a0a]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold">A</div>
          <span className="font-bold text-lg">Admin Nevox</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-400">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/80 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-black/90 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col transition-transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}>
        <div className="hidden md:flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold">A</div>
          <span className="font-bold text-lg">Admin Nevox</span>
        </div>
        <nav className="flex-1 space-y-2">
          <NavItem icon={<Activity />} label="Dashboard" active={true} />
          <NavItem icon={<Users />} label="Clientes" active={false} />
        </nav>
        <button onClick={handleLogout} className="text-xs text-red-400 flex items-center gap-2 px-2 py-3 rounded-lg hover:bg-red-500/10 w-full">
            <LogOut size={16}/> Sair
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Painel de Controle</h1>
            <p className="text-gray-400 text-sm">Visão geral da operação.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => fetchUsers(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10">
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin text-purple-500' : 'text-gray-400'}`} />
            </button>
            <div className="p-2 bg-white/5 rounded-full border border-white/10"><Bell className="w-5 h-5 text-gray-400" /></div>
          </div>
        </header>

        {/* CARDS DE MÉTRICAS */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <MetricCard title="Base Total" value={totalUsers} icon={<Users />} color="bg-gray-800" onClick={() => setFilterMode('all')} active={filterMode === 'all'} />
          <MetricCard title="Sem Plano" value={noPlan} icon={<AlertTriangle />} color="bg-red-500/20 text-red-400" border="border-red-500" onClick={() => setFilterMode('no_plan')} active={filterMode === 'no_plan'} />
          <MetricCard title="Contrato Pendente" value={pendingContracts} icon={<PenTool />} color="bg-yellow-500/20 text-yellow-400" border="border-yellow-500" onClick={() => setFilterMode('pending_contract')} active={filterMode === 'pending_contract'} />
          <MetricCard title="Clientes Ativos" value={activeClients} icon={<CheckCircle />} color="bg-green-500/20 text-green-400" border="border-green-500" onClick={() => setFilterMode('active')} active={filterMode === 'active'} />
          <MetricCard title="Em Desenvolvimento" value={activeProjects} icon={<Activity />} color="bg-blue-500/20 text-blue-400" border="border-blue-500" />
        </div>

        {/* TABELA DE CLIENTES */}
        <div className="bg-[#0a0a0a]/90 border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm">Clientes</h3>
              {filterMode !== 'all' && <span className="bg-purple-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">{filterMode}</span>}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
              <Search className="w-4 h-4 text-gray-500" />
              <input placeholder="Buscar..." className="bg-transparent text-sm outline-none placeholder:text-gray-600 w-40" />
            </div>
          </div>

          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-white/5 text-gray-400 text-[10px] uppercase font-bold">
              <tr>
                <th className="p-5">Cliente</th>
                <th className="p-5">Plano</th>
                <th className="p-5">Pagamento</th>
                <th className="p-5">Contrato</th>
                <th className="p-5">Fase</th>
                <th className="p-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-white/5">
              {filteredClientes.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02]">
                  <td className="p-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center font-bold text-xs">
                      {c.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold">{c.name}</p>
                      <p className="text-[10px] text-gray-500">{c.email}</p>
                    </div>
                  </td>
                  
                  <td className="p-5">
                    <span className="bg-white/5 px-2 py-1 rounded text-xs">{c.plan || 'Sem plano'}</span>
                  </td>

                  <td className="p-5">
                    {c.hasActivePlan ? (
                      <div className="flex items-center gap-1 text-green-400 text-xs">
                        <CheckCircle className="w-3 h-3"/> Pago
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-400 text-xs">
                        <X className="w-3 h-3"/> Pendente
                      </div>
                    )}
                  </td>
                  
                  <td className="p-5">
                    <button 
                      onClick={() => toggleContract(c.id, c.hasSignedContract)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase ${
                        c.hasSignedContract 
                          ? 'text-green-400 bg-green-500/10 border-green-500/20' 
                          : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20 animate-pulse'
                      }`}
                    >
                      {c.hasSignedContract ? <CheckCircle className="w-3 h-3"/> : <Clock className="w-3 h-3"/>}
                      {c.hasSignedContract ? 'Assinado' : 'Pendente'}
                    </button>
                  </td>

                  <td className="p-5">
                    <button 
                       onClick={() => toggleStage(c.id, c.projectStage)} 
                       className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${
                        c.projectStage === 'dev' ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' : 
                        c.projectStage === 'entrega' ? 'text-green-400 border-green-500/30 bg-green-500/10' : 
                        'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
                      }`}
                    >
                      {c.projectStage === 'dev' ? 'Dev' : c.projectStage === 'entrega' ? 'Entregue' : 'Análise'}
                    </button>
                  </td>
                  
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                         onClick={() => viewClientDetails(c)} 
                         className="text-purple-400 text-xs font-bold bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20 flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Ver
                      </button>
                      <button 
                         onClick={() => setSelectedUser(c)} 
                         className="text-blue-400 text-xs font-bold bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20"
                      >
                        Timeline
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL DETALHES DO CLIENTE */}
      {showClientDetails && clientDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-4xl shadow-2xl my-auto">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold">Detalhes Completos do Cliente</h3>
              <button onClick={() => setShowClientDetails(false)}><X className="text-gray-500 hover:text-white"/></button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h4 className="text-xs text-gray-400 uppercase font-bold mb-3">Informações Básicas</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nome:</strong> {clientDetails.name}</p>
                    <p><strong>Email:</strong> {clientDetails.email}</p>
                    <p><strong>CPF:</strong> {clientDetails.cpf || 'Não informado'}</p>
                    <p><strong>Telefone:</strong> {clientDetails.telefone || 'Não informado'}</p>
                    <p><strong>Plano:</strong> <span className="text-purple-400 font-bold">{clientDetails.plan || 'Sem plano'}</span></p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h4 className="text-xs text-gray-400 uppercase font-bold mb-3">Status do Projeto</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Plano Ativo:</span>
                      {clientDetails.hasActivePlan ? (
                        <span className="text-green-400 font-bold flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Sim</span>
                      ) : (
                        <span className="text-red-400 font-bold flex items-center gap-1"><X className="w-4 h-4"/> Não</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Contrato:</span>
                      {clientDetails.hasSignedContract ? (
                        <span className="text-green-400 font-bold flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Assinado</span>
                      ) : (
                        <span className="text-yellow-400 font-bold flex items-center gap-1"><Clock className="w-4 h-4"/> Pendente</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Fase:</span>
                      <span className="text-purple-400 font-bold">{clientDetails.projectStage || 'Não iniciado'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 mb-6">
                <h4 className="text-xs text-gray-400 uppercase font-bold mb-3">Ações Rápidas</h4>
                <div className="grid md:grid-cols-3 gap-3">
                  <button 
                     onClick={() => resendContractEmail(clientDetails.id)}
                    className="bg-blue-500/20 border border-blue-500/30 text-blue-400 px-4 py-3 rounded-lg font-bold text-sm hover:bg-blue-500/30 flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Reenviar Contrato
                  </button>
                  <button className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg font-bold text-sm hover:bg-green-500/30 flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Baixar PDF
                  </button>
                  <button className="bg-purple-500/20 border border-purple-500/30 text-purple-400 px-4 py-3 rounded-lg font-bold text-sm hover:bg-purple-500/30 flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    Ver Faturas
                  </button>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h4 className="text-xs text-gray-400 uppercase font-bold mb-4">Timeline do Projeto</h4>
                {/* Aqui idealmente você usaria a timeline real, mas por enquanto vou deixar o placeholder se estiver vazia */}
                {clientDetails.timeline && clientDetails.timeline.length > 0 ? (
                  <div className="space-y-3">
                    {clientDetails.timeline.map((item: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-black/40 rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${item.status === 'completed' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                        <div className="flex-1">
                          <h5 className="font-bold text-sm">{item.title}</h5>
                          <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                          <span className="text-[10px] text-gray-600 mt-2 block">{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Nenhum evento registrado.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR EVENTO */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Adicionar Evento - {selectedUser.name}</h3>
              <button onClick={() => setSelectedUser(null)}><X className="text-gray-500 hover:text-white"/></button>
            </div>
            <div className="space-y-4">
              <input 
                 value={newItem.title} 
                 onChange={e => setNewItem({...newItem, title: e.target.value})} 
                 placeholder="Título do evento" 
                 className="w-full bg-black border border-white/20 rounded-lg p-3 text-white text-sm" 
               />
              <textarea 
                 value={newItem.description} 
                 onChange={e => setNewItem({...newItem, description: e.target.value})} 
                 placeholder="Descrição..." 
                 className="w-full bg-black border border-white/20 rounded-lg p-3 text-white text-sm h-24 resize-none" 
               />
              <button 
                 onClick={handleAddItem} 
                 className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl"
              >
                Salvar Evento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active }: any) {
  return (
    <button className={`flex items-center gap-3 p-3 rounded-xl w-full text-left transition-all ${active ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      {icon} <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function MetricCard({ title, value, icon, color, border, onClick, active }: any) {
  return (
    <div 
       onClick={onClick}
      className={`p-6 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
        active ? `${color} ${border} ring-2 ring-offset-2 ring-offset-black` : 'bg-[#0a0a0a]/80 border-white/10'
      }`}
    >
      <div>
        <p className="text-gray-400 text-xs uppercase font-bold mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
  );
}