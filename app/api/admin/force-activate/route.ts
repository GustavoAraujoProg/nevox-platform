// app/api/admin/force-activate/route.ts
// CRIE ESTE ARQUIVO PARA ATIVAR MANUALMENTE
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Busca o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // 🔥 ATIVA O USUÁRIO FORÇADAMENTE
    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: 'ACTIVE',
        hasActivePlan: true, // ← ISSO QUE LIBERA O DASHBOARD!
        plan: 'Start' // Ou o plano que ele escolheu
      }
    });

    console.log(`✅ Usuário ${email} ativado manualmente!`);

    return NextResponse.json({ 
      success: true, 
      message: `Usuário ${email} ativado! Faça login de novo.` 
    });

  } catch (error: any) {
    console.error("Erro ao ativar:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}