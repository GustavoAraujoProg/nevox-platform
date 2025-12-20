// app/api/user/sign-contract/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Função auxiliar para gerar o PDF (Mesma lógica do download)
async function gerarPDFContrato(user: any) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { height } = page.getSize();

    page.drawText('COMPROVANTE DE ASSINATURA DIGITAL', { x: 50, y: height - 100, size: 18, font });
    page.drawText(`Este documento certifica a assinatura do plano ${user.plan}.`, { x: 50, y: height - 150, size: 12, font });
    page.drawText(`Cliente: ${user.name}`, { x: 50, y: height - 180, size: 12, font });
    page.drawText(`CPF: ${user.cpf}`, { x: 50, y: height - 200, size: 12, font });
    page.drawText(`Data e Hora: ${new Date().toLocaleString('pt-BR')}`, { x: 50, y: height - 220, size: 12, font });
    page.drawText('Assinatura Digital Autenticada - Tevox.', { x: 50, y: height - 300, size: 10, font });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes); // Converte para Buffer para o Nodemailer aceitar
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, signatureName } = body;

    // 1. Atualiza no Banco
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        hasSignedContract: true,
        contractSignedAt: new Date(),
      }
    });

    // 2. Envia o E-mail
    try {
        const pdfBuffer = await gerarPDFContrato(updatedUser);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: '"Tevox Legal" <noreply@tevox.com.br>',
            to: updatedUser.email!,
            subject: 'Contrato Assinado - Cópia Digital',
            text: `Olá ${updatedUser.name}, seu contrato foi assinado com sucesso. Segue em anexo a via digital.`,
            attachments: [
                {
                    filename: 'Contrato_Assinado.pdf',
                    content: pdfBuffer
                }
            ]
        });

    } catch (emailError) {
        console.error("Erro ao enviar e-mail:", emailError);
    }

    return NextResponse.json({ success: true, date: updatedUser.contractSignedAt });

  } catch (error) {
    console.error("Erro geral:", error);
    return NextResponse.json({ success: false, error: "Erro ao salvar assinatura." }, { status: 500 });
  }
}