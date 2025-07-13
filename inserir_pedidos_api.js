// Script para inserir pedidos de teste via API

const API_BASE_URL = 'http://localhost:3001/api';

// Função para fazer login e obter token
async function obterToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'teste@teste.com',
                senha: '123456'
            }),
        });

        const data = await response.json();
        
        if (data.sucesso) {
            console.log('✅ Login realizado com sucesso!');
            return data.dados.token;
        } else {
            console.error('❌ Erro no login:', data.mensagem);
            return null;
        }
    } catch (error) {
        console.error('❌ Erro na requisição de login:', error);
        return null;
    }
}

// Função para criar pedido via API
async function criarPedido(token, dadosPedido) {
    try {
        const response = await fetch(`${API_BASE_URL}/pedidos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(dadosPedido),
        });

        const data = await response.json();
        
        if (data.sucesso) {
            console.log('✅ Pedido criado:', data.dados);
        } else {
            console.error('❌ Erro ao criar pedido:', data.mensagem);
        }
        
        return data;
    } catch (error) {
        console.error('❌ Erro na requisição de criação de pedido:', error);
        return null;
    }
}

// Função para inserir pedidos de teste
async function inserirPedidosTeste() {
    console.log('🧪 Inserindo pedidos de teste...\n');
    
    const token = await obterToken();
    
    if (!token) {
        console.log('❌ Não foi possível obter token. Abortando...');
        return;
    }
    
    const pedidosTeste = [
        {
            produtos: [
                {
                    id: 1,
                    nome: 'Caderno Universitário 200 folhas',
                    quantidade: 3,
                    preco: 25.90
                },
                {
                    id: 2,
                    nome: 'Caneta Esferográfica Azul',
                    quantidade: 10,
                    preco: 2.50
                }
            ],
            metodo_pagamento: 'cartao_credito',
            endereco_entrega: {
                rua: 'Rua das Flores, 123',
                bairro: 'Centro',
                cidade: 'São Paulo',
                estado: 'SP',
                cep: '01234-567'
            },
            observacoes: 'Pedido de teste - Material escolar básico'
        },
        {
            produtos: [
                {
                    id: 3,
                    nome: 'Kit Escritório Completo',
                    quantidade: 1,
                    preco: 199.99
                }
            ],
            metodo_pagamento: 'pix',
            endereco_entrega: {
                rua: 'Avenida Principal, 456',
                bairro: 'Jardim America',
                cidade: 'São Paulo',
                estado: 'SP',
                cep: '01234-890'
            },
            observacoes: 'Material para escritório'
        }
    ];
    
    console.log('📦 Tentando criar pedidos...\n');
    
    for (let i = 0; i < pedidosTeste.length; i++) {
        console.log(`Criando pedido ${i + 1}...`);
        await criarPedido(token, pedidosTeste[i]);
        console.log('');
    }
    
    // Verificar pedidos criados
    console.log('📋 Verificando pedidos criados...');
    try {
        const response = await fetch(`${API_BASE_URL}/pedidos`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        const data = await response.json();
        
        if (data.sucesso) {
            console.log(`✅ Total de pedidos encontrados: ${data.dados.length}`);
            if (data.dados.length > 0) {
                console.log('📋 Pedidos:');
                data.dados.forEach(pedido => {
                    console.log(`- ID: ${pedido.id}, Status: ${pedido.status_pedido}, Total: R$ ${pedido.valor_total}`);
                });
            }
        } else {
            console.error('❌ Erro ao buscar pedidos:', data.mensagem);
        }
    } catch (error) {
        console.error('❌ Erro ao verificar pedidos:', error);
    }
}

// Se estiver sendo executado diretamente no Node.js
if (typeof window === 'undefined') {
    // Importar fetch para Node.js (assumindo que node-fetch já está instalado)
    const fetch = require('node-fetch');
    global.fetch = fetch;
    
    inserirPedidosTeste();
}

// Exportar para uso no navegador
if (typeof window !== 'undefined') {
    window.inserirPedidosTeste = inserirPedidosTeste;
}
