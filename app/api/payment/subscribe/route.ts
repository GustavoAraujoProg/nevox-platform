// app/api/payment/subscribe/route.ts - VERSÃO CORRIGIDA
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

    // 3. 🔥 VALORES (Modo Teste Ativo)
    const MODO_TESTE = true; // Mude para false em produção

    let valor = 0;
    
    if (MODO_TESTE) {
      // Valores para teste
      if (plano === 'Start') valor = 5.00;
      if (plano === 'Growth') valor = 10.00;
      if (plano === 'Enterprise') valor = 15.00;
    } else {
      // Valores reais
      if (plano === 'Start') valor = 199.90;
      if (plano === 'Growth') valor = 499.90;
      if (plano === 'Enterprise') valor = 999.90;
    }

    if (valor === 0) return NextResponse.json({ error: "Plano inválido" }, { status: 400 });

    // 4. LÓGICA DE PAGAMENTO
    let resultadoAsaas: any; // ← Declaração do tipo ANY para aceitar qualquer estrutura
    let tipoPagamento = 'BOLETO';

    if (paymentMethod === 'card') {
      // FLUXO CARTÃO
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
      // FLUXO PIX/BOLETO
      resultadoAsaas = await criarAssinatura(user.asaasCustomerId, valor);
      tipoPagamento = paymentMethod === 'pix' ? 'PIX' : 'BOLETO';
    }

    // 5. ATUALIZA O BANCO
    await prisma.user.update({
      where: { id: userId },
      data: { 
        plan: plano,
        status: paymentMethod === 'card' ? 'ACTIVE' : 'PENDING'
      }
    });
    
    // 6. 🔥 CORREÇÃO DO LINK (AQUI ESTAVA O ERRO!)
    // O Asaas pode retornar o link de várias formas, pegamos o primeiro que existir
    const linkPagamento = 
      resultadoAsaas?.invoiceUrl || 
      resultadoAsaas?.bankSlipUrl || 
      resultadoAsaas?.url || 
      null;

    // 7. LOG PARA DEBUG (Veja no terminal o que o Asaas retornou)
    console.log("📦 Resposta do Asaas:", JSON.stringify(resultadoAsaas, null, 2));
    console.log("🔗 Link encontrado:", linkPagamento);

    return NextResponse.json({ 
      success: true, 
      method: paymentMethod,
      paymentUrl: linkPagamento, // ← AGORA VAI FUNCIONAR
      status: resultadoAsaas?.status || 'PENDING',
      testMode: MODO_TESTE
    });

  } catch (error: any) {
    console.error("❌ Erro no pagamento:", error);
    return NextResponse.json({ 
      error: error.message || "Erro ao processar" 
    }, { status: 500 });
  }
}