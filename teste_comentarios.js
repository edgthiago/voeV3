// Teste simples para verificar se a API de comentários está funcionando
const testarComentarios = async () => {
  try {
    console.log('🔍 Testando API de comentários...');
    
    // Teste 1: Buscar comentários do produto 1
    const response = await fetch('http://localhost:3004/api/produtos/1/comentarios', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status da resposta:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Dados recebidos:', JSON.stringify(data, null, 2));
      
      if (data.sucesso && Array.isArray(data.dados)) {
        console.log(`✅ Encontrados ${data.dados.length} comentários`);
        data.dados.forEach((comentario, index) => {
          console.log(`Comentário ${index + 1}:`, {
            id: comentario.id,
            usuario: comentario.usuario_nome,
            avaliacao: comentario.avaliacao,
            comentario: comentario.comentario.substring(0, 50) + '...'
          });
        });
      } else {
        console.log('⚠️ Formato de resposta inesperado:', data);
      }
    } else {
      console.error('❌ Erro na resposta:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
};

// Teste 2: Verificar se pode comentar
const testarPermissaoComentario = async () => {
  try {
    console.log('\n🔍 Testando permissão para comentar...');
    
    const response = await fetch('http://localhost:3004/api/usuarios/75/pode-avaliar/4', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token_teste'
      }
    });
    
    console.log('Status da resposta (permissão):', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Resposta de permissão:', data);
    } else {
      console.log('❌ Erro de permissão (esperado):', response.status);
    }
  } catch (error) {
    console.error('❌ Erro no teste de permissão:', error);
  }
};

// Executar testes
console.log('🚀 Iniciando testes de comentários...\n');
testarComentarios()
  .then(() => testarPermissaoComentario())
  .then(() => console.log('\n✅ Testes concluídos!'));
