// app/api/user/download-contract/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // --- CRIAÇÃO DO PDF NA MEMÓRIA ---
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
        const doc = new PDFDocument();
        const chunks: any[] = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // CONTEÚDO DO PDF
        doc.fontSize(20).text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`REF: NVX-${user.id.slice(0,8).toUpperCase()}`);
        doc.moveDown();
        doc.text(`CONTRATANTE: ${user.name} - CPF: ${user.cpf || 'N/A'}`);
        doc.text(`CONTRATADA: NEVOX TECNOLOGIA LTDA.`);
        doc.moveDown();
        doc.text(`Pelo presente, fica contratado o plano de software: ${user.plan}.`);
        doc.text(`Data da Assinatura Digital: ${user.contractSignedAt ? new Date(user.contractSignedAt).toLocaleString() : 'Pendente'}`);
        doc.moveDown();
        doc.text('------------------------------------------------');
        doc.text('Assinado Digitalmente via Tevox Platform IP ' + (user.asaasCustomerId || 'Identificado'));
        
        doc.end();
    });

 return new Response(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Contrato_Nevox_${user.name}.pdf`,
      },
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 });
  }
}