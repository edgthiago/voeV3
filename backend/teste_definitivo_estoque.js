const mysql = require('mysql2/promise');
require('dotenv').config();

async function testeDefinitivo() {
  try {
    console.log('🎯 TESTE DEFINITIVO - INVESTIGAÇÃO FINAL\n');
    
    const conexao = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME || 'projetofgt'
    });

    console.log('1️⃣ Estado atual...');
    let [rows] = await conexao.execute('SELECT quantidade_estoque FROM produtos WHERE id = 1');
    console.log(`   📦 Estoque atual: ${rows[0].quantidade_estoque}`);

    console.log('\n2️⃣ Atualizando para 999 (número único para rastreamento)...');
    await conexao.execute('UPDATE produtos SET quantidade_estoque = 999 WHERE id = 1');
    [rows] = await conexao.execute('SELECT quantidade_estoque FROM produtos WHERE id = 1');
    console.log(`   ✅ Após UPDATE: ${rows[0].quantidade_estoque}`);

    console.log('\n3️⃣ Monitorando por 10 segundos...');
    for (let i = 1; i <= 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      [rows] = await conexao.execute('SELECT quantidade_estoque FROM produtos WHERE id = 1');
      console.log(`   ${i}s: ${rows[0].quantidade_estoque}`);
      
      if (rows[0].quantidade_estoque !== 999) {
        console.log(`   ⚠️ MUDANÇA DETECTADA! Estoque alterado de 999 para ${rows[0].quantidade_estoque} em ${i}s`);
        break;
      }
    }

    console.log('\n4️⃣ Verificando conexões ativas que podem alterar dados...');
    try {
      const [processes] = await conexao.execute(`
        SELECT ID, USER, HOST, DB, COMMAND, TIME, STATE, INFO 
        FROM INFORMATION_SCHEMA.PROCESSLIST 
        WHERE DB = '${process.env.DB_NAME || 'projetofgt'}' 
        AND COMMAND != 'Sleep'
        AND USER != 'event_scheduler'
      `);
      
      console.log(`   📊 Processos ativos no banco: ${processes.length}`);
      processes.forEach(proc => {
        console.log(`      ID: ${proc.ID}, User: ${proc.USER}, Host: ${proc.HOST}`);
        console.log(`      Command: ${proc.COMMAND}, Time: ${proc.TIME}s`);
        if (proc.INFO) {
          console.log(`      SQL: ${proc.INFO}`);
        }
        console.log('      ---');
      });
    } catch (e) {
      console.log('   ⚠️ Não foi possível verificar processos ativos');
    }

    console.log('\n5️⃣ Estado final...');
    [rows] = await conexao.execute('SELECT quantidade_estoque FROM produtos WHERE id = 1');
    console.log(`   📦 Estoque final: ${rows[0].quantidade_estoque}`);

    if (rows[0].quantidade_estoque === 999) {
      console.log('\n✅ SUCESSO: Estoque permaneceu estável!');
      console.log('   O problema pode estar relacionado ao frontend ou a uma ação específica do usuário.');
    } else {
      console.log('\n❌ PROBLEMA CONFIRMADO: Algo está alterando o estoque automaticamente!');
      console.log('   Há um processo ativo modificando os dados do banco.');
    }

    await conexao.end();
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testeDefinitivo();
