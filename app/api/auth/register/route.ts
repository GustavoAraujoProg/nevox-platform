// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { criarClienteAsaas } from "@/lib/asaas"; 

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validação básica
    if (!body.email || !body.password || !body.cpf) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // 2. Verifica se já existe
    const userExists = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (userExists) {
      return NextResponse.json({ error: "Usuário já cadastrado" }, { status: 400 });
    }

    // 3. Cria no Asaas (Se der erro aqui, ele avisa no console mas segue)
    let asaasId = null;
    try {
        // CORREÇÃO: Mapeando para os nomes em PORTUGUÊS que a função criarClienteAsaas pede
        asaasId = await criarClienteAsaas({
            nome: body.nome || body.name,
            email: body.email,
            cpf: body.cpf,                   // A função pede 'cpf'
            telefone: body.telefone || body.phone // A função pede 'telefone'
        });
    } catch (error) {
        console.error("Erro ao criar no Asaas:", error);
    }

    // 4. Cria o usuário no Banco de Dados
    // CORREÇÃO: Aqui usamos os nomes do PRISMA (mobilePhone, password direto)
    const newUser = await prisma.user.create({
      data: {
        name: body.nome || body.name,
        email: body.email,
        password: body.password,        // Usando a senha direta (corrige o erro hashedPassword)
        mobilePhone: body.telefone || body.phone, // O banco pede 'mobilePhone'
        cpf: body.cpf,
        asaasCustomerId: asaasId,
        status: 'PENDING',
        projectStage: 'analise'
      }
    });

    return NextResponse.json({ success: true, userId: newUser.id });

  } catch (error: any) {
    console.error("Erro no registro:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}