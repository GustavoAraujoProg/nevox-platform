// app/page.tsx
"use client";

import React, { useState, useEffect } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Rocket, Code2, CheckCircle, Zap, X, Send, 
  CreditCard, MessageCircle, FileText, Lock, ChevronRight, 
  Search, Cpu, Database, Globe, Shield, ChevronDown, LayoutDashboard, LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- VISUAIS DE FUNDO ---
const BackgroundGrid = () => (
  <div className="absolute inset-0 z-0 overflow-hidden bg-black pointer-events-none">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-size-[40px_40px]"></div>
    <div className="absolute left-1/2 top-0 -z-10 h-150 w-150 -translate-x-1/2 rounded-full bg-purple-600/20 blur-[120px]"></div>
  </div>
);

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // --- LÓGICA DE LOGIN (CONECTADA) ---
  const [hasAccess, setHasAccess] = useState(false);
  const [userName, setUserName] = useState('');

  const router = useRouter(); 

  // Verifica se o usuário já tem o acesso salvo no computador
  useEffect(() => {
    // AQUI ESTÁ A MUDANÇA: Usamos 'nevox_' para conversar com o Login
    const token = localStorage.getItem('nevox_token');
    const name = localStorage.getItem('nevox_user_name');
    
    if (token) {
      setHasAccess(true);
      if (name) setUserName(name.split(' ')[0]); // Pega só o primeiro nome
    }
  }, []);

  const openCheckout = (planName: string) => {
    // Se já estiver logado, vai pro checkout direto, senão pede login no fluxo
    router.push(`/assinatura?plano=${planName}`);
  };

  const handleLogout = () => {
    // Limpa as chaves certas
    localStorage.removeItem('nevox_token');
    localStorage.removeItem('nevox_user_name');
    localStorage.removeItem('nevox_user_id');
    
    setHasAccess(false);
    window.location.reload();
  };

  return (
    <div className="relative min-h-screen text-white font-sans overflow-x-hidden selection:bg-purple-500 selection:text-white bg-black">
      <BackgroundGrid />

      {/* --- MENU SUPERIOR INTELIGENTE --- */}
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
            
            {/* --- LÓGICA DO BOTÃO MUDANDO --- */}
            {hasAccess ? (
              <div className="flex items-center gap-4 pl-4 border-l border-white/10 animate-in fade-in">
                 <span className="text-white font-medium text-xs">Olá, {userName}</span>
                 <button 
                   onClick={() => router.push('/dashboard')}
                   className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20"
                 >
                   <LayoutDashboard className="w-4 h-4" />
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
            <button 
              onClick={() => setIsChatOpen(true)}
              className="hidden md:flex bg-white/10 hover:bg-white/20 border border-white/10 px-6 py-2 rounded-full text-sm font-medium transition-all"
            >
              Falar com a IA
            </button>
          )}
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-40 pb-20 px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-300 backdrop-blur-md"
        >
          <span className="mr-2 h-2 w-2 rounded-full bg-purple-400 animate-pulse"></span>
          Sistema Nevox 2.0 Ativo
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-8xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40"
        >
          Sua Empresa. <br />
          <span className="text-purple-500 drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">Rodando no Automático.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed"
        >
          Desenvolvimento de Software de Elite & Automação Fiscal Inteligente.
          Elimine a burocracia com a potência do Python e IA.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center"
        >
          {hasAccess ? (
            <button onClick={() => router.push('/dashboard')} className="group h-14 px-8 rounded-full bg-green-600 hover:bg-green-500 text-white font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(34,197,94,0.5)] flex items-center justify-center gap-2">
              Acessar Painel Agora
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button onClick={() => openCheckout('Start')} className="group h-14 px-8 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(147,51,234,0.5)] flex items-center justify-center gap-2">
              Começar Agora
              <Rocket className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
            </button>
          )}
        </motion.div>
      </main>

      {/* --- RESTO DO SITE (MANTIDO) --- */}
      <section id="como-funciona" className="relative z-10 py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Do Rascunho ao Software</h2>
          <p className="text-gray-400">Metodologia ágil para transformar ideias em códigos.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          <TimelineItem step="01" title="Imersão & Estratégia" desc="Você nos conta seu problema. Nós desenhamos a arquitetura do sistema." icon={<Search />} />
          <TimelineItem step="02" title="Desenvolvimento Elite" desc="Nossa equipe cria seu Site, App ou Automação usando Python e IA." icon={<Cpu />} />
          <TimelineItem step="03" title="Entrega & Escala" desc="Seu projeto vai ao ar. Treinamos sua equipe e garantimos o suporte." icon={<Rocket />} />
        </div>
      </section>

      {/* --- NOVA SEÇÃO: TECNOLOGIAS (STACK) --- */}
      <section id="tech" className="relative z-10 py-20 bg-white/5 border-y border-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Tecnologia de Ponta</h2>
            <p className="text-gray-400">O motor por trás da ZM Tech.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TechCard icon={<Database className="text-blue-400" />} title="Big Data" desc="PostgreSQL & Cloud" />
            <TechCard icon={<Cpu className="text-yellow-400" />} title="Python Core" desc="Automação Pura" />
            <TechCard icon={<Bot className="text-purple-400" />} title="Inteligência Artificial" desc="LLMs & GPT-4" />
            <TechCard icon={<Shield className="text-green-400" />} title="Criptografia" desc="Segurança Bancária" />
          </div>
        </div>
      </section>

      {/* --- PLANOS --- */}
      <section id="planos" className="relative z-10 py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Planos & Investimento</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <PricingCard title="Start" price="R$ 199" features={['Acesso ao ZM Flow', 'Até 50 CNPJs', 'Suporte Email']} onPay={() => openCheckout('Start')} zapLink="https://wa.me/5511999999999?text=Quero%20Plano%20Start" />
          <PricingCard title="Growth" price="R$ 499" highlight features={['Tudo do Start', 'Robô de CNDs', 'Gerador de Contratos', 'Suporte WhatsApp']} onPay={() => openCheckout('Growth')} zapLink="https://wa.me/5511999999999?text=Quero%20Plano%20Growth" />
          <PricingCard title="Enterprise" price="Sob Consulta" features={['API Dedicada', 'Apps Exclusivos', 'Desenvolvimento Custom']} onPay={() => openCheckout('Enterprise')} zapLink="https://wa.me/5511999999999?text=Interesse%20Enterprise" isEnterprise />
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="relative z-10 py-20 px-4 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Dúvidas Frequentes</h2>
        <div className="space-y-4">
          <AccordionItem question="O sistema ZM Flow substitui meu contador?" answer="Não. O ZM Flow automatiza a parte chata (burocracia, CNDs, contratos) para que seu contador foque na estratégia." />
          <AccordionItem question="Vocês desenvolvem aplicativos para celular?" answer="Sim! Criamos aplicativos nativos (iOS e Android) e sistemas web responsivos sob medida para sua necessidade." />
          <AccordionItem question="Meus dados ficam seguros?" answer="Absolutamente. Utilizamos criptografia de ponta a ponta e servidores seguros (AWS/Google Cloud). Nem nós temos acesso às suas senhas." />
          <AccordionItem question="Posso cancelar quando quiser?" answer="Para os planos mensais (Start/Growth), sim. Sem multa e sem fidelidade. Você fica pela qualidade." />
        </div>
      </section>

      <footer className="py-12 text-center text-gray-600 text-sm border-t border-white/5 bg-black">
        <div className="flex justify-center gap-6 mb-8">
          <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors cursor-pointer"><Globe className="w-5 h-5 text-white" /></div>
          <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer"><MessageCircle className="w-5 h-5 text-white" /></div>
        </div>
        <p>© 2025 ZM TECH. Todos os direitos reservados.</p>
      </footer>

      <AnimatePresence>
        {isChatOpen && <ChatInterface onClose={() => setIsChatOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

// --- COMPONENTES AUXILIARES (Mantidos do seu código) ---
function TechCard({ icon, title, desc }: any) {
  return (
    <div className="p-6 rounded-xl bg-black border border-white/10 hover:border-purple-500/50 transition-all flex flex-col items-center text-center hover:-translate-y-1">
      <div className="mb-4 p-3 bg-white/5 rounded-full">{icon}</div>
      <h3 className="font-bold text-white mb-1">{title}</h3>
      <p className="text-xs text-gray-400">{desc}</p>
    </div>
  )
}

function AccordionItem({ question, answer }: any) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl bg-white/5 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left font-medium text-white hover:bg-white/5 transition-colors"
      >
        {question}
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0 }} 
            animate={{ height: 'auto' }} 
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 text-gray-400 text-sm leading-relaxed border-t border-white/5">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TimelineItem({ step, title, desc, icon }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative flex flex-col items-center text-center p-6">
      <div className="w-24 h-24 rounded-full bg-black border border-purple-500/30 flex items-center justify-center mb-6 z-10 shadow-[0_0_30px_rgba(147,51,234,0.2)]"><div className="text-purple-400 w-10 h-10">{icon}</div></div>
      <div className="text-purple-500 font-bold mb-2 text-sm tracking-widest">PASSO {step}</div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </motion.div>
  )
}

function PricingCard({ title, price, features, highlight, onPay, zapLink, isEnterprise }: any) {
  return (
    <motion.div whileInView={{ opacity: 1, scale: 1 }} initial={{ opacity: 0, scale: 0.95 }} viewport={{ once: true }} className={`relative p-8 rounded-3xl border flex flex-col ${highlight ? 'border-purple-500 bg-purple-900/10' : 'border-white/10 bg-white/5'}`}>
      {highlight && <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-4 py-1 rounded-full bg-purple-600 text-xs font-bold uppercase text-white">Recomendado</div>}
      <div className="mb-8"><h3 className="text-lg font-medium text-gray-300 mb-2">{title}</h3><div className="flex items-baseline gap-1"><span className="text-4xl font-bold text-white">{price}</span>{!isEnterprise && <span className="text-sm text-gray-500">/mês</span>}</div></div>
      <ul className="space-y-4 mb-8 flex-1">{features.map((feat: string, i: number) => (<li key={i} className="flex items-start gap-3 text-sm text-gray-300"><CheckCircle className="w-5 h-5 text-purple-500 shrink-0" />{feat}</li>))}</ul>
      <div className="grid gap-3"><button onClick={onPay} className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${highlight ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-white text-black hover:bg-gray-200'}`}><CreditCard className="w-4 h-4" />{isEnterprise ? 'Orçamento' : 'Assinar Online'}</button><a href={zapLink} target="_blank" className="w-full py-3 rounded-xl font-bold border border-white/10 hover:bg-white/5 text-white transition-all flex items-center justify-center gap-2"><MessageCircle className="w-4 h-4 text-green-400" />WhatsApp</a></div>
    </motion.div>
  );
}

function ChatInterface({ onClose }: { onClose: () => void }) {
    const [messages, setMessages] = useState([{ role: 'ai', text: 'Olá. Sou a IA da ZM Tech. Como posso ajudar?' }]);
    const [input, setInput] = useState('');
    
    React.useEffect(() => {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, []);
    
    const handleSend = () => { 
      if (!input.trim()) return; 
      setMessages([...messages, { role: 'user', text: input }]); 
      setInput(''); 
      setTimeout(() => setMessages(prev => [...prev, { role: 'ai', text: 'Perfeito. Vou analisar isso no banco de dados...' }]), 1500); 
    };
    
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
        <div className="w-full max-w-lg bg-[#0a0a0a] border border-purple-500/30 rounded-2xl flex flex-col h-[600px] my-auto">
          <div className="p-4 border-b border-white/10 flex justify-between">
            <span className="font-bold text-white">IA ZM Tech</span>
            <button onClick={onClose} className="hover:bg-white/10 rounded-full p-1 transition-colors">
              <X className="text-gray-400 w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`p-3 rounded-xl max-w-[80%] ${m.role === 'user' ? 'bg-purple-600 ml-auto text-white' : 'bg-white/10 text-white'}`}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-white/10 flex gap-2">
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent border border-white/20 rounded-lg p-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500" 
              placeholder="Digite sua mensagem..." 
            />
            <button 
              onClick={handleSend}
              className="bg-purple-600 hover:bg-purple-700 rounded-lg p-3 transition-colors"
            >
              <Send className="text-white w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
}