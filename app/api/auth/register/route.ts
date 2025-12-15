import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, email, senha, cpf } = body;

    console.log("Tentando cadastrar:", email); // Log para debug

    // 1. Verifica se já existe
    const usuarioExistente = await prisma.user.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 400 });
    }

    // 2. Cria o Usuário e o Projeto
    // IMPORTANTE: Tente criar sem o projeto primeiro se continuar dando erro
    const novoUsuario = await prisma.user.create({
      data: {
        nome,
        email,
        senha,
        cpf,
        projects: {
          create: {
            nome: 'Projeto Inicial',
            plano: 'Start', // Mudei para um valor fixo seguro
            valor: 'R$ 0,00',
            status: 'analise'
          }
        }
      }
    });

    console.log("Sucesso! Usuário criado:", novoUsuario.id); // Log de sucesso

    return NextResponse.json({ message: 'Criado com sucesso' }, { status: 201 });

  } catch (error: any) {
    console.error("ERRO NO CADASTRO (Olhe aqui):", error); // Log do erro real
    return NextResponse.json({ error: 'Erro ao criar usuário: ' + error.message }, { status: 500 });
  }
}