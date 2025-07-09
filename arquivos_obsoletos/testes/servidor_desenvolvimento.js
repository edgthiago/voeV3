// Dependências básicas
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Configurar aplicação
const app = express();

// Middleware básico
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logs simples
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Middleware de autenticação opcional
app.use(async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const Usuario = require('./modelos/Usuario');
            
            const usuario = await Usuario.buscarPorId(decoded.userId);
            if (usuario && usuario.ativo) {
                req.usuario = usuario;
            }
        } catch (erro) {
            // Token inválido - continua sem usuário
        }
    }
    next();
});

// Rotas da API
app.use('/api/usuarios', require('./rotas/usuarios'));
app.use('/api/produtos', require('./rotas/produtos'));
app.use('/api/auth', require('./rotas/autenticacao'));
app.use('/api/carrinho', require('./rotas/carrinho'));
app.use('/api/pedidos', require('./rotas/pedidos'));
app.use('/api/frete', require('./rotas/status-frete'));
app.use('/api/pagamentos', require('./rotas/pagamentos'));
app.use('/api/notificacoes', require('./rotas/notificacoes'));
app.use('/api/promocoes', require('./rotas/promocoes'));
app.use('/api/comentarios', require('./rotas/comentarios'));
app.use('/api/admin', require('./rotas/admin'));

// Rotas de monitoramento simples
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

app.get('/api/monitoring/metrics', (req, res) => {
    const memUsage = process.memoryUsage();
    res.json({
        success: true,
        data: {
            system: {
                status: 'healthy',
                uptime: process.uptime(),
                memoryUsage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
                memoryUsed: memUsage.heapUsed,
                memoryTotal: memUsage.heapTotal
            },
            timestamp: new Date().toISOString()
        }
    });
});

// Rota de saúde
app.get('/api/health', (req, res) => {
    res.json({
        sucesso: true,
        mensagem: 'API funcionando corretamente',
        timestamp: new Date().toISOString(),
        versao: '1.0.0'
    });
});

// Rota de informações
app.get('/api/info', (req, res) => {
    res.json({
        sucesso: true,
        dados: {
            nome: 'API Loja de Tênis FGT',
            versao: '1.0.0',
            ambiente: process.env.NODE_ENV || 'development'
        }
    });
});

// Middleware de erro 404
app.use((req, res) => {
    res.status(404).json({
        sucesso: false,
        mensagem: 'Rota não encontrada'
    });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro:', err);
    res.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno do servidor'
    });
});

// Função para inicializar o servidor
const iniciarServidor = async () => {
    try {
        console.log('🔧 Iniciando servidor...');

        // Verificar conexão com banco
        console.log('🔍 Verificando conexão com banco...');
        const conexao = require('./banco/conexao');
        await conexao.executarConsulta('SELECT 1');
        console.log('✅ Conexão com banco OK');

        // Desativar promoções expiradas
        console.log('🔍 Verificando promoções expiradas...');
        const PromocaoRelampago = require('./modelos/PromocaoRelampago');
        await PromocaoRelampago.desativarExpiradas();
        console.log('✅ Promoções expiradas verificadas');

        // Iniciar servidor
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`\n🚀 ===== SERVIDOR INICIADO COM SUCESSO =====`);
            console.log(`📍 Porta: ${PORT}`);
            console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🎯 URL: http://localhost:${PORT}`);
            console.log(`📋 API: http://localhost:${PORT}/api`);
            console.log(`🔍 Health: http://localhost:${PORT}/api/health`);
            console.log(`===========================================\n`);
        });

    } catch (erro) {
        console.error('❌ Erro ao inicializar servidor:', erro);
        process.exit(1);
    }
};

// Inicializar servidor
if (require.main === module) {
    iniciarServidor();
}

module.exports = app;
