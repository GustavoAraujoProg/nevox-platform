// app/api/webhooks/asaas/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // 1. Pega os dados que o Asaas mandou
    const body = await request.json();
    const { event, payment } = body;

    // Segurança: Verifica se tem token de acesso no cabeçalho (Opcional, mas recomendado)
    const token = request.headers.get('asaas-access-token');
    if (token !== process.env.ASAAS_ACCESS_TOKEN) {
       // Se quiser ser muito rigoroso, descomente abaixo. 
       // Por enquanto deixamos passar para facilitar o teste.
       // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`🔔 Webhook Asaas: ${event} - Valor: ${payment.value}`);

    // 2. Lógica de Eventos
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      
      // O cliente PAGOU! Vamos ativar.
      // Precisamos achar quem é esse cliente pelo ID do Asaas
      const user = await prisma.user.findFirst({
        where: { asaasCustomerId: payment.customer }
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            status: 'ACTIVE',
            // Se for o primeiro pagamento, já muda a fase para "Análise"
            projectStage: user.projectStage === 'analise' ? 'analise' : user.projectStage 
          }
        });
        console.log(`✅ Usuário ${user.email} ativado com sucesso!`);
      }

    } else if (event === 'PAYMENT_OVERDUE') {
      
      // O cliente NÃO PAGOU e venceu.
      const user = await prisma.user.findFirst({
        where: { asaasCustomerId: payment.customer }
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { status: 'PENDING' } // Ou bloquear o acesso se quiser
        });
        console.log(`⚠️ Usuário ${user.email} marcado como pendente.`);
      }
    }

    // 3. Responde pro Asaas que recebeu (Senão ele fica mandando de novo)
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Erro no Webhook:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}