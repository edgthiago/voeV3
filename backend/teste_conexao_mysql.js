/**
 * @fileoverview Script para testar conexão com MySQL
 * @description Testa diferentes configurações de senha
 */

const mysql = require('mysql2/promise');

async function testarConexao() {
    const configuracoesTeste = [
        { password: '', desc: 'sem senha' },
        { password: 'root', desc: 'senha: root' },
        { password: '1234', desc: 'senha: 1234' },
        { password: '', desc: 'sem senha (admin user)' }
    ];

    console.log('🔍 Testando diferentes configurações de MySQL...\n');

    for (const config of configuracoesTeste) {
        try {
            console.log(`Testando ${config.desc}...`);
            
            const conexao = await mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: config.password,
                port: 3306
            });

            console.log(`✅ Conectado com ${config.desc}!`);
            
            // Listar bancos de dados
            const [bancos] = await conexao.execute('SHOW DATABASES');
            console.log('📋 Bancos encontrados:');
            bancos.forEach(banco => {
                console.log(`   - ${banco.Database}`);
            });

            // Verificar se o banco projetofgt existe
            const bancoProjeto = bancos.find(b => b.Database === 'projetofgt');
            if (bancoProjeto) {
                console.log(`✅ Banco 'projetofgt' encontrado!`);
            } else {
                console.log(`⚠️ Banco 'projetofgt' não encontrado. Será necessário criar.`);
            }

            await conexao.end();
            
            // Se chegou aqui, a configuração funcionou
            console.log(`\n🎉 Configuração que funciona: ${config.desc}`);
            console.log(`DB_PASSWORD=${config.password}`);
            
            return config;

        } catch (error) {
            console.log(`❌ Falhou com ${config.desc}: ${error.message}`);
        }
    }

    console.log('\n💥 Nenhuma configuração funcionou!');
    return null;
}

testarConexao()
    .then(config => {
        if (config) {
            process.exit(0);
        } else {
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        process.exit(1);
    });
