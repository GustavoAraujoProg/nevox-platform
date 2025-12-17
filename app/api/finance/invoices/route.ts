// app/api/finance/invoices/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // 1. Pega o ID do cliente no Asaas
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.asaasCustomerId) {
      return NextResponse.json({ invoices: [] }); // Sem faturas ainda
    }

    // 2. Busca as cobranças no Asaas
    const apiKey = process.env.ASAAS_ACCESS_TOKEN;
    const response = await fetch(`${process.env.ASAAS_URL}/payments?customer=${user.asaasCustomerId}`, {
      headers: { access_token: apiKey || '' }
    });

    const data = await response.json();

    // 3. Retorna a lista de faturas
    return NextResponse.json({ 
      invoices: data.data // O Asaas devolve uma lista dentro de 'data'
    });

  } catch (error) {
    console.error("Erro ao buscar faturas:", error);
    return NextResponse.json({ error: "Erro ao buscar financeiro" }, { status: 500 });
  }
}