/**
 * @fileoverview Rotas de Usuários
 * @description Gerenciamento de usuários do sistema
 * @author Sistema de Papelaria
 * @version 1.0
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const conexao = require('../banco/conexao');
const { verificarAutenticacao } = require('../middleware/autenticacao');

/**
 * Listar usuários (apenas admin/diretor)
 */
router.get('/', verificarAutenticacao, async (req, res) => {
    try {
        // Verificar permissão
        if (!['admin', 'diretor'].includes(req.usuario.tipo_usuario)) {
            return res.status(403).json({
                sucesso: false,
                erro: 'Acesso negado'
            });
        }

        const usuarios = await conexao.executarConsulta(`
            SELECT 
                id, nome, email, telefone, tipo_usuario, 
                status, data_criacao, ultimo_login
            FROM usuarios 
            ORDER BY data_criacao DESC
        `);

        res.json({
            sucesso: true,
            dados: usuarios
        });

    } catch (error) {
        console.error('❌ Erro ao listar usuários:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

/**
 * Obter dados do usuário atual
 */
router.get('/perfil', verificarAutenticacao, async (req, res) => {
    try {
        const usuario = await conexao.executarConsulta(`
            SELECT 
                id, nome, email, telefone, data_nascimento,
                tipo_usuario, status, notificacoes_email,
                notificacoes_sms, notificacoes_push
            FROM usuarios 
            WHERE id = ?
        `, [req.usuario.id]);

        if (usuario.length === 0) {
            return res.status(404).json({
                sucesso: false,
                erro: 'Usuário não encontrado'
            });
        }

        res.json({
            sucesso: true,
            dados: usuario[0]
        });

    } catch (error) {
        console.error('❌ Erro ao obter perfil:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

/**
 * Atualizar perfil do usuário
 */
router.put('/perfil', verificarAutenticacao, async (req, res) => {
    try {
        const { nome, telefone, data_nascimento, notificacoes_email, notificacoes_sms, notificacoes_push } = req.body;

        await conexao.executarConsulta(`
            UPDATE usuarios 
            SET nome = ?, telefone = ?, data_nascimento = ?,
                notificacoes_email = ?, notificacoes_sms = ?, notificacoes_push = ?,
                data_atualizacao = NOW()
            WHERE id = ?
        `, [nome, telefone, data_nascimento, notificacoes_email, notificacoes_sms, notificacoes_push, req.usuario.id]);

        res.json({
            sucesso: true,
            mensagem: 'Perfil atualizado com sucesso'
        });

    } catch (error) {
        console.error('❌ Erro ao atualizar perfil:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

/**
 * Alterar senha
 */
router.put('/senha', verificarAutenticacao, async (req, res) => {
    try {
        const { senha_atual, nova_senha } = req.body;

        // Validar dados
        if (!senha_atual || !nova_senha) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Senha atual e nova senha são obrigatórias'
            });
        }

        // Buscar usuário atual
        const usuarios = await conexao.executarConsulta(`
            SELECT senha_hash FROM usuarios WHERE id = ?
        `, [req.usuario.id]);

        if (usuarios.length === 0) {
            return res.status(404).json({
                sucesso: false,
                erro: 'Usuário não encontrado'
            });
        }

        // Verificar senha atual
        const senhaValida = await bcrypt.compare(senha_atual, usuarios[0].senha_hash);
        if (!senhaValida) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Senha atual incorreta'
            });
        }

        // Criptografar nova senha
        const novaSenhaHash = await bcrypt.hash(nova_senha, 10);

        // Atualizar senha
        await conexao.executarConsulta(`
            UPDATE usuarios 
            SET senha_hash = ?, data_atualizacao = NOW()
            WHERE id = ?
        `, [novaSenhaHash, req.usuario.id]);

        res.json({
            sucesso: true,
            mensagem: 'Senha alterada com sucesso'
        });

    } catch (error) {
        console.error('❌ Erro ao alterar senha:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

/**
 * Obter estatísticas de usuário (admin/diretor)
 */
router.get('/estatisticas', verificarAutenticacao, async (req, res) => {
    try {
        // Verificar permissão
        if (!['admin', 'diretor'].includes(req.usuario.tipo_usuario)) {
            return res.status(403).json({
                sucesso: false,
                erro: 'Acesso negado'
            });
        }

        const estatisticas = await conexao.executarConsulta(`
            SELECT 
                COUNT(*) as total_usuarios,
                COUNT(CASE WHEN tipo_usuario = 'cliente' THEN 1 END) as clientes,
                COUNT(CASE WHEN tipo_usuario = 'colaborador' THEN 1 END) as colaboradores,
                COUNT(CASE WHEN tipo_usuario = 'supervisor' THEN 1 END) as supervisores,
                COUNT(CASE WHEN tipo_usuario = 'diretor' THEN 1 END) as diretores,
                COUNT(CASE WHEN status = 'ativo' THEN 1 END) as ativos,
                COUNT(CASE WHEN ultimo_login >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as ativos_mes
            FROM usuarios
        `);

        res.json({
            sucesso: true,
            dados: estatisticas[0]
        });

    } catch (error) {
        console.error('❌ Erro ao obter estatísticas:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

module.exports = router;
