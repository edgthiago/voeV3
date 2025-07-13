const mysql = require('mysql2/promise');
require('dotenv').config();

async function verificarTriggers() {
  try {
    const conexao = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME || 'projetofgt'
    });

    console.log('🔍 Verificando triggers no banco...');
    const [triggers] = await conexao.execute('SHOW TRIGGERS');
    
    if (triggers.length === 0) {
      console.log('✅ Nenhum trigger encontrado');
    } else {
      console.log('⚠️ Triggers encontrados:');
      triggers.forEach(trigger => {
        console.log(`- ${trigger.Trigger} on ${trigger.Table} (${trigger.Event})`);
      });
    }

    console.log('\n🔍 Verificando eventos agendados...');
    const [events] = await conexao.execute('SHOW EVENTS');
    
    if (events.length === 0) {
      console.log('✅ Nenhum evento agendado encontrado');
    } else {
      console.log('⚠️ Eventos agendados encontrados:');
      events.forEach(event => {
        console.log(`- ${event.Name} (${event.Status})`);
      });
    }

    console.log('\n🔍 Verificando stored procedures...');
    const [procedures] = await conexao.execute(`
      SELECT ROUTINE_NAME, ROUTINE_TYPE 
      FROM INFORMATION_SCHEMA.ROUTINES 
      WHERE ROUTINE_SCHEMA = '${process.env.DB_NAME || 'projetofgt'}'
    `);
    
    if (procedures.length === 0) {
      console.log('✅ Nenhuma stored procedure encontrada');
    } else {
      console.log('⚠️ Stored procedures encontradas:');
      procedures.forEach(proc => {
        console.log(`- ${proc.ROUTINE_NAME} (${proc.ROUTINE_TYPE})`);
      });
    }

    await conexao.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

verificarTriggers();
