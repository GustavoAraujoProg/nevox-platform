// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Aceita tanto "senha" quanto "password" vindo do Frontend
    const senhaInput = body.password || body.senha;
    const emailInput = body.email;

    // 1. Busca o usuário no banco
    const user = await prisma.user.findUnique({
      where: { email: emailInput }
    });

    // 2. Verifica se o usuário existe E se a senha bate
    // AQUI ESTAVA O ERRO: Agora usamos user.password (do banco)
    if (!user || user.password !== senhaInput) {
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    }

    // 3. Login com sucesso!
    return NextResponse.json({ 
      success: true, 
      userId: user.id,
      name: user.name, // Retorna o nome correto
      plan: user.plan
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}