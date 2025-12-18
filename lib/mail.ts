// lib/mail.ts
import nodemailer from 'nodemailer';

export async function enviarContratoPorEmail(emailCliente: string, nomeCliente: string, dataAssinatura: string) {
  
  // 1. Configura o carteiro (Gmail)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Vamos configurar isso no .env já já
      pass: process.env.EMAIL_PASS
    }
  });

  // 2. O conteúdo do e-mail (HTML bonito)
  const contratoTexto = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #6d28d9; text-align: center;">CONTRATO ASSINADO COM SUCESSO! 🚀</h2>
      <p>Olá, <strong>${nomeCliente}</strong>.</p>
      <p>Confirmamos o recebimento da sua assinatura digital em <strong>${dataAssinatura}</strong>.</p>
      
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #4b5563;">DADOS DA ASSINATURA</h3>
        <p style="margin: 5px 0;"><strong>Assinado por:</strong> ${nomeCliente}</p>
        <p style="margin: 5px 0;"><strong>Data/Hora:</strong> ${dataAssinatura}</p>
        <p style="margin: 5px 0; color: #059669; font-weight: bold;"><strong>Status:</strong> VÁLIDO E CONFIRMADO ✅</p>
      </div>

      <p>Seu projeto na <strong>Nevox</strong> está oficialmente iniciado! Acompanhe o progresso pelo seu Dashboard.</p>
      
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888; text-align: center;">Equipe Nevox Tecnologia • Enviado automaticamente.</p>
    </div>
  `;

  // 3. Envia!
  try {
    await transporter.sendMail({
      from: '"Nevox Tecnologia" <noreply@nevox.com>',
      to: emailCliente,
      subject: `Contrato Assinado - ${nomeCliente} ✅`,
      html: contratoTexto,
    });
    console.log("📧 E-mail enviado com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao enviar e-mail:", error);
    return false;
  }
}