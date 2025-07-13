// Script para corrigir dados mockados de tênis para papelaria
const fs = require('fs');
const path = require('path');

// Mapeamento de substituições para componentes mockados
const substituicoes = {
  // Produtos específicos
  'Tênis Nike Air Max': 'Caderno Universitário 100 folhas',
  'Tênis Adidas Ultraboost': 'Caneta Esferográfica Azul',
  'Tênis Converse All Star': 'Lápis HB Kit 12 unidades',
  'Tênis Vans Old Skool': 'Marcador Permanente Preto',
  'Tênis Puma RS-X': 'Papel A4 Sulfite 500 folhas',
  
  // Categorias
  'Tênis Esportivo': 'Cadernos',
  'Tênis Casual': 'Canetas',
  'Tênis Corrida': 'Lápis',
  'Tênis Basquete': 'Marcadores',
  
  // Descrições
  'Tênis esportivo confortável para corrida': 'Caderno com folhas pautadas, ideal para anotações',
  'Tênis premium para alta performance': 'Caneta de alta qualidade com tinta duradoura',
  'Tênis clássico atemporal': 'Kit de lápis com diferentes durezas',
  'Tênis confortável para o dia a dia': 'Marcador permanente para múltiplas superfícies',
  'Tênis estiloso e versátil': 'Papel sulfite de alta qualidade'
};

// Lista de arquivos para corrigir
const arquivos = [
  'frontend/src/components/admin/TodosProdutos.jsx',
  'frontend/src/components/admin/GerenciarProdutos.jsx', 
  'frontend/src/components/admin/AtualizarEstoque.jsx',
  'frontend/src/components/Checkout/FormSucessoResumo.jsx'
];

console.log('🔧 CORRIGINDO DADOS MOCKADOS DE TÊNIS PARA PAPELARIA...\n');

arquivos.forEach(arquivo => {
  const caminhoCompleto = path.join(__dirname, '..', arquivo);
  
  if (fs.existsSync(caminhoCompleto)) {
    console.log(`📝 Processando: ${arquivo}`);
    
    let conteudo = fs.readFileSync(caminhoCompleto, 'utf8');
    let alteracoes = 0;
    
    // Aplicar todas as substituições
    Object.entries(substituicoes).forEach(([antigo, novo]) => {
      if (conteudo.includes(antigo)) {
        conteudo = conteudo.replace(new RegExp(antigo, 'g'), novo);
        alteracoes++;
      }
    });
    
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

console.log('\n✅ CORREÇÃO DE DADOS MOCKADOS CONCLUÍDA!');
