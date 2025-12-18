// lib/asaas.ts

// --- 1. CRIAÇÃO DE CLIENTE ---
export async function criarClienteAsaas(cliente: { 
  nome: string, 
  email: string, 
  cpf: string, 
  telefone: string 
}) {
  const apiKey = process.env.ASAAS_ACCESS_TOKEN;
  if (!apiKey) throw new Error("Chave Asaas não configurada no .env");

  const cpfLimpo = cliente.cpf.replace(/\D/g, '');
  const telLimpo = cliente.telefone.replace(/\D/g, '');

  const response = await fetch(`${process.env.ASAAS_URL}/customers`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      access_token: apiKey
    },
    body: JSON.stringify({
      name: cliente.nome,
      email: cliente.email,
      cpfCnpj: cpfLimpo,
      mobilePhone: telLimpo,
      notificationDisabled: false
    })
  });

  const data = await response.json();
  if (data.errors) throw new Error(data.errors[0].description);
  return data.id;
}

// --- 2. CRIAÇÃO DE ASSINATURA (CORRIGIDA) ---
export async function criarAssinatura(clienteIdAsaas: string, valor: number) {
  const apiKey = process.env.ASAAS_ACCESS_TOKEN;
  
  // 1. Cria a Assinatura
  const response = await fetch(`${process.env.ASAAS_URL}/subscriptions`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      access_token: apiKey || ''
    },
    body: JSON.stringify({
      customer: clienteIdAsaas,
      billingType: 'PIX', // O padrão inicia como PIX, mas o link gerado aceita ambos
      value: valor,
      nextDueDate: new Date().toISOString().split('T')[0], // Cobra hoje
      cycle: 'MONTHLY',
      description: "Assinatura Plano SaaS ZM Tech"
    })
  });

  const subscriptionData = await response.json();
  if (subscriptionData.errors) throw new Error(subscriptionData.errors[0].description);

  // --- O PULO DO GATO ---
  // A assinatura foi criada, mas precisamos do LINK da cobrança específica.
  // Buscamos a primeira cobrança gerada por essa assinatura.
  
  const paymentResponse = await fetch(`${process.env.ASAAS_URL}/payments?subscription=${subscriptionData.id}`, {
     method: 'GET',
     headers: {
        accept: 'application/json',
        access_token: apiKey || ''
     }
  });

  const paymentList = await paymentResponse.json();

  // Se achou a cobrança, retornamos ELA (pois ela tem o invoiceUrl e bankSlipUrl)
  if (paymentList.data && paymentList.data.length > 0) {
      return paymentList.data[0]; 
  }

  // Se por algum milagre não achou, retorna a assinatura mesmo (fallback)
  return subscriptionData;
}

// --- 3. CRIAÇÃO DE ASSINATURA CARTÃO ---
export async function criarAssinaturaCartao(clienteIdAsaas: string, valor: number, cardData: any, holderInfo: any, ip: string) {
    const apiKey = process.env.ASAAS_ACCESS_TOKEN;
    
    const response = await fetch(`${process.env.ASAAS_URL}/subscriptions`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        access_token: apiKey || ''
      },
      body: JSON.stringify({
        customer: clienteIdAsaas,
        billingType: 'CREDIT_CARD',
        value: valor,
        nextDueDate: new Date().toISOString().split('T')[0],
        cycle: 'MONTHLY',
        creditCard: cardData,
        creditCardHolderInfo: holderInfo, // Corrigi o nome do campo para garantir
        remoteIp: ip,
        description: "Assinatura Cartão ZM Tech"
      })
    });
  
    const data = await response.json();
    return data;
}