/**
 * Script para criar tabelas de notificações
 */

require('dotenv').config();
const conexao = require('./banco/conexao');

async function criarTabelasNotificacoes() {
    try {
        console.log('📋 Criando tabelas de notificações...\n');
        
        // 1. Tabela de logs de notificações
        console.log('⏳ Criando tabela notificacoes_log...');
        await conexao.executarConsulta(`
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
            )
        `);
        console.log('✅ notificacoes_log criada');
        
        // 2. Tabela de configurações por usuário
        console.log('⏳ Criando tabela usuarios_notificacoes...');
        await conexao.executarConsulta(`
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
            )
        `);
        console.log('✅ usuarios_notificacoes criada');
        
        // 3. Tabela de templates
        console.log('⏳ Criando tabela notificacoes_templates...');
        await conexao.executarConsulta(`
            CREATE TABLE IF NOT EXISTS notificacoes_templates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(100) NOT NULL UNIQUE,
                tipo ENUM('email', 'sms', 'push') NOT NULL,
                assunto VARCHAR(255) NULL,
                conteudo TEXT NOT NULL,
                ativo BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                INDEX idx_nome (nome),
                INDEX idx_tipo (tipo),
                INDEX idx_ativo (ativo)
            )
        `);
        console.log('✅ notificacoes_templates criada');
        
        // 4. Tabela de fila
        console.log('⏳ Criando tabela notificacoes_fila...');
        await conexao.executarConsulta(`
            CREATE TABLE IF NOT EXISTS notificacoes_fila (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL,
                tipo ENUM('email', 'sms', 'push') NOT NULL,
                template VARCHAR(100) NOT NULL,
                dados TEXT NOT NULL,
                prioridade TINYINT DEFAULT 5,
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
            )
        `);
        console.log('✅ notificacoes_fila criada');
        
        // 5. Tabela de logs de eventos
        console.log('⏳ Criando tabela eventos_log...');
        await conexao.executarConsulta(`
            CREATE TABLE IF NOT EXISTS eventos_log (
                id INT AUTO_INCREMENT PRIMARY KEY,
                evento VARCHAR(100) NOT NULL,
                dados TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                INDEX idx_evento (evento),
                INDEX idx_created_at (created_at)
            )
        `);
        console.log('✅ eventos_log criada');
        
        // 6. Inserir templates padrão
        console.log('⏳ Inserindo templates padrão...');
        await conexao.executarConsulta(`
            INSERT IGNORE INTO notificacoes_templates (nome, tipo, assunto, conteudo) VALUES 
            ('pedido_criado_email', 'email', 'Pedido Confirmado - Loja de Tênis', 
            '<h2>Pedido Confirmado!</h2><p>Seu pedido #{pedido_id} foi confirmado com sucesso!</p>'),
            
            ('pedido_criado_sms', 'sms', NULL, 
            'Loja de Tênis: Pedido #{pedido_id} confirmado! Valor: R$ {valor_total}'),
            
            ('pagamento_aprovado_email', 'email', 'Pagamento Aprovado - Loja de Tênis',
            '<h2>Pagamento Aprovado!</h2><p>O pagamento do pedido #{pedido_id} foi aprovado!</p>'),
            
            ('pedido_enviado_email', 'email', 'Pedido Enviado - Loja de Tênis',
            '<h2>Pedido Enviado!</h2><p>Seu pedido #{pedido_id} foi enviado! Código: {codigo_rastreamento}</p>'),
            
            ('pedido_entregue_email', 'email', 'Pedido Entregue - Loja de Tênis',
            '<h2>Pedido Entregue!</h2><p>Seu pedido #{pedido_id} foi entregue com sucesso!</p>')
        `);
        console.log('✅ Templates inseridos');
        
        // 7. Criar view de estatísticas
        console.log('⏳ Criando view de estatísticas...');
        await conexao.executarConsulta(`
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
            ORDER BY data DESC, tipo, template
        `);
        console.log('✅ View criada');
        
        console.log('\n🎉 Sistema de notificações criado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

criarTabelasNotificacoes();
