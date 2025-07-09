// Servidor básico para desenvolvimento
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const app = express();

// Middleware básico
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logs
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Rotas básicas de teste
app.get('/', (req, res) => {
    res.json({
        message: 'Backend E-commerce FGT - Modo Desenvolvimento',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        sucesso: true,
        mensagem: 'API funcionando corretamente',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/produtos', async (req, res) => {
    try {
        const conexao = require('./banco/conexao');
        const produtos = await conexao.executarConsulta('SELECT * FROM produtos LIMIT 10');
        res.json({
            sucesso: true,
            dados: produtos
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar produtos'
        });
    }
});

app.get('/api/monitoring/status', (req, res) => {
    res.json({
        success: true,
        data: {
            system: {
                status: 'healthy',
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            }
        }
    });
});

// Rota de autenticação básica
app.get('/api/auth/me', (req, res) => {
    res.json({
        sucesso: false,
        mensagem: 'Token não fornecido ou inválido'
    });
});

app.post('/api/auth/login', (req, res) => {
    res.json({
        sucesso: false,
        mensagem: 'Função de login não implementada no servidor básico'
    });
});

app.post('/api/auth/registrar', (req, res) => {
    res.json({
        sucesso: false,
        mensagem: 'Função de registro não implementada no servidor básico'
    });
});

// Middleware de erro 404
app.use((req, res) => {
    res.status(404).json({
        sucesso: false,
        mensagem: 'Rota não encontrada'
    });
});

// Função para inicializar
const iniciarServidor = async () => {
    try {
        console.log('🔧 Iniciando servidor básico...');

        // Testar conexão com banco
        console.log('🔍 Testando conexão com banco...');
        const conexao = require('./banco/conexao');
        await conexao.executarConsulta('SELECT 1');
        console.log('✅ Conexão com banco OK');

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`\n🚀 ===== SERVIDOR BÁSICO INICIADO =====`);
            console.log(`📍 Porta: ${PORT}`);
            console.log(`🎯 URL: http://localhost:${PORT}`);
            console.log(`📋 API: http://localhost:${PORT}/api`);
            console.log(`🔍 Health: http://localhost:${PORT}/api/health`);
            console.log(`📦 Produtos: http://localhost:${PORT}/api/produtos`);
            console.log(`=====================================\n`);
        });

    } catch (erro) {
        console.error('❌ Erro ao inicializar:', erro);
        process.exit(1);
    }
};

// Inicializar servidor
if (require.main === module) {
    iniciarServidor();
}

module.exports = app;
