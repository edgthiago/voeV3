// Teste direto da API de histórico de métricas
async function testeHistorico() {
    try {
        console.log('🔍 Testando rota de histórico de métricas...');
        
        // Fazer login primeiro
        const loginResponse = await fetch('http://localhost:30011/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@teste.com',
                senha: '123456'
            })
        });
        
        const loginData = await loginResponse.json();
        console.log('✅ Login:', loginData.sucesso ? 'Sucesso' : 'Falha');
        
        if (!loginData.sucesso) {
            console.error('❌ Erro no login:', loginData.mensagem);
            return;
        }
        
        // Testar rota de histórico
        const historyResponse = await fetch('http://localhost:30011/api/monitoring/metrics/history?days=7', {
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });
        
        const historyData = await historyResponse.json();
        console.log('📊 Dados históricos:');
        console.log('- Sucesso:', historyData.sucesso);
        console.log('- Quantidade de pontos:', historyData.dados?.length || 0);
        
        if (historyData.dados && historyData.dados.length > 0) {
            const primeiro = historyData.dados[0];
            console.log('- Primeiro ponto:');
            console.log('  - CPU:', primeiro.cpu?.usage);
            console.log('  - Memória:', primeiro.memory?.usage);
            console.log('  - Disco:', primeiro.disk?.usage);
            console.log('  - Timestamp:', primeiro.timestamp);
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

// Executar com import dinâmico para Node.js
import('node-fetch').then(({ default: fetch }) => {
    global.fetch = fetch;
    testeHistorico();
}).catch(() => {
    console.error('❌ node-fetch não está disponível. Instalando...');
    require('child_process').exec('npm install node-fetch', (error) => {
        if (error) {
            console.error('❌ Erro ao instalar node-fetch:', error.message);
        } else {
            console.log('✅ node-fetch instalado. Tente executar novamente.');
        }
    });
});
