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

    // 4. LÓGICA DE DECISÃO (AQUI ESTÁ A MÁGICA)
    let resultadoAsaas;
    let tipoPagamento = 'BOLETO'; // Padrão

    if (paymentMethod === 'card') {
      // --- FLUXO CARTÃO (TRANSPARENTE) ---
      // Aqui usamos os dados que vieram do Frontend para cobrar direto
      if (!cardData || !holderInfo) {
        return NextResponse.json({ error: "Dados do cartão faltando" }, { status: 400 });
      }

      resultadoAsaas = await criarAssinaturaCartao(
        user.asaasCustomerId, 
        valor, 
        cardData, 
        holderInfo,
        "0.0.0.0" // IP (Opcional)
      );
      
      tipoPagamento = 'CREDIT_CARD';

    } else {
      // --- FLUXO PIX/BOLETO (REDIRECIONAMENTO) ---
      // Pix e Boleto funcionam melhor mandando para a fatura do Asaas
      const metodoAsaas = paymentMethod === 'pix' ? 'PIX' : 'BOLETO';
      resultadoAsaas = await criarAssinatura(user.asaasCustomerId, valor); // Usa a função padrão que já criamos
      tipoPagamento = metodoAsaas;
    }

    // 5. Atualiza o Banco com o Plano Novo
    await prisma.user.update({
      where: { id: userId },
      data: { 
        plan: plano,
        status: 'ACTIVE' // Já ativa o sistema para ele não ficar bloqueado
      }
    });

    // 6. Resposta Inteligente
    return NextResponse.json({ 
      success: true, 
      method: paymentMethod,
      // Se for cartão, não tem link, é sucesso direto. Se for Pix, tem link.
      paymentUrl: resultadoAsaas.invoiceUrl || null, 
      status: resultadoAsaas.status 
    });

  } catch (error: any) {
    console.error("Erro no pagamento:", error);
    return NextResponse.json({ error: error.message || "Erro ao processar" }, { status: 500 });
  }
}