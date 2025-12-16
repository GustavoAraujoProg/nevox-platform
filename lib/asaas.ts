const ASAAS_API_KEY = process.env.ASAAS_API_KEY; 
const URL_BASE = "https://www.asaas.com/api/v3"; 

// Função para criar o cliente
export async function criarClienteAsaas(cliente: { nome: string; email: string; cpf: string; telefone: string }) {
  const response = await fetch(`${URL_BASE}/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "access_token": ASAAS_API_KEY || "",
    },
    body: JSON.stringify({
      name: cliente.nome,
      email: cliente.email,
      cpfCnpj: cliente.cpf,
      mobilePhone: cliente.telefone,
      notificationDisabled: false,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.errors?.[0]?.description || "Erro ao criar cliente");
  return data.id; // Retorna o ID do cliente (ex: cus_12345)
}

// Função para criar a assinatura no cartão
export async function criarAssinaturaCartao(
  clienteId: string, 
  valor: number, 
  cartao: any, 
  titular: any, 
  ip: string
) {
  const response = await fetch(`${URL_BASE}/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "access_token": ASAAS_API_KEY || "",
    },
    body: JSON.stringify({
      customer: clienteId,
      billingType: "CREDIT_CARD",
      value: valor,
      nextDueDate: new Date().toISOString().split('T')[0], // Cobra hoje
      cycle: "MONTHLY",
      description: "Assinatura Site Vitrine",
      remoteIp: ip,
      creditCard: {
        holderName: cartao.nome,
        number: cartao.numero,
        expiryMonth: cartao.mes,
        expiryYear: cartao.ano,
        ccv: cartao.cvv,
      },
      creditCardHolderInfo: {
        name: titular.nome,
        email: titular.email,
        cpfCnpj: titular.cpf,
        postalCode: titular.cep,
        addressNumber: titular.numero,
        mobilePhone: titular.telefone,
      },
    }),
  });

  const data = await response.json();
  return {
    sucesso: response.ok,
    dados: data,
    erro: !response.ok ? (data.errors?.[0]?.description || "Erro desconhecido") : null
  };
}