// Script para inserir dados de teste usando a conexão existente do backend

const path = require('path');
const dotenv = require('dotenv');

// Configurar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

// Importar a conexão do backend
const conexao = require('./backend/banco/conexao');

async function inserirPedidosTeste() {
    try {
        console.log('🧪 Inserindo pedidos de teste no banco...\n');
        
        // Verificar se há usuários
        const usuarios = await conexao.executarConsulta('SELECT id, nome FROM usuarios LIMIT 5');
        console.log('👤 Usuários disponíveis:', usuarios);
        
        if (usuarios.length === 0) {
            console.log('❌ Nenhum usuário encontrado! Impossível criar pedidos.');
            return;
        }
        
        const usuarioId = usuarios[0].id; // Usar o primeiro usuário
        console.log(`📋 Criando pedidos para usuário: ${usuarios[0].nome} (ID: ${usuarioId})\n`);
        
        // Pedidos de teste
        const pedidosTeste = [
            {
                id: `PED-${Date.now()}-001`,
                usuario_id: usuarioId,
                status_pedido: 'pendente',
                valor_total: 150.50,
                metodo_pagamento: 'cartao_credito',
                endereco_entrega: 'Rua das Flores, 123 - Centro - São Paulo/SP - CEP: 01234-567',
                observacoes: 'Pedido de teste - Material escolar básico'
            },
            {
                id: `PED-${Date.now()}-002`,
                usuario_id: usuarioId,
                status_pedido: 'processando',
                valor_total: 89.90,
                metodo_pagamento: 'pix',
                endereco_entrega: 'Avenida Principal, 456 - Jardim America - São Paulo/SP - CEP: 01234-890',
                observacoes: 'Kit de escritório'
            },
            {
                id: `PED-${Date.now()}-003`,
                usuario_id: usuarioId,
                status_pedido: 'pendente',
                valor_total: 299.99,
                metodo_pagamento: 'cartao_debito',
                endereco_entrega: 'Rua do Comércio, 789 - Vila Nova - São Paulo/SP - CEP: 01234-123',
                observacoes: 'Material premium para escritório'
            }
        ];
        
        // Inserir cada pedido
        for (const pedido of pedidosTeste) {
            try {
                await conexao.executarConsulta(`
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
                
                console.log(`✅ Pedido ${pedido.id} inserido com sucesso (${pedido.status_pedido} - R$ ${pedido.valor_total})`);
            } catch (error) {
                console.error(`❌ Erro ao inserir pedido ${pedido.id}:`, error.message);
            }
        }
        
        // Verificar pedidos inseridos
        console.log('\n📋 Verificando pedidos inseridos...');
        const pedidosInseridos = await conexao.executarConsulta(`
            SELECT id, status_pedido, valor_total, data_pedido 
            FROM pedidos 
            WHERE usuario_id = ? 
            ORDER BY data_pedido DESC
        `, [usuarioId]);
        
        console.log(`\n✅ Total de pedidos para o usuário: ${pedidosInseridos.length}`);
        pedidosInseridos.forEach(pedido => {
            console.log(`- ${pedido.id}: ${pedido.status_pedido} - R$ ${pedido.valor_total} (${pedido.data_pedido})`);
        });
        
        console.log('\n🎉 Dados de teste inseridos com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao inserir dados de teste:', error);
    } finally {
        process.exit(0);
    }
}

// Executar
inserirPedidosTeste();
