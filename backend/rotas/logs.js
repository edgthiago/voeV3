/**
 * 📊 ROTAS DE LOGS E MONITORAMENTO
 * Data: 07 de Julho de 2025
 * Objetivo: Endpoints para visualização e análise de logs
 */

const express = require('express');
const router = express.Router();
const { verificarAutenticacao } = require('../middleware/autenticacao');
const { searchLogs, getLogStats, loggers } = require('../services/loggerService');
const fs = require('fs');
const path = require('path');

// Middleware para verificar permissões de administrador
const verificarAdmin = (req, res, next) => {
    if (!req.user || req.user.tipo_usuario !== 'diretor') {
        return res.status(403).json({
            success: false,
            message: 'Acesso negado. Apenas administradores podem acessar logs.'
        });
    }
    next();
};

// GET /api/logs/stats - Estatísticas gerais dos logs
router.get('/stats', verificarAutenticacao, verificarAdmin, async (req, res) => {
    try {
        const stats = getLogStats();
        
        // Adicionar estatísticas de sistema
        const memoryUsage = process.memoryUsage();
        const systemStats = {
            uptime: process.uptime(),
            memory: {
                rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100,
                heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
                heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100
            },
            nodeVersion: process.version,
            platform: process.platform
        };
        
        res.json({
            success: true,
            data: {
                logs: stats,
                system: systemStats,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        loggers.api.error('Error getting log stats', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Erro ao obter estatísticas dos logs'
        });
    }
});

// GET /api/logs/search - Buscar logs
router.get('/search', verificarAutenticacao, verificarAdmin, async (req, res) => {
    try {
        const {
            query = '',
            level = 'info',
            service = '',
            userId = '',
            start = new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24h
            end = new Date(),
            limit = 100,
            page = 1
        } = req.query;
        
        const searchOptions = {
            level,
            start: new Date(start),
            end: new Date(end),
            rows: parseInt(limit),
            order: 'desc'
        };
        
        const results = await searchLogs(query, searchOptions);
        
        // Filtrar por serviço e userId se especificados
        let filteredResults = results;
        if (service) {
            filteredResults = filteredResults.filter(log => log.service === service);
        }
        if (userId) {
            filteredResults = filteredResults.filter(log => log.userId === userId);
        }
        
        // Paginação
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedResults = filteredResults.slice(startIndex, endIndex);
        
        res.json({
            success: true,
            data: {
                logs: paginatedResults,
                total: filteredResults.length,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(filteredResults.length / limit)
            }
        });
        
    } catch (error) {
        loggers.api.error('Error searching logs', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar logs'
        });
    }
});

// GET /api/logs/recent - Logs recentes
router.get('/recent', verificarAutenticacao, verificarAdmin, async (req, res) => {
    try {
        const { limit = 50, level = 'info' } = req.query;
        
        const results = await searchLogs('', {
            level,
            start: new Date(Date.now() - 60 * 60 * 1000), // Última hora
            end: new Date(),
            rows: parseInt(limit),
            order: 'desc'
        });
        
        res.json({
            success: true,
            data: {
                logs: results,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        loggers.api.error('Error getting recent logs', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Erro ao obter logs recentes'
        });
    }
});

// GET /api/logs/errors - Logs de erro
router.get('/errors', verificarAutenticacao, verificarAdmin, async (req, res) => {
    try {
        const { limit = 50, hours = 24 } = req.query;
        
        const results = await searchLogs('', {
            level: 'error',
            start: new Date(Date.now() - hours * 60 * 60 * 1000),
            end: new Date(),
            rows: parseInt(limit),
            order: 'desc'
        });
        
        res.json({
            success: true,
            data: {
                errors: results,
                count: results.length,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        loggers.api.error('Error getting error logs', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Erro ao obter logs de erro'
        });
    }
});

// GET /api/logs/performance - Métricas de performance
router.get('/performance', verificarAutenticacao, verificarAdmin, async (req, res) => {
    try {
        const { hours = 24 } = req.query;
        
        const results = await searchLogs('performance', {
            level: 'info',
            start: new Date(Date.now() - hours * 60 * 60 * 1000),
            end: new Date(),
            rows: 1000,
            order: 'desc'
        });
        
        // Análise de performance
        const performanceData = results
            .filter(log => log.performance)
            .map(log => ({
                operation: log.operation,
                duration: parseInt(log.duration),
                timestamp: log.timestamp
            }));
        
        // Calcular estatísticas
        const stats = {
            totalOperations: performanceData.length,
            averageDuration: performanceData.length > 0 ? 
                Math.round(performanceData.reduce((sum, op) => sum + op.duration, 0) / performanceData.length) : 0,
            slowOperations: performanceData.filter(op => op.duration > 1000).length
        };
        
        res.json({
            success: true,
            data: {
                performance: performanceData,
                stats,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        loggers.api.error('Error getting performance logs', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Erro ao obter métricas de performance'
        });
    }
});

// GET /api/logs/audit - Logs de auditoria
router.get('/audit', verificarAutenticacao, verificarAdmin, async (req, res) => {
    try {
        const { limit = 100, userId = '', action = '' } = req.query;
        
        const results = await searchLogs('audit', {
            level: 'info',
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Últimos 7 dias
            end: new Date(),
            rows: parseInt(limit),
            order: 'desc'
        });
        
        let auditLogs = results.filter(log => log.audit);
        
        if (userId) {
            auditLogs = auditLogs.filter(log => log.userId === userId);
        }
        
        if (action) {
            auditLogs = auditLogs.filter(log => log.action === action);
        }
        
        res.json({
            success: true,
            data: {
                audit: auditLogs,
                count: auditLogs.length,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        loggers.api.error('Error getting audit logs', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Erro ao obter logs de auditoria'
        });
    }
});

// GET /api/logs/security - Logs de segurança
router.get('/security', verificarAutenticacao, verificarAdmin, async (req, res) => {
    try {
        const { limit = 100, hours = 24 } = req.query;
        
        const results = await searchLogs('security', {
            level: 'warn',
            start: new Date(Date.now() - hours * 60 * 60 * 1000),
            end: new Date(),
            rows: parseInt(limit),
            order: 'desc'
        });
        
        const securityLogs = results.filter(log => log.security);
        
        res.json({
            success: true,
            data: {
                security: securityLogs,
                count: securityLogs.length,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        loggers.api.error('Error getting security logs', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Erro ao obter logs de segurança'
        });
    }
});

// GET /api/logs/download/:type - Download de logs
router.get('/download/:type', verificarAutenticacao, verificarAdmin, async (req, res) => {
    try {
        const { type } = req.params;
        const { date = new Date().toISOString().split('T')[0] } = req.query;
        
        const logDir = path.join(__dirname, '../logs');
        const filename = `${type}-${date}.log`;
        const filepath = path.join(logDir, filename);
        
        if (!fs.existsSync(filepath)) {
            return res.status(404).json({
                success: false,
                message: 'Arquivo de log não encontrado'
            });
        }
        
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'text/plain');
        
        const fileStream = fs.createReadStream(filepath);
        fileStream.pipe(res);
        
    } catch (error) {
        loggers.api.error('Error downloading log file', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Erro ao baixar arquivo de log'
        });
    }
});

// GET /api/logs/services - Logs por serviço
router.get('/services', verificarAutenticacao, verificarAdmin, async (req, res) => {
    try {
        const { service, limit = 100 } = req.query;
        
        if (!service) {
            return res.status(400).json({
                success: false,
                message: 'Parâmetro service é obrigatório'
            });
        }
        
        const results = await searchLogs('', {
            level: 'info',
            start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24h
            end: new Date(),
            rows: parseInt(limit),
            order: 'desc'
        });
        
        const serviceLogs = results.filter(log => log.service === service);
        
        res.json({
            success: true,
            data: {
                service,
                logs: serviceLogs,
                count: serviceLogs.length,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        loggers.api.error('Error getting service logs', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Erro ao obter logs do serviço'
        });
    }
});

// POST /api/logs/test - Testar sistema de logs
router.post('/test', verificarAutenticacao, verificarAdmin, async (req, res) => {
    try {
        const { level = 'info', message = 'Test log message' } = req.body;
        
        // Criar logs de teste
        loggers.api[level]('Test log', {
            message,
            testMode: true,
            userId: req.user.id,
            timestamp: new Date().toISOString()
        });
        
        res.json({
            success: true,
            message: 'Log de teste criado com sucesso',
            data: {
                level,
                message,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        loggers.api.error('Error creating test log', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Erro ao criar log de teste'
        });
    }
});

module.exports = router;
