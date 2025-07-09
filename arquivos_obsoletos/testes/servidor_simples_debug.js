// Servidor simples para debug - sem monitoramento e sistemas complexos
const path = require('path');
const dotenv = require('dotenv');

// Configurar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');

const app = express();

console.log('🔧 Iniciando servidor simplificado...');

// CORS - PERMITIR TODAS AS ORIGENS PARA TESTES
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

// Log requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// Middleware de autenticação simplificado
app.use(async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.usuario = { id: decoded.userId };
      console.log(`👤 Usuário autenticado: ${decoded.userId}`);
    } catch (erro) {
      console.log(`❌ Token inválido: ${erro.message}`);
    }
  }
  next();
});

// Rotas principais - uma por vez para testar
try {
  console.log('📁 Carregando rotas...');
  
  // Rota de saúde primeiro
  app.get('/api/health', (req, res) => {
    res.json({
      sucesso: true,
      mensagem: 'API funcionando corretamente',
      timestamp: new Date().toISOString(),
      versao: '1.0.0'
    });
  });
  
  console.log('✅ Rota /api/health carregada');

  // Carregar rotas básicas
  app.use('/api/auth', require('./rotas/autenticacao'));
  console.log('✅ Rota /api/auth carregada');
  
  app.use('/api/produtos', require('./rotas/produtos'));
  console.log('✅ Rota /api/produtos carregada');
  
  app.use('/api/usuarios', require('./rotas/usuarios'));
  console.log('✅ Rota /api/usuarios carregada');

} catch (erro) {
  console.error('❌ Erro ao carregar rotas:', erro);
}

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  res.status(500).json({
    sucesso: false,
    mensagem: 'Erro interno do servidor',
    erro: err.message
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

    // Iniciar servidor
    const PORT = process.env.PORT || 3001;
    const servidor = app.listen(PORT, () => {
      console.log(`\n🚀 ===== SERVIDOR SIMPLIFICADO FUNCIONANDO =====`);
      console.log(`📍 Porta: ${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🎯 URL: http://localhost:${PORT}`);
      console.log(`📋 API: http://localhost:${PORT}/api`);
      console.log(`🔍 Health: http://localhost:${PORT}/api/health`);
      console.log(`===============================================\n`);
    });

    return servidor;

  } catch (erro) {
    console.error('❌ Erro ao inicializar servidor:', erro);
    process.exit(1);
  }
};

// Tratar erros
process.on('uncaughtException', (err) => {
  console.error('❌ Erro não capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Promise rejeitada:', reason);
  process.exit(1);
});

// Inicializar se executado diretamente
if (require.main === module) {
  iniciarServidor();
}

module.exports = app;
