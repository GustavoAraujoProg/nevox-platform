import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // Se não tiver userId, retorna array vazio para não quebrar
    if (!userId) return NextResponse.json({ items: [] });

    const items = await prisma.timelineItem.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar timeline" }, { status: 500 });
  }
}