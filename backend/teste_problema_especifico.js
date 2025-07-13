// Teste específico: simular exatamente o problema relatado pelo usuário
const axios = require('axios').default;
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testarProblemaEspecifico() {
  try {
    console.log('🎯 TESTE ESPECÍFICO: Problema de persistência após F5\n');

    // Conectar ao banco
    const conexao = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME || 'projetofgt'
    });

    console.log('1️⃣ Simulando cenário: produto com estoque inicial "2"...');
    await conexao.execute('UPDATE produtos SET quantidade_estoque = 2 WHERE id = 1');
    
    // Verificar API
    let response = await axios.get('http://localhost:30011/api/produtos/1');
    console.log(`   ✅ API confirma estoque: ${response.data.dados.produto.estoque}`);

    console.log('\n2️⃣ Simulando atualização via frontend para estoque "10"...');
    await conexao.execute('UPDATE produtos SET quantidade_estoque = 10 WHERE id = 1');
    
    // Verificar API imediatamente
    response = await axios.get('http://localhost:30011/api/produtos/1');
    console.log(`   ✅ API após atualização: ${response.data.dados.produto.estoque}`);

    console.log('\n3️⃣ Simulando F5 do usuário (múltiplas requisições com cache busting)...');
    
    for (let i = 1; i <= 5; i++) {
      const timestamp = Date.now() + i;
      const random = Math.random().toString(36).substring(7);
      
      // Simular requisição que o frontend faz
      response = await axios.get(`http://localhost:30011/api/produtos?_t=${timestamp}&_r=${random}&_bust=true`);
      const produto = response.data.dados.find(p => p.id === 1);
      
      console.log(`   F5 #${i}: estoque = ${produto.estoque}`);
      
      // Pequena pausa entre requisições
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n4️⃣ Verificando estado final no banco...');
    const [rows] = await conexao.execute('SELECT quantidade_estoque FROM produtos WHERE id = 1');
    console.log(`   💾 Banco de dados: ${rows[0].quantidade_estoque}`);

    await conexao.end();

    console.log('\n5️⃣ Teste de consistência final...');
    response = await axios.get(`http://localhost:30011/api/produtos/1?_final=${Date.now()}`);
    const estoqueAPI = response.data.dados.produto.estoque;
    
    response = await axios.get(`http://localhost:30011/api/produtos?_final=${Date.now()}`);
    const estoqueLista = response.data.dados.find(p => p.id === 1).estoque;

    console.log(`   🔍 API individual: ${estoqueAPI}`);
    console.log(`   📋 API listagem: ${estoqueLista}`);
    console.log(`   💾 Banco: ${rows[0].quantidade_estoque}`);

    if (estoqueAPI === 10 && estoqueLista === 10 && rows[0].quantidade_estoque === 10) {
      console.log('\n✅ RESULTADO: Tudo funcionando corretamente!');
      console.log('   O valor 10 persiste em todas as fontes.');
      console.log('   Se você ainda vê "2" no frontend, pode ser cache do navegador.');
    } else {
      console.log('\n❌ PROBLEMA CONFIRMADO: Inconsistências detectadas!');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

testarProblemaEspecifico();
