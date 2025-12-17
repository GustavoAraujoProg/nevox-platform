// app/api/finance/invoices/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) return NextResponse.json({ error: "UserId obrigatório" }, { status: 400 });

    // 1. Busca o usuário
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Se não tiver ID do Asaas, retorna lista vazia (sem erro)
    if (!user || !user.asaasCustomerId) {
      return NextResponse.json({ invoices: [] }); 
    }

    // 2. Configurações Asaas
    const apiKey = process.env.ASAAS_ACCESS_TOKEN;
    const apiUrl = process.env.ASAAS_URL;

    if (!apiKey || !apiUrl) {
      console.error("ERRO: Variáveis ASAAS não configuradas no .env");
      return NextResponse.json({ invoices: [] }); // Retorna vazio em vez de quebrar
    }

    // 3. Busca no Asaas
    const response = await fetch(`${apiUrl}/payments?customer=${user.asaasCustomerId}`, {
      method: 'GET',
      headers: { access_token: apiKey }
    });

    // Se o Asaas der erro (401, 500, etc), não quebra o site
    if (!response.ok) {
      const text = await response.text();
      console.error(`Erro Asaas (${response.status}):`, text);
      return NextResponse.json({ invoices: [] }); 
    }

    const data = await response.json();

    // 4. Retorna as faturas (ou array vazio se não tiver)
    return NextResponse.json({ 
      invoices: data.data || [] 
    });

  } catch (error: any) {
    console.error("Erro CRÍTICO ao buscar faturas:", error);
    // Retorna array vazio para o painel não travar carregando
    return NextResponse.json({ invoices: [] });
  }
}