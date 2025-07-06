const express = require('express');
const router = express.Router();
const statusPedidoService = require('../services/statusPedidoService');
const freteService = require('../services/freteService');
const { verificarAutenticacao, verificarPermissao } = require('../middleware/autenticacao');

/**
 * @route GET /api/pedidos/status/tipos
 * @description Obter todos os tipos de status disponíveis
 * @access Público
 */
router.get('/status/tipos', (req, res) => {
    try {
        const statusTipos = statusPedidoService.obterTodosStatus();
        
        res.json({
            sucesso: true,
            dados: statusTipos
        });
    } catch (error) {
        console.error('❌ Erro ao obter tipos de status:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

/**
 * @route PUT /api/pedidos/:pedido_id/status
 * @description Atualizar status de um pedido (apenas admin)
 * @access Privado - Admin
 */
router.put('/:pedido_id/status', verificarAutenticacao, verificarPermissao('colaborador'), async (req, res) => {
    try {
        const { pedido_id } = req.params;
        const { novo_status, codigo_rastreamento, observacoes } = req.body;

        if (!novo_status) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Novo status é obrigatório'
            });
        }

        const dadosAdicionais = {
            codigo_rastreamento,
            observacoes
        };

        const resultado = await statusPedidoService.atualizarStatus(
            pedido_id,
            novo_status,
            dadosAdicionais,
            req.usuario.id
        );

        if (resultado.sucesso) {
            res.json(resultado);
        } else {
            res.status(400).json(resultado);
        }

    } catch (error) {
        console.error('❌ Erro ao atualizar status:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

/**
 * @route GET /api/pedidos/:pedido_id/historico
 * @description Obter histórico de status de um pedido
 * @access Privado
 */
router.get('/:pedido_id/historico', verificarAutenticacao, async (req, res) => {
    try {
        const { pedido_id } = req.params;

        // Verificar se o pedido pertence ao usuário (ou se é admin)
        const conexao = require('../banco/conexao');
        const pedidos = await conexao.executarConsulta(
            'SELECT usuario_id FROM pedidos WHERE id = ?',
            [pedido_id]
        );

        if (pedidos.length === 0) {
            return res.status(404).json({
                sucesso: false,
                erro: 'Pedido não encontrado'
            });
        }

        const userRole = req.usuario.tipo_usuario || req.usuario.nivel_acesso;
        if (pedidos[0].usuario_id !== req.usuario.id && !['colaborador', 'diretor'].includes(userRole)) {
            return res.status(403).json({
                sucesso: false,
                erro: 'Acesso negado'
            });
        }

        const resultado = await statusPedidoService.obterHistoricoStatus(pedido_id);

        res.json(resultado);

    } catch (error) {
        console.error('❌ Erro ao obter histórico:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

/**
 * @route GET /api/pedidos/status/:status
 * @description Listar pedidos por status (apenas admin)
 * @access Privado - Admin
 */
router.get('/status/:status', verificarAutenticacao, verificarPermissao('colaborador'), async (req, res) => {
    try {
        const { status } = req.params;
        const filtros = {
            data_inicio: req.query.data_inicio,
            data_fim: req.query.data_fim,
            cliente_email: req.query.cliente_email,
            limite: req.query.limite
        };

        const resultado = await statusPedidoService.listarPedidosPorStatus(status, filtros);

        res.json(resultado);

    } catch (error) {
        console.error('❌ Erro ao listar pedidos:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

/**
 * @route GET /api/pedidos/status/estatisticas
 * @description Obter estatísticas de pedidos por status (apenas admin)
 * @access Privado - Admin
 */
router.get('/status/estatisticas', verificarAutenticacao, verificarPermissao('colaborador'), async (req, res) => {
    try {
        const resultado = await statusPedidoService.obterEstatisticasStatus();
        res.json(resultado);

    } catch (error) {
        console.error('❌ Erro ao obter estatísticas:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

/**
 * @route POST /api/pedidos/frete/calcular
 * @description Calcular frete para um pedido
 * @access Privado
 */
router.post('/frete/calcular', verificarAutenticacao, async (req, res) => {
    try {
        const { cep_destino, produtos, valor_pedido } = req.body;

        if (!cep_destino || !produtos || !Array.isArray(produtos)) {
            return res.status(400).json({
                sucesso: false,
                erro: 'CEP de destino e produtos são obrigatórios'
            });
        }

        const dadosFrete = {
            cepDestino: cep_destino,
            produtos: produtos,
            valorPedido: valor_pedido || 0
        };

        const resultado = await freteService.calcularFrete(dadosFrete);

        res.json(resultado);

    } catch (error) {
        console.error('❌ Erro ao calcular frete:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

/**
 * @route GET /api/pedidos/cep/:cep
 * @description Buscar informações de um CEP
 * @access Público
 */
router.get('/cep/:cep', async (req, res) => {
    try {
        const { cep } = req.params;
        const resultado = await freteService.buscarCEP(cep);

        res.json(resultado);

    } catch (error) {
        console.error('❌ Erro ao buscar CEP:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

/**
 * @route GET /api/pedidos/rastreamento/:codigo
 * @description Rastrear objeto pelos Correios
 * @access Privado
 */
router.get('/rastreamento/:codigo', verificarAutenticacao, async (req, res) => {
    try {
        const { codigo } = req.params;

        // Verificar se o código de rastreamento pertence a um pedido do usuário
        const conexao = require('../banco/conexao');
        const pedidos = await conexao.executarConsulta(`
            SELECT p.id, p.usuario_id 
            FROM pedidos p 
            WHERE p.codigo_rastreamento = ?
        `, [codigo]);

        if (pedidos.length === 0) {
            return res.status(404).json({
                sucesso: false,
                erro: 'Código de rastreamento não encontrado'
            });
        }

        const userRole = req.usuario.tipo_usuario || req.usuario.nivel_acesso;
        if (pedidos[0].usuario_id !== req.usuario.id && !['colaborador', 'diretor'].includes(userRole)) {
            return res.status(403).json({
                sucesso: false,
                erro: 'Acesso negado'
            });
        }

        const resultado = await freteService.rastrearObjeto(codigo);

        res.json(resultado);

    } catch (error) {
        console.error('❌ Erro ao rastrear objeto:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

/**
 * @route GET /api/pedidos/:pedido_id/proximos-status
 * @description Obter próximos status válidos para um pedido (apenas admin)
 * @access Privado - Admin
 */
router.get('/:pedido_id/proximos-status', verificarAutenticacao, verificarPermissao('colaborador'), async (req, res) => {
    try {
        const { pedido_id } = req.params;

        const conexao = require('../banco/conexao');
        const pedidos = await conexao.executarConsulta(
            'SELECT status_pedido FROM pedidos WHERE id = ?',
            [pedido_id]
        );

        if (pedidos.length === 0) {
            return res.status(404).json({
                sucesso: false,
                erro: 'Pedido não encontrado'
            });
        }

        const statusAtual = pedidos[0].status_pedido;
        const proximosStatus = statusPedidoService.obterProximosStatus(statusAtual);

        res.json({
            sucesso: true,
            dados: {
                status_atual: statusAtual,
                proximos_status: proximosStatus
            }
        });

    } catch (error) {
        console.error('❌ Erro ao obter próximos status:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

module.exports = router;
