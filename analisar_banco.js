const mysql = require('mysql2/promise');

async function analisarBancoDetalhado() {
  try {
    console.log('🔍 ANÁLISE COMPLETA DO BANCO DE DADOS');
    console.log('====================================\n');

    const conexao = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '1234',
      database: 'papelaria'
    });

    // 1. Verificar todas as tabelas
    console.log('📋 TABELAS EXISTENTES:');
    const [tabelas] = await conexao.execute('SHOW TABLES');
    tabelas.forEach(tabela => {
      console.log(`- ${Object.values(tabela)[0]}`);
    });

    // 2. Estrutura detalhada da tabela produtos
    console.log('\n📊 ESTRUTURA DETALHADA DA TABELA PRODUTOS:');
    const [estrutura] = await conexao.execute('DESCRIBE produtos');
    estrutura.forEach(coluna => {
      const obrigatorio = coluna.Null === 'NO' ? '(OBRIGATÓRIO)' : '(OPCIONAL)';
      const padrao = coluna.Default ? `DEFAULT: ${coluna.Default}` : 'SEM DEFAULT';
      console.log(`- ${coluna.Field}: ${coluna.Type} ${obrigatorio} ${padrao}`);
    });

    // 3. Verificar dados de exemplo
    console.log('\n🔢 DADOS DE EXEMPLO (primeiros 3 produtos):');
    const [produtos] = await conexao.execute(`
      SELECT id, marca, nome, categoria, genero, preco_atual, quantidade_estoque, descricao 
      FROM produtos 
      ORDER BY id 
      LIMIT 3
    `);
    
    produtos.forEach(produto => {
      console.log(`\nID ${produto.id}:`);
      console.log(`  Marca: ${produto.marca}`);
      console.log(`  Nome: ${produto.nome}`);
      console.log(`  Categoria: ${produto.categoria}`);
      console.log(`  Gênero: ${produto.genero}`);
      console.log(`  Preço: R$ ${produto.preco_atual}`);
      console.log(`  Estoque: ${produto.quantidade_estoque}`);
      console.log(`  Descrição: ${produto.descricao ? produto.descricao.substring(0, 50) + '...' : 'N/A'}`);
    });

    // 4. Verificar categorias únicas
    console.log('\n🏷️ CATEGORIAS EXISTENTES:');
    const [categorias] = await conexao.execute('SELECT DISTINCT categoria FROM produtos ORDER BY categoria');
    categorias.forEach(cat => console.log(`- ${cat.categoria}`));

    // 5. Verificar gêneros únicos
    console.log('\n👥 GÊNEROS/PÚBLICOS EXISTENTES:');
    const [generos] = await conexao.execute('SELECT DISTINCT genero FROM produtos ORDER BY genero');
    generos.forEach(gen => console.log(`- ${gen.genero}`));

    // 6. Verificar marcas únicas
    console.log('\n🏢 MARCAS EXISTENTES:');
    const [marcas] = await conexao.execute('SELECT DISTINCT marca FROM produtos ORDER BY marca LIMIT 10');
    marcas.forEach(marca => console.log(`- ${marca.marca}`));

    // 7. Verificar se há referências a "tênis" nos dados
    console.log('\n🔍 VERIFICANDO REFERÊNCIAS A "TÊNIS" NOS DADOS:');
    
    const [nomesTenis] = await conexao.execute(`
      SELECT COUNT(*) as total FROM produtos 
      WHERE nome LIKE '%tênis%' OR nome LIKE '%tenis%'
    `);
    console.log(`- Produtos com "tênis" no nome: ${nomesTenis[0].total}`);

    const [categoriasTenis] = await conexao.execute(`
      SELECT COUNT(*) as total FROM produtos 
      WHERE categoria LIKE '%tênis%' OR categoria LIKE '%tenis%'
    `);
    console.log(`- Produtos com "tênis" na categoria: ${categoriasTenis[0].total}`);

    const [descricoesTenis] = await conexao.execute(`
      SELECT COUNT(*) as total FROM produtos 
      WHERE descricao LIKE '%tênis%' OR descricao LIKE '%tenis%'
    `);
    console.log(`- Produtos com "tênis" na descrição: ${descricoesTenis[0].total}`);

    await conexao.end();
    console.log('\n✅ Análise concluída!');
    
  } catch (erro) {
    console.error('❌ Erro na análise:', erro.message);
  }
}

analisarBancoDetalhado();
