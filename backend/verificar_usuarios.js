/**
 * Script para verificar estrutura da tabela usuarios
 */

require('dotenv').config();
const conexao = require('./banco/conexao');

async function verificarEstrutura() {
    try {
        console.log('🔍 Verificando estrutura da tabela usuarios...\n');
        
        const colunas = await conexao.executarConsulta(`
            DESCRIBE usuarios
        `);
        
        console.log('📋 Colunas existentes na tabela usuarios:');
        colunas.forEach(coluna => {
            console.log(`   ${coluna.Field} (${coluna.Type}) - ${coluna.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        
        // Verificar quais colunas de notificação já existem
        const colunasNotificacao = ['notificacoes_email', 'notificacoes_sms', 'notificacoes_push', 'push_token'];
        const colunasExistentes = colunas.map(c => c.Field);
        
        console.log('\n🔔 Status das colunas de notificação:');
        colunasNotificacao.forEach(col => {
            const existe = colunasExistentes.includes(col);
            console.log(`   ${col}: ${existe ? '✅ Existe' : '❌ Não existe'}`);
        });
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

verificarEstrutura();
