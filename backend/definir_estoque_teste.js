const mysql = require('mysql2/promise');
require('dotenv').config();

async function definirEstoqueParaTeste() {
  try {
    console.log('🎯 Definindo estoque para teste final...');
    
    const conexao = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME || 'projetofgt'
    });

    // Definir estoque para 7 para teste
    await conexao.execute('UPDATE produtos SET quantidade_estoque = 7 WHERE id = 1');
    
    // Verificar
    const [rows] = await conexao.execute('SELECT id, nome, quantidade_estoque as estoque FROM produtos WHERE id = 1');
    console.log('✅ Estoque definido para teste:', rows[0]);
    
    await conexao.end();
    
    console.log('\n🔍 Agora teste no frontend:');
    console.log('1. Acesse o painel de atualização de estoque');
    console.log('2. Verifique se o produto ID 1 mostra estoque = 7');
    console.log('3. Altere para outro valor (ex: 12)');
    console.log('4. Clique em salvar');
    console.log('5. Pressione F5');
    console.log('6. Verifique se o valor permanece 12 (e não volta para 7)');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

definirEstoqueParaTeste();
