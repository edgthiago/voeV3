/**
 * Teste simples de notificações
 */

const axios = require('axios');

async function testeSimples() {
    try {
        console.log('🔐 Fazendo login...');
        
        const loginResponse = await axios.post('http://127.0.0.1:3000/api/auth/login', {
            email: 'thiagoeucosta@gmail.com',
            senha: '123456'
        });

        if (!loginResponse.data.sucesso) {
            console.error('❌ Falha no login');
            return;
        }

        const token = loginResponse.data.dados.token;
        console.log('✅ Login realizado! Usuário:', loginResponse.data.dados.usuario.nome);
        console.log('🎯 Tipo:', loginResponse.data.dados.usuario.tipo_usuario);

        console.log('\n🔍 Testando configurações...');
        
        const configResponse = await axios.get('http://127.0.0.1:3000/api/notificacoes/teste-configuracao', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ Resposta:', configResponse.data);

    } catch (error) {
        console.error('❌ Erro:', error.response?.data || error.message);
    }
}

testeSimples();
