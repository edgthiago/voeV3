const mysql = require('mysql2/promise');
require('dotenv').config();

async function verificarEstrutura() {
  try {
    const conexao = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME || 'projetofgt'
    });

    console.log('🔍 ESTRUTURA REAL DA TABELA PRODUTOS\n');
    
    const [structure] = await conexao.execute('DESCRIBE produtos');
    console.log('📋 Colunas da tabela produtos:');
    structure.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} (Default: ${col.Default}, Null: ${col.Null})`);
    });

    console.log('\n📦 DADOS ATUAIS DO PRODUTO ID 1:');
    const [rows] = await conexao.execute('SELECT * FROM produtos WHERE id = 1');
    if (rows.length > 0) {
      console.log('Dados do produto:');
      Object.keys(rows[0]).forEach(key => {
        console.log(`   ${key}: ${rows[0][key]}`);
      });
    } else {
      console.log('❌ Produto ID 1 não encontrado');
    }

    await conexao.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

verificarEstrutura();
