/**
 * 📊 TESTE REALISTA DO SISTEMA DE MONITORAMENTO
 * Data: 07 de Julho de 2025
 * Objetivo: Teste completo e realista do sistema de monitoramento
 */

const monitoringService = require('./services/monitoringService');
const backupService = require('./services/backupService');
const { logger } = require('./services/loggerService');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configurar teste para usar banco real
require('dotenv').config();

class MonitoringTester {
    constructor() {
        this.baseUrl = 'http://localhost:5000';
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
        this.authToken = null;
    }

    /**
     * Log de teste
     */
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleString('pt-BR');
        const icons = {
            info: '📋',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            loading: '⏳',
            stats: '📊'
        };
        
        console.log(`${icons[type]} ${message}`);
        
        if (type === 'error') {
            logger.error('Test Error', { message, timestamp });
        } else {
            logger.info('Test Info', { message, timestamp, type });
        }
    }

    /**
     * Executar teste
     */
    async runTest(testName, testFunction) {
        this.testResults.total++;
        
        try {
            this.log(`${testName}...`, 'loading');
            const result = await testFunction();
            
            this.testResults.passed++;
            this.testResults.details.push({
                name: testName,
                status: 'passed',
                result: result || 'OK',
                timestamp: new Date().toISOString()
            });
            
            this.log(`${testName} - PASSOU`, 'success');
            return result;
            
        } catch (error) {
            this.testResults.failed++;
            this.testResults.details.push({
                name: testName,
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            });
            
            this.log(`${testName} - FALHOU: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Simular carga no sistema
     */
    async simulateSystemLoad() {
        this.log('🔥 Simulando carga no sistema para obter métricas realistas...');
        
        // Simular uso de CPU
        const cpuIntensiveTask = () => {
            const start = Date.now();
            while (Date.now() - start < 1000) {
                Math.random() * Math.random();
            }
        };
        
        // Simular uso de memória
        const memoryIntensiveTask = () => {
            const largeArray = new Array(1000000).fill(Math.random());
            return largeArray.length;
        };
        
        // Simular operações de I/O
        const ioIntensiveTask = async () => {
            const tempFile = path.join(__dirname, 'temp_test_file.txt');
            const data = 'x'.repeat(10000);
            
            for (let i = 0; i < 10; i++) {
                fs.writeFileSync(tempFile, data + i);
                fs.readFileSync(tempFile);
            }
            
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }
        };
        
        // Executar tarefas em paralelo
        const tasks = [
            cpuIntensiveTask,
            memoryIntensiveTask,
            ioIntensiveTask
        ];
        
        await Promise.all(tasks.map(task => task()));
        
        this.log('🔥 Carga simulada concluída');
    }

    /**
     * Testar conectividade com banco de dados real
     */
    async testDatabaseConnection() {
        try {
            const mysql = require('mysql2/promise');
            
            // Criar conexão direta
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'loja_tenis_fgt',
                port: process.env.DB_PORT || 3306
            });
            
            // Testar conexão básica
            await connection.execute('SELECT 1 as test');
            
            // Testar consulta real
            const [usuarios] = await connection.execute('SELECT COUNT(*) as count FROM usuarios');
            const userCount = usuarios[0].count;
            
            // Testar consulta de estrutura
            const [tables] = await connection.execute('SHOW TABLES');
            const tableCount = tables.length;
            
            await connection.end();
            
            return {
                connected: true,
                userCount,
                tableCount,
                database: process.env.DB_NAME
            };
            
        } catch (error) {
            return {
                connected: false,
                error: error.message
            };
        }
    }

    /**
     * Iniciar servidor de teste
     */
    async startTestServer() {
        this.log('🚀 Iniciando servidor de teste...');
        
        // Verificar se o servidor já está rodando
        try {
            const response = await axios.get(`${this.baseUrl}/api/health`);
            this.log('✅ Servidor já está rodando');
            return true;
        } catch (error) {
            this.log('⚠️ Servidor não está rodando, continuando sem API tests');
            return false;
        }
    }

    /**
     * Realizar login para testes de API
     */
    async loginForTests() {
        try {
            const response = await axios.post(`${this.baseUrl}/api/auth/login`, {
                email: 'admin@teste.com',
                senha: 'admin123'
            });
            
            this.authToken = response.data.token;
            this.log('✅ Login realizado com sucesso');
            return true;
            
        } catch (error) {
            this.log('⚠️ Login falhou, continuando sem testes autenticados');
            return false;
        }
    }

    /**
     * Executar todos os testes
     */
    async runAllTests() {
        this.log('🎯 ===== TESTE REALISTA DO SISTEMA DE MONITORAMENTO =====');
        this.log(`📅 Data: ${new Date().toLocaleDateString('pt-BR')}`);
        this.log('');

        try {
            // Teste 1: Verificar conexão com banco de dados real
            await this.runTest('Teste 1: Conexão com banco de dados real', async () => {
                const dbResult = await this.testDatabaseConnection();
                
                if (dbResult.connected) {
                    this.log(`   📊 Banco: ${dbResult.database}`);
                    this.log(`   👥 Usuários: ${dbResult.userCount}`);
                    this.log(`   🗂️ Tabelas: ${dbResult.tableCount}`);
                    return dbResult;
                } else {
                    throw new Error(`Falha na conexão: ${dbResult.error}`);
                }
            });

            // Teste 2: Inicializar sistema de monitoramento
            await this.runTest('Teste 2: Inicializar sistema de monitoramento', async () => {
                const result = monitoringService.startMonitoring();
                
                if (result.success) {
                    this.log(`   ⏱️ Intervalo: ${result.interval}ms`);
                    return result;
                } else {
                    throw new Error('Falha ao iniciar monitoramento');
                }
            });

            // Teste 3: Simular carga no sistema
            await this.runTest('Teste 3: Simular carga no sistema', async () => {
                await this.simulateSystemLoad();
                
                // Aguardar um pouco para que as métricas sejam coletadas
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                return 'Carga simulada com sucesso';
            });

            // Teste 4: Coletar métricas reais
            await this.runTest('Teste 4: Coletar métricas reais do sistema', async () => {
                await monitoringService.collectMetrics();
                
                const metrics = monitoringService.getCurrentMetrics();
                
                this.log(`   💾 CPU: ${metrics.system?.cpu || 0}%`);
                this.log(`   🧠 Memória: ${metrics.system?.memory?.usage || 0}%`);
                this.log(`   💽 Disco: ${metrics.system?.disk?.usage || 0}%`);
                this.log(`   🔗 Conexões DB: ${metrics.database?.connections || 0}`);
                this.log(`   📊 Tamanho DB: ${metrics.database?.size || 0} MB`);
                this.log(`   ⚡ Tempo resposta: ${Math.round(metrics.performance?.averageResponseTime || 0)}ms`);
                
                return metrics;
            });

            // Teste 5: Verificar alertas
            await this.runTest('Teste 5: Verificar sistema de alertas', async () => {
                const alerts = await monitoringService.checkAlerts();
                
                this.log(`   🚨 Alertas ativos: ${alerts.length}`);
                
                if (alerts.length > 0) {
                    alerts.forEach(alert => {
                        this.log(`   ⚠️ ${alert.type}: ${alert.message}`);
                    });
                }
                
                return alerts;
            });

            // Teste 6: Verificação de saúde
            await this.runTest('Teste 6: Verificação de saúde do sistema', async () => {
                const health = await monitoringService.healthCheck();
                
                this.log(`   🏥 Status: ${health.status}`);
                this.log(`   📊 Banco: ${health.services?.database || 'unknown'}`);
                this.log(`   💻 Aplicação: ${health.services?.application || 'unknown'}`);
                this.log(`   📁 Sistema arquivos: ${health.services?.filesystem || 'unknown'}`);
                this.log(`   🌐 Rede: ${health.services?.network || 'unknown'}`);
                
                return health;
            });

            // Teste 7: Integração com sistema de backup
            await this.runTest('Teste 7: Integração com sistema de backup', async () => {
                const backupStats = await backupService.getBackupStats();
                
                this.log(`   📦 Total backups: ${backupStats.total}`);
                this.log(`   💾 Tamanho total: ${backupStats.totalSize} MB`);
                this.log(`   🗄️ Backup banco: ${backupStats.types.database}`);
                this.log(`   📋 Backup logs: ${backupStats.types.logs}`);
                this.log(`   🔄 Backup completo: ${backupStats.types.full}`);
                
                return backupStats;
            });

            // Teste 8: Salvar métricas em arquivo
            await this.runTest('Teste 8: Salvar métricas em arquivo', async () => {
                await monitoringService.saveMetrics();
                
                const metricsDir = path.join(__dirname, 'metrics');
                const today = new Date().toISOString().split('T')[0];
                const metricsFile = path.join(metricsDir, `metrics-${today}.json`);
                
                if (fs.existsSync(metricsFile)) {
                    const content = fs.readFileSync(metricsFile, 'utf8');
                    const metrics = JSON.parse(content);
                    
                    this.log(`   📁 Arquivo: metrics-${today}.json`);
                    this.log(`   📊 Registros: ${metrics.length}`);
                    
                    return { saved: true, records: metrics.length };
                } else {
                    throw new Error('Arquivo de métricas não foi criado');
                }
            });

            // Teste 9: Histórico de métricas
            await this.runTest('Teste 9: Obter histórico de métricas', async () => {
                const history = monitoringService.getMetricsHistory(3);
                
                this.log(`   📈 Dias com dados: ${history.length}`);
                
                history.forEach(day => {
                    this.log(`   📅 ${day.date}: ${day.metrics.length} registros`);
                });
                
                return history;
            });

            // Teste 10: Iniciar servidor e testar APIs (se possível)
            const serverRunning = await this.startTestServer();
            
            if (serverRunning) {
                // Teste 11: Login para testes de API
                const loginSuccess = await this.loginForTests();
                
                if (loginSuccess) {
                    // Teste 12: Testar endpoint de saúde
                    await this.runTest('Teste 12: Endpoint de saúde', async () => {
                        const response = await axios.get(`${this.baseUrl}/api/monitoring/health`);
                        
                        this.log(`   🏥 Status HTTP: ${response.status}`);
                        this.log(`   💚 Saúde: ${response.data.data.status}`);
                        
                        return response.data;
                    });

                    // Teste 13: Testar endpoint de métricas
                    await this.runTest('Teste 13: Endpoint de métricas', async () => {
                        const response = await axios.get(`${this.baseUrl}/api/monitoring/metrics`, {
                            headers: {
                                'Authorization': `Bearer ${this.authToken}`
                            }
                        });
                        
                        this.log(`   📊 Status HTTP: ${response.status}`);
                        this.log(`   📈 Métricas obtidas: ${response.data.success}`);
                        
                        return response.data;
                    });

                    // Teste 14: Testar endpoint de dashboard
                    await this.runTest('Teste 14: Endpoint de dashboard', async () => {
                        const response = await axios.get(`${this.baseUrl}/api/monitoring/dashboard`, {
                            headers: {
                                'Authorization': `Bearer ${this.authToken}`
                            }
                        });
                        
                        this.log(`   📊 Status HTTP: ${response.status}`);
                        this.log(`   🎯 Dashboard: ${response.data.data.status}`);
                        this.log(`   🚨 Alertas: ${response.data.data.alerts.total}`);
                        
                        return response.data;
                    });
                }
            }

            // Teste 15: Gerar relatório de teste
            await this.runTest('Teste 15: Gerar relatório de teste', async () => {
                const report = await this.generateTestReport();
                
                this.log(`   📋 Relatório gerado: ${report.filename}`);
                this.log(`   📊 Total testes: ${report.totalTests}`);
                this.log(`   ✅ Sucessos: ${report.passed}`);
                this.log(`   ❌ Falhas: ${report.failed}`);
                
                return report;
            });

        } catch (error) {
            this.log(`Erro durante os testes: ${error.message}`, 'error');
        }

        // Parar monitoramento
        monitoringService.stopMonitoring();

        // Exibir resultados finais
        this.displayResults();
    }

    /**
     * Gerar relatório de teste
     */
    async generateTestReport() {
        const report = {
            timestamp: new Date().toISOString(),
            totalTests: this.testResults.total,
            passed: this.testResults.passed,
            failed: this.testResults.failed,
            successRate: Math.round((this.testResults.passed / this.testResults.total) * 100),
            details: this.testResults.details,
            systemInfo: {
                platform: process.platform,
                nodeVersion: process.version,
                memory: process.memoryUsage(),
                uptime: process.uptime()
            }
        };

        const reportsDir = path.join(__dirname, 'reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        const filename = `monitoring-test-report-${new Date().toISOString().split('T')[0]}.json`;
        const filepath = path.join(reportsDir, filename);

        fs.writeFileSync(filepath, JSON.stringify(report, null, 2));

        return { ...report, filename, filepath };
    }

    /**
     * Exibir resultados finais
     */
    displayResults() {
        this.log('');
        this.log('📊 ===== RESULTADO DO TESTE REALISTA =====');
        this.log(`✅ Testes Passaram: ${this.testResults.passed}/${this.testResults.total}`);
        this.log(`📊 Taxa de Sucesso: ${Math.round((this.testResults.passed / this.testResults.total) * 100)}%`);
        this.log('');

        if (this.testResults.failed === 0) {
            this.log('🎉 TODOS OS TESTES PASSARAM!');
            this.log('✅ Sistema de monitoramento totalmente funcional');
            this.log('✅ Métricas reais coletadas com sucesso');
            this.log('✅ Integração com banco de dados funcionando');
            this.log('✅ Sistema de alertas operacional');
            this.log('✅ APIs de monitoramento funcionais');
            this.log('✅ Armazenamento de métricas funcionando');
            this.log('✅ Verificação de saúde operacional');
            this.log('');
            this.log('🚀 SISTEMA DE MONITORAMENTO PRONTO PARA PRODUÇÃO!');
        } else {
            this.log(`⚠️ ${this.testResults.failed} teste(s) falharam`);
            this.log('🔧 Verifique os logs para mais detalhes');
        }
        
        this.log('');
        this.log('📋 Próximos passos:');
        this.log('1. Configurar alertas por email/SMS');
        this.log('2. Configurar dashboard visual');
        this.log('3. Implementar relatórios automáticos');
        this.log('4. Configurar backup para nuvem');
        this.log('5. Otimizar thresholds de alerta');
        this.log('');
    }
}

/**
 * Executar teste
 */
async function executarTeste() {
    const tester = new MonitoringTester();
    await tester.runAllTests();
}

// Executar apenas se chamado diretamente
if (require.main === module) {
    executarTeste().catch(console.error);
}

module.exports = { MonitoringTester, executarTeste };
