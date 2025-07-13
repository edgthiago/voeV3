// Teste de conectividade Frontend -> Backend
// Execute no console do navegador: http://localhost:5174

console.log('🔍 Testando conectividade Frontend -> Backend...');

// Função para testar a API
async function testarAPI() {
  const baseURL = 'http://localhost:3002/api';
  
  try {
    console.log('1️⃣ Testando Health Check...');
    const health = await fetch(`${baseURL}/health`);
    const healthData = await health.json();
    console.log('✅ Health:', healthData);
    
    console.log('\n2️⃣ Testando API de Produtos...');
    const produtos = await fetch(`${baseURL}/produtos`);
    const produtosData = await produtos.json();
    console.log('✅ Produtos:', produtosData.dados?.length || 0, 'produtos encontrados');
    
    console.log('\n3️⃣ Testando produto específico...');
    const produto1 = await fetch(`${baseURL}/produtos/1`);
    const produto1Data = await produto1.json();
    console.log('✅ Produto ID 1:', produto1Data.dados?.produto?.nome);
    console.log('📦 Estoque:', produto1Data.dados?.produto?.estoque || produto1Data.dados?.produto?.quantidade_estoque);
    
    console.log('\n🎉 SUCESSO: Frontend consegue acessar o Backend!');
    console.log('🔗 Base URL configurada:', baseURL);
    
  } catch (error) {
    console.error('❌ ERRO na conectividade:', error);
    console.log('🔧 Verifique se:');
    console.log('   - Backend está rodando na porta 3002');
    console.log('   - Frontend está configurado para usar porta 3002');
    console.log('   - Não há problemas de CORS');
  }
}

// Executar teste
testarAPI();

// Teste adicional: verificar variáveis de ambiente do Vite
console.log('\n📋 Configurações do Frontend:');
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('Mode:', import.meta.env.MODE);
console.log('DEV:', import.meta.env.DEV);
