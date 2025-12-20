// app/api/user/me/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { projects: true } // Traz projetos se tiver
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // AQUI É O SEGREDO: Enviamos explicitamente o status do contrato
    return NextResponse.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        plan: user.plan,
        
        // Regras de Bloqueio
        // Se status for ACTIVE, tem plano. Se hasSignedContract for true, assinou.
        hasActivePlan: user.status === 'ACTIVE', 
        hasSignedContract: user.hasSignedContract, 
        
        contractSignedAt: user.contractSignedAt,
        projectStage: user.projectStage
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}