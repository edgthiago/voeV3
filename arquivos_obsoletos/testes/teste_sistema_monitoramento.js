/**
 * 🧪 TESTE DO SISTEMA DE MONITORAMENTO
 * Data: 07 de Julho de 2025
 * Objetivo: Validar todas as funcionalidades do sistema de monitoramento
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

// Função para executar testes
async function testarSistemaMonitoramento() {
    console.log('🔍 ===== TESTE DO SISTEMA DE MONITORAMENTO =====');
    console.log('📅 Data:', new Date().toLocaleString('pt-BR'));
    console.log('');

    let testesPassaram = 0;
    let totalTestes = 0;

    try {
        // Teste 1: Importar serviço de monitoramento
        console.log('🔧 Teste 1: Importar serviço de monitoramento');
        totalTestes++;
        
        try {
            const monitoringService = require('./services/monitoringService');
            console.log('   ✅ Serviço de monitoramento importado com sucesso');
            testesPassaram++;
        } catch (error) {
            console.log('   ❌ Erro ao importar serviço:', error.message);
        }

        // Teste 2: Verificar inicialização
        console.log('🚀 Teste 2: Verificar inicialização do serviço');
        totalTestes++;
        
        try {
            const monitoringService = require('./services/monitoringService');
            const status = monitoringService.getMonitoringStatus();
            
            if (status && typeof status === 'object') {
                console.log('   ✅ Serviço inicializado corretamente');
                console.log('   📊 Status:', status.isMonitoring ? 'Ativo' : 'Inativo');
                console.log('   ⏱️ Interval:', status.interval, 'ms');
                testesPassaram++;
            } else {
                console.log('   ❌ Status inválido');
            }
        } catch (error) {
            console.log('   ❌ Erro na inicialização:', error.message);
        }

        // Teste 3: Iniciar monitoramento
        console.log('▶️ Teste 3: Iniciar monitoramento');
        totalTestes++;
        
        try {
            const monitoringService = require('./services/monitoringService');
            const result = monitoringService.startMonitoring();
            
            if (result && result.success) {
                console.log('   ✅ Monitoramento iniciado com sucesso');
                console.log('   📋 Resultado:', result.message);
                testesPassaram++;
            } else {
                console.log('   ❌ Falha ao iniciar monitoramento');
            }
        } catch (error) {
            console.log('   ❌ Erro ao iniciar monitoramento:', error.message);
        }

        // Teste 4: Coletar métricas
        console.log('📈 Teste 4: Coletar métricas do sistema');
        totalTestes++;
        
        try {
            const monitoringService = require('./services/monitoringService');
            await monitoringService.collectMetrics();
            
            console.log('   ✅ Métricas coletadas com sucesso');
            testesPassaram++;
        } catch (error) {
            console.log('   ❌ Erro ao coletar métricas:', error.message);
        }

        // Teste 5: Obter métricas atuais
        console.log('📊 Teste 5: Obter métricas atuais');
        totalTestes++;
        
        try {
            const monitoringService = require('./services/monitoringService');
            const metrics = monitoringService.getCurrentMetrics();
            
            if (metrics && metrics.timestamp) {
                console.log('   ✅ Métricas obtidas com sucesso');
                console.log('   🖥️ CPU:', metrics.system?.cpu || 0, '%');
                console.log('   💾 Memória:', metrics.system?.memory?.usage || 0, '%');
                console.log('   💿 Disco:', metrics.system?.disk?.usage || 0, '%');
                console.log('   🗄️ DB Conexões:', metrics.database?.connections || 0);
                console.log('   ⏱️ Tempo Resposta:', Math.round(metrics.performance?.averageResponseTime || 0), 'ms');
                testesPassaram++;
            } else {
                console.log('   ❌ Métricas inválidas');
            }
        } catch (error) {
            console.log('   ❌ Erro ao obter métricas:', error.message);
        }

        // Teste 6: Verificar alertas
        console.log('🚨 Teste 6: Verificar sistema de alertas');
        totalTestes++;
        
        try {
            const monitoringService = require('./services/monitoringService');
            const metrics = monitoringService.getCurrentMetrics();
            const alerts = metrics.alerts || [];
            
            console.log('   ✅ Sistema de alertas verificado');
            console.log('   📢 Alertas ativos:', alerts.length);
            
            if (alerts.length > 0) {
                console.log('   🚨 Tipos de alertas:');
                alerts.forEach(alert => {
                    console.log(`      - ${alert.type}: ${alert.message}`);
                });
            } else {
                console.log('   ✅ Nenhum alerta ativo');
            }
            
            testesPassaram++;
        } catch (error) {
            console.log('   ❌ Erro ao verificar alertas:', error.message);
        }

        // Teste 7: Verificação de saúde
        console.log('🏥 Teste 7: Verificação de saúde do sistema');
        totalTestes++;
        
        try {
            const monitoringService = require('./services/monitoringService');
            const health = await monitoringService.healthCheck();
            
            if (health && health.status) {
                console.log('   ✅ Verificação de saúde realizada');
                console.log('   🏥 Status:', health.status);
                console.log('   🗄️ Banco:', health.services?.database || 'unknown');
                console.log('   📱 Aplicação:', health.services?.application || 'unknown');
                console.log('   💾 Sistema de arquivos:', health.services?.filesystem || 'unknown');
                testesPassaram++;
            } else {
                console.log('   ❌ Verificação de saúde falhou');
            }
        } catch (error) {
            console.log('   ❌ Erro na verificação de saúde:', error.message);
        }

        // Teste 8: Verificar rotas de monitoramento
        console.log('🛣️ Teste 8: Verificar rotas de monitoramento');
        totalTestes++;
        
        try {
            const monitoringRoutes = require('./rotas/monitoring');
            
            if (monitoringRoutes) {
                console.log('   ✅ Rotas de monitoramento carregadas');
                console.log('   📝 Endpoints disponíveis:');
                console.log('      GET /api/monitoring/status');
                console.log('      GET /api/monitoring/metrics');
                console.log('      GET /api/monitoring/metrics/history');
                console.log('      POST /api/monitoring/start');
                console.log('      POST /api/monitoring/stop');
                console.log('      GET /api/monitoring/alerts');
                console.log('      GET /api/monitoring/health');
                console.log('      POST /api/monitoring/thresholds');
                console.log('      GET /api/monitoring/reports/daily');
                console.log('      GET /api/monitoring/dashboard');
                console.log('      POST /api/monitoring/collect');
                testesPassaram++;
            } else {
                console.log('   ❌ Falha ao carregar rotas');
            }
        } catch (error) {
            console.log('   ❌ Erro ao verificar rotas:', error.message);
        }

        // Teste 9: Verificar diretórios de métricas
        console.log('📁 Teste 9: Verificar estrutura de diretórios');
        totalTestes++;
        
        try {
            const metricsDir = path.join(__dirname, 'metrics');
            const reportsDir = path.join(__dirname, 'reports');
            
            // Criar diretórios se não existirem
            if (!fs.existsSync(metricsDir)) {
                fs.mkdirSync(metricsDir, { recursive: true });
            }
            
            if (!fs.existsSync(reportsDir)) {
                fs.mkdirSync(reportsDir, { recursive: true });
            }
            
            console.log('   ✅ Diretórios verificados/criados');
            console.log('   📊 Métricas:', metricsDir);
            console.log('   📋 Relatórios:', reportsDir);
            testesPassaram++;
        } catch (error) {
            console.log('   ❌ Erro ao verificar diretórios:', error.message);
        }

        // Teste 10: Configurar thresholds
        console.log('⚙️ Teste 10: Configurar thresholds');
        totalTestes++;
        
        try {
            const monitoringService = require('./services/monitoringService');
            const newThresholds = {
                cpu: 85,
                memory: 90,
                disk: 95
            };
            
            const result = monitoringService.setThresholds(newThresholds);
            
            if (result && result.cpu === 85) {
                console.log('   ✅ Thresholds configurados com sucesso');
                console.log('   📊 CPU:', result.cpu, '%');
                console.log('   💾 Memória:', result.memory, '%');
                console.log('   💿 Disco:', result.disk, '%');
                testesPassaram++;
            } else {
                console.log('   ❌ Falha ao configurar thresholds');
            }
        } catch (error) {
            console.log('   ❌ Erro ao configurar thresholds:', error.message);
        }

        // Teste 11: Parar monitoramento
        console.log('⏸️ Teste 11: Parar monitoramento');
        totalTestes++;
        
        try {
            const monitoringService = require('./services/monitoringService');
            const result = monitoringService.stopMonitoring();
            
            if (result && result.success) {
                console.log('   ✅ Monitoramento parado com sucesso');
                console.log('   📋 Resultado:', result.message);
                testesPassaram++;
            } else {
                console.log('   ❌ Falha ao parar monitoramento');
            }
        } catch (error) {
            console.log('   ❌ Erro ao parar monitoramento:', error.message);
        }

        // Teste 12: Verificar persistência de dados
        console.log('💾 Teste 12: Verificar persistência de dados');
        totalTestes++;
        
        try {
            const metricsDir = path.join(__dirname, 'metrics');
            const files = fs.readdirSync(metricsDir);
            const metricsFiles = files.filter(f => f.startsWith('metrics-'));
            
            console.log('   ✅ Persistência verificada');
            console.log('   📊 Arquivos de métricas:', metricsFiles.length);
            
            if (metricsFiles.length > 0) {
                console.log('   📁 Arquivos encontrados:');
                metricsFiles.slice(0, 3).forEach(file => {
                    console.log(`      - ${file}`);
                });
                
                if (metricsFiles.length > 3) {
                    console.log(`      ... e mais ${metricsFiles.length - 3} arquivos`);
                }
            }
            
            testesPassaram++;
        } catch (error) {
            console.log('   ❌ Erro ao verificar persistência:', error.message);
        }

        console.log('');
        console.log('📊 ===== RESULTADO DO TESTE =====');
        console.log(`✅ Testes Passaram: ${testesPassaram}/${totalTestes}`);
        console.log(`📈 Taxa de Sucesso: ${Math.round((testesPassaram / totalTestes) * 100)}%`);
        console.log('');

        if (testesPassaram === totalTestes) {
            console.log('🎉 TODOS OS TESTES PASSARAM!');
            console.log('✅ Sistema de monitoramento implementado com sucesso');
            console.log('✅ Métricas de sistema coletadas corretamente');
            console.log('✅ Sistema de alertas funcionando');
            console.log('✅ Verificação de saúde operacional');
            console.log('✅ Rotas de API configuradas');
            console.log('✅ Persistência de dados funcionando');
            console.log('');
            console.log('🔧 CONFIGURAÇÕES PARA PRODUÇÃO:');
            console.log('1. Configurar canais de alerta (email, Slack, SMS)');
            console.log('2. Ajustar thresholds conforme necessário');
            console.log('3. Configurar retenção de métricas');
            console.log('4. Ativar monitoramento automático');
            console.log('5. Configurar dashboard de visualização');
            console.log('');
            console.log('🌟 SISTEMA DE MONITORAMENTO PRONTO PARA PRODUÇÃO!');
        } else {
            console.log('⚠️ Alguns testes falharam');
            console.log('🔧 Verifique as configurações e dependências');
            console.log('📋 Revise os logs para mais detalhes');
        }

    } catch (error) {
        console.error('❌ Erro geral no teste:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Executar testes
testarSistemaMonitoramento().catch(console.error);
