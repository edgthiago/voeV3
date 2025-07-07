/**
 * 🔥 MIDDLEWARE DE CACHE - INTEGRAÇÃO AUTOMÁTICA
 * Data: 07/07/2025
 * Objetivo: Integrar cache Redis automaticamente nas rotas
 */

const cacheService = require('../services/cacheService');

class CacheMiddleware {
    /**
     * 📦 MIDDLEWARE PARA CACHE DE PRODUTOS
     */
    static cacheProduct(ttl = 3600) {
        return async (req, res, next) => {
            const productId = req.params.id || req.params.productId;
            
            if (!productId) {
                return next();
            }

            try {
                // Tentar buscar no cache
                const cachedProduct = await cacheService.getProduct(productId);
                
                if (cachedProduct) {
                    // Adicionar header para indicar cache hit
                    res.set('X-Cache', 'HIT');
                    res.set('X-Cache-Age', new Date() - new Date(cachedProduct.cached_at));
                    
                    return res.json({
                        success: true,
                        data: cachedProduct,
                        cached: true
                    });
                }

                // Se não encontrou no cache, continuar para a rota
                // Modificar res.json para cachear automaticamente
                const originalJson = res.json;
                res.json = function(data) {
                    // Cachear apenas se a resposta for bem-sucedida
                    if (data && data.success && data.data) {
                        cacheService.cacheProduct(productId, data.data, ttl);
                    }
                    
                    // Adicionar header para indicar cache miss
                    res.set('X-Cache', 'MISS');
                    
                    return originalJson.call(this, data);
                };

                next();
            } catch (error) {
                console.error('❌ Erro no middleware de cache de produto:', error);
                next();
            }
        };
    }

    /**
     * 🛒 MIDDLEWARE PARA CACHE DE CARRINHO
     */
    static cacheCart(ttl = 1800) {
        return async (req, res, next) => {
            const userId = req.user?.id || req.body?.userId || req.params?.userId;
            
            if (!userId) {
                return next();
            }

            try {
                // Tentar buscar no cache
                const cachedCart = await cacheService.getCart(userId);
                
                if (cachedCart && req.method === 'GET') {
                    res.set('X-Cache', 'HIT');
                    res.set('X-Cache-Age', new Date() - new Date(cachedCart.cached_at));
                    
                    return res.json({
                        success: true,
                        data: cachedCart,
                        cached: true
                    });
                }

                // Interceptar resposta para cachear
                const originalJson = res.json;
                res.json = function(data) {
                    if (data && data.success && data.data) {
                        cacheService.cacheCart(userId, data.data, ttl);
                    }
                    
                    res.set('X-Cache', 'MISS');
                    return originalJson.call(this, data);
                };

                next();
            } catch (error) {
                console.error('❌ Erro no middleware de cache de carrinho:', error);
                next();
            }
        };
    }

    /**
     * 📊 MIDDLEWARE PARA CACHE DE CONSULTAS GENÉRICAS
     */
    static cacheQuery(generateKey, ttl = 600) {
        return async (req, res, next) => {
            try {
                // Gerar chave única para a consulta
                const cacheKey = typeof generateKey === 'function' ? 
                    generateKey(req) : 
                    `${req.method}:${req.originalUrl}`;

                // Tentar buscar no cache
                const cachedResult = await cacheService.getQuery(cacheKey);
                
                if (cachedResult) {
                    res.set('X-Cache', 'HIT');
                    
                    return res.json({
                        success: true,
                        data: cachedResult,
                        cached: true
                    });
                }

                // Interceptar resposta para cachear
                const originalJson = res.json;
                res.json = function(data) {
                    if (data && data.success) {
                        cacheService.cacheQuery(cacheKey, data.data || data, ttl);
                    }
                    
                    res.set('X-Cache', 'MISS');
                    return originalJson.call(this, data);
                };

                next();
            } catch (error) {
                console.error('❌ Erro no middleware de cache de query:', error);
                next();
            }
        };
    }

    /**
     * 🔄 MIDDLEWARE PARA CACHE DE SESSÕES
     */
    static cacheSession(ttl = 7200) {
        return async (req, res, next) => {
            const sessionId = req.sessionID || req.headers['x-session-id'];
            
            if (!sessionId) {
                return next();
            }

            try {
                // Tentar buscar sessão no cache
                const cachedSession = await cacheService.getSession(sessionId);
                
                if (cachedSession) {
                    req.cachedSession = cachedSession;
                    res.set('X-Session-Cache', 'HIT');
                } else {
                    res.set('X-Session-Cache', 'MISS');
                }

                next();
            } catch (error) {
                console.error('❌ Erro no middleware de cache de sessão:', error);
                next();
            }
        };
    }

    /**
     * 🗑️ MIDDLEWARE PARA INVALIDAÇÃO DE CACHE
     */
    static invalidateCache(type) {
        return async (req, res, next) => {
            const originalJson = res.json;
            
            res.json = function(data) {
                // Invalidar cache após operações de escrita bem-sucedidas
                if (data && data.success) {
                    switch (type) {
                        case 'product':
                            const productId = req.params.id || req.params.productId;
                            if (productId) {
                                cacheService.invalidateProduct(productId);
                            }
                            break;
                            
                        case 'cart':
                            const userId = req.user?.id || req.body?.userId;
                            if (userId) {
                                cacheService.invalidateCart(userId);
                            }
                            break;
                            
                        case 'products':
                            cacheService.invalidatePattern('product:*');
                            break;
                            
                        case 'queries':
                            cacheService.invalidatePattern('query:*');
                            break;
                    }
                }
                
                return originalJson.call(this, data);
            };

            next();
        };
    }

    /**
     * 📊 MIDDLEWARE PARA ESTATÍSTICAS DE CACHE
     */
    static cacheStats() {
        return async (req, res, next) => {
            try {
                const stats = await cacheService.getCacheStats();
                
                if (stats) {
                    res.set('X-Cache-Stats', JSON.stringify(stats));
                }

                next();
            } catch (error) {
                console.error('❌ Erro ao buscar estatísticas do cache:', error);
                next();
            }
        };
    }

    /**
     * 🔧 MIDDLEWARE PARA CONFIGURAÇÃO DINÂMICA
     */
    static configurableCache(options = {}) {
        return async (req, res, next) => {
            const {
                keyGenerator = (req) => `${req.method}:${req.originalUrl}`,
                ttl = 600,
                condition = () => true,
                onHit = () => {},
                onMiss = () => {}
            } = options;

            try {
                // Verificar se deve usar cache
                if (!condition(req)) {
                    return next();
                }

                const cacheKey = keyGenerator(req);
                const cachedResult = await cacheService.getQuery(cacheKey);
                
                if (cachedResult) {
                    res.set('X-Cache', 'HIT');
                    onHit(req, res, cachedResult);
                    
                    return res.json({
                        success: true,
                        data: cachedResult,
                        cached: true
                    });
                }

                // Interceptar resposta
                const originalJson = res.json;
                res.json = function(data) {
                    if (data && data.success) {
                        cacheService.cacheQuery(cacheKey, data.data || data, ttl);
                        onMiss(req, res, data);
                    }
                    
                    res.set('X-Cache', 'MISS');
                    return originalJson.call(this, data);
                };

                next();
            } catch (error) {
                console.error('❌ Erro no middleware configurável de cache:', error);
                next();
            }
        };
    }
}

module.exports = CacheMiddleware;

/**
 * 🎯 EXEMPLOS DE USO:
 * 
 * // Cache de produto específico
 * router.get('/produto/:id', CacheMiddleware.cacheProduct(3600), getProduto);
 * 
 * // Cache de carrinho
 * router.get('/carrinho', CacheMiddleware.cacheCart(1800), getCarrinho);
 * 
 * // Cache de consulta personalizada
 * router.get('/produtos', CacheMiddleware.cacheQuery(
 *   (req) => `produtos:${req.query.categoria}:${req.query.page}`,
 *   600
 * ), getProdutos);
 * 
 * // Invalidar cache após update
 * router.put('/produto/:id', CacheMiddleware.invalidateCache('product'), updateProduto);
 * 
 * // Estatísticas de cache
 * router.get('/cache/stats', CacheMiddleware.cacheStats(), (req, res) => {
 *   res.json({ success: true, message: 'Check headers for cache stats' });
 * });
 */
