/**
 * @fileoverview Teste completo com autenticação das APIs de notificações
 * @description Testa todas as rotas da API de notificações com login
 * @author Sistema de Loja de Tênis
 * @version 1.0
 */

const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:3000/api';

class TesteCompleto {
    constructor() {
        console.log('🧪 Iniciando teste completo com autenticação...\n');
        this.token = null;
        this.usuarioId = null;
    }

    /**
     * Fazer login e obter token
     */
    async fazerLogin() {
        try {
            console.log('🔐 Fazendo login...');
            
            // Primeiro, tentar registrar um usuário teste
            try {
                const registroData = {
                    nome: 'Usuario Teste',
                    email: 'teste@teste.com',
                    senha: '123456',
                    tipo_usuario: 'diretor' // Para ter acesso admin
                };
                
                await axios.post(`${BASE_URL}/auth/registrar`, registroData);
                console.log('✅ Usuário teste criado');
            } catch (error) {
                // Usuário já existe, continuar
                console.log('ℹ️ Usuário teste já existe');
            }

            // Fazer login
            const loginData = {
                email: 'thiagoeucosta@gmail.com',
                senha: '123456'
            };
            
            const response = await axios.post(`${BASE_URL}/auth/login`, loginData);
            
            if (response.data.sucesso) {
                this.token = response.data.dados.token;
                this.usuarioId = response.data.dados.usuario.id;
                console.log('✅ Login realizado com sucesso');
                console.log('👤 Usuário ID:', this.usuarioId);
                console.log('🎟️ Token obtido');
                return true;
            } else {
                console.error('❌ Falha no login:', response.data);
                return false;
            }
            
        } catch (error) {
            console.error('❌ Erro no login:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * Obter headers com autenticação
     */
    getHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Testar configuração de notificações
     */
    async testarConfiguracoes() {
        try {
            console.log('\n🔍 Testando configurações de notificação...');
            
            const response = await axios.get(
                `${BASE_URL}/notificacoes/teste-configuracao`,
                { headers: this.getHeaders() }
            );
            
            console.log('📱 Configurações:', response.data);
            return true;
        } catch (error) {
            console.error('❌ Erro nas configurações:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * Testar envio de notificação
     */
    async testarEnvio() {
        try {
            console.log('\n🔍 Testando envio de notificação...');
            
            const testData = {
                tipo: 'email',
                destinatario: 'thiagoeucosta@gmail.com',
                template: 'pedido_criado'
            };
            
            const response = await axios.post(
                `${BASE_URL}/notificacoes/teste`,
                testData,
                { headers: this.getHeaders() }
            );
            
            console.log('📧 Envio testado:', response.data);
            return true;
        } catch (error) {
            console.error('❌ Erro no envio:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * Testar configuração de usuário
     */
    async testarConfiguracaoUsuario() {
        try {
            console.log('\n🔍 Testando configuração de usuário...');
            
            // Obter configuração atual
            const getResponse = await axios.get(
                `${BASE_URL}/notificacoes/configuracao/${this.usuarioId}`,
                { headers: this.getHeaders() }
            );
            
            console.log('📱 Configuração atual:', getResponse.data);
            
            // Atualizar configuração
            const updateData = {
                notificacoes_email: true,
                notificacoes_sms: false,
                notificacoes_push: true
            };
            
            const putResponse = await axios.put(
                `${BASE_URL}/notificacoes/configuracao/${this.usuarioId}`,
                updateData,
                { headers: this.getHeaders() }
            );
            
            console.log('✅ Configuração atualizada:', putResponse.data);
            return true;
        } catch (error) {
            console.error('❌ Erro na configuração do usuário:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * Testar estatísticas
     */
    async testarEstatisticas() {
        try {
            console.log('\n🔍 Testando estatísticas...');
            
            const response = await axios.get(
                `${BASE_URL}/notificacoes/estatisticas`,
                { headers: this.getHeaders() }
            );
            
            console.log('📊 Estatísticas:', response.data);
            return true;
        } catch (error) {
            console.error('❌ Erro nas estatísticas:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * Executar todos os testes
     */
    async executarTodos() {
        try {
            // Fazer login primeiro
            if (!(await this.fazerLogin())) {
                console.error('❌ Não foi possível fazer login. Abortando testes.');
                return;
            }

            let sucessos = 0;
            let total = 0;

            // Aguardar um pouco
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Testar configurações
            total++;
            if (await this.testarConfiguracoes()) sucessos++;

            await new Promise(resolve => setTimeout(resolve, 500));

            // Testar configuração de usuário
            total++;
            if (await this.testarConfiguracaoUsuario()) sucessos++;

            await new Promise(resolve => setTimeout(resolve, 500));

            // Testar estatísticas
            total++;
            if (await this.testarEstatisticas()) sucessos++;

            await new Promise(resolve => setTimeout(resolve, 500));

            // Testar envio
            total++;
            if (await this.testarEnvio()) sucessos++;

            // Relatório final
            console.log(`\n📊 Relatório dos testes:`);
            console.log(`✅ Sucessos: ${sucessos}/${total}`);
            console.log(`❌ Falhas: ${total - sucessos}/${total}`);
            console.log(`📈 Taxa de sucesso: ${((sucessos/total)*100).toFixed(1)}%`);

            if (sucessos === total) {
                console.log('\n🎉 Todos os testes passaram! Sistema de notificações funcionando corretamente.');
            } else {
                console.log('\n⚠️ Alguns testes falharam. Sistema parcialmente funcional.');
            }

        } catch (error) {
            console.error('❌ Erro geral nos testes:', error.message);
        }
    }
}

// Executar testes
(async () => {
    const teste = new TesteCompleto();
    await teste.executarTodos();
    console.log('\n✨ Testes concluídos!');
})();
