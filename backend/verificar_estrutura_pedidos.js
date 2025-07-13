// Script para verificar estrutura da tabela pedidos

require('dotenv').config();
const conexao = require('./banco/conexao');

async function verificarEstrutura() {
    try {
        console.log('🔍 Verificando estrutura da tabela pedidos...\n');
        
        // Verificar estrutura da tabela
        const estrutura = await conexao.executarConsulta('DESCRIBE pedidos');
        console.log('📋 Estrutura da tabela pedidos:');
        console.table(estrutura);
        
        // Verificar pedidos existentes
        const pedidos = await conexao.executarConsulta(`
            SELECT * FROM pedidos LIMIT 3
        `);
        
        console.log('\n📦 Exemplos de pedidos existentes:');
        if (pedidos.length > 0) {
            console.table(pedidos);
        } else {
            console.log('Nenhum pedido encontrado.');
        }
        
    } catch (error) {
        console.error('❌ Erro ao verificar estrutura:', error);
    } finally {
        process.exit(0);
    }
}

// Executar
verificarEstrutura();
