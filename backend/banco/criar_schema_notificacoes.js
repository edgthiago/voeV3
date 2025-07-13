/**
 * @fileoverview Script para criar tabelas do sistema de notificações
 * @description Executa o schema SQL para notificações no banco de dados
 * @author Sistema de Papelaria
 * @version 1.0
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const fs = require('fs');
const conexao = require('./conexao');

async function criarSchemaNotificacoes() {
    console.log('🔄 Iniciando criação do schema de notificações...');
    
    try {
        // Ler o arquivo SQL
        const schemaPath = path.join(__dirname, 'schema_notificacoes.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        // Dividir em comandos individuais
        const comandos = schemaSql
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('#'));
        
        console.log(`📋 Executando ${comandos.length} comandos SQL...`);
        console.log('🔍 Comandos encontrados:');
        comandos.forEach((cmd, i) => {
            console.log(`   ${i + 1}. ${cmd.substring(0, 50)}...`);
        });
        
        // Executar cada comando
        for (let i = 0; i < comandos.length; i++) {
            const comando = comandos[i];
            
            try {
                console.log(`⏳ Executando comando ${i + 1}/${comandos.length}...`);
                await conexao.executarConsulta(comando);
                console.log(`✅ Comando ${i + 1} executado com sucesso`);
                
            } catch (error) {
                // Se for erro de "já existe" ou "duplicate", continua
                if (error.message.includes('already exists') || 
                    error.message.includes('Duplicate column') ||
                    error.message.includes('Duplicate key') ||
                    error.message.includes('Duplicate entry') ||
                    error.code === 'ER_DUP_KEYNAME' ||
                    error.code === 'ER_TABLE_EXISTS_ERROR') {
                    console.log(`⚠️ Comando ${i + 1} já executado anteriormente (${error.code || 'duplicado'})`);
                    continue;
                }
                
                console.error(`❌ Erro no comando ${i + 1}:`, error.message);
                console.error(`📝 Comando SQL:`, comando);
                throw error;
            }
        }
        
        // Verificar tabelas criadas
        console.log('\n🔍 Verificando tabelas criadas...');
        
        const tabelas = [
            'notificacoes_log',
            'usuarios_notificacoes', 
            'notificacoes_templates',
            'notificacoes_fila'
        ];
        
        for (const tabela of tabelas) {
            try {
                const resultado = await conexao.executarConsulta(
                    `SELECT COUNT(*) as count FROM ${tabela} LIMIT 1`
                );
                console.log(`✅ Tabela '${tabela}' criada com sucesso`);
                
            } catch (error) {
                console.error(`❌ Tabela '${tabela}' não foi criada:`, error.message);
            }
        }
        
        // Verificar view criada
        try {
            const resultado = await conexao.executarConsulta(
                'SELECT * FROM v_notificacoes_estatisticas LIMIT 1'
            );
            console.log('✅ View "v_notificacoes_estatisticas" criada com sucesso');
            
        } catch (error) {
            console.error('❌ View "v_notificacoes_estatisticas" não foi criada:', error.message);
        }
        
        // Verificar colunas adicionadas na tabela usuarios
        try {
            const colunas = await conexao.executarConsulta(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'usuarios' 
                AND COLUMN_NAME IN ('notificacoes_email', 'notificacoes_sms', 'notificacoes_push', 'push_token')
            `);
            
            console.log(`✅ ${colunas.length} colunas de notificação adicionadas na tabela usuarios`);
            
        } catch (error) {
            console.error('❌ Erro ao verificar colunas de notificação:', error.message);
        }
        
        console.log('\n🎉 Schema de notificações criado com sucesso!');
        console.log('\n📋 Resumo das funcionalidades implementadas:');
        console.log('   • Logs de notificações (email, SMS, push)');
        console.log('   • Configurações de notificação por usuário');
        console.log('   • Templates personalizáveis');
        console.log('   • Fila de notificações para envio assíncrono');
        console.log('   • Estatísticas e relatórios');
        console.log('   • Integração com tabela de usuários');
        
        return true;
        
    } catch (error) {
        console.error('\n❌ Erro ao criar schema de notificações:', error);
        return false;
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    criarSchemaNotificacoes()
        .then(sucesso => {
            if (sucesso) {
                console.log('\n✅ Script executado com sucesso!');
                process.exit(0);
            } else {
                console.log('\n❌ Script falhou!');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('\n💥 Erro fatal:', error);
            process.exit(1);
        });
}

module.exports = { criarSchemaNotificacoes };
