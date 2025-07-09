// Script para testar todas as funcionalidades do dashboard do colaborador
// Execute no console do navegador (F12) após fazer login

console.log('🧪 Testando funcionalidades do Dashboard do Colaborador');

// Lista de rotas para testar
const rotasTeste = [
  { nome: 'Dashboard Principal', url: '/admin/colaborador' },
  { nome: 'Gerenciar Produtos', url: '/dashboard/produtos' },
  { nome: 'Novo Produto', url: '/dashboard/produtos/novo' },
  { nome: 'Controle de Estoque', url: '/dashboard/estoque' },
  { nome: 'Atualizar Estoque', url: '/dashboard/estoque/atualizar' },
  { nome: 'Gerenciar Pedidos', url: '/dashboard/pedidos' },
  { nome: 'Pedidos Pendentes', url: '/dashboard/pedidos/pendentes' },
  { nome: 'Relatórios de Vendas', url: '/dashboard/relatorios/vendas-basico' },
  { nome: 'Relatórios de Produtos', url: '/dashboard/relatorios/produtos' }
];

// Função para testar uma rota
async function testarRota(rota) {
  try {
    console.log(`🔗 Testando: ${rota.nome} - ${rota.url}`);
    
    // Simular navegação
    window.history.pushState({}, '', rota.url);
    
    // Aguardar um momento para o React Router processar
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verificar se não é página 404
    const conteudo = document.body.innerText.toLowerCase();
    if (conteudo.includes('página não encontrada') || conteudo.includes('page not found')) {
      console.log(`❌ ${rota.nome}: Página não encontrada`);
      return false;
    } else {
      console.log(`✅ ${rota.nome}: Rota funcionando`);
      return true;
    }
  } catch (error) {
    console.log(`❌ ${rota.nome}: Erro - ${error.message}`);
    return false;
  }
}

// Função para testar todas as rotas
async function testarTodasRotas() {
  console.log('\n=== 🚀 INICIANDO TESTE DE TODAS AS ROTAS ===\n');
  
  const resultados = [];
  
  for (const rota of rotasTeste) {
    const sucesso = await testarRota(rota);
    resultados.push({ ...rota, sucesso });
    
    // Pequena pausa entre os testes
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Voltar para o dashboard principal
  window.history.pushState({}, '', '/admin/colaborador');
  
  // Exibir resumo
  console.log('\n=== 📊 RESUMO DOS TESTES ===\n');
  
  const sucessos = resultados.filter(r => r.sucesso).length;
  const total = resultados.length;
  
  console.log(`✅ Sucessos: ${sucessos}/${total}`);
  console.log(`❌ Falhas: ${total - sucessos}/${total}`);
  
  console.log('\n📋 Detalhes:');
  resultados.forEach(resultado => {
    console.log(`${resultado.sucesso ? '✅' : '❌'} ${resultado.nome}: ${resultado.url}`);
  });
  
  if (sucessos === total) {
    console.log('\n🎉 Todos os testes passaram! Todas as rotas estão funcionando.');
  } else {
    console.log('\n⚠️ Algumas rotas apresentaram problemas. Verifique os logs acima.');
  }
  
  return resultados;
}

// Função para testar login e autenticação
async function testarLogin() {
  console.log('\n=== 🔐 TESTANDO AUTENTICAÇÃO ===\n');
  
  const token = localStorage.getItem('token');
  const usuario = localStorage.getItem('usuario');
  
  console.log('🔑 Token presente:', token ? 'Sim' : 'Não');
  console.log('👤 Usuário presente:', usuario ? 'Sim' : 'Não');
  
  if (usuario) {
    try {
      const usuarioObj = JSON.parse(usuario);
      console.log('📋 Tipo de usuário:', usuarioObj.tipo_usuario || usuarioObj.nivel_acesso || usuarioObj.tipo);
      console.log('✅ Autenticação válida para colaborador');
      return true;
    } catch (error) {
      console.log('❌ Erro ao fazer parse do usuário:', error.message);
      return false;
    }
  } else {
    console.log('❌ Usuário não autenticado');
    return false;
  }
}

// Função para fazer login automático se necessário
async function garantirLogin() {
  const autenticado = await testarLogin();
  
  if (!autenticado) {
    console.log('🔄 Fazendo login automático...');
    
    try {
      const response = await fetch('http://localhost:30011/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'colaborador@teste.com',
          senha: '123456'
        })
      });

      const data = await response.json();
      
      if (data.sucesso) {
        localStorage.setItem('token', data.dados.token);
        localStorage.setItem('usuario', JSON.stringify(data.dados.usuario));
        console.log('✅ Login automático realizado com sucesso');
        
        // Recarregar página para aplicar autenticação
        console.log('🔄 Recarregando página em 2 segundos...');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
        return true;
      } else {
        console.log('❌ Falha no login automático:', data.mensagem);
        return false;
      }
    } catch (error) {
      console.log('❌ Erro no login automático:', error.message);
      return false;
    }
  }
  
  return true;
}

// Função principal
async function testeCompleto() {
  console.log('🧪 TESTE COMPLETO DAS FUNCIONALIDADES DO COLABORADOR\n');
  
  // Verificar se está autenticado
  const loginOk = await garantirLogin();
  
  if (!loginOk) {
    console.log('❌ Não foi possível autenticar. Teste cancelado.');
    return;
  }
  
  // Aguardar um momento se houve login automático
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Testar todas as rotas
  const resultados = await testarTodasRotas();
  
  return resultados;
}

// Executar teste automaticamente
testeCompleto();

// Expor funções para uso manual
window.testarRota = testarRota;
window.testarTodasRotas = testarTodasRotas;
window.testarLogin = testarLogin;
window.garantirLogin = garantirLogin;
window.testeCompleto = testeCompleto;

console.log('\n📚 Funções disponíveis para uso manual:');
console.log('- testarRota(rota)');
console.log('- testarTodasRotas()');
console.log('- testarLogin()');
console.log('- garantirLogin()');
console.log('- testeCompleto()');
