/**
 * 📊 SISTEMA DE LOGS AVANÇADO COM WINSTON
 * Data: 07 de Julho de 2025
 * Objetivo: Logs estruturados, rotação automática, múltiplos níveis
 * Prioridade: 🥇 ALTA (Fase 1 do Roadmap)
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// Criar diretório de logs se não existir
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Configuração de formato personalizado
const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint()
);

// Configuração de formato para console
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
        format: 'HH:mm:ss'
    }),
    winston.format.printf(({ timestamp, level, message, service, userId, ...meta }) => {
        let logMsg = `${timestamp} [${level}]`;
        
        if (service) logMsg += ` [${service}]`;
        if (userId) logMsg += ` [User:${userId}]`;
        
        logMsg += `: ${message}`;
        
        if (Object.keys(meta).length > 0) {
            logMsg += ` ${JSON.stringify(meta)}`;
        }
        
        return logMsg;
    })
);

// Configuração do logger principal
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { 
        service: 'loja-tenis-fgt',
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
    },
    transports: [
        // Logs gerais com rotação diária
        new DailyRotateFile({
            filename: path.join(logDir, 'aplicacao-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            level: 'info'
        }),
        
        // Logs de erro separados
        new DailyRotateFile({
            filename: path.join(logDir, 'erro-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d',
            level: 'error'
        }),
        
        // Logs de debug (apenas em desenvolvimento)
        ...(process.env.NODE_ENV === 'development' ? [
            new DailyRotateFile({
                filename: path.join(logDir, 'debug-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '10m',
                maxFiles: '7d',
                level: 'debug'
            })
        ] : [])
    ],
    
    // Tratamento de exceções não capturadas
    exceptionHandlers: [
        new DailyRotateFile({
            filename: path.join(logDir, 'exceptions-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '10m',
            maxFiles: '30d'
        })
    ],
    
    // Tratamento de rejeições de promises
    rejectionHandlers: [
        new DailyRotateFile({
            filename: path.join(logDir, 'rejections-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '10m',
            maxFiles: '30d'
        })
    ]
});

// Adicionar console apenas em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat
    }));
}

// Loggers especializados para diferentes módulos
const createModuleLogger = (moduleName) => {
    return logger.child({ service: moduleName });
};

// Loggers específicos por módulo
const loggers = {
    auth: createModuleLogger('auth'),
    database: createModuleLogger('database'),
    payment: createModuleLogger('payment'),
    notification: createModuleLogger('notification'),
    cart: createModuleLogger('cart'),
    product: createModuleLogger('product'),
    order: createModuleLogger('order'),
    user: createModuleLogger('user'),
    cache: createModuleLogger('cache'),
    api: createModuleLogger('api'),
    security: createModuleLogger('security')
};

// Função para log de performance
const logPerformance = (operation, duration, metadata = {}) => {
    logger.info('Performance metric', {
        operation,
        duration: `${duration}ms`,
        performance: true,
        ...metadata
    });
};

// Função para log de auditoria
const logAudit = (action, userId, resource, metadata = {}) => {
    logger.info('Audit log', {
        action,
        userId,
        resource,
        timestamp: new Date().toISOString(),
        audit: true,
        ...metadata
    });
};

// Função para log de segurança
const logSecurity = (event, level = 'warn', metadata = {}) => {
    logger.log(level, 'Security event', {
        event,
        security: true,
        timestamp: new Date().toISOString(),
        ...metadata
    });
};

// Função para log de negócios
const logBusiness = (event, data = {}) => {
    logger.info('Business event', {
        event,
        business: true,
        timestamp: new Date().toISOString(),
        ...data
    });
};

// Middleware para log de requisições HTTP
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    const originalSend = res.send;
    
    res.send = function(data) {
        const duration = Date.now() - startTime;
        
        loggers.api.info('HTTP Request', {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            userId: req.user?.id,
            requestId: req.headers['x-request-id'] || req.id
        });
        
        originalSend.call(this, data);
    };
    
    next();
};

// Middleware para log de erros
const errorLogger = (err, req, res, next) => {
    loggers.api.error('HTTP Error', {
        error: {
            message: err.message,
            stack: err.stack,
            code: err.code || 'UNKNOWN'
        },
        request: {
            method: req.method,
            url: req.originalUrl,
            headers: req.headers,
            body: req.body,
            userId: req.user?.id,
            ip: req.ip
        },
        response: {
            status: res.statusCode
        }
    });
    
    next(err);
};

// Função para monitorar métricas do sistema
const logSystemMetrics = () => {
    const used = process.memoryUsage();
    const uptime = process.uptime();
    
    logger.info('System metrics', {
        memory: {
            rss: Math.round(used.rss / 1024 / 1024 * 100) / 100,
            heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
            heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
            external: Math.round(used.external / 1024 / 1024 * 100) / 100
        },
        uptime: Math.round(uptime),
        timestamp: new Date().toISOString(),
        metrics: true
    });
};

// Agendar coleta de métricas a cada 5 minutos
setInterval(logSystemMetrics, 5 * 60 * 1000);

// Função para pesquisar logs
const searchLogs = async (query, options = {}) => {
    try {
        const {
            level = 'info',
            start = new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24h
            end = new Date(),
            rows = 100,
            order = 'desc'
        } = options;

        return new Promise((resolve, reject) => {
            const queryOptions = {
                from: start,
                until: end,
                limit: rows,
                order: order,
                fields: ['timestamp', 'level', 'message', 'service', 'userId']
            };

            logger.query(queryOptions, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    } catch (error) {
        logger.error('Error searching logs', { error: error.message });
        throw error;
    }
};

// Função para obter estatísticas de logs
const getLogStats = () => {
    const stats = {
        logDir,
        logFiles: fs.readdirSync(logDir).filter(file => file.endsWith('.log')),
        totalSize: 0,
        lastUpdate: new Date()
    };

    stats.logFiles.forEach(file => {
        const filePath = path.join(logDir, file);
        const stat = fs.statSync(filePath);
        stats.totalSize += stat.size;
    });

    stats.totalSize = Math.round(stats.totalSize / 1024 / 1024 * 100) / 100; // MB

    return stats;
};

module.exports = {
    logger,
    loggers,
    logPerformance,
    logAudit,
    logSecurity,
    logBusiness,
    requestLogger,
    errorLogger,
    searchLogs,
    getLogStats,
    logSystemMetrics
};
