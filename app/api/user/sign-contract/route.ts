// app/api/user/sign-contract/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";

// Função auxiliar para gerar o PDF (igual ao download)
async function gerarPDFContrato(user: any) {
    return new Promise<Buffer>((resolve, reject) => {
        const doc = new PDFDocument();
        const chunks: any[] = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        
        doc.fontSize(20).text('CONTRATO ASSINADO', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Este documento certifica a assinatura do plano ${user.plan}.`);
        doc.text(`Cliente: ${user.name}`);
        doc.text(`CPF: ${user.cpf}`);
        doc.text(`Data: ${new Date().toLocaleString()}`);
        doc.moveDown();
        doc.text('Assinatura Digital Confirmada.', { align: 'center' });
        doc.end();
    });
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

    // 2. Tenta Enviar o E-mail (Bloco Try/Catch separado para não travar a tela se o email falhar)
    try {
        const pdfBuffer = await gerarPDFContrato(updatedUser);

        // CONFIGURAÇÃO DO E-MAIL (CONFIGURE AQUI)
        const transporter = nodemailer.createTransport({
            service: 'gmail', // ou 'smtp.hostinger.com', etc.
            auth: {
                user: process.env.EMAIL_USER, // Coloque no seu .env
                pass: process.env.EMAIL_PASS  // Coloque no seu .env (Senha de App do Gmail)
            }
        });

        await transporter.sendMail({
            from: '"Equipe Tevox" <seuemail@gmail.com>',
            to: updatedUser.email!, // Manda para o email do usuário
            subject: 'Cópia do seu Contrato Assinado - Tevox',
            text: `Olá ${updatedUser.name}, parabéns! Seu contrato foi assinado com sucesso. Segue cópia em anexo.`,
            attachments: [
                {
                    filename: 'Contrato_Tevox.pdf',
                    content: pdfBuffer
                }
            ]
        });
        console.log("E-mail de contrato enviado com sucesso!");

    } catch (emailError) {
        console.error("Erro ao enviar e-mail (mas o contrato foi salvo):", emailError);
        // Não retornamos erro aqui para não assustar o usuário, já que ele assinou no banco.
    }

    return NextResponse.json({ success: true, date: updatedUser.contractSignedAt });

  } catch (error) {
    return NextResponse.json({ success: false, error: "Erro ao salvar assinatura." }, { status: 500 });
  }
}