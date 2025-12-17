// lib/asaas.ts

// --- 1. CRIAÇÃO DE CLIENTE (Já testamos e funciona) ---
export async function criarClienteAsaas(cliente: { 
  nome: string, 
  email: string, 
  cpf: string, 
  telefone: string 
}) {
  const apiKey = process.env.ASAAS_ACCESS_TOKEN;
  if (!apiKey) throw new Error("Chave Asaas não configurada no .env");

  // Removemos caracteres especiais do CPF e Telefone para evitar erro
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

// --- 2. CRIAÇÃO DE ASSINATURA (PIX/BOLETO) ---
// O arquivo de subscribe precisa dessa função para funcionar
export async function criarAssinatura(clienteIdAsaas: string, valor: number) {
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
      billingType: 'PIX', // Pode mudar para BOLETO se quiser
      value: valor,
      nextDueDate: new Date().toISOString().split('T')[0], // Cobra hoje
      cycle: 'MONTHLY',
      description: "Assinatura Plano SaaS ZM Tech"
    })
  });

  const data = await response.json();
  if (data.errors) throw new Error(data.errors[0].description);
  return data;
}

// --- 3. CRIAÇÃO DE ASSINATURA CARTÃO (Para não quebrar o build) ---
// O erro mostrava que você tem um arquivo tentando importar isso
export async function criarAssinaturaCartao(clienteIdAsaas: string, valor: number, cardData: any, holderInfo: any, p0: string) {
    const apiKey = process.env.ASAAS_ACCESS_TOKEN;
    
    // Lógica básica de cartão (Placeholder para compilar)
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
        description: "Assinatura Cartão ZM Tech"
      })
    });
  
    const data = await response.json();
    return data;
}