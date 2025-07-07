/**
 * 💾 ROTAS DE BACKUP E ADMINISTRAÇÃO
 * Data: 07 de Julho de 2025
 * Objetivo: Endpoints para gerenciamento de backups
 */

const express = require('express');
const router = express.Router();
const { verificarAutenticacao } = require('../middleware/autenticacao');
const backupService = require('../services/backupService');
const { loggers } = require('../services/loggerService');
const path = require('path');
const fs = require('fs');

// Middleware para verificar permissões de administrador
const verificarAdmin = (req, res, next) => {
    if (!req.user || req.user.tipo_usuario !== 'diretor') {
        return res.status(403).json({
            success: false,
            message: 'Acesso negado. Apenas administradores podem gerenciar backups.'
        });
    }
    next();
};

// GET /api/backup/stats - Estatísticas dos backups
router.get('/stats', verificarAutenticacao, verificarAdmin, async (req, res) => {
    try {
        const stats = await backupService.getBackupStats();
        
        res.json({
            success: true,
            data: {
                stats,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        loggers.database.error('Error getting backup stats', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Erro ao obter estatísticas de backup'
        });
    }
});

// POST /api/backup/create - Criar backup manual
router.post('/create', verificarAutenticacao, verificarAdmin, async (req, res) => {
    try {
        const { type = 'database' } = req.body;
        
        // Validar tipo de backup
        const validTypes = ['database', 'logs', 'full'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Tipo de backup inválido. Use: database, logs ou full'
            });
        }
        
        loggers.database.info('Manual backup requested', {
            type,
            userId: req.user.id,
            timestamp: new Date().toISOString()
        });
        
        const result = await backupService.manualBackup(type);
        
        res.json({
            success: true,
            message: `Backup ${type} criado com sucesso`,
            data: result
        });
        
    } catch (error) {
        loggers.database.error('Error creating manual backup', {
            error: error.message,
            userId: req.user.id
        });
        
        res.status(500).json({
            success: false,
            message: 'Erro ao criar backup manual'
        });
    }
});

// GET /api/backup/list - Listar backups disponíveis
router.get('/list', verificarAutenticacao, verificarAdmin, async (req, res) => {
    try {
        const { type = 'all', limit = 50, page = 1 } = req.query;
        
        const backupDir = path.join(__dirname, '../backups');
        if (!fs.existsSync(backupDir)) {
            return res.json({
                success: true,
                data: {
                    backups: [],
                    total: 0,
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        }
        
        let backupFiles = fs.readdirSync(backupDir);
        
        // Filtrar por tipo se especificado
        if (type !== 'all') {
            backupFiles = backupFiles.filter(file => {
                switch (type) {
                    case 'database':
                        return file.startsWith('database-');
                    case 'logs':
                        return file.startsWith('logs-');
                    case 'full':
                        return file.startsWith('full-backup-');
                    default:
                        return true;
                }
            });
        }
        
        // Obter informações detalhadas dos backups
        const backups = backupFiles.map(file => {
            const filePath = path.join(backupDir, file);
            const stats = fs.statSync(filePath);
            
            return {
                name: file,
                type: file.startsWith('database-') ? 'database' :
                      file.startsWith('logs-') ? 'logs' :
                      file.startsWith('full-backup-') ? 'full' : 'other',
                size: Math.round(stats.size / 1024 / 1024 * 100) / 100, // MB
                created: stats.birthtime,
                modified: stats.mtime,
                isDirectory: stats.isDirectory()
            };
        });
        
        // Ordenar por data de criação (mais recente primeiro)
        backups.sort((a, b) => new Date(b.created) - new Date(a.created));
        
        // Paginação
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedBackups = backups.slice(startIndex, endIndex);
        
        res.json({
            success: true,
            data: {
                backups: paginatedBackups,
                total: backups.length,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(backups.length / limit)
            }
        });
        
    } catch (error) {
        loggers.database.error('Error listing backups', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Erro ao listar backups'
        });
    }
});

// POST /api/backup/verify - Verificar integridade dos backups
router.post('/verify', verificarAutenticacao, verificarAdmin, async (req, res) => {
    try {
        loggers.database.info('Backup verification requested', {
            userId: req.user.id,
            timestamp: new Date().toISOString()
        });
        
        const verification = await backupService.verifyBackups();
        
        res.json({
            success: true,
            message: 'Verificação de backups concluída',
            data: verification
        });
        
    } catch (error) {
        loggers.database.error('Error verifying backups', {
            error: error.message,
            userId: req.user.id
        });
        
        res.status(500).json({
            success: false,
            message: 'Erro ao verificar backups'
        });
    }
});

// POST /api/backup/cleanup - Limpeza manual de backups antigos
router.post('/cleanup', verificarAutenticacao, verificarAdmin, async (req, res) => {
    try {
        loggers.database.info('Manual backup cleanup requested', {
            userId: req.user.id,
            timestamp: new Date().toISOString()
        });
        
        const result = await backupService.cleanupOldBackups();
        
        res.json({
            success: true,
            message: 'Limpeza de backups concluída',
            data: result
        });
        
    } catch (error) {
        loggers.database.error('Error cleaning up backups', {
            error: error.message,
            userId: req.user.id
        });
        
        res.status(500).json({
            success: false,
            message: 'Erro ao limpar backups antigos'
        });
    }
});

// GET /api/backup/download/:filename - Download de backup específico
router.get('/download/:filename', verificarAutenticacao, verificarAdmin, async (req, res) => {
    try {
        const { filename } = req.params;
        const backupDir = path.join(__dirname, '../backups');
        const filePath = path.join(backupDir, filename);
        
        // Verificar se o arquivo existe
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Arquivo de backup não encontrado'
            });
        }
        
        // Verificar se é um arquivo válido (não permitir path traversal)
        const resolvedPath = path.resolve(filePath);
        const resolvedBackupDir = path.resolve(backupDir);
        
        if (!resolvedPath.startsWith(resolvedBackupDir)) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado ao arquivo'
            });
        }
        
        loggers.database.info('Backup download requested', {
            filename,
            userId: req.user.id,
            timestamp: new Date().toISOString()
        });
        
        const stats = fs.statSync(filePath);
        
        // Configurar headers para download
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Length', stats.size);
        
        // Stream do arquivo
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        
    } catch (error) {
        loggers.database.error('Error downloading backup', {
            error: error.message,
            filename: req.params.filename,
            userId: req.user.id
        });
        
        res.status(500).json({
            success: false,
            message: 'Erro ao baixar arquivo de backup'
        });
    }
});

// DELETE /api/backup/:filename - Excluir backup específico
router.delete('/:filename', verificarAutenticacao, verificarAdmin, async (req, res) => {
    try {
        const { filename } = req.params;
        const backupDir = path.join(__dirname, '../backups');
        const filePath = path.join(backupDir, filename);
        
        // Verificar se o arquivo existe
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Arquivo de backup não encontrado'
            });
        }
        
        // Verificar se é um arquivo válido (não permitir path traversal)
        const resolvedPath = path.resolve(filePath);
        const resolvedBackupDir = path.resolve(backupDir);
        
        if (!resolvedPath.startsWith(resolvedBackupDir)) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado ao arquivo'
            });
        }
        
        loggers.database.warn('Backup deletion requested', {
            filename,
            userId: req.user.id,
            timestamp: new Date().toISOString()
        });
        
        // Obter informações antes de excluir
        const stats = fs.statSync(filePath);
        const sizeInMB = Math.round(stats.size / 1024 / 1024 * 100) / 100;
        
        // Excluir arquivo ou diretório
        if (stats.isDirectory()) {
            await backupService.removeDirectory(filePath);
        } else {
            fs.unlinkSync(filePath);
        }
        
        res.json({
            success: true,
            message: 'Backup excluído com sucesso',
            data: {
                filename,
                size: `${sizeInMB} MB`,
                deletedAt: new Date().toISOString()
            }
        });
        
    } catch (error) {
        loggers.database.error('Error deleting backup', {
            error: error.message,
            filename: req.params.filename,
            userId: req.user.id
        });
        
        res.status(500).json({
            success: false,
            message: 'Erro ao excluir backup'
        });
    }
});

// GET /api/backup/schedules - Visualizar agendamentos de backup
router.get('/schedules', verificarAutenticacao, verificarAdmin, async (req, res) => {
    try {
        const schedules = [
            {
                name: 'Backup Diário do Banco',
                cron: '0 2 * * *',
                description: 'Backup automático do banco de dados às 02:00',
                type: 'database',
                active: true
            },
            {
                name: 'Backup Completo Semanal',
                cron: '0 3 * * 0',
                description: 'Backup completo do sistema aos domingos às 03:00',
                type: 'full',
                active: true
            },
            {
                name: 'Backup de Logs',
                cron: '0 */6 * * *',
                description: 'Backup dos logs a cada 6 horas',
                type: 'logs',
                active: true
            },
            {
                name: 'Limpeza de Backups',
                cron: '0 4 * * *',
                description: 'Limpeza automática de backups antigos às 04:00',
                type: 'cleanup',
                active: true
            },
            {
                name: 'Verificação de Integridade',
                cron: '0 5 * * *',
                description: 'Verificação de integridade dos backups às 05:00',
                type: 'verify',
                active: true
            }
        ];
        
        res.json({
            success: true,
            data: {
                schedules,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        loggers.database.error('Error getting backup schedules', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Erro ao obter agendamentos de backup'
        });
    }
});

module.exports = router;
