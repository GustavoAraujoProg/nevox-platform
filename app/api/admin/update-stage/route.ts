import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId, stage } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { projectStage: stage }
    });

    return NextResponse.json({ success: true, stage: updatedUser.projectStage });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}