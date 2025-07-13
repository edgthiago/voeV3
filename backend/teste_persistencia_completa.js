const mysql = require('mysql2/promise');
require('dotenv').config();

async function testarPersistenciaCompleta() {
  try {
    console.log('🎯 TESTE COMPLETO DE PERSISTÊNCIA - PROBLEMA REAL\n');
    
    const conexao = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME || 'projetofgt'
    });

    console.log('1️⃣ Estado inicial...');
    let [rows] = await conexao.execute('SELECT quantidade_estoque FROM produtos WHERE id = 1');
    console.log(`   📦 Estoque inicial: ${rows[0].quantidade_estoque}`);

    console.log('\n2️⃣ Atualizando para 100...');
    await conexao.execute('UPDATE produtos SET quantidade_estoque = 100 WHERE id = 1');
    [rows] = await conexao.execute('SELECT quantidade_estoque FROM produtos WHERE id = 1');
    console.log(`   ✅ Após UPDATE: ${rows[0].quantidade_estoque}`);

    console.log('\n3️⃣ Verificando se persiste (aguardando 3s)...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    [rows] = await conexao.execute('SELECT quantidade_estoque FROM produtos WHERE id = 1');
    console.log(`   🔄 Após 3s: ${rows[0].quantidade_estoque}`);

    console.log('\n4️⃣ Verificando outras conexões ao banco...');
    try {
      const [processes] = await conexao.execute('SHOW PROCESSLIST');
      console.log(`   📊 Total de processos ativos: ${processes.length}`);
      processes.forEach((proc, index) => {
        if (proc.db === (process.env.DB_NAME || 'projetofgt')) {
          console.log(`   ${index + 1}. User: ${proc.User}, Host: ${proc.Host}, Time: ${proc.Time}s, State: ${proc.State}`);
          if (proc.Info && proc.Info.toLowerCase().includes('update')) {
            console.log(`      ⚠️ UPDATE detectado: ${proc.Info}`);
          }
        }
      });
    } catch (e) {
      console.log('   ⚠️ Não foi possível verificar processos');
    }

    console.log('\n5️⃣ Testando com LOCK para prevenir alterações...');
    await conexao.execute('LOCK TABLES produtos WRITE');
    await conexao.execute('UPDATE produtos SET quantidade_estoque = 75 WHERE id = 1');
    [rows] = await conexao.execute('SELECT quantidade_estoque FROM produtos WHERE id = 1');
    console.log(`   🔒 Com LOCK: ${rows[0].quantidade_estoque}`);
    await conexao.execute('UNLOCK TABLES');

    console.log('\n6️⃣ Aguardando mais 2s após unlock...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    [rows] = await conexao.execute('SELECT quantidade_estoque FROM produtos WHERE id = 1');
    console.log(`   🔓 Após UNLOCK: ${rows[0].quantidade_estoque}`);

    console.log('\n7️⃣ Verificando logs de alterações...');
    try {
      // Verificar se há log binário habilitado
      const [logStatus] = await conexao.execute('SHOW VARIABLES LIKE "log_bin"');
      console.log(`   📝 Log binário: ${logStatus[0]?.Value || 'N/A'}`);
      
      const [generalLog] = await conexao.execute('SHOW VARIABLES LIKE "general_log"');
      console.log(`   📝 Log geral: ${generalLog[0]?.Value || 'N/A'}`);
    } catch (e) {
      console.log('   ⚠️ Não foi possível verificar logs');
    }

    await conexao.end();
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testarPersistenciaCompleta();
