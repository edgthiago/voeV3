-- =====================================================
-- MIGRATION: Sistema de Múltiplas Imagens para Produtos
-- Data: 10 de Julho de 2025
-- Objetivo: Suportar 1 imagem principal + 4 adicionais
-- =====================================================

-- Criar tabela para múltiplas imagens de produtos
CREATE TABLE IF NOT EXISTS produto_imagens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    produto_id INT NOT NULL,
    url_imagem VARCHAR(500) NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    tipo_imagem ENUM('principal', 'adicional') DEFAULT 'adicional',
    ordem INT DEFAULT 1,
    alt_text VARCHAR(255),
    tamanho_bytes INT DEFAULT 0,
    largura INT DEFAULT 0,
    altura INT DEFAULT 0,
    formato VARCHAR(10) DEFAULT 'jpg',
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Chaves estrangeiras e índices
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    INDEX idx_produto_tipo (produto_id, tipo_imagem),
    INDEX idx_produto_ordem (produto_id, ordem),
    INDEX idx_ativo (ativo),
    
    -- Garantir apenas 1 imagem principal por produto
    UNIQUE KEY unique_principal (produto_id, tipo_imagem, ordem) 
);

-- Migrar dados existentes da coluna 'imagem' para a nova tabela
INSERT INTO produto_imagens (produto_id, url_imagem, nome_arquivo, tipo_imagem, ordem, alt_text, ativo)
SELECT 
    id as produto_id,
    imagem as url_imagem,
    CONCAT('produto_', id, '_principal.jpg') as nome_arquivo,
    'principal' as tipo_imagem,
    1 as ordem,
    CONCAT('Imagem principal de ', nome) as alt_text,
    1 as ativo
FROM produtos 
WHERE imagem IS NOT NULL AND imagem != ''
ON DUPLICATE KEY UPDATE url_imagem = VALUES(url_imagem);

-- Criar índices para performance
CREATE INDEX idx_produto_imagens_busca ON produto_imagens (produto_id, tipo_imagem, ativo, ordem);
CREATE INDEX idx_produto_imagens_formato ON produto_imagens (formato, ativo);

-- Verificar se migration foi aplicada corretamente
SELECT 
    COUNT(*) as total_imagens,
    COUNT(CASE WHEN tipo_imagem = 'principal' THEN 1 END) as principais,
    COUNT(CASE WHEN tipo_imagem = 'adicional' THEN 1 END) as adicionais
FROM produto_imagens;
