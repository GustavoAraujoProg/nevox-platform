// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { criarClienteAsaas } from "@/lib/asaas";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // --- CORREÇÃO AQUI ---
    // Agora aceita 'password' (inglês) OU 'senha' (português)
    if (!body.email || (!body.password && !body.senha)) {
      return NextResponse.json({ error: "Email e Senha são obrigatórios" }, { status: 400 });
    }

    // Verifica se já existe
    const userExists = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (userExists) {
      return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 400 });
    }

    // Cria no Asaas
    const asaasId = await criarClienteAsaas({
      nome: body.name || body.nome, 
      email: body.email,
      cpf: body.cpf || "",
      telefone: body.phone || body.telefone || ""
    });

    // Salva no Banco
    const newUser = await prisma.user.create({
      data: {
        name: body.name || body.nome, 
        email: body.email,
        // Aceita a senha venha ela como vier
        password: body.password || body.senha, 
        phone: body.phone || body.telefone,
        cpf: body.cpf,
        asaasCustomerId: asaasId,
        status: "ACTIVE",
        plan: "None"
      }
    });

    return NextResponse.json({ 
      success: true, 
      userId: newUser.id,
      userName: newUser.name 
    });

  } catch (error: any) {
    console.error("Erro no registro:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}