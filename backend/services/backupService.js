/**
 * 💾 SISTEMA DE BACKUP AUTOMATIZADO
 * Data: 07 de Julho de 2025
 * Objetivo: Backup automático de banco de dados, logs e arquivos críticos
 * Prioridade: 🥇 ALTA (Fase 1 do Roadmap)
 */

const cron = require('node-cron');
const mysqldump = require('mysqldump');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const { logger, loggers } = require('./loggerService');

class BackupService {
    constructor() {
        this.backupDir = path.join(__dirname, '../backups');
        this.logDir = path.join(__dirname, '../logs');
        this.maxBackups = 30; // Manter 30 backups
        this.maxLogBackups = 7; // Manter 7 dias de logs
        
        // Criar diretório de backup se não existir
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
        
        this.initializeSchedules();
    }

    /**
     * Inicializar agendamentos de backup
     */
    initializeSchedules() {
        // Backup diário do banco de dados às 02:00
        cron.schedule('0 2 * * *', () => {
            this.backupDatabase();
        });

        // Backup semanal completo aos domingos às 03:00
        cron.schedule('0 3 * * 0', () => {
            this.fullBackup();
        });

        // Limpeza de backups antigos diariamente às 04:00
        cron.schedule('0 4 * * *', () => {
            this.cleanupOldBackups();
        });

        // Backup de logs a cada 6 horas
        cron.schedule('0 */6 * * *', () => {
            this.backupLogs();
        });

        // Verificação de saúde dos backups diariamente às 05:00
        cron.schedule('0 5 * * *', () => {
            this.verifyBackups();
        });

        loggers.database.info('Backup scheduler initialized', {
            schedules: [
                'Database backup: Daily at 02:00',
                'Full backup: Weekly on Sunday at 03:00',
                'Cleanup: Daily at 04:00',
                'Log backup: Every 6 hours',
                'Health check: Daily at 05:00'
            ]
        });
    }

    /**
     * Backup do banco de dados MySQL
     */
    async backupDatabase() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(this.backupDir, `database-${timestamp}.sql`);
            
            loggers.database.info('Starting database backup', {
                timestamp,
                backupPath
            });

            // Verificar se as credenciais estão configuradas
            if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
                throw new Error('Database credentials not configured in environment variables');
            }

            const result = await mysqldump({
                connection: {
                    host: process.env.DB_HOST || 'localhost',
                    user: process.env.DB_USER || 'root',
                    password: process.env.DB_PASSWORD || '',
                    database: process.env.DB_NAME || 'loja_tenis_fgt',
                    port: process.env.DB_PORT || 3306
                },
                dumpToFile: backupPath,
                compressFile: false // Desabilitar compressão por enquanto
            });

            // Verificar se o backup foi criado
            if (fs.existsSync(backupPath)) {
                const stats = fs.statSync(backupPath);
                const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
                
                loggers.database.info('Database backup completed successfully', {
                    timestamp,
                    backupPath,
                    size: `${sizeInMB} MB`,
                    tables: result.dump.schema?.length || 0
                });

                return {
                    success: true,
                    backupPath,
                    size: sizeInMB,
                    timestamp
                };
            } else {
                throw new Error('Backup file was not created');
            }

        } catch (error) {
            loggers.database.error('Database backup failed', {
                error: error.message,
                stack: error.stack
            });

            throw error;
        }
    }

    /**
     * Backup completo do sistema
     */
    async fullBackup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fullBackupDir = path.join(this.backupDir, `full-backup-${timestamp}`);
            
            loggers.database.info('Starting full system backup', {
                timestamp,
                backupDir: fullBackupDir
            });

            // Criar diretório para backup completo
            if (!fs.existsSync(fullBackupDir)) {
                fs.mkdirSync(fullBackupDir, { recursive: true });
            }

            const results = {
                database: null,
                logs: null,
                configs: null,
                uploads: null
            };

            // 1. Backup do banco de dados
            try {
                const dbBackupPath = path.join(fullBackupDir, 'database.sql');
                await mysqldump({
                    connection: {
                        host: process.env.DB_HOST || 'localhost',
                        user: process.env.DB_USER || 'root',
                        password: process.env.DB_PASSWORD || '',
                        database: process.env.DB_NAME || 'loja_tenis_fgt',
                        port: process.env.DB_PORT || 3306
                    },
                    dumpToFile: dbBackupPath,
                    compressFile: true
                });

                results.database = { success: true, path: dbBackupPath };
            } catch (error) {
                results.database = { success: false, error: error.message };
            }

            // 2. Backup dos logs
            try {
                const logsBackupDir = path.join(fullBackupDir, 'logs');
                if (!fs.existsSync(logsBackupDir)) {
                    fs.mkdirSync(logsBackupDir, { recursive: true });
                }

                if (fs.existsSync(this.logDir)) {
                    await this.copyDirectory(this.logDir, logsBackupDir);
                }

                results.logs = { success: true, path: logsBackupDir };
            } catch (error) {
                results.logs = { success: false, error: error.message };
            }

            // 3. Backup dos arquivos de configuração
            try {
                const configsBackupDir = path.join(fullBackupDir, 'configs');
                if (!fs.existsSync(configsBackupDir)) {
                    fs.mkdirSync(configsBackupDir, { recursive: true });
                }

                const configFiles = [
                    '.env.example',
                    'package.json',
                    'README.md'
                ];

                for (const file of configFiles) {
                    const sourcePath = path.join(__dirname, '..', file);
                    const destPath = path.join(configsBackupDir, file);
                    
                    if (fs.existsSync(sourcePath)) {
                        fs.copyFileSync(sourcePath, destPath);
                    }
                }

                results.configs = { success: true, path: configsBackupDir };
            } catch (error) {
                results.configs = { success: false, error: error.message };
            }

            // 4. Backup dos uploads/imagens
            try {
                const uploadsBackupDir = path.join(fullBackupDir, 'uploads');
                const publicDir = path.join(__dirname, '..', 'public');
                
                if (fs.existsSync(publicDir)) {
                    await this.copyDirectory(publicDir, uploadsBackupDir);
                }

                results.uploads = { success: true, path: uploadsBackupDir };
            } catch (error) {
                results.uploads = { success: false, error: error.message };
            }

            // 5. Criar arquivo de resumo do backup
            const summary = {
                timestamp,
                backupType: 'full',
                results,
                totalSize: await this.calculateDirectorySize(fullBackupDir)
            };

            const summaryPath = path.join(fullBackupDir, 'backup-summary.json');
            fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

            loggers.database.info('Full backup completed', {
                timestamp,
                backupDir: fullBackupDir,
                results,
                totalSize: summary.totalSize
            });

            return summary;

        } catch (error) {
            loggers.database.error('Full backup failed', {
                error: error.message,
                stack: error.stack
            });

            throw error;
        }
    }

    /**
     * Backup dos logs
     */
    async backupLogs() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const logsBackupPath = path.join(this.backupDir, `logs-${timestamp}.tar.gz`);
            
            loggers.database.info('Starting logs backup', {
                timestamp,
                backupPath: logsBackupPath
            });

            if (!fs.existsSync(this.logDir)) {
                loggers.database.warn('Logs directory does not exist', {
                    logDir: this.logDir
                });
                return;
            }

            // Criar arquivo compactado dos logs (adaptado para Windows)
            const isWindows = process.platform === 'win32';
            let command;
            let actualBackupPath;
            
            if (isWindows) {
                // Usar PowerShell para criar arquivo ZIP no Windows
                actualBackupPath = path.join(this.backupDir, `logs-${timestamp}.zip`);
                
                // Criar diretório temporário para cópias dos logs
                const tempDir = path.join(this.backupDir, 'temp-logs');
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                }
                
                // Copiar arquivos de log para o diretório temporário
                const logFiles = fs.readdirSync(this.logDir).filter(file => 
                    file.endsWith('.log') || file.endsWith('.json')
                );
                
                for (const logFile of logFiles) {
                    const srcPath = path.join(this.logDir, logFile);
                    const destPath = path.join(tempDir, logFile);
                    try {
                        fs.copyFileSync(srcPath, destPath);
                    } catch (err) {
                        // Se não conseguir copiar (arquivo em uso), pular
                        loggers.database.warn(`Could not copy log file: ${logFile}`, { error: err.message });
                    }
                }
                
                // Compactar o diretório temporário
                command = `powershell -Command "Compress-Archive -Path '${tempDir}' -DestinationPath '${actualBackupPath}' -Force"`;
            } else {
                // Usar tar para Linux/Mac
                command = `tar -czf "${logsBackupPath}" -C "${path.dirname(this.logDir)}" "${path.basename(this.logDir)}"`;
                actualBackupPath = logsBackupPath;
            }
            
            await execAsync(command);
            
            // Limpar diretório temporário no Windows
            if (isWindows) {
                const tempDir = path.join(this.backupDir, 'temp-logs');
                if (fs.existsSync(tempDir)) {
                    fs.rmSync(tempDir, { recursive: true, force: true });
                }
            }

            // Verificar se o backup foi criado
            if (fs.existsSync(actualBackupPath)) {
                const stats = fs.statSync(actualBackupPath);
                const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
                
                loggers.database.info('Logs backup completed successfully', {
                    timestamp,
                    backupPath: actualBackupPath,
                    size: `${sizeInMB} MB`,
                    platform: process.platform
                });

                return {
                    success: true,
                    backupPath: actualBackupPath,
                    size: sizeInMB,
                    timestamp
                };
            } else {
                throw new Error('Logs backup file was not created');
            }

        } catch (error) {
            loggers.database.error('Logs backup failed', {
                error: error.message,
                stack: error.stack
            });

            throw error;
        }
    }

    /**
     * Limpeza de backups antigos
     */
    async cleanupOldBackups() {
        try {
            loggers.database.info('Starting backup cleanup', {
                maxBackups: this.maxBackups,
                maxLogBackups: this.maxLogBackups
            });

            const backupFiles = fs.readdirSync(this.backupDir);
            const now = new Date();
            
            let deletedCount = 0;
            let freedSpace = 0;

            // Separar backups por tipo
            const databaseBackups = backupFiles.filter(file => 
                file.startsWith('database-') && file.endsWith('.sql')
            );
            
            const logBackups = backupFiles.filter(file => 
                file.startsWith('logs-') && (file.endsWith('.tar.gz') || file.endsWith('.zip'))
            );

            const fullBackups = backupFiles.filter(file => 
                file.startsWith('full-backup-')
            );

            // Limpar backups de database (manter apenas os mais recentes)
            if (databaseBackups.length > this.maxBackups) {
                const toDelete = databaseBackups
                    .sort()
                    .slice(0, databaseBackups.length - this.maxBackups);

                for (const file of toDelete) {
                    const filePath = path.join(this.backupDir, file);
                    const stats = fs.statSync(filePath);
                    
                    fs.unlinkSync(filePath);
                    deletedCount++;
                    freedSpace += stats.size;
                }
            }

            // Limpar backups de logs (manter apenas os dos últimos dias)
            if (logBackups.length > this.maxLogBackups) {
                const toDelete = logBackups
                    .sort()
                    .slice(0, logBackups.length - this.maxLogBackups);

                for (const file of toDelete) {
                    const filePath = path.join(this.backupDir, file);
                    const stats = fs.statSync(filePath);
                    
                    fs.unlinkSync(filePath);
                    deletedCount++;
                    freedSpace += stats.size;
                }
            }

            // Limpar backups completos muito antigos (manter apenas 4 - 1 mês)
            if (fullBackups.length > 4) {
                const toDelete = fullBackups
                    .sort()
                    .slice(0, fullBackups.length - 4);

                for (const dir of toDelete) {
                    const dirPath = path.join(this.backupDir, dir);
                    const stats = await this.calculateDirectorySize(dirPath);
                    
                    await this.removeDirectory(dirPath);
                    deletedCount++;
                    freedSpace += stats;
                }
            }

            const freedSpaceMB = (freedSpace / 1024 / 1024).toFixed(2);

            loggers.database.info('Backup cleanup completed', {
                deletedCount,
                freedSpace: `${freedSpaceMB} MB`,
                remainingBackups: {
                    database: databaseBackups.length - (databaseBackups.length > this.maxBackups ? databaseBackups.length - this.maxBackups : 0),
                    logs: logBackups.length - (logBackups.length > this.maxLogBackups ? logBackups.length - this.maxLogBackups : 0),
                    full: fullBackups.length - (fullBackups.length > 4 ? fullBackups.length - 4 : 0)
                }
            });

            return {
                success: true,
                deletedCount,
                freedSpace: freedSpaceMB
            };

        } catch (error) {
            loggers.database.error('Backup cleanup failed', {
                error: error.message,
                stack: error.stack
            });

            throw error;
        }
    }

    /**
     * Verificar integridade dos backups
     */
    async verifyBackups() {
        try {
            loggers.database.info('Starting backup verification');

            const backupFiles = fs.readdirSync(this.backupDir);
            const verification = {
                total: backupFiles.length,
                valid: 0,
                invalid: 0,
                corrupt: 0,
                details: []
            };

            for (const file of backupFiles) {
                const filePath = path.join(this.backupDir, file);
                const stats = fs.statSync(filePath);
                
                const fileInfo = {
                    name: file,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime,
                    valid: false,
                    error: null
                };

                try {
                    // Verificar se o arquivo existe e não está vazio
                    if (stats.size === 0) {
                        fileInfo.error = 'File is empty';
                        verification.invalid++;
                    } else if (file.endsWith('.sql')) {
                        // Verificar backup SQL
                        const content = fs.readFileSync(filePath, 'utf8');
                        if (content.includes('mysqldump') || content.includes('CREATE TABLE')) {
                            fileInfo.valid = true;
                            verification.valid++;
                        } else {
                            fileInfo.error = 'Invalid SQL backup format';
                            verification.invalid++;
                        }
                    } else if (file.endsWith('.tar.gz') || file.endsWith('.zip')) {
                        // Verificar arquivo compactado
                        try {
                            if (file.endsWith('.tar.gz')) {
                                const { stdout } = await execAsync(`tar -tzf "${filePath}" | head -1`);
                                if (stdout.trim()) {
                                    fileInfo.valid = true;
                                    verification.valid++;
                                } else {
                                    fileInfo.error = 'Invalid tar.gz format';
                                    verification.invalid++;
                                }
                            } else if (file.endsWith('.zip')) {
                                // Para arquivos ZIP, verificar se existe e tem conteúdo
                                const stats = fs.statSync(filePath);
                                if (stats.size > 0) {
                                    fileInfo.valid = true;
                                    verification.valid++;
                                } else {
                                    fileInfo.error = 'Empty ZIP file';
                                    verification.invalid++;
                                }
                            }
                        } catch (error) {
                            fileInfo.error = `Verification failed: ${error.message}`;
                            verification.invalid++;
                        }
                    } else if (fs.statSync(filePath).isDirectory()) {
                        // Verificar backup completo
                        const summaryPath = path.join(filePath, 'backup-summary.json');
                        if (fs.existsSync(summaryPath)) {
                            const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
                            if (summary.timestamp && summary.backupType === 'full') {
                                fileInfo.valid = true;
                                verification.valid++;
                            } else {
                                fileInfo.error = 'Invalid backup summary';
                                verification.invalid++;
                            }
                        } else {
                            fileInfo.error = 'Missing backup summary';
                            verification.invalid++;
                        }
                    } else {
                        fileInfo.valid = true;
                        verification.valid++;
                    }
                } catch (error) {
                    fileInfo.error = error.message;
                    verification.corrupt++;
                }

                verification.details.push(fileInfo);
            }

            loggers.database.info('Backup verification completed', {
                total: verification.total,
                valid: verification.valid,
                invalid: verification.invalid,
                corrupt: verification.corrupt,
                successRate: `${Math.round((verification.valid / verification.total) * 100)}%`
            });

            return verification;

        } catch (error) {
            loggers.database.error('Backup verification failed', {
                error: error.message,
                stack: error.stack
            });

            throw error;
        }
    }

    /**
     * Backup manual imediato
     */
    async manualBackup(type = 'database') {
        try {
            loggers.database.info('Starting manual backup', { type });

            switch (type) {
                case 'database':
                    return await this.backupDatabase();
                case 'logs':
                    return await this.backupLogs();
                case 'full':
                    return await this.fullBackup();
                default:
                    throw new Error('Invalid backup type');
            }

        } catch (error) {
            loggers.database.error('Manual backup failed', {
                type,
                error: error.message
            });

            throw error;
        }
    }

    /**
     * Obter estatísticas de backup
     */
    async getBackupStats() {
        try {
            const backupFiles = fs.readdirSync(this.backupDir);
            
            const stats = {
                total: backupFiles.length,
                totalSize: 0,
                types: {
                    database: 0,
                    logs: 0,
                    full: 0,
                    other: 0
                },
                oldest: null,
                newest: null,
                lastBackup: null
            };

            let oldestDate = null;
            let newestDate = null;

            for (const file of backupFiles) {
                const filePath = path.join(this.backupDir, file);
                const stat = fs.statSync(filePath);
                
                stats.totalSize += stat.size;

                if (file.startsWith('database-')) {
                    stats.types.database++;
                } else if (file.startsWith('logs-')) {
                    stats.types.logs++;
                } else if (file.startsWith('full-backup-')) {
                    stats.types.full++;
                } else {
                    stats.types.other++;
                }

                if (!oldestDate || stat.birthtime < oldestDate) {
                    oldestDate = stat.birthtime;
                    stats.oldest = file;
                }

                if (!newestDate || stat.birthtime > newestDate) {
                    newestDate = stat.birthtime;
                    stats.newest = file;
                    stats.lastBackup = stat.birthtime;
                }
            }

            stats.totalSize = Math.round(stats.totalSize / 1024 / 1024 * 100) / 100; // MB

            return stats;

        } catch (error) {
            loggers.database.error('Failed to get backup stats', {
                error: error.message
            });

            throw error;
        }
    }

    /**
     * Funções auxiliares
     */
    async copyDirectory(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        const entries = fs.readdirSync(src, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);

            if (entry.isDirectory()) {
                await this.copyDirectory(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }

    async removeDirectory(dir) {
        if (fs.existsSync(dir)) {
            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
                const entryPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    await this.removeDirectory(entryPath);
                } else {
                    fs.unlinkSync(entryPath);
                }
            }

            fs.rmdirSync(dir);
        }
    }

    async calculateDirectorySize(dir) {
        if (!fs.existsSync(dir)) return 0;

        let totalSize = 0;
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const entryPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                totalSize += await this.calculateDirectorySize(entryPath);
            } else {
                const stats = fs.statSync(entryPath);
                totalSize += stats.size;
            }
        }

        return totalSize;
    }
}

// Instância única do serviço
const backupService = new BackupService();

module.exports = backupService;
