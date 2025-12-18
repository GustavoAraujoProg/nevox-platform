// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// IMPORTANTE: Isso impede que o navegador mostre dados velhos (cache)
export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        status: true,
        projectStage: true,
        hasSignedContract: true, // <--- O CAMPO DE OURO
        createdAt: true
      }
    });

    // DEBUG: Olhe no seu terminal do VSCode quando atualizar a página
    console.log(`🔍 ADMIN: Busquei ${users.length} usuários.`);
    users.forEach(u => {
        if (u.hasSignedContract) console.log(`✅ ${u.name} JÁ ASSINOU!`);
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Erro Admin Users:", error);
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
  }
}