import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId, title, description, status, linkUrl } = await request.json();

    const newItem = await prisma.timelineItem.create({
      data: {
        userId,
        title,
        description,
        status, // 'pending', 'late', 'completed'
        linkUrl,
        date: new Date()
      }
    });

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar item" }, { status: 500 });
  }
}