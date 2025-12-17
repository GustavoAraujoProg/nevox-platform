// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // --- 1. CHAVE MESTRA (BACKDOOR DO ADMIN) ---
    // Use isso para entrar no /admin
    if (body.email === 'admin@nevox.com' && body.password === 'admin123') {
        return NextResponse.json({
            success: true,
            userId: 'master-admin-id',
            name: 'Gustavo Admin',
            role: 'admin',      // Avisa o front que é admin
            token: 'admin_token' // A senha secreta que o /admin exige
        });
    }

    // --- 2. LOGIN NORMAL (CLIENTES) ---
    const user = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Comparação simples (em produção usaríamos bcrypt)
    if (user.password !== body.password) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      name: user.name,
      role: 'user',
      token: 'nevox_user_token'
    });

  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}