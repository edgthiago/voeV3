const mysql = require('mysql2/promise');
require('dotenv').config();

async function analisarBancoReal() {
  let conexao;
  
  try {
    console.log('🔍 ANÁLISE COMPLETA DO BANCO DE DADOS REAL - projetofgt');
    console.log('=' .repeat(80));
    
    // Conectar ao banco
    conexao = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'projetofgt'
    });
    
    console.log('✅ Conectado ao banco projetofgt');
    
    // 1. Listar todas as tabelas
    console.log('\n📋 TABELAS EXISTENTES:');
    console.log('-'.repeat(50));
    const [tabelas] = await conexao.execute('SHOW TABLES');
    
    for (const tabela of tabelas) {
      const nomeTabela = Object.values(tabela)[0];
      console.log(`- ${nomeTabela}`);
    }
    
    // 2. Analisar estrutura da tabela produtos (se existir)
    const tabelaProdutos = tabelas.find(t => Object.values(t)[0] === 'produtos');
    
    if (tabelaProdutos) {
      console.log('\n🏗️  ESTRUTURA DA TABELA PRODUTOS:');
      console.log('-'.repeat(50));
      
      const [colunas] = await conexao.execute('DESCRIBE produtos');
      console.log('Colunas existentes:');
      
      for (const coluna of colunas) {
        console.log(`  ${coluna.Field} | ${coluna.Type} | ${coluna.Null} | ${coluna.Key} | ${coluna.Default}`);
      }
      
      // 3. Verificar dados atuais na tabela produtos
      console.log('\n📊 DADOS ATUAIS NA TABELA PRODUTOS:');
      console.log('-'.repeat(50));
      
      const [contagem] = await conexao.execute('SELECT COUNT(*) as total FROM produtos');
      console.log(`Total de produtos: ${contagem[0].total}`);
      
      if (contagem[0].total > 0) {
        // Amostra de 5 produtos
        const [amostra] = await conexao.execute('SELECT id, nome, marca, categoria, genero FROM produtos LIMIT 5');
        console.log('\nAmostra de produtos (primeiros 5):');
        
        for (const produto of amostra) {
          console.log(`  ID: ${produto.id} | ${produto.nome} | ${produto.marca} | ${produto.categoria} | ${produto.genero}`);
        }
        
        // Verificar se ainda existem referências a tênis
        console.log('\n🔍 VERIFICANDO REFERÊNCIAS A TÊNIS:');
        console.log('-'.repeat(50));
        
        const [produtosTenis] = await conexao.execute(`
          SELECT COUNT(*) as total FROM produtos 
          WHERE nome LIKE '%tênis%' 
             OR nome LIKE '%tenis%' 
             OR categoria LIKE '%tênis%' 
             OR categoria LIKE '%tenis%'
             OR marca LIKE '%tênis%'
             OR marca LIKE '%tenis%'
             OR descricao LIKE '%tênis%'
             OR descricao LIKE '%tenis%'
        `);
        
        console.log(`Produtos com referências a 'tênis': ${produtosTenis[0].total}`);
        
        if (produtosTenis[0].total > 0) {
          const [exemplosTenis] = await conexao.execute(`
            SELECT id, nome, marca, categoria FROM produtos 
            WHERE nome LIKE '%tênis%' 
               OR nome LIKE '%tenis%' 
               OR categoria LIKE '%tênis%' 
               OR categoria LIKE '%tenis%'
            LIMIT 10
          `);
          
          console.log('\nExemplos de produtos com referências a tênis:');
          for (const produto of exemplosTenis) {
            console.log(`  ID: ${produto.id} | ${produto.nome} | ${produto.marca} | ${produto.categoria}`);
          }
        }
        
        // Verificar categorias existentes
        console.log('\n📂 CATEGORIAS EXISTENTES:');
        console.log('-'.repeat(50));
        
        const [categorias] = await conexao.execute('SELECT DISTINCT categoria FROM produtos ORDER BY categoria');
        for (const cat of categorias) {
          console.log(`  - ${cat.categoria}`);
        }
        
        // Verificar marcas existentes
        console.log('\n🏷️  MARCAS EXISTENTES:');
        console.log('-'.repeat(50));
        
        const [marcas] = await conexao.execute('SELECT DISTINCT marca FROM produtos ORDER BY marca');
        for (const marca of marcas) {
          console.log(`  - ${marca.marca}`);
        }
        
        // Verificar valores do campo genero
        console.log('\n👥 VALORES DO CAMPO GENERO:');
        console.log('-'.repeat(50));
        
        const [generos] = await conexao.execute('SELECT DISTINCT genero FROM produtos ORDER BY genero');
        for (const gen of generos) {
          console.log(`  - ${gen.genero}`);
        }
      }
    } else {
      console.log('\n❌ Tabela produtos não encontrada!');
    }
    
    // 4. Analisar outras tabelas importantes
    const tabelasImportantes = ['usuarios', 'pedidos', 'itens_pedido', 'carrinho'];
    
    for (const nomeTabela of tabelasImportantes) {
      const tabelaExiste = tabelas.find(t => Object.values(t)[0] === nomeTabela);
      
      if (tabelaExiste) {
        console.log(`\n🏗️  ESTRUTURA DA TABELA ${nomeTabela.toUpperCase()}:`);
        console.log('-'.repeat(50));
        
        const [colunas] = await conexao.execute(`DESCRIBE ${nomeTabela}`);
        console.log('Colunas existentes:');
        
        for (const coluna of colunas) {
          console.log(`  ${coluna.Field} | ${coluna.Type} | ${coluna.Null} | ${coluna.Key}`);
        }
        
        const [contagem] = await conexao.execute(`SELECT COUNT(*) as total FROM ${nomeTabela}`);
        console.log(`Total de registros: ${contagem[0].total}`);
      }
    }
    
    console.log('\n✅ ANÁLISE CONCLUÍDA!');
    
  } catch (erro) {
    console.error('❌ Erro durante análise:', erro.message);
    console.error('Stack:', erro.stack);
  } finally {
    if (conexao) {
      await conexao.end();
      console.log('\n🔒 Conexão fechada');
    }
  }
}

// Executar análise
analisarBancoReal();
