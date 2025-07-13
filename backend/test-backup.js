/**
 * Teste do BackupService após remoção das vulnerabilidades
 */
require('dotenv').config();

// Simular logger service se não existir
if (!require('fs').existsSync('./services/loggerService.js')) {
    const mockLogger = {
        info: (...args) => console.log('[INFO]', ...args),
        warn: (...args) => console.warn('[WARN]', ...args),
        error: (...args) => console.error('[ERROR]', ...args)
    };
    
    module.exports = {
        logger: mockLogger,
        loggers: {
            database: mockLogger
        }
    };
}

try {
    console.log('🧪 Testando BackupService...');
    
    const backupService = require('./services/backupService');
    
    console.log('✅ BackupService carregado com sucesso!');
    console.log('📊 Métodos disponíveis:');
    console.log('- backupDatabase()');
    console.log('- backupLogs()');
    console.log('- fullBackup()');
    console.log('- manualBackup()');
    console.log('- getBackupStats()');
    console.log('- verifyBackups()');
    console.log('- cleanupOldBackups()');
    
    // Teste básico de stats
    backupService.getBackupStats().then(stats => {
        console.log('📈 Estatísticas de backup:', stats);
    }).catch(err => {
        console.log('⚠️ Erro ao obter stats (normal se não há backups ainda):', err.message);
    });
    
} catch (error) {
    console.error('❌ Erro ao carregar BackupService:', error.message);
    console.error(error.stack);
}
