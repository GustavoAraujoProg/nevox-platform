// app/api/pagamento/route.ts
import { NextResponse } from "next/server";
import { criarClienteAsaas, criarAssinaturaCartao } from "@/lib/asaas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Pega IP do cliente (importante para segurança)
    const ip = request.headers.get("x-forwarded-for") || "0.0.0.0";

    // 2. Cria o Cliente
    const clienteId = await criarClienteAsaas({
      nome: body.nome,
      email: body.email,
      cpf: body.cpf,
      telefone: body.telefone
    });

    // 3. Cria a Assinatura
    const resultado = await criarAssinaturaCartao(
      clienteId,
      1.00, // Valor fixo da assinatura
      { // Dados do Cartão
        nome: body.card_name,
        numero: body.card_number,
        mes: body.card_month,
        ano: body.card_year,
        cvv: body.card_cvv
      },
      { // Dados do Titular
        nome: body.nome,
        email: body.email,
        cpf: body.cpf,
        cep: "00000000", // Ideal: vir do frontend
        numero: "0",
        telefone: body.telefone
      },
      ip
    );

    if (resultado.sucesso) {
      return NextResponse.json({ message: "Assinatura criada!", id: resultado.dados.id });
    } else {
      return NextResponse.json({ error: resultado.erro }, { status: 400 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}