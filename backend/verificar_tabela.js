const mysql = require('mysql2/promise');
require('dotenv').config();

async function verificarTabela() {
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

    // Verificar estrutura da tabela produtos
    console.log('📋 Verificando estrutura da tabela produtos...');
    const [colunas] = await conexao.execute('DESCRIBE produtos');
    console.log('Colunas da tabela produtos:');
    colunas.forEach(coluna => {
      console.log(`- ${coluna.Field} (${coluna.Type})`);
    });

    // Verificar alguns produtos
    console.log('\n📦 Verificando produtos existentes...');
    const [produtos] = await conexao.execute('SELECT * FROM produtos LIMIT 3');
    console.log('Primeiros 3 produtos:');
    produtos.forEach(produto => {
      console.log(`- ID: ${produto.id}, Nome: ${produto.nome}`);
      console.log(`  Dados: ${JSON.stringify(produto, null, 2)}`);
    });

    await conexao.end();
    console.log('✅ Verificação concluída');
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

verificarTabela();
