/**
 * @fileoverview Gerenciador de eventos do sistema
 * @description Coordena eventos e notificações automáticas
 * @author Sistema de Loja de Tênis
 * @version 1.0
 */

const notificacaoService = require('../services/notificacaoService');
const conexao = require('../banco/conexao');

class EventoManager {
    constructor() {
        this.listeners = {};
        this.configurarEventos();
    }

    /**
     * Configurar eventos padrão do sistema
     */
    configurarEventos() {
        // Eventos de pedido
        this.on('pedido_criado', this.onPedidoCriado.bind(this));
        this.on('pedido_confirmado', this.onPedidoConfirmado.bind(this));
        this.on('pedido_cancelado', this.onPedidoCancelado.bind(this));

        // Eventos de pagamento
        this.on('pagamento_aprovado', this.onPagamentoAprovado.bind(this));
        this.on('pagamento_rejeitado', this.onPagamentoRejeitado.bind(this));

        // Eventos de status
        this.on('pedido_em_preparacao', this.onPedidoEmPreparacao.bind(this));
        this.on('pedido_enviado', this.onPedidoEnviado.bind(this));
        this.on('pedido_em_transito', this.onPedidoEmTransito.bind(this));
        this.on('pedido_entregue', this.onPedidoEntregue.bind(this));

        // Eventos de estoque
        this.on('estoque_baixo', this.onEstoqueBaixo.bind(this));
        this.on('produto_esgotado', this.onProdutoEsgotado.bind(this));

        // Eventos de usuário
        this.on('usuario_cadastrado', this.onUsuarioCadastrado.bind(this));
        this.on('usuario_logado', this.onUsuarioLogado.bind(this));
    }

    /**
     * Registrar listener para evento
     */
    on(evento, callback) {
        if (!this.listeners[evento]) {
            this.listeners[evento] = [];
        }
        this.listeners[evento].push(callback);
    }

    /**
     * Emitir evento
     */
    async emit(evento, dados) {
        try {
            console.log(`🎯 Emitindo evento: ${evento}`);
            
            if (this.listeners[evento]) {
                const promises = this.listeners[evento].map(callback => {
                    return Promise.resolve(callback(dados)).catch(error => {
                        console.error(`❌ Erro no listener do evento ${evento}:`, error);
                    });
                });
                
                await Promise.all(promises);
            }

            // Salvar log do evento
            await this.salvarLogEvento(evento, dados);

        } catch (error) {
            console.error(`❌ Erro ao emitir evento ${evento}:`, error);
        }
    }

    /**
     * Event handlers
     */
    async onPedidoCriado(dados) {
        console.log('📦 Pedido criado:', dados.pedido_id);
        
        await notificacaoService.enviarNotificacaoCompleta({
            usuario_id: dados.usuario_id,
            template: 'pedido_criado',
            dados,
            canais: ['email', 'push']
        });
    }

    async onPedidoConfirmado(dados) {
        console.log('✅ Pedido confirmado:', dados.pedido_id);
        
        await notificacaoService.enviarNotificacaoCompleta({
            usuario_id: dados.usuario_id,
            template: 'pedido_criado',
            dados,
            canais: ['email', 'sms', 'push']
        });
    }

    async onPedidoCancelado(dados) {
        console.log('❌ Pedido cancelado:', dados.pedido_id);
        
        await notificacaoService.enviarNotificacaoCompleta({
            usuario_id: dados.usuario_id,
            template: 'pedido_cancelado',
            dados,
            canais: ['email', 'push']
        });
    }

    async onPagamentoAprovado(dados) {
        console.log('💰 Pagamento aprovado:', dados.pedido_id);
        
        await notificacaoService.enviarNotificacaoCompleta({
            usuario_id: dados.usuario_id,
            template: 'pagamento_aprovado',
            dados,
            canais: ['email', 'sms', 'push']
        });
    }

    async onPagamentoRejeitado(dados) {
        console.log('💳 Pagamento rejeitado:', dados.pedido_id);
        
        await notificacaoService.enviarNotificacaoCompleta({
            usuario_id: dados.usuario_id,
            template: 'pagamento_rejeitado',
            dados,
            canais: ['email', 'push']
        });
    }

    async onPedidoEmPreparacao(dados) {
        console.log('⏳ Pedido em preparação:', dados.pedido_id);
        
        await notificacaoService.enviarNotificacaoCompleta({
            usuario_id: dados.usuario_id,
            template: 'pedido_em_preparacao',
            dados,
            canais: ['email', 'push']
        });
    }

    async onPedidoEnviado(dados) {
        console.log('🚚 Pedido enviado:', dados.pedido_id);
        
        await notificacaoService.enviarNotificacaoCompleta({
            usuario_id: dados.usuario_id,
            template: 'pedido_enviado',
            dados,
            canais: ['email', 'sms', 'push']
        });
    }

    async onPedidoEmTransito(dados) {
        console.log('🛣️ Pedido em trânsito:', dados.pedido_id);
        
        await notificacaoService.enviarNotificacaoCompleta({
            usuario_id: dados.usuario_id,
            template: 'pedido_em_transito',
            dados,
            canais: ['push']
        });
    }

    async onPedidoEntregue(dados) {
        console.log('🎉 Pedido entregue:', dados.pedido_id);
        
        await notificacaoService.enviarNotificacaoCompleta({
            usuario_id: dados.usuario_id,
            template: 'pedido_entregue',
            dados,
            canais: ['email', 'sms', 'push']
        });
    }

    async onEstoqueBaixo(dados) {
        console.log('⚠️ Estoque baixo:', dados.produto_id);
        
        // Notificar administradores
        const admins = await this.buscarAdministradores();
        
        for (const admin of admins) {
            await notificacaoService.enviarNotificacaoCompleta({
                usuario_id: admin.id,
                template: 'estoque_baixo',
                dados,
                canais: ['email']
            });
        }
    }

    async onProdutoEsgotado(dados) {
        console.log('🚫 Produto esgotado:', dados.produto_id);
        
        // Notificar administradores
        const admins = await this.buscarAdministradores();
        
        for (const admin of admins) {
            await notificacaoService.enviarNotificacaoCompleta({
                usuario_id: admin.id,
                template: 'produto_esgotado',
                dados,
                canais: ['email', 'push']
            });
        }
    }

    async onUsuarioCadastrado(dados) {
        console.log('👤 Usuário cadastrado:', dados.email);
        
        await notificacaoService.enviarNotificacaoCompleta({
            usuario_id: dados.usuario_id,
            template: 'bem_vindo',
            dados,
            canais: ['email']
        });
    }

    async onUsuarioLogado(dados) {
        console.log('🔑 Usuário logado:', dados.email);
        
        // Verificar se é login suspeito (IP diferente, etc.)
        if (dados.suspeito) {
            await notificacaoService.enviarNotificacaoCompleta({
                usuario_id: dados.usuario_id,
                template: 'login_suspeito',
                dados,
                canais: ['email', 'sms']
            });
        }
    }

    /**
     * Buscar administradores para notificações
     * @private
     */
    async buscarAdministradores() {
        try {
            const sql = `
                SELECT id, nome, email 
                FROM usuarios 
                WHERE tipo = 'admin' 
                AND notificacoes_email = TRUE
            `;
            
            return await conexao.executarConsulta(sql);
            
        } catch (error) {
            console.error('❌ Erro ao buscar administradores:', error);
            return [];
        }
    }

    /**
     * Salvar log do evento
     * @private
     */
    async salvarLogEvento(evento, dados) {
        try {
            const sql = `
                INSERT INTO eventos_log (
                    evento, dados, created_at
                ) VALUES (?, ?, NOW())
            `;

            await conexao.executarConsulta(sql, [
                evento,
                JSON.stringify(dados)
            ]);

        } catch (error) {
            console.error('❌ Erro ao salvar log do evento:', error);
        }
    }

    /**
     * Obter estatísticas de eventos
     */
    async obterEstatisticas(periodo = 30) {
        try {
            const sql = `
                SELECT 
                    evento,
                    COUNT(*) as total,
                    DATE(created_at) as data
                FROM eventos_log 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY evento, DATE(created_at)
                ORDER BY data DESC, evento
            `;

            return await conexao.executarConsulta(sql, [periodo]);

        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            return [];
        }
    }
}

// Singleton
const eventoManager = new EventoManager();

module.exports = eventoManager;
