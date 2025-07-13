console.log('🔑 Fazendo login...');

fetch('http://localhost:3003/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'thiagoeucosta@gmail.com', senha: '123456' })
})
.then(r => r.json())
.then(data => {
  if (data.sucesso) {
    console.log('✅ Login OK');
    console.log('🔑 Token:', data.dados.token);
    
    // Testar endpoint de imagens
    return fetch('http://localhost:3003/api/produtos/1/imagens', {
      headers: { 'Authorization': `Bearer ${data.dados.token}` }
    });
  }
})
.then(r => r?.json())
.then(data => {
  console.log('📸 Imagens:', JSON.stringify(data, null, 2));
})
.catch(err => console.error('❌ Erro:', err));
