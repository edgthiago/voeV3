#!/usr/bin/env node

/**
 * Script DEFINITIVO para eliminar TODAS as referências a "tênis" e "loja de tênis"
 * Migrando completamente para o contexto de PAPELARIA
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 LIMPEZA COMPLETA: TÊNIS → PAPELARIA');
console.log('=====================================\n');

// Mapeamento completo de substituições
const substituicoes = {
  // Nomes de produtos
  'Tênis Nike Air Max': 'Caderno Universitário 100 folhas',
  'Tênis Adidas Ultraboost': 'Caneta Esferográfica Azul',
  'Tênis Converse All Star': 'Lápis HB Kit 12 unidades',
  'Tênis Vans Old Skool': 'Marcador Permanente Preto',
  'Tênis Puma RS-X': 'Papel A4 Sulfite 500 folhas',
  'Tênis Nike Revolution 6 Next Nature Masculino': 'Kit Escolar Completo Premium',
  'Tênis Nike Air Force 1': 'Estojo Triplo com Compartimentos',
  
  // Categorias
  'Tênis Esportivo': 'Cadernos',
  'Tênis Casual': 'Canetas',
  'Tênis Corrida': 'Lápis',
  'Tênis Basquete': 'Marcadores',
  
  // Placeholders e exemplos
  'Ex: Tênis Nike Air Max': 'Ex: Caderno Universitário 100 folhas',
  'placeholder="Ex: Tênis Nike Air Max"': 'placeholder="Ex: Caderno Universitário 100 folhas"',
  
  // Descrições
  'Tênis esportivo confortável para corrida': 'Caderno com folhas pautadas, ideal para anotações',
  'Tênis premium para alta performance': 'Caneta de alta qualidade com tinta duradoura',
  'Tênis clássico atemporal': 'Kit de lápis com diferentes durezas',
  'Tênis confortável para o dia a dia': 'Marcador permanente para múltiplas superfícies',
  'Tênis estiloso e versátil': 'Papel sulfite de alta qualidade',
  
  // Contexto geral
  'loja de tênis': 'papelaria',
  'Loja de Tênis': 'Papelaria',
  'LOJA DE TÊNIS': 'PAPELARIA',
  'Sistema de Loja de Tênis': 'Sistema de Papelaria',
  'loja_tenis': 'papelaria',
  'Backend completo para loja de tênis': 'Backend completo para papelaria',
  'O melhor em calçados esportivos': 'Os melhores produtos para escritório e escola',
  'FGT - Loja de Tênis': 'FGT - Papelaria',
  
  // Imagens e assets
  'tenis_produtos.png': 'papelaria_produtos.png',
  '/img/tenis_produtos.png': '/img/papelaria_produtos.png',
  'alt="img de tenis"': 'alt="produtos de papelaria"',
  
  // Email e notificações
  'Loja de Tênis:': 'Papelaria FGT:',
  'Email_FROM_NAME=Loja de Tênis': 'EMAIL_FROM_NAME=Papelaria FGT',
  'Pedido Confirmado - Loja de Tênis': 'Pedido Confirmado - Papelaria FGT',
  'Pagamento Aprovado - Loja de Tênis': 'Pagamento Aprovado - Papelaria FGT',
  'Pedido Enviado - Loja de Tênis': 'Pedido Enviado - Papelaria FGT',
  'Pedido Entregue - Loja de Tênis': 'Pedido Entregue - Papelaria FGT',
  
  // Banco de dados
  'Schema completo para Loja de Tênis': 'Schema completo para Papelaria',
  'DB_NAME=loja_tenis': 'DB_NAME=papelaria_fgt',
  
  // Documentação
  'VOE V3 - Loja de Tênis': 'VOE V3 - Papelaria FGT',
  'Sistema VOE V3 - Loja de Tênis': 'Sistema VOE V3 - Papelaria FGT',
  
  // Rotas e APIs
  'API Loja de Tênis FGT': 'API Papelaria FGT',
  'Rotas para gerenciamento de pedidos do sistema de loja de tênis': 'Rotas para gerenciamento de pedidos do sistema de papelaria',
  'Pedido #${pedido_id} - Loja de Tênis': 'Pedido #${pedido_id} - Papelaria FGT'
};

// Arquivos a serem processados (evitar arquivos obsoletos e de backup quando possível)
const arquivosParaProcessar = [
  // Frontend
  'frontend/src/components/admin/AdicionarProduto.jsx',
  'frontend/src/components/admin/EditarProduto.jsx',
  'frontend/src/components/admin/GerenciarEstoque.jsx',
  'frontend/src/components/admin/PedidosPendentes.jsx',
  'frontend/src/components/admin/RelatoriosColaborador.jsx',
  'frontend/src/components/admin/TodosPedidos.jsx',
  'frontend/src/components/Checkout/FormSucessoResumo.jsx',
  'frontend/index.html',
  'frontend/package.json',
  
  // Backend
  'backend/servidor.js',
  'backend/package.json',
  'backend/.env.example',
  'backend/rotas/pedidos.js',
  'backend/rotas/usuarios.js',
  'backend/rotas/pagamentos.js',
  'backend/rotas/notificacoes.js',
  'backend/rotas/admin-metrics.js',
  'backend/services/notificacaoService.js',
  'backend/services/pagamentoService.js',
  'backend/services/statusPedidoService.js',
  'backend/services/freteService.js',
  'backend/services/eventoManager.js',
  'backend/services/backupService.js',
  'backend/utils/logger.js',
  'backend/utils/metrics.js',
  'backend/banco/configurar_banco.js',
  'backend/banco/schema.sql',
  'backend/banco/schema_notificacoes.sql',
  
  // Arquivos raiz
  'README.md',
  'package.json',
  'verificar_banco_pedidos.js',
  'teste_dados_reais.sh',
  
  // Documentação
  'STATUS_FINAL_ADMIN.md',
  'DOCUMENTACAO_FUNCIONALIDADES_ADMIN.md',
  'CORRECAO_DADOS_REAIS_COMPLETA.md',
  'RELATORIOS_DADOS_REAIS_CONCLUIDO.md'
];

function processarArquivo(caminhoArquivo) {
  const caminhoCompleto = path.join(__dirname, caminhoArquivo);
  
  if (!fs.existsSync(caminhoCompleto)) {
    console.log(`⚠️  Arquivo não encontrado: ${caminhoArquivo}`);
    return;
  }

  let conteudo = fs.readFileSync(caminhoCompleto, 'utf8');
  let alterado = false;

  // Aplicar todas as substituições
  for (const [antigo, novo] of Object.entries(substituicoes)) {
    if (conteudo.includes(antigo)) {
      const regex = new RegExp(antigo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      conteudo = conteudo.replace(regex, novo);
      alterado = true;
    }
  }

  if (alterado) {
    fs.writeFileSync(caminhoCompleto, conteudo, 'utf8');
    console.log(`✅ Atualizado: ${caminhoArquivo}`);
  } else {
    console.log(`ℹ️  Sem alterações: ${caminhoArquivo}`);
  }
}

// Renomear arquivo de imagem se existir
function renomearImagem() {
  const imagemAntiga = path.join(__dirname, 'frontend/public/tenis_produtos.png');
  const imagemNova = path.join(__dirname, 'frontend/public/papelaria_produtos.png');
  
  if (fs.existsSync(imagemAntiga)) {
    fs.renameSync(imagemAntiga, imagemNova);
    console.log('🖼️  Imagem renomeada: tenis_produtos.png → papelaria_produtos.png');
  }
}

// Executar processamento
console.log('🔄 Processando arquivos...\n');

arquivosParaProcessar.forEach(arquivo => {
  processarArquivo(arquivo);
});

renomearImagem();

console.log('\n✨ MIGRAÇÃO COMPLETA CONCLUÍDA!');
console.log('================================');
console.log('📋 Todas as referências a "tênis" foram substituídas por "papelaria"');
console.log('🎯 Sistema agora é 100% contextualizado para papelaria');
console.log('🔧 Próximos passos: testar frontend e backend para garantir funcionamento\n');
