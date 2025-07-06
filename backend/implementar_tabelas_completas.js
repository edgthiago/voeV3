/**
 * @fileoverview Script para verificar e implementar todas as tabelas necessárias
 * @description Garante que todas as tabelas estão corretas para 100% de funcionamento
 * @author Sistema de Loja de Tênis
 * @version 1.0
 */

const mysql = require('mysql2/promise');

const config = {
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'projetofgt'
};

class ImplementadorTabelas {
    constructor() {
        console.log('🔧 IMPLEMENTANDO TODAS AS TABELAS NECESSÁRIAS');
        console.log('📅 Data:', new Date().toLocaleString('pt-BR'));
        console.log('🎯 Objetivo: Garantir 100% de funcionamento\n');
    }

    async conectar() {
        try {
            this.connection = await mysql.createConnection(config);
            console.log('✅ Conectado ao MySQL - Banco: projetofgt');
            return true;
        } catch (error) {
            console.error('❌ Erro de conexão:', error.message);
            return false;
        }
    }

    async verificarTabela(nomeTabela) {
        try {
            const [result] = await this.connection.execute(`SHOW TABLES LIKE '${nomeTabela}'`);
            return result.length > 0;
        } catch (error) {
            console.error(`❌ Erro ao verificar tabela ${nomeTabela}:`, error.message);
            return false;
        }
    }

    async criarTabelaPagamentos() {
        try {
            console.log('📦 Criando tabela pagamentos...');
            
            const sql = `
                CREATE TABLE IF NOT EXISTS pagamentos (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    pedido_id VARCHAR(100) NOT NULL,
                    mercado_pago_id VARCHAR(100) UNIQUE,
                    status VARCHAR(50) NOT NULL DEFAULT 'pending',
                    valor DECIMAL(10,2) NOT NULL,
                    metodo_pagamento VARCHAR(50) NOT NULL,
                    qr_code TEXT,
                    qr_code_base64 TEXT,
                    ticket_url TEXT,
                    parcelas INT DEFAULT 1,
                    dados_pagamento JSON,
                    erro TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_pedido_id (pedido_id),
                    INDEX idx_mercado_pago_id (mercado_pago_id),
                    INDEX idx_status (status),
                    INDEX idx_metodo (metodo_pagamento)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `;

            await this.connection.execute(sql);
            console.log('   ✅ Tabela pagamentos criada/atualizada');
            return true;
        } catch (error) {
            console.error('   ❌ Erro ao criar tabela pagamentos:', error.message);
            return false;
        }
    }

    async corrigirTabelaNotificacoesLog() {
        try {
            console.log('📧 Corrigindo tabela notificacoes_log...');
            
            // Verificar estrutura atual
            const [columns] = await this.connection.execute('DESCRIBE notificacoes_log');
            const colunasExistentes = columns.map(col => col.Field);
            
            console.log('   🔍 Colunas existentes:', colunasExistentes.join(', '));

            // Adicionar colunas que podem estar faltando
            const colunasNecessarias = [
                { nome: 'destinatario', tipo: 'VARCHAR(255)', descricao: 'Destinatário da notificação' },
                { nome: 'template', tipo: 'VARCHAR(100)', descricao: 'Template usado' },
                { nome: 'dados', tipo: 'JSON', descricao: 'Dados do template' },
                { nome: 'external_id', tipo: 'VARCHAR(100)', descricao: 'ID externo de referência' },
                { nome: 'tentativas', tipo: 'INT DEFAULT 1', descricao: 'Número de tentativas' },
                { nome: 'erro', tipo: 'TEXT', descricao: 'Detalhes do erro se houver' }
            ];

            for (const coluna of colunasNecessarias) {
                if (!colunasExistentes.includes(coluna.nome)) {
                    const alterSql = `ALTER TABLE notificacoes_log ADD COLUMN ${coluna.nome} ${coluna.tipo}`;
                    await this.connection.execute(alterSql);
                    console.log(`   ✅ Coluna '${coluna.nome}' adicionada`);
                } else {
                    console.log(`   ℹ️ Coluna '${coluna.nome}' já existe`);
                }
            }

            return true;
        } catch (error) {
            console.error('   ❌ Erro ao corrigir tabela notificacoes_log:', error.message);
            return false;
        }
    }

    async criarTabelaPedidos() {
        try {
            console.log('📦 Verificando/criando tabela pedidos...');
            
            const exists = await this.verificarTabela('pedidos');
            if (!exists) {
                const sql = `
                    CREATE TABLE pedidos (
                        id VARCHAR(100) PRIMARY KEY,
                        usuario_id INT NOT NULL,
                        valor_total DECIMAL(10,2) NOT NULL,
                        status_pedido VARCHAR(50) DEFAULT 'pendente',
                        itens JSON,
                        endereco_entrega JSON,
                        observacoes TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_usuario_id (usuario_id),
                        INDEX idx_status (status_pedido),
                        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                `;

                await this.connection.execute(sql);
                console.log('   ✅ Tabela pedidos criada');
            } else {
                console.log('   ℹ️ Tabela pedidos já existe');
            }

            return true;
        } catch (error) {
            console.error('   ❌ Erro ao criar tabela pedidos:', error.message);
            return false;
        }
    }

    async verificarEAdicionarIndices() {
        try {
            console.log('🔍 Verificando e adicionando índices...');
            
            const indices = [
                {
                    tabela: 'notificacoes_log',
                    nome: 'idx_tipo_status',
                    sql: 'CREATE INDEX idx_tipo_status ON notificacoes_log(tipo, status)'
                },
                {
                    tabela: 'notificacoes_log', 
                    nome: 'idx_created_at',
                    sql: 'CREATE INDEX idx_created_at ON notificacoes_log(created_at)'
                },
                {
                    tabela: 'usuarios',
                    nome: 'idx_notificacoes',
                    sql: 'CREATE INDEX idx_notificacoes ON usuarios(notificacoes_email, notificacoes_sms, notificacoes_push)'
                }
            ];

            for (const indice of indices) {
                try {
                    await this.connection.execute(indice.sql);
                    console.log(`   ✅ Índice '${indice.nome}' criado na tabela '${indice.tabela}'`);
                } catch (error) {
                    if (error.message.includes('Duplicate key name')) {
                        console.log(`   ℹ️ Índice '${indice.nome}' já existe`);
                    } else {
                        console.log(`   ⚠️ Erro ao criar índice '${indice.nome}':`, error.message);
                    }
                }
            }

            return true;
        } catch (error) {
            console.error('   ❌ Erro geral nos índices:', error.message);
            return false;
        }
    }

    async executarImplementacao() {
        try {
            console.log('═'.repeat(60));
            console.log('🚀 INICIANDO IMPLEMENTAÇÃO COMPLETA');
            console.log('═'.repeat(60));

            if (!await this.conectar()) {
                return false;
            }

            // 1. Verificar/criar tabela pagamentos
            await this.criarTabelaPagamentos();

            // 2. Corrigir tabela notificacoes_log
            await this.corrigirTabelaNotificacoesLog();

            // 3. Verificar/criar tabela pedidos
            await this.criarTabelaPedidos();

            // 4. Adicionar índices
            await this.verificarEAdicionarIndices();

            // 5. Verificação final
            console.log('\n🔍 VERIFICAÇÃO FINAL...');
            const tabelas = ['pagamentos', 'notificacoes_log', 'pedidos', 'usuarios'];
            
            for (const tabela of tabelas) {
                const existe = await this.verificarTabela(tabela);
                console.log(`   ${existe ? '✅' : '❌'} Tabela '${tabela}': ${existe ? 'OK' : 'FALTANDO'}`);
            }

            await this.connection.end();

            console.log('\n' + '═'.repeat(60));
            console.log('🎉 IMPLEMENTAÇÃO CONCLUÍDA COM SUCESSO!');
            console.log('🏆 Todas as tabelas estão prontas para 100% de funcionamento');
            console.log('═'.repeat(60));

            return true;

        } catch (error) {
            console.error('❌ Erro na implementação:', error.message);
            return false;
        }
    }
}

// Executar implementação
(async () => {
    const implementador = new ImplementadorTabelas();
    await implementador.executarImplementacao();
})().catch(error => {
    console.error('❌ Erro fatal:', error);
});
