const conexao = require('./banco/conexao');

async function criarTabela() {
  try {
    console.log('🔄 Criando tabela produto_imagens...');
    
    const resultado = await conexao.executarConsulta(`
      CREATE TABLE IF NOT EXISTS produto_imagens (
        id INT PRIMARY KEY AUTO_INCREMENT,
        produto_id INT NOT NULL,
        url_imagem VARCHAR(500) NOT NULL,
        nome_arquivo VARCHAR(255) NOT NULL,
        tipo_imagem ENUM('principal', 'adicional') DEFAULT 'adicional',
        ordem INT DEFAULT 1,
        alt_text VARCHAR(255),
        ativo BOOLEAN DEFAULT TRUE,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
      )
    `);
    
    console.log('✅ Tabela produto_imagens criada com sucesso!');
    
    // Testar inserção de algumas imagens existentes
    const produtos = await conexao.executarConsulta('SELECT id, nome, imagem FROM produtos WHERE imagem IS NOT NULL LIMIT 3');
    console.log(`📊 Encontrados ${produtos.length} produtos com imagens`);
    
    for (const produto of produtos) {
      if (produto.imagem) {
        await conexao.executarConsulta(`
          INSERT IGNORE INTO produto_imagens (produto_id, url_imagem, nome_arquivo, tipo_imagem, ordem, alt_text)
          VALUES (?, ?, ?, 'principal', 1, ?)
        `, [produto.id, produto.imagem, `produto_${produto.id}_principal.jpg`, `Imagem principal de ${produto.nome}`]);
        
        console.log(`✅ Migrado produto ${produto.id}: ${produto.nome}`);
      }
    }
    
    console.log('🎉 Setup da tabela de imagens concluído!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

criarTabela();
