const mysql = require('mysql2/promise');
require('dotenv').config();

async function analisarOtimizacoesBanco() {
  let conexao;
  
  try {
    console.log('🔍 ANÁLISE DE OTIMIZAÇÕES PARA O BANCO DE DADOS');
    console.log('=' .repeat(70));
    
    conexao = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'projetofgt'
    });
    
    console.log('✅ Conectado ao banco projetofgt\n');
    
    // 1. Analisar tabela PRODUTOS
    console.log('📦 TABELA PRODUTOS - Análise de Colunas');
    console.log('-'.repeat(50));
    
    // Verificar uso das colunas existentes
    const [estatisticasProdutos] = await conexao.execute(`
      SELECT 
        COUNT(*) as total_produtos,
        COUNT(CASE WHEN marca IS NOT NULL AND marca != '' THEN 1 END) as com_marca,
        COUNT(CASE WHEN nome IS NOT NULL AND nome != '' THEN 1 END) as com_nome,
        COUNT(CASE WHEN imagem IS NOT NULL AND imagem != '' THEN 1 END) as com_imagem,
        COUNT(CASE WHEN preco_antigo > 0 THEN 1 END) as com_preco_antigo,
        COUNT(CASE WHEN preco_atual > 0 THEN 1 END) as com_preco_atual,
        COUNT(CASE WHEN desconto > 0 THEN 1 END) as com_desconto,
        COUNT(CASE WHEN avaliacao > 0 THEN 1 END) as com_avaliacao,
        COUNT(CASE WHEN total_avaliacoes > 0 THEN 1 END) as com_total_avaliacoes,
        COUNT(CASE WHEN categoria IS NOT NULL AND categoria != '' THEN 1 END) as com_categoria,
        COUNT(CASE WHEN genero IS NOT NULL AND genero != '' THEN 1 END) as com_genero,
        COUNT(CASE WHEN condicao IS NOT NULL AND condicao != '' THEN 1 END) as com_condicao,
        COUNT(CASE WHEN disponivel = 1 THEN 1 END) as disponiveis,
        COUNT(CASE WHEN quantidade_estoque > 0 THEN 1 END) as com_estoque,
        COUNT(CASE WHEN descricao IS NOT NULL AND descricao != '' THEN 1 END) as com_descricao
      FROM produtos
    `);
    
    const stats = estatisticasProdutos[0];
    
    console.log('📊 Uso atual das colunas:');
    console.log(`  • Total de produtos: ${stats.total_produtos}`);
    console.log(`  • Com marca: ${stats.com_marca}/${stats.total_produtos} (${(stats.com_marca/stats.total_produtos*100).toFixed(1)}%)`);
    console.log(`  • Com preço antigo: ${stats.com_preco_antigo}/${stats.total_produtos} (${(stats.com_preco_antigo/stats.total_produtos*100).toFixed(1)}%)`);
    console.log(`  • Com desconto: ${stats.com_desconto}/${stats.total_produtos} (${(stats.com_desconto/stats.total_produtos*100).toFixed(1)}%)`);
    console.log(`  • Com avaliação: ${stats.com_avaliacao}/${stats.total_produtos} (${(stats.com_avaliacao/stats.total_produtos*100).toFixed(1)}%)`);
    console.log(`  • Com total avaliações: ${stats.com_total_avaliacoes}/${stats.total_produtos} (${(stats.com_total_avaliacoes/stats.total_produtos*100).toFixed(1)}%)`);
    console.log(`  • Com estoque: ${stats.com_estoque}/${stats.total_produtos} (${(stats.com_estoque/stats.total_produtos*100).toFixed(1)}%)`);
    console.log(`  • Com descrição: ${stats.com_descricao}/${stats.total_produtos} (${(stats.com_descricao/stats.total_produtos*100).toFixed(1)}%)`);
    console.log(`  • Disponíveis: ${stats.disponiveis}/${stats.total_produtos} (${(stats.disponiveis/stats.total_produtos*100).toFixed(1)}%)`);
    
    // 2. Sugestões de colunas para ADICIONAR na tabela produtos
    console.log('\n➕ COLUNAS SUGERIDAS PARA ADICIONAR NA TABELA PRODUTOS:');
    console.log('-'.repeat(60));
    
    const colunasAdicionar = [
      {
        nome: 'codigo_barras',
        tipo: 'VARCHAR(50)',
        descricao: 'Código de barras do produto para controle de estoque',
        justificativa: 'Essencial para gestão de estoque e vendas'
      },
      {
        nome: 'peso_gramas',
        tipo: 'INT',
        descricao: 'Peso do produto em gramas para cálculo de frete',
        justificativa: 'Necessário para cálculo preciso do frete'
      },
      {
        nome: 'dimensoes',
        tipo: 'VARCHAR(100)',
        descricao: 'Dimensões do produto (LxAxP em cm)',
        justificativa: 'Importante para embalagem e frete'
      },
      {
        nome: 'slug',
        tipo: 'VARCHAR(255)',
        descricao: 'URL amigável para SEO',
        justificativa: 'Melhora SEO e navegação'
      },
      {
        nome: 'meta_title',
        tipo: 'VARCHAR(255)',
        descricao: 'Título para SEO',
        justificativa: 'Otimização para motores de busca'
      },
      {
        nome: 'meta_description',
        tipo: 'TEXT',
        descricao: 'Descrição para SEO',
        justificativa: 'Otimização para motores de busca'
      },
      {
        nome: 'tags',
        tipo: 'TEXT',
        descricao: 'Tags do produto separadas por vírgula',
        justificativa: 'Melhora busca e categorização'
      },
      {
        nome: 'destaque',
        tipo: 'BOOLEAN',
        descricao: 'Se o produto é destaque na homepage',
        justificativa: 'Controle de produtos em destaque'
      },
      {
        nome: 'data_lancamento',
        tipo: 'DATE',
        descricao: 'Data de lançamento do produto',
        justificativa: 'Controle de produtos novos'
      },
      {
        nome: 'fornecedor',
        tipo: 'VARCHAR(100)',
        descricao: 'Nome do fornecedor',
        justificativa: 'Gestão de fornecedores'
      }
    ];
    
    colunasAdicionar.forEach((col, index) => {
      console.log(`${index + 1}. ${col.nome} (${col.tipo})`);
      console.log(`   📝 ${col.descricao}`);
      console.log(`   💡 ${col.justificativa}\n`);
    });
    
    // 3. Analisar tabela CARRINHO
    console.log('🛒 TABELA CARRINHO - Análise de Colunas');
    console.log('-'.repeat(50));
    
    const [estatisticasCarrinho] = await conexao.execute(`
      SELECT 
        COUNT(*) as total_itens,
        COUNT(CASE WHEN tamanho IS NOT NULL AND tamanho != '' THEN 1 END) as com_tamanho,
        COUNT(CASE WHEN cor IS NOT NULL AND cor != '' THEN 1 END) as com_cor,
        COUNT(CASE WHEN preco_unitario IS NOT NULL AND preco_unitario > 0 THEN 1 END) as com_preco
      FROM carrinho
    `);
    
    const statsCarrinho = estatisticasCarrinho[0];
    
    console.log('📊 Uso atual das colunas do carrinho:');
    console.log(`  • Total de itens: ${statsCarrinho.total_itens}`);
    console.log(`  • Com tamanho: ${statsCarrinho.com_tamanho}/${statsCarrinho.total_itens} (${(statsCarrinho.com_tamanho/statsCarrinho.total_itens*100).toFixed(1)}%)`);
    console.log(`  • Com cor: ${statsCarrinho.com_cor}/${statsCarrinho.total_itens} (${(statsCarrinho.com_cor/statsCarrinho.total_itens*100).toFixed(1)}%)`);
    console.log(`  • Com preço: ${statsCarrinho.com_preco}/${statsCarrinho.total_itens} (${(statsCarrinho.com_preco/statsCarrinho.total_itens*100).toFixed(1)}%)`);
    
    // 4. Sugestões para tabela CARRINHO
    console.log('\n🔧 SUGESTÕES PARA TABELA CARRINHO:');
    console.log('-'.repeat(40));
    
    if (statsCarrinho.com_tamanho < statsCarrinho.total_itens * 0.1) {
      console.log('❌ REMOVER: Coluna "tamanho" - pouco usada para papelaria');
    }
    
    if (statsCarrinho.com_cor < statsCarrinho.total_itens * 0.1) {
      console.log('❌ REMOVER: Coluna "cor" - pouco usada para papelaria');
    }
    
    console.log('➕ ADICIONAR: Coluna "observacoes" TEXT - para observações específicas do item');
    console.log('➕ ADICIONAR: Coluna "data_expiracao" TIMESTAMP - para limpar carrinho antigo automaticamente');
    
    // 5. Verificar necessidade de tabelas adicionais
    console.log('\n📋 SUGESTÕES DE NOVAS TABELAS:');
    console.log('-'.repeat(40));
    
    const novasTabelas = [
      {
        nome: 'categorias',
        descricao: 'Tabela dedicada para categorias com hierarquia',
        campos: 'id, nome, descricao, categoria_pai_id, icone, ativo'
      },
      {
        nome: 'fornecedores',
        descricao: 'Gestão completa de fornecedores',
        campos: 'id, nome, cnpj, contato, email, telefone, endereco'
      },
      {
        nome: 'produto_tags',
        descricao: 'Relacionamento many-to-many entre produtos e tags',
        campos: 'produto_id, tag_id'
      },
      {
        nome: 'tags',
        descricao: 'Sistema de tags para produtos',
        campos: 'id, nome, cor, descricao'
      },
      {
        nome: 'cupons_desconto',
        descricao: 'Sistema de cupons de desconto',
        campos: 'id, codigo, valor, tipo, data_inicio, data_fim, ativo'
      }
    ];
    
    novasTabelas.forEach((tabela, index) => {
      console.log(`${index + 1}. ${tabela.nome}`);
      console.log(`   📝 ${tabela.descricao}`);
      console.log(`   🏗️  Campos: ${tabela.campos}\n`);
    });
    
    // 6. Script SQL para implementar melhorias
    console.log('\n📜 SCRIPT SQL PARA IMPLEMENTAR MELHORIAS:');
    console.log('-'.repeat(50));
    console.log(`
-- Adicionar colunas úteis na tabela produtos
ALTER TABLE produtos 
ADD COLUMN codigo_barras VARCHAR(50),
ADD COLUMN peso_gramas INT,
ADD COLUMN dimensoes VARCHAR(100),
ADD COLUMN slug VARCHAR(255) UNIQUE,
ADD COLUMN tags TEXT,
ADD COLUMN destaque BOOLEAN DEFAULT FALSE,
ADD COLUMN data_lancamento DATE,
ADD COLUMN fornecedor VARCHAR(100);

-- Criar índices para performance
CREATE INDEX idx_produtos_slug ON produtos(slug);
CREATE INDEX idx_produtos_destaque ON produtos(destaque);
CREATE INDEX idx_produtos_data_lancamento ON produtos(data_lancamento);

-- Limpar colunas desnecessárias do carrinho (se aprovado)
-- ALTER TABLE carrinho DROP COLUMN tamanho;
-- ALTER TABLE carrinho DROP COLUMN cor;

-- Adicionar colunas úteis no carrinho
ALTER TABLE carrinho 
ADD COLUMN observacoes TEXT,
ADD COLUMN data_expiracao TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 30 DAY);

-- Criar tabela de categorias hierárquica
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria_pai_id INT,
    icone VARCHAR(50),
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (categoria_pai_id) REFERENCES categorias(id)
);
    `);
    
    console.log('\n✅ ANÁLISE DE OTIMIZAÇÕES CONCLUÍDA!');
    
  } catch (erro) {
    console.error('❌ Erro durante análise:', erro.message);
  } finally {
    if (conexao) {
      await conexao.end();
      console.log('\n🔒 Conexão fechada');
    }
  }
}

// Executar análise
analisarOtimizacoesBanco();
