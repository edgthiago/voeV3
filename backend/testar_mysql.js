/**
 * Script para testar conexão MySQL com senhas comuns
 */

const mysql = require('mysql2/promise');

const senhasComuns = [
    '', // Sem senha
    'root',
    '1234',
    'password',
    'admin',
    'mysql',
    '123456'
];

async function testarConexoes() {
    console.log('🔍 Testando conexões MySQL...\n');
    
    for (const senha of senhasComuns) {
        try {
            console.log(`⏳ Testando com senha: "${senha || '(vazia)'}"`);
            
            const config = {
                host: 'localhost',
                user: 'root',
                password: senha,
                database: 'projetofgt',
                port: 3306
            };
            
            const connection = await mysql.createConnection(config);
            console.log('✅ SUCESSO! Conexão estabelecida');
            console.log(`🔑 Senha correta: "${senha || '(vazia)'}"`);
            
            // Testar uma consulta simples
            const [rows] = await connection.execute('SELECT DATABASE() as db');
            console.log(`📋 Banco conectado: ${rows[0].db}`);
            
            await connection.end();
            
            // Atualizar .env com a senha correta
            const fs = require('fs');
            const path = require('path');
            const envPath = path.join(__dirname, '.env');
            
            let envContent = fs.readFileSync(envPath, 'utf8');
            envContent = envContent.replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${senha}`);
            fs.writeFileSync(envPath, envContent);
            
            console.log('📝 Arquivo .env atualizado com a senha correta');
            return senha;
            
        } catch (error) {
            console.log(`❌ Falhou: ${error.message}`);
        }
    }
    
    console.log('\n❌ Nenhuma senha funcionou. Verifique as configurações do MySQL.');
    return null;
}

if (require.main === module) {
    testarConexoes()
        .then(senha => {
            if (senha !== null) {
                console.log('\n🎉 Conexão MySQL configurada com sucesso!');
                process.exit(0);
            } else {
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('\n💥 Erro:', error);
            process.exit(1);
        });
}

module.exports = { testarConexoes };
