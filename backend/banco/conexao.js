// Configuração de conexão com MySQL
// Arquivo: conexao.js

// Carregar variáveis de ambiente
require('dotenv').config();

const mysql = require('mysql2/promise');

// Validação básica de segurança
const validarConfiguracao = () => {
    // Em desenvolvimento, DB_PASSWORD pode estar vazia
    if (process.env.NODE_ENV === 'production') {
        const obrigatorios = ['DB_PASSWORD'];
        const faltando = obrigatorios.filter(env => !process.env[env] && process.env[env] !== '');
        
        if (faltando.length > 0) {
            console.error(`❌ ERRO CRÍTICO: Configure no arquivo .env: ${faltando.join(', ')}`);
            console.error('📋 Exemplo: DB_PASSWORD=sua_senha_real');
            process.exit(1);
        }
    }
};

// Executar validação
validarConfiguracao();

const configuracaoBanco = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '', // ✅ Permitir senha vazia em desenvolvimento
    database: process.env.DB_NAME || 'projetofgt',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    timezone: '-03:00' // Horário de Brasília
};

class ConexaoBanco {
    constructor() {
        this.pool = mysql.createPool(configuracaoBanco);
        this.testarConexao();
    }

    async testarConexao() {
        try {
            const conexao = await this.pool.getConnection();
            console.log('✅ Conectado ao MySQL - Papelaria Digital!');
            conexao.release();
        } catch (erro) {
            console.error('❌ Erro ao conectar ao MySQL:', erro.message);
            process.exit(1);
        }
    }    async executarConsulta(sql, parametros = []) {
        try {
            // Usando query() ao invés de execute() para resolver problema com prepared statements
            const [resultados] = await this.pool.query(sql, parametros);
            return resultados;
        } catch (erro) {
            console.error('❌ Erro na consulta MySQL:', erro.message);
            console.error('📝 SQL:', sql);
            console.error('🔧 Parâmetros:', parametros);
            throw erro;
        }
    }

    async executarTransaction(operacoes) {
        const conexao = await this.pool.getConnection();
        
        try {
            await conexao.beginTransaction();
            
            const resultados = [];
            for (const operacao of operacoes) {
                const [resultado] = await conexao.execute(operacao.sql, operacao.parametros || []);
                resultados.push(resultado);
            }
            
            await conexao.commit();
            return resultados;
            
        } catch (erro) {
            await conexao.rollback();
            console.error('❌ Erro na transação:', erro.message);
            throw erro;
        } finally {
            conexao.release();
        }
    }

    async obterEstatisticas() {
        try {            const consultas = {
                totalProdutos: 'SELECT COUNT(*) as total FROM produtos WHERE disponivel = 1',
                totalUsuarios: 'SELECT COUNT(*) as total FROM usuarios WHERE tipo_usuario = "usuario"',
                totalPedidos: 'SELECT COUNT(*) as total FROM pedidos WHERE DATE(data_pedido) = CURDATE()',
                promocoesAtivas: 'SELECT COUNT(*) as total FROM promocoes_relampago WHERE ativo = 1 AND data_fim >= NOW()'
            };

            const resultados = {};
            for (const [chave, sql] of Object.entries(consultas)) {
                const resultado = await this.executarConsulta(sql);
                resultados[chave] = resultado[0].total;
            }

            return resultados;
        } catch (erro) {
            console.error('❌ Erro ao obter estatísticas:', erro);
            throw erro;
        }
    }

    // Método para health check
    async verificarSaude() {
        try {
            // Teste simples de conexão
            const result = await this.executarConsulta('SELECT 1 as status');
            
            if (result && result.length > 0 && result[0].status === 1) {
                return {
                    status: 'healthy',
                    message: 'Database connection is working',
                    timestamp: new Date().toISOString()
                };
            } else {
                return {
                    status: 'unhealthy',
                    message: 'Database query returned unexpected result',
                    timestamp: new Date().toISOString()
                };
            }
        } catch (erro) {
            console.error('❌ Health check failed:', erro.message);
            return {
                status: 'unhealthy',
                message: `Database error: ${erro.message}`,
                timestamp: new Date().toISOString()
            };
        }
    }

    async fecharConexao() {
        try {
            await this.pool.end();
            console.log('🔒 Conexão com MySQL fechada');
        } catch (erro) {
            console.error('❌ Erro ao fechar conexão:', erro);
        }
    }
}

// Instância única da conexão
const bancoDados = new ConexaoBanco();

// Fechar conexão quando a aplicação for encerrada
process.on('SIGINT', async () => {
    console.log('\n🛑 Encerrando aplicação...');
    await bancoDados.fecharConexao();
    process.exit(0);
});

module.exports = bancoDados;
