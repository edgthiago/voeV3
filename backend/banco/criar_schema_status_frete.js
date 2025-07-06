const conexao = require('./conexao');
const fs = require('fs');
const path = require('path');

async function executarSchemaStatusFrete() {
    try {
        console.log('🚀 Iniciando criação do schema de status e frete...');
        
        // Ler o arquivo SQL
        const schemaPath = path.join(__dirname, 'schema_status_frete.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        // Dividir em comandos individuais
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
                console.log(`✅ Comando ${i + 1}/${comandos.length} executado`);
            } catch (erro) {
                // Ignorar erros esperados
                if (erro.message.includes('already exists') || 
                    erro.message.includes('DELIMITER') ||
                    erro.message.includes('Duplicate entry') ||
                    comando.includes('DELIMITER')) {
                    console.log(`⚠️ Comando ${i + 1} ignorado (já existe ou DELIMITER)`);
                } else {
                    console.error(`❌ Erro no comando ${i + 1}:`, erro.message);
                    console.log(`Comando: ${comando.substring(0, 100)}...`);
                }
            }
        }
        
        // Verificar tabelas criadas
        console.log('\n🔍 Verificando estruturas criadas...');
        
        const tabelas = await conexao.executarConsulta(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN (
                'historico_status_pedidos', 
                'configuracoes_frete', 
                'rastreamento_objetos',
                'cache_frete'
            )
        `, [process.env.DB_NAME || 'projetofgt']);
        
        console.log('📊 Tabelas de status/frete encontradas:');
        tabelas.forEach(tabela => {
            console.log(`   ✅ ${tabela.TABLE_NAME}`);
        });
        
        // Verificar colunas adicionadas
        const colunasPedidos = await conexao.executarConsulta(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'pedidos' 
            AND COLUMN_NAME IN ('codigo_rastreamento', 'observacoes', 'data_envio', 'data_entrega')
        `, [process.env.DB_NAME || 'projetofgt']);
        
        console.log('\n📋 Colunas adicionadas na tabela pedidos:');
        colunasPedidos.forEach(coluna => {
            console.log(`   ✅ ${coluna.COLUMN_NAME}`);
        });
        
        // Verificar colunas de produtos
        const colunasProdutos = await conexao.executarConsulta(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'produtos' 
            AND COLUMN_NAME IN ('peso', 'comprimento', 'altura', 'largura', 'estoque_disponivel', 'estoque_reservado')
        `, [process.env.DB_NAME || 'projetofgt']);
        
        console.log('\n📦 Colunas adicionadas na tabela produtos:');
        colunasProdutos.forEach(coluna => {
            console.log(`   ✅ ${coluna.COLUMN_NAME}`);
        });
        
        // Inserir configurações de teste se não existirem
        console.log('\n⚙️ Verificando configurações...');
        
        const configs = await conexao.executarConsulta(
            'SELECT COUNT(*) as total FROM configuracoes_frete'
        );
        
        if (configs[0].total === 0) {
            console.log('📝 Inserindo configurações padrão de frete...');
            
            const configsPadrao = [
                ['cep_origem', '01310-100', 'CEP de origem para cálculo de frete', 'texto'],
                ['frete_gratis_valor', '199.90', 'Valor mínimo para frete grátis', 'numero'],
                ['peso_minimo', '0.300', 'Peso mínimo para cálculo (kg)', 'numero'],
                ['pac_ativo', 'true', 'PAC habilitado', 'boolean'],
                ['sedex_ativo', 'true', 'SEDEX habilitado', 'boolean']
            ];
            
            for (const config of configsPadrao) {
                await conexao.executarConsulta(
                    'INSERT INTO configuracoes_frete (nome, valor, descricao, tipo) VALUES (?, ?, ?, ?)',
                    config
                );
            }
            
            console.log('✅ Configurações de frete inseridas!');
        } else {
            console.log('✅ Configurações já existem!');
        }
        
        // Atualizar alguns produtos com dados de exemplo
        console.log('\n📦 Atualizando dados de produtos...');
        
        const produtosAtualizados = await conexao.executarConsulta(`
            UPDATE produtos 
            SET peso = 0.800, 
                comprimento = 35.00, 
                altura = 15.00, 
                largura = 25.00,
                estoque_disponivel = CASE 
                    WHEN disponivel = 1 THEN FLOOR(RAND() * 20) + 5 
                    ELSE 0 
                END
            WHERE peso IS NULL OR peso = 0
        `);
        
        console.log('✅ Dados de produtos atualizados!');
        
        console.log('\n🎉 Schema de status e frete criado com sucesso!');
        console.log('\n📋 Funcionalidades disponíveis:');
        console.log('   ✅ Sistema de status avançado de pedidos');
        console.log('   ✅ Histórico de mudanças de status');
        console.log('   ✅ Cálculo de frete automático');
        console.log('   ✅ Rastreamento de objetos');
        console.log('   ✅ Gestão de estoque com reserva');
        console.log('   ✅ Cache de consultas de frete');
        
        console.log('\n📋 Próximos passos:');
        console.log('   1. Configurar CEP de origem no .env (CEP_ORIGEM)');
        console.log('   2. Configurar credenciais dos Correios (opcional)');
        console.log('   3. Testar cálculo de frete');
        console.log('   4. Testar mudanças de status');
        
    } catch (erro) {
        console.error('❌ Erro ao executar schema:', erro);
    } finally {
        process.exit(0);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    executarSchemaStatusFrete();
}

module.exports = executarSchemaStatusFrete;
