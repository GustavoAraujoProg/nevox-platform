import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, nome, valor } = body;

    const payment = new Payment(client);

    const result = await payment.create({
      body: {
        transaction_amount: Number(valor),
        description: 'Desenvolvimento de Projeto - Nevox',
        payment_method_id: 'pix',
        external_reference: email, // <--- O SEGREDO ESTÁ AQUI (Identifica o usuário)
        payer: {
          email: email,
          first_name: nome,
        },
        date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString() 
      }
    });

    return NextResponse.json({
      status: 'success',
      qr_code: result.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
      ticket_url: result.point_of_interaction?.transaction_data?.ticket_url,
      id: result.id
    });

  } catch (error: any) {
    console.error("Erro no Pix:", error);
    return NextResponse.json({ error: 'Erro ao gerar Pix' }, { status: 500 });
  }
}