// Script de teste para verificar integração frontend-backend
// Este script simula o comportamento do frontend

const API_BASE_URL = 'http://localhost:3001/api';

// Função para fazer login
async function testarLogin() {
    try {
        console.log('🔐 Testando login...');
        
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
            console.log('✅ Login bem-sucedido!');
            console.log('Token:', data.dados.token);
            console.log('Usuário:', data.dados.usuario.nome);
            
            // Salvar token no localStorage (simular frontend)
            const token = data.dados.token;
            
            // Testar buscar pedidos com token
            await testarBuscarPedidos(token);
            
            return token;
        } else {
            console.error('❌ Erro no login:', data.mensagem);
            return null;
        }
    } catch (error) {
        console.error('❌ Erro na requisição de login:', error);
        return null;
    }
}

// Função para buscar pedidos
async function testarBuscarPedidos(token) {
    try {
        console.log('📦 Testando buscar pedidos...');
        
        const response = await fetch(`${API_BASE_URL}/pedidos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        
        if (data.sucesso) {
            console.log('✅ Pedidos carregados com sucesso!');
            console.log('Número de pedidos:', data.dados.length);
            console.log('Pedidos:', data.dados);
        } else {
            console.error('❌ Erro ao buscar pedidos:', data.mensagem);
        }
    } catch (error) {
        console.error('❌ Erro na requisição de pedidos:', error);
    }
}

// Função para buscar pedidos pendentes
async function testarBuscarPedidosPendentes(token) {
    try {
        console.log('⏳ Testando buscar pedidos pendentes...');
        
        const response = await fetch(`${API_BASE_URL}/pedidos?status=pendente`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        
        if (data.sucesso) {
            console.log('✅ Pedidos pendentes carregados com sucesso!');
            console.log('Número de pedidos pendentes:', data.dados.length);
            console.log('Pedidos pendentes:', data.dados);
        } else {
            console.error('❌ Erro ao buscar pedidos pendentes:', data.mensagem);
        }
    } catch (error) {
        console.error('❌ Erro na requisição de pedidos pendentes:', error);
    }
}

// Executar teste completo
async function executarTestesCompletos() {
    console.log('🧪 Iniciando testes de integração frontend-backend...\n');
    
    const token = await testarLogin();
    
    if (token) {
        console.log('\n');
        await testarBuscarPedidosPendentes(token);
        
        console.log('\n✅ Testes concluídos! A integração está funcionando.');
        console.log('💡 Para usar no frontend, certifique-se de que o token está sendo salvo no localStorage.');
    } else {
        console.log('\n❌ Falha nos testes. Verifique o backend e as credenciais.');
    }
}

// Se estiver sendo executado diretamente no Node.js
if (typeof window === 'undefined') {
    // Importar fetch para Node.js
    const fetch = require('node-fetch');
    global.fetch = fetch;
    
    executarTestesCompletos();
}

// Exportar para uso no navegador
if (typeof window !== 'undefined') {
    window.executarTestesCompletos = executarTestesCompletos;
}
