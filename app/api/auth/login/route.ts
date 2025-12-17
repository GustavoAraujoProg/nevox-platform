// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Busca o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: body.email }
    });

    // 2. Verifica se a senha bate (comparação simples)
    if (!user || user.password !== body.password) {
      return NextResponse.json({ error: "Email ou senha incorretos" }, { status: 401 });
    }

    // 3. Sucesso! Retorna os dados
    return NextResponse.json({ 
      success: true,
      userId: user.id,
      userName: user.name,
      plan: user.plan
    });

  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}