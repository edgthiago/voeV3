// Script para verificar tabelas de pedidos

require('dotenv').config();
const conexao = require('./banco/conexao');

async function verificarTabelas() {
    try {
        console.log('🔍 Verificando tabelas relacionadas a pedidos...\n');
        
        // Verificar se tabela pedidos_simples existe
        try {
            const pedidosSimples = await conexao.executarConsulta('SELECT COUNT(*) as total FROM pedidos_simples');
            console.log(`✅ Tabela pedidos_simples existe - ${pedidosSimples[0].total} registros`);
            
            // Ver estrutura
            const estruturaSimples = await conexao.executarConsulta('DESCRIBE pedidos_simples');
            console.log('\n📋 Estrutura da tabela pedidos_simples:');
            console.table(estruturaSimples);
            
        } catch (error) {
            console.log('❌ Tabela pedidos_simples NÃO existe:', error.message);
        }
        
        // Verificar tabela pedidos regular
        try {
            const pedidosRegular = await conexao.executarConsulta('SELECT COUNT(*) as total FROM pedidos');
            console.log(`\n✅ Tabela pedidos existe - ${pedidosRegular[0].total} registros`);
            
            // Ver alguns dados
            const exemplos = await conexao.executarConsulta(`
                SELECT id, usuario_id, status_pedido, valor_total, data_pedido 
                FROM pedidos 
                ORDER BY data_pedido DESC 
                LIMIT 5
            `);
            
            console.log('\n📦 Últimos pedidos na tabela pedidos:');
            console.table(exemplos);
            
        } catch (error) {
            console.log('❌ Tabela pedidos NÃO existe:', error.message);
        }
        
        // Listar todas as tabelas do banco
        console.log('\n📚 Todas as tabelas do banco:');
        const tabelas = await conexao.executarConsulta('SHOW TABLES');
        console.table(tabelas);
        
    } catch (error) {
        console.error('❌ Erro ao verificar tabelas:', error);
    } finally {
        process.exit(0);
    }
}

// Executar
verificarTabelas();
