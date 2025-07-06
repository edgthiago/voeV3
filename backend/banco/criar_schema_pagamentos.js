const conexao = require('./conexao');
const fs = require('fs');
const path = require('path');

async function executarSchemaPagamentos() {
    try {
        console.log('🚀 Iniciando criação do schema de pagamentos...');
        
        // Ler o arquivo SQL
        const schemaPath = path.join(__dirname, 'schema_pagamentos.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        // Dividir em comandos individuais (por ponto e vírgula)
        const comandos = schemaSql
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
        
        console.log(`📝 Executando ${comandos.length} comandos SQL...`);
        
        // Executar cada comando
        for (let i = 0; i < comandos.length; i++) {
            const comando = comandos[i];
            
            try {
                await conexao.executarConsulta(comando);
                console.log(`✅ Comando ${i + 1}/${comandos.length} executado com sucesso`);
            } catch (erro) {
                // Ignorar erros de "já existe" ou DELIMITER
                if (erro.message.includes('already exists') || 
                    erro.message.includes('DELIMITER') ||
                    comando.includes('DELIMITER')) {
                    console.log(`⚠️ Comando ${i + 1} ignorado (já existe ou DELIMITER)`);
                } else {
                    console.error(`❌ Erro no comando ${i + 1}:`, erro.message);
                    console.log(`Comando: ${comando.substring(0, 100)}...`);
                }
            }
        }
        
        // Verificar se as tabelas foram criadas
        console.log('\n🔍 Verificando tabelas criadas...');
        
        const tabelas = await conexao.executarConsulta(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('pagamentos', 'logs_pagamentos', 'configuracoes_pagamento')
        `, [process.env.DB_NAME || 'projetofgt']);
        
        console.log('📊 Tabelas de pagamento encontradas:');
        tabelas.forEach(tabela => {
            console.log(`   ✅ ${tabela.TABLE_NAME}`);
        });
        
        // Inserir configurações padrão se não existirem
        console.log('\n⚙️ Verificando configurações padrão...');
        
        const configs = await conexao.executarConsulta(
            'SELECT COUNT(*) as total FROM configuracoes_pagamento'
        );
        
        if (configs[0].total === 0) {
            console.log('📝 Inserindo configurações padrão...');
            
            const configsPadrao = [
                ['pix_ativo', 'true', 'PIX habilitado como método de pagamento'],
                ['cartao_ativo', 'true', 'Cartão habilitado como método de pagamento'],
                ['boleto_ativo', 'false', 'Boleto habilitado como método de pagamento'],
                ['max_parcelas', '12', 'Número máximo de parcelas no cartão'],
                ['frete_gratis_valor', '199.90', 'Valor mínimo para frete grátis'],
                ['taxa_pix', '0', 'Taxa adicional para pagamento PIX (%)'],
                ['taxa_cartao', '0', 'Taxa adicional para pagamento cartão (%)'],
                ['prazo_pagamento_pix', '30', 'Prazo em minutos para pagamento PIX']
            ];
            
            for (const config of configsPadrao) {
                await conexao.executarConsulta(
                    'INSERT INTO configuracoes_pagamento (nome, valor, descricao) VALUES (?, ?, ?)',
                    config
                );
            }
            
            console.log('✅ Configurações padrão inseridas!');
        } else {
            console.log('✅ Configurações já existem!');
        }
        
        console.log('\n🎉 Schema de pagamentos criado com sucesso!');
        console.log('\n📋 Próximos passos:');
        console.log('   1. Configure o MERCADO_PAGO_ACCESS_TOKEN no .env');
        console.log('   2. Configure o MERCADO_PAGO_PUBLIC_KEY no .env');
        console.log('   3. Instale a dependência: npm install axios');
        console.log('   4. Teste o pagamento PIX na aplicação');
        
    } catch (erro) {
        console.error('❌ Erro ao executar schema:', erro);
    } finally {
        process.exit(0);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    executarSchemaPagamentos();
}

module.exports = executarSchemaPagamentos;
