// Script para verificar estrutura do banco
const conexao = require('./banco/conexao');

async function verificarEstrutura() {
    try {
        console.log('🔍 Verificando estrutura do banco...\n');
        
        // Verificar tabelas existentes
        console.log('📋 Tabelas existentes:');
        const tabelas = await conexao.executarConsulta('SHOW TABLES');
        console.log(tabelas);
        
        console.log('\n👤 Estrutura da tabela usuarios:');
        try {
            const estruturaUsuarios = await conexao.executarConsulta('DESCRIBE usuarios');
            console.log(estruturaUsuarios);
        } catch (erro) {
            console.log('❌ Tabela usuarios não existe:', erro.message);
        }
        
        console.log('\n📦 Estrutura da tabela produtos:');
        try {
            const estruturaProdutos = await conexao.executarConsulta('DESCRIBE produtos');
            console.log(estruturaProdutos);
        } catch (erro) {
            console.log('❌ Tabela produtos não existe:', erro.message);
        }
        
        console.log('\n👤 Dados da tabela usuarios (primeiros 3):');
        try {
            const usuarios = await conexao.executarConsulta('SELECT * FROM usuarios LIMIT 3');
            console.log(usuarios);
        } catch (erro) {
            console.log('❌ Erro ao buscar usuários:', erro.message);
        }
        
    } catch (erro) {
        console.error('❌ Erro:', erro);
    }
    
    process.exit(0);
}

verificarEstrutura();
