// lib/asaas.ts

export async function criarClienteAsaas(cliente: { 
  nome: string, 
  email: string, 
  cpf: string, 
  telefone: string 
}) {
  
  // 1. DEBUG: Verifica se a chave existe
  const apiKey = process.env.ASAAS_ACCESS_TOKEN;
  if (!apiKey) {
    console.error("ERRO GRAVE: ASAAS_ACCESS_TOKEN não encontrado no .env");
    throw new Error("Configuração de API inválida (Chave ausente).");
  }

  // Debug: Mostra no terminal se carregou (sem mostrar a chave toda)
  console.log("Conectando ao Asaas com chave:", apiKey.substring(0, 10) + "...");

  const url = `${process.env.ASAAS_URL || 'https://www.asaas.com/api/v3'}/customers`;

  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      access_token: apiKey
    },
    body: JSON.stringify({
      name: cliente.nome,
      email: cliente.email,
      cpfCnpj: cliente.cpf,
      mobilePhone: cliente.telefone,
      notificationDisabled: false // Envia email de cobrança automático
    })
  };

  try {
    const response = await fetch(url, options);
    
    // 2. DEBUG: Lê o texto BRUTO antes de tentar converter pra JSON
    const responseText = await response.text();
    console.log(`Resposta Asaas (${response.status}):`, responseText);

    // Se a resposta for vazia ou der erro
    if (!response.ok) {
      throw new Error(`Erro Asaas ${response.status}: ${responseText}`);
    }

    // Se chegou aqui, tem JSON válido
    const data = JSON.parse(responseText);
    return data.id; // Retorna o ID do cliente criado (ex: cus_00000555)

  } catch (error: any) {
    console.error("Falha na função criarClienteAsaas:", error.message);
    throw error; // Joga o erro pra cima pro Front saber
  }
}