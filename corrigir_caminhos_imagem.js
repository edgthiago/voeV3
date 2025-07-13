#!/usr/bin/env node

/**
 * Script para corrigir caminhos de imagem de papelaria
 */

const fs = require('fs');
const path = require('path');

console.log('🖼️  CORRIGINDO CAMINHOS DE IMAGEM DA PAPELARIA');
console.log('===============================================\n');

const arquivos = [
  'frontend/src/pages/PaginaProdutosPersonalizados/PaginaProdutosPersonalizados_old.jsx',
  'frontend/src/pages/PaginaProdutosPersonalizados/PaginaProdutosPersonalizados_novo.jsx',
  'frontend/src/pages/PaginaProdutosPersonalizados/PaginaProdutosPersonalizados.jsx'
];

function corrigirArquivo(caminhoArquivo) {
  const caminhoCompleto = path.join(__dirname, caminhoArquivo);
  
  if (!fs.existsSync(caminhoCompleto)) {
    console.log(`⚠️  Arquivo não encontrado: ${caminhoArquivo}`);
    return;
  }

  let conteudo = fs.readFileSync(caminhoCompleto, 'utf8');
  let alterado = false;

  // Corrigir caminhos de imagem
  const imagensIncorretas = [
    '/img/papelaria_produtos.png',
    '/img/img/papelaria_produtos.png'
  ];

  imagensIncorretas.forEach(imagemIncorreta => {
    if (conteudo.includes(imagemIncorreta)) {
      conteudo = conteudo.replace(new RegExp(imagemIncorreta.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '/papelaria_produtos.png');
      alterado = true;
    }
  });

  if (alterado) {
    fs.writeFileSync(caminhoCompleto, conteudo, 'utf8');
    console.log(`✅ Corrigido: ${caminhoArquivo}`);
  } else {
    console.log(`ℹ️  Sem alterações: ${caminhoArquivo}`);
  }
}

arquivos.forEach(arquivo => {
  corrigirArquivo(arquivo);
});

console.log('\n✨ CORREÇÃO DE IMAGENS CONCLUÍDA!');
