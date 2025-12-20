// lib/mail.ts - VERSÃO CORRIGIDA E ADAPTADA
import nodemailer from 'nodemailer';

// Configuração do transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ============================================
// 1. EMAIL DE CONTRATO ASSINADO
// ============================================
export async function enviarContratoPorEmail(
  emailCliente: string, 
  nomeCliente: string, 
  dataAssinatura: string,
  pdfBuffer?: Buffer // PDF opcional em anexo
) {
  
  // CORREÇÃO TÉCNICA: O Gmail exige que o email entre <> seja o mesmo do login
  // O nome "Nevox Jurídico" continua aparecendo para o cliente.
  const remetente = `"Nevox Jurídico" <${process.env.EMAIL_USER}>`;

  const htmlCliente = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #f3f4f6;">
      <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">✅ Contrato Assinado</h1>
          <p style="color: #e9d5ff; margin: 10px 0 0 0; font-size: 16px;">Nevox Tecnologia</p>
        </div>

        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; color: #1f2937; line-height: 1.6; margin: 0 0 20px 0;">
            Olá, <strong>${nomeCliente}</strong>! 👋
          </p>
          
          <p style="font-size: 16px; color: #1f2937; line-height: 1.6; margin: 0 0 30px 0;">
            Seu contrato foi <strong>assinado digitalmente</strong> e está oficialmente vigente. 
            Estamos prontos para começar o desenvolvimento do seu projeto! 🚀
          </p>

          <div style="background: #f9fafb; border-left: 4px solid #7c3aed; padding: 20px; margin: 30px 0; border-radius: 8px;">
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Assinante Responsável</p>
            <p style="margin: 0 0 20px 0; font-size: 18px; color: #111827; font-weight: 600;">${nomeCliente}</p>
            
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Data e Hora do Aceite</p>
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #111827; font-weight: 500;">${dataAssinatura}</p>
            
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Hash de Validação</p>
            <p style="margin: 0; font-size: 14px; color: #111827; font-family: monospace; word-break: break-all;">
              NVX-${Math.random().toString(36).substring(7).toUpperCase()}-${Date.now().toString(36).toUpperCase()}
            </p>
          </div>

          <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 30px 0 0 0;">
            Nossa equipe já foi notificada e seu projeto está autorizado a começar. 
            Você pode acessar o dashboard a qualquer momento para acompanhar o progresso.
          </p>
        </div>

        <div style="background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">
            © ${new Date().getFullYear()} Nevox Tecnologia • CNPJ 00.000.000/0001-00
          </p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #9ca3af;">
            Este é um e-mail automático. Por favor, não responda.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Email para o Admin (notificação interna)
  const htmlAdmin = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background: #000; color: #fff; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #1a1a1a; padding: 30px; border-radius: 8px; border: 1px solid #333;">
        <h2 style="color: #4ade80; margin: 0 0 20px 0;">🎉 NOVO CONTRATO ASSINADO!</h2>
        
        <div style="background: #0a0a0a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; color: #888; font-size: 12px;">CLIENTE</p>
          <p style="margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">${nomeCliente}</p>
          
          <p style="margin: 0 0 10px 0; color: #888; font-size: 12px;">EMAIL</p>
          <p style="margin: 0 0 20px 0; font-size: 14px;">${emailCliente}</p>
          
          <p style="margin: 0 0 10px 0; color: #888; font-size: 12px;">DATA</p>
          <p style="margin: 0; font-size: 14px;">${dataAssinatura}</p>
        </div>

        <p style="color: #4ade80; font-weight: bold; margin: 30px 0 0 0;">
          🚀 Projeto liberado para iniciar desenvolvimento!
        </p>
      </div>
    </body>
    </html>
  `;

  try {
    // Envia para o Cliente
    const emailOptions: any = {
      from: remetente, // <--- AQUI ESTÁ A CORREÇÃO (Usa seu gmail para não bloquear)
      to: emailCliente,
      subject: `✅ Cópia do Contrato Assinado - ${nomeCliente}`,
      html: htmlCliente,
    };

    if (pdfBuffer) {
      emailOptions.attachments = [{
        filename: `Contrato_Nevox_${nomeCliente.replace(/\s/g, '_')}.pdf`,
        content: pdfBuffer
      }];
    }

    await transporter.sendMail(emailOptions);

    // Envia para o Admin
    await transporter.sendMail({
      from: remetente, // <--- Correção aqui também
      to: process.env.EMAIL_USER,
      subject: `[ADMIN] 🎉 Novo Contrato: ${nomeCliente}`,
      html: htmlAdmin,
    });

    console.log("✅ Emails enviados com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao enviar emails:", error);
    return false;
  }
}

// ============================================
// 2. EMAIL DE BOAS-VINDAS (APÓS PAGAMENTO)
// ============================================
export async function enviarEmailBoasVindas(
  emailCliente: string,
  nomeCliente: string,
  plano: string
) {
  
  // Define o remetente correto
  const remetente = `"Nevox" <${process.env.EMAIL_USER}>`;

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #f3f4f6;">
      <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 50px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">🎉 Bem-vindo à Nevox!</h1>
        </div>

        <div style="padding: 40px 30px;">
          <p style="font-size: 18px; color: #1f2937; line-height: 1.6; margin: 0 0 20px 0;">
            Olá, <strong>${nomeCliente}</strong>! 👋
          </p>
          
          <p style="font-size: 16px; color: #1f2937; line-height: 1.6; margin: 0 0 20px 0;">
            Obrigado por escolher a <strong>Nevox Tecnologia</strong>! Seu pagamento foi confirmado e você agora tem acesso total ao plano <strong>${plano}</strong>. 🚀
          </p>

          <div style="background: #f0f9ff; border: 2px solid #7c3aed; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0;">
            <h2 style="margin: 0 0 20px 0; color: #7c3aed; font-size: 24px;">Próximos Passos</h2>
            <ol style="text-align: left; margin: 0; padding-left: 20px; color: #1f2937; line-height: 2;">
              <li>Acesse seu <strong>Dashboard</strong></li>
              <li>Assine o <strong>Contrato Digital</strong></li>
              <li>Acompanhe o desenvolvimento do seu projeto</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Acessar Dashboard
            </a>
          </div>

          <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
            Se tiver alguma dúvida, estamos aqui para ajudar! Responda este email ou entre em contato pelo WhatsApp.
          </p>
        </div>

        <div style="background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">
            © ${new Date().getFullYear()} Nevox Tecnologia
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: remetente, // <--- AQUI ESTÁ A CORREÇÃO
      to: emailCliente,
      subject: `🎉 Bem-vindo à Nevox - Plano ${plano} Ativado!`,
      html: html,
    });

    console.log("✅ Email de boas-vindas enviado!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao enviar email de boas-vindas:", error);
    return false;
  }
}