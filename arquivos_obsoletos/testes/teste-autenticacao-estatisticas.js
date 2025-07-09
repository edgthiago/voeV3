// Teste de autenticação e estatísticas
console.log('=== TESTE DE AUTENTICAÇÃO E ESTATÍSTICAS ===');

const API_BASE_URL = 'http://localhost:30011/api';

async function testarAutenticacao() {
  try {
    console.log('1. Testando login...');
    
    // Fazer login com um usuário colaborador
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'colaborador@teste.com', // Usuário padrão
        senha: '123456'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Resposta do login:', loginData);
    
    if (!loginData.sucesso || !loginData.dados.token) {
      console.log('❌ Login falhou, tentando com admin@teste.com...');
      
      const adminLoginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@teste.com',
          senha: '123456'
        })
      });
      
      const adminLoginData = await adminLoginResponse.json();
      console.log('Resposta do login admin:', adminLoginData);
      
      if (!adminLoginData.sucesso || !adminLoginData.dados.token) {
        throw new Error('Não foi possível fazer login');
      }
      
      const token = adminLoginData.dados.token;
      console.log('✅ Login realizado com sucesso! Token:', token.substring(0, 20) + '...');
      
      // Testar estatísticas com token
      console.log('2. Testando rota de estatísticas...');
      const estatisticasResponse = await fetch(`${API_BASE_URL}/produtos/admin/estatisticas`, {
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
        console.log('📊 Dados:', estatisticasData.dados);
      } else {
        console.log('❌ Erro ao obter estatísticas:', estatisticasData);
      }
      
      return token;
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Executar teste
testarAutenticacao();
