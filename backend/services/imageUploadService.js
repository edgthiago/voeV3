/**
 * 📸 SERVIÇO DE UPLOAD DE IMAGENS
 * Data: 10 de Julho de 2025
 * Funcionalidades:
 * - Upload múltiplas imagens por produto
 * - Redimensionamento automático
 * - Compressão otimizada
 * - Validação de formatos
 * - Geração de thumbnails
 */

const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');

class ImageUploadService {
    constructor() {
        this.uploadDir = path.join(__dirname, '../uploads/produtos');
        this.thumbDir = path.join(__dirname, '../uploads/produtos/thumbnails');
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedFormats = ['jpeg', 'jpg', 'png', 'webp'];
        
        // Garantir que os diretórios existam
        this.ensureDirectories();
    }

    async ensureDirectories() {
        try {
            await fs.ensureDir(this.uploadDir);
            await fs.ensureDir(this.thumbDir);
            console.log('📁 Diretórios de upload criados');
        } catch (error) {
            console.error('❌ Erro ao criar diretórios:', error);
        }
    }

    // Configuração do Multer
    getMulterConfig() {
        const storage = multer.memoryStorage(); // Usar memória para processar com Sharp

        const fileFilter = (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase().slice(1);
            
            if (this.allowedFormats.includes(ext)) {
                cb(null, true);
            } else {
                cb(new Error(`Formato não suportado: ${ext}. Use: ${this.allowedFormats.join(', ')}`), false);
            }
        };

        return multer({
            storage,
            fileFilter,
            limits: {
                fileSize: this.maxFileSize,
                files: 5 // Máximo 5 imagens por vez
            }
        });
    }

    // Processar e salvar imagem
    async processarImagem(buffer, originalName, produtoId, tipoImagem = 'adicional', ordem = 1) {
        try {
            const fileId = uuidv4();
            const ext = path.extname(originalName).toLowerCase();
            const nomeArquivo = `produto_${produtoId}_${tipoImagem}_${ordem}_${fileId}${ext}`;
            const caminhoCompleto = path.join(this.uploadDir, nomeArquivo);
            const caminhoThumb = path.join(this.thumbDir, `thumb_${nomeArquivo}`);

            // Obter metadados da imagem
            const metadata = await sharp(buffer).metadata();
            
            // Redimensionar e otimizar imagem principal
            const imagemPrincipal = await sharp(buffer)
                .resize(800, 800, { 
                    fit: 'inside',
                    withoutEnlargement: true 
                })
                .jpeg({ 
                    quality: 85,
                    progressive: true 
                })
                .toBuffer();

            // Criar thumbnail
            const thumbnail = await sharp(buffer)
                .resize(200, 200, { 
                    fit: 'cover',
                    position: 'center' 
                })
                .jpeg({ 
                    quality: 75 
                })
                .toBuffer();

            // Salvar arquivos
            await fs.writeFile(caminhoCompleto, imagemPrincipal);
            await fs.writeFile(caminhoThumb, thumbnail);

            // Retornar informações da imagem
            return {
                nomeArquivo,
                urlImagem: `/uploads/produtos/${nomeArquivo}`,
                urlThumbnail: `/uploads/produtos/thumbnails/thumb_${nomeArquivo}`,
                tamanhoBytes: imagemPrincipal.length,
                largura: metadata.width,
                altura: metadata.height,
                formato: metadata.format
            };

        } catch (error) {
            console.error('❌ Erro ao processar imagem:', error);
            throw new Error(`Erro no processamento: ${error.message}`);
        }
    }

    // Deletar imagem física
    async deletarArquivoImagem(nomeArquivo) {
        try {
            const caminhoImagem = path.join(this.uploadDir, nomeArquivo);
            const caminhoThumb = path.join(this.thumbDir, `thumb_${nomeArquivo}`);

            if (await fs.pathExists(caminhoImagem)) {
                await fs.remove(caminhoImagem);
            }

            if (await fs.pathExists(caminhoThumb)) {
                await fs.remove(caminhoThumb);
            }

            console.log(`🗑️ Arquivo deletado: ${nomeArquivo}`);
        } catch (error) {
            console.error('❌ Erro ao deletar arquivo:', error);
        }
    }

    // Validar dimensões mínimas
    async validarDimensoes(buffer, minWidth = 300, minHeight = 300) {
        try {
            const metadata = await sharp(buffer).metadata();
            
            if (metadata.width < minWidth || metadata.height < minHeight) {
                throw new Error(`Imagem muito pequena. Mínimo: ${minWidth}x${minHeight}px`);
            }

            return true;
        } catch (error) {
            throw new Error(`Erro na validação: ${error.message}`);
        }
    }

    // Gerar nome alt automático
    gerarAltText(nomeProduto, tipoImagem, ordem) {
        if (tipoImagem === 'principal') {
            return `Imagem principal de ${nomeProduto}`;
        } else {
            return `${nomeProduto} - Imagem ${ordem}`;
        }
    }
}

module.exports = new ImageUploadService();
