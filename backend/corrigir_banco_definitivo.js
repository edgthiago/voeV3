const mysql = require('mysql2/promise');
require('dotenv').config();

async function corrigirBancoDefinitivamente() {
  let conexao;
  
  try {
    console.log('🔧 CORREÇÃO DEFINITIVA DO BANCO DE DADOS');
    console.log('=' .repeat(60));
    
    // Conectar ao banco
    conexao = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'projetofgt'
    });
    
    console.log('✅ Conectado ao banco projetofgt');
    
    // 1. Corrigir valor padrão da imagem na tabela produtos
    console.log('\n📸 Corrigindo valor padrão da imagem...');
    await conexao.execute(`
      ALTER TABLE produtos 
      ALTER COLUMN imagem SET DEFAULT '/img/papelaria_produtos.png'
    `);
    console.log('✅ Valor padrão da imagem corrigido');
    
    // 2. Atualizar produtos que ainda têm imagem de tênis
    console.log('\n🖼️  Atualizando imagens de produtos...');
    const [resultadoImagens] = await conexao.execute(`
      UPDATE produtos 
      SET imagem = '/img/papelaria_produtos.png' 
      WHERE imagem LIKE '%tenis%' OR imagem = '/tenis_produtos.png'
    `);
    console.log(`✅ ${resultadoImagens.affectedRows} imagens atualizadas`);
    
    // 3. Verificar se precisamos remover colunas da tabela carrinho
    console.log('\n🛒 Analisando tabela carrinho...');
    
    // Verificar se as colunas tamanho e cor têm dados importantes
    const [dadosCarrinho] = await conexao.execute(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN tamanho IS NOT NULL AND tamanho != '' THEN 1 END) as com_tamanho,
        COUNT(CASE WHEN cor IS NOT NULL AND cor != '' THEN 1 END) as com_cor
      FROM carrinho
    `);
    
    console.log(`Total de itens no carrinho: ${dadosCarrinho[0].total}`);
    console.log(`Itens com tamanho: ${dadosCarrinho[0].com_tamanho}`);
    console.log(`Itens com cor: ${dadosCarrinho[0].com_cor}`);
    
    // Se há poucos dados nessas colunas, vamos limpá-las
    if (dadosCarrinho[0].com_tamanho < 5 && dadosCarrinho[0].com_cor < 5) {
      console.log('\n🧹 Limpando campos tamanho e cor do carrinho...');
      await conexao.execute(`UPDATE carrinho SET tamanho = NULL, cor = NULL`);
      console.log('✅ Campos tamanho e cor limpos');
      
      // Opcional: Remover as colunas (comentado por segurança)
      // console.log('🗑️  Removendo colunas tamanho e cor...');
      // await conexao.execute(`ALTER TABLE carrinho DROP COLUMN tamanho`);
      // await conexao.execute(`ALTER TABLE carrinho DROP COLUMN cor`);
      // console.log('✅ Colunas removidas');
    }
    
    // 4. Verificar e corrigir descrições que possam ter referências a tênis
    console.log('\n📝 Verificando descrições...');
    const [descricoesTenis] = await conexao.execute(`
      SELECT id, nome, descricao 
      FROM produtos 
      WHERE descricao LIKE '%tênis%' OR descricao LIKE '%tenis%'
      LIMIT 5
    `);
    
    if (descricoesTenis.length > 0) {
      console.log(`❌ Encontradas ${descricoesTenis.length} descrições com referências a tênis:`);
      for (const produto of descricoesTenis) {
        console.log(`  ID ${produto.id}: ${produto.nome}`);
        console.log(`    Descrição: ${produto.descricao?.substring(0, 100)}...`);
      }
      
      // Aqui podemos implementar correções específicas se necessário
      console.log('⚠️  Estas descrições precisam ser corrigidas manualmente');
    } else {
      console.log('✅ Nenhuma descrição com referências a tênis encontrada');
    }
    
    // 5. Verificar status final
    console.log('\n📊 STATUS FINAL DO BANCO:');
    console.log('-'.repeat(40));
    
    const [statusProdutos] = await conexao.execute(`
      SELECT 
        COUNT(*) as total_produtos,
        COUNT(CASE WHEN imagem LIKE '%tenis%' THEN 1 END) as imagens_tenis,
        COUNT(CASE WHEN nome LIKE '%tênis%' OR nome LIKE '%tenis%' THEN 1 END) as nomes_tenis,
        COUNT(CASE WHEN categoria LIKE '%tênis%' OR categoria LIKE '%tenis%' THEN 1 END) as categorias_tenis
      FROM produtos
    `);
    
    const status = statusProdutos[0];
    console.log(`Total de produtos: ${status.total_produtos}`);
    console.log(`Imagens com referência a tênis: ${status.imagens_tenis}`);
    console.log(`Nomes com referência a tênis: ${status.nomes_tenis}`);
    console.log(`Categorias com referência a tênis: ${status.categorias_tenis}`);
    
    if (status.imagens_tenis === 0 && status.nomes_tenis === 0 && status.categorias_tenis === 0) {
      console.log('\n🎉 MIGRAÇÃO COMPLETA! Banco 100% limpo de referências a tênis');
    } else {
      console.log('\n⚠️  Ainda existem algumas referências a tênis que precisam ser corrigidas');
    }
    
    // 6. Verificar algumas amostras finais
    console.log('\n📋 AMOSTRA FINAL DE PRODUTOS:');
    console.log('-'.repeat(40));
    
    const [amostraFinal] = await conexao.execute(`
      SELECT id, nome, marca, categoria, imagem 
      FROM produtos 
      ORDER BY id 
      LIMIT 5
    `);
    
    for (const produto of amostraFinal) {
      console.log(`ID ${produto.id}: ${produto.nome}`);
      console.log(`  Marca: ${produto.marca} | Categoria: ${produto.categoria}`);
      console.log(`  Imagem: ${produto.imagem}`);
      console.log('');
    }
    
    console.log('✅ CORREÇÃO CONCLUÍDA!');
    
  } catch (erro) {
    console.error('❌ Erro durante correção:', erro.message);
    console.error('Stack:', erro.stack);
  } finally {
    if (conexao) {
      await conexao.end();
      console.log('\n🔒 Conexão fechada');
    }
  }
}

// Executar correção
corrigirBancoDefinitivamente();
