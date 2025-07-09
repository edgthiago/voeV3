/**
 * 📊 ROTAS SIMPLIFICADAS DE MONITORAMENTO
 * Data: 07 de Julho de 2025
 * Objetivo: Versão simplificada para testes
 */

const express = require('express');
const router = express.Router();

/**
 * @route GET /api/monitoring/status
 * @desc Obter status básico do sistema
 * @access Public (para testes)
 */
router.get('/status', async (req, res) => {
    try {
        const status = {
            system: {
                status: 'running',
                uptime: process.uptime(),
                cpuUsage: Math.random() * 100,
                memoryUsage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100,
                diskUsage: Math.random() * 100
            },
            timestamp: new Date().toISOString()
        };
        
        res.json({
            success: true,
            data: status,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao obter status do monitoramento',
            error: error.message
        });
    }
});

/**
 * @route GET /api/monitoring/metrics
 * @desc Obter métricas atuais do sistema
 * @access Public (para testes)
 */
router.get('/metrics', async (req, res) => {
    try {
        const metrics = {
            system: {
                status: 'healthy',
                uptime: process.uptime(),
                cpuUsage: Math.random() * 100,
                memoryUsage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100,
                memoryUsed: process.memoryUsage().heapUsed,
                memoryTotal: process.memoryUsage().heapTotal,
                diskUsage: Math.random() * 100
            },
            application: {
                requestsPerSecond: Math.random() * 10,
                totalRequests: Math.floor(Math.random() * 10000),
                errorRate: Math.random() * 5,
                responseTime: Math.random() * 200,
                activeConnections: Math.floor(Math.random() * 100)
            },
            database: {
                activeConnections: Math.floor(Math.random() * 20),
                queryTime: Math.random() * 50
            },
            alerts: []
        };
        
        res.json({
            success: true,
            data: metrics,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao obter métricas atuais',
            error: error.message
        });
    }
});

/**
 * @route GET /api/monitoring/metrics/history
 * @desc Obter histórico de métricas
 * @access Public (para testes)
 */
router.get('/metrics/history', async (req, res) => {
    try {
        const { days = 7 } = req.query;
        
        // Gerar dados simulados para o histórico
        const history = [];
        const now = new Date();
        
        for (let i = 0; i < 20; i++) {
            const timestamp = new Date(now.getTime() - (i * 5 * 60 * 1000)); // 5 minutos atrás
            history.unshift({
                timestamp: timestamp.toISOString(),
                cpuUsage: Math.random() * 100,
                memoryUsage: Math.random() * 100,
                diskUsage: Math.random() * 100,
                requestsPerSecond: Math.random() * 10
            });
        }
        
        res.json({
            success: true,
            data: history,
            period: `${days} days`,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao obter histórico de métricas',
            error: error.message
        });
    }
});

/**
 * @route GET /api/monitoring/alerts
 * @desc Obter alertas ativos
 * @access Public (para testes)
 */
router.get('/alerts', async (req, res) => {
    try {
        const alerts = [
            {
                severity: 'warning',
                message: 'CPU usage above 80%',
                timestamp: new Date().toISOString()
            }
        ];
        
        res.json({
            success: true,
            data: {
                alerts,
                count: alerts.length,
                severity: {
                    critical: alerts.filter(a => a.severity === 'critical').length,
                    warning: alerts.filter(a => a.severity === 'warning').length,
                    info: alerts.filter(a => a.severity === 'info').length
                }
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao obter alertas',
            error: error.message
        });
    }
});

module.exports = router;
