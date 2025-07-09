/**
 * 🔍 VERIFICAÇÃO DADOS DASHBOARD - JULHO 2025
 * 
 * Script para verificar se os dados estão sendo carregados corretamente
 */

(async function verificarDados() {
    console.log('🔍 Verificando carregamento de dados do dashboard...');
    
    // Verificar se está logado
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('🔐 Fazendo login...');
        const loginResponse = await fetch('http://localhost:30011/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'thiagoeucosta@gmail.com',
                senha: '123456'
            })
        });
        
        const loginData = await loginResponse.json();
        if (loginData.sucesso) {
            localStorage.setItem('token', loginData.dados.token);
            localStorage.setItem('usuario', JSON.stringify(loginData.dados.usuario));
            console.log('✅ Login OK');
        }
    }
    
    try {
        // Testar API de métricas
        console.log('\n📊 Testando API de métricas...');
        const response = await fetch('http://localhost:30011/api/monitoring/metrics', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const data = await response.json();
        console.log('📥 Resposta da API:', data);
        
        if (data.sucesso && data.dados && data.dados.metrics) {
            const metrics = data.dados.metrics;
            console.log('\n✅ DADOS CORRETOS:');
            console.log('🔧 CPU:', `${metrics.cpu.usage.toFixed(1)}%`);
            console.log('💾 Memória:', `${metrics.memory.used}MB / ${metrics.memory.total}MB (${metrics.memory.usage.toFixed(1)}%)`);
            console.log('⏱️ Uptime:', `${metrics.uptime} segundos`);
            console.log('💽 Disco:', `${metrics.disk.usage.toFixed(1)}% usado`);
            console.log('🌐 Rede:', `↓${metrics.network.incoming.toFixed(1)} ↑${metrics.network.outgoing.toFixed(1)}`);
            console.log('🗄️ Database:', `${metrics.database.connections} conexões`);
            
            // Verificar alertas
            if (data.alerts && data.alerts.length > 0) {
                console.log('\n🚨 ALERTAS:');
                data.alerts.forEach((alert, i) => {
                    console.log(`${i+1}. [${alert.type.toUpperCase()}] ${alert.message} (${alert.value})`);
                });
            }
            
            console.log('\n🎯 CONCLUSÃO: Dados estão sendo carregados corretamente!');
            console.log('Se o dashboard ainda mostra zeros, recarregue a página.');
            
        } else {
            console.error('❌ Estrutura de dados inesperada:', data);
        }
        
    } catch (error) {
        console.error('❌ Erro ao verificar dados:', error);
    }
})();

// Função para recarregar dados
window.recarregarDashboard = function() {
    console.log('🔄 Recarregando página...');
    window.location.reload();
};

// Função para ir ao dashboard
window.irParaDashboard = function() {
    console.log('🎯 Navegando para dashboard...');
    window.location.href = '/dashboard';
};

console.log('\n🛠️ COMANDOS:');
console.log('recarregarDashboard() - Recarregar página');
console.log('irParaDashboard() - Ir para dashboard');
