/**
 * @fileoverview Teste dos endpoints de notificações
 * @description Testa todas as rotas da API de notificações
 * @author Sistema de Loja de Tênis
 * @version 1.0
 */

const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:3000/api';

class TesteAPIsNotificacoes {
    constructor() {
        console.log('🧪 Testando APIs do sistema de notificações...\n');
    }

    /**
     * Testar endpoint de health da API
     */
    async testarHealth() {
        try {
            console.log('🔍 Testando health da API...');
            const response = await axios.get(`${BASE_URL}/health`);
            console.log('✅ API está funcionando:', response.data);
            return true;
        } catch (error) {
            console.error('❌ Erro no health da API:', error.message);
            return false;
        }
    }

    /**
     * Testar configuração de notificações de usuário
     */
    async testarConfiguracaoUsuario() {
        try {
            console.log('\n🔍 Testando configuração de notificações...');
            
            // Buscar configurações atuais
            const configResponse = await axios.get(`${BASE_URL}/notificacoes/configuracao/1`);
            console.log('📱 Configuração atual:', configResponse.data);

            // Atualizar configurações
            const updateData = {
                notificacoes_email: true,
                notificacoes_sms: false,
                notificacoes_push: true
            };
            
            const updateResponse = await axios.put(`${BASE_URL}/notificacoes/configuracao/1`, updateData);
            console.log('✅ Configuração atualizada:', updateResponse.data);
            
            return true;
        } catch (error) {
            console.error('❌ Erro na configuração:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * Testar histórico de notificações
     */
    async testarHistorico() {
        try {
            console.log('\n🔍 Testando histórico de notificações...');
            
            const response = await axios.get(`${BASE_URL}/notificacoes/historico/1?limite=5`);
            console.log('📋 Histórico:', response.data);
            
            return true;
        } catch (error) {
            console.error('❌ Erro no histórico:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * Testar estatísticas
     */
    async testarEstatisticas() {
        try {
            console.log('\n🔍 Testando estatísticas...');
            
            const response = await axios.get(`${BASE_URL}/notificacoes/estatisticas`);
            console.log('📊 Estatísticas:', response.data);
            
            return true;
        } catch (error) {
            console.error('❌ Erro nas estatísticas:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * Testar envio de notificação teste
     */
    async testarEnvioTeste() {
        try {
            console.log('\n🔍 Testando envio de notificação teste...');
            
            const testData = {
                usuario_id: 1,
                tipo: 'email',
                assunto: 'Teste de Notificação',
                mensagem: 'Esta é uma notificação de teste do sistema.'
            };
            
            const response = await axios.post(`${BASE_URL}/notificacoes/teste`, testData);
            console.log('📧 Teste enviado:', response.data);
            
            return true;
        } catch (error) {
            console.error('❌ Erro no teste de envio:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * Executar todos os testes
     */
    async executarTodos() {
        try {
            let sucessos = 0;
            let total = 0;

            // Testar health
            total++;
            if (await this.testarHealth()) sucessos++;

            // Aguardar um pouco entre os testes
            await new Promise(resolve => setTimeout(resolve, 500));

            // Testar configuração
            total++;
            if (await this.testarConfiguracaoUsuario()) sucessos++;

            await new Promise(resolve => setTimeout(resolve, 500));

            // Testar histórico
            total++;
            if (await this.testarHistorico()) sucessos++;

            await new Promise(resolve => setTimeout(resolve, 500));

            // Testar estatísticas
            total++;
            if (await this.testarEstatisticas()) sucessos++;

            await new Promise(resolve => setTimeout(resolve, 500));

            // Testar envio
            total++;
            if (await this.testarEnvioTeste()) sucessos++;

            // Relatório final
            console.log(`\n📊 Relatório dos testes:`);
            console.log(`✅ Sucessos: ${sucessos}/${total}`);
            console.log(`❌ Falhas: ${total - sucessos}/${total}`);
            console.log(`📈 Taxa de sucesso: ${((sucessos/total)*100).toFixed(1)}%`);

            if (sucessos === total) {
                console.log('\n🎉 Todos os testes passaram! APIs funcionando corretamente.');
            } else {
                console.log('\n⚠️ Alguns testes falharam. Verifique a configuração.');
            }

        } catch (error) {
            console.error('❌ Erro geral nos testes:', error.message);
        }
    }
}

// Executar testes
(async () => {
    const teste = new TesteAPIsNotificacoes();
    await teste.executarTodos();
    console.log('\n✨ Testes concluídos!');
})();
