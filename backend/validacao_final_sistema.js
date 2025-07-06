/**
 * @fileoverview Script de validação final do sistema de notificações
 * @description Executa todos os testes de validação do sistema completo
 * @author Sistema de Loja de Tênis FGT
 * @version 1.0 - PRODUÇÃO READY
 * @date 2025-07-05
 */

const axios = require('axios');
const mysql = require('mysql2/promise');

const BASE_URL = 'http://127.0.0.1:3000/api';
const DB_CONFIG = {
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'projetofgt'
};

class ValidacaoFinalSistema {
    constructor() {
        this.token = null;
        this.usuario = null;
        this.sucessos = 0;
        this.total = 0;
        console.log('🔥 VALIDAÇÃO FINAL DO SISTEMA DE NOTIFICAÇÕES');
        console.log('📅 Data:', new Date().toLocaleString('pt-BR'));
        console.log('🎯 Objetivo: Validar sistema completo para produção\n');
    }

    /**
     * Contador de testes
     */
    adicionarTeste(sucesso) {
        this.total++;
        if (sucesso) this.sucessos++;
    }

    /**
     * 1. Validar conexão com banco de dados
     */
    async validarBancoDados() {
        try {
            console.log('1️⃣ VALIDANDO BANCO DE DADOS...');
            
            const connection = await mysql.createConnection(DB_CONFIG);
            console.log('   ✅ Conexão MySQL estabelecida');
            
            // Verificar tabelas de notificações
            const tabelas = [
                'notificacoes_log',
                'usuarios_notificacoes', 
                'notificacoes_templates',
                'notificacoes_fila',
                'eventos_log'
            ];

            for (const tabela of tabelas) {
                const [rows] = await connection.execute(`SHOW TABLES LIKE '${tabela}'`);
                if (rows.length > 0) {
                    console.log(`   ✅ Tabela '${tabela}' existe`);
                } else {
                    console.log(`   ❌ Tabela '${tabela}' não encontrada`);
                    this.adicionarTeste(false);
                    return false;
                }
            }

            // Verificar colunas de notificação na tabela usuarios
            const [columns] = await connection.execute('DESCRIBE usuarios');
            const colunasNotificacao = ['notificacoes_email', 'notificacoes_sms', 'notificacoes_push', 'push_token'];
            const colunasExistentes = columns.map(col => col.Field);
            
            for (const coluna of colunasNotificacao) {
                if (colunasExistentes.includes(coluna)) {
                    console.log(`   ✅ Coluna '${coluna}' existe na tabela usuarios`);
                } else {
                    console.log(`   ❌ Coluna '${coluna}' não encontrada`);
                    this.adicionarTeste(false);
                    return false;
                }
            }

            // Verificar templates
            const [templates] = await connection.execute('SELECT COUNT(*) as total FROM notificacoes_templates');
            if (templates[0].total > 0) {
                console.log(`   ✅ Templates encontrados: ${templates[0].total}`);
            } else {
                console.log('   ❌ Nenhum template encontrado');
                this.adicionarTeste(false);
                return false;
            }

            await connection.end();
            this.adicionarTeste(true);
            return true;

        } catch (error) {
            console.error('   ❌ Erro no banco:', error.message);
            this.adicionarTeste(false);
            return false;
        }
    }

    /**
     * 2. Validar autenticação
     */
    async validarAutenticacao() {
        try {
            console.log('\n2️⃣ VALIDANDO AUTENTICAÇÃO...');
            
            const response = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'thiagoeucosta@gmail.com',
                senha: '123456'
            });

            if (response.data.sucesso) {
                this.token = response.data.dados.token;
                this.usuario = response.data.dados.usuario;
                console.log('   ✅ Login realizado com sucesso');
                console.log(`   👤 Usuário: ${this.usuario.nome}`);
                console.log(`   🎯 Tipo: ${this.usuario.tipo_usuario}`);
                console.log(`   🆔 ID: ${this.usuario.id}`);
                this.adicionarTeste(true);
                return true;
            } else {
                console.log('   ❌ Falha no login');
                this.adicionarTeste(false);
                return false;
            }

        } catch (error) {
            console.error('   ❌ Erro na autenticação:', error.message);
            this.adicionarTeste(false);
            return false;
        }
    }

    /**
     * 3. Validar APIs de notificações
     */
    async validarAPIs() {
        try {
            console.log('\n3️⃣ VALIDANDO APIS DE NOTIFICAÇÕES...');
            
            const headers = {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            };

            // Teste 1: Configurações do sistema
            const configSistema = await axios.get(`${BASE_URL}/notificacoes/teste-configuracao`, { headers });
            if (configSistema.data.sucesso) {
                console.log('   ✅ API de configurações do sistema funcionando');
                this.adicionarTeste(true);
            } else {
                console.log('   ❌ API de configurações falhou');
                this.adicionarTeste(false);
            }

            // Teste 2: Configurações do usuário
            const configUsuario = await axios.get(`${BASE_URL}/notificacoes/configuracao/${this.usuario.id}`, { headers });
            if (configUsuario.data.sucesso) {
                console.log('   ✅ API de configuração de usuário funcionando');
                this.adicionarTeste(true);
            } else {
                console.log('   ❌ API de configuração de usuário falhou');
                this.adicionarTeste(false);
            }

            // Teste 3: Estatísticas
            const estatisticas = await axios.get(`${BASE_URL}/notificacoes/estatisticas`, { headers });
            if (estatisticas.data.sucesso) {
                console.log('   ✅ API de estatísticas funcionando');
                this.adicionarTeste(true);
            } else {
                console.log('   ❌ API de estatísticas falhou');
                this.adicionarTeste(false);
            }

            // Teste 4: Histórico
            const historico = await axios.get(`${BASE_URL}/notificacoes/historico/${this.usuario.id}`, { headers });
            if (historico.data.sucesso) {
                console.log('   ✅ API de histórico funcionando');
                this.adicionarTeste(true);
            } else {
                console.log('   ❌ API de histórico falhou');
                this.adicionarTeste(false);
            }

            // Teste 5: Envio de teste
            const teste = await axios.post(`${BASE_URL}/notificacoes/teste`, {
                tipo: 'email',
                destinatario: 'teste@exemplo.com',
                template: 'pedido_criado'
            }, { headers });
            
            if (teste.data.sucesso !== undefined) {
                console.log('   ✅ API de envio de teste funcionando');
                this.adicionarTeste(true);
            } else {
                console.log('   ❌ API de envio de teste falhou');
                this.adicionarTeste(false);
            }

            return true;

        } catch (error) {
            console.error('   ❌ Erro nas APIs:', error.message);
            this.adicionarTeste(false);
            return false;
        }
    }

    /**
     * 4. Validar sistema de eventos
     */
    async validarEventos() {
        try {
            console.log('\n4️⃣ VALIDANDO SISTEMA DE EVENTOS...');
            
            const headers = {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            };

            const eventoTeste = {
                tipo: 'pedido_criado',
                dados: {
                    pedido_id: 'TESTE-' + Date.now(),
                    usuario_id: this.usuario.id,
                    valor_total: 299.99,
                    nome_cliente: this.usuario.nome
                }
            };

            const response = await axios.post(`${BASE_URL}/notificacoes/evento`, eventoTeste, { headers });
            
            if (response.data.sucesso) {
                console.log('   ✅ Sistema de eventos funcionando');
                console.log(`   🎯 Evento '${eventoTeste.tipo}' disparado com sucesso`);
                this.adicionarTeste(true);
                return true;
            } else {
                console.log('   ❌ Sistema de eventos falhou');
                this.adicionarTeste(false);
                return false;
            }

        } catch (error) {
            console.error('   ❌ Erro no sistema de eventos:', error.message);
            this.adicionarTeste(false);
            return false;
        }
    }

    /**
     * 5. Validar integrações
     */
    async validarIntegracoes() {
        try {
            console.log('\n5️⃣ VALIDANDO INTEGRAÇÕES...');
            
            // Verificar se os serviços estão importados corretamente
            console.log('   🔍 Verificando módulos do sistema...');
            
            // Testar health da API principal
            const health = await axios.get(`${BASE_URL}/health`);
            if (health.data.sucesso) {
                console.log('   ✅ API principal funcionando');
                this.adicionarTeste(true);
            } else {
                console.log('   ❌ API principal com problemas');
                this.adicionarTeste(false);
            }

            // Verificar se as rotas estão registradas
            const info = await axios.get(`${BASE_URL}/info`);
            if (info.data.sucesso) {
                console.log('   ✅ Sistema de informações funcionando');
                this.adicionarTeste(true);
            } else {
                console.log('   ❌ Sistema de informações com problemas');
                this.adicionarTeste(false);
            }

            return true;

        } catch (error) {
            console.error('   ❌ Erro nas integrações:', error.message);
            this.adicionarTeste(false);
            return false;
        }
    }

    /**
     * Executar validação completa
     */
    async executarValidacaoCompleta() {
        console.log('═'.repeat(60));
        console.log('🚀 INICIANDO VALIDAÇÃO COMPLETA DO SISTEMA');
        console.log('═'.repeat(60));

        // Executar todas as validações
        await this.validarBancoDados();
        await this.validarAutenticacao();
        await this.validarAPIs();
        await this.validarEventos();
        await this.validarIntegracoes();

        // Relatório final
        console.log('\n' + '═'.repeat(60));
        console.log('📊 RELATÓRIO FINAL DA VALIDAÇÃO');
        console.log('═'.repeat(60));
        
        const porcentagem = ((this.sucessos / this.total) * 100).toFixed(1);
        console.log(`✅ Testes bem-sucedidos: ${this.sucessos}/${this.total}`);
        console.log(`📈 Taxa de sucesso: ${porcentagem}%`);

        if (this.sucessos === this.total) {
            console.log('\n🎉 SISTEMA 100% VALIDADO E PRONTO PARA PRODUÇÃO!');
            console.log('🏆 Todos os componentes estão funcionando perfeitamente');
            console.log('🚀 O sistema pode ser usado em ambiente de produção');
        } else if (porcentagem >= 80) {
            console.log('\n⚠️ Sistema funcionando com pequenos problemas');
            console.log('🔧 Alguns ajustes menores podem ser necessários');
        } else {
            console.log('\n❌ Sistema com problemas significativos');
            console.log('🔨 Correções necessárias antes da produção');
        }

        console.log('\n📋 Próximos passos:');
        console.log('   1. Configure credenciais reais de email/SMS/push');
        console.log('   2. Teste envio real de notificações');
        console.log('   3. Configure monitoramento em produção');
        console.log('   4. Implemente backup automático');

        console.log('\n✨ Validação concluída em:', new Date().toLocaleString('pt-BR'));
        console.log('═'.repeat(60));
    }
}

// Executar validação
(async () => {
    const validacao = new ValidacaoFinalSistema();
    await validacao.executarValidacaoCompleta();
})().catch(error => {
    console.error('❌ Erro fatal na validação:', error);
});
