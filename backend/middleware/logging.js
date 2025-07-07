/**
 * 📊 MIDDLEWARE DE LOGS AVANÇADO
 * Data: 07 de Julho de 2025
 * Objetivo: Middleware para captura automática de logs e métricas
 */

const { loggers, logPerformance, logAudit, logSecurity } = require('../services/loggerService');

// Middleware para log de requisições com métricas avançadas
const requestLoggingMiddleware = (req, res, next) => {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] || 
                     `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Adicionar requestId ao request
    req.requestId = requestId;
    
    // Capturar dados da requisição
    const requestData = {
        method: req.method,
        url: req.originalUrl,
        headers: {
            'user-agent': req.get ? req.get('User-Agent') : req.headers['user-agent'],
            'content-type': req.get ? req.get('Content-Type') : req.headers['content-type'],
            'accept': req.get ? req.get('Accept') : req.headers['accept'],
            'x-forwarded-for': req.get ? req.get('X-Forwarded-For') : req.headers['x-forwarded-for']
        },
        ip: req.ip,
        requestId,
        timestamp: new Date().toISOString()
    };

    // Log inicial da requisição
    loggers.api.info('Request started', requestData);

    // Interceptar response
    const originalSend = res.send;
    const originalJson = res.json;
    
    res.send = function(data) {
        const duration = Date.now() - startTime;
        
        loggers.api.info('Request completed', {
            ...requestData,
            status: res.statusCode,
            duration: `${duration}ms`,
            responseSize: data ? Buffer.byteLength(data, 'utf8') : 0,
            userId: req.user?.id
        });
        
        // Log de performance se requisição demorar mais que 1 segundo
        if (duration > 1000) {
            logPerformance('slow_request', duration, {
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                userId: req.user?.id
            });
        }
        
        originalSend.call(this, data);
    };
    
    res.json = function(data) {
        const duration = Date.now() - startTime;
        
        loggers.api.info('Request completed', {
            ...requestData,
            status: res.statusCode,
            duration: `${duration}ms`,
            responseSize: JSON.stringify(data).length,
            userId: req.user?.id
        });
        
        if (duration > 1000) {
            logPerformance('slow_request', duration, {
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                userId: req.user?.id
            });
        }
        
        originalJson.call(this, data);
    };
    
    next();
};

// Middleware para log de erros detalhado
const errorLoggingMiddleware = (err, req, res, next) => {
    const errorData = {
        error: {
            message: err.message,
            stack: err.stack,
            code: err.code || 'UNKNOWN',
            name: err.name || 'Error'
        },
        request: {
            method: req.method,
            url: req.originalUrl,
            headers: req.headers,
            body: req.body,
            params: req.params,
            query: req.query,
            userId: req.user?.id,
            ip: req.ip,
            requestId: req.requestId
        },
        response: {
            status: res.statusCode
        },
        timestamp: new Date().toISOString()
    };
    
    // Log baseado no nível de erro
    if (res.statusCode >= 500) {
        loggers.api.error('Server error', errorData);
    } else if (res.statusCode >= 400) {
        loggers.api.warn('Client error', errorData);
    } else {
        loggers.api.info('Request error', errorData);
    }
    
    next(err);
};

// Middleware para log de autenticação
const authLoggingMiddleware = (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
        if (req.route && req.route.path.includes('/auth/')) {
            const success = res.statusCode === 200;
            
            logAudit(
                success ? 'auth_success' : 'auth_failure',
                req.body?.email || req.user?.id || 'anonymous',
                'authentication',
                {
                    method: req.method,
                    url: req.originalUrl,
                    status: res.statusCode,
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                }
            );
            
            if (!success) {
                logSecurity('failed_login_attempt', 'warn', {
                    email: req.body?.email,
                    ip: req.ip,
                    userAgent: req.get ? req.get('User-Agent') : req.headers['user-agent'],
                    timestamp: new Date().toISOString()
                });
            }
        }
        
        originalSend.call(this, data);
    };
    
    next();
};

// Middleware para log de operações de negócio
const businessLoggingMiddleware = (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
        if (res.statusCode === 200 || res.statusCode === 201) {
            // Log de eventos de negócio importantes
            if (req.route) {
                const route = req.route.path.toLowerCase();
                
                if (route.includes('/pedidos') && req.method === 'POST') {
                    loggers.order.info('Order created', {
                        userId: req.user?.id,
                        orderId: JSON.parse(data || '{}').id,
                        timestamp: new Date().toISOString()
                    });
                }
                
                if (route.includes('/pagamentos') && req.method === 'POST') {
                    loggers.payment.info('Payment processed', {
                        userId: req.user?.id,
                        amount: req.body?.valor,
                        method: req.body?.metodo_pagamento,
                        timestamp: new Date().toISOString()
                    });
                }
                
                if (route.includes('/produtos') && req.method === 'POST') {
                    loggers.product.info('Product created', {
                        userId: req.user?.id,
                        productName: req.body?.nome,
                        timestamp: new Date().toISOString()
                    });
                }
                
                if (route.includes('/usuarios') && req.method === 'POST') {
                    loggers.user.info('User registered', {
                        email: req.body?.email,
                        userType: req.body?.tipo_usuario,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        }
        
        originalSend.call(this, data);
    };
    
    next();
};

// Middleware para log de cache
const cacheLoggingMiddleware = (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
        if (req.cached) {
            loggers.cache.info('Cache hit', {
                key: req.cacheKey,
                url: req.originalUrl,
                userId: req.user?.id,
                timestamp: new Date().toISOString()
            });
        } else if (req.cacheKey) {
            loggers.cache.info('Cache miss', {
                key: req.cacheKey,
                url: req.originalUrl,
                userId: req.user?.id,
                timestamp: new Date().toISOString()
            });
        }
        
        originalSend.call(this, data);
    };
    
    next();
};

// Middleware para log de segurança
const securityLoggingMiddleware = (req, res, next) => {
    // Detectar tentativas suspeitas
    const suspiciousPatterns = [
        /(\.\.|\/\.\.|\.\.\/)/,  // Path traversal
        /(script|javascript|onload|onerror)/i,  // XSS
        /(union|select|insert|update|delete|drop)/i,  // SQL injection
        /(<|%3C|&lt;)/  // HTML injection
    ];
    
    const requestString = JSON.stringify({
        url: req.originalUrl,
        body: req.body,
        query: req.query,
        params: req.params
    });
    
    const isSuspicious = suspiciousPatterns.some(pattern => 
        pattern.test(requestString)
    );
    
    if (isSuspicious) {
        logSecurity('suspicious_request', 'warn', {
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            userAgent: req.get ? req.get('User-Agent') : req.headers['user-agent'],
            suspiciousContent: requestString,
            timestamp: new Date().toISOString()
        });
    }
    
    // Log de tentativas de acesso a recursos protegidos
    if (req.originalUrl.includes('/admin/') && !req.user?.isAdmin) {
        logSecurity('unauthorized_admin_access', 'error', {
            url: req.originalUrl,
            userId: req.user?.id,
            ip: req.ip,
            timestamp: new Date().toISOString()
        });
    }
    
    next();
};

// Middleware para log de database
const databaseLoggingMiddleware = (originalQuery) => {
    return function(sql, params, callback) {
        const startTime = Date.now();
        
        const wrappedCallback = (err, results) => {
            const duration = Date.now() - startTime;
            
            if (err) {
                loggers.database.error('Database error', {
                    sql: sql.substring(0, 200),
                    params: params?.slice(0, 5), // Limitar params para evitar logs muito grandes
                    error: err.message,
                    duration: `${duration}ms`,
                    timestamp: new Date().toISOString()
                });
            } else {
                loggers.database.info('Database query', {
                    sql: sql.substring(0, 200),
                    duration: `${duration}ms`,
                    rowCount: Array.isArray(results) ? results.length : 1,
                    timestamp: new Date().toISOString()
                });
                
                // Log de queries lentas
                if (duration > 1000) {
                    logPerformance('slow_database_query', duration, {
                        sql: sql.substring(0, 200),
                        params: params?.slice(0, 5)
                    });
                }
            }
            
            if (callback) callback(err, results);
        };
        
        return originalQuery.call(this, sql, params, wrappedCallback);
    };
};

module.exports = {
    requestLoggingMiddleware,
    errorLoggingMiddleware,
    authLoggingMiddleware,
    businessLoggingMiddleware,
    cacheLoggingMiddleware,
    securityLoggingMiddleware,
    databaseLoggingMiddleware
};
