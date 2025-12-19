// lib/asaas.ts (VERSÃO COM REDIRECT)

const ASAAS_API_KEY = process.env.ASAAS_ACCESS_TOKEN!;
const ASAAS_URL = process.env.ASAAS_URL || 'https://sandbox.asaas.com/api/v3';

// IMPORTANTE: Mude isso para sua URL de produção quando for ao ar
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// 1. CRIAR CLIENTE NO ASAAS
export async function criarClienteAsaas(dados: {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
}) {
  try {
    const response = await fetch(`${ASAAS_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY
      },
      body: JSON.stringify({
        name: dados.nome,
        email: dados.email,
        cpfCnpj: dados.cpf.replace(/\D/g, ''),
        mobilePhone: dados.telefone.replace(/\D/g, '')
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.description || 'Erro ao criar cliente');
    }

    const result = await response.json();
    return result.id; // Retorna o ID do cliente criado

  } catch (error) {
    console.error('Erro Asaas:', error);
    throw error;
  }
}

// 2. CRIAR COBRANÇA (PIX/BOLETO) - AGORA COM REDIRECT
export async function criarAssinatura(customerId: string, valor: number) {
  try {
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 3); // Vence em 3 dias

    const response = await fetch(`${ASAAS_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: 'UNDEFINED', // Deixa o cliente escolher (Pix ou Boleto)
        value: valor,
        dueDate: dataVencimento.toISOString().split('T')[0],
        description: 'Assinatura Nevox - Desenvolvimento de Software',
        
        // 🔥 AQUI ESTÁ A MÁGICA: URL DE RETORNO
        callback: {
          successUrl: `${BASE_URL}/pagamento/sucesso`, // ← Página de sucesso
          autoRedirect: true // Redireciona automaticamente após pagar
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.description || 'Erro ao criar cobrança');
    }

    const result = await response.json();
    
    return {
      invoiceUrl: result.invoiceUrl,      // Link da fatura (Pix/Boleto)
      bankSlipUrl: result.bankSlipUrl,    // Link específico do boleto
      id: result.id,
      status: result.status
    };

  } catch (error) {
    console.error('Erro ao criar cobrança:', error);
    throw error;
  }
}

// 3. CRIAR COBRANÇA COM CARTÃO (TRANSPARENTE)
export async function criarAssinaturaCartao(
  customerId: string,
  valor: number,
  cardData: any,
  holderInfo: any,
  remoteIp: string
) {
  try {
    const response = await fetch(`${ASAAS_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: 'CREDIT_CARD',
        value: valor,
        dueDate: new Date().toISOString().split('T')[0],
        description: 'Assinatura Nevox - Desenvolvimento de Software',
        creditCard: {
          holderName: cardData.holderName,
          number: cardData.number,
          expiryMonth: cardData.expiryMonth,
          expiryYear: cardData.expiryYear,
          ccv: cardData.ccv
        },
        creditCardHolderInfo: {
          name: holderInfo.name,
          email: holderInfo.email,
          cpfCnpj: holderInfo.cpfCnpj,
          postalCode: holderInfo.postalCode || '00000-000',
          addressNumber: holderInfo.addressNumber || 'SN',
          phone: holderInfo.phone
        },
        remoteIp: remoteIp
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.description || 'Erro na cobrança do cartão');
    }

    const result = await response.json();
    
    // Cartão de crédito é aprovado na hora se tudo estiver ok
    if (result.status === 'CONFIRMED') {
      return { success: true, status: 'CONFIRMED' };
    } else {
      throw new Error('Cartão recusado ou pagamento pendente');
    }

  } catch (error) {
    console.error('Erro no cartão:', error);
    throw error;
  }
}