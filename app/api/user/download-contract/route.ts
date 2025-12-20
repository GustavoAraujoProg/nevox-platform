// app/api/user/download-contract/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 1. Cria o PDF na memória
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
        const doc = new PDFDocument();
        const chunks: any[] = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        doc.fontSize(20).text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', { align: 'center' });
        doc.moveDown();
        doc.text(`CONTRATANTE: ${user.name}`);
        doc.text(`CPF: ${user.cpf || 'Não informado'}`);
        doc.text(`PLANO: ${user.plan}`);
        doc.text(`DATA: ${user.contractSignedAt ? new Date(user.contractSignedAt).toLocaleString() : 'Hoje'}`);
        doc.moveDown();
        doc.text('Documento assinado digitalmente via Tevox Platform.');
        
        doc.end();
    });

    // 2. Retorna o Arquivo (O segredo está no "as any")
    return new Response(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Contrato_${user.name}.pdf`,
      },
    });

  } catch (error) {
    console.error("Erro no Download:", error);
    return NextResponse.json({ error: "Erro interno ao gerar PDF" }, { status: 500 });
  }
}