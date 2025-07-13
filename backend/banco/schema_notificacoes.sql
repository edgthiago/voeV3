-- Schema para sistema de notificações
-- Criado em: Janeiro 2025
-- Versão: 1.0

-- Tabela para logs de notificações
CREATE TABLE IF NOT EXISTS notificacoes_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('email', 'sms', 'push') NOT NULL,
    destinatario VARCHAR(255) NOT NULL,
    template VARCHAR(100) NOT NULL,
    status ENUM('enviado', 'erro', 'pendente') NOT NULL DEFAULT 'pendente',
    dados TEXT,
    external_id VARCHAR(255) NULL,
    erro TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_tipo (tipo),
    INDEX idx_status (status),
    INDEX idx_template (template),
    INDEX idx_created_at (created_at)
);

-- Tabela para configurações de notificação por usuário
CREATE TABLE IF NOT EXISTS usuarios_notificacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    notificacoes_email BOOLEAN DEFAULT TRUE,
    notificacoes_sms BOOLEAN DEFAULT FALSE,
    notificacoes_push BOOLEAN DEFAULT TRUE,
    push_token VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario (usuario_id)
);

-- Adicionar colunas de notificação na tabela usuarios se não existirem
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS notificacoes_email BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS notificacoes_sms BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notificacoes_push BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS push_token VARCHAR(255) NULL;

-- Índices para melhor performance (após criar as colunas)
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_telefone ON usuarios(telefone);
CREATE INDEX idx_usuarios_push_token ON usuarios(push_token);

-- Tabela para templates de notificação personalizados (opcional)
CREATE TABLE IF NOT EXISTS notificacoes_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    tipo ENUM('email', 'sms', 'push') NOT NULL,
    assunto VARCHAR(255) NULL, -- Para email
    conteudo TEXT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_nome (nome),
    INDEX idx_tipo (tipo),
    INDEX idx_ativo (ativo)
);

-- Tabela para fila de notificações (para envio assíncrono)
CREATE TABLE IF NOT EXISTS notificacoes_fila (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo ENUM('email', 'sms', 'push') NOT NULL,
    template VARCHAR(100) NOT NULL,
    dados TEXT NOT NULL,
    prioridade TINYINT DEFAULT 5, -- 1-10 (1 = mais alta)
    tentativas INT DEFAULT 0,
    max_tentativas INT DEFAULT 3,
    status ENUM('pendente', 'processando', 'enviado', 'erro', 'cancelado') DEFAULT 'pendente',
    agendado_para TIMESTAMP NULL,
    erro TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_prioridade (prioridade),
    INDEX idx_agendado_para (agendado_para),
    INDEX idx_created_at (created_at)
);

-- Tabela para logs de eventos do sistema
CREATE TABLE IF NOT EXISTS eventos_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento VARCHAR(100) NOT NULL,
    dados TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_evento (evento),
    INDEX idx_created_at (created_at)
);

-- Inserir templates padrão
INSERT IGNORE INTO notificacoes_templates (nome, tipo, assunto, conteudo) VALUES 
('pedido_criado_email', 'email', 'Pedido Confirmado - Papelaria', 
'<h2>Pedido Confirmado!</h2><p>Seu pedido #{pedido_id} foi confirmado com sucesso!</p>'),

('pedido_criado_sms', 'sms', NULL, 
'Papelaria: Pedido #{pedido_id} confirmado! Valor: R$ {valor_total}'),

('pagamento_aprovado_email', 'email', 'Pagamento Aprovado - Papelaria',
'<h2>Pagamento Aprovado!</h2><p>O pagamento do pedido #{pedido_id} foi aprovado!</p>'),

('pedido_enviado_email', 'email', 'Pedido Enviado - Papelaria',
'<h2>Pedido Enviado!</h2><p>Seu pedido #{pedido_id} foi enviado! Código: {codigo_rastreamento}</p>'),

('pedido_entregue_email', 'email', 'Pedido Entregue - Papelaria',
'<h2>Pedido Entregue!</h2><p>Seu pedido #{pedido_id} foi entregue com sucesso!</p>');

-- View para estatísticas de notificações
CREATE OR REPLACE VIEW v_notificacoes_estatisticas AS
SELECT 
    DATE(created_at) as data,
    tipo,
    template,
    status,
    COUNT(*) as total
FROM notificacoes_log 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at), tipo, template, status
ORDER BY data DESC, tipo, template;
