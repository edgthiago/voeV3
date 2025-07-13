// Teste completo: simular atualização de estoque e verificar persistência
const axios = require('axios').default;

async function testarAtualizacaoCompleta() {
  try {
    console.log('🔄 TESTE COMPLETO DE ATUALIZAÇÃO DE ESTOQUE\n');

    // Etapa 1: Verificar estoque inicial
    console.log('1️⃣ Verificando estoque inicial...');
    let response = await axios.get('http://localhost:30011/api/produtos/1');
    const estoqueInicial = response.data.dados.produto.estoque;
    console.log(`   Estoque inicial: ${estoqueInicial}\n`);

    // Etapa 2: Simular atualização direta no banco (como se fosse via frontend)
    console.log('2️⃣ Simulando atualização via banco (como seria no frontend)...');
    const mysql = require('mysql2/promise');
    require('dotenv').config();
    
    const conexao = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME || 'projetofgt'
    });

    const novoEstoque = estoqueInicial + 3; // Incrementar por 3
    await conexao.execute('UPDATE produtos SET quantidade_estoque = ? WHERE id = 1', [novoEstoque]);
    console.log(`   Estoque atualizado no banco para: ${novoEstoque}`);
    await conexao.end();

    // Etapa 3: Verificar se a API retorna o novo valor imediatamente
    console.log('\n3️⃣ Verificando se API retorna novo valor imediatamente...');
    response = await axios.get('http://localhost:30011/api/produtos/1');
    const estoqueDepoisUpdate = response.data.dados.produto.estoque;
    console.log(`   Estoque via API individual: ${estoqueDepoisUpdate}`);

    // Etapa 4: Verificar na listagem
    console.log('\n4️⃣ Verificando na listagem de produtos...');
    response = await axios.get('http://localhost:30011/api/produtos');
    const produtoNaLista = response.data.dados.find(p => p.id === 1);
    console.log(`   Estoque na listagem: ${produtoNaLista.estoque}`);

    // Etapa 5: Simular F5 com cache busting (como o frontend faz)
    console.log('\n5️⃣ Simulando F5 com cache busting...');
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    response = await axios.get(`http://localhost:30011/api/produtos?_t=${timestamp}&_r=${random}&_bust=true`);
    const produtoAposF5 = response.data.dados.find(p => p.id === 1);
    console.log(`   Estoque após F5: ${produtoAposF5.estoque}`);

    // Etapa 6: Verificar novamente após pequena pausa
    console.log('\n6️⃣ Verificando após pausa de 2 segundos...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    response = await axios.get(`http://localhost:30011/api/produtos?_t=${Date.now()}`);
    const produtoAposPausa = response.data.dados.find(p => p.id === 1);
    console.log(`   Estoque após pausa: ${produtoAposPausa.estoque}`);

    // Análise final
    console.log('\n📊 ANÁLISE FINAL:');
    console.log(`   Inicial: ${estoqueInicial}`);
    console.log(`   Esperado: ${novoEstoque}`);
    console.log(`   API individual: ${estoqueDepoisUpdate}`);
    console.log(`   Listagem: ${produtoNaLista.estoque}`);
    console.log(`   Após F5: ${produtoAposF5.estoque}`);
    console.log(`   Após pausa: ${produtoAposPausa.estoque}`);

    const todosIguaisAoEsperado = [estoqueDepoisUpdate, produtoNaLista.estoque, produtoAposF5.estoque, produtoAposPausa.estoque]
      .every(valor => valor === novoEstoque);

    if (todosIguaisAoEsperado) {
      console.log('\n✅ SUCESSO: Todas as consultas retornam o valor atualizado!');
    } else {
      console.log('\n❌ PROBLEMA: Inconsistências detectadas!');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

testarAtualizacaoCompleta();
