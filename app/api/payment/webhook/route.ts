// app/api/payment/webhook/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, payment } = body;

    // 1. Verifica se o evento é de Pagamento Confirmado
    if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
      
      const asaasCustomerId = payment.customer;

      // 2. Busca o usuário que tem esse ID do Asaas
      const user = await prisma.user.findFirst({
        where: { asaasCustomerId: asaasCustomerId }
      });

      if (user) {
        // 3. ATUALIZA O USUÁRIO (AQUI ESTAVA O ERRO ANTES)
        // Antes tentava atualizar 'project', agora atualiza 'user'
        await prisma.user.update({
          where: { id: user.id },
          data: {
            status: "ACTIVE", // Muda o status do USUÁRIO para ativo
            plan: "Growth"    // Define o plano (em Inglês)
          }
        });
        
        console.log(`Usuário ${user.email} ativado com sucesso!`);
      }
    }

    // O Asaas espera um 200 OK para saber que recebemos
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("Erro no Webhook:", error);
    // Mesmo com erro, retornamos 200 pro Asaas não ficar reenviando infinitamente
    return NextResponse.json({ received: true, error: error.message });
  }
}