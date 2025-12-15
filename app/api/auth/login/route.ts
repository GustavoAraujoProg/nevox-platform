// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, senha } = body;

    // 1. Busca o usuário pelo e-mail
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // 2. Se não achar o usuário OU a senha não bater
    if (!user || user.senha !== senha) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    // 3. Login Aprovado!
    // Retornamos os dados dele (exceto a senha) para salvar no navegador
    return NextResponse.json({ 
      message: 'Login realizado com sucesso!',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role // Importante para saber se é ADMIN ou CLIENTE
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}