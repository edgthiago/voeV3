/**
 * 🔍 TESTE RÁPIDO FRONTEND 
 * Data: 09 de Julho de 2025
 * Objetivo: Verificar se frontend está carregando dados corretamente
 */

console.log('🚀 Iniciando teste do Dashboard...');

// Simular carregamento de dados como o frontend faria
async function testarFrontend() {
    try {
        console.log('📡 Testando conexão com API...');
        
        // Testar se o serviço está respondendo
        const healthResponse = await fetch('http://localhost:30011/api/health');
        const healthData = await healthResponse.json();
        console.log('✅ Health Check:', healthData.mensagem);

        // Testar métricas (como o frontend faz)
        console.log('📊 Carregando métricas...');
        const metricsResponse = await fetch('http://localhost:30011/api/monitoring/metrics');
        const metricsData = await metricsResponse.json();
        
        // Processar dados como o frontend corrigido faz
        const metrics = metricsData?.dados?.metrics || metricsData?.data?.metrics || metricsData;
        const alerts = metricsData?.dados?.alerts || metricsData?.data?.alerts || [];
        
        console.log('📈 Métricas processadas:');
        console.log('  CPU Usage:', metrics?.cpu?.usage?.toFixed(1) + '%');
        console.log('  Memory Usage:', metrics?.memory?.usage?.toFixed(1) + '%');
        console.log('  Disk Usage:', metrics?.disk?.usage?.toFixed(1) + '%');
        console.log('  Database Connections:', metrics?.database?.connections);
        console.log('  API Requests:', metrics?.api?.requests);
        
        console.log('🚨 Alertas ativos:', alerts.length);
        alerts.forEach((alert, i) => {
            console.log(`  ${i+1}. [${alert.type}] ${alert.message}`);
        });

        // Testar histórico
        console.log('📈 Carregando dados históricos...');
        const historyResponse = await fetch('http://localhost:30011/api/monitoring/metrics/history?days=1');
        const historyData = await historyResponse.json();
        const history = historyData?.dados || historyData?.data || [];
        
        console.log('📊 Dados históricos:', history.length, 'pontos');
        if (history.length > 0) {
            const latest = history[history.length - 1];
            console.log('  Último ponto - CPU:', latest?.cpu?.usage?.toFixed(1) + '%');
        }

        console.log('\n✅ TESTE CONCLUÍDO - Frontend deve estar funcionando!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

// Executar teste
testarFrontend();
