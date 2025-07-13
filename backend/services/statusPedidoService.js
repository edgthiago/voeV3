/**
 * @fileoverview Serviço de gerenciamento de status de pedidos
 * @description Controla o fluxo de status dos pedidos e notificações
 * @author Sistema de Papelaria
 * @version 1.0
 */

const conexao = require('../banco/conexao');
const eventoManager = require('./eventoManager');
const notificacaoService = require('./notificacaoService');

class StatusPedidoService {
    constructor() {
        // Definir os status válidos e suas transições
        this.statusValidos = {
            'pendente': {
                nome: 'Pendente',
                descricao: 'Pedido criado, aguardando processamento',
                proximosStatus: ['aguardando_pagamento', 'cancelado'],
                cor: '#ffc107',
                icone: '⏳'
            },
            'aguardando_pagamento': {
                nome: 'Aguardando Pagamento',
                descricao: 'Pedido confirmado, aguardando pagamento',
                proximosStatus: ['pagamento_aprovado', 'cancelado'],
                cor: '#fd7e14',
                icone: '💳'
            },
            'pagamento_aprovado': {
                nome: 'Pagamento Aprovado',
                descricao: 'Pagamento confirmado, preparando pedido',
                proximosStatus: ['em_separacao'],
                cor: '#28a745',
                icone: '✅'
            },
            'em_separacao': {
                nome: 'Em Separação',
                descricao: 'Produtos sendo separados no estoque',
                proximosStatus: ['enviado', 'cancelado'],
                cor: '#17a2b8',
                icone: '📦'
            },
            'enviado': {
                nome: 'Enviado',
                descricao: 'Pedido despachado para entrega',
                proximosStatus: ['entregue'],
                cor: '#6f42c1',
                icone: '🚚'
            },
            'entregue': {
                nome: 'Entregue',
                descricao: 'Pedido entregue ao cliente',
                proximosStatus: [],
                cor: '#20c997',
                icone: '🎉'
            },
            'cancelado': {
                nome: 'Cancelado',
                descricao: 'Pedido cancelado',
                proximosStatus: [],
                cor: '#dc3545',
                icone: '❌'
            }
        };
    }

    /**
     * Atualizar status do pedido
     * @param {string} pedidoId - ID do pedido
     * @param {string} novoStatus - Novo status
     * @param {Object} dadosAdicionais - Dados extras (código de rastreamento, etc.)
     * @param {number} usuarioId - ID do usuário que fez a alteração
     * @returns {Object} Resultado da operação
     */
    async atualizarStatus(pedidoId, novoStatus, dadosAdicionais = {}, usuarioId = null) {
        try {
            // Validar se o status é válido
            if (!this.statusValidos[novoStatus]) {
                throw new Error(`Status inválido: ${novoStatus}`);
            }

            // Buscar pedido atual
            const pedidos = await conexao.executarConsulta(
                'SELECT * FROM pedidos WHERE id = ?',
                [pedidoId]
            );

            if (pedidos.length === 0) {
                throw new Error('Pedido não encontrado');
            }

            const pedido = pedidos[0];
            const statusAtual = pedido.status_pedido;

            // Verificar se a transição é válida
            if (statusAtual && !this.statusValidos[statusAtual]?.proximosStatus.includes(novoStatus)) {
                throw new Error(`Transição inválida de ${statusAtual} para ${novoStatus}`);
            }

            // Usar transação para garantir consistência
            await conexao.executarTransaction([
                {
                    sql: `
                        UPDATE pedidos 
                        SET status_pedido = ?, 
                            codigo_rastreamento = ?, 
                            observacoes = ?,
                            updated_at = NOW()
                        WHERE id = ?
                    `,
                    parametros: [
                        novoStatus,
                        dadosAdicionais.codigo_rastreamento || pedido.codigo_rastreamento,
                        dadosAdicionais.observacoes || pedido.observacoes,
                        pedidoId
                    ]
                },
                {
                    sql: `
                        INSERT INTO historico_status_pedidos 
                        (pedido_id, status_anterior, status_novo, usuario_id, observacoes, data_alteracao)
                        VALUES (?, ?, ?, ?, ?, NOW())
                    `,
                    parametros: [
                        pedidoId,
                        statusAtual,
                        novoStatus,
                        usuarioId,
                        dadosAdicionais.observacoes || null
                    ]
                }
            ]);

            // Enviar notificação para o cliente
            await this.enviarNotificacaoStatus(pedido, novoStatus, dadosAdicionais);

            // Executar ações específicas do status
            await this.executarAcoesStatus(pedido, novoStatus, dadosAdicionais);

            // Emitir evento para sistema de notificações
            await eventoManager.emit(this.obterEventoStatus(novoStatus), {
                pedido_id: pedidoId,
                usuario_id: pedido.usuario_id,
                status_anterior: statusAtual,
                status_novo: novoStatus,
                nome_cliente: pedido.nome_cliente || 'Cliente',
                valor_total: pedido.valor_total,
                data_pedido: pedido.data_pedido,
                codigo_rastreamento: dadosAdicionais.codigo_rastreamento || pedido.codigo_rastreamento,
                transportadora: dadosAdicionais.transportadora || 'Correios',
                previsao_entrega: dadosAdicionais.previsao_entrega || '5 dias úteis',
                data_entrega: novoStatus === 'entregue' ? new Date() : null,
                recebido_por: dadosAdicionais.recebido_por || null
            });

            console.log(`✅ Status do pedido ${pedidoId} alterado para: ${novoStatus}`);

            return {
                sucesso: true,
                dados: {
                    pedido_id: pedidoId,
                    status_anterior: statusAtual,
                    status_novo: novoStatus,
                    status_info: this.statusValidos[novoStatus]
                }
            };

        } catch (error) {
            console.error('❌ Erro ao atualizar status:', error);
            return {
                sucesso: false,
                erro: error.message
            };
        }
    }

    /**
     * Obter histórico de status de um pedido
     * @param {string} pedidoId - ID do pedido
     * @returns {Array} Histórico de status
     */
    async obterHistoricoStatus(pedidoId) {
        try {
            const historico = await conexao.executarConsulta(`
                SELECT 
                    hsp.*,
                    u.nome as usuario_nome,
                    u.email as usuario_email
                FROM historico_status_pedidos hsp
                LEFT JOIN usuarios u ON hsp.usuario_id = u.id
                WHERE hsp.pedido_id = ?
                ORDER BY hsp.data_alteracao DESC
            `, [pedidoId]);

            // Adicionar informações dos status
            const historicoCompleto = historico.map(item => ({
                ...item,
                status_anterior_info: this.statusValidos[item.status_anterior],
                status_novo_info: this.statusValidos[item.status_novo]
            }));

            return {
                sucesso: true,
                dados: historicoCompleto
            };

        } catch (error) {
            console.error('❌ Erro ao buscar histórico:', error);
            return {
                sucesso: false,
                erro: error.message
            };
        }
    }

    /**
     * Listar pedidos por status
     * @param {string} status - Status dos pedidos
     * @param {Object} filtros - Filtros adicionais
     * @returns {Array} Lista de pedidos
     */
    async listarPedidosPorStatus(status, filtros = {}) {
        try {
            let sql = `
                SELECT 
                    p.*,
                    u.nome as cliente_nome,
                    u.email as cliente_email,
                    u.telefone as cliente_telefone,
                    COUNT(ip.id) as total_itens
                FROM pedidos p
                JOIN usuarios u ON p.usuario_id = u.id
                LEFT JOIN itens_pedido ip ON p.id = ip.pedido_id
                WHERE 1=1
            `;
            
            const parametros = [];

            if (status && status !== 'todos') {
                sql += ` AND p.status_pedido = ?`;
                parametros.push(status);
            }

            if (filtros.data_inicio) {
                sql += ` AND DATE(p.data_pedido) >= ?`;
                parametros.push(filtros.data_inicio);
            }

            if (filtros.data_fim) {
                sql += ` AND DATE(p.data_pedido) <= ?`;
                parametros.push(filtros.data_fim);
            }

            if (filtros.cliente_email) {
                sql += ` AND u.email LIKE ?`;
                parametros.push(`%${filtros.cliente_email}%`);
            }

            sql += ` GROUP BY p.id ORDER BY p.data_pedido DESC`;

            if (filtros.limite) {
                sql += ` LIMIT ?`;
                parametros.push(parseInt(filtros.limite));
            }

            const pedidos = await conexao.executarConsulta(sql, parametros);

            // Adicionar informações do status
            const pedidosCompletos = pedidos.map(pedido => ({
                ...pedido,
                status_info: this.statusValidos[pedido.status_pedido]
            }));

            return {
                sucesso: true,
                dados: pedidosCompletos
            };

        } catch (error) {
            console.error('❌ Erro ao listar pedidos:', error);
            return {
                sucesso: false,
                erro: error.message
            };
        }
    }

    /**
     * Obter estatísticas de pedidos por status
     * @returns {Object} Estatísticas
     */
    async obterEstatisticasStatus() {
        try {
            const estatisticas = await conexao.executarConsulta(`
                SELECT 
                    status_pedido,
                    COUNT(*) as quantidade,
                    SUM(valor_total) as valor_total,
                    AVG(valor_total) as ticket_medio
                FROM pedidos 
                WHERE status_pedido IS NOT NULL
                GROUP BY status_pedido
            `);

            const estatisticasCompletas = {};
            
            // Inicializar todos os status com zero
            Object.keys(this.statusValidos).forEach(status => {
                estatisticasCompletas[status] = {
                    status_info: this.statusValidos[status],
                    quantidade: 0,
                    valor_total: 0,
                    ticket_medio: 0
                };
            });

            // Preencher com dados reais
            estatisticas.forEach(item => {
                if (this.statusValidos[item.status_pedido]) {
                    estatisticasCompletas[item.status_pedido] = {
                        status_info: this.statusValidos[item.status_pedido],
                        quantidade: item.quantidade,
                        valor_total: parseFloat(item.valor_total || 0),
                        ticket_medio: parseFloat(item.ticket_medio || 0)
                    };
                }
            });

            return {
                sucesso: true,
                dados: estatisticasCompletas
            };

        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            return {
                sucesso: false,
                erro: error.message
            };
        }
    }

    /**
     * Enviar notificação de mudança de status
     * @private
     */
    async enviarNotificacaoStatus(pedido, novoStatus, dadosAdicionais) {
        try {
            const statusInfo = this.statusValidos[novoStatus];
            
            // Buscar dados do cliente
            const clientes = await conexao.executarConsulta(
                'SELECT * FROM usuarios WHERE id = ?',
                [pedido.usuario_id]
            );

            if (clientes.length === 0) return;

            const cliente = clientes[0];
            
            // Preparar dados para email
            const dadosEmail = {
                para: cliente.email,
                nome_cliente: cliente.nome,
                pedido_id: pedido.id,
                status_atual: statusInfo.nome,
                status_descricao: statusInfo.descricao,
                valor_total: pedido.valor_total,
                codigo_rastreamento: dadosAdicionais.codigo_rastreamento || pedido.codigo_rastreamento,
                observacoes: dadosAdicionais.observacoes
            };

            // Enviar notificações específicas para cada status
            switch (novoStatus) {
                case 'pagamento_aprovado':
                    await notificacaoService.enviarNotificacao(
                        cliente.id,
                        'status_pedido',
                        'Pagamento Aprovado!',
                        `Seu pagamento foi aprovado! Pedido #${pedido.id} está sendo preparado.`,
                        {
                            pedido_id: pedido.id,
                            status: novoStatus,
                            valor_total: pedido.valor_total
                        }
                    );
                    break;
                case 'em_separacao':
                    await notificacaoService.enviarNotificacao(
                        cliente.id,
                        'status_pedido',
                        'Pedido em Separação',
                        `Seu pedido #${pedido.id} está sendo separado para envio.`,
                        {
                            pedido_id: pedido.id,
                            status: novoStatus
                        }
                    );
                    break;
                case 'enviado':
                    await notificacaoService.enviarNotificacao(
                        cliente.id,
                        'status_pedido',
                        'Pedido Enviado! 📦',
                        `Seu pedido #${pedido.id} foi enviado! ${dadosAdicionais.codigo_rastreamento ? `Código de rastreamento: ${dadosAdicionais.codigo_rastreamento}` : ''}`,
                        {
                            pedido_id: pedido.id,
                            status: novoStatus,
                            codigo_rastreamento: dadosAdicionais.codigo_rastreamento
                        }
                    );
                    break;
                case 'entregue':
                    await notificacaoService.enviarNotificacao(
                        cliente.id,
                        'status_pedido',
                        'Pedido Entregue! 🎉',
                        `Seu pedido #${pedido.id} foi entregue com sucesso!`,
                        {
                            pedido_id: pedido.id,
                            status: novoStatus,
                            data_entrega: new Date()
                        }
                    );
                    break;
                case 'cancelado':
                    await notificacaoService.enviarNotificacao(
                        cliente.id,
                        'status_pedido',
                        'Pedido Cancelado',
                        `Seu pedido #${pedido.id} foi cancelado. ${dadosAdicionais.observacoes || ''}`,
                        {
                            pedido_id: pedido.id,
                            status: novoStatus,
                            motivo: dadosAdicionais.observacoes
                        }
                    );
                    break;
            }

            console.log(`📧 Notificação enviada para ${cliente.email} - Status: ${novoStatus}`);

        } catch (error) {
            console.error('❌ Erro ao enviar notificação:', error);
        }
    }

    /**
     * Executar ações específicas do status
     * @private
     */
    async executarAcoesStatus(pedido, novoStatus, dadosAdicionais) {
        try {
            switch (novoStatus) {
                case 'em_separacao':
                    // Reservar produtos no estoque
                    await this.reservarProdutosEstoque(pedido.id);
                    break;
                
                case 'enviado':
                    // Reduzir estoque definitivamente
                    await this.reduzirEstoque(pedido.id);
                    break;
                
                case 'cancelado':
                    // Liberar produtos do estoque
                    await this.liberarProdutosEstoque(pedido.id);
                    break;
            }

        } catch (error) {
            console.error('❌ Erro ao executar ações do status:', error);
        }
    }

    /**
     * Reservar produtos no estoque
     * @private
     */
    async reservarProdutosEstoque(pedidoId) {
        try {
            // Implementar lógica de reserva de estoque
            const itens = await conexao.executarConsulta(`
                SELECT ip.produto_id, ip.quantidade, ip.tamanho
                FROM itens_pedido ip
                WHERE ip.pedido_id = ?
            `, [pedidoId]);

            for (const item of itens) {
                await conexao.executarConsulta(`
                    UPDATE produtos 
                    SET estoque_reservado = estoque_reservado + ?
                    WHERE id = ?
                `, [item.quantidade, item.produto_id]);
            }

            console.log(`📦 Estoque reservado para pedido ${pedidoId}`);

        } catch (error) {
            console.error('❌ Erro ao reservar estoque:', error);
        }
    }

    /**
     * Reduzir estoque definitivamente
     * @private
     */
    async reduzirEstoque(pedidoId) {
        try {
            const itens = await conexao.executarConsulta(`
                SELECT ip.produto_id, ip.quantidade, ip.tamanho
                FROM itens_pedido ip
                WHERE ip.pedido_id = ?
            `, [pedidoId]);

            for (const item of itens) {
                await conexao.executarConsulta(`
                    UPDATE produtos 
                    SET estoque_disponivel = estoque_disponivel - ?,
                        estoque_reservado = estoque_reservado - ?
                    WHERE id = ?
                `, [item.quantidade, item.quantidade, item.produto_id]);
            }

            console.log(`📉 Estoque reduzido para pedido ${pedidoId}`);

        } catch (error) {
            console.error('❌ Erro ao reduzir estoque:', error);
        }
    }

    /**
     * Liberar produtos do estoque
     * @private
     */
    async liberarProdutosEstoque(pedidoId) {
        try {
            const itens = await conexao.executarConsulta(`
                SELECT ip.produto_id, ip.quantidade, ip.tamanho
                FROM itens_pedido ip
                WHERE ip.pedido_id = ?
            `, [pedidoId]);

            for (const item of itens) {
                await conexao.executarConsulta(`
                    UPDATE produtos 
                    SET estoque_reservado = GREATEST(0, estoque_reservado - ?)
                    WHERE id = ?
                `, [item.quantidade, item.produto_id]);
            }

            console.log(`🔓 Estoque liberado para pedido ${pedidoId}`);

        } catch (error) {
            console.error('❌ Erro ao liberar estoque:', error);
        }
    }

    /**
     * Obter próximos status válidos para um pedido
     * @param {string} statusAtual - Status atual do pedido
     * @returns {Array} Lista de próximos status possíveis
     */
    obterProximosStatus(statusAtual) {
        if (!this.statusValidos[statusAtual]) {
            return [];
        }

        return this.statusValidos[statusAtual].proximosStatus.map(status => ({
            valor: status,
            info: this.statusValidos[status]
        }));
    }

    /**
     * Obter informações de todos os status
     * @returns {Object} Informações completas dos status
     */
    obterTodosStatus() {
        return this.statusValidos;
    }

    /**
     * Mapear status para eventos de notificação
     * @param {string} status - Status do pedido
     * @returns {string} Nome do evento
     */
    obterEventoStatus(status) {
        const mapeamento = {
            'pendente': 'pedido_criado',
            'aguardando_pagamento': 'pedido_confirmado',
            'pagamento_aprovado': 'pagamento_aprovado',
            'em_separacao': 'pedido_em_preparacao',
            'enviado': 'pedido_enviado',
            'entregue': 'pedido_entregue',
            'cancelado': 'pedido_cancelado'
        };

        return mapeamento[status] || 'pedido_atualizado';
    }
}

module.exports = new StatusPedidoService();
