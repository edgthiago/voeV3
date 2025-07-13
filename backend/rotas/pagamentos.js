const express = require('express');
const router = express.Router();
const pagamentoService = require('../services/pagamentoService');
const { verificarAutenticacao } = require('../middleware/autenticacao');
const conexao = require('../banco/conexao');

/**
 * @route POST /api/pagamentos/pix
 * @description Criar pagamento PIX
 * @access Privado
 */
router.post('/pix', verificarAutenticacao, async (req, res) => {
    try {
        const { pedido_id, valor, descricao } = req.body;

        // Validações
        if (!pedido_id || !valor) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Pedido e valor são obrigatórios'
            });
        }

        // Verificar se o pedido pertence ao usuário
        const pedido = await conexao.executarConsulta(
            'SELECT * FROM pedidos WHERE id = ? AND usuario_id = ?',
            [pedido_id, req.usuario.id]
        );

        if (!pedido.length) {
            return res.status(404).json({
                sucesso: false,
                erro: 'Pedido não encontrado'
            });
        }

        // Verificar se já existe pagamento para este pedido
        const pagamentoExistente = await conexao.executarConsulta(
            'SELECT * FROM pagamentos WHERE pedido_id = ? AND status IN ("pending", "approved")',
            [pedido_id]
        );

        if (pagamentoExistente.length > 0) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Já existe um pagamento ativo para este pedido'
            });
        }

        const dadosPagamento = {
            valor: parseFloat(valor),
            descricao: descricao || `Pedido #${pedido_id} - Papelaria`,
            email_pagador: req.usuario.email,
            nome_pagador: req.usuario.nome,
            pedido_id: pedido_id
        };

        const resultado = await pagamentoService.criarPagamentoPIX(dadosPagamento);

        if (resultado.sucesso) {
            res.json({
                sucesso: true,
                dados: resultado.dados
            });
        } else {
            res.status(400).json({
                sucesso: false,
                erro: resultado.erro
            });
        }

    } catch (error) {
        console.error('❌ Erro na rota PIX:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

/**
 * @route POST /api/pagamentos/cartao
 * @description Criar pagamento com cartão
 * @access Privado
 */
router.post('/cartao', verificarAutenticacao, async (req, res) => {
    try {
        const { 
            pedido_id, 
            valor, 
            token_cartao, 
            parcelas, 
            metodo_pagamento, 
            issuer_id,
            cpf 
        } = req.body;

        // Validações
        if (!pedido_id || !valor || !token_cartao || !metodo_pagamento) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Dados do pagamento incompletos'
            });
        }

        // Verificar se o pedido pertence ao usuário
        const pedido = await conexao.executarConsulta(
            'SELECT * FROM pedidos WHERE id = ? AND usuario_id = ?',
            [pedido_id, req.usuario.id]
        );

        if (!pedido.length) {
            return res.status(404).json({
                sucesso: false,
                erro: 'Pedido não encontrado'
            });
        }

        const dadosPagamento = {
            valor: parseFloat(valor),
            descricao: `Pedido #${pedido_id} - Papelaria`,
            email_pagador: req.usuario.email,
            nome_pagador: req.usuario.nome,
            pedido_id: pedido_id,
            token_cartao,
            parcelas: parseInt(parcelas) || 1,
            metodo_pagamento,
            issuer_id,
            cpf
        };

        const resultado = await pagamentoService.criarPagamentoCartao(dadosPagamento);

        if (resultado.sucesso) {
            res.json({
                sucesso: true,
                dados: resultado.dados
            });
        } else {
            res.status(400).json({
                sucesso: false,
                erro: resultado.erro
            });
        }

    } catch (error) {
        console.error('❌ Erro na rota cartão:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

/**
 * @route GET /api/pagamentos/status/:pagamento_id
 * @description Consultar status do pagamento
 * @access Privado
 */
router.get('/status/:pagamento_id', verificarAutenticacao, async (req, res) => {
    try {
        const { pagamento_id } = req.params;

        // Verificar se o pagamento pertence ao usuário
        const pagamento = await conexao.executarConsulta(`
            SELECT p.*, pd.usuario_id 
            FROM pagamentos p
            JOIN pedidos pd ON p.pedido_id = pd.id
            WHERE p.mercado_pago_id = ? AND pd.usuario_id = ?
        `, [pagamento_id, req.usuario.id]);

        if (!pagamento.length) {
            return res.status(404).json({
                sucesso: false,
                erro: 'Pagamento não encontrado'
            });
        }

        const resultado = await pagamentoService.consultarStatusPagamento(pagamento_id);

        res.json(resultado);

    } catch (error) {
        console.error('❌ Erro ao consultar status:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

/**
 * @route GET /api/pagamentos/pedido/:pedido_id
 * @description Buscar pagamentos de um pedido
 * @access Privado
 */
router.get('/pedido/:pedido_id', verificarAutenticacao, async (req, res) => {
    try {
        const { pedido_id } = req.params;

        // Verificar se o pedido pertence ao usuário
        const pedido = await conexao.executarConsulta(
            'SELECT * FROM pedidos WHERE id = ? AND usuario_id = ?',
            [pedido_id, req.usuario.id]
        );

        if (!pedido.length) {
            return res.status(404).json({
                sucesso: false,
                erro: 'Pedido não encontrado'
            });
        }

        // Buscar pagamentos do pedido
        const pagamentos = await conexao.executarConsulta(
            'SELECT * FROM pagamentos WHERE pedido_id = ? ORDER BY created_at DESC',
            [pedido_id]
        );

        res.json({
            sucesso: true,
            dados: pagamentos
        });

    } catch (error) {
        console.error('❌ Erro ao buscar pagamentos:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

/**
 * @route POST /api/pagamentos/webhooks/mercado-pago
 * @description Webhook do Mercado Pago para notificações
 * @access Público (com validação)
 */
router.post('/webhooks/mercado-pago', async (req, res) => {
    try {
        const { type, data } = req.body;

        console.log('📨 Webhook recebido:', { type, data });

        if (type === 'payment') {
            const pagamento_id = data.id;
            
            // Consultar status atualizado
            const resultado = await pagamentoService.consultarStatusPagamento(pagamento_id);
            
            if (resultado.sucesso) {
                console.log(`✅ Status atualizado: ${pagamento_id} = ${resultado.dados.status}`);
            }
        }

        res.status(200).json({ recebido: true });

    } catch (error) {
        console.error('❌ Erro no webhook:', error);
        res.status(500).json({ erro: 'Erro no webhook' });
    }
});

module.exports = router;
