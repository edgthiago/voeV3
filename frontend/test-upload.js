console.log('🧪 Testando sistema de upload de imagens...\n');

// 1. Fazer login e obter token
fetch('http://localhost:3003/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'thiagoeucosta@gmail.com', senha: '123456' })
})
.then(r => r.json())
.then(data => {
  if (data.sucesso) {
    console.log('✅ Login realizado com sucesso');
    const token = data.dados.token;
    
    // 2. Testar endpoint de listar imagens
    return fetch('http://localhost:3003/api/produtos/1/imagens', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } else {
    throw new Error('Falha no login');
  }
})
.then(r => r.json())
.then(data => {
  console.log('📸 Imagens do produto 1:', JSON.stringify(data, null, 2));
  
  if (data.sucesso) {
    console.log('\n🎯 RESULTADOS DO TESTE:');
    console.log(`- Produto ID: ${data.dados.produto_id}`);
    console.log(`- Total de imagens: ${data.dados.total_imagens}`);
    console.log(`- Imagem principal: ${data.dados.imagem_principal ? '✅ Sim' : '❌ Não'}`);
    console.log(`- Imagens adicionais: ${data.dados.imagens_adicionais.length}`);
    
    if (data.dados.imagem_principal) {
      console.log(`- URL da principal: ${data.dados.imagem_principal.url_imagem}`);
    }
  }
})
.catch(err => {
  console.error('❌ Erro no teste:', err);
});
