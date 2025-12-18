// app/api/payment/subscribe/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { criarAssinatura, criarAssinaturaCartao } from "@/lib/asaas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, plano, paymentMethod, cardData, holderInfo } = body;

    // 1. Validação Básica
    if (!userId || !plano) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // 2. Busca Usuário
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.asaasCustomerId) {
      return NextResponse.json({ error: "Cliente não encontrado no Asaas" }, { status: 400 });
    }

    // 3. Define Valor
    let valor = 0;
    if (plano === 'Start') valor = 199.90;
    if (plano === 'Growth') valor = 499.90;
    if (plano === 'Enterprise') valor = 999.90;

    if (valor === 0) return NextResponse.json({ error: "Plano inválido" }, { status: 400 });

    // 4. LÓGICA DE PAGAMENTO
    let resultadoAsaas;
    let tipoPagamento = 'BOLETO'; // Padrão

    if (paymentMethod === 'card') {
      // --- FLUXO CARTÃO ---
      if (!cardData || !holderInfo) {
        return NextResponse.json({ error: "Dados do cartão faltando" }, { status: 400 });
      }

      resultadoAsaas = await criarAssinaturaCartao(
        user.asaasCustomerId, 
        valor, 
        cardData, 
        holderInfo,
        "0.0.0.0"
      );
      
      tipoPagamento = 'CREDIT_CARD';

    } else {
      // --- FLUXO PIX/BOLETO ---
      // Nota: Se sua função 'criarAssinatura' aceitar o tipo de pagamento, passe ele aqui.
      // Por enquanto mantive como estava, mas capturando o resultado corretamente.
      resultadoAsaas = await criarAssinatura(user.asaasCustomerId, valor); 
      tipoPagamento = paymentMethod === 'pix' ? 'PIX' : 'BOLETO';
    }

    // 5. ATUALIZA O BANCO (CORRIGIDO PARA PENDING)
    // CUIDADO: Se você deixar 'ACTIVE' aqui, o usuário ganha acesso sem pagar.
    // Mudei para 'PENDING'. O acesso só libera quando o Webhook receber o pagamento.
    await prisma.user.update({
      where: { id: userId },
      data: { 
        plan: plano,
        status: 'PENDING' // O usuário fica pendente até pagar o Pix/Boleto
      }
    });
    
    // 6. RESPOSTA INTELIGENTE (CORREÇÃO DO LINK)
    // O Asaas pode devolver o link em 'billUrl' (Assinatura), 'invoiceUrl' ou 'bankSlipUrl'.
    // Pegamos o primeiro que existir.
    const linkPagamento = resultadoAsaas.billUrl || resultadoAsaas.invoiceUrl || resultadoAsaas.bankSlipUrl || null;

    return NextResponse.json({ 
      success: true, 
      method: paymentMethod,
      paymentUrl: linkPagamento, // <--- AQUI ESTAVA O ERRO, AGORA VAI O LINK CERTO
      status: resultadoAsaas.status 
    });

  } catch (error: any) {
    console.error("Erro no pagamento:", error);
    return NextResponse.json({ error: error.message || "Erro ao processar" }, { status: 500 });
  }
}