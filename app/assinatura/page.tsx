// app/assinatura/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, FileText, CheckCircle, ChevronRight, 
  ChevronLeft, Bot, User, Package, ShieldCheck, Zap, Lock, AlertTriangle, Loader2
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

// --- COMPONENTE INTERNO (LÓGICA) ---
function AssinaturaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); 

  // Estado de Login
  const [isLogged, setIsLogged] = useState(false);
  const [userId, setUserId] = useState('');

  // Estados do Formulário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',      
    telefone: '', 
    paymentMethod: '',
    plan: '',
    // Campos de Projeto (Opcionais)
    projectType: '',
    projectDescription: ''
  });

  // Estados do Cartão de Crédito
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: ''
  });

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardData(prev => ({ ...prev, [name]: value }));
  };

  // Verifica Login e URL ao carregar
  useEffect(() => {
    const token = localStorage.getItem('nevox_token');
    const storedId = localStorage.getItem('nevox_user_id');
    const storedName = localStorage.getItem('nevox_user_name');
    
    // Pega o plano da URL (?plano=Start) se existir
    const urlPlan = searchParams.get('plano');
    if (urlPlan) updateForm('plan', urlPlan);

    if (token && storedId) {
      setIsLogged(true);
      setUserId(storedId);
      if (storedName) updateForm('nome', storedName);
    }
  }, [searchParams]);

  const nextStep = () => {
    // Bloqueio se não estiver logado no Passo 0
    if (step === 0 && !isLogged) {
        localStorage.setItem('temp_plan_choice', formData.plan);
        alert("Para continuar, você precisa criar sua conta ou fazer login.");
        router.push('/cadastro');
        return;
    }
    setStep(prev => prev + 1);
  };
  
  const prevStep = () => setStep(prev => prev - 1);

  // --- FUNÇÃO DE PAGAMENTO REAL ---
  const handleSubmit = async () => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      if (!userId) throw new Error("Usuário não identificado. Faça login novamente.");

      // Preparar dados do Cartão (Se for cartão)
      let cardPayload = null;
      let holderPayload = null;

      if (formData.paymentMethod === 'card') {
         // Validação simples
         if(cardData.number.length < 13 || !cardData.cvc || !cardData.expiry) {
             throw new Error("Dados do cartão incompletos.");
         }

         const expiryParts = cardData.expiry.split('/');
         const month = expiryParts[0];
         const year = expiryParts[1]?.length === 2 ? `20${expiryParts[1]}` : expiryParts[1];

         cardPayload = {
            holderName: cardData.name,
            number: cardData.number.replace(/\s/g, ''),
            expiryMonth: month,
            expiryYear: year,
            ccv: cardData.cvc
         };

         // Dados do titular (obrigatório para antifraude)
         holderPayload = {
            name: formData.nome,
            email: formData.email,
            cpfCnpj: formData.cpf.replace(/\D/g, ''),
            postalCode: '00000-000', 
            addressNumber: 'SN',
            phone: formData.telefone.replace(/\D/g, '')
         };
      }

      // CHAMA A API
      const response = await fetch("/api/payment/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId: userId,
            plano: formData.plan || 'Start',
            paymentMethod: formData.paymentMethod, // 'card', 'pix' ou 'boleto'
            cardData: cardPayload,
            holderInfo: holderPayload
        }),
      });

      const result = await response.json();

      console.log("Debug Pagamento:", result); // Log para ver o que a API devolve

      if (!result.success) {
        throw new Error(result.error || "Erro ao processar assinatura.");
      }

      // --- SUCESSO E REDIRECIONAMENTO ---
      if (formData.paymentMethod === 'card') {
          // SE FOR CARTÃO: Sucesso direto, vai pro Dashboard
          alert("Assinatura confirmada com sucesso! Bem-vindo.");
          router.push('/dashboard');
      } else {
          // SE FOR PIX/BOLETO: Tenta pegar qualquer variação de URL que o Asaas devolva
          const linkPagamento = result.paymentUrl || result.invoiceUrl || result.bankSlipUrl;

          if (linkPagamento) {
             window.location.href = linkPagamento;
          } else {
             // CORREÇÃO: Não redireciona para dashboard se falhar o link
             console.error("Link não encontrado no objeto:", result);
             throw new Error("A cobrança foi gerada, mas o link de pagamento não foi retornado. Verifique seu e-mail.");
          }
      }

    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Erro de conexão.");
      // Se der erro no cartão, volta para a tela de cartão
      if (formData.paymentMethod === 'card') setStep(3);
    } finally {
      setIsLoading(false);
    }
  }

  const stepsIcons = [
    { icon: User, label: 'Você' },
    { icon: Package, label: 'Plano' },
    { icon: Bot, label: 'Projeto' },
    { icon: CreditCard, label: 'Método' }, // Passo 3
    { icon: ShieldCheck, label: 'Confirmar' } // Passo 4
  ];

  const plans = [
    {
      id: 'start',
      name: 'Start',
      price: 'R$ 199,90',
      features: ['Acesso ao ZM Flow', 'Até 50 CNPJs', 'Suporte Email', '1 Projeto/mês']
    },
    {
      id: 'growth',
      name: 'Growth',
      price: 'R$ 499,90',
      features: ['Tudo do Start', 'Robô de CNDs', 'Gerador de Contratos', 'Suporte WhatsApp', '3 Projetos/mês'],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'R$ 999,90',
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
              return (
                <div key={i} className="flex flex-col items-center gap-3 relative group cursor-default">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border-2 ${isActive ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)] scale-110' : 'bg-[#0a0a0a] border-white/10 text-gray-500 group-hover:border-white/30'}`}>
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <span className={`hidden md:block text-xs font-medium uppercase tracking-wider transition-colors ${isActive ? 'text-white' : 'text-gray-600'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* MENSAGEM DE ERRO */}
        {errorMsg && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl mb-6 text-center animate-pulse flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5" /> {errorMsg}
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* PASSO 0: IDENTIFICAÇÃO */}
          {step === 0 && (
            <motion.div 
              key="step0"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
            >
              <h2 className="text-3xl font-bold mb-2">Vamos começar</h2>
              <p className="text-gray-400 mb-8">Confirme seus dados para vincularmos sua assinatura.</p>
              
              <div className="space-y-6 max-w-md mx-auto">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Nome Completo</label>
                  <input 
                    value={formData.nome}
                    readOnly={isLogged}
                    onChange={(e) => updateForm('nome', e.target.value)}
                    className={`w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white focus:border-purple-500 outline-none ${isLogged ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="Seu Nome"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">E-mail de Acesso</label>
                  <input 
                    value={formData.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white focus:border-purple-500 outline-none"
                    placeholder="seu@email.com"
                  />
                </div>
                {/* CPF e Telefone são obrigatórios para o Asaas */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">CPF</label>
                        <input 
                            value={formData.cpf}
                            onChange={(e) => updateForm('cpf', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white focus:border-purple-500 outline-none"
                            placeholder="000.000.000-00"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Celular</label>
                        <input 
                            value={formData.telefone}
                            onChange={(e) => updateForm('telefone', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white focus:border-purple-500 outline-none"
                            placeholder="(11) 99999-9999"
                        />
                    </div>
                 </div>

                {!isLogged && (
                    <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-xl text-sm text-purple-200 text-center">
                        Você precisará criar uma conta ou fazer login no próximo passo.
                    </div>
                )}
              </div>
            </motion.div>
          )}

          {/* PASSO 1: PLANOS */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-3xl font-bold mb-2 text-center">Escolha seu Plano</h2>
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

          {/* PASSO 2: BRIEFING */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl w-full max-w-3xl mx-auto"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 justify-center">
                <Bot className="text-purple-500 w-8 h-8" /> O que vamos construir?
              </h2>
              <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Tipo de Projeto</label>
                    <select 
                      value={formData.projectType}
                      onChange={(e) => updateForm('projectType', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Selecione...</option>
                      <option value="SaaS">Sistema SaaS</option>
                      <option value="App Mobile">App Mobile</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Breve Descrição</label>
                    <textarea 
                      value={formData.projectDescription}
                      onChange={(e) => updateForm('projectDescription', e.target.value)}
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none resize-none"
                      placeholder="Ex: Quero um sistema para controlar estoque de..."
                    />
                  </div>
              </div>
            </motion.div>
          )}

          {/* PASSO 3: MÉTODO */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-3xl font-bold mb-8 text-center">Forma de Pagamento</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { id: 'pix', name: 'PIX', desc: 'Aprovação Imediata', icon: Zap, color: 'text-yellow-400' },
                  { id: 'card', name: 'Cartão', desc: 'Até 12x', icon: CreditCard, color: 'text-purple-400' },
                  { id: 'boleto', name: 'Boleto', desc: 'Vencimento 3 dias', icon: FileText, color: 'text-blue-400' }
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

          {/* PASSO 4: CONFIRMAÇÃO (E DADOS DO CARTÃO SE NECESSÁRIO) */}
          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-2xl mx-auto bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 overflow-hidden relative shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600"></div>
              
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20 animate-pulse">
                  <ShieldCheck className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold">Resumo do Pedido</h2>
                <p className="text-gray-400">Revise antes de confirmar.</p>
              </div>

              <div className="space-y-4 bg-white/5 rounded-2xl p-6 border border-white/5 mb-6">
                 {/* Resumo */}
                 <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Plano</p>
                        <p className="font-bold text-white text-lg">{formData.plan || 'Start'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total</p>
                        <p className="font-bold text-purple-400 text-xl">{plans.find(p => p.name === formData.plan)?.price}</p>
                    </div>
                 </div>
              </div>

              {/* SE FOR CARTÃO, MOSTRA OS CAMPOS AQUI */}
              {formData.paymentMethod === 'card' ? (
                 <div className="space-y-4 animate-in fade-in">
                     <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Dados do Cartão</h3>
                     
                     <div className="space-y-3">
                        <input 
                            name="number" placeholder="Número do Cartão" maxLength={19}
                            onChange={handleCardChange} value={cardData.number}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-purple-500 transition-all" 
                        />
                        <input 
                            name="name" placeholder="Nome Impresso (Ex: JOAO S SILVA)" 
                            onChange={handleCardChange} value={cardData.name}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-purple-500 transition-all uppercase" 
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <input 
                                name="expiry" placeholder="Validade (MM/AA)" maxLength={5}
                                onChange={handleCardChange} value={cardData.expiry}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-purple-500 transition-all text-center" 
                            />
                            <input 
                                name="cvc" placeholder="CVC (3 dígitos)" maxLength={4}
                                onChange={handleCardChange} value={cardData.cvc}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-purple-500 transition-all text-center" 
                            />
                        </div>
                     </div>
                     <div className="mt-4 flex items-center gap-2 text-xs text-green-400 justify-center">
                         <Lock className="w-3 h-3" /> Transação Criptografada (256-bit SSL)
                     </div>
                 </div>
              ) : (
                <div className="mt-4 bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg flex items-start gap-3">
                    <Lock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-200 leading-relaxed">
                        Ao clicar em <strong>Pagar Agora</strong>, você será redirecionado para a fatura segura do Asaas (Pix/Boleto).
                    </p>
                </div>
              )}

            </motion.div>
          )}

        </AnimatePresence>

        {/* Botões */}
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
            onClick={step === 4 ? handleSubmit : nextStep}
            disabled={
                (step === 0 && (!formData.nome || !formData.cpf)) ||
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
              <>Processando <Loader2 className="animate-spin w-5 h-5" /></>
            ) : (
              step === 4 ? (formData.paymentMethod === 'card' ? 'Pagar Agora' : 'Gerar Fatura') : 'Continuar'
            )}
            {!isLoading && step !== 4 && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- PÁGINA PRINCIPAL (WRAPPER COM SUSPENSE) ---
export default function AssinaturaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
      </div>
    }>
      <AssinaturaContent />
    </Suspense>
  );
}