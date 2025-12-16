// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Confirme se o arquivo na pasta lib é prisma.ts
import { criarClienteAsaas } from "@/lib/asaas"; 

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Verifica se já existe
    const userExists = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (userExists) {
      return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 400 });
    }

    // 2. Prepara os dados para o Asaas
    // O Frontend manda 'nome' e 'telefone', aqui a gente organiza
    const asaasId = await criarClienteAsaas({
      nome: body.nome || body.name, 
      email: body.email,
      cpf: body.cpf,
      telefone: body.telefone || body.phone 
    });

    // 3. Salva no Banco (Agora usando os nomes em Inglês que criamos)
    const newUser = await prisma.user.create({
      data: {
        name: body.nome || body.name,       // Banco: name | Form: nome
        email: body.email,
        cpf: body.cpf,
        phone: body.telefone || body.phone, // Banco: phone | Form: telefone
        password: body.password || body.senha || "mudar123", // Banco: password
        asaasCustomerId: asaasId,
        status: "PENDING",
        plan: "None"
      }
    });

    return NextResponse.json({ success: true, userId: newUser.id });

  } catch (error: any) {
    console.error("Erro no registro:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}