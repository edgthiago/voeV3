/**
 * 🔥 SISTEMA DE CACHE REDIS - PRIORIDADE MÁXIMA
 * Data: 07/07/2025
 * Objetivo: Reduzir 70% do tempo de resposta e melhorar performance
 * Fallback: Memory cache se Redis não estiver disponível
 */

const redis = require('redis');
const memoryCacheService = require('./memoryCacheService');
require('dotenv').config();

class CacheService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.useMemoryFallback = false;
        this.defaultTTL = 3600; // 1 hora em segundos
        this.init();
    }

    async init() {
        try {
            // Configuração do cliente Redis
            this.client = redis.createClient({
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                password: process.env.REDIS_PASSWORD || undefined,
                retry_strategy: (options) => {
                    if (options.error && options.error.code === 'ECONNREFUSED') {
                        console.warn('⚠️ Redis não disponível, usando Memory Cache como fallback');
                        this.useMemoryFallback = true;
                        return false; // Não tentar reconectar
                    }
                    if (options.total_retry_time > 1000 * 10) { // 10 segundos
                        console.warn('⚠️ Redis timeout, usando Memory Cache como fallback');
                        this.useMemoryFallback = true;
                        return false;
                    }
                    return Math.min(options.attempt * 100, 3000);
                }
            });

            // Event listeners
            this.client.on('connect', () => {
                console.log('🔗 Redis: Conectado com sucesso');
                this.isConnected = true;
                this.useMemoryFallback = false;
            });

            this.client.on('error', (err) => {
                console.warn('⚠️ Redis Error, usando Memory Cache:', err.message);
                this.isConnected = false;
                this.useMemoryFallback = true;
            });

            this.client.on('end', () => {
                console.log('🔚 Redis: Conexão encerrada, usando Memory Cache');
                this.isConnected = false;
                this.useMemoryFallback = true;
            });

            // Tentar conectar com timeout
            const connectTimeout = setTimeout(() => {
                console.warn('⚠️ Redis timeout, usando Memory Cache como fallback');
                this.useMemoryFallback = true;
            }, 3000);

            try {
                await this.client.connect();
                clearTimeout(connectTimeout);
            } catch (error) {
                clearTimeout(connectTimeout);
                console.warn('⚠️ Redis não disponível, usando Memory Cache como fallback');
                this.useMemoryFallback = true;
            }
            
        } catch (error) {
            console.warn('⚠️ Erro ao inicializar Redis, usando Memory Cache:', error.message);
            this.isConnected = false;
            this.useMemoryFallback = true;
        }
    }

    /**
     * 🎯 CACHE DE PRODUTOS - Alto impacto na performance
     */
    async cacheProduct(productId, productData, ttl = this.defaultTTL) {
        if (this.useMemoryFallback) {
            return await memoryCacheService.cacheProduct(productId, productData, ttl);
        }
        
        if (!this.isConnected) return false;
        
        try {
            const key = `product:${productId}`;
            const value = JSON.stringify({
                ...productData,
                cached_at: new Date().toISOString()
            });
            
            await this.client.setEx(key, ttl, value);
            console.log(`✅ Cache: Produto ${productId} armazenado`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao cachear produto:', error);
            // Fallback para memory cache
            return await memoryCacheService.cacheProduct(productId, productData, ttl);
        }
    }

    async getProduct(productId) {
        if (this.useMemoryFallback) {
            return await memoryCacheService.getProduct(productId);
        }
        
        if (!this.isConnected) return null;
        
        try {
            const key = `product:${productId}`;
            const cached = await this.client.get(key);
            
            if (cached) {
                console.log(`⚡ Cache HIT: Produto ${productId}`);
                return JSON.parse(cached);
            }
            
            console.log(`⚠️ Cache MISS: Produto ${productId}`);
            return null;
        } catch (error) {
            console.error('❌ Erro ao buscar produto no cache:', error);
            // Fallback para memory cache
            return await memoryCacheService.getProduct(productId);
        }
    }

    /**
     * 🛒 CACHE DE CARRINHO - Sessões de usuário
     */
    async cacheCart(userId, cartData, ttl = 1800) { // 30 minutos
        if (!this.isConnected) return false;
        
        try {
            const key = `cart:${userId}`;
            const value = JSON.stringify({
                ...cartData,
                cached_at: new Date().toISOString()
            });
            
            await this.client.setEx(key, ttl, value);
            console.log(`✅ Cache: Carrinho do usuário ${userId} armazenado`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao cachear carrinho:', error);
            return false;
        }
    }

    async getCart(userId) {
        if (!this.isConnected) return null;
        
        try {
            const key = `cart:${userId}`;
            const cached = await this.client.get(key);
            
            if (cached) {
                console.log(`⚡ Cache HIT: Carrinho do usuário ${userId}`);
                return JSON.parse(cached);
            }
            
            return null;
        } catch (error) {
            console.error('❌ Erro ao buscar carrinho no cache:', error);
            return null;
        }
    }

    /**
     * 📊 CACHE DE CONSULTAS PESADAS - Queries complexas
     */
    async cacheQuery(queryKey, queryResult, ttl = 600) { // 10 minutos
        if (!this.isConnected) return false;
        
        try {
            const key = `query:${queryKey}`;
            const value = JSON.stringify({
                result: queryResult,
                cached_at: new Date().toISOString()
            });
            
            await this.client.setEx(key, ttl, value);
            console.log(`✅ Cache: Query ${queryKey} armazenada`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao cachear query:', error);
            return false;
        }
    }

    async getQuery(queryKey) {
        if (!this.isConnected) return null;
        
        try {
            const key = `query:${queryKey}`;
            const cached = await this.client.get(key);
            
            if (cached) {
                console.log(`⚡ Cache HIT: Query ${queryKey}`);
                return JSON.parse(cached).result;
            }
            
            return null;
        } catch (error) {
            console.error('❌ Erro ao buscar query no cache:', error);
            return null;
        }
    }

    /**
     * 🔄 CACHE DE SESSÕES - Autenticação JWT
     */
    async cacheSession(sessionId, sessionData, ttl = 7200) { // 2 horas
        if (!this.isConnected) return false;
        
        try {
            const key = `session:${sessionId}`;
            const value = JSON.stringify({
                ...sessionData,
                cached_at: new Date().toISOString()
            });
            
            await this.client.setEx(key, ttl, value);
            console.log(`✅ Cache: Sessão ${sessionId} armazenada`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao cachear sessão:', error);
            return false;
        }
    }

    async getSession(sessionId) {
        if (!this.isConnected) return null;
        
        try {
            const key = `session:${sessionId}`;
            const cached = await this.client.get(key);
            
            if (cached) {
                console.log(`⚡ Cache HIT: Sessão ${sessionId}`);
                return JSON.parse(cached);
            }
            
            return null;
        } catch (error) {
            console.error('❌ Erro ao buscar sessão no cache:', error);
            return null;
        }
    }

    /**
     * 🗑️ INVALIDAÇÃO DE CACHE - Controle de consistência
     */
    async invalidateProduct(productId) {
        if (!this.isConnected) return false;
        
        try {
            const key = `product:${productId}`;
            await this.client.del(key);
            console.log(`🗑️ Cache: Produto ${productId} invalidado`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao invalidar produto:', error);
            return false;
        }
    }

    async invalidateCart(userId) {
        if (!this.isConnected) return false;
        
        try {
            const key = `cart:${userId}`;
            await this.client.del(key);
            console.log(`🗑️ Cache: Carrinho do usuário ${userId} invalidado`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao invalidar carrinho:', error);
            return false;
        }
    }

    async invalidatePattern(pattern) {
        if (!this.isConnected) return false;
        
        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(keys);
                console.log(`🗑️ Cache: ${keys.length} chaves invalidadas para padrão ${pattern}`);
            }
            return true;
        } catch (error) {
            console.error('❌ Erro ao invalidar padrão:', error);
            return false;
        }
    }

    /**
     * 📊 MÉTRICAS DE CACHE - Monitoramento
     */
    async getCacheStats() {
        if (this.useMemoryFallback) {
            return await memoryCacheService.getCacheStats();
        }
        
        if (!this.isConnected) return null;
        
        try {
            const info = await this.client.info('stats');
            const stats = {};
            
            info.split('\r\n').forEach(line => {
                if (line.includes(':')) {
                    const [key, value] = line.split(':');
                    stats[key] = value;
                }
            });
            
            return {
                connected: this.isConnected,
                type: 'redis',
                keyspace_hits: stats.keyspace_hits || 0,
                keyspace_misses: stats.keyspace_misses || 0,
                hit_rate: stats.keyspace_hits && stats.keyspace_misses ? 
                    (stats.keyspace_hits / (parseInt(stats.keyspace_hits) + parseInt(stats.keyspace_misses)) * 100).toFixed(2) + '%' : 
                    'N/A',
                memory_usage: stats.used_memory_human || 'N/A',
                total_commands: stats.total_commands_processed || 0
            };
        } catch (error) {
            console.error('❌ Erro ao buscar estatísticas do cache:', error);
            // Fallback para memory cache
            return await memoryCacheService.getCacheStats();
        }
    }

    /**
     * 🔄 FLUSH - Limpeza completa do cache
     */
    async flushAll() {
        if (this.useMemoryFallback) {
            return await memoryCacheService.flushAll();
        }
        
        if (!this.isConnected) return false;
        
        try {
            await this.client.flushAll();
            console.log('🗑️ Cache: Todas as chaves foram removidas');
            return true;
        } catch (error) {
            console.error('❌ Erro ao limpar cache:', error);
            return false;
        }
    }

    /**
     * 🔚 ENCERRAMENTO - Cleanup
     */
    async close() {
        if (this.useMemoryFallback) {
            return await memoryCacheService.close();
        }
        
        if (this.client) {
            await this.client.quit();
            console.log('🔚 Redis: Conexão encerrada');
        }
    }

    // Métodos simplificados que usam fallback automático
    async cacheCart(userId, cartData, ttl = 1800) {
        if (this.useMemoryFallback) {
            return await memoryCacheService.cacheCart(userId, cartData, ttl);
        }
        return await this.cacheProduct(`cart:${userId}`, cartData, ttl);
    }

    async getCart(userId) {
        if (this.useMemoryFallback) {
            return await memoryCacheService.getCart(userId);
        }
        return await this.getProduct(`cart:${userId}`);
    }

    async cacheQuery(queryKey, queryResult, ttl = 600) {
        if (this.useMemoryFallback) {
            return await memoryCacheService.cacheQuery(queryKey, queryResult, ttl);
        }
        return await this.cacheProduct(`query:${queryKey}`, queryResult, ttl);
    }

    async getQuery(queryKey) {
        if (this.useMemoryFallback) {
            return await memoryCacheService.getQuery(queryKey);
        }
        const result = await this.getProduct(`query:${queryKey}`);
        return result ? result.result : null;
    }

    async invalidateProduct(productId) {
        if (this.useMemoryFallback) {
            return await memoryCacheService.invalidateProduct(productId);
        }
        
        if (!this.isConnected) return false;
        
        try {
            const key = `product:${productId}`;
            await this.client.del(key);
            console.log(`🗑️ Cache: Produto ${productId} invalidado`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao invalidar produto:', error);
            return false;
        }
    }

    async invalidateCart(userId) {
        if (this.useMemoryFallback) {
            return await memoryCacheService.invalidateCart(userId);
        }
        return await this.invalidateProduct(`cart:${userId}`);
    }

    async invalidatePattern(pattern) {
        if (this.useMemoryFallback) {
            return await memoryCacheService.invalidatePattern(pattern);
        }
        
        if (!this.isConnected) return false;
        
        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(keys);
                console.log(`🗑️ Cache: ${keys.length} chaves invalidadas para padrão ${pattern}`);
            }
            return true;
        } catch (error) {
            console.error('❌ Erro ao invalidar padrão:', error);
            return false;
        }
    }
}

// Singleton instance
const cacheService = new CacheService();

module.exports = cacheService;

/**
 * 🎯 BENEFÍCIOS ESPERADOS:
 * - 70% redução no tempo de resposta
 * - 50% menos carga no MySQL
 * - Melhor experiência do usuário
 * - Suporte a mais usuários simultâneos
 * - Base sólida para outras melhorias
 */
