// Script para testar o fluxo completo de atualização de estoque
// simulando o que acontece no frontend

const axios = require('axios').default;

async function testarFluxoCompleto() {
  try {
    console.log('🚀 Testando fluxo completo de atualização de estoque...\n');

    // 1. Verificar estoque atual via API
    console.log('1️⃣ Verificando estoque atual via API...');
    const response1 = await axios.get('http://localhost:30011/api/produtos/1');
    const estoqueInicial = response1.data.dados.produto.estoque;
    console.log(`   Estoque atual: ${estoqueInicial}\n`);

    // 2. Verificar estoque na listagem
    console.log('2️⃣ Verificando estoque na listagem de produtos...');
    const response2 = await axios.get('http://localhost:30011/api/produtos');
    const produtoNaLista = response2.data.dados.find(p => p.id === 1);
    console.log(`   Estoque na listagem: ${produtoNaLista.estoque}\n`);

    // 3. Simular "F5" - buscar novamente com cache busting
    console.log('3️⃣ Simulando F5 - buscando com cache busting...');
    const response3 = await axios.get(`http://localhost:30011/api/produtos?_t=${Date.now()}&_r=${Math.random()}`);
    const produtoAposF5 = response3.data.dados.find(p => p.id === 1);
    console.log(`   Estoque após F5: ${produtoAposF5.estoque}\n`);

    // 4. Verificar se todos os valores são consistentes
    console.log('4️⃣ Verificando consistência...');
    const todosIguais = estoqueInicial === produtoNaLista.estoque && produtoNaLista.estoque === produtoAposF5.estoque;
    
    if (todosIguais) {
      console.log('✅ SUCESSO: Todos os valores são consistentes!');
      console.log(`   Valor em todas as consultas: ${estoqueInicial}`);
    } else {
      console.log('❌ PROBLEMA: Valores inconsistentes encontrados!');
      console.log(`   Busca individual: ${estoqueInicial}`);
      console.log(`   Listagem: ${produtoNaLista.estoque}`);
      console.log(`   Após F5: ${produtoAposF5.estoque}`);
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

// Executar o teste
testarFluxoCompleto();
