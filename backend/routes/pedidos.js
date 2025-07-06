const express = require('express');
const AuthUtils = require('../utils/auth');
const bancoDados = require('../banco/conexao');

const router = express.Router();

// Finalizar pedido
router.post('/finalizar', AuthUtils.middlewareAuth, async (req, res) => {
    try {
        const {
            endereco_entrega,
            forma_pagamento,
            observacoes
        } = req.body;
        
        const usuario_id = req.usuario.id;
        
        // Validações básicas
        if (!endereco_entrega || !forma_pagamento) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Endereço de entrega e forma de pagamento são obrigatórios'
            });
        }
        
        // Buscar itens do carrinho
        const itensCarrinho = await bancoDados.executarConsulta(`
            SELECT 
                c.produto_id,
                c.quantidade,
                c.tamanho,
                c.preco_unitario,
                p.nome as produto_nome,
                (c.quantidade * c.preco_unitario) as subtotal
            FROM carrinho c
            JOIN produtos p ON c.produto_id = p.id
            WHERE c.usuario_id = ? AND p.disponivel = 1
        `, [usuario_id]);
        
        if (itensCarrinho.length === 0) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Carrinho vazio'
            });
        }
        
        // Calcular total
        const total = itensCarrinho.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
        
        // Executar transação para criar pedido
        const operacoes = [];
        
        // 1. Criar pedido principal
        operacoes.push({
            sql: `INSERT INTO pedidos (
                usuario_id, total, status, forma_pagamento, 
                endereco_entrega, observacoes, data_pedido
            ) VALUES (?, ?, 'pendente', ?, ?, ?, NOW())`,
            parametros: [usuario_id, total.toFixed(2), forma_pagamento, JSON.stringify(endereco_entrega), observacoes]
        });
        
        const resultados = await bancoDados.executarTransaction(operacoes);
        const pedido_id = resultados[0].insertId;
        
        // 2. Criar itens do pedido
        const operacoesItens = [];
        for (const item of itensCarrinho) {
            operacoesItens.push({
                sql: `INSERT INTO pedido_itens (
                    pedido_id, produto_id, quantidade, tamanho, 
                    preco_unitario, subtotal
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                parametros: [
                    pedido_id,
                    item.produto_id,
                    item.quantidade,
                    item.tamanho,
                    item.preco_unitario,
                    item.subtotal
                ]
            });
        }
        
        // 3. Limpar carrinho
        operacoesItens.push({
            sql: 'DELETE FROM carrinho WHERE usuario_id = ?',
            parametros: [usuario_id]
        });
        
        await bancoDados.executarTransaction(operacoesItens);
        
        res.status(201).json({
            sucesso: true,
            mensagem: 'Pedido realizado com sucesso',
            pedido: {
                id: pedido_id,
                total: parseFloat(total.toFixed(2)),
                status: 'pendente',
                itens: itensCarrinho.length
            }
        });
        
    } catch (error) {
        console.error('Erro ao finalizar pedido:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// Listar pedidos do usuário
router.get('/meus-pedidos', AuthUtils.middlewareAuth, async (req, res) => {
    try {
        const usuario_id = req.usuario.id;
        const { page = 1, limit = 10 } = req.query;
        
        const offset = (page - 1) * limit;
        
        const pedidos = await bancoDados.executarConsulta(`
            SELECT 
                id,
                total,
                status,
                forma_pagamento,
                data_pedido,
                observacoes
            FROM pedidos 
            WHERE usuario_id = ?
            ORDER BY data_pedido DESC
            LIMIT ? OFFSET ?
        `, [usuario_id, parseInt(limit), parseInt(offset)]);
        
        // Buscar itens de cada pedido
        for (let pedido of pedidos) {
            const itens = await bancoDados.executarConsulta(`
                SELECT 
                    pi.quantidade,
                    pi.tamanho,
                    pi.preco_unitario,
                    pi.subtotal,
                    p.nome as produto_nome,
                    p.imagem_url
                FROM pedido_itens pi
                JOIN produtos p ON pi.produto_id = p.id
                WHERE pi.pedido_id = ?
            `, [pedido.id]);
            
            pedido.itens = itens;
        }
        
        res.json({
            sucesso: true,
            pedidos,
            pagina_atual: parseInt(page),
            itens_por_pagina: parseInt(limit)
        });
        
    } catch (error) {
        console.error('Erro ao listar pedidos:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// Buscar pedido específico
router.get('/:id', AuthUtils.middlewareAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.usuario.id;
        
        const pedidos = await bancoDados.executarConsulta(`
            SELECT 
                id,
                total,
                status,
                forma_pagamento,
                endereco_entrega,
                observacoes,
                data_pedido
            FROM pedidos 
            WHERE id = ? AND usuario_id = ?
        `, [id, usuario_id]);
        
        if (pedidos.length === 0) {
            return res.status(404).json({
                sucesso: false,
                erro: 'Pedido não encontrado'
            });
        }
        
        const pedido = pedidos[0];
        
        // Buscar itens do pedido
        const itens = await bancoDados.executarConsulta(`
            SELECT 
                pi.quantidade,
                pi.tamanho,
                pi.preco_unitario,
                pi.subtotal,
                p.nome as produto_nome,
                p.imagem_url,
                p.id as produto_id
            FROM pedido_itens pi
            JOIN produtos p ON pi.produto_id = p.id
            WHERE pi.pedido_id = ?
        `, [id]);
        
        pedido.itens = itens;
        pedido.endereco_entrega = JSON.parse(pedido.endereco_entrega);
        
        res.json({
            sucesso: true,
            pedido
        });
        
    } catch (error) {
        console.error('Erro ao buscar pedido:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// Cancelar pedido (apenas se status for 'pendente')
router.put('/:id/cancelar', AuthUtils.middlewareAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.usuario.id;
        
        const resultado = await bancoDados.executarConsulta(
            'UPDATE pedidos SET status = "cancelado" WHERE id = ? AND usuario_id = ? AND status = "pendente"',
            [id, usuario_id]
        );
        
        if (resultado.affectedRows === 0) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Pedido não pode ser cancelado ou não encontrado'
            });
        }
        
        res.json({
            sucesso: true,
            mensagem: 'Pedido cancelado com sucesso'
        });
        
    } catch (error) {
        console.error('Erro ao cancelar pedido:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

module.exports = router;