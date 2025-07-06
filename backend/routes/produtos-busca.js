const express = require('express');
const bancoDados = require('../banco/conexao');

const router = express.Router();

// Buscar produtos com filtros avançados
router.get('/buscar', async (req, res) => {
    try {
        const {
            q, // termo de busca
            categoria,
            marca,
            cor,
            tamanho,
            preco_min,
            preco_max,
            ordenar = 'nome',
            direcao = 'ASC',
            page = 1,
            limit = 12
        } = req.query;
        
        let sql = `
            SELECT DISTINCT
                p.id,
                p.nome,
                p.descricao,
                p.preco,
                p.imagem_url,
                p.marca,
                p.cor,
                c.nome as categoria_nome,
                GROUP_CONCAT(DISTINCT pt.tamanho ORDER BY pt.tamanho) as tamanhos_disponiveis
            FROM produtos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN produto_tamanhos pt ON p.id = pt.produto_id
            WHERE p.disponivel = 1
        `;
        
        const parametros = [];
        
        // Filtro de busca textual
        if (q) {
            sql += ` AND (p.nome LIKE ? OR p.descricao LIKE ? OR p.marca LIKE ?)`;
            const termoBusca = `%${q}%`;
            parametros.push(termoBusca, termoBusca, termoBusca);
        }
        
        // Filtro por categoria
        if (categoria) {
            sql += ` AND p.categoria_id = ?`;
            parametros.push(categoria);
        }
        
        // Filtro por marca
        if (marca) {
            sql += ` AND p.marca LIKE ?`;
            parametros.push(`%${marca}%`);
        }
        
        // Filtro por cor
        if (cor) {
            sql += ` AND p.cor LIKE ?`;
            parametros.push(`%${cor}%`);
        }
        
        // Filtro por faixa de preço
        if (preco_min) {
            sql += ` AND p.preco >= ?`;
            parametros.push(parseFloat(preco_min));
        }
        
        if (preco_max) {
            sql += ` AND p.preco <= ?`;
            parametros.push(parseFloat(preco_max));
        }
        
        // Filtro por tamanho
        if (tamanho) {
            sql += ` AND pt.tamanho = ?`;
            parametros.push(tamanho);
        }
        
        // Agrupar por produto
        sql += ` GROUP BY p.id`;
        
        // Ordenação
        const ordenarPermitidos = ['nome', 'preco', 'created_at'];
        const direcaoPermitida = ['ASC', 'DESC'];
        
        if (ordenarPermitidos.includes(ordenar) && direcaoPermitida.includes(direcao.toUpperCase())) {
            sql += ` ORDER BY p.${ordenar} ${direcao}`;
        } else {
            sql += ` ORDER BY p.nome ASC`;
        }
        
        // Paginação
        const offset = (parseInt(page) - 1) * parseInt(limit);
        sql += ` LIMIT ? OFFSET ?`;
        parametros.push(parseInt(limit), offset);
        
        const produtos = await bancoDados.executarConsulta(sql, parametros);
        
        // Contar total para paginação (sem LIMIT)
        let sqlCount = sql.replace(/SELECT DISTINCT.*GROUP BY p\.id/, 'SELECT COUNT(DISTINCT p.id) as total');
        sqlCount = sqlCount.replace(/ORDER BY.*$/, '').replace(/LIMIT.*$/, '');
        
        const parametrosCount = parametros.slice(0, -2); // Remove LIMIT e OFFSET
        const totalResult = await bancoDados.executarConsulta(sqlCount, parametrosCount);
        const total = totalResult[0].total;
        
        // Processar tamanhos disponíveis
        produtos.forEach(produto => {
            produto.tamanhos_disponiveis = produto.tamanhos_disponiveis 
                ? produto.tamanhos_disponiveis.split(',') 
                : [];
        });
        
        res.json({
            sucesso: true,
            produtos,
            paginacao: {
                pagina_atual: parseInt(page),
                itens_por_pagina: parseInt(limit),
                total_itens: total,
                total_paginas: Math.ceil(total / parseInt(limit))
            }
        });
        
    } catch (error) {
        console.error('Erro na busca de produtos:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// Obter filtros disponíveis
router.get('/filtros', async (req, res) => {
    try {
        const categorias = await bancoDados.executarConsulta(`
            SELECT DISTINCT c.id, c.nome, COUNT(p.id) as total_produtos
            FROM categorias c
            LEFT JOIN produtos p ON c.id = p.categoria_id AND p.disponivel = 1
            GROUP BY c.id, c.nome
            HAVING total_produtos > 0
            ORDER BY c.nome
        `);
        
        const marcas = await bancoDados.executarConsulta(`
            SELECT DISTINCT marca, COUNT(*) as total_produtos
            FROM produtos 
            WHERE disponivel = 1 AND marca IS NOT NULL AND marca != ''
            GROUP BY marca
            ORDER BY marca
        `);
        
        const cores = await bancoDados.executarConsulta(`
            SELECT DISTINCT cor, COUNT(*) as total_produtos
            FROM produtos 
            WHERE disponivel = 1 AND cor IS NOT NULL AND cor != ''
            GROUP BY cor
            ORDER BY cor
        `);
        
        const tamanhos = await bancoDados.executarConsulta(`
            SELECT DISTINCT pt.tamanho, COUNT(DISTINCT p.id) as total_produtos
            FROM produto_tamanhos pt
            JOIN produtos p ON pt.produto_id = p.id
            WHERE p.disponivel = 1
            GROUP BY pt.tamanho
            ORDER BY pt.tamanho
        `);
        
        const precos = await bancoDados.executarConsulta(`
            SELECT 
                MIN(preco) as preco_minimo,
                MAX(preco) as preco_maximo
            FROM produtos 
            WHERE disponivel = 1
        `);
        
        res.json({
            sucesso: true,
            filtros: {
                categorias,
                marcas,
                cores,
                tamanhos,
                faixa_preco: precos[0]
            }
        });
        
    } catch (error) {
        console.error('Erro ao obter filtros:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// Produtos em destaque/promoção
router.get('/destaques', async (req, res) => {
    try {
        const produtos = await bancoDados.executarConsulta(`
            SELECT 
                p.id,
                p.nome,
                p.descricao,
                p.preco,
                p.imagem_url,
                p.marca,
                p.cor,
                c.nome as categoria_nome,
                pr.desconto_percentual,
                (p.preco * (100 - COALESCE(pr.desconto_percentual, 0)) / 100) as preco_promocional
            FROM produtos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN promocoes_relampago pr ON p.id = pr.produto_id 
                AND pr.ativo = 1 
                AND NOW() BETWEEN pr.data_inicio AND pr.data_fim
            WHERE p.disponivel = 1 
                AND (p.destaque = 1 OR pr.id IS NOT NULL)
            ORDER BY pr.desconto_percentual DESC, p.created_at DESC
            LIMIT 8
        `);
        
        res.json({
            sucesso: true,
            produtos
        });
        
    } catch (error) {
        console.error('Erro ao buscar destaques:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// Produtos relacionados/similares
router.get('/:id/relacionados', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Buscar produto atual para pegar categoria e marca
        const produtoAtual = await bancoDados.executarConsulta(
            'SELECT categoria_id, marca FROM produtos WHERE id = ?',
            [id]
        );
        
        if (produtoAtual.length === 0) {
            return res.status(404).json({
                sucesso: false,
                erro: 'Produto não encontrado'
            });
        }
        
        const { categoria_id, marca } = produtoAtual[0];
        
        // Buscar produtos relacionados
        const relacionados = await bancoDados.executarConsulta(`
            SELECT 
                p.id,
                p.nome,
                p.preco,
                p.imagem_url,
                p.marca,
                c.nome as categoria_nome
            FROM produtos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.disponivel = 1 
                AND p.id != ?
                AND (p.categoria_id = ? OR p.marca = ?)
            ORDER BY 
                CASE WHEN p.categoria_id = ? AND p.marca = ? THEN 1 ELSE 2 END,
                RAND()
            LIMIT 6
        `, [id, categoria_id, marca, categoria_id, marca]);
        
        res.json({
            sucesso: true,
            produtos: relacionados
        });
        
    } catch (error) {
        console.error('Erro ao buscar produtos relacionados:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

module.exports = router;