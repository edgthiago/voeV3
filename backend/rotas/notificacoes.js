/**
 * @fileoverview Rotas para sistema de notificações
 * @description Gerencia envio e configuração de notificações
 * @author Sistema de Loja de Tênis
 * @version 1.0
 */

const express = require('express');
const router = express.Router();
const conexao = require('../banco/conexao');
const notificacaoService = require('../services/notificacaoService');
const { verificarAutenticacao } = require('../middleware/autenticacao');

/**
 * Testar configurações de notificação
 * GET /api/notificacoes/teste-configuracao
 */
router.get('/teste-configuracao', verificarAutenticacao, async (req, res) => {
    try {
        // Log para debug
        console.log('🔍 Usuário:', JSON.stringify({
            id: req.usuario.id,
            nome: req.usuario.nome,
            tipo_usuario: req.usuario.tipo_usuario,
            nivel_acesso: req.usuario.nivel_acesso
        }, null, 2));

        // Verificar se é admin ou diretor
        if (!['admin', 'diretor'].includes(req.usuario.tipo_usuario)) {
            return res.status(403).json({
                erro: 'Acesso negado. Apenas administradores ou diretores.'
            });
        }

        const resultados = await notificacaoService.testarConfiguracoes();
        
        res.json({
            sucesso: true,
            configuracoes: resultados,
            mensagem: 'Teste de configurações concluído'
        });

    } catch (error) {
        console.error('❌ Erro ao testar configurações:', error);
        res.status(500).json({
            erro: 'Erro interno do servidor',
            detalhes: error.message
        });
    }
});

/**
 * Enviar notificação teste
 * POST /api/notificacoes/teste
 */
router.post('/teste', verificarAutenticacao, async (req, res) => {
    try {
        // Verificar se é admin ou diretor
        if (!['admin', 'diretor'].includes(req.usuario.tipo_usuario)) {
            return res.status(403).json({
                erro: 'Acesso negado. Apenas administradores ou diretores.'
            });
        }

        const { tipo, destinatario, template = 'pedido_criado' } = req.body;

        if (!tipo || !destinatario) {
            return res.status(400).json({
                erro: 'Tipo e destinatário são obrigatórios'
            });
        }

        // Dados de teste
        const dadosTeste = {
            pedido_id: '12345',
            nome_cliente: 'Usuário Teste',
            valor_total: '149,90',
            status: 'Confirmado',
            data_pedido: new Date(),
            metodo_pagamento: 'PIX',
            valor: '149,90',
            codigo_rastreamento: 'BR123456789',
            transportadora: 'Correios',
            previsao_entrega: '5 dias úteis',
            data_entrega: new Date(),
            recebido_por: 'Destinatário'
        };

        let resultado;

        switch (tipo) {
            case 'email':
                resultado = await notificacaoService.enviarEmail(destinatario, template, dadosTeste);
                break;
            case 'sms':
                resultado = await notificacaoService.enviarSMS(destinatario, template, dadosTeste);
                break;
            case 'push':
                resultado = await notificacaoService.enviarPush(destinatario, template, dadosTeste);
                break;
            default:
                return res.status(400).json({
                    erro: 'Tipo de notificação inválido. Use: email, sms ou push'
                });
        }

        res.json({
            sucesso: resultado.sucesso,
            resultado,
            mensagem: resultado.sucesso ? 'Notificação teste enviada' : 'Falha ao enviar notificação'
        });

    } catch (error) {
        console.error('❌ Erro ao enviar notificação teste:', error);
        res.status(500).json({
            erro: 'Erro interno do servidor',
            detalhes: error.message
        });
    }
});

/**
 * Buscar configurações de notificação do usuário
 * GET /api/notificacoes/configuracoes
 */
router.get('/configuracoes', verificarAutenticacao, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;

        const sql = `
            SELECT 
                notificacoes_email,
                notificacoes_sms,
                notificacoes_push,
                push_token
            FROM usuarios 
            WHERE id = ?
        `;

        const resultado = await conexao.executarConsulta(sql, [usuarioId]);
        
        if (resultado.length === 0) {
            return res.status(404).json({
                erro: 'Usuário não encontrado'
            });
        }

        res.json({
            sucesso: true,
            configuracoes: resultado[0]
        });

    } catch (error) {
        console.error('❌ Erro ao buscar configurações:', error);
        res.status(500).json({
            erro: 'Erro interno do servidor',
            detalhes: error.message
        });
    }
});

/**
 * Atualizar configurações de notificação do usuário
 * PUT /api/notificacoes/configuracoes
 */
router.put('/configuracoes', verificarAutenticacao, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const { 
            notificacoes_email, 
            notificacoes_sms, 
            notificacoes_push, 
            push_token 
        } = req.body;

        const sql = `
            UPDATE usuarios SET 
                notificacoes_email = COALESCE(?, notificacoes_email),
                notificacoes_sms = COALESCE(?, notificacoes_sms),
                notificacoes_push = COALESCE(?, notificacoes_push),
                push_token = COALESCE(?, push_token)
            WHERE id = ?
        `;

        await conexao.executarConsulta(sql, [
            notificacoes_email,
            notificacoes_sms,
            notificacoes_push,
            push_token,
            usuarioId
        ]);

        res.json({
            sucesso: true,
            mensagem: 'Configurações atualizadas com sucesso'
        });

    } catch (error) {
        console.error('❌ Erro ao atualizar configurações:', error);
        res.status(500).json({
            erro: 'Erro interno do servidor',
            detalhes: error.message
        });
    }
});

/**
 * Histórico de notificações do usuário
 * GET /api/notificacoes/historico
 */
router.get('/historico', verificarAutenticacao, async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const { limite = 50, pagina = 1, tipo, status } = req.query;

        const offset = (pagina - 1) * limite;
        
        let sql = `
            SELECT 
                nl.id,
                nl.tipo,
                nl.template,
                nl.status,
                nl.created_at,
                nl.erro,
                u.email,
                u.telefone
            FROM notificacoes_log nl
            JOIN usuarios u ON (
                (nl.tipo = 'email' AND nl.destinatario = u.email) OR
                (nl.tipo = 'sms' AND nl.destinatario = u.telefone) OR
                (nl.tipo = 'push' AND nl.destinatario = u.push_token)
            )
            WHERE u.id = ?
        `;

        const params = [usuarioId];

        if (tipo) {
            sql += ' AND nl.tipo = ?';
            params.push(tipo);
        }

        if (status) {
            sql += ' AND nl.status = ?';
            params.push(status);
        }

        sql += ` ORDER BY nl.created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limite), offset);

        const historico = await conexao.executarConsulta(sql, params);

        // Contar total para paginação
        let sqlCount = `
            SELECT COUNT(*) as total
            FROM notificacoes_log nl
            JOIN usuarios u ON (
                (nl.tipo = 'email' AND nl.destinatario = u.email) OR
                (nl.tipo = 'sms' AND nl.destinatario = u.telefone) OR
                (nl.tipo = 'push' AND nl.destinatario = u.push_token)
            )
            WHERE u.id = ?
        `;

        const paramsCount = [usuarioId];

        if (tipo) {
            sqlCount += ' AND nl.tipo = ?';
            paramsCount.push(tipo);
        }

        if (status) {
            sqlCount += ' AND nl.status = ?';
            paramsCount.push(status);
        }

        const totalResult = await conexao.executarConsulta(sqlCount, paramsCount);
        const total = totalResult[0].total;

        res.json({
            sucesso: true,
            historico,
            paginacao: {
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                total,
                paginas: Math.ceil(total / limite)
            }
        });

    } catch (error) {
        console.error('❌ Erro ao buscar histórico:', error);
        res.status(500).json({
            erro: 'Erro interno do servidor',
            detalhes: error.message
        });
    }
});

/**
 * Estatísticas de notificações (admin)
 * GET /api/notificacoes/estatisticas
 */
router.get('/estatisticas', verificarAutenticacao, async (req, res) => {
    try {
        // Verificar se é admin ou diretor
        if (!['admin', 'diretor'].includes(req.usuario.tipo_usuario)) {
            return res.status(403).json({
                erro: 'Acesso negado. Apenas administradores ou diretores.'
            });
        }

        const { periodo = 30 } = req.query;

        // Estatísticas gerais
        const sqlGeral = `
            SELECT 
                tipo,
                status,
                COUNT(*) as total
            FROM notificacoes_log 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY tipo, status
            ORDER BY tipo, status
        `;

        const estatisticasGerais = await conexao.executarConsulta(sqlGeral, [periodo]);

        // Estatísticas por template
        const sqlTemplate = `
            SELECT 
                template,
                tipo,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'enviado' THEN 1 ELSE 0 END) as enviados,
                SUM(CASE WHEN status = 'erro' THEN 1 ELSE 0 END) as erros
            FROM notificacoes_log 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY template, tipo
            ORDER BY total DESC
        `;

        const estatisticasTemplate = await conexao.executarConsulta(sqlTemplate, [periodo]);

        // Estatísticas diárias
        const sqlDiario = `
            SELECT 
                DATE(created_at) as data,
                tipo,
                COUNT(*) as total
            FROM notificacoes_log 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE(created_at), tipo
            ORDER BY data DESC, tipo
        `;

        const estatisticasDiarias = await conexao.executarConsulta(sqlDiario, [periodo]);

        res.json({
            sucesso: true,
            periodo,
            estatisticas: {
                geral: estatisticasGerais,
                por_template: estatisticasTemplate,
                diarias: estatisticasDiarias
            }
        });

    } catch (error) {
        console.error('❌ Erro ao buscar estatísticas:', error);
        res.status(500).json({
            erro: 'Erro interno do servidor',
            detalhes: error.message
        });
    }
});

/**
 * Reenviar notificação
 * POST /api/notificacoes/:id/reenviar
 */
router.post('/:id/reenviar', verificarAutenticacao, async (req, res) => {
    try {
        const notificacaoId = req.params.id;
        const usuarioId = req.usuario.id;

        // Buscar notificação original
        const sql = `
            SELECT 
                nl.*,
                u.id as usuario_id,
                u.nome,
                u.email,
                u.telefone,
                u.push_token
            FROM notificacoes_log nl
            JOIN usuarios u ON (
                (nl.tipo = 'email' AND nl.destinatario = u.email) OR
                (nl.tipo = 'sms' AND nl.destinatario = u.telefone) OR
                (nl.tipo = 'push' AND nl.destinatario = u.push_token)
            )
            WHERE nl.id = ? AND u.id = ?
        `;

        const resultado = await conexao.executarConsulta(sql, [notificacaoId, usuarioId]);

        if (resultado.length === 0) {
            return res.status(404).json({
                erro: 'Notificação não encontrada'
            });
        }

        const notificacao = resultado[0];
        const dados = JSON.parse(notificacao.dados);

        // Reenviar notificação
        let resultadoEnvio;

        switch (notificacao.tipo) {
            case 'email':
                resultadoEnvio = await notificacaoService.enviarEmail(
                    notificacao.destinatario, 
                    notificacao.template, 
                    dados
                );
                break;
            case 'sms':
                resultadoEnvio = await notificacaoService.enviarSMS(
                    notificacao.destinatario, 
                    notificacao.template, 
                    dados
                );
                break;
            case 'push':
                resultadoEnvio = await notificacaoService.enviarPush(
                    notificacao.destinatario, 
                    notificacao.template, 
                    dados
                );
                break;
        }

        res.json({
            sucesso: resultadoEnvio.sucesso,
            resultado: resultadoEnvio,
            mensagem: resultadoEnvio.sucesso ? 'Notificação reenviada com sucesso' : 'Falha ao reenviar notificação'
        });

    } catch (error) {
        console.error('❌ Erro ao reenviar notificação:', error);
        res.status(500).json({
            erro: 'Erro interno do servidor',
            detalhes: error.message
        });
    }
});

/**
 * Buscar configurações de notificação do usuário
 * GET /api/notificacoes/configuracao/:usuario_id
 */
router.get('/configuracao/:usuario_id', verificarAutenticacao, async (req, res) => {
    try {
        const { usuario_id } = req.params;

        // Verificar se o usuário pode acessar essas configurações
        if (req.usuario.id !== parseInt(usuario_id) && !['admin', 'diretor'].includes(req.usuario.tipo_usuario)) {
            return res.status(403).json({
                erro: 'Acesso negado. Você só pode ver suas próprias configurações.'
            });
        }

        const sql = `
            SELECT 
                notificacoes_email,
                notificacoes_sms,
                notificacoes_push,
                push_token
            FROM usuarios 
            WHERE id = ?
        `;

        const resultado = await conexao.executarConsulta(sql, [usuario_id]);

        if (resultado.length === 0) {
            return res.status(404).json({
                erro: 'Usuário não encontrado'
            });
        }

        res.json({
            sucesso: true,
            configuracao: resultado[0]
        });

    } catch (error) {
        console.error('❌ Erro ao buscar configurações:', error);
        res.status(500).json({
            erro: 'Erro interno do servidor',
            detalhes: error.message
        });
    }
});

/**
 * Atualizar configurações de notificação do usuário
 * PUT /api/notificacoes/configuracao/:usuario_id
 */
router.put('/configuracao/:usuario_id', verificarAutenticacao, async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const { notificacoes_email, notificacoes_sms, notificacoes_push, push_token } = req.body;

        // Verificar se o usuário pode alterar essas configurações
        if (req.usuario.id !== parseInt(usuario_id) && !['admin', 'diretor'].includes(req.usuario.tipo_usuario)) {
            return res.status(403).json({
                erro: 'Acesso negado. Você só pode alterar suas próprias configurações.'
            });
        }

        const sql = `
            UPDATE usuarios 
            SET 
                notificacoes_email = ?,
                notificacoes_sms = ?,
                notificacoes_push = ?,
                push_token = ?,
                data_atualizacao = NOW()
            WHERE id = ?
        `;

        await conexao.executarConsulta(sql, [
            notificacoes_email ? 1 : 0,
            notificacoes_sms ? 1 : 0,
            notificacoes_push ? 1 : 0,
            push_token || null,
            usuario_id
        ]);

        res.json({
            sucesso: true,
            mensagem: 'Configurações atualizadas com sucesso'
        });

    } catch (error) {
        console.error('❌ Erro ao atualizar configurações:', error);
        res.status(500).json({
            erro: 'Erro interno do servidor',
            detalhes: error.message
        });
    }
});

/**
 * Buscar histórico de notificações do usuário
 * GET /api/notificacoes/historico/:usuario_id
 */
router.get('/historico/:usuario_id', verificarAutenticacao, async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const { limite = 20, offset = 0, tipo } = req.query;

        // Verificar se o usuário pode acessar esse histórico
        if (req.usuario.id !== parseInt(usuario_id) && !['admin', 'diretor'].includes(req.usuario.tipo_usuario)) {
            return res.status(403).json({
                erro: 'Acesso negado. Você só pode ver seu próprio histórico.'
            });
        }

        let sql = `
            SELECT 
                id,
                tipo,
                destinatario,
                template,
                status,
                dados,
                external_id,
                erro,
                created_at,
                updated_at
            FROM notificacoes_log 
            WHERE destinatario = (SELECT email FROM usuarios WHERE id = ?)
        `;

        let params = [usuario_id];

        if (tipo) {
            sql += ' AND tipo = ?';
            params.push(tipo);
        }

        sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limite), parseInt(offset));

        const historico = await conexao.executarConsulta(sql, params);

        res.json({
            sucesso: true,
            historico: historico,
            total: historico.length,
            limite: parseInt(limite),
            offset: parseInt(offset)
        });

    } catch (error) {
        console.error('❌ Erro ao buscar histórico:', error);
        res.status(500).json({
            erro: 'Erro interno do servidor',
            detalhes: error.message
        });
    }
});

/**
 * Disparar evento de teste
 * POST /api/notificacoes/evento
 */
router.post('/evento', verificarAutenticacao, async (req, res) => {
    try {
        // Verificar se é admin ou diretor
        if (!['admin', 'diretor'].includes(req.usuario.tipo_usuario)) {
            return res.status(403).json({
                erro: 'Acesso negado. Apenas administradores ou diretores.'
            });
        }

        const { tipo, dados } = req.body;

        if (!tipo || !dados) {
            return res.status(400).json({
                erro: 'Tipo e dados do evento são obrigatórios'
            });
        }

        // Importar o eventoManager
        const eventoManager = require('../services/eventoManager');

        // Disparar o evento
        await eventoManager.emit(tipo, dados);

        res.json({
            sucesso: true,
            mensagem: `Evento '${tipo}' disparado com sucesso`,
            dados: dados
        });

    } catch (error) {
        console.error('❌ Erro ao disparar evento:', error);
        res.status(500).json({
            erro: 'Erro interno do servidor',
            detalhes: error.message
        });
    }
});

module.exports = router;
