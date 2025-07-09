/**
 * @fileoverview Script de teste para sistema de notificações
 * @description Testa configuração e envio de notificações
 * @author Sistema de Loja de Tênis
 * @version 1.0
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const notificacaoService = require('./services/notificacaoService');
const eventoManager = require('./services/eventoManager');
const conexao = require('./banco/conexao');

class TesteNotificacoes {
    constructor() {
        console.log('🧪 Iniciando testes do sistema de notificações...\n');
    }

    /**
     * Executar todos os testes
     */
    async executarTestes() {
        try {
            // 1. Testar configurações
            console.log('1️⃣ Testando configurações...');
            await this.testarConfiguracoes();

            // 2. Testar banco de dados
            console.log('\n2️⃣ Testando estrutura do banco...');
            await this.testarBanco();

            // 3. Testar envio de notificações
            console.log('\n3️⃣ Testando envio de notificações...');
            await this.testarEnvioNotificacoes();

            // 4. Testar sistema de eventos
            console.log('\n4️⃣ Testando sistema de eventos...');
            await this.testarSistemaEventos();

            // 5. Gerar relatório
            console.log('\n5️⃣ Gerando relatório final...');
            await this.gerarRelatorio();

            console.log('\n✅ Todos os testes concluídos com sucesso!');

        } catch (error) {
            console.error('\n❌ Erro durante os testes:', error);
            throw error;
        }
    }

    /**
     * Testar configurações dos serviços
     */
    async testarConfiguracoes() {
        try {
            const configuracoes = await notificacaoService.testarConfiguracoes();
            
            console.log('📧 Email:', configuracoes.email ? '✅ Configurado' : '❌ Não configurado');
            console.log('📱 SMS:', configuracoes.sms ? '✅ Configurado' : '❌ Não configurado');
            console.log('🔔 Push:', configuracoes.push ? '✅ Configurado' : '❌ Não configurado');

            if (!configuracoes.email && !configuracoes.sms && !configuracoes.push) {
                console.warn('⚠️ Nenhum canal de notificação configurado!');
                console.log('💡 Configure pelo menos email para testes básicos');
            }

        } catch (error) {
            console.error('❌ Erro ao testar configurações:', error.message);
        }
    }

    /**
     * Testar estrutura do banco de dados
     */
    async testarBanco() {
        const tabelas = [
            'notificacoes_log',
            'usuarios_notificacoes',
            'notificacoes_templates',
            'notificacoes_fila',
            'eventos_log'
        ];

        for (const tabela of tabelas) {
            try {
                await conexao.executarConsulta(`SELECT COUNT(*) as count FROM ${tabela} LIMIT 1`);
                console.log(`📋 Tabela '${tabela}': ✅ OK`);
            } catch (error) {
                console.log(`📋 Tabela '${tabela}': ❌ Erro - ${error.message}`);
            }
        }

        // Verificar colunas de notificação na tabela usuarios
        try {
            const colunas = await conexao.executarConsulta(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'usuarios' 
                AND COLUMN_NAME IN ('notificacoes_email', 'notificacoes_sms', 'notificacoes_push', 'push_token')
            `);
            
            console.log(`👥 Colunas de notificação na tabela usuarios: ${colunas.length}/4`);
            
        } catch (error) {
            console.log(`👥 Erro ao verificar tabela usuarios: ${error.message}`);
        }
    }

    /**
     * Testar envio de notificações
     */
    async testarEnvioNotificacoes() {
        // Buscar usuário de teste
        const usuarios = await conexao.executarConsulta(
            'SELECT * FROM usuarios WHERE tipo = "admin" LIMIT 1'
        );

        if (usuarios.length === 0) {
            console.log('⚠️ Nenhum usuário admin encontrado para testes');
            return;
        }

        const usuario = usuarios[0];
        console.log(`👤 Testando com usuário: ${usuario.email}`);

        // Dados de teste
        const dadosTeste = {
            pedido_id: 'TEST-123456',
            nome_cliente: usuario.nome || 'Usuário Teste',
            valor_total: '199,90',
            status: 'Confirmado',
            data_pedido: new Date(),
            metodo_pagamento: 'PIX',
            valor: '199,90',
            codigo_rastreamento: 'BR123456789TEST',
            transportadora: 'Correios',
            previsao_entrega: '3 dias úteis',
            data_entrega: new Date(),
            recebido_por: 'Destinatário'
        };

        // Testar email (se configurado)
        if (usuario.email) {
            try {
                console.log('📧 Testando envio de email...');
                const resultado = await notificacaoService.enviarEmail(
                    usuario.email, 
                    'pedido_criado', 
                    dadosTeste
                );
                
                console.log(resultado.sucesso ? 
                    '✅ Email enviado com sucesso' : 
                    `❌ Falha no email: ${resultado.erro}`);
                    
            } catch (error) {
                console.log(`❌ Erro no teste de email: ${error.message}`);
            }
        }

        // Testar notificação completa
        try {
            console.log('🔔 Testando notificação completa...');
            const resultado = await notificacaoService.enviarNotificacaoCompleta({
                usuario_id: usuario.id,
                template: 'pedido_criado',
                dados: dadosTeste,
                canais: ['email'] // Apenas email para testes
            });
            
            console.log(resultado.sucesso ? 
                '✅ Notificação completa enviada' : 
                `❌ Falha na notificação: ${resultado.erro}`);
                
        } catch (error) {
            console.log(`❌ Erro no teste de notificação completa: ${error.message}`);
        }
    }

    /**
     * Testar sistema de eventos
     */
    async testarSistemaEventos() {
        try {
            // Buscar usuário de teste
            const usuarios = await conexao.executarConsulta(
                'SELECT * FROM usuarios LIMIT 1'
            );

            if (usuarios.length === 0) {
                console.log('⚠️ Nenhum usuário encontrado para testes de eventos');
                return;
            }

            const usuario = usuarios[0];

            // Testar evento de pedido criado
            console.log('🎯 Testando evento: pedido_criado');
            await eventoManager.emit('pedido_criado', {
                pedido_id: 'TEST-EVENT-123',
                usuario_id: usuario.id,
                nome_cliente: usuario.nome || 'Cliente Teste',
                valor_total: '299,90',
                status: 'Confirmado',
                data_pedido: new Date()
            });

            console.log('✅ Evento emitido com sucesso');

            // Verificar se foi registrado no log
            const logs = await conexao.executarConsulta(
                'SELECT * FROM eventos_log WHERE evento = "pedido_criado" ORDER BY created_at DESC LIMIT 1'
            );

            if (logs.length > 0) {
                console.log('✅ Evento registrado no log');
            } else {
                console.log('⚠️ Evento não encontrado no log');
            }

        } catch (error) {
            console.log(`❌ Erro no teste de eventos: ${error.message}`);
        }
    }

    /**
     * Gerar relatório final
     */
    async gerarRelatorio() {
        try {
            // Estatísticas de notificações
            const notificacoes = await conexao.executarConsulta(`
                SELECT 
                    tipo,
                    status,
                    COUNT(*) as total
                FROM notificacoes_log 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
                GROUP BY tipo, status
            `);

            if (notificacoes.length > 0) {
                console.log('📊 Notificações enviadas nas últimas 24h:');
                notificacoes.forEach(stat => {
                    console.log(`   ${stat.tipo}: ${stat.total} (${stat.status})`);
                });
            } else {
                console.log('📊 Nenhuma notificação enviada nas últimas 24h');
            }

            // Estatísticas de eventos
            const eventos = await conexao.executarConsulta(`
                SELECT 
                    evento,
                    COUNT(*) as total
                FROM eventos_log 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
                GROUP BY evento
                ORDER BY total DESC
            `);

            if (eventos.length > 0) {
                console.log('\n🎯 Eventos emitidos nas últimas 24h:');
                eventos.forEach(stat => {
                    console.log(`   ${stat.evento}: ${stat.total}`);
                });
            } else {
                console.log('\n🎯 Nenhum evento emitido nas últimas 24h');
            }

            // Verificar configurações de usuários
            const configUsuarios = await conexao.executarConsulta(`
                SELECT 
                    COUNT(*) as total,
                    SUM(notificacoes_email) as email_ativo,
                    SUM(notificacoes_sms) as sms_ativo,
                    SUM(notificacoes_push) as push_ativo
                FROM usuarios
            `);

            if (configUsuarios.length > 0) {
                const config = configUsuarios[0];
                console.log('\n👥 Configurações dos usuários:');
                console.log(`   Total de usuários: ${config.total}`);
                console.log(`   Email ativo: ${config.email_ativo}`);
                console.log(`   SMS ativo: ${config.sms_ativo}`);
                console.log(`   Push ativo: ${config.push_ativo}`);
            }

        } catch (error) {
            console.log(`❌ Erro ao gerar relatório: ${error.message}`);
        }
    }
}

// Executar testes se chamado diretamente
if (require.main === module) {
    const teste = new TesteNotificacoes();
    
    teste.executarTestes()
        .then(() => {
            console.log('\n🎉 Teste concluído!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Teste falhou:', error);
            process.exit(1);
        });
}

module.exports = TesteNotificacoes;
