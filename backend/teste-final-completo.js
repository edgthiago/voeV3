// Teste Final Completo - Validação 100% do Sistema
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Credenciais de teste para cada nível
const USUARIOS_TESTE = [
  { nivel: 'USUÁRIO', email: 'demo@lojafgt.com', senha: 'demo123', id: 23 },
  { nivel: 'COLABORADOR', email: 'colaborador@teste.com', senha: '123456', id: 18 },
  { nivel: 'SUPERVISOR', email: 'supervisor@teste.com', senha: '123456', id: 17 },
  { nivel: 'DIRETOR', email: 'thiagoeucosta@gmail.com', senha: '123456', id: 75 }
];

async function testeCompleto() {
  console.log('🚀 INICIANDO TESTE FINAL COMPLETO - VALIDAÇÃO 100%\n');
  
  let todosTestesOK = true;
  
  for (const usuario of USUARIOS_TESTE) {
    console.log(`\n🧪 TESTANDO NÍVEL: ${usuario.nivel}`);
    console.log(`📧 Email: ${usuario.email}`);
    
    try {
      // 1. Teste de Login
      console.log('  🔐 Testando login...');
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: usuario.email,
        senha: usuario.senha
      });
      
      if (!loginResponse.data.sucesso) {
        console.log(`  ❌ FALHA NO LOGIN: ${loginResponse.data.mensagem}`);
        todosTestesOK = false;
        continue;
      }
      
      const token = loginResponse.data.dados.token;
      const dadosUsuario = loginResponse.data.dados.usuario;
      
      console.log(`  ✅ Login OK - ID: ${dadosUsuario.id}, Tipo: ${dadosUsuario.tipo_usuario}`);
      
      // 2. Teste de Verificação de Token
      console.log('  🔍 Testando verificação de token...');
      const tokenResponse = await axios.get(`${BASE_URL}/api/auth/verificar-token`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!tokenResponse.data.sucesso) {
        console.log(`  ❌ FALHA NA VERIFICAÇÃO DE TOKEN`);
        todosTestesOK = false;
        continue;
      }
      
      console.log(`  ✅ Token válido`);
      
      // 3. Teste de Acesso ao Perfil
      console.log('  👤 Testando acesso ao perfil...');
      const perfilResponse = await axios.get(`${BASE_URL}/api/auth/perfil`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!perfilResponse.data.sucesso) {
        console.log(`  ❌ FALHA NO ACESSO AO PERFIL`);
        todosTestesOK = false;
        continue;
      }
      
      console.log(`  ✅ Perfil acessado - Nome: ${perfilResponse.data.dados.nome}`);
      
      // 4. Teste de Permissões Administrativas (apenas para diretor)
      if (usuario.nivel === 'DIRETOR') {
        console.log('  🛡️ Testando acesso administrativo...');
        try {
          const adminResponse = await axios.get(`${BASE_URL}/api/admin/usuarios`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (adminResponse.data.sucesso) {
            console.log(`  ✅ Acesso administrativo OK - ${adminResponse.data.dados.length} usuários listados`);
          } else {
            console.log(`  ❌ FALHA NO ACESSO ADMINISTRATIVO`);
            todosTestesOK = false;
          }
        } catch (error) {
          console.log(`  ❌ ERRO NO ACESSO ADMINISTRATIVO: ${error.response?.data?.mensagem || error.message}`);
          todosTestesOK = false;
        }
      } else {
        // Testar que NÃO deve ter acesso administrativo
        console.log('  🚫 Testando restrição de acesso administrativo...');
        try {
          const adminResponse = await axios.get(`${BASE_URL}/api/admin/usuarios`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (!adminResponse.data.sucesso) {
            console.log(`  ✅ Acesso negado corretamente - ${adminResponse.data.erro}`);
          } else {
            console.log(`  ❌ FALHA NA SEGURANÇA: Usuário teve acesso quando não deveria`);
            todosTestesOK = false;
          }
        } catch (error) {
          if (error.response?.data?.codigo === 'ACESSO_NEGADO') {
            console.log(`  ✅ Acesso negado corretamente`);
          } else {
            console.log(`  ❌ ERRO INESPERADO: ${error.message}`);
            todosTestesOK = false;
          }
        }
      }
      
    } catch (error) {
      console.log(`  ❌ ERRO NO TESTE: ${error.message}`);
      todosTestesOK = false;
    }
  }
  
  // 5. Teste de Endpoints Públicos
  console.log('\n🌐 TESTANDO ENDPOINTS PÚBLICOS...');
  
  try {
    // Health Check
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    if (healthResponse.data.sucesso) {
      console.log('  ✅ Health check OK');
    } else {
      console.log('  ❌ FALHA NO HEALTH CHECK');
      todosTestesOK = false;
    }
    
    // Lista de produtos
    const produtosResponse = await axios.get(`${BASE_URL}/api/produtos`);
    if (produtosResponse.data.sucesso) {
      console.log(`  ✅ Listagem de produtos OK - ${produtosResponse.data.dados.length} produtos`);
    } else {
      console.log('  ❌ FALHA NA LISTAGEM DE PRODUTOS');
      todosTestesOK = false;
    }
    
    // Comentários de produto
    const comentariosResponse = await axios.get(`${BASE_URL}/api/produtos/1/comentarios`);
    if (comentariosResponse.data.sucesso) {
      console.log(`  ✅ Comentários OK - ${comentariosResponse.data.dados.length} comentários`);
    } else {
      console.log('  ❌ FALHA NOS COMENTÁRIOS');
      todosTestesOK = false;
    }
    
  } catch (error) {
    console.log(`  ❌ ERRO NOS ENDPOINTS PÚBLICOS: ${error.message}`);
    todosTestesOK = false;
  }
  
  // Resultado Final
  console.log('\n' + '='.repeat(80));
  if (todosTestesOK) {
    console.log('🎉 TODOS OS TESTES PASSARAM! SISTEMA 100% FUNCIONAL!');
    console.log('✅ Autenticação: OK');
    console.log('✅ Hierarquia de permissões: OK');
    console.log('✅ Segurança: OK');
    console.log('✅ Endpoints públicos: OK');
    console.log('✅ Endpoints protegidos: OK');
    console.log('\n🚀 SISTEMA APROVADO PARA PRODUÇÃO!');
  } else {
    console.log('❌ ALGUNS TESTES FALHARAM! VERIFICAR PROBLEMAS ACIMA.');
  }
  console.log('='.repeat(80));
  
  return todosTestesOK;
}

// Executar teste
testeCompleto()
  .then((sucesso) => {
    process.exit(sucesso ? 0 : 1);
  })
  .catch((erro) => {
    console.error('❌ ERRO FATAL NO TESTE:', erro.message);
    process.exit(1);
  });
