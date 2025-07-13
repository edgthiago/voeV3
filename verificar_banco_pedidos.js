// Script para verificar estrutura do banco e inserir dados de teste

const mysql = require('mysql2/promise');
require('dotenv').config();

async function verificarEstruturaBanco() {
    let connection;
    
    try {
        // Conectar ao banco
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'papelaria'
        });
        
        console.log('✅ Conectado ao banco de dados');
        
        // Verificar tabela pedidos
        console.log('\n📋 Estrutura da tabela pedidos:');
        const [pedidosStruct] = await connection.execute('DESCRIBE pedidos');
        console.table(pedidosStruct);
        
        // Verificar se existem pedidos
        const [pedidosExistentes] = await connection.execute('SELECT COUNT(*) as total FROM pedidos');
        console.log(`\n📦 Pedidos existentes: ${pedidosExistentes[0].total}`);
        
        // Se não há pedidos, inserir dados de teste
        if (pedidosExistentes[0].total === 0) {
            console.log('\n🔧 Inserindo dados de teste...');
            await inserirDadosTeste(connection);
        } else {
            console.log('\n📋 Pedidos existentes:');
            const [pedidos] = await connection.execute(`
                SELECT id, usuario_id, status_pedido, valor_total, data_pedido 
                FROM pedidos 
                ORDER BY data_pedido DESC 
                LIMIT 5
            `);
            console.table(pedidos);
        }
        
    } catch (error) {
        console.error('❌ Erro ao verificar estrutura do banco:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

async function inserirDadosTeste(connection) {
    try {
        // Verificar se o usuário ID 6 existe
        const [usuarios] = await connection.execute('SELECT id, nome FROM usuarios WHERE id = 6');
        
        if (usuarios.length === 0) {
            console.log('⚠️ Usuário ID 6 não encontrado. Usando ID do primeiro usuário disponível...');
            const [primeiroUsuario] = await connection.execute('SELECT id FROM usuarios LIMIT 1');
            if (primeiroUsuario.length === 0) {
                console.log('❌ Nenhum usuário encontrado no banco!');
                return;
            }
            usuarioId = primeiroUsuario[0].id;
        } else {
            usuarioId = 6;
        }
        
        console.log(`👤 Inserindo pedidos para usuário ID: ${usuarioId}`);
        
        // Inserir pedidos de teste
        const pedidos = [
            {
                id: 'PED-001-TESTE',
                usuario_id: usuarioId,
                status_pedido: 'pendente',
                valor_total: 150.50,
                metodo_pagamento: 'cartao_credito',
                endereco_entrega: 'Rua das Flores, 123 - Centro - São Paulo/SP - CEP: 01234-567',
                observacoes: 'Pedido de teste - Cadernos e canetas'
            },
            {
                id: 'PED-002-TESTE',
                usuario_id: usuarioId,
                status_pedido: 'processando',
                valor_total: 89.90,
                metodo_pagamento: 'pix',
                endereco_entrega: 'Avenida Principal, 456 - Jardim America - São Paulo/SP - CEP: 01234-890',
                observacoes: 'Material escolar básico'
            },
            {
                id: 'PED-003-TESTE',
                usuario_id: usuarioId,
                status_pedido: 'pendente',
                valor_total: 299.99,
                metodo_pagamento: 'cartao_debito',
                endereco_entrega: 'Rua do Comércio, 789 - Vila Nova - São Paulo/SP - CEP: 01234-123',
                observacoes: 'Kit completo de escritório'
            }
        ];
        
        for (const pedido of pedidos) {
            await connection.execute(`
                INSERT INTO pedidos (
                    id, usuario_id, status_pedido, valor_total, 
                    metodo_pagamento, endereco_entrega, observacoes, data_pedido
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            `, [
                pedido.id,
                pedido.usuario_id,
                pedido.status_pedido,
                pedido.valor_total,
                pedido.metodo_pagamento,
                pedido.endereco_entrega,
                pedido.observacoes
            ]);
            
            console.log(`✅ Pedido ${pedido.id} inserido com sucesso`);
        }
        
        console.log('\n🎉 Dados de teste inseridos com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao inserir dados de teste:', error);
    }
}

// Executar verificação
verificarEstruturaBanco();
