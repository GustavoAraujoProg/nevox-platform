import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import prisma from "@/lib/prisma";

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(request: Request) {
    try {
        // O Mercado Pago envia a notificação aqui
        const body = await request.json();
        
        // Vamos verificar se é uma notificação de pagamento
        if (body.type === "payment" || body.topic === "payment" || body?.data?.id) {
            
            const paymentId = body?.data?.id || body?.id;
            const payment = new Payment(client);
            
            // Consultamos o status atualizado no Mercado Pago
            const paymentData = await payment.get({ id: paymentId });

            if (paymentData.status === 'approved') {
                const userEmail = paymentData.external_reference; // Pegamos o email que "assinamos"

                console.log(`💰 Pagamento aprovado para: ${userEmail}`);

                // Atualiza o Status do Projeto no Banco de Dados
                if (userEmail) {
                    const user = await prisma.user.findUnique({ where: { email: userEmail }});
                    
                    if (user) {
                        await prisma.project.updateMany({
                            where: { userId: user.id },
                            data: { 
                                status: 'em_desenvolvimento', // <--- MUDA O STATUS SOZINHO!
                                plano: 'Pago (Growth)'
                            }
                        });
                        console.log("✅ Projeto atualizado no banco!");
                    }
                }
            }
        }
        
        return NextResponse.json({ received: true });

    } catch (error) {
        console.error("Erro no Webhook:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}