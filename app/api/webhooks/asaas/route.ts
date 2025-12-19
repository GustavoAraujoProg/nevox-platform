// app/api/webhooks/asaas/route.ts - VERSÃO CORRIGIDA
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // 1. Pega os dados que o Asaas mandou
    const body = await request.json();
    const { event, payment } = body;

    console.log(`📦 Webhook recebido: ${event}`);
    console.log(`💰 Pagamento:`, JSON.stringify(payment, null, 2));

    // 2. Lógica de Eventos
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      
      console.log(`✅ Pagamento confirmado! Customer ID: ${payment.customer}`);
      
      // Procura o usuário pelo ID do Asaas
      const user = await prisma.user.findFirst({
        where: { asaasCustomerId: payment.customer }
      });

      if (user) {
        console.log(`👤 Usuário encontrado: ${user.email}`);
        
        // 🔥 AQUI ESTAVA O ERRO! Faltava o hasActivePlan
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            status: 'ACTIVE',
            hasActivePlan: true, // ← ISSO LIBERA O DASHBOARD!
            plan: user.plan || 'Start', // Mantém o plano que já estava
            projectStage: user.projectStage === 'analise' ? 'analise' : user.projectStage 
          }
        });
        
        console.log(`🎉 Usuário ${user.email} ATIVADO com sucesso!`);
        console.log(`✅ hasActivePlan agora é TRUE`);
        
      } else {
        console.error(`❌ ERRO: Nenhum usuário encontrado com asaasCustomerId: ${payment.customer}`);
      }

    } else if (event === 'PAYMENT_OVERDUE') {
      
      // Pagamento venceu
      const user = await prisma.user.findFirst({
        where: { asaasCustomerId: payment.customer }
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            status: 'PENDING',
            hasActivePlan: false // Bloqueia o acesso
          }
        });
        console.log(`⚠️ Usuário ${user.email} marcado como pendente.`);
      }
    }

    // 3. Responde pro Asaas que recebeu
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("❌ Erro no Webhook:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}