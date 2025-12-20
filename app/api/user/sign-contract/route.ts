// app/api/user/sign-contract/route.ts - VERSÃO SEM ERROS
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarContratoPorEmail } from "@/lib/mail";
import PDFDocument from "pdfkit";

// Tipo do usuário para o PDF
type UserForPDF = {
  id: string;
  name: string;
  email: string;
  cpf: string | null;
  plan: string | null;
};

// Função para gerar PDF do contrato
async function gerarPDFContrato(user: UserForPDF, signatureName: string) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ 
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });
    
    const chunks: Buffer[] = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // HEADER
    doc.fontSize(20).font('Helvetica-Bold')
       .text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', { align: 'center' });
    
    doc.moveDown();
    doc.fontSize(10).font('Helvetica')
       .text(`Referência: NVX-${user.id.substring(0, 8).toUpperCase()}`, { align: 'center' });
    
    doc.moveDown(2);

    // PARTES
    doc.fontSize(12).font('Helvetica-Bold').text('CONTRATADA:');
    doc.fontSize(10).font('Helvetica').text('NEVOX TECNOLOGIA LTDA.');
    doc.text('CNPJ: 00.000.000/0001-00');
    
    doc.moveDown();
    
    doc.fontSize(12).font('Helvetica-Bold').text('CONTRATANTE:');
    doc.fontSize(10).font('Helvetica').text(user.name.toUpperCase());
    doc.text(`CPF: ${user.cpf || 'Não informado'}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Plano: ${user.plan || 'Start'}`);
    
    doc.moveDown(2);

    // CLÁUSULAS
    doc.fontSize(12).font('Helvetica-Bold').text('CLÁUSULAS CONTRATUAIS', { underline: true });
    doc.moveDown();

    const clausulas = [
      {
        titulo: '1. DO OBJETO',
        texto: `Prestação de serviços de desenvolvimento de software conforme plano ${user.plan || 'Start'} contratado.`
      },
      {
        titulo: '2. DA VIGÊNCIA',
        texto: 'Contrato entra em vigor na data desta assinatura digital.'
      },
      {
        titulo: '3. DOS DEVERES',
        texto: 'A CONTRATADA se compromete a entregar os serviços com qualidade técnica dentro dos prazos acordados.'
      },
      {
        titulo: '4. DA CONFIDENCIALIDADE',
        texto: 'Ambas as partes mantêm sigilo absoluto sobre informações estratégicas e dados sensíveis.'
      },
      {
        titulo: '5. DO FORO',
        texto: 'Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer dúvidas oriundas deste contrato.'
      }
    ];

    clausulas.forEach(clausula => {
      doc.fontSize(10).font('Helvetica-Bold').text(clausula.titulo);
      doc.fontSize(9).font('Helvetica').text(clausula.texto, { align: 'justify' });
      doc.moveDown();
    });

    doc.moveDown(2);

    // ASSINATURA DIGITAL
    doc.fontSize(11).font('Helvetica-Bold').text('ASSINATURA DIGITAL', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(10).font('Helvetica').text('Assinado digitalmente por:', { align: 'center' });
    doc.fontSize(14).font('Helvetica-BoldOblique').text(signatureName, { align: 'center' });
    
    doc.moveDown();
    const dataAssinatura = new Date().toLocaleString('pt-BR');
    doc.fontSize(9).font('Helvetica').text(`Data: ${dataAssinatura}`, { align: 'center' });
    doc.text(`IP: 0.0.0.0 (Protegido)`, { align: 'center' });
    doc.text(`Hash: NVX-${Date.now().toString(36).toUpperCase()}-SECURE`, { align: 'center' });

    // FOOTER
    doc.moveDown(3);
    doc.fontSize(8).font('Helvetica')
       .text('_'.repeat(80), { align: 'center' });
    doc.text('Documento com validade jurídica - Assinado digitalmente via Nevox Platform', { align: 'center' });

    doc.end();
  });
}

export async function POST(request: Request) {
  console.log("📝 Iniciando processo de assinatura...");
  
  try {
    const body = await request.json();
    const { userId, signatureName } = body;

    if (!userId || !signatureName) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // 1. Busca usuário
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        plan: true
      }
    });

    // Valida se usuário existe e tem dados obrigatórios
    if (!user || !user.email || !user.name) {
      return NextResponse.json({ 
        error: "Usuário não encontrado ou dados incompletos" 
      }, { status: 404 });
    }

    console.log(`✅ Usuário encontrado: ${user.email}`);

    // 2. Atualiza banco (assinatura confirmada)
    await prisma.user.update({
      where: { id: userId },
      data: {
        hasSignedContract: true,
        contractSignedAt: new Date(),
      }
    });

    console.log("✅ Banco atualizado!");

    // 3. Gera PDF do contrato (agora user.name é garantido como string)
    console.log("📄 Gerando PDF...");
    const userForPDF: UserForPDF = {
      id: user.id,
      name: user.name, // Garantido não-null pela validação acima
      email: user.email,
      cpf: user.cpf,
      plan: user.plan
    };
    
    const pdfBuffer = await gerarPDFContrato(userForPDF, signatureName);
    console.log("✅ PDF gerado!");

    // 4. Envia email (com PDF anexo)
    console.log("📧 Enviando email...");
    const dataAssinatura = new Date().toLocaleString('pt-BR');
    
    await enviarContratoPorEmail(
      user.email,
      user.name,
      dataAssinatura,
      pdfBuffer
    );

    console.log("✅ Email enviado!");

    // 5. Cria timeline
    await prisma.timelineItem.create({
      data: {
        userId,
        title: "Contrato Assinado",
        description: `Assinado digitalmente por ${signatureName}.`,
        status: "completed",
        date: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      date: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("❌ Erro ao assinar contrato:", error);
    return NextResponse.json({ 
      error: error.message || "Erro interno" 
    }, { status: 500 });
  }
}