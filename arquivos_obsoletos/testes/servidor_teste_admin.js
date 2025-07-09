// Servidor temporário apenas para testar admin
const path = require('path');
const dotenv = require('dotenv');

// Configurar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');

const app = express();

console.log('🔧 Iniciando servidor TESTE ADMIN...');

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

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({
    sucesso: true,
    mensagem: 'Servidor TESTE ADMIN funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rotas básicas
try {
  console.log('📁 Carregando rotas...');
  
  app.use('/api/auth', require('./rotas/autenticacao'));
  console.log('✅ Rota /api/auth carregada');
  
  app.use('/api/admin', require('./rotas/admin-simples'));
  console.log('✅ Rota /api/admin-simples carregada');

} catch (erro) {
  console.error('❌ Erro ao carregar rotas:', erro);
}

// 404
app.use('*', (req, res) => {
  res.status(404).json({
    sucesso: false,
    mensagem: 'Rota não encontrada'
  });
});

// Inicializar servidor
const iniciarServidor = async () => {
  try {
    console.log('🔍 Verificando conexão com banco...');
    
    const conexao = require('./banco/conexao');
    await conexao.executarConsulta('SELECT 1');
    console.log('✅ Conexão com banco OK');

    const PORT = 3002; // Porta diferente
    const servidor = app.listen(PORT, () => {
      console.log(`\n🚀 ===== SERVIDOR TESTE ADMIN FUNCIONANDO =====`);
      console.log(`📍 Porta: ${PORT}`);
      console.log(`🎯 URL: http://localhost:${PORT}`);
      console.log(`🔍 Health: http://localhost:${PORT}/api/health`);
      console.log(`⚙️ Admin: http://localhost:${PORT}/api/admin`);
      console.log(`===============================================\n`);
    });

    return servidor;

  } catch (erro) {
    console.error('❌ Erro ao inicializar servidor:', erro);
    process.exit(1);
  }
};

// Inicializar
if (require.main === module) {
  iniciarServidor();
}

module.exports = app;
