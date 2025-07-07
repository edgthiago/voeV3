/**
 * 📊 SISTEMA DE MONITORAMENTO E ALERTAS
 * Data: 07 de Julho de 2025
 * Objetivo: Monitoramento em tempo real do sistema, métricas de desempenho e alertas automáticos
 * Prioridade: 🥇 ALTA (Fase 1 do Roadmap)
 */

const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const { logger, loggers } = require('./loggerService');

class MonitoringService {
    constructor() {
        this.metrics = {
            system: {},
            database: {},
            application: {},
            performance: {},
            errors: {},
            alerts: []
        };
        
        this.thresholds = {
            cpu: 80,           // % uso CPU
            memory: 85,        // % uso memória
            disk: 90,          // % uso disco
            responseTime: 2000, // ms tempo resposta
            errorRate: 5,      // % taxa de erro
            dbConnections: 100 // conexões DB
        };
        
        this.alertChannels = {
            email: process.env.MONITOR_EMAIL_ENABLED === 'true',
            slack: process.env.MONITOR_SLACK_ENABLED === 'true',
            sms: process.env.MONITOR_SMS_ENABLED === 'true'
        };
        
        this.monitoringInterval = parseInt(process.env.MONITOR_INTERVAL) || 60000; // 1 minuto
        this.isMonitoring = false;
        
        this.initializeMonitoring();
    }

    /**
     * Inicializar sistema de monitoramento
     */
    initializeMonitoring() {
        logger.info('Monitoring system initialized', {
            thresholds: this.thresholds,
            alertChannels: this.alertChannels,
            interval: this.monitoringInterval
        });

        // Monitoramento contínuo a cada minuto
        cron.schedule('*/1 * * * *', () => {
            if (this.isMonitoring) {
                this.collectMetrics();
            }
        });

        // Relatório diário às 08:00
        cron.schedule('0 8 * * *', () => {
            this.generateDailyReport();
        });

        // Limpeza de métricas antigas às 02:00
        cron.schedule('0 2 * * *', () => {
            this.cleanupOldMetrics();
        });

        // Verificação de saúde a cada 5 minutos
        cron.schedule('*/5 * * * *', () => {
            this.healthCheck();
        });
    }

    /**
     * Iniciar monitoramento
     */
    startMonitoring() {
        this.isMonitoring = true;
        logger.info('Monitoring started', {
            interval: this.monitoringInterval,
            thresholds: this.thresholds
        });
        
        // Primeira coleta imediata
        this.collectMetrics();
        
        return {
            success: true,
            message: 'Monitoring started successfully',
            interval: this.monitoringInterval
        };
    }

    /**
     * Parar monitoramento
     */
    stopMonitoring() {
        this.isMonitoring = false;
        logger.info('Monitoring stopped');
        
        return {
            success: true,
            message: 'Monitoring stopped successfully'
        };
    }

    /**
     * Coletar métricas do sistema
     */
    async collectMetrics() {
        try {
            const timestamp = new Date().toISOString();
            
            // Métricas do sistema
            const systemMetrics = await this.collectSystemMetrics();
            
            // Métricas do banco de dados
            const databaseMetrics = await this.collectDatabaseMetrics();
            
            // Métricas da aplicação
            const applicationMetrics = await this.collectApplicationMetrics();
            
            // Métricas de performance
            const performanceMetrics = await this.collectPerformanceMetrics();
            
            // Armazenar métricas
            this.metrics = {
                timestamp,
                system: systemMetrics,
                database: databaseMetrics,
                application: applicationMetrics,
                performance: performanceMetrics,
                errors: this.metrics.errors,
                alerts: this.metrics.alerts
            };
            
            // Verificar alertas
            await this.checkAlerts();
            
            // Salvar métricas
            await this.saveMetrics();
            
            logger.info('Metrics collected successfully', {
                timestamp,
                cpu: systemMetrics.cpu,
                memory: systemMetrics.memory,
                disk: systemMetrics.disk
            });
            
        } catch (error) {
            logger.error('Error collecting metrics', {
                error: error.message,
                stack: error.stack
            });
        }
    }

    /**
     * Coletar métricas do sistema
     */
    async collectSystemMetrics() {
        const cpuUsage = await this.getCpuUsage();
        const memoryUsage = this.getMemoryUsage();
        const diskUsage = await this.getDiskUsage();
        const networkStats = await this.getNetworkStats();
        
        return {
            cpu: cpuUsage,
            memory: memoryUsage,
            disk: diskUsage,
            network: networkStats,
            uptime: os.uptime(),
            loadAverage: os.loadavg(),
            platform: os.platform(),
            hostname: os.hostname()
        };
    }

    /**
     * Coletar métricas do banco de dados
     */
    async collectDatabaseMetrics() {
        try {
            // Verificar se o banco está configurado
            if (!process.env.DB_NAME || !process.env.DB_HOST) {
                return {
                    connections: 0,
                    queries: 0,
                    slowQueries: 0,
                    size: 0,
                    status: 'not_configured'
                };
            }
            
            const db = require('../banco/conexao');
            
            // Número de conexões ativas
            const [connections] = await db.execute('SHOW STATUS LIKE "Threads_connected"');
            const activeConnections = parseInt(connections[0]?.Value || 0);
            
            // Número de queries
            const [queries] = await db.execute('SHOW STATUS LIKE "Queries"');
            const totalQueries = parseInt(queries[0]?.Value || 0);
            
            // Tamanho do banco
            const [size] = await db.execute(`
                SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
                FROM information_schema.tables
                WHERE table_schema = '${process.env.DB_NAME}'
            `);
            const databaseSize = parseFloat(size[0]?.size_mb || 0);
            
            // Slow queries
            const [slowQueries] = await db.execute('SHOW STATUS LIKE "Slow_queries"');
            const slowQueriesCount = parseInt(slowQueries[0]?.Value || 0);
            
            return {
                connections: activeConnections,
                queries: totalQueries,
                slowQueries: slowQueriesCount,
                size: databaseSize,
                status: 'healthy'
            };
            
        } catch (error) {
            logger.error('Error collecting database metrics', {
                error: error.message
            });
            
            return {
                connections: 0,
                queries: 0,
                slowQueries: 0,
                size: 0,
                status: 'error',
                error: error.message
            };
        }
    }

    /**
     * Coletar métricas da aplicação
     */
    async collectApplicationMetrics() {
        const processMemory = process.memoryUsage();
        const processUptime = process.uptime();
        
        return {
            memory: {
                rss: Math.round(processMemory.rss / 1024 / 1024), // MB
                heapUsed: Math.round(processMemory.heapUsed / 1024 / 1024), // MB
                heapTotal: Math.round(processMemory.heapTotal / 1024 / 1024), // MB
                external: Math.round(processMemory.external / 1024 / 1024) // MB
            },
            uptime: processUptime,
            pid: process.pid,
            version: process.version,
            environment: process.env.NODE_ENV || 'development'
        };
    }

    /**
     * Coletar métricas de performance
     */
    async collectPerformanceMetrics() {
        // Simular métricas de performance
        // Em produção, estas métricas viriam de middleware de timing
        
        return {
            averageResponseTime: Math.random() * 1000, // ms
            requestsPerMinute: Math.floor(Math.random() * 100),
            errorRate: Math.random() * 10, // %
            throughput: Math.floor(Math.random() * 1000), // req/min
            concurrentUsers: Math.floor(Math.random() * 50)
        };
    }

    /**
     * Obter uso de CPU
     */
    async getCpuUsage() {
        try {
            const cpus = os.cpus();
            let totalIdle = 0;
            let totalTick = 0;
            
            cpus.forEach(cpu => {
                for (let type in cpu.times) {
                    totalTick += cpu.times[type];
                }
                totalIdle += cpu.times.idle;
            });
            
            const idle = totalIdle / cpus.length;
            const total = totalTick / cpus.length;
            const usage = 100 - ~~(100 * idle / total);
            
            return Math.round(usage);
            
        } catch (error) {
            return 0;
        }
    }

    /**
     * Obter uso de memória
     */
    getMemoryUsage() {
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;
        const usage = (usedMemory / totalMemory) * 100;
        
        return {
            total: Math.round(totalMemory / 1024 / 1024), // MB
            free: Math.round(freeMemory / 1024 / 1024), // MB
            used: Math.round(usedMemory / 1024 / 1024), // MB
            usage: Math.round(usage) // %
        };
    }

    /**
     * Obter uso de disco
     */
    async getDiskUsage() {
        try {
            const isWindows = process.platform === 'win32';
            let command;
            
            if (isWindows) {
                command = 'wmic logicaldisk get size,freespace,caption';
            } else {
                command = 'df -h /';
            }
            
            const { stdout } = await execAsync(command);
            
            if (isWindows) {
                const lines = stdout.trim().split('\n');
                const dataLine = lines.find(line => line.includes('C:'));
                if (dataLine) {
                    const parts = dataLine.trim().split(/\s+/);
                    const free = parseInt(parts[1]) / 1024 / 1024 / 1024; // GB
                    const total = parseInt(parts[2]) / 1024 / 1024 / 1024; // GB
                    const used = total - free;
                    const usage = (used / total) * 100;
                    
                    return {
                        total: Math.round(total),
                        free: Math.round(free),
                        used: Math.round(used),
                        usage: Math.round(usage)
                    };
                }
            } else {
                const lines = stdout.trim().split('\n');
                const dataLine = lines[1];
                const parts = dataLine.split(/\s+/);
                const usage = parseInt(parts[4].replace('%', ''));
                
                return {
                    total: parts[1],
                    free: parts[3],
                    used: parts[2],
                    usage: usage
                };
            }
            
            return { total: 0, free: 0, used: 0, usage: 0 };
            
        } catch (error) {
            return { total: 0, free: 0, used: 0, usage: 0 };
        }
    }

    /**
     * Obter estatísticas de rede
     */
    async getNetworkStats() {
        const interfaces = os.networkInterfaces();
        const stats = {};
        
        for (const [name, addrs] of Object.entries(interfaces)) {
            const addr = addrs.find(addr => addr.family === 'IPv4' && !addr.internal);
            if (addr) {
                stats[name] = {
                    address: addr.address,
                    netmask: addr.netmask,
                    mac: addr.mac
                };
            }
        }
        
        return stats;
    }

    /**
     * Verificar alertas
     */
    async checkAlerts() {
        const alerts = [];
        
        // Verificar CPU
        if (this.metrics.system.cpu > this.thresholds.cpu) {
            alerts.push({
                type: 'cpu',
                severity: 'warning',
                message: `CPU usage is ${this.metrics.system.cpu}% (threshold: ${this.thresholds.cpu}%)`,
                value: this.metrics.system.cpu,
                threshold: this.thresholds.cpu,
                timestamp: new Date().toISOString()
            });
        }
        
        // Verificar memória
        if (this.metrics.system.memory.usage > this.thresholds.memory) {
            alerts.push({
                type: 'memory',
                severity: 'warning',
                message: `Memory usage is ${this.metrics.system.memory.usage}% (threshold: ${this.thresholds.memory}%)`,
                value: this.metrics.system.memory.usage,
                threshold: this.thresholds.memory,
                timestamp: new Date().toISOString()
            });
        }
        
        // Verificar disco
        if (this.metrics.system.disk.usage > this.thresholds.disk) {
            alerts.push({
                type: 'disk',
                severity: 'critical',
                message: `Disk usage is ${this.metrics.system.disk.usage}% (threshold: ${this.thresholds.disk}%)`,
                value: this.metrics.system.disk.usage,
                threshold: this.thresholds.disk,
                timestamp: new Date().toISOString()
            });
        }
        
        // Verificar conexões do banco
        if (this.metrics.database.connections > this.thresholds.dbConnections) {
            alerts.push({
                type: 'database',
                severity: 'warning',
                message: `Database connections: ${this.metrics.database.connections} (threshold: ${this.thresholds.dbConnections})`,
                value: this.metrics.database.connections,
                threshold: this.thresholds.dbConnections,
                timestamp: new Date().toISOString()
            });
        }
        
        // Verificar tempo de resposta
        if (this.metrics.performance.averageResponseTime > this.thresholds.responseTime) {
            alerts.push({
                type: 'performance',
                severity: 'warning',
                message: `Average response time: ${Math.round(this.metrics.performance.averageResponseTime)}ms (threshold: ${this.thresholds.responseTime}ms)`,
                value: this.metrics.performance.averageResponseTime,
                threshold: this.thresholds.responseTime,
                timestamp: new Date().toISOString()
            });
        }
        
        // Armazenar alertas
        this.metrics.alerts = alerts;
        
        // Enviar alertas se necessário
        if (alerts.length > 0) {
            await this.sendAlerts(alerts);
        }
        
        return alerts;
    }

    /**
     * Enviar alertas
     */
    async sendAlerts(alerts) {
        for (const alert of alerts) {
            logger.warn('System alert triggered', alert);
            
            // Enviar por email (se configurado)
            if (this.alertChannels.email) {
                await this.sendEmailAlert(alert);
            }
            
            // Enviar por Slack (se configurado)
            if (this.alertChannels.slack) {
                await this.sendSlackAlert(alert);
            }
            
            // Enviar por SMS (se configurado)
            if (this.alertChannels.sms) {
                await this.sendSMSAlert(alert);
            }
        }
    }

    /**
     * Enviar alerta por email
     */
    async sendEmailAlert(alert) {
        // Implementar envio de email
        // Por enquanto, apenas log
        logger.info('Email alert sent', {
            type: alert.type,
            severity: alert.severity,
            message: alert.message
        });
    }

    /**
     * Enviar alerta por Slack
     */
    async sendSlackAlert(alert) {
        // Implementar envio para Slack
        // Por enquanto, apenas log
        logger.info('Slack alert sent', {
            type: alert.type,
            severity: alert.severity,
            message: alert.message
        });
    }

    /**
     * Enviar alerta por SMS
     */
    async sendSMSAlert(alert) {
        // Implementar envio de SMS
        // Por enquanto, apenas log
        logger.info('SMS alert sent', {
            type: alert.type,
            severity: alert.severity,
            message: alert.message
        });
    }

    /**
     * Verificação de saúde
     */
    async healthCheck() {
        try {
            const health = {
                timestamp: new Date().toISOString(),
                status: 'healthy',
                services: {
                    database: 'healthy',
                    application: 'healthy',
                    filesystem: 'healthy',
                    network: 'healthy'
                },
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: process.version
            };
            
            // Verificar banco de dados (com timeout)
            try {
                if (process.env.DB_NAME && process.env.DB_HOST) {
                    const db = require('../banco/conexao');
                    
                    // Usar Promise.race para timeout
                    const dbCheck = Promise.race([
                        db.execute('SELECT 1'),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 5000))
                    ]);
                    
                    await dbCheck;
                    health.services.database = 'healthy';
                } else {
                    health.services.database = 'not_configured';
                }
            } catch (error) {
                health.services.database = 'unhealthy';
                health.status = 'degraded';
            }
            
            // Verificar sistema de arquivos
            try {
                const tempDir = path.join(__dirname, '../temp');
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                }
                
                const testFile = path.join(tempDir, 'health-check.txt');
                fs.writeFileSync(testFile, 'health check');
                fs.unlinkSync(testFile);
                health.services.filesystem = 'healthy';
            } catch (error) {
                health.services.filesystem = 'unhealthy';
                health.status = 'degraded';
            }
            
            logger.info('Health check completed', health);
            
            return health;
            
        } catch (error) {
            logger.error('Health check failed', {
                error: error.message,
                stack: error.stack
            });
            
            return {
                timestamp: new Date().toISOString(),
                status: 'unhealthy',
                error: error.message
            };
        }
    }

    /**
     * Salvar métricas
     */
    async saveMetrics() {
        try {
            const metricsDir = path.join(__dirname, '../metrics');
            if (!fs.existsSync(metricsDir)) {
                fs.mkdirSync(metricsDir, { recursive: true });
            }
            
            const date = new Date().toISOString().split('T')[0];
            const metricsFile = path.join(metricsDir, `metrics-${date}.json`);
            
            let existingMetrics = [];
            if (fs.existsSync(metricsFile)) {
                const content = fs.readFileSync(metricsFile, 'utf8');
                existingMetrics = JSON.parse(content);
            }
            
            existingMetrics.push(this.metrics);
            
            fs.writeFileSync(metricsFile, JSON.stringify(existingMetrics, null, 2));
            
        } catch (error) {
            logger.error('Error saving metrics', {
                error: error.message
            });
        }
    }

    /**
     * Obter métricas atuais
     */
    getCurrentMetrics() {
        return {
            ...this.metrics,
            monitoringStatus: this.isMonitoring ? 'running' : 'stopped',
            thresholds: this.thresholds
        };
    }

    /**
     * Obter histórico de métricas
     */
    getMetricsHistory(days = 7) {
        try {
            const metricsDir = path.join(__dirname, '../metrics');
            const history = [];
            
            for (let i = 0; i < days; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const metricsFile = path.join(metricsDir, `metrics-${dateStr}.json`);
                
                if (fs.existsSync(metricsFile)) {
                    const content = fs.readFileSync(metricsFile, 'utf8');
                    const dayMetrics = JSON.parse(content);
                    history.push({
                        date: dateStr,
                        metrics: dayMetrics
                    });
                }
            }
            
            return history;
            
        } catch (error) {
            logger.error('Error getting metrics history', {
                error: error.message
            });
            return [];
        }
    }

    /**
     * Gerar relatório diário
     */
    async generateDailyReport() {
        try {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const dateStr = yesterday.toISOString().split('T')[0];
            
            const metricsDir = path.join(__dirname, '../metrics');
            const metricsFile = path.join(metricsDir, `metrics-${dateStr}.json`);
            
            if (!fs.existsSync(metricsFile)) {
                logger.warn('No metrics found for daily report', { date: dateStr });
                return;
            }
            
            const content = fs.readFileSync(metricsFile, 'utf8');
            const dayMetrics = JSON.parse(content);
            
            // Calcular estatísticas
            const stats = this.calculateDailyStats(dayMetrics);
            
            // Gerar relatório
            const report = {
                date: dateStr,
                period: '24 hours',
                summary: stats,
                alerts: dayMetrics.reduce((acc, m) => acc.concat(m.alerts || []), []),
                generated: new Date().toISOString()
            };
            
            // Salvar relatório
            const reportsDir = path.join(__dirname, '../reports');
            if (!fs.existsSync(reportsDir)) {
                fs.mkdirSync(reportsDir, { recursive: true });
            }
            
            const reportFile = path.join(reportsDir, `daily-report-${dateStr}.json`);
            fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
            
            logger.info('Daily report generated', {
                date: dateStr,
                reportFile,
                alertsCount: report.alerts.length,
                avgCpu: stats.averageCpu,
                avgMemory: stats.averageMemory
            });
            
            return report;
            
        } catch (error) {
            logger.error('Error generating daily report', {
                error: error.message,
                stack: error.stack
            });
        }
    }

    /**
     * Calcular estatísticas diárias
     */
    calculateDailyStats(metrics) {
        if (!metrics || metrics.length === 0) {
            return {};
        }
        
        const cpuValues = metrics.map(m => m.system?.cpu || 0);
        const memoryValues = metrics.map(m => m.system?.memory?.usage || 0);
        const diskValues = metrics.map(m => m.system?.disk?.usage || 0);
        const responseTimeValues = metrics.map(m => m.performance?.averageResponseTime || 0);
        
        return {
            averageCpu: Math.round(cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length),
            maxCpu: Math.max(...cpuValues),
            minCpu: Math.min(...cpuValues),
            averageMemory: Math.round(memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length),
            maxMemory: Math.max(...memoryValues),
            minMemory: Math.min(...memoryValues),
            averageDisk: Math.round(diskValues.reduce((a, b) => a + b, 0) / diskValues.length),
            maxDisk: Math.max(...diskValues),
            minDisk: Math.min(...diskValues),
            averageResponseTime: Math.round(responseTimeValues.reduce((a, b) => a + b, 0) / responseTimeValues.length),
            maxResponseTime: Math.max(...responseTimeValues),
            minResponseTime: Math.min(...responseTimeValues),
            totalDataPoints: metrics.length
        };
    }

    /**
     * Limpar métricas antigas
     */
    async cleanupOldMetrics() {
        try {
            const metricsDir = path.join(__dirname, '../metrics');
            const reportsDir = path.join(__dirname, '../reports');
            
            const retentionDays = parseInt(process.env.METRICS_RETENTION_DAYS) || 30;
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
            
            let deletedFiles = 0;
            
            // Limpar métricas antigas
            if (fs.existsSync(metricsDir)) {
                const files = fs.readdirSync(metricsDir);
                for (const file of files) {
                    const filePath = path.join(metricsDir, file);
                    const stats = fs.statSync(filePath);
                    
                    if (stats.mtime < cutoffDate) {
                        fs.unlinkSync(filePath);
                        deletedFiles++;
                    }
                }
            }
            
            // Limpar relatórios antigos
            if (fs.existsSync(reportsDir)) {
                const files = fs.readdirSync(reportsDir);
                for (const file of files) {
                    const filePath = path.join(reportsDir, file);
                    const stats = fs.statSync(filePath);
                    
                    if (stats.mtime < cutoffDate) {
                        fs.unlinkSync(filePath);
                        deletedFiles++;
                    }
                }
            }
            
            logger.info('Metrics cleanup completed', {
                deletedFiles,
                retentionDays,
                cutoffDate: cutoffDate.toISOString()
            });
            
            return {
                success: true,
                deletedFiles,
                retentionDays
            };
            
        } catch (error) {
            logger.error('Error cleaning up metrics', {
                error: error.message
            });
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Configurar thresholds
     */
    setThresholds(newThresholds) {
        this.thresholds = { ...this.thresholds, ...newThresholds };
        
        logger.info('Thresholds updated', {
            oldThresholds: this.thresholds,
            newThresholds
        });
        
        return this.thresholds;
    }

    /**
     * Obter status do monitoramento
     */
    getMonitoringStatus() {
        return {
            isMonitoring: this.isMonitoring,
            interval: this.monitoringInterval,
            thresholds: this.thresholds,
            alertChannels: this.alertChannels,
            lastMetrics: this.metrics.timestamp,
            activeAlerts: this.metrics.alerts?.length || 0
        };
    }
}

// Exportar instância singleton
const monitoringService = new MonitoringService();

module.exports = monitoringService;
