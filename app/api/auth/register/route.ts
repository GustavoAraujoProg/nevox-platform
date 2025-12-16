// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Log para ver se os dados chegaram (sem mostrar senha)
    console.log("Tentando registrar:", body.email);
    console.log("Chave Asaas (primeiros 5):", process.env.ASAAS_ACCESS_TOKEN?.substring(0, 5));

    // 1. Verifica se já existe no Banco
    const userExists = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (userExists) {
      return NextResponse.json({ error: "Usuário já existe" }, { status: 400 });
    }

    // 2. Cria cliente no Asaas (COM LOG DE ERRO DETALHADO)
    // ATENÇÃO: Verifique se você está usando a URL certa (Sandbox ou Produção)
    // Se sua chave começa com $aact_... geralmente é produção (www.asaas.com)
    // Se você pegou no sandbox.asaas.com, a url tem que ser sandbox.
    const asaasUrl = "https://www.asaas.com/api/v3/customers"; 
    // ^^^ SE FOR TESTE, MUDE PARA: "https://sandbox.asaas.com/api/v3/customers"

    const asaasResponse = await fetch(asaasUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": process.env.ASAAS_ACCESS_TOKEN || ""
      },
      body: JSON.stringify({
        name: body.nome,
        email: body.email,
        cpfCnpj: body.cpf,
        mobilePhone: body.telefone
      })
    });

    // --- O PULO DO GATO PARA DESCOBRIR O ERRO ---
    const asaasStatus = asaasResponse.status;
    const asaasText = await asaasResponse.text(); // Lê como texto primeiro
    
    console.log(`Status Asaas: ${asaasStatus}`);
    console.log(`Resposta Asaas: ${asaasText}`);

    if (!asaasResponse.ok) {
      throw new Error(`Erro no Asaas: ${asaasText}`);
    }

    const asaasCustomer = JSON.parse(asaasText); // Converte para JSON se deu certo

    // 3. Salva no Banco de Dados (Postgres)
    const newUser = await prisma.user.create({
      data: {
        name: body.nome,
        email: body.email,
        cpf: body.cpf,
        phone: body.telefone,
        password: body.senha, 
        asaasCustomerId: asaasCustomer.id,
        plan: "Start", 
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, userId: newUser.id });

  } catch (error: any) {
    console.error("ERRO GRAVE NO REGISTRO:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}