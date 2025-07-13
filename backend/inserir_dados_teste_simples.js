// Script para inserir dados de teste - versão simplificada
// Executar dentro do diretório backend: node inserir_dados_teste_simples.js

require('dotenv').config();
const conexao = require('./banco/conexao');

async function inserirPedidosTeste() {
    try {
        console.log('🧪 Inserindo pedidos de teste no banco...\n');
        
        // Verificar se há usuários
        const usuarios = await conexao.executarConsulta('SELECT id, nome FROM usuarios LIMIT 5');
        console.log('👤 Usuários disponíveis:', usuarios.length);
        
        if (usuarios.length === 0) {
            console.log('❌ Nenhum usuário encontrado! Impossível criar pedidos.');
            return;
        }
        
        const usuarioId = usuarios[0].id; // Usar o primeiro usuário
        console.log(`📋 Criando pedidos para usuário: ${usuarios[0].nome} (ID: ${usuarioId})\n`);
        
        // Verificar se já existem pedidos
        const pedidosExistentes = await conexao.executarConsulta('SELECT COUNT(*) as total FROM pedidos');
        console.log(`📦 Pedidos existentes: ${pedidosExistentes[0].total}`);
        
        // Pedidos de teste
        const timestamp = Date.now();
        const pedidosTeste = [
            {
                usuario_id: usuarioId,
                status_pedido: 'pendente',
                valor_total: 150.50,
                forma_pagamento: 'cartao_credito',
                observacoes: 'Pedido de teste - Material escolar básico'
            },
            {
                usuario_id: usuarioId,
                status_pedido: 'processando',
                valor_total: 89.90,
                forma_pagamento: 'pix',
                observacoes: 'Kit de escritório'
            },
            {
                usuario_id: usuarioId,
                status_pedido: 'pendente',
                valor_total: 299.99,
                forma_pagamento: 'cartao_debito',
                observacoes: 'Material premium para escritório'
            }
        ];
        
        // Inserir cada pedido
        for (const pedido of pedidosTeste) {
            try {
                await conexao.executarConsulta(`
                    INSERT INTO pedidos (
                        usuario_id, status_pedido, valor_total, 
                        forma_pagamento, observacoes, data_pedido
                    ) VALUES (?, ?, ?, ?, ?, NOW())
                `, [
                    pedido.usuario_id,
                    pedido.status_pedido,
                    pedido.valor_total,
                    pedido.forma_pagamento,
                    pedido.observacoes
                ]);
                
                console.log(`✅ Pedido inserido (${pedido.status_pedido} - R$ ${pedido.valor_total} - ${pedido.forma_pagamento})`);
            } catch (error) {
                console.error(`❌ Erro ao inserir pedido:`, error.message);
            }
        }
        
        // Verificar pedidos inseridos
        console.log('\n📋 Verificando pedidos inseridos...');
        const pedidosInseridos = await conexao.executarConsulta(`
            SELECT id, status_pedido, valor_total, forma_pagamento, DATE_FORMAT(data_pedido, '%Y-%m-%d %H:%i') as data_formatada
            FROM pedidos 
            WHERE usuario_id = ? 
            ORDER BY data_pedido DESC
            LIMIT 10
        `, [usuarioId]);
        
        console.log(`\n✅ Total de pedidos para o usuário: ${pedidosInseridos.length}`);
        pedidosInseridos.forEach(pedido => {
            console.log(`- ID ${pedido.id}: ${pedido.status_pedido} - R$ ${pedido.valor_total} - ${pedido.forma_pagamento} (${pedido.data_formatada})`);
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
