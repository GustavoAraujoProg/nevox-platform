// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Força o Next.js a não fazer cache dessa rota
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log("🔍 Admin: Buscando usuários...");

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      // IMPORTANTE: Aqui definimos EXATAMENTE o que queremos ver
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        status: true,
        projectStage: true,
        hasSignedContract: true, // <--- TEM QUE ESTAR AQUI
        createdAt: true
      }
    });

    // Debug: Mostra no terminal o que encontrou (pra gente ter certeza)
    console.log(`✅ Admin: Encontrei ${users.length} usuários.`);
    if (users.length > 0) {
        console.log(`📝 Status do 1º usuário (${users[0].name}): Contrato Assinado? ${users[0].hasSignedContract}`);
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error("❌ Erro Admin Users:", error);
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
  }
}