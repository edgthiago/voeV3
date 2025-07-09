// Teste completo de login e estatísticas no frontend
console.log('=== TESTE COMPLETO DE LOGIN E ESTATÍSTICAS ===');

const API_BASE_URL = 'http://localhost:3002'; // Frontend URL
const BACKEND_URL = 'http://localhost:30011/api'; // Backend URL

async function testeCompletoFrontend() {
  try {
    console.log('🌐 1. Verificando se o frontend está rodando...');
    
    // Testar se o frontend está acessível
    const frontendResponse = await fetch(API_BASE_URL);
    if (frontendResponse.ok) {
      console.log('✅ Frontend acessível em', API_BASE_URL);
    } else {
      console.log('❌ Frontend não está respondendo');
      return;
    }
    
    console.log('🔧 2. Testando login direto no backend...');
    
    // Fazer login direto no backend
    const loginResponse = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'colaborador@teste.com',
        senha: '123456'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Resposta do login:', loginData);
    
    if (!loginData.sucesso || !loginData.dados.token) {
      console.log('❌ Falha no login');
      return;
    }
    
    const token = loginData.dados.token;
    console.log('✅ Login realizado! Token:', token.substring(0, 30) + '...');
    
    console.log('📊 3. Testando estatísticas com token...');
    
    // Testar estatísticas
    const estatisticasResponse = await fetch(`${BACKEND_URL}/produtos/admin/estatisticas`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const estatisticasData = await estatisticasResponse.json();
    console.log('Resposta das estatísticas:', estatisticasData);
    
    if (estatisticasData.sucesso) {
      console.log('✅ Estatísticas obtidas com sucesso!');
      console.log('📈 Dados reais do banco de dados:');
      console.log('  - Total de produtos:', estatisticasData.dados.total_produtos);
      console.log('  - Produtos em estoque:', estatisticasData.dados.produtos_em_estoque);
      console.log('  - Produtos sem estoque:', estatisticasData.dados.produtos_sem_estoque);
      console.log('  - Valor total do estoque: R$', estatisticasData.dados.valor_total_estoque);
      
      console.log('');
      console.log('🎯 PROBLEMA IDENTIFICADO:');
      console.log('  - O backend tem dados reais');
      console.log('  - A API funciona com autenticação');
      console.log('  - O frontend não está enviando o token corretamente');
      console.log('');
      console.log('💡 SOLUÇÃO:');
      console.log('  1. Verificar se o usuário está fazendo login no frontend');
      console.log('  2. Verificar se o token está sendo salvo no localStorage');
      console.log('  3. Verificar se o serviço de API está usando o token');
      
    } else {
      console.log('❌ Erro ao obter estatísticas:', estatisticasData);
    }
    
    console.log('');
    console.log('🔍 4. Verificando estrutura dos dados retornados...');
    if (estatisticasData.sucesso) {
      const dados = estatisticasData.dados;
      console.log('Chaves disponíveis:', Object.keys(dados));
      
      console.log('');
      console.log('📋 Mapeamento necessário para o frontend:');
      console.log('  produtosCadastrados <-- total_produtos (' + dados.total_produtos + ')');
      console.log('  produtosSemEstoque <-- produtos_sem_estoque (' + dados.produtos_sem_estoque + ')');
      console.log('  pedidosPendentes <-- (não disponível, usar fallback)');
      console.log('  vendasHoje <-- (não disponível, usar fallback)');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Executar teste
testeCompletoFrontend();
