// app/api/user/me/route.ts - VERSÃO CORRIGIDA FINAL
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        plan: true,
        status: true,
        projectStage: true,
        hasSignedContract: true,
        hasActivePlan: true,        // ← IMPORTANTE!
        contractSignedAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 🔥 LOG PARA DEBUG
    console.log(`👤 API /user/me chamada para: ${user.email}`);
    console.log(`📊 Status: ${user.status}`);
    console.log(`💳 hasActivePlan: ${user.hasActivePlan}`);
    console.log(`📝 hasSignedContract: ${user.hasSignedContract}`);

    return NextResponse.json({ user });
    
  } catch (error: any) {
    console.error("❌ Erro em /api/user/me:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}