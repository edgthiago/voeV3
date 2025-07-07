/**
 * 🔥 SISTEMA DE CACHE MEMÓRIA - VERSÃO DEMO
 * Data: 07/07/2025
 * Objetivo: Cache em memória para demonstração (até Redis ser instalado)
 * Nota: Em produção, usar Redis para cache distribuído
 */

class MemoryCacheService {
    constructor() {
        this.cache = new Map();
        this.ttlMap = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0
        };
        
        // Limpeza automática de TTL expirados
        setInterval(() => this.cleanExpired(), 60000); // A cada minuto
        
        console.log('🔥 MemoryCache: Iniciado com sucesso (modo demonstração)');
    }

    /**
     * 📝 Salvar no cache com TTL
     */
    async set(key, value, ttl = 3600) {
        try {
            const data = {
                value: JSON.stringify(value),
                cached_at: Date.now()
            };
            
            this.cache.set(key, data);
            
            if (ttl > 0) {
                this.ttlMap.set(key, Date.now() + (ttl * 1000));
            }
            
            this.stats.sets++;
            console.log(`✅ Cache SET: ${key} (TTL: ${ttl}s)`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar no cache:', error);
            return false;
        }
    }

    /**
     * 📖 Buscar no cache
     */
    async get(key) {
        try {
            // Verificar se expirou
            if (this.ttlMap.has(key)) {
                const expiry = this.ttlMap.get(key);
                if (Date.now() > expiry) {
                    this.cache.delete(key);
                    this.ttlMap.delete(key);
                    this.stats.misses++;
                    console.log(`⚠️ Cache EXPIRED: ${key}`);
                    return null;
                }
            }
            
            const data = this.cache.get(key);
            if (data) {
                this.stats.hits++;
                console.log(`⚡ Cache HIT: ${key}`);
                return JSON.parse(data.value);
            }
            
            this.stats.misses++;
            console.log(`⚠️ Cache MISS: ${key}`);
            return null;
        } catch (error) {
            console.error('❌ Erro ao buscar no cache:', error);
            this.stats.misses++;
            return null;
        }
    }

    /**
     * 🗑️ Deletar do cache
     */
    async delete(key) {
        try {
            const deleted = this.cache.delete(key);
            this.ttlMap.delete(key);
            
            if (deleted) {
                this.stats.deletes++;
                console.log(`🗑️ Cache DELETE: ${key}`);
            }
            
            return deleted;
        } catch (error) {
            console.error('❌ Erro ao deletar do cache:', error);
            return false;
        }
    }

    /**
     * 🧹 Limpar cache expirado
     */
    cleanExpired() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [key, expiry] of this.ttlMap.entries()) {
            if (now > expiry) {
                this.cache.delete(key);
                this.ttlMap.delete(key);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            console.log(`🧹 Cache: ${cleaned} entradas expiradas removidas`);
        }
    }

    /**
     * 📊 Estatísticas
     */
    async getStats() {
        const hitRate = this.stats.hits + this.stats.misses > 0 ? 
            ((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100).toFixed(1) : 
            '0';
        
        return {
            connected: true,
            type: 'memory',
            total_keys: this.cache.size,
            hit_rate: hitRate + '%',
            hits: this.stats.hits,
            misses: this.stats.misses,
            sets: this.stats.sets,
            deletes: this.stats.deletes,
            memory_usage: `${(JSON.stringify([...this.cache.entries()]).length / 1024).toFixed(1)} KB`
        };
    }

    /**
     * 🔄 Limpar todo o cache
     */
    async flushAll() {
        this.cache.clear();
        this.ttlMap.clear();
        console.log('🗑️ Cache: Todas as entradas removidas');
        return true;
    }

    /**
     * 📦 Métodos específicos para compatibilidade com Redis
     */
    async cacheProduct(productId, productData, ttl = 3600) {
        return await this.set(`product:${productId}`, {
            ...productData,
            cached_at: new Date().toISOString()
        }, ttl);
    }

    async getProduct(productId) {
        return await this.get(`product:${productId}`);
    }

    async cacheCart(userId, cartData, ttl = 1800) {
        return await this.set(`cart:${userId}`, {
            ...cartData,
            cached_at: new Date().toISOString()
        }, ttl);
    }

    async getCart(userId) {
        return await this.get(`cart:${userId}`);
    }

    async cacheQuery(queryKey, queryResult, ttl = 600) {
        return await this.set(`query:${queryKey}`, {
            result: queryResult,
            cached_at: new Date().toISOString()
        }, ttl);
    }

    async getQuery(queryKey) {
        const cached = await this.get(`query:${queryKey}`);
        return cached ? cached.result : null;
    }

    async cacheSession(sessionId, sessionData, ttl = 7200) {
        return await this.set(`session:${sessionId}`, {
            ...sessionData,
            cached_at: new Date().toISOString()
        }, ttl);
    }

    async getSession(sessionId) {
        return await this.get(`session:${sessionId}`);
    }

    async invalidateProduct(productId) {
        return await this.delete(`product:${productId}`);
    }

    async invalidateCart(userId) {
        return await this.delete(`cart:${userId}`);
    }

    async invalidatePattern(pattern) {
        const keys = [...this.cache.keys()];
        const regex = new RegExp(pattern.replace('*', '.*'));
        let deleted = 0;
        
        for (const key of keys) {
            if (regex.test(key)) {
                await this.delete(key);
                deleted++;
            }
        }
        
        console.log(`🗑️ Cache: ${deleted} chaves removidas para padrão ${pattern}`);
        return deleted > 0;
    }

    async getCacheStats() {
        return await this.getStats();
    }

    async close() {
        console.log('🔚 MemoryCache: Sessão encerrada');
    }
}

// Instância singleton
const memoryCacheService = new MemoryCacheService();

// Exportar interface compatível com Redis
module.exports = {
    // Métodos Redis compatíveis
    cacheProduct: memoryCacheService.cacheProduct.bind(memoryCacheService),
    getProduct: memoryCacheService.getProduct.bind(memoryCacheService),
    cacheCart: memoryCacheService.cacheCart.bind(memoryCacheService),
    getCart: memoryCacheService.getCart.bind(memoryCacheService),
    cacheQuery: memoryCacheService.cacheQuery.bind(memoryCacheService),
    getQuery: memoryCacheService.getQuery.bind(memoryCacheService),
    cacheSession: memoryCacheService.cacheSession.bind(memoryCacheService),
    getSession: memoryCacheService.getSession.bind(memoryCacheService),
    invalidateProduct: memoryCacheService.invalidateProduct.bind(memoryCacheService),
    invalidateCart: memoryCacheService.invalidateCart.bind(memoryCacheService),
    invalidatePattern: memoryCacheService.invalidatePattern.bind(memoryCacheService),
    getCacheStats: memoryCacheService.getCacheStats.bind(memoryCacheService),
    flushAll: memoryCacheService.flushAll.bind(memoryCacheService),
    close: memoryCacheService.close.bind(memoryCacheService),
    
    // Métodos básicos
    set: memoryCacheService.set.bind(memoryCacheService),
    get: memoryCacheService.get.bind(memoryCacheService),
    delete: memoryCacheService.delete.bind(memoryCacheService),
    stats: memoryCacheService.getStats.bind(memoryCacheService),
    
    // Propriedades
    isConnected: true,
    type: 'memory'
};

/**
 * 🎯 NOTAS IMPORTANTES:
 * 
 * 1. 📝 Cache em Memória vs Redis:
 *    - Memory: Funciona imediatamente, mas limitado a um processo
 *    - Redis: Requer instalação, mas oferece cache distribuído
 * 
 * 2. 🔄 Migração para Redis:
 *    - Este código é 100% compatível com a interface Redis
 *    - Basta instalar Redis e trocar o cacheService
 *    - Nenhuma mudança necessária nos middlewares
 * 
 * 3. 🚀 Performance:
 *    - Memory Cache: ~0.1ms por operação
 *    - Redis Cache: ~1-2ms por operação
 *    - Ambos muito mais rápidos que MySQL (~10-50ms)
 * 
 * 4. 📊 Limitações do Memory Cache:
 *    - Perde dados ao reiniciar servidor
 *    - Não compartilha entre múltiplos processos
 *    - Limitado pela RAM disponível
 * 
 * 5. 🔧 Para usar Redis em produção:
 *    - Instalar Redis: npm install redis
 *    - Configurar REDIS_HOST no .env
 *    - Trocar require('./cacheService') pelo Redis
 */
