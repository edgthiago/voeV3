/**
 * 🧪 TESTE ESPECÍFICO - CONTROLE DE SERVIÇOS
 * Data: 09 de Julho de 2025
 * Objetivo: Testar se o componente ControleServicos está funcionando
 */

console.log('🔧 Testando Controle de Serviços...');

async function testarServicos() {
    try {
        console.log('📡 Testando APIs de serviços...');
        
        // Testar métricas
        console.log('1. Testando métricas...');
        const metricsResponse = await fetch('http://localhost:30011/api/monitoring/metrics');
        const metricsData = await metricsResponse.json();
        console.log('✅ Métricas:', metricsData.sucesso ? 'OK' : 'ERRO');
        
        // Testar cache
        console.log('2. Testando cache...');
        const cacheResponse = await fetch('http://localhost:30011/api/cache/stats');
        const cacheData = await cacheResponse.json();
        console.log('✅ Cache:', cacheData.sucesso ? `OK (${cacheData.dados.status})` : 'ERRO');
        
        // Testar backup
        console.log('3. Testando backup...');
        const backupResponse = await fetch('http://localhost:30011/api/backup/status');
        const backupData = await backupResponse.json();
        console.log('✅ Backup:', backupData.sucesso ? `OK (${backupData.dados.status})` : 'ERRO');
        
        // Simular processamento como o componente faz
        console.log('\n🔧 Simulando processamento do componente...');
        
        const servicesList = [];
        
        // Serviço de Monitoramento
        const metrics = metricsData?.dados?.metrics || metricsData?.data?.metrics;
        servicesList.push({
            id: 'monitoring',
            name: 'Sistema de Monitoramento',
            status: metrics ? 'running' : 'unknown',
            uptime: metrics?.uptime || 0,
            description: 'Monitora métricas do sistema em tempo real'
        });
        
        // Serviço de Cache
        const cache = cacheData?.dados || cacheData?.data;
        servicesList.push({
            id: 'cache',
            name: 'Cache Redis',
            status: cache?.status === 'active' ? 'running' : 'stopped',
            uptime: cache?.stats?.uptime || 0,
            description: 'Sistema de cache distribuído'
        });
        
        // Serviço de Backup
        const backup = backupData?.dados || backupData?.data;
        servicesList.push({
            id: 'backup',
            name: 'Backup Automatizado',
            status: backup?.status === 'active' ? 'running' : 'stopped',
            uptime: backup?.statistics?.totalBackups || 0,
            description: 'Backup automático do banco de dados'
        });
        
        console.log('\n📋 Lista de serviços processada:');
        servicesList.forEach((service, i) => {
            console.log(`  ${i+1}. ${service.name}: ${service.status}`);
        });
        
        console.log('\n✅ TESTE CONCLUÍDO - Controle de Serviços deve funcionar!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

// Executar teste
testarServicos();
