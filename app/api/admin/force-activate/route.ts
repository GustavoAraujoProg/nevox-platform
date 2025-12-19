// app/api/admin/force-activate/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email obrigatório" }, { status: 400 });
    }

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    console.log(`🔧 Ativando manualmente: ${email}`);

    // 🔥 ATIVA COMPLETAMENTE
    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: 'ACTIVE',
        hasActivePlan: true,  // ← ISSO LIBERA!
        plan: user.plan || 'Start'
      }
    });

    console.log(`✅ ${email} ativado com sucesso!`);
    console.log(`   - status: ACTIVE`);
    console.log(`   - hasActivePlan: true`);
    console.log(`   - plan: ${user.plan || 'Start'}`);

    return NextResponse.json({ 
      success: true, 
      message: `Usuário ${email} ativado! Faça logout e login novamente.` 
    });

  } catch (error: any) {
    console.error("❌ Erro ao ativar:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}