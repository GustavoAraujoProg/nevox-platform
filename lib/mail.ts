// lib/mail.ts
import nodemailer from 'nodemailer';

export async function enviarContratoPorEmail(emailCliente: string, nomeCliente: string, dataAssinatura: string) {
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // 1. EMAIL PARA O CLIENTE (Bonito e Formal)
  const htmlCliente = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; background: #fff; padding: 40px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #6d28d9; text-align: center; margin-bottom: 30px;">CONTRATO DIGITAL ASSINADO</h2>
      <p>Olá, <strong>${nomeCliente}</strong>.</p>
      <p>Este é o comprovante oficial de que seu contrato com a <strong>Nevox Tecnologia</strong> foi assinado digitalmente e está vigente.</p>
      
      <div style="background-color: #f8fafc; border-left: 4px solid #6d28d9; padding: 20px; margin: 30px 0;">
        <p style="margin: 5px 0; font-size: 14px; color: #64748b;">ASSINANTE RESPONSÁVEL</p>
        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #0f172a;">${nomeCliente}</p>
        <br/>
        <p style="margin: 5px 0; font-size: 14px; color: #64748b;">DATA E HORA DO ACEITE</p>
        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #0f172a;">${dataAssinatura}</p>
        <br/>
        <p style="margin: 5px 0; font-size: 14px; color: #64748b;">HASH DE VALIDAÇÃO</p>
        <p style="margin: 0; font-size: 14px; font-family: monospace; color: #0f172a;">NVX-${Math.random().toString(36).substring(7).toUpperCase()}-SECURE</p>
      </div>

      <p style="line-height: 1.6;">Nossa equipe já foi notificada e o desenvolvimento do seu projeto está autorizado a começar.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 12px; color: #999; text-align: center;">Nevox Tecnologia • CNPJ 00.000.000/0001-00</p>
    </div>
  `;

  // 2. EMAIL PARA O ADMIN (Você recebe isso na hora!)
  const htmlAdmin = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background: #000; color: #fff;">
      <h2 style="color: #4ade80;">🤑 NOVA VENDA/CONTRATO ASSINADO!</h2>
      <p>O cliente <strong>${nomeCliente}</strong> acabou de assinar o contrato no dashboard.</p>
      <ul>
        <li><strong>Email:</strong> ${emailCliente}</li>
        <li><strong>Data:</strong> ${dataAssinatura}</li>
      </ul>
      <p>🚀 Pode liberar a equipe para começar!</p>
    </div>
  `;

  try {
    // Envia para o Cliente
    await transporter.sendMail({
      from: '"Nevox Jurídico" <noreply@nevox.com>',
      to: emailCliente,
      subject: `Cópia do Contrato Assinado - ${nomeCliente}`,
      html: htmlCliente,
    });

    // Envia para o Admin (Você)
    await transporter.sendMail({
      from: '"Sistema Nevox" <sistema@nevox.com>',
      to: process.env.EMAIL_USER, // Manda para o seu próprio email configurado
      subject: `[ADMIN] Novo Contrato Assinado: ${nomeCliente}`,
      html: htmlAdmin,
    });

    console.log("📧 Emails disparados para Cliente e Admin!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao enviar e-mails:", error);
    return false;
  }
}