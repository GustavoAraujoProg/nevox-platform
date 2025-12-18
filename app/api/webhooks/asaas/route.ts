
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, payment } = body;

    console.log(`🔔 Webhook Asaas: ${event} - Valor: ${payment.value} - Cliente: ${payment.customer}`);

    // --- PAGAMENTO APROVADO ---
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      
      const user = await prisma.user.findFirst({
        where: { asaasCustomerId: payment.customer }
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            status: 'ACTIVE',
            hasActivePlan: true,    
            hasSignedContract: true,  
            projectStage: user.projectStage === 'analise' ? 'analise' : user.projectStage 
          }
        });
        console.log(`✅ Usuário ${user.email} LIBERADO com sucesso!`);
      } else {
        console.log(`❌ Usuário não encontrado para o ID Asaas: ${payment.customer}`);
      }


    } else if (event === 'PAYMENT_OVERDUE') {
      
      const user = await prisma.user.findFirst({
        where: { asaasCustomerId: payment.customer }
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            status: 'PENDING',
            hasActivePlan: false // Bloqueia o acesso se não pagar
          } 
        });
        console.log(`⚠️ Usuário ${user.email} bloqueado por falta de pagamento.`);
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Erro no Webhook:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}