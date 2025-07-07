// Carregar variáveis de ambiente PRIMEIRO
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// 📊 Importar sistema de logs avançado
const { logger, loggers } = require('./services/loggerService');
const { 
    requestLoggingMiddleware, 
    errorLoggingMiddleware, 
    securityLoggingMiddleware,
    businessLoggingMiddleware
} = require('./middleware/logging');

// ⚠️  ATENÇÃO: MODO DE TESTE ATIVO ⚠️ 
// Mecanismos de segurança DESABILITADOS para facilitar testes
// CORS, Rate Limiting, Helmet e Compression estão desativados
// NÃO usar em produção!

const app = express();

// 📝 Middleware de logging - SEMPRE ATIVO
app.use(requestLoggingMiddleware);
app.use(securityLoggingMiddleware);
app.use(businessLoggingMiddleware);

// Middleware de segurança - DESABILITADO PARA TESTES
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
//       fontSrc: ["'self'", "https://fonts.gstatic.com"],
//       imgSrc: ["'self'", "data:", "https:"],
//       scriptSrc: ["'self'", "'unsafe-inline'"],
//       scriptSrcAttr: ["'unsafe-inline'"],
//       connectSrc: ["'self'"],
//     },
//   },
// }));

// CORS - PERMITIR TODAS AS ORIGENS PARA TESTES
app.use(cors({
  origin: true, // Permite todas as origens
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

// Rate limiting - DESABILITADO PARA TESTES
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutos
//   max: 100, // máximo 100 requests por IP
//   message: {
//     sucesso: false,
//     mensagem: 'Muitas tentativas. Tente novamente em 15 minutos.'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutos
//   max: 5, // máximo 5 tentativas de login por IP
//   message: {
//     sucesso: false,
//     mensagem: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// app.use('/api/', limiter);
// app.use('/api/auth/login', authLimiter);

// Middleware de compressão - DESABILITADO PARA TESTES
// app.use(compression());

// Logging - SIMPLIFICADO PARA TESTES
// app.use(morgan('combined'));

// Parse JSON
// Parse JSON with debug
// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Log request bodies after parsing
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`📥 Requisição ${req.method} ${req.url}`);
    if (Object.keys(req.body).length > 0) {
      console.log(`📦 Corpo da requisição:`, req.body);
    }  }
  next();
});

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos
app.use('/imagens', express.static(path.join(__dirname, 'public', 'imagens')));

// Middleware para adicionar função de log
app.use((req, res, next) => {
  req.logAcao = async (acao, detalhes = {}) => {    try {
      const conexao = require('./banco/conexao');
      await conexao.executarConsulta(
        'INSERT INTO logs_sistema (usuario_id, acao, detalhes, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
        [
          req.usuario?.id || null,
          acao,
          JSON.stringify(detalhes),
          req.ip || req.connection.remoteAddress,
          req.get('User-Agent') || ''
        ]
      );
    } catch (erro) {
      console.error('Erro ao registrar log:', erro);
    }
  };
  next();
});

// Middleware opcional de autenticação para rotas públicas
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
app.use('/api/produtos', require('./rotas/produtos'));
app.use('/api/auth', require('./rotas/autenticacao'));
app.use('/api/carrinho', require('./rotas/carrinho'));
app.use('/api/pedidos', require('./rotas/pedidos'));
app.use('/api/pedidos', require('./rotas/status-frete'));
app.use('/api/pagamentos', require('./rotas/pagamentos'));
app.use('/api/notificacoes', require('./rotas/notificacoes'));
app.use('/api/promocoes', require('./rotas/promocoes'));
app.use('/api/comentarios', require('./rotas/comentarios'));
app.use('/api/admin', require('./rotas/admin'));
app.use('/api/admin/metrics', require('./rotas/admin-metrics'));
app.use('/api/upgrade', require('./rotas/upgrade'));
app.use('/api/logs', require('./rotas/logs')); // Nova rota de logs

// Servir dashboard de testes
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../dashboard_teste.html'));
});

// Servir dashboard simples
app.get('/teste', (req, res) => {
  res.sendFile(path.join(__dirname, '../dashboard_simples.html'));
});

// Servir dashboard de debug
app.get('/debug', (req, res) => {
  res.sendFile(path.join(__dirname, '../debug_dashboard.html'));
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

// Rota de informações da API
app.get('/api/info', (req, res) => {
  res.json({
    sucesso: true,
    dados: {
      nome: 'API Loja de Tênis FGT',
      versao: '1.0.0',
      descricao: 'Backend completo para loja de tênis com sistema de autenticação e diferentes níveis de acesso',      endpoints: {
        produtos: '/api/produtos',
        autenticacao: '/api/auth',
        carrinho: '/api/carrinho',
        pedidos: '/api/pedidos',
        promocoes: '/api/promocoes',
        admin: '/api/admin'
      },
      niveis_acesso: [
        'visitante - apenas visualização de produtos',
        'usuario - carrinho e compras',
        'colaborador - gerenciar produtos e estoque',
        'supervisor - criar e gerenciar promoções relâmpago',
        'diretor - acesso total e logs do sistema'
      ],
      recursos: [
        'Sistema de autenticação JWT',
        'Diferentes níveis de permissão',
        'Carrinho de compras',
        'Promoções relâmpago',
        'Sistema de logs para LGPD',
        'Rate limiting e segurança',
        'Exportação de dados pessoais (LGPD)',
        'Dashboard administrativo'
      ]
    }
  });
});

// Middleware de tratamento de erros 404
app.use('*', (req, res) => {
  res.status(404).json({
    sucesso: false,
    mensagem: 'Endpoint não encontrado',
    endpoint_solicitado: req.originalUrl,
    metodo: req.method,    endpoints_disponiveis: [
      'GET /api/health',
      'GET /api/info',
      'GET /api/produtos',
      'POST /api/auth/registrar',
      'POST /api/auth/login',
      'GET /api/carrinho',
      'GET /api/promocoes',
      'GET /api/comentarios/produtos/:id/comentarios',
      'POST /api/comentarios/produtos/:id/comentarios',
      'GET /api/admin/dashboard'
    ]
  });
});

// Middleware de tratamento de erros - ÚLTIMA MIDDLEWARE
app.use(errorLoggingMiddleware);

// Middleware de tratamento de erro global
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';
  
  // Log do erro
  loggers.api.error('Global error handler', {
    error: {
      message: err.message,
      stack: err.stack,
      code: err.code || 'UNKNOWN'
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      userId: req.usuario?.id,
      ip: req.ip
    }
  });

  // Resposta para o cliente
  res.status(statusCode).json({
    sucesso: false,
    mensagem: process.env.NODE_ENV === 'development' ? message : 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  loggers.api.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });
  
  res.status(404).json({
    sucesso: false,
    mensagem: 'Rota não encontrada'
  });
});

// Função para inicializar o servidor
const iniciarServidor = async () => {
  try {
    // Log de inicialização
    logger.info('Starting server', {
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5000
    });

    // Verificar conexão com banco
    const conexao = require('./banco/conexao');
    await conexao.executarConsulta('SELECT 1');
    
    logger.info('Database connection established', {
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_DATABASE || 'loja_tenis_fgt'
    });

    // Desativar promoções expiradas ao iniciar
    const PromocaoRelampago = require('./modelos/PromocaoRelampago');
    await PromocaoRelampago.desativarExpiradas();
    logger.info('Expired promotions deactivated');

    // Iniciar servidor
    const PORT = process.env.PORT || 5000;
    const servidor = app.listen(PORT, () => {
      logger.info('Server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
      
      console.log(`\n🚀 ===== SERVIDOR INICIADO COM SUCESSO =====`);
      console.log(`📍 Porta: ${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`� Logs: Sistema avançado ativo`);
      console.log(`🔒 Segurança: Modo teste (desenvolvimento)`);
      console.log(`📱 Cache: Sistema Redis/Memory ativo`);
      console.log(`🎯 URL: http://localhost:${PORT}`);
      console.log(`📋 API: http://localhost:${PORT}/api`);
      console.log(`📊 Logs: http://localhost:${PORT}/api/logs`);
      console.log(`🔍 Health: http://localhost:${PORT}/api/health`);
      console.log(`===========================================\n`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📝 Logs detalhados habilitados');
      }
    });

  } catch (erro) {
    logger.error('Server initialization failed', {
      error: {
        message: erro.message,
        stack: erro.stack
      }
    });
    
    console.error('❌ Erro ao inicializar servidor:', erro);
    process.exit(1);
  }
};

// Verificar promoções expiradas periodicamente (a cada hora)
setInterval(async () => {
  try {
    const PromocaoRelampago = require('./modelos/PromocaoRelampago');
    const promocoesDesativadas = await PromocaoRelampago.desativarExpiradas();
    if (promocoesDesativadas > 0) {
      console.log(`⏰ ${promocoesDesativadas} promoções expiradas foram desativadas automaticamente`);
    }
  } catch (erro) {
    console.error('Erro ao verificar promoções expiradas:', erro);
  }
}, 60 * 60 * 1000); // 1 hora

// Tratar erros não capturados
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', {
    error: {
      message: err.message,
      stack: err.stack
    }
  });
  console.error('❌ Erro não capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', {
    reason: reason,
    promise: promise
  });
  console.error('❌ Promise rejeitada não tratada:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  console.log('🛑 Recebido SIGTERM, encerrando servidor graciosamente...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  console.log('🛑 Recebido SIGINT, encerrando servidor graciosamente...');
  process.exit(0);
});

// Inicializar servidor se este arquivo for executado diretamente
if (require.main === module) {
  iniciarServidor();
}

module.exports = app;
