"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, FileText, CheckCircle, ChevronRight, 
  ChevronLeft, Bot, User, Mail, Package, ShieldCheck, Zap, Lock
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AssinaturaFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para dados do cartão (separado para facilitar visualização)
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: ''
  });

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    paymentMethod: '',
    plan: '',
    // --- NOVOS CAMPOS ADICIONADOS ---
    projectType: '',      // Tipo (App, Site, Sistema...)
    projectGoal: '',      // Objetivo (Vendas, Gestão...)
    targetAudience: '',   // Público Alvo
    referenceLinks: '',   // Links de inspiração
    budget: '',           // Orçamento estimado
    // -------------------------------
    projectDescription: '',
    deadline: '',
    features: [] as string[]
  });

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem('zm_access_token', 'true'); 
      localStorage.setItem('zm_user_name', formData.nome);
      // -------------------------------

      alert("✅ Pagamento processado! Bem-vindo.");
      router.push('/dashboard');
    }, 2000);
  }

  // Ícones atualizados com a nova etapa de "Dados"
  const stepsIcons = [
    { icon: User, label: 'Você' },
    { icon: Package, label: 'Plano' },
    { icon: Bot, label: 'Projeto' },
    { icon: CreditCard, label: 'Método' },
    { icon: Lock, label: 'Dados' }, // Nova etapa
    { icon: ShieldCheck, label: 'Confirmar' }
  ];

  const plans = [
    {
      id: 'start',
      name: 'Start',
      price: 'R$ 199/mês',
      features: ['Acesso ao ZM Flow', 'Até 50 CNPJs', 'Suporte Email', '1 Projeto/mês']
    },
    {
      id: 'growth',
      name: 'Growth',
      price: 'R$ 499/mês',
      features: ['Tudo do Start', 'Robô de CNDs', 'Gerador de Contratos', 'Suporte WhatsApp', '3 Projetos/mês'],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Sob Consulta',
      features: ['API Dedicada', 'Apps Personalizados', 'Suporte 24/7', 'Projetos Ilimitados']
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      
      {/* Background Animado */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px]"></div>
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        
        {/* BARRA DE PROGRESSO */}
        <div className="mb-12 relative px-4 md:px-10">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -z-10 rounded-full"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-500 -z-10 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(step / (stepsIcons.length - 1)) * 100}%` }}
          ></div>
          
          <div className="flex justify-between w-full">
            {stepsIcons.map((s, i) => {
              const Icon = s.icon;
              const isActive = step >= i;
              const isCurrent = step === i;
              
              return (
                <div key={i} className="flex flex-col items-center gap-3 relative group cursor-default">
                  <div 
                    className={`
                      w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border-2
                      ${isActive 
                        ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)] scale-110' 
                        : 'bg-[#0a0a0a] border-white/10 text-gray-500 group-hover:border-white/30'}
                    `}
                  >
                    <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                  </div>
                  <span className={`hidden md:block text-xs font-medium uppercase tracking-wider transition-colors ${isActive ? 'text-white' : 'text-gray-600'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          
          {/* PASSO 0: IDENTIFICAÇÃO */}
          {step === 0 && (
            <motion.div 
              key="step0"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
            >
              <h2 className="text-3xl font-bold mb-2">Quem é você?</h2>
              <p className="text-gray-400 mb-8">Vamos criar seu perfil para iniciar o projeto.</p>
              
              <div className="space-y-6 max-w-md mx-auto">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Nome Completo</label>
                  <input 
                    value={formData.nome}
                    onChange={(e) => updateForm('nome', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white focus:border-purple-500 outline-none"
                    placeholder="Ex: Gustavo Santos"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">E-mail Corporativo</label>
                  <input 
                    value={formData.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white focus:border-purple-500 outline-none"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* PASSO 1: PLANOS */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-3xl font-bold mb-2 text-center">Selecione o Nível</h2>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                {plans.map((plan) => (
                  <div 
                    key={plan.id}
                    onClick={() => updateForm('plan', plan.name)}
                    className={`p-8 rounded-3xl border cursor-pointer transition-all hover:-translate-y-2 duration-300
                      ${formData.plan === plan.name 
                        ? 'bg-purple-900/20 border-purple-500 shadow-xl' 
                        : 'bg-[#0a0a0a] border-white/10 hover:border-purple-500/50'}`}
                  >
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-white mb-6">{plan.price}</div>
                    <ul className="space-y-4 mb-4">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                          <CheckCircle className="w-5 h-5 text-green-500" /> {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
{/* PASSO 2: DETALHES DO PROJETO (ATUALIZADO) */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl w-full max-w-5xl"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Bot className="text-purple-500 w-8 h-8" /> Briefing Técnico
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                
                {/* Coluna da Esquerda: Dados Estruturais */}
                <div className="space-y-5">
                  
                  {/* Tipo e Orçamento */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Tipo de Projeto</label>
                      <select 
                        value={formData.projectType}
                        onChange={(e) => updateForm('projectType', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Selecione...</option>
                        <option value="SaaS">Sistema SaaS</option>
                        <option value="App Mobile">App Mobile (iOS/Android)</option>
                        <option value="E-commerce">E-commerce / Loja</option>
                        <option value="Landing Page">Landing Page</option>
                        <option value="Dashboard">Dashboard Interno</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Orçamento Aprox.</label>
                      <select 
                        value={formData.budget}
                        onChange={(e) => updateForm('budget', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Selecione...</option>
                        <option value="ate-5k">Até R$ 5.000</option>
                        <option value="5k-15k">R$ 5.000 - R$ 15.000</option>
                        <option value="15k-30k">R$ 15.000 - R$ 30.000</option>
                        <option value="30k+">Acima de R$ 30.000</option>
                      </select>
                    </div>
                  </div>

                  {/* Objetivo e Público */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Objetivo Principal</label>
                    <input 
                      value={formData.projectGoal}
                      onChange={(e) => updateForm('projectGoal', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:border-purple-500 outline-none"
                      placeholder="Ex: Automatizar processos, Aumentar vendas..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Público Alvo</label>
                    <input 
                      value={formData.targetAudience}
                      onChange={(e) => updateForm('targetAudience', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:border-purple-500 outline-none"
                      placeholder="Ex: Advogados, Jovens 18-24, Empresas B2B..."
                    />
                  </div>

                  {/* Links de Referência */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Referências (Links)</label>
                    <input 
                      value={formData.referenceLinks}
                      onChange={(e) => updateForm('referenceLinks', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:border-purple-500 outline-none"
                      placeholder="Cole links de sites/apps que você gosta"
                    />
                  </div>
                </div>

                {/* Coluna da Direita: Descrição e Features */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Descrição Detalhada</label>
                    <textarea 
                      value={formData.projectDescription}
                      onChange={(e) => updateForm('projectDescription', e.target.value)}
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 focus:bg-white/10 outline-none transition-all resize-none leading-relaxed text-sm"
                      placeholder="Descreva funcionalidades específicas, regras de negócio ou fluxos importantes..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Funcionalidades Extras</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Login Social', 'Pagamentos', 'Painel Admin', 'Chat IA', 'Multilíngue', 'Notificações'].map((feat) => (
                        <div 
                          key={feat}
                          onClick={() => {
                            const newFeats = formData.features.includes(feat) 
                              ? formData.features.filter(f => f !== feat)
                              : [...formData.features, feat];
                            updateForm('features', newFeats);
                          }}
                          className={`p-2 rounded-lg border cursor-pointer flex items-center gap-2 transition-all hover:bg-white/5 text-xs font-medium
                            ${formData.features.includes(feat) ? 'bg-purple-900/30 border-purple-500 text-white' : 'bg-transparent border-white/10 text-gray-400'}`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.features.includes(feat) ? 'border-purple-500 bg-purple-500 text-white' : 'border-gray-600'}`}>
                            {formData.features.includes(feat) && <CheckCircle className="w-3 h-3" />}
                          </div>
                          {feat}
                        </div>
                      ))}
                    </div>
                  </div>

                   <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Prazo Limite</label>
                     <input 
                       type="date"
                       value={formData.deadline}
                       onChange={(e) => updateForm('deadline', e.target.value)}
                       className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none cursor-pointer"
                     />
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* PASSO 3: ESCOLHA DO MÉTODO */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-3xl font-bold mb-8 text-center">Como deseja pagar?</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { id: 'pix', name: 'PIX', desc: 'Aprovação Imediata', icon: Zap, color: 'text-yellow-400' },
                  { id: 'card', name: 'Cartão', desc: 'Até 12x sem juros', icon: CreditCard, color: 'text-purple-400' },
                  { id: 'boleto', name: 'Boleto', desc: 'Vencimento em 3 dias', icon: FileText, color: 'text-blue-400' }
                ].map((method) => (
                  <div 
                    key={method.id}
                    onClick={() => updateForm('paymentMethod', method.id)}
                    className={`p-6 rounded-2xl border flex flex-col items-center justify-center gap-4 cursor-pointer transition-all hover:-translate-y-1 h-48 ${formData.paymentMethod === method.id ? 'bg-purple-900/20 border-purple-500 shadow-lg' : 'bg-[#0a0a0a] border-white/10 hover:bg-white/5'}`}
                  >
                    <div className={`w-14 h-14 rounded-full bg-white/5 flex items-center justify-center ${method.color} text-2xl`}>
                      <method.icon className="w-7 h-7" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-lg">{method.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{method.desc}</p>
                    </div>
                    {formData.paymentMethod === method.id && (
                      <div className="mt-2 text-purple-400 text-xs font-bold uppercase flex items-center gap-1">
                         <CheckCircle className="w-3 h-3" /> Selecionado
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* --- NOVO PASSO 4: PREENCHIMENTO DOS DADOS --- */}
          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-xl mx-auto bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl relative"
            >
              
              {/* OPÇÃO: CARTÃO DE CRÉDITO */}
              {formData.paymentMethod === 'card' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-center">Dados do Cartão</h2>
                  
                  {/* Cartão Visual (Desenho) */}
                  <div className="w-full aspect-[1.58/1] rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-800 p-6 mb-8 relative shadow-xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <div className="flex justify-between items-start mb-8">
                       <div className="w-12 h-8 bg-white/20 rounded"></div> {/* Chip */}
                       <span className="font-mono text-white/50 text-sm">Crédito</span>
                    </div>
                    <div className="font-mono text-xl md:text-2xl text-white tracking-widest mb-4 drop-shadow-md">
                      {cardData.number || '0000 0000 0000 0000'}
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[10px] text-white/60 uppercase block mb-1">Titular</span>
                        <span className="font-medium text-white tracking-wide uppercase text-sm">{cardData.name || 'SEU NOME'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-white/60 uppercase block mb-1">Validade</span>
                        <span className="font-medium text-white tracking-wide">{cardData.expiry || 'MM/AA'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Campos do Cartão */}
                  <div className="space-y-4">
                    <input 
                      name="number" placeholder="Número do Cartão" maxLength={19}
                      onChange={handleCardChange} value={cardData.number}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-purple-500 transition-all" 
                    />
                    <input 
                      name="name" placeholder="Nome Impresso no Cartão" 
                      onChange={handleCardChange} value={cardData.name}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-purple-500 transition-all uppercase" 
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        name="expiry" placeholder="MM/AA" maxLength={5}
                        onChange={handleCardChange} value={cardData.expiry}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-purple-500 transition-all" 
                      />
                      <input 
                        name="cvc" placeholder="CVC" maxLength={3}
                        onChange={handleCardChange} value={cardData.cvc}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-purple-500 transition-all" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* OPÇÃO: PIX */}
              {formData.paymentMethod === 'pix' && (
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Escaneie o QR Code</h2>
                  <p className="text-gray-400 mb-6 text-sm">O pagamento é aprovado na hora.</p>
                  
                  <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-lg shadow-purple-500/10">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PagamentoAssinaturaZM-${formData.plan}`} 
                      alt="QR Code" 
                      className="w-48 h-48"
                    />
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-xl flex items-center gap-3 border border-white/10">
                    <code className="text-xs text-purple-300 truncate flex-1">
                      00020126580014br.gov.bcb.pix0136123e4567-e89b...
                    </code>
                    <button className="text-xs bg-purple-600 px-3 py-1.5 rounded hover:bg-purple-500 transition-colors font-bold">
                      Copiar
                    </button>
                  </div>
                </div>
              )}

              {/* OPÇÃO: BOLETO */}
              {formData.paymentMethod === 'boleto' && (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-400">
                    <FileText className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Pagamento via Boleto</h2>
                  <p className="text-gray-300 mb-6 px-4">
                    Ao confirmar, enviaremos o boleto bancário para o e-mail:
                    <br/>
                    <strong className="text-white bg-white/10 px-2 py-0.5 rounded mt-2 inline-block">{formData.email || 'seu@email.com'}</strong>
                  </p>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-yellow-200 text-sm text-left flex gap-3">
                     <div className="text-xl">⚠️</div>
                     <div>
                       <p className="font-bold">Atenção</p>
                       <p>A compensação do boleto pode levar até 3 dias úteis. O projeto iniciará após a compensação.</p>
                     </div>
                  </div>
                </div>
              )}

            </motion.div>
          )}

          {/* PASSO 5: CONFIRMAÇÃO FINAL (Era o 4) */}
          {step === 5 && (
            <motion.div 
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-2xl mx-auto bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 overflow-hidden relative shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600"></div>
              
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20 animate-pulse">
                  <ShieldCheck className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold">Tudo Pronto!</h2>
                <p className="text-gray-400">Revise e confirme para iniciar.</p>
              </div>

              <div className="space-y-4 bg-white/5 rounded-2xl p-6 border border-white/5">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Cliente</p>
                    <p className="font-medium text-white">{formData.nome}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total</p>
                    <p className="font-bold text-purple-400 text-lg">{formData.plan || 'Start'}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                   <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Método</p>
                      <p className="text-white capitalize">{formData.paymentMethod}</p>
                   </div>
                   {formData.paymentMethod === 'card' && (
                     <div className="text-right">
                       <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Final do Cartão</p>
                       <p className="text-white font-mono">**** {cardData.number.slice(-4) || '****'}</p>
                     </div>
                   )}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Botões de navegação */}
        <div className="flex gap-4 mt-12 max-w-4xl mx-auto px-4">
          {step > 0 && (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-gray-400 hover:text-white font-medium"
            >
              <ChevronLeft className="w-5 h-5" />
              Voltar
            </button>
          )}
          
          <button
            onClick={step === 5 ? handleSubmit : nextStep}
            disabled={
                (step === 0 && (!formData.nome || !formData.email)) ||
                (step === 1 && !formData.plan) || 
                (step === 3 && !formData.paymentMethod) || 
                isLoading
            }
            className={`
              flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg
              ${isLoading 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-500/25 transform hover:-translate-y-1'}
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            `}
          >
            {isLoading ? (
              <>Processando <span className="animate-spin">⏳</span></>
            ) : (
              step === 5 ? 'Pagar e Contratar' : 'Continuar Avançando'
            )}
            {!isLoading && step !== 5 && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}