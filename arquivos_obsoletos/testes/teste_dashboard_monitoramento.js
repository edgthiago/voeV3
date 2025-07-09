/**
 * 🧪 TESTE DO DASHBOARD DE MONITORAMENTO
 * Data: 07 de Julho de 2025
 * Objetivo: Verificar integração frontend/backend do sistema de monitoramento
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configurações
const API_BASE_URL = 'http://localhost:3000/api';
const FRONTEND_BASE_URL = 'http://localhost:5173';

// Cores para logs
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

class TesteDashboardMonitoramento {
    constructor() {
        this.testResults = {
            total: 0,
            passed: 0,
            failed: 0,
            errors: []
        };
        this.token = null;
    }

    async executarTodos() {
        log('🚀 INICIANDO TESTE DO DASHBOARD DE MONITORAMENTO', 'cyan');
        log('=' .repeat(60), 'cyan');
        
        try {
            // Verificar se o backend está rodando
            await this.verificarBackend();
            
            // Verificar autenticação
            await this.verificarAutenticacao();
            
            // Testar APIs de monitoramento
            await this.testarAPIsMonitoramento();
            
            // Verificar componentes do frontend
            await this.verificarComponentesFrontend();
            
            // Testar integração
            await this.testarIntegracao();
            
            // Relatório final
            this.gerarRelatorio();
            
        } catch (error) {
            log(`❌ ERRO CRÍTICO: ${error.message}`, 'red');
            this.testResults.errors.push({
                test: 'ERRO_CRITICO',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async verificarBackend() {
        log('🔍 Verificando backend...', 'blue');
        
        try {
            const response = await axios.get(`${API_BASE_URL}/health`, {
                timeout: 5000
            });
            
            if (response.status === 200) {
                log('✅ Backend está funcionando', 'green');
                this.testResults.passed++;
            } else {
                throw new Error(`Status inesperado: ${response.status}`);
            }
        } catch (error) {
            log(`❌ Backend não está acessível: ${error.message}`, 'red');
            this.testResults.failed++;
            this.testResults.errors.push({
                test: 'BACKEND_HEALTH',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
        
        this.testResults.total++;
    }

    async verificarAutenticacao() {
        log('🔐 Verificando autenticação...', 'blue');
        
        try {
            // Tentar fazer login como diretor
            const loginResponse = await axios.post(`${API_BASE_URL}/usuarios/login`, {
                email: 'diretor@loja.com',
                senha: '123456'
            });
            
            if (loginResponse.data.token) {
                this.token = loginResponse.data.token;
                log('✅ Autenticação realizada com sucesso', 'green');
                this.testResults.passed++;
            } else {
                throw new Error('Token não retornado');
            }
        } catch (error) {
            log(`❌ Falha na autenticação: ${error.message}`, 'red');
            this.testResults.failed++;
            this.testResults.errors.push({
                test: 'AUTENTICACAO',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
        
        this.testResults.total++;
    }

    async testarAPIsMonitoramento() {
        log('📊 Testando APIs de monitoramento...', 'blue');
        
        const endpoints = [
            { name: 'Status', url: '/monitoring/status' },
            { name: 'Métricas', url: '/monitoring/metrics' },
            { name: 'Histórico', url: '/monitoring/metrics/history' },
            { name: 'Alertas', url: '/monitoring/alerts' }
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await axios.get(`${API_BASE_URL}${endpoint.url}`, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    },
                    timeout: 5000
                });
                
                if (response.status === 200 && response.data.success) {
                    log(`  ✅ ${endpoint.name}: OK`, 'green');
                    this.testResults.passed++;
                } else {
                    throw new Error(`Resposta inválida: ${response.status}`);
                }
            } catch (error) {
                log(`  ❌ ${endpoint.name}: ${error.message}`, 'red');
                this.testResults.failed++;
                this.testResults.errors.push({
                    test: `API_${endpoint.name.toUpperCase()}`,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
            
            this.testResults.total++;
        }
    }

    async verificarComponentesFrontend() {
        log('⚛️ Verificando componentes do frontend...', 'blue');
        
        const componentes = [
            'src/services/monitoringService.js',
            'src/components/monitoring/DashboardMonitoramento.jsx',
            'src/components/monitoring/MetricasTempoReal.jsx',
            'src/components/monitoring/ControleServicos.jsx',
            'src/pages/Admin/PaginaDiretor.jsx',
            'src/styles/monitoring.css'
        ];
        
        for (const componente of componentes) {
            try {
                const filePath = path.join(__dirname, '..', 'frontend', componente);
                
                if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath, 'utf8');
                    
                    if (content.length > 0) {
                        log(`  ✅ ${componente}: OK`, 'green');
                        this.testResults.passed++;
                    } else {
                        throw new Error('Arquivo vazio');
                    }
                } else {
                    throw new Error('Arquivo não encontrado');
                }
            } catch (error) {
                log(`  ❌ ${componente}: ${error.message}`, 'red');
                this.testResults.failed++;
                this.testResults.errors.push({
                    test: `COMPONENTE_${componente.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
            
            this.testResults.total++;
        }
    }

    async testarIntegracao() {
        log('🔗 Testando integração...', 'blue');
        
        try {
            // Verificar se as dependências estão instaladas
            const packageJsonPath = path.join(__dirname, '..', 'frontend', 'package.json');
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            
            const dependenciasNecessarias = [
                'recharts',
                'react-chartjs-2',
                'chart.js',
                'axios'
            ];
            
            let dependenciasOK = true;
            
            for (const dep of dependenciasNecessarias) {
                if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
                    log(`  ❌ Dependência faltando: ${dep}`, 'red');
                    dependenciasOK = false;
                }
            }
            
            if (dependenciasOK) {
                log('  ✅ Dependências instaladas: OK', 'green');
                this.testResults.passed++;
            } else {
                throw new Error('Dependências faltando');
            }
            
        } catch (error) {
            log(`  ❌ Integração: ${error.message}`, 'red');
            this.testResults.failed++;
            this.testResults.errors.push({
                test: 'INTEGRACAO',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
        
        this.testResults.total++;
    }

    async gerarRelatorio() {
        log('\n📋 RELATÓRIO DE TESTES', 'magenta');
        log('=' .repeat(60), 'magenta');
        
        const successRate = Math.round((this.testResults.passed / this.testResults.total) * 100);
        
        log(`📊 Resumo dos Testes:`, 'cyan');
        log(`   Total de testes: ${this.testResults.total}`, 'blue');
        log(`   Passou: ${this.testResults.passed}`, 'green');
        log(`   Falhou: ${this.testResults.failed}`, 'red');
        log(`   Taxa de sucesso: ${successRate}%`, successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red');
        
        if (this.testResults.errors.length > 0) {
            log('\n❌ Erros encontrados:', 'red');
            this.testResults.errors.forEach((error, index) => {
                log(`   ${index + 1}. ${error.test}: ${error.error}`, 'red');
            });
        }
        
        // Salvar relatório
        const relatorio = {
            timestamp: new Date().toISOString(),
            dashboard: 'monitoramento',
            results: this.testResults,
            successRate,
            recommendations: this.gerarRecomendacoes(successRate)
        };
        
        const relatorioPath = path.join(__dirname, `teste_dashboard_monitoramento_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
        fs.writeFileSync(relatorioPath, JSON.stringify(relatorio, null, 2));
        
        log(`\n💾 Relatório salvo em: ${relatorioPath}`, 'cyan');
        
        // Status final
        if (successRate >= 90) {
            log('\n🎉 DASHBOARD DE MONITORAMENTO IMPLEMENTADO COM SUCESSO!', 'green');
            log('✅ Pronto para uso em produção', 'green');
        } else if (successRate >= 70) {
            log('\n⚠️  DASHBOARD PARCIALMENTE IMPLEMENTADO', 'yellow');
            log('🔧 Requer correções antes da produção', 'yellow');
        } else {
            log('\n❌ DASHBOARD COM PROBLEMAS CRÍTICOS', 'red');
            log('🚨 Não recomendado para uso em produção', 'red');
        }
    }

    gerarRecomendacoes(successRate) {
        const recomendacoes = [];
        
        if (successRate < 100) {
            recomendacoes.push('Corrigir erros encontrados nos testes');
        }
        
        if (this.testResults.errors.some(e => e.test.includes('BACKEND'))) {
            recomendacoes.push('Verificar se o backend está rodando na porta 3000');
        }
        
        if (this.testResults.errors.some(e => e.test.includes('AUTENTICACAO'))) {
            recomendacoes.push('Verificar credenciais de acesso do diretor');
        }
        
        if (this.testResults.errors.some(e => e.test.includes('COMPONENTE'))) {
            recomendacoes.push('Verificar se todos os componentes foram criados corretamente');
        }
        
        if (this.testResults.errors.some(e => e.test.includes('API'))) {
            recomendacoes.push('Verificar se as rotas de monitoramento estão funcionando');
        }
        
        recomendacoes.push('Testar o dashboard no navegador manualmente');
        recomendacoes.push('Verificar se as métricas estão sendo exibidas corretamente');
        
        return recomendacoes;
    }
}

// Executar teste se chamado diretamente
if (require.main === module) {
    const teste = new TesteDashboardMonitoramento();
    teste.executarTodos().catch(console.error);
}

module.exports = TesteDashboardMonitoramento;
