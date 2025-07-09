const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Configuração do banco de dados
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '1234',
  database: 'projetofgt'
};

async function atualizarProdutosPapelaria() {
  let connection;
  
  try {
    console.log('🔄 Conectando ao banco de dados...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Conectado ao banco de dados!');
    
    // Ler o arquivo SQL
    const sqlFile = path.join(__dirname, 'banco', 'inserir_produtos_papelaria.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Dividir o conteúdo em comandos individuais (ignora comentários e USE)
    const commands = sqlContent
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && !line.trim().startsWith('USE') && line.trim().length > 0)
      .join('\n')
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);
    
    console.log(`📝 Executando ${commands.length} comandos SQL...`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        console.log(`Executando comando ${i + 1}/${commands.length}...`);
        await connection.execute(command);
      }
    }
    
    console.log('✅ Produtos de papelaria inseridos com sucesso!');
    
    // Verificar quantos produtos foram inseridos
    const [rows] = await connection.execute('SELECT COUNT(*) as total FROM produtos');
    console.log(`📊 Total de produtos na base: ${rows[0].total}`);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar produtos:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada');
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  atualizarProdutosPapelaria();
}

module.exports = atualizarProdutosPapelaria;
