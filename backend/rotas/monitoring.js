/**
 * 📊 ROTAS DO SISTEMA DE MONITORAMENTO
 * Data: 07 de Julho de 2025
 * Objetivo: API REST para monitoramento do sistema
 */

const express = require('express');
const router = express.Router();
const monitoringService = require('../services/monitoringService');
const { verificarToken, verificarPermissao } = require('../middleware/autenticacao');
const { logger } = require('../services/loggerService');

/**
 * @route GET /api/monitoring/status
 * @desc Obter status do sistema de monitoramento
 * @access Admin
 */
router.get('/status', verificarToken, verificarPermissao(['admin']), async (req, res) => {
    try {
        const status = monitoringService.getMonitoringStatus();
        
        res.json({
            success: true,
            data: status,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error('Error getting monitoring status', {
            error: error.message,
            userId: req.user?.id
        });
        
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
 * @access Admin
 */
router.get('/metrics', verificarToken, verificarPermissao(['admin']), async (req, res) => {
    try {
        const metrics = monitoringService.getCurrentMetrics();
        
        res.json({
            success: true,
            data: metrics,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error('Error getting current metrics', {
            error: error.message,
            userId: req.user?.id
        });
        
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
 * @access Admin
 */
router.get('/metrics/history', verificarToken, verificarPermissao(['admin']), async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const history = monitoringService.getMetricsHistory(parseInt(days));
        
        res.json({
            success: true,
            data: history,
            period: `${days} days`,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error('Error getting metrics history', {
            error: error.message,
            userId: req.user?.id,
            days: req.query.days
        });
        
        res.status(500).json({
            success: false,
            message: 'Erro ao obter histórico de métricas',
            error: error.message
        });
    }
});

/**
 * @route POST /api/monitoring/start
 * @desc Iniciar monitoramento
 * @access Admin
 */
router.post('/start', verificarToken, verificarPermissao(['admin']), async (req, res) => {
    try {
        const result = monitoringService.startMonitoring();
        
        logger.info('Monitoring started by user', {
            userId: req.user?.id,
            userName: req.user?.nome
        });
        
        res.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error('Error starting monitoring', {
            error: error.message,
            userId: req.user?.id
        });
        
        res.status(500).json({
            success: false,
            message: 'Erro ao iniciar monitoramento',
            error: error.message
        });
    }
});

/**
 * @route POST /api/monitoring/stop
 * @desc Parar monitoramento
 * @access Admin
 */
router.post('/stop', verificarToken, verificarPermissao(['admin']), async (req, res) => {
    try {
        const result = monitoringService.stopMonitoring();
        
        logger.info('Monitoring stopped by user', {
            userId: req.user?.id,
            userName: req.user?.nome
        });
        
        res.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error('Error stopping monitoring', {
            error: error.message,
            userId: req.user?.id
        });
        
        res.status(500).json({
            success: false,
            message: 'Erro ao parar monitoramento',
            error: error.message
        });
    }
});

/**
 * @route GET /api/monitoring/alerts
 * @desc Obter alertas ativos
 * @access Admin
 */
router.get('/alerts', verificarToken, verificarPermissao(['admin']), async (req, res) => {
    try {
        const metrics = monitoringService.getCurrentMetrics();
        const alerts = metrics.alerts || [];
        
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
        logger.error('Error getting alerts', {
            error: error.message,
            userId: req.user?.id
        });
        
        res.status(500).json({
            success: false,
            message: 'Erro ao obter alertas',
            error: error.message
        });
    }
});

/**
 * @route GET /api/monitoring/health
 * @desc Verificação de saúde do sistema
 * @access Public (para load balancers)
 */
router.get('/health', async (req, res) => {
    try {
        const health = await monitoringService.healthCheck();
        
        const statusCode = health.status === 'healthy' ? 200 : 
                          health.status === 'degraded' ? 206 : 503;
        
        res.status(statusCode).json({
            success: health.status === 'healthy',
            data: health,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error('Error in health check', {
            error: error.message
        });
        
        res.status(503).json({
            success: false,
            message: 'Erro na verificação de saúde',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route POST /api/monitoring/thresholds
 * @desc Configurar thresholds de alertas
 * @access Admin
 */
router.post('/thresholds', verificarToken, verificarPermissao(['admin']), async (req, res) => {
    try {
        const { thresholds } = req.body;
        
        if (!thresholds || typeof thresholds !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Thresholds inválidos'
            });
        }
        
        const newThresholds = monitoringService.setThresholds(thresholds);
        
        logger.info('Thresholds updated by user', {
            userId: req.user?.id,
            userName: req.user?.nome,
            thresholds: newThresholds
        });
        
        res.json({
            success: true,
            data: newThresholds,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error('Error updating thresholds', {
            error: error.message,
            userId: req.user?.id,
            thresholds: req.body.thresholds
        });
        
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar thresholds',
            error: error.message
        });
    }
});

/**
 * @route GET /api/monitoring/reports/daily
 * @desc Obter relatório diário
 * @access Admin
 */
router.get('/reports/daily', verificarToken, verificarPermissao(['admin']), async (req, res) => {
    try {
        const { date } = req.query;
        
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Data é obrigatória (formato: YYYY-MM-DD)'
            });
        }
        
        const report = await monitoringService.generateDailyReport(date);
        
        res.json({
            success: true,
            data: report,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error('Error getting daily report', {
            error: error.message,
            userId: req.user?.id,
            date: req.query.date
        });
        
        res.status(500).json({
            success: false,
            message: 'Erro ao obter relatório diário',
            error: error.message
        });
    }
});

/**
 * @route GET /api/monitoring/dashboard
 * @desc Obter dados do dashboard
 * @access Admin
 */
router.get('/dashboard', verificarToken, verificarPermissao(['admin']), async (req, res) => {
    try {
        const metrics = monitoringService.getCurrentMetrics();
        const status = monitoringService.getMonitoringStatus();
        const alerts = metrics.alerts || [];
        
        const dashboard = {
            status: status.isMonitoring ? 'active' : 'inactive',
            system: {
                cpu: metrics.system?.cpu || 0,
                memory: metrics.system?.memory?.usage || 0,
                disk: metrics.system?.disk?.usage || 0,
                uptime: metrics.system?.uptime || 0
            },
            database: {
                connections: metrics.database?.connections || 0,
                size: metrics.database?.size || 0,
                status: metrics.database?.status || 'unknown'
            },
            application: {
                memory: metrics.application?.memory?.heapUsed || 0,
                uptime: metrics.application?.uptime || 0,
                pid: metrics.application?.pid || 0
            },
            performance: {
                responseTime: metrics.performance?.averageResponseTime || 0,
                requestsPerMinute: metrics.performance?.requestsPerMinute || 0,
                errorRate: metrics.performance?.errorRate || 0
            },
            alerts: {
                total: alerts.length,
                critical: alerts.filter(a => a.severity === 'critical').length,
                warning: alerts.filter(a => a.severity === 'warning').length,
                recent: alerts.slice(0, 5)
            },
            thresholds: status.thresholds
        };
        
        res.json({
            success: true,
            data: dashboard,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error('Error getting dashboard data', {
            error: error.message,
            userId: req.user?.id
        });
        
        res.status(500).json({
            success: false,
            message: 'Erro ao obter dados do dashboard',
            error: error.message
        });
    }
});

/**
 * @route POST /api/monitoring/collect
 * @desc Forçar coleta de métricas
 * @access Admin
 */
router.post('/collect', verificarToken, verificarPermissao(['admin']), async (req, res) => {
    try {
        await monitoringService.collectMetrics();
        
        logger.info('Metrics collection forced by user', {
            userId: req.user?.id,
            userName: req.user?.nome
        });
        
        res.json({
            success: true,
            message: 'Métricas coletadas com sucesso',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error('Error forcing metrics collection', {
            error: error.message,
            userId: req.user?.id
        });
        
        res.status(500).json({
            success: false,
            message: 'Erro ao coletar métricas',
            error: error.message
        });
    }
});

module.exports = router;
