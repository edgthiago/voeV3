// Servidor mínimo para teste de backend real
const path = require('path');
const dotenv = require('dotenv');

// Configurar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');

const app = express();

console.log('🔧 Iniciando servidor mínimo...');

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

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({
    sucesso: true,
    mensagem: 'Backend real funcionando',
    timestamp: new Date().toISOString(),
    versao: '1.0.0'
  });
});

// Rota de login básica para teste
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    console.log(`🔑 Tentativa de login: ${email}`);
    
    // Verificar conexão com banco
    const conexao = require('./banco/conexao');
    
    // Buscar usuário
    const usuarios = await conexao.executarConsulta(
      'SELECT * FROM usuarios WHERE email = ? AND status = ?',
      [email, 'ativo']
    );
    
    if (usuarios.length === 0) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Credenciais inválidas'
      });
    }
    
    const usuario = usuarios[0];
    
    // Verificar senha
    const bcrypt = require('bcryptjs');
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    
    if (!senhaValida) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Credenciais inválidas'
      });
    }
    
    // Gerar token JWT
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        userId: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo_usuario 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log(`✅ Login realizado com sucesso: ${email}`);
    
    res.json({
      sucesso: true,
      mensagem: 'Login realizado com sucesso',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo_usuario
      }
    });
    
  } catch (erro) {
    console.error('❌ Erro no login:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor'
    });
  }
});

// Rota de produtos básica
app.get('/api/produtos', async (req, res) => {
  try {
    console.log('📦 Buscando produtos...');
    
    const conexao = require('./banco/conexao');
    const produtos = await conexao.executarConsulta(`
      SELECT 
        id, nome, descricao, preco_atual, preco_antigo,
        categoria, marca, imagem, 
        quantidade_estoque, disponivel, avaliacao, total_avaliacoes
      FROM produtos 
      WHERE disponivel = 1 
      ORDER BY nome
      LIMIT 20
    `);
    
    console.log(`✅ ${produtos.length} produtos encontrados`);
    
    res.json({
      sucesso: true,
      dados: produtos
    });
    
  } catch (erro) {
    console.error('❌ Erro ao buscar produtos:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar produtos'
    });
  }
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  res.status(500).json({
    sucesso: false,
    mensagem: 'Erro interno do servidor'
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
      console.log(`\n🚀 ===== BACKEND REAL MÍNIMO FUNCIONANDO =====`);
      console.log(`📍 Porta: ${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🎯 URL: http://localhost:${PORT}`);
      console.log(`📋 API: http://localhost:${PORT}/api`);
      console.log(`🔍 Health: http://localhost:${PORT}/api/health`);
      console.log(`🔑 Login: POST http://localhost:${PORT}/api/auth/login`);
      console.log(`📦 Produtos: GET http://localhost:${PORT}/api/produtos`);
      console.log(`==============================================\n`);
    });

    return servidor;

  } catch (erro) {
    console.error('❌ Erro ao inicializar servidor:', erro);
    process.exit(1);
  }
};

// Inicializar se executado diretamente
if (require.main === module) {
  iniciarServidor();
}

module.exports = app;
