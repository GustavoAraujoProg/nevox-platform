// app/api/user/sign-contract/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, signatureName } = body;

    if (!userId || !signatureName) {
      return NextResponse.json({ success: false, error: "Dados inválidos." }, { status: 400 });
    }

    // Atualiza no banco: O usuário agora tem contrato assinado!
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        hasSignedContract: true,
        contractSignedAt: new Date(), // Salva a data e hora exata de agora
      }
    });

    return NextResponse.json({ success: true, date: updatedUser.contractSignedAt });

  } catch (error) {
    console.error("Erro ao assinar:", error);
    return NextResponse.json({ success: false, error: "Erro ao salvar assinatura." }, { status: 500 });
  }
}