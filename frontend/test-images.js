const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjc1LCJlbWFpbCI6InRoaWFnb2V1Y29zdGFAZ21haWwuY29tIiwibml2ZWxBY2Vzc28iOiJkaXJldG9yIiwiaWF0IjoxNzUyMTk2ODgwLCJleHAiOjE3NTIyODMyODB9.CadG2P_T_kRvbekphTjL5Sgq6DgPyNiAXlSRtM3M-GE";

async function testImageEndpoints() {
  console.log('🔍 Testando endpoints de imagens...\n');

  // Teste 1: Buscar imagens de um produto
  try {
    console.log('1. Testando GET /api/produtos/1/imagens');
    const response1 = await fetch('http://localhost:3001/api/produtos/1/imagens', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data1 = await response1.json();
    console.log('✅ Resposta:', JSON.stringify(data1, null, 2));
  } catch (error) {
    console.error('❌ Erro no teste 1:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Teste 2: Verificar se produto existe
  try {
    console.log('2. Testando GET /api/produtos/1');
    const response2 = await fetch('http://localhost:3001/api/produtos/1', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data2 = await response2.json();
    console.log('✅ Produto encontrado:', JSON.stringify(data2, null, 2));
  } catch (error) {
    console.error('❌ Erro no teste 2:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Teste 3: Listar todos os produtos
  try {
    console.log('3. Testando GET /api/produtos');
    const response3 = await fetch('http://localhost:3001/api/produtos', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data3 = await response3.json();
    console.log('✅ Produtos encontrados:', data3.dados?.length || 0);
    
    if (data3.dados && data3.dados.length > 0) {
      console.log('📦 Primeiro produto:', {
        id: data3.dados[0].id,
        nome: data3.dados[0].nome,
        preco: data3.dados[0].preco_atual || data3.dados[0].preco
      });
      
      // Teste 4: Buscar imagens do primeiro produto encontrado
      const produtoId = data3.dados[0].id;
      console.log(`\n4. Testando GET /api/produtos/${produtoId}/imagens`);
      
      const response4 = await fetch(`http://localhost:3001/api/produtos/${produtoId}/imagens`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data4 = await response4.json();
      console.log('✅ Imagens do produto:', JSON.stringify(data4, null, 2));
    }
  } catch (error) {
    console.error('❌ Erro no teste 3:', error.message);
  }
}

testImageEndpoints();
