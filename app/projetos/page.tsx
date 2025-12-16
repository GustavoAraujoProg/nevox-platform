"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Code2, Database, Smartphone, Layout } from 'lucide-react';

// Reutilizando o fundo para manter a identidade
const BackgroundGrid = () => (
  <div className="inset-0 z-0 overflow-hidden bg-black pointer-events-none fixed">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-size-[40px_40px]"></div>
    <div className="absolute right-0 top-0 -z-10 h-150 w-150 rounded-full bg-blue-600/10 blur-[120px]"></div>
    <div className="absolute left-0 bottom-0 -z-10 h-150 w-150 rounded-full bg-purple-600/10 blur-[120px]"></div>
  </div>
);

export default function ProjetosPage() {
  return (
    <div className="relative min-h-screen text-white font-sans selection:bg-purple-500 selection:text-white bg-black">
      <BackgroundGrid />

      {/* Header Simples com Voltar */}
      <nav className="fixed top-0 w-full z-50 p-6 flex justify-between items-center backdrop-blur-sm">
        <a href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Voltar para Home
        </a>
        <span className="font-bold text-xl tracking-tighter">TE LABS</span>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <div className="mb-20">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-7xl font-bold mb-6"
          >
            Nossas Criações
          </motion.h1>
          <p className="text-xl text-gray-400 max-w-2xl border-l-4 border-purple-500 pl-6">
            Não vendemos apenas código. Vendemos ecossistemas digitais que transformam empresas.
            Veja o poder da TE Vox em ação.
          </p>
        </div>

        {/* GRID DE PROJETOS */}
        <div className="space-y-32">
          
       
          <ProjectSection 
            number="01"
            title="TE vox Enterprise"
            category="SaaS / Automação Fiscal"
            description="Plataforma completa de gestão societária. Utiliza Python para varredura de diários oficiais e IA para leitura de contratos sociais. Reduziu o tempo operacional de escritórios em 85%."
            stack={['Python', 'React', 'PostgreSQL', 'AWS']}
            color="purple"
            align="right"
          />

          {/* PROJETO 2 - App Mobile (Ideia) */}
          <ProjectSection 
            number="02"
            title="BankLess App"
            category="Mobile / Fintech"
            description="Aplicativo financeiro para gestão de criptoativos e pagamentos Pix automatizados. Interface futurista com biometria e segurança bancária."
            stack={['React Native', 'Node.js', 'Blockchain', 'Firebase']}
            color="blue"
            align="left"
          />

          {/* PROJETO 3 - Dashboard (Ideia) */}
          <ProjectSection 
            number="03"
            title="Vision AI Dashboard"
            category="Analytics / Big Data"
            description="Painel de controle para diretores. Cruza dados de vendas, marketing e estoque em tempo real usando algoritmos preditivos para sugerir decisões de negócio."
            stack={['Next.js', 'Python Pandas', 'PowerBI API', 'Tailwind']}
            color="green"
            align="right"
          />

        </div>
        
        {/* CTA FINAL */}
        <div className="mt-32 text-center p-12 rounded-3xl bg-white/5 border border-white/10">
          <h2 className="text-3xl font-bold mb-6">Tem uma ideia ousada?</h2>
          <a href="/" className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-200 transition-colors">
            Vamos Construir <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </main>
    </div>
  );
}

// --- COMPONENTE DE PROJETO ---
function ProjectSection({ number, title, category, description, stack, color, align }: any) {
  const isRight = align === 'right';
  
  // Cores dinâmicas
  const colorClasses: any = {
    purple: 'from-purple-600 to-blue-600',
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-emerald-500 to-green-500',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className={`flex flex-col md:flex-row gap-12 items-center ${isRight ? '' : 'md:flex-row-reverse'}`}
    >
      {/* Lado do Texto */}
      <div className="flex-1 space-y-6">
        <div className={`text-6xl font-bold text-white/5`}>{number}</div>
        <div className={`text-sm font-bold tracking-widest uppercase text-${color}-400`}>{category}</div>
        <h2 className="text-4xl font-bold">{title}</h2>
        <p className="text-gray-400 text-lg leading-relaxed">{description}</p>
        
        <div className="flex flex-wrap gap-3 pt-4">
          {stack.map((tech: string) => (
            <span key={tech} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-300">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Lado da Imagem (O Mockup) */}
      <div className="flex-1 w-full aspect-video rounded-2xl overflow-hidden relative group">
        <div className={`absolute inset-0 bg-linear-to-br ${colorClasses[color]} opacity-20 group-hover:opacity-30 transition-opacity z-10`}></div>
        
        {/* Simulação de Interface (Placeholder visual bonito) */}
        <div className="w-full h-full bg-[#111] border border-white/10 p-4 relative">
            <div className="w-full h-full rounded bg-black/50 border border-white/5 flex items-center justify-center overflow-hidden">
                {/* Aqui entrará o print real depois. Por enquanto, um ícone gigante */}
                {number === '01' && <Layout className={`w-32 h-32 text-${color}-500 opacity-50`} />}
                {number === '02' && <Smartphone className={`w-32 h-32 text-${color}-500 opacity-50`} />}
                {number === '03' && <Database className={`w-32 h-32 text-${color}-500 opacity-50`} />}
                
                {/* Efeito de código flutuando no fundo */}
                <div className="absolute top-4 left-4 font-mono text-xs text-white/20">
                    import &#123; AI &#125; from 'te-vox';<br/>
                    const future = await AI.build();
                </div>
            </div>
        </div>
      </div>
    </motion.div>
  )
}