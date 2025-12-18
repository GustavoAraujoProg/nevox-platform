// app/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Activity, FileText, Settings, LogOut, DollarSign, Calendar, 
  ExternalLink, Loader2, LayoutDashboard, CreditCard, 
  AlertTriangle, X, PenTool, CheckCircle, Menu
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  
  const [userData, setUserData] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  // ESTADO DO MENU MOBILE
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Estados do Contrato
  const [showContract, setShowContract] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('nevox_token');
    const userId = localStorage.getItem('nevox_user_id');
    if (!token || !userId) { router.push('/login'); return; }
    fetchData(userId);
  }, []);

  const fetchData = async (userId: string) => {
    try {
        const [u, i, t] = await Promise.all([
            fetch('/api/user/me', { method: 'POST', body: JSON.stringify({ userId }) }).then(r => r.json()),
            fetch('/api/finance/invoices', { method: 'POST', body: JSON.stringify({ userId }) }).then(r => r.json()),
            fetch('/api/projects/timeline', { method: 'POST', body: JSON.stringify({ userId }) }).then(r => r.json())
        ]);
        if (u.user) setUserData(u.user);
        if (i.invoices) setInvoices(i.invoices);
        if (t.items) setTimeline(t.items);
    } catch (e) { console.error(e); }
  };

  const handleSign = async () => {
    if (signatureName.length < 5) return;
    setSigning(true);
    try {
        await fetch('/api/user/sign-contract', { method: 'POST', body: JSON.stringify({ userId: userData.id, signatureName }) });
        setUserData({ ...userData, hasSignedContract: true });
        setShowContract(false);
        fetchData(userData.id);
        alert("Contrato assinado!");
    } catch (e) { alert("Erro ao assinar."); } finally { setSigning(false); }
  };

  const logout = () => { localStorage.clear(); router.push('/'); };
  const formatMoney = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');
  const getProgress = (s: string) => {
     if(s === 'entrega') return { w: '100%', c: 'from-green-500 to-emerald-400', l: 'Entregue' };
     if(s === 'dev') return { w: '60%', c: 'from-blue-600 to-cyan-400', l: 'Em Desenvolvimento' };
     return { w: '15%', c: 'from-purple-600 to-indigo-500', l: 'Análise Inicial' };
  };

  if (!userData) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-purple-600 w-10 h-10"/></div>;
  const progress = getProgress(userData.projectStage || 'analise');

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col md:flex-row">
      
      {/* HEADER MOBILE (Só aparece no celular) */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0a0a0a]">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold">N</div>
            <span className="font-bold text-lg">Nevox</span>
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-400 hover:text-white">
            {isMobileMenuOpen ? <X /> : <Menu />}
         </button>
      </div>

      {/* OVERLAY ESCURO (Quando o menu abre no celular) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* SIDEBAR (Responsiva) */}
      <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-white/10 p-6 flex flex-col transition-transform duration-300
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:flex
      `}>
        <div className="hidden md:flex items-center gap-2 mb-10 cursor-pointer" onClick={() => router.push('/')}>
           <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold">N</div>
           <span className="text-xl font-bold tracking-tight">Nevox</span>
        </div>
        
        {/* Menu Items */}
        <nav className="space-y-2 flex-1 mt-8 md:mt-0">
          <NavItem icon={<LayoutDashboard />} label="Visão Geral" active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<DollarSign />} label="Financeiro" active={activeTab === 'financeiro'} onClick={() => { setActiveTab('financeiro'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<FileText />} label="Projetos" active={activeTab === 'projetos'} onClick={() => { setActiveTab('projetos'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Settings />} label="Configurações" active={activeTab === 'config'} onClick={() => { setActiveTab('config'); setIsMobileMenuOpen(false); }} />
        </nav>
        
        <button onClick={logout} className="flex items-center gap-3 text-gray-500 hover:text-red-500 p-2 mt-auto"><LogOut size={20}/> Sair</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-6 md:mb-10">
           <div><h1 className="text-2xl md:text-3xl font-bold">Olá, {userData.name.split(' ')[0]} 👋</h1><p className="text-gray-400 text-sm">Plano: <span className="text-purple-400 font-bold">{userData.plan}</span></p></div>
           <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold shadow-lg">{userData.name.charAt(0)}</div>
        </header>

        {activeTab === 'overview' && (
           <div className="animate-in fade-in space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                 {/* Card Status */}
                 <div className="md:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10"><Activity className="w-24 h-24 md:w-32 md:h-32 text-purple-500"/></div>
                    <h3 className="text-lg md:text-xl font-bold mb-1">Status do Projeto</h3>
                    <p className="text-sm text-gray-500 mb-8">{progress.l}</p>
                    <div className="h-2 bg-gray-800 rounded-full mb-8"><div className={`h-full bg-purple-600 rounded-full`} style={{ width: progress.w }}></div></div>
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-500"><span>Início</span><span>Dev</span><span>Entrega</span></div>
                 </div>
                 
                 {/* Acesso Rápido */}
                 <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 flex flex-col justify-center">
                    <h3 className="font-bold mb-4">Acesso Rápido</h3>
                    <button onClick={() => setActiveTab('financeiro')} className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl mb-3 flex items-center justify-center gap-3 text-sm font-medium transition-all"><DollarSign className="w-4 h-4 text-green-400"/> Faturas</button>
                    <button onClick={() => setActiveTab('projetos')} className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-3 text-sm font-medium transition-all"><FileText className="w-4 h-4 text-purple-400"/> Contratos</button>
                 </div>
              </div>
              
              {!userData.hasSignedContract && (
                  <div className="bg-gradient-to-r from-red-900/10 to-black border border-red-500/20 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4 text-red-400">
                          <AlertTriangle />
                          <div><h3 className="font-bold">Contrato Pendente</h3><p className="text-sm text-gray-400">Assine para liberar o desenvolvimento.</p></div>
                      </div>
                      <button onClick={() => { setActiveTab('projetos'); setShowContract(true); }} className="w-full md:w-auto px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg text-sm shadow-lg shadow-red-900/20 transition-all">Assinar</button>
                  </div>
              )}
           </div>
        )}

        {/* FINANCEIRO - Tabela com scroll horizontal no celular */}
        {activeTab === 'financeiro' && (
           <div className="animate-in fade-in space-y-6">
              <h2 className="text-2xl font-bold">Financeiro</h2>
              <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden min-h-[300px] overflow-x-auto">
                 {invoices.length === 0 ? <div className="p-20 text-center text-gray-500">Nenhuma fatura encontrada.</div> : (
                    <table className="w-full text-left min-w-[600px]">
                       <thead className="bg-white/5 text-gray-500 text-xs uppercase"><tr><th className="p-6">Vencimento</th><th className="p-6">Valor</th><th className="p-6">Status</th><th className="p-6 text-right">Ação</th></tr></thead>
                       <tbody>{invoices.map(i => <tr key={i.id} className="border-b border-white/5"><td className="p-6 text-sm text-gray-300">{formatDate(i.dueDate)}</td><td className="p-6 font-bold">{formatMoney(i.value)}</td><td className="p-6"><span className="bg-white/5 px-2 py-1 rounded text-xs">{i.status}</span></td><td className="p-6 text-right"><a href={i.bankSlipUrl || i.invoiceUrl} target="_blank" className="text-purple-400 text-xs font-bold border border-purple-500/30 px-4 py-2 rounded-lg">Ver</a></td></tr>)}</tbody>
                    </table>
                 )}
              </div>
           </div>
        )}

        {/* PROJETOS */}
        {activeTab === 'projetos' && (
           <div className="animate-in fade-in space-y-6">
              <h2 className="text-2xl font-bold">Linha do Tempo</h2>
              {!userData.hasSignedContract && (
                  <div className="bg-[#0a0a0a] border border-yellow-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0"><PenTool /></div>
                          <div><h3 className="text-lg font-bold text-white">Contrato Disponível</h3><p className="text-gray-400 text-sm">Assine digitalmente agora.</p></div>
                      </div>
                      <button onClick={() => setShowContract(true)} className="w-full md:w-auto bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-xl shadow-lg shadow-yellow-500/20 transition-all">Ler e Assinar</button>
                  </div>
              )}

              <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 relative min-h-[400px]">
                  <div className="absolute left-8 md:left-10 top-8 bottom-8 w-[2px] bg-white/10"></div>
                  {timeline.length === 0 ? <p className="text-gray-500 text-center pl-10 pt-10">Aguardando atualizações.</p> : timeline.map(item => (
                      <div key={item.id} className="relative pl-10 md:pl-12 mb-8 group">
                          <div className={`absolute left-[5px] top-1 w-4 h-4 rounded-full border-2 border-[#0a0a0a] ${item.status === 'completed' ? 'bg-green-500' : item.status === 'late' ? 'bg-red-500' : 'bg-gray-600'}`}></div>
                          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl group-hover:bg-white/10 transition-colors">
                              <h4 className="font-bold text-lg">{item.title}</h4>
                              <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                              <span className="text-xs text-gray-600 mt-2 block">{formatDate(item.date)}</span>
                          </div>
                      </div>
                  ))}
              </div>
           </div>
        )}
      </main>

      {/* MODAL CONTRATO (Responsivo) */}
      {showContract && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#111] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[85vh]">
                  <div className="p-4 md:p-6 border-b border-white/10 flex justify-between bg-[#0a0a0a]"><h3 className="font-bold text-lg md:text-xl flex gap-2"><FileText className="text-purple-500"/> Termos</h3><button onClick={() => setShowContract(false)}><X className="text-gray-500 hover:text-white"/></button></div>
                  <div className="p-6 md:p-8 overflow-y-auto bg-[#0a0a0a] text-gray-300 text-sm space-y-4">
                      <p className="font-bold text-white">TERMOS E CONDIÇÕES NEVOX</p>
                      <p>1. Ao aceitar este contrato, a CONTRATANTE autoriza o início...</p>
                      <p className="italic text-gray-600">... (Restante do contrato) ...</p>
                  </div>
                  <div className="p-4 md:p-6 border-t border-white/10 bg-[#111]">
                      <label className="text-xs text-gray-500 font-bold uppercase block mb-2">Digite seu Nome para Assinar</label>
                      <input value={signatureName} onChange={e => setSignatureName(e.target.value)} placeholder="Ex: João da Silva" className="w-full bg-black border border-white/20 rounded-xl p-3 md:p-4 text-white font-mono mb-4 focus:border-purple-500 outline-none"/>
                      <button onClick={handleSign} disabled={signing || signatureName.length < 5} className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold py-3 md:py-4 rounded-xl flex justify-center gap-2">{signing ? <Loader2 className="animate-spin"/> : <><PenTool className="w-4 h-4"/> Confirmar Assinatura</>}</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: any) {
  return <div onClick={onClick} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all mb-1 ${active ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>{React.cloneElement(icon, { size: 20 })} <span className="text-sm font-medium">{label}</span></div>
}