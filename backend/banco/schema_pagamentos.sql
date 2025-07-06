-- Tabela para armazenar dados dos pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id VARCHAR(50) NOT NULL,
    mercado_pago_id VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    valor DECIMAL(10,2) NOT NULL,
    metodo_pagamento VARCHAR(50) NOT NULL,
    parcelas INT DEFAULT 1,
    
    -- Dados específicos do PIX
    qr_code TEXT NULL,
    qr_code_base64 LONGTEXT NULL,
    ticket_url TEXT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_pedido (pedido_id),
    INDEX idx_mercado_pago (mercado_pago_id),
    INDEX idx_status (status),
    INDEX idx_metodo (metodo_pagamento),
    
    -- Chave estrangeira
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
);

-- Atualizar tabela de pedidos para incluir método de pagamento
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS metodo_pagamento VARCHAR(50) NULL AFTER status_pedido,
ADD COLUMN IF NOT EXISTS valor_frete DECIMAL(8,2) DEFAULT 0.00 AFTER valor_total,
ADD COLUMN IF NOT EXISTS endereco_entrega JSON NULL AFTER metodo_pagamento;

-- Adicionar novos status de pedido se não existirem
ALTER TABLE pedidos 
MODIFY COLUMN status_pedido ENUM(
    'pendente', 
    'aguardando_pagamento', 
    'pagamento_aprovado', 
    'confirmado', 
    'em_separacao', 
    'enviado', 
    'entregue', 
    'cancelado'
) DEFAULT 'pendente';

-- Tabela para logs de transações
CREATE TABLE IF NOT EXISTS logs_pagamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pagamento_id INT NOT NULL,
    status_anterior VARCHAR(50),
    status_novo VARCHAR(50) NOT NULL,
    detalhes JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_pagamento (pagamento_id),
    INDEX idx_status (status_novo),
    
    FOREIGN KEY (pagamento_id) REFERENCES pagamentos(id) ON DELETE CASCADE
);

-- Inserir alguns métodos de pagamento padrão (se não existirem)
INSERT IGNORE INTO categorias (nome, slug, descricao) VALUES
('Tênis Casual', 'tenis-casual', 'Tênis para uso casual e dia a dia'),
('Tênis Esportivo', 'tenis-esportivo', 'Tênis para atividades esportivas'),
('Tênis de Corrida', 'tenis-corrida', 'Tênis especializados para corrida'),
('Tênis Social', 'tenis-social', 'Tênis para ocasiões sociais');

-- Verificar se existe a tabela de configurações de pagamento
CREATE TABLE IF NOT EXISTS configuracoes_pagamento (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir configurações padrão de pagamento
INSERT INTO configuracoes_pagamento (nome, valor, descricao) VALUES
('pix_ativo', 'true', 'PIX habilitado como método de pagamento'),
('cartao_ativo', 'true', 'Cartão habilitado como método de pagamento'),
('boleto_ativo', 'false', 'Boleto habilitado como método de pagamento'),
('max_parcelas', '12', 'Número máximo de parcelas no cartão'),
('frete_gratis_valor', '199.90', 'Valor mínimo para frete grátis'),
('taxa_pix', '0', 'Taxa adicional para pagamento PIX (%)'),
('taxa_cartao', '0', 'Taxa adicional para pagamento cartão (%)'),
('prazo_pagamento_pix', '30', 'Prazo em minutos para pagamento PIX')
ON DUPLICATE KEY UPDATE valor = VALUES(valor);

-- View para relatório de pagamentos
CREATE OR REPLACE VIEW view_relatorio_pagamentos AS
SELECT 
    pg.id,
    pg.pedido_id,
    pg.mercado_pago_id,
    pg.status,
    pg.valor,
    pg.metodo_pagamento,
    pg.parcelas,
    pg.created_at as data_pagamento,
    p.usuario_id,
    u.nome as nome_usuario,
    u.email as email_usuario,
    CASE 
        WHEN pg.status = 'approved' THEN 'Aprovado'
        WHEN pg.status = 'pending' THEN 'Pendente'
        WHEN pg.status = 'rejected' THEN 'Rejeitado'
        WHEN pg.status = 'cancelled' THEN 'Cancelado'
        ELSE pg.status
    END as status_descricao
FROM pagamentos pg
JOIN pedidos p ON pg.pedido_id = p.id
JOIN usuarios u ON p.usuario_id = u.id;

-- Procedure para calcular estatísticas de pagamento
DELIMITER //
CREATE OR REPLACE PROCEDURE ObterEstatisticasPagamentos()
BEGIN
    SELECT 
        COUNT(*) as total_pagamentos,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as pagamentos_aprovados,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pagamentos_pendentes,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as pagamentos_rejeitados,
        SUM(CASE WHEN status = 'approved' THEN valor ELSE 0 END) as valor_total_aprovado,
        AVG(CASE WHEN status = 'approved' THEN valor ELSE 0 END) as ticket_medio,
        COUNT(CASE WHEN metodo_pagamento = 'pix' THEN 1 END) as pagamentos_pix,
        COUNT(CASE WHEN metodo_pagamento LIKE 'cartao_%' THEN 1 END) as pagamentos_cartao,
        DATE(created_at) as data
    FROM pagamentos
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY DATE(created_at)
    ORDER BY data DESC;
END //
DELIMITER ;

-- Trigger para log de mudanças de status
DELIMITER //
CREATE OR REPLACE TRIGGER trigger_log_status_pagamento
    AFTER UPDATE ON pagamentos
    FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO logs_pagamentos (pagamento_id, status_anterior, status_novo, detalhes)
        VALUES (NEW.id, OLD.status, NEW.status, JSON_OBJECT(
            'updated_at', NOW(),
            'valor', NEW.valor,
            'metodo', NEW.metodo_pagamento
        ));
    END IF;
END //
DELIMITER ;
