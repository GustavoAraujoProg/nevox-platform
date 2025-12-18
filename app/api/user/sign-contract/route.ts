import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarContratoPorEmail } from "@/lib/mail";

export async function POST(request: Request) {
  console.log("🏁 INICIANDO PROCESSO DE ASSINATURA...");
  
  try {
    const body = await request.json();
    const { userId, signatureName } = body;

    console.log("1️⃣ Recebi os dados:", { userId, signatureName });

    // PASSO 1: Buscar Usuário
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        console.error("❌ Usuário não encontrado no banco.");
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }
    console.log("✅ Usuário encontrado:", user.email);

    // PASSO 2: Atualizar Banco (AQUI GERALMENTE DÁ O ERRO SE O BANCO TIVER DESATUALIZADO)
    console.log("2️⃣ Tentando atualizar hasSignedContract no banco...");
    await prisma.user.update({
      where: { id: userId },
      data: { hasSignedContract: true } // <--- O ERRO 500 GERALMENTE É AQUI
    });
    console.log("✅ Banco atualizado com sucesso!");

    // PASSO 3: Criar Timeline
    console.log("3️⃣ Criando item na Timeline...");
    const dataAtual = new Date();
    await prisma.timelineItem.create({
      data: {
        userId,
        title: "Contrato Assinado",
        description: `Assinado digitalmente por ${signatureName}.`,
        status: "completed",
        date: dataAtual
      }
    });
    console.log("✅ Timeline criada!");

    // PASSO 4: Enviar E-mail
    console.log("4️⃣ Tentando enviar e-mail...");
    // Coloquei num try/catch separado para o e-mail não travar o site se der erro
    try {
        await enviarContratoPorEmail(user.email, signatureName, dataAtual.toLocaleString('pt-BR'));
        console.log("✅ E-mail enviado!");
    } catch (emailError) {
        console.error("⚠️ Erro apenas no envio de e-mail (mas o resto funcionou):", emailError);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    // ESSE LOG VAI TE CONTAR O SEGREDO DO ERRO
    console.error("❌❌❌ ERRO FATAL NO SERVIDOR:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}