/**
 * Script simples para adicionar colunas de notificação
 */

require('dotenv').config();
const conexao = require('./banco/conexao');

async function adicionarColunasNotificacao() {
    try {
        console.log('📋 Adicionando colunas de notificação...\n');
        
        // Adicionar colunas uma por vez
        const colunas = [
            'ADD COLUMN notificacoes_email BOOLEAN DEFAULT TRUE',
            'ADD COLUMN notificacoes_sms BOOLEAN DEFAULT FALSE', 
            'ADD COLUMN notificacoes_push BOOLEAN DEFAULT TRUE',
            'ADD COLUMN push_token VARCHAR(255) NULL'
        ];
        
        for (let i = 0; i < colunas.length; i++) {
            try {
                const sql = `ALTER TABLE usuarios ${colunas[i]}`;
                console.log(`⏳ Executando: ${sql}`);
                await conexao.executarConsulta(sql);
                console.log('✅ Coluna adicionada com sucesso');
            } catch (error) {
                if (error.message.includes('Duplicate column')) {
                    console.log('⚠️ Coluna já existe');
                } else {
                    console.error('❌ Erro:', error.message);
                }
            }
        }
        
        // Verificar se as colunas foram criadas
        console.log('\n🔍 Verificando colunas criadas...');
        const resultado = await conexao.executarConsulta('DESCRIBE usuarios');
        const colunas_existentes = resultado.map(c => c.Field);
        
        const colunasNotificacao = ['notificacoes_email', 'notificacoes_sms', 'notificacoes_push', 'push_token'];
        colunasNotificacao.forEach(col => {
            const existe = colunas_existentes.includes(col);
            console.log(`   ${col}: ${existe ? '✅' : '❌'}`);
        });
        
        console.log('\n✅ Colunas de notificação configuradas!');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

adicionarColunasNotificacao();
