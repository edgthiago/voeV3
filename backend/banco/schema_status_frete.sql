-- Schema para sistema de status de pedidos e frete
-- Atualização das tabelas existentes e criação de novas

-- Atualizar tabela de pedidos com novos campos
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS codigo_rastreamento VARCHAR(50) NULL AFTER status_pedido,
ADD COLUMN IF NOT EXISTS observacoes TEXT NULL AFTER codigo_rastreamento,
ADD COLUMN IF NOT EXISTS data_envio TIMESTAMP NULL AFTER observacoes,
ADD COLUMN IF NOT EXISTS data_entrega TIMESTAMP NULL AFTER data_envio,
ADD COLUMN IF NOT EXISTS transportadora VARCHAR(100) DEFAULT 'Correios' AFTER data_entrega;

-- Atualizar ENUM de status com os novos valores
ALTER TABLE pedidos 
MODIFY COLUMN status_pedido ENUM(
    'pendente', 
    'aguardando_pagamento', 
    'pagamento_aprovado', 
    'em_separacao', 
    'enviado', 
    'entregue', 
    'cancelado'
) DEFAULT 'pendente';

-- Tabela para histórico de mudanças de status
CREATE TABLE IF NOT EXISTS historico_status_pedidos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id VARCHAR(50) NOT NULL,
    status_anterior VARCHAR(50) NULL,
    status_novo VARCHAR(50) NOT NULL,
    usuario_id INT NULL,
    observacoes TEXT NULL,
    data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_pedido (pedido_id),
    INDEX idx_status_novo (status_novo),
    INDEX idx_data (data_alteracao),
    
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Atualizar tabela de produtos com campos para frete
ALTER TABLE produtos 
ADD COLUMN IF NOT EXISTS peso DECIMAL(8,3) DEFAULT 0.800 AFTER preco,
ADD COLUMN IF NOT EXISTS comprimento DECIMAL(8,2) DEFAULT 35.00 AFTER peso,
ADD COLUMN IF NOT EXISTS altura DECIMAL(8,2) DEFAULT 15.00 AFTER comprimento,
ADD COLUMN IF NOT EXISTS largura DECIMAL(8,2) DEFAULT 25.00 AFTER altura,
ADD COLUMN IF NOT EXISTS estoque_disponivel INT DEFAULT 0 AFTER largura,
ADD COLUMN IF NOT EXISTS estoque_reservado INT DEFAULT 0 AFTER estoque_disponivel;

-- Tabela para configurações de frete
CREATE TABLE IF NOT EXISTS configuracoes_frete (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    descricao TEXT,
    tipo ENUM('texto', 'numero', 'boolean') DEFAULT 'texto',
    ativo BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir configurações padrão de frete
INSERT INTO configuracoes_frete (nome, valor, descricao, tipo) VALUES
('cep_origem', '01310-100', 'CEP de origem para cálculo de frete', 'texto'),
('frete_gratis_valor', '199.90', 'Valor mínimo para frete grátis', 'numero'),
('peso_minimo', '0.300', 'Peso mínimo para cálculo (kg)', 'numero'),
('altura_minima', '2.00', 'Altura mínima para cálculo (cm)', 'numero'),
('largura_minima', '11.00', 'Largura mínima para cálculo (cm)', 'numero'),
('comprimento_minimo', '16.00', 'Comprimento mínimo para cálculo (cm)', 'numero'),
('pac_ativo', 'true', 'PAC habilitado', 'boolean'),
('sedex_ativo', 'true', 'SEDEX habilitado', 'boolean'),
('taxa_manuseio', '5.00', 'Taxa adicional de manuseio', 'numero'),
('prazo_adicional', '2', 'Dias adicionais no prazo', 'numero')
ON DUPLICATE KEY UPDATE valor = VALUES(valor);

-- Tabela para rastreamento de objetos
CREATE TABLE IF NOT EXISTS rastreamento_objetos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id VARCHAR(50) NOT NULL,
    codigo_rastreamento VARCHAR(50) NOT NULL UNIQUE,
    servico VARCHAR(50) DEFAULT 'PAC',
    status_atual VARCHAR(100),
    ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    eventos JSON,
    
    INDEX idx_pedido (pedido_id),
    INDEX idx_codigo (codigo_rastreamento),
    INDEX idx_status (status_atual),
    
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
);

-- Tabela para cache de consultas de frete
CREATE TABLE IF NOT EXISTS cache_frete (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cep_origem VARCHAR(10) NOT NULL,
    cep_destino VARCHAR(10) NOT NULL,
    peso DECIMAL(8,3) NOT NULL,
    servico VARCHAR(50) NOT NULL,
    valor DECIMAL(8,2) NOT NULL,
    prazo VARCHAR(50) NOT NULL,
    valido_ate TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_consulta (cep_origem, cep_destino, peso, servico),
    INDEX idx_validade (valido_ate),
    INDEX idx_cep_destino (cep_destino)
);

-- View para relatório de status de pedidos
CREATE OR REPLACE VIEW view_status_pedidos AS
SELECT 
    p.id as pedido_id,
    p.status_pedido,
    p.valor_total,
    p.data_pedido,
    p.codigo_rastreamento,
    p.observacoes,
    u.nome as cliente_nome,
    u.email as cliente_email,
    u.telefone as cliente_telefone,
    COUNT(ip.id) as total_itens,
    CASE 
        WHEN p.status_pedido = 'pendente' THEN 'Aguardando processamento'
        WHEN p.status_pedido = 'aguardando_pagamento' THEN 'Aguardando pagamento'
        WHEN p.status_pedido = 'pagamento_aprovado' THEN 'Pagamento confirmado'
        WHEN p.status_pedido = 'em_separacao' THEN 'Separando produtos'
        WHEN p.status_pedido = 'enviado' THEN 'Enviado para entrega'
        WHEN p.status_pedido = 'entregue' THEN 'Entregue'
        WHEN p.status_pedido = 'cancelado' THEN 'Cancelado'
        ELSE p.status_pedido
    END as status_descricao,
    CASE 
        WHEN p.status_pedido IN ('pendente', 'aguardando_pagamento') THEN '#ffc107'
        WHEN p.status_pedido = 'pagamento_aprovado' THEN '#28a745'
        WHEN p.status_pedido = 'em_separacao' THEN '#17a2b8'
        WHEN p.status_pedido = 'enviado' THEN '#6f42c1'
        WHEN p.status_pedido = 'entregue' THEN '#20c997'
        WHEN p.status_pedido = 'cancelado' THEN '#dc3545'
        ELSE '#6c757d'
    END as status_cor
FROM pedidos p
JOIN usuarios u ON p.usuario_id = u.id
LEFT JOIN itens_pedido ip ON p.id = ip.pedido_id
GROUP BY p.id;

-- Procedure para atualizar status automaticamente
DELIMITER //
CREATE OR REPLACE PROCEDURE AtualizarStatusAutomatico()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE pedido_id VARCHAR(50);
    DECLARE status_atual VARCHAR(50);
    DECLARE data_pedido TIMESTAMP;
    
    DECLARE cur CURSOR FOR 
        SELECT id, status_pedido, data_pedido 
        FROM pedidos 
        WHERE status_pedido IN ('aguardando_pagamento', 'em_separacao');
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO pedido_id, status_atual, data_pedido;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Cancelar pedidos aguardando pagamento por mais de 24 horas
        IF status_atual = 'aguardando_pagamento' 
           AND data_pedido < DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN
            
            UPDATE pedidos 
            SET status_pedido = 'cancelado', 
                observacoes = 'Cancelado automaticamente - pagamento não efetuado em 24h',
                updated_at = NOW()
            WHERE id = pedido_id;
            
            INSERT INTO historico_status_pedidos 
            (pedido_id, status_anterior, status_novo, observacoes, data_alteracao)
            VALUES (pedido_id, status_atual, 'cancelado', 
                   'Cancelamento automático por timeout de pagamento', NOW());
        END IF;
        
    END LOOP;
    
    CLOSE cur;
END //
DELIMITER ;

-- Trigger para criar entrada no histórico automaticamente
DELIMITER //
CREATE OR REPLACE TRIGGER trigger_historico_status
    AFTER UPDATE ON pedidos
    FOR EACH ROW
BEGIN
    IF OLD.status_pedido != NEW.status_pedido THEN
        INSERT INTO historico_status_pedidos 
        (pedido_id, status_anterior, status_novo, observacoes, data_alteracao)
        VALUES (NEW.id, OLD.status_pedido, NEW.status_pedido, 
               'Alteração automática via trigger', NOW());
    END IF;
END //
DELIMITER ;

-- Função para calcular prazo de entrega
DELIMITER //
CREATE OR REPLACE FUNCTION CalcularPrazoEntrega(cep_destino VARCHAR(10), servico VARCHAR(50))
RETURNS VARCHAR(50)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE prazo VARCHAR(50);
    DECLARE zona VARCHAR(20);
    
    -- Determinar zona baseada no CEP
    SET zona = CASE 
        WHEN CAST(REPLACE(cep_destino, '-', '') AS UNSIGNED) BETWEEN 1000000 AND 19999999 THEN 'sudeste_proximo'
        WHEN CAST(REPLACE(cep_destino, '-', '') AS UNSIGNED) BETWEEN 20000000 AND 39999999 THEN 'sudeste'
        WHEN CAST(REPLACE(cep_destino, '-', '') AS UNSIGNED) BETWEEN 80000000 AND 99999999 THEN 'sul'
        WHEN CAST(REPLACE(cep_destino, '-', '') AS UNSIGNED) BETWEEN 40000000 AND 65999999 THEN 'nordeste'
        ELSE 'distante'
    END;
    
    -- Calcular prazo baseado na zona e serviço
    SET prazo = CASE 
        WHEN servico = 'PAC' THEN
            CASE zona
                WHEN 'sudeste_proximo' THEN '2-3 dias úteis'
                WHEN 'sudeste' THEN '3-4 dias úteis'
                WHEN 'sul' THEN '4-6 dias úteis'
                WHEN 'nordeste' THEN '5-8 dias úteis'
                ELSE '6-10 dias úteis'
            END
        WHEN servico = 'SEDEX' THEN
            CASE zona
                WHEN 'sudeste_proximo' THEN '1 dia útil'
                WHEN 'sudeste' THEN '1-2 dias úteis'
                WHEN 'sul' THEN '2-3 dias úteis'
                WHEN 'nordeste' THEN '3-4 dias úteis'
                ELSE '4-5 dias úteis'
            END
        ELSE '5-10 dias úteis'
    END;
    
    RETURN prazo;
END //
DELIMITER ;

-- Índices adicionais para performance
CREATE INDEX IF NOT EXISTS idx_pedidos_status_data ON pedidos(status_pedido, data_pedido);
CREATE INDEX IF NOT EXISTS idx_produtos_estoque ON produtos(estoque_disponivel, estoque_reservado);
CREATE INDEX IF NOT EXISTS idx_historico_data ON historico_status_pedidos(data_alteracao);

-- Atualizar alguns produtos com dados de exemplo
UPDATE produtos 
SET peso = CASE 
    WHEN nome LIKE '%Air%' OR nome LIKE '%Running%' THEN 0.650
    WHEN nome LIKE '%Boot%' OR nome LIKE '%Coturno%' THEN 1.200
    WHEN nome LIKE '%Social%' THEN 0.900
    ELSE 0.800
END,
comprimento = CASE 
    WHEN nome LIKE '%Boot%' OR nome LIKE '%Coturno%' THEN 38.0
    WHEN nome LIKE '%Social%' THEN 32.0
    ELSE 35.0
END,
altura = CASE 
    WHEN nome LIKE '%Boot%' OR nome LIKE '%Coturno%' THEN 20.0
    WHEN nome LIKE '%Social%' THEN 12.0
    ELSE 15.0
END,
largura = CASE 
    WHEN nome LIKE '%Boot%' OR nome LIKE '%Coturno%' THEN 28.0
    WHEN nome LIKE '%Social%' THEN 22.0
    ELSE 25.0
END,
estoque_disponivel = CASE 
    WHEN disponivel = 1 THEN 
        CASE 
            WHEN RAND() > 0.7 THEN FLOOR(RAND() * 50) + 10
            WHEN RAND() > 0.4 THEN FLOOR(RAND() * 20) + 5
            ELSE FLOOR(RAND() * 10) + 1
        END
    ELSE 0
END
WHERE peso IS NULL OR peso = 0;
