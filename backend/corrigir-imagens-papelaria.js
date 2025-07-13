// Script para corrigir referências de imagens de tênis para papelaria
const fs = require('fs');
const path = require('path');

// Lista de arquivos para corrigir
const arquivosParaCorrigir = [
  // Frontend
  'frontend/src/pages/PaginaProdutosPersonalizados/PaginaProdutosPersonalizados_old.jsx',
  'frontend/src/pages/PaginaProdutosPersonalizados/PaginaProdutosPersonalizados_novo.jsx', 
  'frontend/src/pages/PaginaProdutosPersonalizados/PaginaProdutosPersonalizados.jsx',
  'frontend/src/pages/PaginaCarrinho/PaginaCarrinho.jsx',
  'frontend/src/components/produtos/ListaProdutos.jsx',
  'frontend/src/components/ItemListaProduto/ItemListaProduto.jsx',
  'frontend/src/components/carrinho/CarrinhoIntegrado.jsx',
  'frontend/src/components/CardProduto/CardProduto.jsx',
  'frontend/src/context/ContextoCarrinho.jsx',
  
  // Backend
  'backend/banco/criar_tabelas.sql',
  'backend/banco/inserir_dados.sql'
];

console.log('🔧 INICIANDO CORREÇÃO DE REFERÊNCIAS DE IMAGENS...\n');

arquivosParaCorrigir.forEach(arquivo => {
  const caminhoCompleto = path.join(__dirname, '..', arquivo);
  
  if (fs.existsSync(caminhoCompleto)) {
    console.log(`📝 Processando: ${arquivo}`);
    
    let conteudo = fs.readFileSync(caminhoCompleto, 'utf8');
    
    // Substituições
    let alteracoes = 0;
    
    // Imagens de tênis para papelaria
    if (conteudo.includes('/tenis_produtos.png')) {
      conteudo = conteudo.replace(/\/tenis_produtos\.png/g, '/img/papelaria_produtos.png');
      alteracoes++;
    }
    
    if (conteudo.includes("'/img/tenis_produtos.png'")) {
      conteudo = conteudo.replace(/\'\/img\/tenis_produtos\.png\'/g, "'/img/papelaria_produtos.png'");
      alteracoes++;
    }
    
    if (conteudo.includes('"/tenis_produtos.png"')) {
      conteudo = conteudo.replace(/\"\/tenis_produtos\.png\"/g, '"/img/papelaria_produtos.png"');
      alteracoes++;
    }
    
    if (alteracoes > 0) {
      fs.writeFileSync(caminhoCompleto, conteudo);
      console.log(`  ✅ ${alteracoes} alterações feitas`);
    } else {
      console.log(`  ⚪ Nenhuma alteração necessária`);
    }
  } else {
    console.log(`  ❌ Arquivo não encontrado: ${arquivo}`);
  }
});

console.log('\n✅ CORREÇÃO DE IMAGENS CONCLUÍDA!');
console.log('\n📋 PRÓXIMOS PASSOS:');
console.log('1. Criar arquivo /img/papelaria_produtos.png no frontend/public');
console.log('2. Atualizar banco de dados com dados de papelaria');
console.log('3. Verificar se todas as referências foram corrigidas');
