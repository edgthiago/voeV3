/**
 * @fileoverview Serviço de pagamento integrado com Mercado Pago
 * @description Gerencia pagamentos PIX, cartão e boleto
 * @author Sistema de Loja de Tênis
 * @version 1.0
 */

const axios = require('axios');
const conexao = require('../banco/conexao');
const eventoManager = require('./eventoManager');

class PagamentoService {
    constructor() {
        this.accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
        this.baseURL = process.env.NODE_ENV === 'production' 
            ? 'https://api.mercadopago.com' 
            : 'https://api.mercadopago.com'; // Mesmo endpoint para teste/produção
        
        if (!this.accessToken) {
            console.warn('⚠️ MERCADO_PAGO_ACCESS_TOKEN não configurado');
        }
    }

    /**
     * Criar pagamento PIX
     * @param {Object} dadosPagamento - Dados do pagamento
     * @returns {Object} Resposta com QR Code e dados do pagamento
     */
    async criarPagamentoPIX(dadosPagamento) {
        try {
            const { valor, descricao, email_pagador, nome_pagador, pedido_id } = dadosPagamento;

            const payment = {
                transaction_amount: parseFloat(valor),
                description: descricao,
                payment_method_id: 'pix',
                payer: {
                    email: email_pagador,
                    first_name: nome_pagador.split(' ')[0],
                    last_name: nome_pagador.split(' ').slice(1).join(' ') || 'Silva'
                },
                external_reference: pedido_id,
                notification_url: `${process.env.FRONTEND_URL}/api/webhooks/mercado-pago`,
                metadata: {
                    pedido_id: pedido_id
                }
            };

            const response = await axios.post(
                `${this.baseURL}/v1/payments`,
                payment,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const pagamento = response.data;

            // Salvar dados do pagamento no banco
            await this.salvarPagamento({
                pedido_id,
                mercado_pago_id: pagamento.id,
                status: pagamento.status,
                valor: pagamento.transaction_amount,
                metodo_pagamento: 'pix',
                qr_code: pagamento.point_of_interaction?.transaction_data?.qr_code,
                qr_code_base64: pagamento.point_of_interaction?.transaction_data?.qr_code_base64,
                ticket_url: pagamento.point_of_interaction?.transaction_data?.ticket_url
            });

            return {
                sucesso: true,
                dados: {
                    id: pagamento.id,
                    status: pagamento.status,
                    qr_code: pagamento.point_of_interaction?.transaction_data?.qr_code,
                    qr_code_base64: pagamento.point_of_interaction?.transaction_data?.qr_code_base64,
                    ticket_url: pagamento.point_of_interaction?.transaction_data?.ticket_url,
                    valor: pagamento.transaction_amount,
                    data_expiracao: pagamento.date_of_expiration
                }
            };

        } catch (error) {
            console.error('❌ Erro ao criar pagamento PIX:', error.response?.data || error.message);
            return {
                sucesso: false,
                erro: 'Erro ao processar pagamento PIX'
            };
        }
    }

    /**
     * Criar pagamento com cartão
     * @param {Object} dadosPagamento - Dados do pagamento
     * @returns {Object} Resposta do pagamento
     */
    async criarPagamentoCartao(dadosPagamento) {
        try {
            const { 
                valor, 
                descricao, 
                email_pagador, 
                nome_pagador, 
                pedido_id,
                token_cartao,
                parcelas = 1,
                metodo_pagamento
            } = dadosPagamento;

            const payment = {
                transaction_amount: parseFloat(valor),
                token: token_cartao,
                description: descricao,
                installments: parseInt(parcelas),
                payment_method_id: metodo_pagamento, // visa, mastercard, etc
                issuer_id: dadosPagamento.issuer_id,
                payer: {
                    email: email_pagador,
                    identification: {
                        type: 'CPF',
                        number: dadosPagamento.cpf
                    },
                    first_name: nome_pagador.split(' ')[0],
                    last_name: nome_pagador.split(' ').slice(1).join(' ') || 'Silva'
                },
                external_reference: pedido_id,
                notification_url: `${process.env.FRONTEND_URL}/api/webhooks/mercado-pago`,
                metadata: {
                    pedido_id: pedido_id
                }
            };

            const response = await axios.post(
                `${this.baseURL}/v1/payments`,
                payment,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const pagamento = response.data;

            // Salvar dados do pagamento no banco
            await this.salvarPagamento({
                pedido_id,
                mercado_pago_id: pagamento.id,
                status: pagamento.status,
                valor: pagamento.transaction_amount,
                metodo_pagamento: `cartao_${metodo_pagamento}`,
                parcelas: parcelas
            });

            return {
                sucesso: true,
                dados: {
                    id: pagamento.id,
                    status: pagamento.status,
                    status_detail: pagamento.status_detail,
                    valor: pagamento.transaction_amount,
                    parcelas: parcelas
                }
            };

        } catch (error) {
            console.error('❌ Erro ao criar pagamento cartão:', error.response?.data || error.message);
            return {
                sucesso: false,
                erro: 'Erro ao processar pagamento com cartão'
            };
        }
    }

    /**
     * Consultar status do pagamento
     * @param {string} mercado_pago_id - ID do pagamento no Mercado Pago
     * @returns {Object} Status do pagamento
     */
    async consultarStatusPagamento(mercado_pago_id) {
        try {
            const response = await axios.get(
                `${this.baseURL}/v1/payments/${mercado_pago_id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );

            const pagamento = response.data;

            // Atualizar status no banco
            await this.atualizarStatusPagamento(mercado_pago_id, pagamento.status);

            return {
                sucesso: true,
                dados: {
                    id: pagamento.id,
                    status: pagamento.status,
                    status_detail: pagamento.status_detail,
                    valor: pagamento.transaction_amount
                }
            };

        } catch (error) {
            console.error('❌ Erro ao consultar pagamento:', error.response?.data || error.message);
            return {
                sucesso: false,
                erro: 'Erro ao consultar status do pagamento'
            };
        }
    }

    /**
     * Salvar dados do pagamento no banco de dados
     * @private
     */
    async salvarPagamento(dadosPagamento) {
        try {
            const sql = `
                INSERT INTO pagamentos (
                    pedido_id, mercado_pago_id, status, valor, metodo_pagamento,
                    qr_code, qr_code_base64, ticket_url, parcelas, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;

            await conexao.executarConsulta(sql, [
                dadosPagamento.pedido_id,
                dadosPagamento.mercado_pago_id,
                dadosPagamento.status,
                dadosPagamento.valor,
                dadosPagamento.metodo_pagamento,
                dadosPagamento.qr_code || null,
                dadosPagamento.qr_code_base64 || null,
                dadosPagamento.ticket_url || null,
                dadosPagamento.parcelas || 1
            ]);

            console.log(`✅ Pagamento salvo: ${dadosPagamento.mercado_pago_id}`);

        } catch (error) {
            console.error('❌ Erro ao salvar pagamento:', error);
            throw error;
        }
    }

    /**
     * Atualizar status do pagamento
     * @private
     */
    async atualizarStatusPagamento(mercado_pago_id, status) {
        try {
            // Buscar dados do pagamento e pedido
            const dadosPagamento = await conexao.executarConsulta(`
                SELECT 
                    pg.*,
                    p.usuario_id,
                    p.valor_total,
                    u.nome as nome_cliente
                FROM pagamentos pg
                JOIN pedidos p ON pg.pedido_id = p.id
                JOIN usuarios u ON p.usuario_id = u.id
                WHERE pg.mercado_pago_id = ?
            `, [mercado_pago_id]);

            if (dadosPagamento.length === 0) {
                throw new Error('Pagamento não encontrado');
            }

            const pagamento = dadosPagamento[0];

            const sql = `
                UPDATE pagamentos 
                SET status = ?, updated_at = NOW() 
                WHERE mercado_pago_id = ?
            `;

            await conexao.executarConsulta(sql, [status, mercado_pago_id]);

            // Emitir eventos baseados no status
            if (status === 'approved') {
                await this.aprovarPedido(mercado_pago_id);
                
                // Emitir evento de pagamento aprovado
                await eventoManager.emit('pagamento_aprovado', {
                    pedido_id: pagamento.pedido_id,
                    usuario_id: pagamento.usuario_id,
                    nome_cliente: pagamento.nome_cliente,
                    valor: pagamento.valor,
                    metodo_pagamento: pagamento.metodo_pagamento ? pagamento.metodo_pagamento.toUpperCase() : 'MERCADO_PAGO',
                    mercado_pago_id: mercado_pago_id
                });

            } else if (status === 'rejected' || status === 'cancelled') {
                // Emitir evento de pagamento rejeitado
                await eventoManager.emit('pagamento_rejeitado', {
                    pedido_id: pagamento.pedido_id,
                    usuario_id: pagamento.usuario_id,
                    nome_cliente: pagamento.nome_cliente,
                    valor: pagamento.valor,
                    metodo_pagamento: pagamento.metodo_pagamento ? pagamento.metodo_pagamento.toUpperCase() : 'MERCADO_PAGO',
                    motivo: status === 'rejected' ? 'Rejeitado pelo processador' : 'Cancelado pelo usuário'
                });
            }

        } catch (error) {
            console.error('❌ Erro ao atualizar status:', error);
            throw error;
        }
    }

    /**
     * Aprovar pedido após pagamento confirmado
     * @private
     */
    async aprovarPedido(mercado_pago_id) {
        try {
            const sql = `
                UPDATE pedidos p
                JOIN pagamentos pg ON p.id = pg.pedido_id
                SET p.status_pedido = 'confirmado', p.updated_at = NOW()
                WHERE pg.mercado_pago_id = ?
            `;

            await conexao.executarConsulta(sql, [mercado_pago_id]);
            console.log(`✅ Pedido aprovado para pagamento: ${mercado_pago_id}`);

        } catch (error) {
            console.error('❌ Erro ao aprovar pedido:', error);
            throw error;
        }
    }
}

module.exports = new PagamentoService();
