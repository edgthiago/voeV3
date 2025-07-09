/**
 * @fileoverview Criar tabela de histórico de status de pedidos
 * @description Script para criar a tabela historico_status_pedidos que estava faltando
 * @author Sistema de Loja de Tênis
 * @version 1.0
 */

// Carregar variáveis de ambiente
require('dotenv').config();

const conexao = require('./banco/conexao');

class CriarTabelaHistoricoStatus {
    
    /**
     * Criar tabela de histórico de status
     */
    async criarTabelaHistorico() {
        try {
            console.log('📋 Criando tabela historico_status_pedidos...');
            
            const sqlCriarTabela = `
                CREATE TABLE IF NOT EXISTS historico_status_pedidos (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    pedido_id INT NOT NULL,
                    status_anterior VARCHAR(50),
                    status_novo VARCHAR(50) NOT NULL,
                    usuario_id INT,
                    observacoes TEXT,
                    data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    
                    INDEX idx_pedido_id (pedido_id),
                    INDEX idx_data_alteracao (data_alteracao),
                    INDEX idx_status_novo (status_novo),
                    
                    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            `;
            
            await conexao.executarConsulta(sqlCriarTabela);
            console.log('✅ Tabela historico_status_pedidos criada com sucesso!');
            
            // Criar alguns registros de exemplo para pedidos existentes
            await this.criarRegistrosExemplo();
            
        } catch (error) {
            console.error('❌ Erro ao criar tabela:', error.message);
            throw error;
        }
    }
    
    /**
     * Criar registros de exemplo no histórico
     */
    async criarRegistrosExemplo() {
        try {
            console.log('📝 Criando registros de exemplo...');
            
            // Buscar pedidos existentes
            const pedidos = await conexao.executarConsulta(`
                SELECT id, status_pedido, usuario_id, created_at 
                FROM pedidos 
                ORDER BY created_at DESC 
                LIMIT 10
            `);
            
            if (pedidos.length === 0) {
                console.log('⚠️ Nenhum pedido encontrado para criar histórico');
                return;
            }
            
            console.log(`📦 Criando histórico para ${pedidos.length} pedidos...`);
            
            for (const pedido of pedidos) {
                // Criar registro inicial
                await conexao.executarConsulta(`
                    INSERT INTO historico_status_pedidos 
                    (pedido_id, status_anterior, status_novo, usuario_id, observacoes, data_alteracao)
                    VALUES (?, NULL, ?, ?, 'Pedido criado automaticamente', ?)
                `, [
                    pedido.id,
                    pedido.status_pedido || 'pendente',
                    pedido.usuario_id,
                    pedido.created_at
                ]);
                
                console.log(`✅ Histórico criado para pedido ${pedido.id}`);
            }
            
        } catch (error) {
            console.error('❌ Erro ao criar registros de exemplo:', error.message);
        }
    }
    
    /**
     * Criar pedido de exemplo para testes
     */
    async criarPedidoExemplo() {
        try {
            console.log('🛒 Criando pedido de exemplo para testes...');
            
            // Buscar primeiro usuário
            const usuarios = await conexao.executarConsulta(`
                SELECT id, nome, email FROM usuarios LIMIT 1
            `);
            
            if (usuarios.length === 0) {
                console.log('⚠️ Nenhum usuário encontrado. Criando usuário de exemplo...');
                
                // Criar usuário de exemplo
                await conexao.executarConsulta(`
                    INSERT INTO usuarios (nome, email, senha, telefone, tipo_usuario, created_at)
                    VALUES (?, ?, ?, ?, ?, NOW())
                `, [
                    'Cliente Teste',
                    'teste@exemplo.com',
                    '$2b$10$hash_exemplo', // Hash de senha fictício
                    '(11) 99999-9999',
                    'cliente'
                ]);
                
                const novoUsuario = await conexao.executarConsulta(`
                    SELECT id FROM usuarios WHERE email = 'teste@exemplo.com'
                `);
                
                if (novoUsuario.length === 0) {
                    throw new Error('Falha ao criar usuário de exemplo');
                }
                
                console.log('✅ Usuário de exemplo criado!');
            }
            
            // Buscar usuário novamente
            const usuarioFinal = await conexao.executarConsulta(`
                SELECT id FROM usuarios LIMIT 1
            `);
            
            // Criar pedido de exemplo
            await conexao.executarConsulta(`
                INSERT INTO pedidos (
                    usuario_id, status_pedido, valor_total, 
                    endereco_entrega, observacoes, created_at
                ) VALUES (?, ?, ?, ?, ?, NOW())
            `, [
                usuarioFinal[0].id,
                'pendente',
                159.90,
                'Rua Teste, 123 - São Paulo, SP',
                'Pedido de exemplo para testes do sistema'
            ]);
            
            const novoPedido = await conexao.executarConsulta(`
                SELECT id FROM pedidos ORDER BY id DESC LIMIT 1
            `);
            
            console.log(`✅ Pedido de exemplo criado: #${novoPedido[0].id}`);
            
            // Criar histórico para este pedido
            await conexao.executarConsulta(`
                INSERT INTO historico_status_pedidos 
                (pedido_id, status_anterior, status_novo, usuario_id, observacoes, data_alteracao)
                VALUES (?, NULL, 'pendente', ?, 'Pedido criado para testes', NOW())
            `, [novoPedido[0].id, usuarioFinal[0].id]);
            
            console.log('✅ Histórico do pedido de exemplo criado!');
            
        } catch (error) {
            console.error('❌ Erro ao criar pedido de exemplo:', error.message);
        }
    }
    
    /**
     * Verificar estrutura criada
     */
    async verificarEstrutura() {
        try {
            console.log('🔍 Verificando estrutura criada...');
            
            // Verificar tabela
            const tabela = await conexao.executarConsulta(`
                SHOW TABLES LIKE 'historico_status_pedidos'
            `);
            
            if (tabela.length === 0) {
                throw new Error('Tabela não foi criada');
            }
            
            // Verificar colunas
            const colunas = await conexao.executarConsulta(`
                SHOW COLUMNS FROM historico_status_pedidos
            `);
            
            console.log(`✅ Tabela possui ${colunas.length} colunas:`);
            colunas.forEach(col => {
                console.log(`   - ${col.Field} (${col.Type})`);
            });
            
            // Verificar registros
            const registros = await conexao.executarConsulta(`
                SELECT COUNT(*) as total FROM historico_status_pedidos
            `);
            
            console.log(`✅ Total de registros no histórico: ${registros[0].total}`);
            
            // Verificar pedidos
            const pedidos = await conexao.executarConsulta(`
                SELECT COUNT(*) as total FROM pedidos
            `);
            
            console.log(`✅ Total de pedidos: ${pedidos[0].total}`);
            
        } catch (error) {
            console.error('❌ Erro na verificação:', error.message);
            throw error;
        }
    }
    
    /**
     * Executar todas as operações
     */
    async executar() {
        console.log('🚀 ===== CRIANDO ESTRUTURA DE HISTÓRICO DE STATUS =====');
        console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
        
        try {
            await this.criarTabelaHistorico();
            await this.criarPedidoExemplo();
            await this.verificarEstrutura();
            
            console.log('\n🎉 ESTRUTURA CRIADA COM SUCESSO!');
            console.log('✅ Tabela historico_status_pedidos operacional');
            console.log('✅ Dados de exemplo inseridos');
            console.log('✅ Sistema pronto para testes');
            
        } catch (error) {
            console.error('\n❌ ERRO FATAL:', error.message);
            throw error;
        }
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    const criador = new CriarTabelaHistoricoStatus();
    
    criador.executar()
        .then(() => {
            console.log('\n🏁 Processo concluído com sucesso!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Processo falhou:', error);
            process.exit(1);
        });
}

module.exports = CriarTabelaHistoricoStatus;
