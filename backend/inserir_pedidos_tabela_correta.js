// Script para inserir pedidos na tabela pedidos_simples

require('dotenv').config();
const conexao = require('./banco/conexao');

async function inserirPedidosNaTabelaCorreta() {
    try {
        console.log('🧪 Inserindo pedidos na tabela pedidos_simples...\n');
        
        const usuarioId = 6; // Usuário teste@teste.com
        
        // Verificar se o usuário existe
        const usuario = await conexao.executarConsulta('SELECT id, nome, email FROM usuarios WHERE id = ?', [usuarioId]);
        
        if (usuario.length === 0) {
            console.log('❌ Usuário ID 6 não encontrado!');
            return;
        }
        
        console.log(`👤 Usuário encontrado: ${usuario[0].nome} (${usuario[0].email})`);
        
        // Verificar pedidos existentes do usuário na tabela pedidos_simples
        const pedidosExistentes = await conexao.executarConsulta('SELECT COUNT(*) as total FROM pedidos_simples WHERE usuario_id = ?', [usuarioId]);
        console.log(`📦 Pedidos existentes na tabela pedidos_simples: ${pedidosExistentes[0].total}`);
        
        // Criar pedidos de teste com estrutura correta
        const timestamp = Date.now();
        const pedidosTeste = [
            {
                id: `PED-${timestamp}-001`,
                usuario_id: usuarioId,
                status_pedido: 'pendente',
                valor_total: 75.90,
                valor_desconto: 0.00,
                valor_frete: 0.00,
                forma_pagamento: 'cartao_credito',
                observacoes: 'Cadernos universitários e canetas',
                itens_json: JSON.stringify([
                    {
                        id: 1,
                        nome: 'Caderno Universitário 200 folhas',
                        quantidade: 2,
                        preco_unitario: 25.90,
                        subtotal: 51.80
                    },
                    {
                        id: 2,
                        nome: 'Kit Canetas Esferográficas',
                        quantidade: 1,
                        preco_unitario: 24.10,
                        subtotal: 24.10
                    }
                ])
            },
            {
                id: `PED-${timestamp}-002`,
                usuario_id: usuarioId,
                status_pedido: 'confirmado',
                valor_total: 159.50,
                valor_desconto: 15.00,
                valor_frete: 0.00,
                forma_pagamento: 'pix',
                observacoes: 'Kit completo de papelaria para escritório',
                itens_json: JSON.stringify([
                    {
                        id: 3,
                        nome: 'Kit Escritório Premium',
                        quantidade: 1,
                        preco_unitario: 174.50,
                        subtotal: 174.50
                    }
                ])
            },
            {
                id: `PED-${timestamp}-003`,
                usuario_id: usuarioId,
                status_pedido: 'pendente',
                valor_total: 245.00,
                valor_desconto: 0.00,
                valor_frete: 12.00,
                forma_pagamento: 'cartao_debito',
                observacoes: 'Material premium - agenda, calculadora e acessórios',
                itens_json: JSON.stringify([
                    {
                        id: 4,
                        nome: 'Agenda Executiva 2025',
                        quantidade: 1,
                        preco_unitario: 89.90,
                        subtotal: 89.90
                    },
                    {
                        id: 5,
                        nome: 'Calculadora Científica',
                        quantidade: 1,
                        preco_unitario: 143.10,
                        subtotal: 143.10
                    }
                ])
            }
        ];
        
        // Inserir cada pedido
        for (const pedido of pedidosTeste) {
            try {
                await conexao.executarConsulta(`
                    INSERT INTO pedidos_simples (
                        id, usuario_id, status_pedido, valor_total, 
                        valor_desconto, valor_frete, forma_pagamento, 
                        observacoes, itens_json, data_pedido
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                `, [
                    pedido.id,
                    pedido.usuario_id,
                    pedido.status_pedido,
                    pedido.valor_total,
                    pedido.valor_desconto,
                    pedido.valor_frete,
                    pedido.forma_pagamento,
                    pedido.observacoes,
                    pedido.itens_json
                ]);
                
                console.log(`✅ Pedido ${pedido.id} inserido: ${pedido.status_pedido} - R$ ${pedido.valor_total} (${pedido.forma_pagamento})`);
            } catch (error) {
                console.error(`❌ Erro ao inserir pedido ${pedido.id}:`, error.message);
            }
        }
        
        // Verificar pedidos inseridos
        console.log('\n📋 Verificando todos os pedidos do usuário na tabela pedidos_simples...');
        const todosPedidos = await conexao.executarConsulta(`
            SELECT id, status_pedido, valor_total, forma_pagamento, 
                   DATE_FORMAT(data_pedido, '%Y-%m-%d %H:%i:%s') as data_formatada,
                   observacoes
            FROM pedidos_simples 
            WHERE usuario_id = ? 
            ORDER BY data_pedido DESC
        `, [usuarioId]);
        
        console.log(`\n✅ Total de pedidos para o usuário na tabela pedidos_simples: ${todosPedidos.length}`);
        todosPedidos.forEach((pedido, index) => {
            console.log(`${index + 1}. ${pedido.id}: ${pedido.status_pedido} - R$ ${pedido.valor_total} - ${pedido.forma_pagamento}`);
            console.log(`   📝 ${pedido.observacoes} (${pedido.data_formatada})\n`);
        });
        
        // Contar pedidos pendentes
        const pedidosPendentes = todosPedidos.filter(p => p.status_pedido === 'pendente');
        console.log(`⏳ Pedidos pendentes: ${pedidosPendentes.length}`);
        
        console.log('\n🎉 Dados de teste inseridos na tabela correta!');
        console.log('\n🔧 Agora a API de pedidos deve retornar os dados.');
        
    } catch (error) {
        console.error('❌ Erro ao inserir dados de teste:', error);
    } finally {
        process.exit(0);
    }
}

// Executar
inserirPedidosNaTabelaCorreta();
