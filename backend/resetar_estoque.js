const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetarParaTeste() {
  try {
    console.log('🔄 Conectando ao banco...');
    
    const conexao = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME || 'projetofgt'
    });

    console.log('✅ Conectado ao banco');

    // Resetar estoque para 2 para testar
    console.log('🔄 Resetando estoque do produto ID 1 para 2...');
    await conexao.execute('UPDATE produtos SET quantidade_estoque = 2 WHERE id = 1');

    // Verificar
    const [rows] = await conexao.execute('SELECT id, nome, quantidade_estoque as estoque FROM produtos WHERE id = 1');
    console.log('✅ Estoque resetado:', rows[0]);

    await conexao.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

resetarParaTeste();
