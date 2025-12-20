// app/api/user/download-contract/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // GARANTIA ANTI-ERRO: Se o nome for null, usa "Cliente"
    const userName = user.name || 'Cliente';
    const userCpf = user.cpf || 'Não informado';

    // 1. Cria o PDF na memória
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Título
    const title = 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS';
    const titleWidth = font.widthOfTextAtSize(title, 18);
    page.drawText(title, { x: (width - titleWidth) / 2, y: height - 100, size: 18, font, color: rgb(0, 0, 0) });
    
    // Dados
    page.drawText(`REF: NVX-${user.id.slice(0,8).toUpperCase()}`, { x: 50, y: height - 140, size: 10, font });
    page.drawText(`CONTRATANTE: ${userName}`, { x: 50, y: height - 160, size: 12, font });
    page.drawText(`CPF: ${userCpf}`, { x: 50, y: height - 180, size: 12, font });
    page.drawText(`PLANO CONTRATADO: ${user.plan}`, { x: 50, y: height - 200, size: 12, font });
    
    const dataAssinatura = user.contractSignedAt ? new Date(user.contractSignedAt).toLocaleString('pt-BR') : 'Pendente';
    page.drawText(`DATA DA ASSINATURA: ${dataAssinatura}`, { x: 50, y: height - 220, size: 12, font });

    page.drawText('------------------------------------------------------------------', { x: 50, y: height - 300, size: 12, font });
    page.drawText('Assinado Digitalmente via Tevox Platform.', { x: 50, y: height - 320, size: 10, font });

    // 2. Salva o PDF como bytes
    const pdfBytes = await pdfDoc.save();

    // 3. Retorna o Arquivo
    // CORREÇÃO DO ERRO: Adicionamos 'as any' para o TypeScript aceitar o formato do PDF
    return new Response(pdfBytes as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        // CORREÇÃO DO NOME: Tratamos o nome para evitar erro se for null ou tiver acentos
        'Content-Disposition': `attachment; filename=Contrato_${userName.split(' ')[0]}.pdf`,
      },
    });

  } catch (error) {
    console.error("Erro no Download:", error);
    return NextResponse.json({ error: "Erro interno ao gerar PDF" }, { status: 500 });
  }
}