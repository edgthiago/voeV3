/**
 * 🧪 TESTE DIRETO DO DASHBOARD - JULHO 2025
 * 
 * Script para testar se o dashboard está funcionando após as correções
 */

(async function testeDashboard() {
    console.log('🧪 Testando dashboard após correções...');
    
    try {
        // 1. Testar login se necessário
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('🔐 Fazendo login primeiro...');
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
                console.log('✅ Login realizado!');
            } else {
                console.error('❌ Erro no login:', loginData.mensagem);
                return;
            }
        }
        
        // 2. Testar rotas do dashboard uma por uma
        const rotas = [
            '/api/monitoring/metrics',
            '/api/monitoring/alerts', 
            '/api/director/dashboard',
            '/api/logs',
            '/api/backup/status',
            '/api/cache/stats'
        ];
        
        console.log('🔍 Testando rotas do dashboard...');
        
        for (const rota of rotas) {
            try {
                const response = await fetch(`http://localhost:30011${rota}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                const data = await response.json();
                
                if (data.sucesso) {
                    console.log(`✅ ${rota} - OK`);
                    
                    // Verificar se tem alerts
                    if (data.alerts) {
                        console.log(`   📊 Alerts encontrados: ${data.alerts.length}`);
                    }
                    if (data.dados && Array.isArray(data.dados)) {
                        console.log(`   📊 Dados array: ${data.dados.length} itens`);
                    }
                } else {
                    console.warn(`⚠️ ${rota} - ${data.mensagem || 'Erro desconhecido'}`);
                }
            } catch (error) {
                console.error(`❌ ${rota} - Erro:`, error.message);
            }
        }
        
        // 3. Simular carregamento do dashboard
        console.log('\n🔄 Simulando carregamento do dashboard...');
        
        try {
            const [
                metricsData,
                alertsData,
                logsData
            ] = await Promise.allSettled([
                fetch('http://localhost:30011/api/monitoring/metrics', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }).then(r => r.json()),
                fetch('http://localhost:30011/api/monitoring/alerts', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }).then(r => r.json()),
                fetch('http://localhost:30011/api/logs', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }).then(r => r.json())
            ]);
            
            console.log('📊 Resultados dos testes:');
            console.log('Métricas:', metricsData.status === 'fulfilled' ? '✅' : '❌');
            console.log('Alertas:', alertsData.status === 'fulfilled' ? '✅' : '❌');
            console.log('Logs:', logsData.status === 'fulfilled' ? '✅' : '❌');
            
            // Verificar estrutura dos alertas
            if (alertsData.status === 'fulfilled') {
                const alerts = alertsData.value?.data?.alerts || 
                              alertsData.value?.alerts || 
                              alertsData.value?.dados || [];
                              
                console.log(`🎯 Alertas processados: ${Array.isArray(alerts) ? alerts.length : 'Não é array'}`);
                
                if (alerts.length > 0) {
                    console.log('📝 Primeiro alerta:', alerts[0]);
                }
            }
            
        } catch (error) {
            console.error('❌ Erro na simulação:', error);
        }
        
        console.log('\n🎯 RESULTADO FINAL:');
        console.log('Se todos os testes passaram, o dashboard deve funcionar!');
        console.log('Navegue para o Painel do Diretor para verificar.');
        
    } catch (error) {
        console.error('❌ Erro geral no teste:', error);
    }
})();

// Função auxiliar para navegação
window.irParaDashboard = function() {
    console.log('🎯 Navegando para o dashboard...');
    window.location.href = '/dashboard';
};

console.log('\n🚀 COMANDOS DISPONÍVEIS:');
console.log('irParaDashboard() - Navegar para o dashboard');
console.log('testeDashboard() - Executar este teste novamente');
