/**
 * 📸 ROTAS DE UPLOAD DE IMAGENS
 * Data: 10 de Julho de 2025
 * Endpoints:
 * - POST /upload/produto/:id/imagem-principal
 * - POST /upload/produto/:id/imagem-adicional
 * - GET /produtos/:id/imagens
 * - DELETE /produtos/:id/imagens/:imagemId
 * - PUT /produtos/:id/imagens/reordenar
 */

const express = require('express');
const router = express.Router();
const conexao = require('../banco/conexao');
const imageUploadService = require('../services/imageUploadService');
const { verificarAutenticacao, verificarPermissao } = require('../middleware/autenticacao');

// Middleware de upload
const upload = imageUploadService.getMulterConfig();

// POST /api/upload/produto/:id/imagem-principal - Upload de imagem principal
router.post('/produto/:id/imagem-principal', 
    verificarAutenticacao, 
    verificarPermissao('colaborador'),
    upload.single('imagem'),
    async (req, res) => {
        try {
            const produtoId = parseInt(req.params.id);
            const file = req.file;

            if (!file) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Nenhuma imagem enviada'
                });
            }

            // Verificar se produto existe
            const produto = await conexao.executarConsulta(
                'SELECT id, nome FROM produtos WHERE id = ?', 
                [produtoId]
            );

            if (produto.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Produto não encontrado'
                });
            }

            // Validar dimensões
            await imageUploadService.validarDimensoes(file.buffer, 400, 400);

            // Processar imagem
            const imagemInfo = await imageUploadService.processarImagem(
                file.buffer,
                file.originalname,
                produtoId,
                'principal',
                1
            );

            // Remover imagem principal anterior se existir
            const imagemAnterior = await conexao.executarConsulta(
                'SELECT nome_arquivo FROM produto_imagens WHERE produto_id = ? AND tipo_imagem = "principal"',
                [produtoId]
            );

            if (imagemAnterior.length > 0) {
                await imageUploadService.deletarArquivoImagem(imagemAnterior[0].nome_arquivo);
                await conexao.executarConsulta(
                    'DELETE FROM produto_imagens WHERE produto_id = ? AND tipo_imagem = "principal"',
                    [produtoId]
                );
            }

            // Salvar no banco
            const altText = imageUploadService.gerarAltText(produto[0].nome, 'principal', 1);
            
            const resultado = await conexao.executarConsulta(`
                INSERT INTO produto_imagens 
                (produto_id, url_imagem, nome_arquivo, tipo_imagem, ordem, alt_text, tamanho_bytes, largura, altura, formato)
                VALUES (?, ?, ?, 'principal', 1, ?, ?, ?, ?, ?)
            `, [
                produtoId,
                imagemInfo.urlImagem,
                imagemInfo.nomeArquivo,
                altText,
                imagemInfo.tamanhoBytes,
                imagemInfo.largura,
                imagemInfo.altura,
                imagemInfo.formato
            ]);

            console.log(`📸 Nova imagem principal salva para produto ${produtoId}`);

            res.json({
                sucesso: true,
                mensagem: 'Imagem principal enviada com sucesso',
                dados: {
                    id: resultado.insertId,
                    produto_id: produtoId,
                    url_imagem: imagemInfo.urlImagem,
                    url_thumbnail: imagemInfo.urlThumbnail,
                    tipo_imagem: 'principal',
                    ordem: 1,
                    alt_text: altText,
                    tamanho_bytes: imagemInfo.tamanhoBytes,
                    dimensoes: `${imagemInfo.largura}x${imagemInfo.altura}`,
                    formato: imagemInfo.formato
                }
            });

        } catch (error) {
            console.error('❌ Erro no upload da imagem principal:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: error.message || 'Erro interno no upload'
            });
        }
    }
);

// POST /api/upload/produto/:id/imagem-adicional - Upload de imagens adicionais
router.post('/produto/:id/imagem-adicional',
    verificarAutenticacao,
    verificarPermissao('colaborador'),
    upload.array('imagens', 4), // Máximo 4 imagens adicionais
    async (req, res) => {
        try {
            const produtoId = parseInt(req.params.id);
            const files = req.files;

            if (!files || files.length === 0) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Nenhuma imagem enviada'
                });
            }

            // Verificar se produto existe
            const produto = await conexao.executarConsulta(
                'SELECT id, nome FROM produtos WHERE id = ?',
                [produtoId]
            );

            if (produto.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Produto não encontrado'
                });
            }

            // Verificar quantas imagens adicionais já existem
            const imagensExistentes = await conexao.executarConsulta(
                'SELECT COUNT(*) as total FROM produto_imagens WHERE produto_id = ? AND tipo_imagem = "adicional"',
                [produtoId]
            );

            const totalExistente = imagensExistentes[0].total;
            const novasImagens = files.length;

            if (totalExistente + novasImagens > 4) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: `Limite excedido. Máximo 4 imagens adicionais. Você tem ${totalExistente} e está tentando adicionar ${novasImagens}.`
                });
            }

            const imagensSalvas = [];

            // Processar cada imagem
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const ordem = totalExistente + i + 1;

                try {
                    // Validar dimensões
                    await imageUploadService.validarDimensoes(file.buffer, 300, 300);

                    // Processar imagem
                    const imagemInfo = await imageUploadService.processarImagem(
                        file.buffer,
                        file.originalname,
                        produtoId,
                        'adicional',
                        ordem
                    );

                    // Salvar no banco
                    const altText = imageUploadService.gerarAltText(produto[0].nome, 'adicional', ordem);

                    const resultado = await conexao.executarConsulta(`
                        INSERT INTO produto_imagens 
                        (produto_id, url_imagem, nome_arquivo, tipo_imagem, ordem, alt_text, tamanho_bytes, largura, altura, formato)
                        VALUES (?, ?, ?, 'adicional', ?, ?, ?, ?, ?, ?)
                    `, [
                        produtoId,
                        imagemInfo.urlImagem,
                        imagemInfo.nomeArquivo,
                        ordem,
                        altText,
                        imagemInfo.tamanhoBytes,
                        imagemInfo.largura,
                        imagemInfo.altura,
                        imagemInfo.formato
                    ]);

                    imagensSalvas.push({
                        id: resultado.insertId,
                        url_imagem: imagemInfo.urlImagem,
                        url_thumbnail: imagemInfo.urlThumbnail,
                        ordem: ordem,
                        alt_text: altText,
                        formato: imagemInfo.formato
                    });

                } catch (fileError) {
                    console.error(`❌ Erro ao processar arquivo ${file.originalname}:`, fileError);
                    // Continuar com os próximos arquivos
                }
            }

            console.log(`📸 ${imagensSalvas.length} imagens adicionais salvas para produto ${produtoId}`);

            res.json({
                sucesso: true,
                mensagem: `${imagensSalvas.length} imagens adicionais enviadas com sucesso`,
                dados: {
                    produto_id: produtoId,
                    imagens_salvas: imagensSalvas.length,
                    imagens: imagensSalvas
                }
            });

        } catch (error) {
            console.error('❌ Erro no upload das imagens adicionais:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: error.message || 'Erro interno no upload'
            });
        }
    }
);

// GET /api/produtos/:id/imagens - Listar todas as imagens de um produto
router.get('/produtos/:id/imagens', async (req, res) => {
    try {
        const produtoId = parseInt(req.params.id);

        const imagens = await conexao.executarConsulta(`
            SELECT 
                id,
                produto_id,
                url_imagem,
                nome_arquivo,
                tipo_imagem,
                ordem,
                alt_text,
                tamanho_bytes,
                largura,
                altura,
                formato,
                ativo,
                criado_em
            FROM produto_imagens 
            WHERE produto_id = ? AND ativo = 1
            ORDER BY tipo_imagem DESC, ordem ASC
        `, [produtoId]);

        // Separar por tipo
        const principal = imagens.filter(img => img.tipo_imagem === 'principal')[0] || null;
        const adicionais = imagens.filter(img => img.tipo_imagem === 'adicional');

        res.json({
            sucesso: true,
            dados: {
                produto_id: produtoId,
                total_imagens: imagens.length,
                imagem_principal: principal,
                imagens_adicionais: adicionais,
                todas_imagens: imagens
            }
        });

    } catch (error) {
        console.error('❌ Erro ao buscar imagens:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar imagens do produto'
        });
    }
});

// DELETE /api/produtos/:id/imagens/:imagemId - Deletar uma imagem
router.delete('/produtos/:id/imagens/:imagemId',
    verificarAutenticacao,
    verificarPermissao('colaborador'),
    async (req, res) => {
        try {
            const produtoId = parseInt(req.params.id);
            const imagemId = parseInt(req.params.imagemId);

            // Buscar informações da imagem
            const imagem = await conexao.executarConsulta(
                'SELECT nome_arquivo, tipo_imagem FROM produto_imagens WHERE id = ? AND produto_id = ?',
                [imagemId, produtoId]
            );

            if (imagem.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Imagem não encontrada'
                });
            }

            // Não permitir deletar imagem principal se não houver substituta
            if (imagem[0].tipo_imagem === 'principal') {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Não é possível deletar a imagem principal. Envie uma nova primeiro.'
                });
            }

            // Deletar arquivo físico
            await imageUploadService.deletarArquivoImagem(imagem[0].nome_arquivo);

            // Deletar do banco
            await conexao.executarConsulta(
                'DELETE FROM produto_imagens WHERE id = ? AND produto_id = ?',
                [imagemId, produtoId]
            );

            console.log(`🗑️ Imagem ${imagemId} deletada do produto ${produtoId}`);

            res.json({
                sucesso: true,
                mensagem: 'Imagem deletada com sucesso'
            });

        } catch (error) {
            console.error('❌ Erro ao deletar imagem:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao deletar imagem'
            });
        }
    }
);

// PUT /api/produtos/:id/imagens/reordenar - Reordenar imagens adicionais
router.put('/produtos/:id/imagens/reordenar',
    verificarAutenticacao,
    verificarPermissao('colaborador'),
    async (req, res) => {
        try {
            const produtoId = parseInt(req.params.id);
            const { ordem_imagens } = req.body; // Array: [{ id: 1, ordem: 2 }, { id: 2, ordem: 1 }]

            if (!Array.isArray(ordem_imagens)) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Formato inválido. Envie array de { id, ordem }'
                });
            }

            // Atualizar ordem de cada imagem
            for (const item of ordem_imagens) {
                await conexao.executarConsulta(
                    'UPDATE produto_imagens SET ordem = ? WHERE id = ? AND produto_id = ? AND tipo_imagem = "adicional"',
                    [item.ordem, item.id, produtoId]
                );
            }

            console.log(`🔄 Ordem das imagens atualizada para produto ${produtoId}`);

            res.json({
                sucesso: true,
                mensagem: 'Ordem das imagens atualizada com sucesso'
            });

        } catch (error) {
            console.error('❌ Erro ao reordenar imagens:', error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao reordenar imagens'
            });
        }
    }
);

module.exports = router;
