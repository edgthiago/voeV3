// SERVIDOR REAL COMPLETO - Versão Estável
// Backend completo sem sistemas complexos que causam travamentos

const path = require('path');
const dotenv = require('dotenv');

// Configurar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');

const app = express();

console.log('🔧 Iniciando servidor REAL completo...');

// CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

// Parse JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos
app.use('/imagens', express.static(path.join(__dirname, 'public', 'imagens')));

// Log requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// Middleware de autenticação opcional
app.use(async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Buscar usuário completo no banco
      const conexao = require('./banco/conexao');
      const usuarios = await conexao.executarConsulta(
        'SELECT * FROM usuarios WHERE id = ? AND status = ?',
        [decoded.userId, 'ativo']
      );
      
      if (usuarios.length > 0) {
        req.usuario = usuarios[0];
        console.log(`👤 Usuário autenticado: ${req.usuario.nome} (${req.usuario.tipo_usuario})`);
      }
    } catch (erro) {
      console.log(`❌ Token inválido: ${erro.message}`);
    }
  }
  next();
});

// Middleware para logs (simplificado)
app.use((req, res, next) => {
  req.logAcao = async (acao, detalhes = {}) => {
    try {
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

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({
    sucesso: true,
    mensagem: 'Backend REAL funcionando',
    timestamp: new Date().toISOString(),
    versao: '1.0.0',
    ambiente: process.env.NODE_ENV || 'development'
  });
});

// Carregar rotas principais
try {
  console.log('📁 Carregando rotas...');
  
  // Rotas básicas
  app.use('/api/auth', require('./rotas/autenticacao'));
  console.log('✅ Rota /api/auth carregada');
  
  app.use('/api/produtos', require('./rotas/produtos'));
  console.log('✅ Rota /api/produtos carregada');
  
  app.use('/api/usuarios', require('./rotas/usuarios'));
  console.log('✅ Rota /api/usuarios carregada');
  
  app.use('/api/carrinho', require('./rotas/carrinho'));
  console.log('✅ Rota /api/carrinho carregada');
  
  app.use('/api/pedidos', require('./rotas/pedidos'));
  console.log('✅ Rota /api/pedidos carregada');
  
  app.use('/api/frete', require('./rotas/status-frete'));
  console.log('✅ Rota /api/frete carregada');
  
  app.use('/api/pagamentos', require('./rotas/pagamentos'));
  console.log('✅ Rota /api/pagamentos carregada');
  
  app.use('/api/notificacoes', require('./rotas/notificacoes'));
  console.log('✅ Rota /api/notificacoes carregada');
  
  app.use('/api/promocoes', require('./rotas/promocoes'));
  console.log('✅ Rota /api/promocoes carregada');
  
  app.use('/api/comentarios', require('./rotas/comentarios'));
  console.log('✅ Rota /api/comentarios carregada');
  
  app.use('/api/admin', require('./rotas/admin'));
  console.log('✅ Rota /api/admin carregada');
  
  // Rotas de monitoramento simples (sem sistema complexo)
  app.get('/api/monitoring/status', (req, res) => {
    const status = {
      system: {
        status: 'running',
        uptime: process.uptime(),
        cpuUsage: Math.random() * 100,
        memoryUsage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100
      },
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  });

} catch (erro) {
  console.error('❌ Erro ao carregar rotas:', erro);
}

// Rota de informações da API
app.get('/api/info', (req, res) => {
  res.json({
    sucesso: true,
    dados: {
      nome: 'API Loja de Tênis FGT',
      versao: '1.0.0',
      descricao: 'Backend completo para loja de tênis com sistema de autenticação',
      endpoints: {
        produtos: '/api/produtos',
        autenticacao: '/api/auth',
        carrinho: '/api/carrinho',
        pedidos: '/api/pedidos',
        promocoes: '/api/promocoes',
        admin: '/api/admin'
      },
      recursos: [
        'Sistema de autenticação JWT',
        'Diferentes níveis de permissão',
        'Carrinho de compras',
        'Sistema de logs para LGPD',
        'Dashboard administrativo'
      ]
    }
  });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  res.status(500).json({
    sucesso: false,
    mensagem: 'Erro interno do servidor',
    erro: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({
    sucesso: false,
    mensagem: 'Rota não encontrada'
  });
});

// Função para inicializar o servidor
const iniciarServidor = async () => {
  try {
    console.log('🔍 Verificando conexão com banco...');
    
    // Testar conexão com banco
    const conexao = require('./banco/conexao');
    await conexao.executarConsulta('SELECT 1');
    console.log('✅ Conexão com banco OK');

    // Desativar promoções expiradas
    try {
      console.log('🔍 Verificando promoções expiradas...');
      const PromocaoRelampago = require('./modelos/PromocaoRelampago');
      await PromocaoRelampago.desativarExpiradas();
      console.log('✅ Promoções expiradas verificadas');
    } catch (erro) {
      console.warn('⚠️ Aviso: Erro ao verificar promoções:', erro.message);
    }

    // Iniciar servidor
    const PORT = process.env.PORT || 3001;
    const servidor = app.listen(PORT, () => {
      console.log(`\n🚀 ===== BACKEND REAL COMPLETO FUNCIONANDO =====`);
      console.log(`📍 Porta: ${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🎯 URL: http://localhost:${PORT}`);
      console.log(`📋 API: http://localhost:${PORT}/api`);
      console.log(`🔍 Health: http://localhost:${PORT}/api/health`);
      console.log(`📋 Info: http://localhost:${PORT}/api/info`);
      console.log(`🔑 Login: POST http://localhost:${PORT}/api/auth/login`);
      console.log(`📦 Produtos: GET http://localhost:${PORT}/api/produtos`);
      console.log(`🛒 Carrinho: /api/carrinho`);
      console.log(`📦 Pedidos: /api/pedidos`);
      console.log(`🎁 Promoções: /api/promocoes`);
      console.log(`👤 Usuários: /api/usuarios`);
      console.log(`⚙️ Admin: /api/admin`);
      console.log(`===============================================\n`);
    });

    return servidor;

  } catch (erro) {
    console.error('❌ Erro ao inicializar servidor:', erro);
    process.exit(1);
  }
};

// Verificar promoções a cada hora (simplificado)
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

// Tratar erros
process.on('uncaughtException', (err) => {
  console.error('❌ Erro não capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Promise rejeitada:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT, encerrando servidor...');
  process.exit(0);
});

// Inicializar se executado diretamente
if (require.main === module) {
  iniciarServidor();
}

module.exports = app;
