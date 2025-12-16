// app/api/payment/subscribe/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { criarAssinatura } from "@/lib/asaas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, plano } = body; // O Frontend vai mandar quem é o user e qual o plano

    // 1. Acha o usuário no banco para pegar o ID do Asaas dele
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.asaasCustomerId) {
      return NextResponse.json({ error: "Usuário não encontrado ou sem cadastro no Asaas" }, { status: 400 });
    }

    // 2. Define o valor baseado no plano
    let valor = 0;
    if (plano === 'Start') valor = 199.90;
    if (plano === 'Growth') valor = 499.90;
    
    if (valor === 0) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    // 3. Cria a assinatura no Asaas
    const assinatura = await criarAssinatura(user.asaasCustomerId, valor);

    // 4. Atualiza no seu banco que ele escolheu esse plano
    await prisma.user.update({
      where: { id: userId },
      data: { plan: plano }
    });

    return NextResponse.json({ 
      success: true, 
      linkPagamento: assinatura.invoiceUrl, // O link para ele pagar
      status: assinatura.status 
    });

  } catch (error: any) {
    console.error("Erro ao assinar:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}