// Script para inserir pedidos para o usuário de teste (ID 6)

require('dotenv').config();
const conexao = require('./banco/conexao');

async function inserirPedidosParaUsuarioTeste() {
    try {
        console.log('🧪 Inserindo pedidos para usuário de teste (ID 6)...\n');
        
        const usuarioId = 6; // Usuário teste@teste.com
        
        // Verificar se o usuário existe
        const usuario = await conexao.executarConsulta('SELECT id, nome, email FROM usuarios WHERE id = ?', [usuarioId]);
        
        if (usuario.length === 0) {
            console.log('❌ Usuário ID 6 não encontrado!');
            return;
        }
        
        console.log(`👤 Usuário encontrado: ${usuario[0].nome} (${usuario[0].email})`);
        
        // Verificar pedidos existentes do usuário
        const pedidosExistentes = await conexao.executarConsulta('SELECT COUNT(*) as total FROM pedidos WHERE usuario_id = ?', [usuarioId]);
        console.log(`📦 Pedidos existentes para este usuário: ${pedidosExistentes[0].total}`);
        
        // Pedidos de teste para o usuário 6
        const pedidosTeste = [
            {
                usuario_id: usuarioId,
                status_pedido: 'pendente',
                valor_total: 75.90,
                forma_pagamento: 'cartao_credito',
                observacoes: 'Cadernos universitários e canetas'
            },
            {
                usuario_id: usuarioId,
                status_pedido: 'confirmado',
                valor_total: 159.50,
                forma_pagamento: 'pix',
                observacoes: 'Kit completo de papelaria para escritório'
            },
            {
                usuario_id: usuarioId,
                status_pedido: 'pendente',
                valor_total: 245.00,
                forma_pagamento: 'cartao_debito',
                observacoes: 'Material premium - agenda, calculadora e acessórios'
            }
        ];
        
        // Inserir cada pedido
        for (const pedido of pedidosTeste) {
            try {
                const resultado = await conexao.executarConsulta(`
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
                
                console.log(`✅ Pedido inserido: ID ${resultado.insertId} - ${pedido.status_pedido} - R$ ${pedido.valor_total} (${pedido.forma_pagamento})`);
            } catch (error) {
                console.error(`❌ Erro ao inserir pedido:`, error.message);
            }
        }
        
        // Verificar pedidos inseridos
        console.log('\n📋 Verificando todos os pedidos do usuário...');
        const todosPedidos = await conexao.executarConsulta(`
            SELECT id, status_pedido, valor_total, forma_pagamento, 
                   DATE_FORMAT(data_pedido, '%Y-%m-%d %H:%i:%s') as data_formatada,
                   observacoes
            FROM pedidos 
            WHERE usuario_id = ? 
            ORDER BY data_pedido DESC
        `, [usuarioId]);
        
        console.log(`\n✅ Total de pedidos para o usuário: ${todosPedidos.length}`);
        todosPedidos.forEach((pedido, index) => {
            console.log(`${index + 1}. ID ${pedido.id}: ${pedido.status_pedido} - R$ ${pedido.valor_total} - ${pedido.forma_pagamento}`);
            console.log(`   📝 ${pedido.observacoes} (${pedido.data_formatada})\n`);
        });
        
        // Contar pedidos pendentes
        const pedidosPendentes = todosPedidos.filter(p => p.status_pedido === 'pendente');
        console.log(`⏳ Pedidos pendentes: ${pedidosPendentes.length}`);
        
        console.log('\n🎉 Dados de teste inseridos com sucesso!');
        console.log('\n🔧 Agora teste a API com:');
        console.log('curl -H "Authorization: Bearer <seu_token>" http://localhost:3001/api/pedidos');
        
    } catch (error) {
        console.error('❌ Erro ao inserir dados de teste:', error);
    } finally {
        process.exit(0);
    }
}

// Executar
inserirPedidosParaUsuarioTeste();
