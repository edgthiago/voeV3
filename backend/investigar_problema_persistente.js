const mysql = require('mysql2/promise');
require('dotenv').config();

async function investigarProblemaEstoque() {
  try {
    console.log('🔍 INVESTIGAÇÃO PROFUNDA - PROBLEMA PERSISTENTE DE ESTOQUE\n');
    
    const conexao = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME || 'projetofgt'
    });

    console.log('1️⃣ Estado atual do banco...');
    let [rows] = await conexao.execute('SELECT id, nome, quantidade_estoque, preco, categoria FROM produtos WHERE id = 1');
    console.log(`   📦 Produto: ${rows[0].nome}`);
    console.log(`   📊 Estoque atual: ${rows[0].quantidade_estoque}`);
    console.log(`   💰 Preço: ${rows[0].preco}`);
    console.log(`   🏷️ Categoria: ${rows[0].categoria}`);

    console.log('\n2️⃣ Verificando logs de alterações recentes...');
    try {
      const [logs] = await conexao.execute(`
        SELECT * FROM information_schema.processlist 
        WHERE db = '${process.env.DB_NAME || 'projetofgt'}' 
        AND command != 'Sleep'
      `);
      console.log(`   📋 Processos ativos: ${logs.length}`);
      logs.forEach(log => {
        console.log(`      - ${log.USER}: ${log.INFO || 'No info'}`);
      });
    } catch (e) {
      console.log('   ⚠️ Não foi possível verificar logs');
    }

    console.log('\n3️⃣ Verificando estrutura da tabela produtos...');
    const [structure] = await conexao.execute('DESCRIBE produtos');
    console.log('   📋 Colunas da tabela:');
    structure.forEach(col => {
      console.log(`      - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    console.log('\n4️⃣ Testando atualização manual...');
    console.log('   ➡️ Atualizando para 50...');
    await conexao.execute('UPDATE produtos SET quantidade_estoque = 50 WHERE id = 1');
    
    [rows] = await conexao.execute('SELECT quantidade_estoque FROM produtos WHERE id = 1');
    console.log(`   ✅ Após UPDATE: ${rows[0].quantidade_estoque}`);

    console.log('\n5️⃣ Aguardando 2 segundos...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    [rows] = await conexao.execute('SELECT quantidade_estoque FROM produtos WHERE id = 1');
    console.log(`   🔄 Após 2s: ${rows[0].quantidade_estoque}`);

    console.log('\n6️⃣ Verificando se existe algum valor padrão...');
    const [defaults] = await conexao.execute(`
      SELECT COLUMN_NAME, COLUMN_DEFAULT, IS_NULLABLE, COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'projetofgt'}' 
      AND TABLE_NAME = 'produtos' 
      AND COLUMN_NAME = 'quantidade_estoque'
    `);
    console.log('   📋 Configuração da coluna quantidade_estoque:');
    defaults.forEach(def => {
      console.log(`      Default: ${def.COLUMN_DEFAULT}`);
      console.log(`      Nullable: ${def.IS_NULLABLE}`);
      console.log(`      Type: ${def.COLUMN_TYPE}`);
    });

    await conexao.end();
  } catch (error) {
    console.error('❌ Erro na investigação:', error.message);
  }
}

investigarProblemaEstoque();
