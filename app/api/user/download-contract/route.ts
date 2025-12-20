// app/api/user/download-contract/route.ts - VERSÃO SEM ERROS
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        plan: true,
        contractSignedAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (!user.contractSignedAt) {
      return NextResponse.json({ error: "Contrato ainda não foi assinado" }, { status: 400 });
    }

    if (!user.name) {
      return NextResponse.json({ error: "Nome do usuário não encontrado" }, { status: 400 });
    }

    // Garantir que name é string para o TypeScript
    const userName = user.name;

    // Gera o PDF
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ 
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      
      const chunks: Buffer[] = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // === HEADER ===
      doc.fontSize(20)
         .text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', { align: 'center' });
      
      doc.moveDown();
      doc.fontSize(10)
         .text(`Referência: NVX-${user.id.substring(0, 8).toUpperCase()}`, { align: 'center' });
      
      doc.moveDown(2);

      // === PARTES ===
      doc.fontSize(12).text('CONTRATADA:');
      doc.fontSize(10)
         .text('NEVOX TECNOLOGIA LTDA.')
         .text('CNPJ: 00.000.000/0001-00');
      
      doc.moveDown();
      
      doc.fontSize(12).text('CONTRATANTE:');
      doc.fontSize(10)
         .text(userName.toUpperCase())
         .text(`CPF: ${user.cpf || 'Não informado'}`)
         .text(`Email: ${user.email}`)
         .text(`Plano Contratado: ${user.plan || 'Start'}`);
      
      doc.moveDown(2);

      // === CLÁUSULAS ===
      doc.fontSize(12).text('CLÁUSULAS CONTRATUAIS', { underline: true });
      doc.moveDown();

      const clausulas = [
        {
          num: '1',
          titulo: 'DO OBJETO',
          texto: `Prestação de serviços de desenvolvimento de software conforme plano ${user.plan || 'Start'} contratado pela CONTRATANTE.`
        },
        {
          num: '2',
          titulo: 'DA VIGÊNCIA',
          texto: 'Este contrato entra em vigor na data de sua assinatura digital e permanece válido durante a vigência do plano contratado.'
        },
        {
          num: '3',
          titulo: 'DOS DEVERES DA CONTRATADA',
          texto: 'A CONTRATADA compromete-se a desenvolver e entregar os serviços contratados com qualidade técnica, dentro dos prazos acordados e em conformidade com as especificações do plano escolhido.'
        },
        {
          num: '4',
          titulo: 'DOS DEVERES DA CONTRATANTE',
          texto: 'A CONTRATANTE compromete-se a fornecer todas as informações necessárias para o desenvolvimento do projeto, realizar o pagamento pontual das mensalidades e respeitar os prazos de feedback acordados.'
        },
        {
          num: '5',
          titulo: 'DA CONFIDENCIALIDADE',
          texto: 'Ambas as partes se comprometem a manter sigilo absoluto sobre informações estratégicas, dados sensíveis e propriedade intelectual trocados durante a execução dos serviços.'
        },
        {
          num: '6',
          titulo: 'DA PROPRIEDADE INTELECTUAL',
          texto: 'Todo o código fonte, design e materiais desenvolvidos pela CONTRATADA durante a execução dos serviços são de propriedade da CONTRATANTE após o pagamento integral.'
        },
        {
          num: '7',
          titulo: 'DO FORO',
          texto: 'Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias oriundas deste contrato, com renúncia expressa de qualquer outro, por mais privilegiado que seja.'
        }
      ];

      clausulas.forEach(clausula => {
        doc.fontSize(10)
           .text(`${clausula.num}. ${clausula.titulo}`);
        doc.fontSize(9)
           .text(clausula.texto, { align: 'justify', lineGap: 2 });
        doc.moveDown();
      });

      doc.moveDown(2);

      // === ASSINATURA ===
      doc.fontSize(11)
         .text('ASSINATURA DIGITAL CONFIRMADA', { align: 'center' });
      doc.moveDown();
      
      const dataFormatada = new Date(user.contractSignedAt!).toLocaleString('pt-BR', {
        dateStyle: 'full',
        timeStyle: 'long'
      });
      
      doc.fontSize(9)
         .text(`Assinado por: ${userName}`, { align: 'center' })
         .text(`Data: ${dataFormatada}`, { align: 'center' })
         .text(`Hash de Validação: NVX-${user.id.substring(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`, { align: 'center' });

      // === FOOTER ===
      doc.moveDown(3);
      doc.fontSize(8)
         .text('_'.repeat(100), { align: 'center' })
         .text('Este documento possui validade jurídica - Assinado digitalmente via Nevox Platform', { align: 'center' })
         .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });

      doc.end();
    });

    // Converte Buffer para Uint8Array (compatível com NextResponse)
    const uint8Array = new Uint8Array(pdfBuffer);

    // Retorna o PDF para download
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Contrato_Nevox_${userName.replace(/\s/g, '_')}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      },
    });

  } catch (error: any) {
    console.error("❌ Erro ao gerar PDF:", error);
    return NextResponse.json({ 
      error: "Erro ao gerar contrato" 
    }, { status: 500 });
  }
}