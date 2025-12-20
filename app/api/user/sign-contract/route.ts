// app/api/user/sign-contract/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarContratoPorEmail } from "@/lib/mail"; // <--- Importando seu arquivo de email
import { PDFDocument, StandardFonts } from 'pdf-lib';

// Função que gera o PDF na memória (usando pdf-lib para não dar erro na Vercel)
async function gerarPDFContrato(user: any) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { height } = page.getSize();

    page.drawText('COMPROVANTE DE ASSINATURA DIGITAL', { x: 50, y: height - 100, size: 18, font });
    page.drawText(`Contratante: ${user.name}`, { x: 50, y: height - 150, size: 12, font });
    page.drawText(`CPF: ${user.cpf || 'Não informado'}`, { x: 50, y: height - 170, size: 12, font });
    page.drawText(`Plano: ${user.plan}`, { x: 50, y: height - 190, size: 12, font });
    page.drawText(`Data: ${new Date().toLocaleString('pt-BR')}`, { x: 50, y: height - 230, size: 12, font });
    
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes); 
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    // 1. Atualiza banco
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        hasSignedContract: true,
        contractSignedAt: new Date(),
      }
    });

    // 2. Gera PDF e Envia Email (usando sua lib/mail.ts)
    try {
        const pdfBuffer = await gerarPDFContrato(updatedUser);
        
        // Chama a função do seu arquivo mail.ts
        await enviarContratoPorEmail(
            updatedUser.email!, 
            updatedUser.name!, 
            new Date().toLocaleString('pt-BR'),
            pdfBuffer
        );

    } catch (emailError) {
        console.error("Erro no envio de email (mas contrato salvo):", emailError);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Erro ao salvar" }, { status: 500 });
  }
}