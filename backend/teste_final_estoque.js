const mysql = require('mysql2/promise');
const axios = require('axios').default;
require('dotenv').config();

async function testeCompletoEstoque() {
  console.log('🎯 TESTE FINAL: Verificação completa do problema de estoque\n');
  
  try {
    // Conectar ao banco
    const conexao = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME || 'projetofgt'
    });

    console.log('1️⃣ Estado atual do estoque no banco...');
    let [rows] = await conexao.execute('SELECT id, nome, quantidade_estoque FROM produtos WHERE id = 1');
    console.log(`   📦 Produto ID 1: ${rows[0].nome} - Estoque: ${rows[0].quantidade_estoque}`);

    console.log('\n2️⃣ Atualizando estoque para 25 via banco...');
    await conexao.execute('UPDATE produtos SET quantidade_estoque = 25 WHERE id = 1');
    [rows] = await conexao.execute('SELECT quantidade_estoque FROM produtos WHERE id = 1');
    console.log(`   ✅ Novo estoque no banco: ${rows[0].quantidade_estoque}`);

    console.log('\n3️⃣ Verificando API individual...');
    try {
      const response = await axios.get('http://localhost:3002/api/produtos/1', {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (response.data && response.data.dados && response.data.dados.produto) {
        console.log(`   📡 API individual retorna: ${response.data.dados.produto.quantidade_estoque || response.data.dados.produto.estoque}`);
      } else {
        console.log('   ⚠️ Estrutura de resposta inesperada:', response.data);
      }
    } catch (error) {
      console.log(`   ❌ Erro na API individual: ${error.message}`);
    }

    console.log('\n4️⃣ Verificando API de listagem...');
    try {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      
      const response = await axios.get(`http://localhost:3002/api/produtos?_t=${timestamp}&_r=${random}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (response.data && response.data.dados) {
        const produto = response.data.dados.find(p => p.id === 1);
        if (produto) {
          console.log(`   📋 API listagem retorna: ${produto.quantidade_estoque || produto.estoque}`);
        } else {
          console.log('   ⚠️ Produto ID 1 não encontrado na listagem');
        }
      } else {
        console.log('   ⚠️ Estrutura de resposta inesperada:', response.data);
      }
    } catch (error) {
      console.log(`   ❌ Erro na API de listagem: ${error.message}`);
    }

    console.log('\n5️⃣ Simulando múltiplas requisições (F5)...');
    for (let i = 1; i <= 3; i++) {
      try {
        const timestamp = Date.now() + i;
        const response = await axios.get(`http://localhost:3002/api/produtos/1?_t=${timestamp}`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (response.data && response.data.dados && response.data.dados.produto) {
          const estoque = response.data.dados.produto.quantidade_estoque || response.data.dados.produto.estoque;
          console.log(`   F5 #${i}: estoque = ${estoque}`);
        }
      } catch (error) {
        console.log(`   F5 #${i}: erro = ${error.message}`);
      }
      
      // Pequena pausa
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('\n6️⃣ Estado final no banco...');
    [rows] = await conexao.execute('SELECT quantidade_estoque FROM produtos WHERE id = 1');
    console.log(`   📦 Estoque final no banco: ${rows[0].quantidade_estoque}`);

    if (rows[0].quantidade_estoque === 25) {
      console.log('\n✅ SUCESSO: Estoque permaneceu em 25, problema resolvido!');
    } else {
      console.log(`\n❌ PROBLEMA PERSISTE: Estoque mudou de 25 para ${rows[0].quantidade_estoque}`);
    }

    await conexao.end();
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testeCompletoEstoque();
