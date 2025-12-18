// app/page.tsx
"use client";

import React, { useState, useEffect } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Rocket, Code2, CheckCircle, Zap, X, Send, 
  CreditCard, MessageCircle, FileText, Lock, ChevronRight, 
  Search, Cpu, Database, Globe, Shield, ChevronDown, LayoutDashboard, LogOut, Menu
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- VISUAIS DE FUNDO (MANTIDOS) ---
const BackgroundGrid = () => (
  <div className="absolute inset-0 z-0 overflow-hidden bg-black pointer-events-none">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-size-[40px_40px]"></div>
    <div className="absolute left-1/2 top-0 -z-10 h-150 w-150 -translate-x-1/2 rounded-full bg-purple-600/20 blur-[120px]"></div>
  </div>
);

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // --- LÓGICA DE LOGIN ---
  const [hasAccess, setHasAccess] = useState(false);
  const [hasPlan, setHasPlan] = useState(false); // <--- NOVO: Verifica se pagou
  const [userName, setUserName] = useState('');

  const router = useRouter(); 

  useEffect(() => {
    const token = localStorage.getItem('nevox_token');
    const name = localStorage.getItem('nevox_user_name');
    const plan = localStorage.getItem('nevox_user_plan'); // Verifica pagamento
    
    if (token) {
      setHasAccess(true);
      if (name) setUserName(name.split(' ')[0]); 
      if (plan && plan !== 'null') setHasPlan(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setHasAccess(false);
    setHasPlan(false);
    setIsMobileMenuOpen(false);
    window.location.reload();
  };

  // --- O PEDÁGIO (Aqui está a lógica que você pediu) ---
  const handleDashboardEnter = () => {
    if (!hasPlan) {
      // SE NÃO TEM PLANO: Bloqueia e avisa
      alert("⚠️ ACESSO BLOQUEADO!\n\nVocê precisa assinar um plano para acessar o Dashboard.\nRole para baixo e escolha seu plano.");
      
      const planosSection = document.getElementById('planos');
      if (planosSection) planosSection.scrollIntoView({ behavior: 'smooth' });
      
      setIsMobileMenuOpen(false);
    } else {
      // SE TEM PLANO: Libera o acesso
      router.push('/dashboard');
    }
  };

  // --- SIMULAÇÃO DE PAGAMENTO ---
  const handlePurchase = (planName: string) => {
    if (!hasAccess) {
        alert("Crie uma conta ou faça login primeiro!");
        router.push('/login');
        return;
    }

    const confirm = window.confirm(`Simular pagamento do plano ${planName}?`);
    
    if (confirm) {
        localStorage.setItem('nevox_user_plan', planName);
        setHasPlan(true)
        // AGORA SIM PODE ENTRAR NO DASHBOARD (Onde vai ter o contrato jurídico)
        router.push('/assinatura');
    }
  };

  return (
    <div className="relative min-h-screen text-white font-sans overflow-x-hidden selection:bg-purple-500 selection:text-white bg-black">
      <BackgroundGrid />

      {/* --- MENU SUPERIOR --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.5)]">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-white">Nevox</span>
          </div>
          
          <div className="hidden md:flex gap-6 text-sm text-gray-400 items-center">
            <a href="#como-funciona" className="hover:text-white transition-colors">Processo</a>
            <a href="/projetos" className="text-purple-400 font-bold hover:text-purple-300 transition-colors flex items-center gap-1">
               <Rocket className="w-3 h-3" /> Projetos
            </a>
            <a href="#planos" className="hover:text-white transition-colors">Planos</a>
            
            {hasAccess ? (
              <div className="flex items-center gap-4 pl-4 border-l border-white/10 animate-in fade-in">
                 <div className="text-right hidden lg:block">
                    <p className="text-white font-medium text-xs">Olá, {userName}</p>
                    <p className="text-[10px] text-gray-500">{hasPlan ? 'Membro Pro' : 'Sem Plano'}</p>
                 </div>
                 
                 {/* BOTÃO COM BLOQUEIO */}
                 <button 
                   onClick={handleDashboardEnter}
                   className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg 
                     ${hasPlan ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                 >
                   {hasPlan ? <LayoutDashboard className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                   Meu Dashboard
                 </button>

                 <button onClick={handleLogout} className="text-gray-500 hover:text-red-400" title="Sair">
                   <LogOut className="w-4 h-4" />
                 </button>
              </div>
            ) : (
              <a href="/login" className="hover:text-white transition-colors">Login Cliente</a>
            )}
          </div>

          {!hasAccess && (
            <button onClick={() => setIsChatOpen(true)} className="hidden md:flex bg-white/10 hover:bg-white/20 border border-white/10 px-6 py-2 rounded-full text-sm font-medium transition-all">
              Falar com a IA
            </button>
          )}

          <button className="md:hidden p-2 text-gray-300 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* MENU MOBILE (Mantido Responsivo) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden bg-black/95 border-b border-white/10 overflow-hidden backdrop-blur-xl">
               <div className="p-6 flex flex-col space-y-6 text-center">
                  <a href="#como-funciona" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-gray-300">Como Funciona</a>
                  <a href="#planos" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-gray-300">Planos</a>
                  
                  <div className="w-full h-px bg-white/10"></div>

                  {hasAccess ? (
                     <div className="flex flex-col gap-4">
                        <span className="text-gray-400">Logado como <strong className="text-white">{userName}</strong></span>
                        <button onClick={handleDashboardEnter} className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 ${hasPlan ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                            {hasPlan ? <LayoutDashboard className="w-5 h-5"/> : <Lock className="w-5 h-5"/>} 
                            Acessar Dashboard
                        </button>
                        <button onClick={handleLogout} className="text-red-400 flex items-center justify-center gap-2"><LogOut className="w-4 h-4"/> Sair</button>
                     </div>
                  ) : (
                     <div className="flex flex-col gap-4">
                        <a href="/login" className="w-full py-3 border border-white/20 rounded-xl text-white">Login Cliente</a>
                     </div>
                  )}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-40 pb-20 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-300 backdrop-blur-md">
          <span className="mr-2 h-2 w-2 rounded-full bg-purple-400 animate-pulse"></span> Sistema Nevox 2.0 Ativo
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-8xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
          Sua Empresa. <br /> <span className="text-purple-500 drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">Rodando no Automático.</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
          Desenvolvimento de Software de Elite & Automação Fiscal Inteligente. Elimine a burocracia com a potência do Python e IA.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          {hasAccess ? (
             <button onClick={handleDashboardEnter} className={`group h-14 px-8 rounded-full font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(34,197,94,0.5)] flex items-center justify-center gap-2 ${hasPlan ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}>
               {hasPlan ? 'Acessar Painel Agora' : 'Assinar um Plano'}
               <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </button>
          ) : (
            <button onClick={() => handlePurchase('Start')} className="group h-14 px-8 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(147,51,234,0.5)] flex items-center justify-center gap-2">
              Começar Agora
              <Rocket className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
            </button>
          )}
        </motion.div>
      </main>

      {/* --- SEÇÕES INFORMATIVAS (Mantidas) --- */}
      <section id="como-funciona" className="relative z-10 py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16"><h2 className="text-3xl md:text-4xl font-bold mb-4">Do Rascunho ao Software</h2><p className="text-gray-400">Metodologia ágil para transformar ideias em códigos.</p></div>
        <div className="grid md:grid-cols-3 gap-8 relative">
           <TimelineItem step="01" title="Imersão" desc="Você nos conta seu problema. Nós desenhamos a solução." icon={<Search />} />
           <TimelineItem step="02" title="Desenvolvimento" desc="Nossa equipe cria seu Software usando Python e IA." icon={<Cpu />} />
           <TimelineItem step="03" title="Entrega" desc="Seu projeto vai ao ar com treinamento completo." icon={<Rocket />} />
        </div>
      </section>

      {/* --- PLANOS (AQUI ACONTECE A ASSINATURA FINANCEIRA) --- */}
      <section id="planos" className="relative z-10 py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16"><h2 className="text-3xl md:text-5xl font-bold mb-4">Planos & Investimento</h2></div>
        <div className="grid md:grid-cols-3 gap-8">
          <PricingCard title="Start" price="R$ 199" features={['Acesso ao ZM Flow', 'Até 50 CNPJs', 'Suporte Email']} onPay={() => handlePurchase('Start')} zapLink="#" />
          <PricingCard title="Growth" price="R$ 499" highlight features={['Tudo do Start', 'Robô de CNDs', 'Gerador de Contratos', 'Suporte WhatsApp']} onPay={() => handlePurchase('Growth')} zapLink="#" />
          <PricingCard title="Enterprise" price="Sob Consulta" features={['API Dedicada', 'Apps Exclusivos', 'Desenvolvimento Custom']} onPay={() => handlePurchase('Enterprise')} zapLink="#" isEnterprise />
        </div>
      </section>

      <footer className="py-12 text-center text-gray-600 text-sm border-t border-white/5 bg-black"><p>© 2025 ZM TECH. Todos os direitos reservados.</p></footer>

      <AnimatePresence>{isChatOpen && <ChatInterface onClose={() => setIsChatOpen(false)} />}</AnimatePresence>
    </div>
  );
}

// --- COMPONENTES AUXILIARES (Mesmos do original) ---
function TimelineItem({ step, title, desc, icon }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative flex flex-col items-center text-center p-6 bg-white/5 rounded-2xl border border-white/5">
      <div className="w-16 h-16 rounded-full bg-black border border-purple-500/30 flex items-center justify-center mb-4 text-purple-400">{icon}</div>
      <div className="text-purple-500 font-bold mb-2 text-xs tracking-widest">PASSO {step}</div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </motion.div>
  )
}

function PricingCard({ title, price, features, highlight, onPay, isEnterprise }: any) {
  return (
    <motion.div whileInView={{ opacity: 1, scale: 1 }} initial={{ opacity: 0, scale: 0.95 }} viewport={{ once: true }} className={`relative p-8 rounded-3xl border flex flex-col ${highlight ? 'border-purple-500 bg-purple-900/10' : 'border-white/10 bg-white/5'}`}>
      {highlight && <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-4 py-1 rounded-full bg-purple-600 text-xs font-bold uppercase text-white">Recomendado</div>}
      <div className="mb-8"><h3 className="text-lg font-medium text-gray-300 mb-2">{title}</h3><div className="flex items-baseline gap-1"><span className="text-4xl font-bold text-white">{price}</span>{!isEnterprise && <span className="text-sm text-gray-500">/mês</span>}</div></div>
      <ul className="space-y-4 mb-8 flex-1">{features.map((feat: string, i: number) => (<li key={i} className="flex items-start gap-3 text-sm text-gray-300"><CheckCircle className="w-5 h-5 text-purple-500 shrink-0" />{feat}</li>))}</ul>
      <button onClick={onPay} className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${highlight ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-white text-black hover:bg-gray-200'}`}>
         <CreditCard className="w-4 h-4" /> {isEnterprise ? 'Falar com Vendas' : 'Assinar Online'}
      </button>
    </motion.div>
  );
}

function ChatInterface({ onClose }: { onClose: () => void }) {
    return <div className="fixed inset-0 bg-black/80 flex items-center justify-center"><div className="text-white">Chat da IA</div><button onClick={onClose} className="absolute top-4 right-4 text-white"><X/></button></div>
}