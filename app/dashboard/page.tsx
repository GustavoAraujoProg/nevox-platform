// app/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Activity, FileText, Settings, LogOut, DollarSign, LayoutDashboard, 
  AlertTriangle, X, PenTool, CheckCircle, Menu, ShieldCheck, Loader2, 
  Lock, Zap, Download 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  const [userData, setUserData] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados do Contrato
  const [showContract, setShowContract] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [signingStep, setSigningStep] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('nevox_token');
    const userId = localStorage.getItem('nevox_user_id');
    
    if (!token || !userId) { 
       router.push('/login');
       return;
    }
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
    } catch (e) { 
       console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSign = async () => {
    if (signatureName.length < 5) {
      alert("Digite seu nome completo para assinar.");
      return;
    }
    
    setSigningStep(1);
    
    try {
      const response = await fetch('/api/user/sign-contract', { 
         method: 'POST', 
         body: JSON.stringify({ 
           userId: userData.id, 
           signatureName,
           userEmail: userData.email,
           userName: userData.name,
           userCpf: userData.cpf,
           planName: userData.plan
        }) 
       });

      const result = await response.json();
      
      if (!result.success) throw new Error(result.error || "Erro ao assinar");
      
      // Simula um tempo de processamento para UX
      setTimeout(() => {
        setSigningStep(2);
        setUserData({ ...userData, hasSignedContract: true, contractSignedAt: new Date().toISOString() });
        
        setTimeout(() => {
          setShowContract(false);
          setSigningStep(0);
          setSignatureName("");
          fetchData(userData.id); // Atualiza os dados
        }, 3000);
      }, 2000);

    } catch (e: any) { 
       alert(e.message || "Erro ao assinar.");
       setSigningStep(0);
    }
  };

  const downloadContract = async () => {
    try {
      const response = await fetch('/api/user/download-contract', {
        method: 'POST',
        body: JSON.stringify({ userId: userData.id })
      });
      
      if (!response.ok) throw new Error("Erro ao baixar");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Contrato_Nevox_${userData.name.replace(/\s/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("Erro ao baixar contrato.");
    }
  };

  const logout = () => { 
     localStorage.clear();
     router.push('/');
  };

  const formatMoney = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');
  
  const getProgress = (s: string) => {
    if(s === 'entrega') return { w: '100%', l: 'Entregue' };
    if(s === 'dev') return { w: '60%', l: 'Em Desenvolvimento' };
    return { w: '15%', l: 'Análise Inicial' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600 w-10 h-10"/>
      </div>
    );
  }

  // --- TELA 1: SEM PLANO (Bloqueio de Segurança) ---
  // Caso o usuário tente acessar a URL direto sem ter comprado
  if (!userData?.hasActivePlan) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-600/20 blur-[120px]"></div>
        
        <div className="relative z-10 max-w-2xl w-full bg-[#0a0a0a] border border-red-500/30 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center border-4 border-red-500/30 animate-pulse">
            <Lock className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">Dashboard Bloqueado</h1>
          <p className="text-gray-400 text-center mb-8">Para acessar o painel completo, você precisa escolher um plano.</p>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center font-bold text-lg">
                {userData?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="font-bold text-lg">{userData?.name || 'Usuário'}</h3>
                <p className="text-sm text-gray-500">{userData?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Nenhum plano ativo</span>
            </div>
          </div>

          <div className="space-y-4">
            <a href="/#planos" className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl text-center transition-all">
              <Zap className="w-5 h-5 inline mr-2" />
              Escolher Plano Agora
            </a>
            <button onClick={() => router.push('/')} className="block w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl text-center transition-all">
              Voltar para Home
            </button>
            <button onClick={logout} className="w-full text-gray-500 hover:text-red-400 text-sm py-2">
              <LogOut className="w-4 h-4 inline mr-2" />
              Sair da Conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- TELA 2: TEM PLANO MAS NÃO ASSINOU (Bloqueio Burocrático) ---
  if (!userData?.hasSignedContract) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-yellow-600/20 blur-[120px]"></div>
        
        <div className="relative z-10 max-w-3xl w-full bg-[#0a0a0a] border border-yellow-500/30 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="w-24 h-24 mx-auto mb-6 bg-yellow-500/10 rounded-full flex items-center justify-center border-4 border-yellow-500/30 animate-pulse">
            <PenTool className="w-12 h-12 text-yellow-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">Contrato Pendente</h1>
          <p className="text-gray-400 text-center mb-8">Para começarmos o desenvolvimento, você precisa assinar o contrato digital.</p>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center font-bold text-lg">
                {userData?.name?.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-lg">{userData?.name}</h3>
                <p className="text-sm text-gray-500">Plano: <span className="text-purple-400 font-bold">{userData?.plan}</span></p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <p className="text-xs text-gray-400">Pagamento</p>
                <p className="text-green-400 font-bold flex items-center gap-1 mt-1">
                  <CheckCircle className="w-4 h-4" /> Confirmado
                </p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-xs text-gray-400">Contrato</p>
                <p className="text-yellow-400 font-bold flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-4 h-4" /> Pendente
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowContract(true)}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <PenTool className="w-5 h-5" />
            Ler e Assinar Contrato
          </button>
          
          <button onClick={logout} className="w-full text-gray-500 hover:text-red-400 text-sm py-2 mt-4">
            <LogOut className="w-4 h-4 inline mr-2" />
            Sair da Conta
          </button>
        </div>

        {/* MODAL DE CONTRATO */}
        {showContract && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#f0f0f0] text-black w-full max-w-3xl rounded-sm shadow-2xl flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95">
              
              <div className="bg-purple-900 text-white text-[10px] uppercase text-center py-1 font-bold flex justify-center items-center gap-2">
                <ShieldCheck className="w-3 h-3"/> Documento Protegido
              </div>

              <div className="p-6 border-b border-gray-300 bg-white flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-serif font-bold">Contrato de Prestação de Serviços</h2>
                  <p className="text-xs text-gray-500 mt-1">Ref: NVX-{userData?.id?.slice(0,8).toUpperCase()}</p>
                </div>
                <button onClick={() => setShowContract(false)} className="text-gray-400 hover:text-red-500"><X /></button>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto bg-white text-sm space-y-4 font-serif leading-relaxed">
                <p><strong>CONTRATADA:</strong> NEVOX TECNOLOGIA LTDA.</p>
                <p><strong>CONTRATANTE:</strong> {userData?.name?.toUpperCase()} - CPF: {userData?.cpf}</p>
                <br/>
                <p>Pelo presente instrumento, as partes acima têm justo e contratado:</p>
                <p><strong>1. DO OBJETO:</strong> Prestação de serviços de desenvolvimento de software conforme plano {userData?.plan}.</p>
                <p><strong>2. DA VIGÊNCIA:</strong> Contrato entra em vigor na data desta assinatura digital.</p>
                <p><strong>3. DOS DEVERES:</strong> A CONTRATADA se compromete a entregar os serviços com qualidade técnica.</p>
                <p><strong>4. DA CONFIDENCIALIDADE:</strong> Ambas as partes mantêm sigilo absoluto sobre informações estratégicas.</p>
                <p><strong>5. DO FORO:</strong> Comarca de São Paulo/SP.</p>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-200">
                {signingStep === 2 ? (
                  <div className="flex flex-col items-center text-green-600 py-4 animate-in fade-in">
                    <CheckCircle className="w-16 h-16 mb-2" />
                    <h3 className="text-xl font-bold">Contrato Assinado!</h3>
                    <p className="text-sm text-gray-600">Uma cópia foi enviada para seu e-mail.</p>
                  </div>
                ) : signingStep === 1 ? (
                  <div className="flex flex-col items-center py-6 text-purple-700 animate-pulse">
                    <PenTool className="w-8 h-8 mb-2 animate-bounce" />
                    <p className="font-bold">Processando Assinatura...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Assinatura Digital (Nome Completo)</label>
                        <input 
                          value={signatureName}
                          onChange={(e) => setSignatureName(e.target.value)}
                          placeholder="Digite seu nome completo..."
                          className="w-full mt-2 p-4 border-2 border-gray-300 rounded-lg text-xl focus:border-purple-600 outline-none bg-white font-handwriting"
                        />
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] text-gray-400 max-w-[60%]">Ao clicar, você concorda legalmente com os termos.</p>
                      <button 
                        onClick={handleSign}
                        disabled={signatureName.length < 5}
                        className="px-8 py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg disabled:opacity-50 flex items-center gap-2 transition-transform active:scale-95"
                      >
                        <PenTool className="w-4 h-4" /> Assinar Documento
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- TELA 3: DASHBOARD COMPLETO (LIBERADO) ---
  const progress = getProgress(userData.projectStage || 'analise');

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      
      {/* HEADER MOBILE */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0a0a0a]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold">N</div>
          <span className="font-bold text-lg">Nevox</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-400 hover:text-white">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/80 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-white/10 p-6 flex flex-col transition-transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}>
        <div className="hidden md:flex items-center gap-2 mb-10 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold">N</div>
          <span className="text-xl font-bold tracking-tight">Nevox</span>
        </div>
        <nav className="space-y-2 flex-1">
          <NavItem icon={<LayoutDashboard />} label="Visão Geral" active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<DollarSign />} label="Financeiro" active={activeTab === 'financeiro'} onClick={() => { setActiveTab('financeiro'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<FileText />} label="Projetos" active={activeTab === 'projetos'} onClick={() => { setActiveTab('projetos'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Settings />} label="Configurações" active={activeTab === 'config'} onClick={() => { setActiveTab('config'); setIsMobileMenuOpen(false); }} />
        </nav>
        <button onClick={logout} className="flex items-center gap-3 text-gray-500 hover:text-red-500 p-2 mt-auto"><LogOut size={20}/> Sair</button>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
        <header className="flex justify-between items-center mb-6 md:mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Olá, {userData.name.split(' ')[0]} 👋</h1>
            <p className="text-gray-400 text-sm">Plano: <span className="text-purple-400 font-bold">{userData.plan}</span></p>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold shadow-lg">{userData.name.charAt(0)}</div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 transition-opacity group-hover:opacity-20"><Activity className="w-24 h-24 md:w-32 md:h-32 text-purple-500"/></div>
                <h3 className="text-lg md:text-xl font-bold mb-1">Status do Projeto</h3>
                <p className="text-sm text-gray-500 mb-8">{progress.l}</p>
                <div className="h-2 bg-gray-800 rounded-full mb-8 overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full transition-all duration-1000" style={{ width: progress.w }}></div>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase text-gray-500"><span>Início</span><span>Dev</span><span>Entrega</span></div>
              </div>
              <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col justify-center">
                <h3 className="font-bold mb-4">Acesso Rápido</h3>
                <button onClick={() => setActiveTab('financeiro')} className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl mb-3 flex items-center justify-center gap-3 text-sm transition-all"><DollarSign className="w-4 h-4 text-green-400"/> Faturas</button>
                <button onClick={() => setActiveTab('projetos')} className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-3 text-sm transition-all"><FileText className="w-4 h-4 text-purple-400"/> Contratos</button>
              </div>
            </div>

            {/* CARD DE CONTRATO ASSINADO (Feedback Positivo) */}
            <div className="bg-gradient-to-r from-green-900/40 to-black border border-green-500/30 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-green-400">
                <div className="p-3 bg-green-500/20 rounded-full"><CheckCircle className="w-6 h-6"/></div>
                <div>
                  <h3 className="font-bold text-lg text-white">Contrato Assinado</h3>
                  <p className="text-sm text-gray-300">Assinado digitalmente em {formatDate(userData.contractSignedAt)}</p>
                </div>
              </div>
              <button onClick={downloadContract} className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all hover:scale-105">
                <Download className="w-4 h-4" />
                Baixar Cópia
              </button>
            </div>
          </div>
        )}

        {activeTab === 'financeiro' && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold">Financeiro</h2>
            <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden min-h-[300px] overflow-x-auto">
              {invoices.length === 0 ? <div className="p-20 text-center text-gray-500">Nenhuma fatura encontrada.</div> : (
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-white/5 text-gray-500 text-xs uppercase"><tr><th className="p-6">Vencimento</th><th className="p-6">Valor</th><th className="p-6">Status</th><th className="p-6 text-right">Ação</th></tr></thead>
                  <tbody>{invoices.map(i => <tr key={i.id} className="border-b border-white/5"><td className="p-6 text-sm text-gray-300">{formatDate(i.dueDate)}</td><td className="p-6 font-bold">{formatMoney(i.value)}</td><td className="p-6"><span className="bg-white/5 px-2 py-1 rounded text-xs">{i.status}</span></td><td className="p-6 text-right"><a href={i.bankSlipUrl || i.invoiceUrl} target="_blank" className="text-purple-400 text-xs font-bold border border-purple-500/30 px-4 py-2 rounded-lg">Ver Boleto</a></td></tr>)}</tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'projetos' && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold">Linha do Tempo</h2>
            <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 relative min-h-[400px]">
              <div className="absolute left-8 md:left-10 top-8 bottom-8 w-[2px] bg-white/10"></div>
              {timeline.length === 0 ? <p className="text-gray-500 text-center pl-10 pt-10">Aguardando atualizações.</p> : timeline.map(item => (
                <div key={item.id} className="relative pl-10 md:pl-12 mb-8 group">
                  <div className={`absolute left-[5px] top-1 w-4 h-4 rounded-full border-2 border-[#0a0a0a] ${item.status === 'completed' ? 'bg-green-500' : 'bg-gray-600'}`}></div>
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
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: any) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all mb-1 ${active ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      {React.cloneElement(icon, { size: 20 })} 
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}