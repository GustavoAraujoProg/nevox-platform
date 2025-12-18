// app/api/projects/timeline/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // Busca os itens da timeline ordenados por data (mais recente primeiro)
    const items = await prisma.timelineItem.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar timeline" }, { status: 500 });
  }
}