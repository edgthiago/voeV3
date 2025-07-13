const mysql = require('mysql2/promise');
require('dotenv').config();

async function testarEstoque() {
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

    // Verificar estoque atual
    console.log('📦 Verificando estoque atual do produto ID 1...');
    const [rows] = await conexao.execute('SELECT id, nome, quantidade_estoque as estoque FROM produtos WHERE id = 1');
    
    if (rows.length === 0) {
      console.log('❌ Produto ID 1 não encontrado');
      await conexao.end();
      return;
    }
    
    console.log('Estoque atual:', rows[0]);

    // Atualizar estoque
    const novoEstoque = 9;
    console.log(`🔄 Atualizando estoque para ${novoEstoque}...`);
    await conexao.execute('UPDATE produtos SET quantidade_estoque = ? WHERE id = 1', [novoEstoque]);

    // Verificar estoque após atualização
    console.log('📦 Verificando estoque após atualização...');
    const [rowsApos] = await conexao.execute('SELECT id, nome, quantidade_estoque as estoque FROM produtos WHERE id = 1');
    console.log('Estoque após atualização:', rowsApos[0]);

    await conexao.end();
    console.log('✅ Teste concluído - Estoque atualizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testarEstoque();
