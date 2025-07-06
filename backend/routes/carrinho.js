const express = require('express');
const AuthUtils = require('../utils/auth');
const bancoDados = require('../banco/conexao');

const router = express.Router();

// Adicionar item ao carrinho
router.post('/adicionar', AuthUtils.middlewareAuth, async (req, res) => {
    try {
        const { produto_id, quantidade, tamanho } = req.body;
        const usuario_id = req.usuario.id;
        
        if (!produto_id || !quantidade || !tamanho) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Produto, quantidade e tamanho são obrigatórios'
            });
        }
        
        // Verificar se produto existe e está disponível
        const produto = await bancoDados.executarConsulta(
            'SELECT id, nome, preco, disponivel FROM produtos WHERE id = ? AND disponivel = 1',
            [produto_id]
        );
        
        if (produto.length === 0) {
            return res.status(404).json({
                sucesso: false,
                erro: 'Produto não encontrado ou indisponível'
            });
        }
        
        // Verificar se item já existe no carrinho
        const itemExistente = await bancoDados.executarConsulta(
            'SELECT id, quantidade FROM carrinho WHERE usuario_id = ? AND produto_id = ? AND tamanho = ?',
            [usuario_id, produto_id, tamanho]
        );
        
        if (itemExistente.length > 0) {
            // Atualizar quantidade
            const novaQuantidade = itemExistente[0].quantidade + quantidade;
            await bancoDados.executarConsulta(
                'UPDATE carrinho SET quantidade = ?, updated_at = NOW() WHERE id = ?',
                [novaQuantidade, itemExistente[0].id]
            );
        } else {
            // Adicionar novo item
            await bancoDados.executarConsulta(
                'INSERT INTO carrinho (usuario_id, produto_id, quantidade, tamanho, preco_unitario) VALUES (?, ?, ?, ?, ?)',
                [usuario_id, produto_id, quantidade, tamanho, produto[0].preco]
            );
        }
        
        res.json({
            sucesso: true,
            mensagem: 'Item adicionado ao carrinho'
        });
        
    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// Listar itens do carrinho
router.get('/', AuthUtils.middlewareAuth, async (req, res) => {
    try {
        const usuario_id = req.usuario.id;
        
        const itens = await bancoDados.executarConsulta(`
            SELECT 
                c.id,
                c.quantidade,
                c.tamanho,
                c.preco_unitario,
                p.id as produto_id,
                p.nome as produto_nome,
                p.preco as preco_atual,
                p.imagem_url,
                (c.quantidade * c.preco_unitario) as subtotal
            FROM carrinho c
            JOIN produtos p ON c.produto_id = p.id
            WHERE c.usuario_id = ? AND p.disponivel = 1
            ORDER BY c.created_at DESC
        `, [usuario_id]);
        
        const total = itens.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
        
        res.json({
            sucesso: true,
            itens,
            total: parseFloat(total.toFixed(2)),
            quantidade_itens: itens.length
        });
        
    } catch (error) {
        console.error('Erro ao listar carrinho:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// Atualizar quantidade do item
router.put('/item/:id', AuthUtils.middlewareAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { quantidade } = req.body;
        const usuario_id = req.usuario.id;
        
        if (!quantidade || quantidade < 1) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Quantidade deve ser maior que zero'
            });
        }
        
        const resultado = await bancoDados.executarConsulta(
            'UPDATE carrinho SET quantidade = ?, updated_at = NOW() WHERE id = ? AND usuario_id = ?',
            [quantidade, id, usuario_id]
        );
        
        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                sucesso: false,
                erro: 'Item não encontrado no carrinho'
            });
        }
        
        res.json({
            sucesso: true,
            mensagem: 'Quantidade atualizada'
        });
        
    } catch (error) {
        console.error('Erro ao atualizar carrinho:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// Remover item do carrinho
router.delete('/item/:id', AuthUtils.middlewareAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.usuario.id;
        
        const resultado = await bancoDados.executarConsulta(
            'DELETE FROM carrinho WHERE id = ? AND usuario_id = ?',
            [id, usuario_id]
        );
        
        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                sucesso: false,
                erro: 'Item não encontrado no carrinho'
            });
        }
        
        res.json({
            sucesso: true,
            mensagem: 'Item removido do carrinho'
        });
        
    } catch (error) {
        console.error('Erro ao remover do carrinho:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// Limpar carrinho
router.delete('/limpar', AuthUtils.middlewareAuth, async (req, res) => {
    try {
        const usuario_id = req.usuario.id;
        
        await bancoDados.executarConsulta(
            'DELETE FROM carrinho WHERE usuario_id = ?',
            [usuario_id]
        );
        
        res.json({
            sucesso: true,
            mensagem: 'Carrinho limpo'
        });
        
    } catch (error) {
        console.error('Erro ao limpar carrinho:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

module.exports = router;