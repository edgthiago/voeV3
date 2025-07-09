// Servidor simplificado com foco em monitoramento
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware básico
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log de requisições
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// ==================== ROTAS DE MONITORAMENTO ====================
// Rota de status do sistema
app.get('/api/monitoring/status', (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const status = {
      system: {
        status: 'running',
        uptime: Math.floor(process.uptime()),
        cpuUsage: Math.round(Math.random() * 100),
        memoryUsage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
        memoryUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        memoryTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        diskUsage: Math.round(Math.random() * 100),
        nodeVersion: process.version,
        platform: process.platform
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 Status solicitado:', status);
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao obter status:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    });
  }
});

// Rota de métricas do sistema
app.get('/api/monitoring/metrics', (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const metrics = {
      system: {
        status: 'healthy',
        uptime: Math.floor(process.uptime()),
        cpuUsage: Math.round(Math.random() * 100),
        memoryUsage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
        memoryUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        memoryTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        diskUsage: Math.round(Math.random() * 100)
      },
      application: {
        requestsPerSecond: Math.round(Math.random() * 10),
        totalRequests: Math.floor(Math.random() * 10000),
        errorRate: Math.round(Math.random() * 5 * 100) / 100,
        responseTime: Math.round(Math.random() * 200),
        activeConnections: Math.floor(Math.random() * 100)
      },
      database: {
        status: 'connected',
        activeConnections: Math.floor(Math.random() * 20),
        queryTime: Math.round(Math.random() * 50),
        totalQueries: Math.floor(Math.random() * 1000)
      },
      alerts: generateAlerts()
    };
    
    console.log('📊 Métricas solicitadas:', metrics);
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao obter métricas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    });
  }
});

// Rota de alertas
app.get('/api/monitoring/alerts', (req, res) => {
  try {
    const alerts = generateAlerts();
    console.log('🚨 Alertas solicitados:', alerts);
    res.json({
      success: true,
      data: alerts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao obter alertas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    });
  }
});

// Rota de logs
app.get('/api/monitoring/logs', (req, res) => {
  try {
    const logs = generateLogs();
    console.log('📝 Logs solicitados:', logs.length, 'entradas');
    res.json({
      success: true,
      data: logs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao obter logs:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    });
  }
});

// Rota de controle de serviços
app.post('/api/monitoring/services/:action', (req, res) => {
  try {
    const { action } = req.params;
    const { service } = req.body;
    
    console.log(`🔧 Ação de serviço: ${action} para ${service}`);
    
    const result = {
      action,
      service,
      status: 'success',
      message: `Serviço ${service} ${action} executado com sucesso`,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao controlar serviço:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== ROTAS BÁSICAS ====================
// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
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
    nome: 'API Monitoramento',
    versao: '1.0.0',
    endpoints: [
      'GET /api/health',
      'GET /api/info',
      'GET /api/monitoring/status',
      'GET /api/monitoring/metrics',
      'GET /api/monitoring/alerts',
      'GET /api/monitoring/logs',
      'POST /api/monitoring/services/:action'
    ]
  });
});

// ==================== FUNÇÕES AUXILIARES ====================
function generateAlerts() {
  const alerts = [];
  
  // Simular alertas aleatórios
  if (Math.random() > 0.7) {
    alerts.push({
      id: 1,
      type: 'warning',
      message: 'Uso de CPU acima de 80%',
      timestamp: new Date().toISOString(),
      severity: 'medium'
    });
  }
  
  if (Math.random() > 0.8) {
    alerts.push({
      id: 2,
      type: 'error',
      message: 'Erro de conexão com banco de dados',
      timestamp: new Date().toISOString(),
      severity: 'high'
    });
  }
  
  if (Math.random() > 0.9) {
    alerts.push({
      id: 3,
      type: 'info',
      message: 'Backup automático concluído',
      timestamp: new Date().toISOString(),
      severity: 'low'
    });
  }
  
  return alerts;
}

function generateLogs() {
  const logs = [];
  const logTypes = ['info', 'warning', 'error', 'debug'];
  const messages = [
    'Usuário logado com sucesso',
    'Produto adicionado ao carrinho',
    'Erro ao processar pagamento',
    'Backup automático iniciado',
    'Cache limpo automaticamente',
    'Conexão com banco estabelecida'
  ];
  
  for (let i = 0; i < 10; i++) {
    logs.push({
      id: i + 1,
      type: logTypes[Math.floor(Math.random() * logTypes.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      source: 'system'
    });
  }
  
  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// ==================== MIDDLEWARE DE ERRO ====================
// Middleware 404
app.use('*', (req, res) => {
  console.log(`❌ Rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    sucesso: false,
    mensagem: 'Endpoint não encontrado',
    endpoint_solicitado: req.originalUrl,
    metodo: req.method,
    endpoints_disponiveis: [
      'GET /api/health',
      'GET /api/info',
      'GET /api/monitoring/status',
      'GET /api/monitoring/metrics',
      'GET /api/monitoring/alerts',
      'GET /api/monitoring/logs',
      'POST /api/monitoring/services/:action'
    ]
  });
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error('❌ Erro global:', err);
  res.status(500).json({
    sucesso: false,
    mensagem: 'Erro interno do servidor',
    timestamp: new Date().toISOString()
  });
});

// ==================== INICIALIZAÇÃO ====================
const PORT = process.env.PORT || 3001;

const servidor = app.listen(PORT, () => {
  console.log(`\n🚀 ===== SERVIDOR DE MONITORAMENTO =====`);
  console.log(`📍 Porta: ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Monitoramento: ATIVO`);
  console.log(`🎯 URL: http://localhost:${PORT}`);
  console.log(`📋 API: http://localhost:${PORT}/api`);
  console.log(`🔍 Health: http://localhost:${PORT}/api/health`);
  console.log(`📊 Status: http://localhost:${PORT}/api/monitoring/status`);
  console.log(`📈 Métricas: http://localhost:${PORT}/api/monitoring/metrics`);
  console.log(`🚨 Alertas: http://localhost:${PORT}/api/monitoring/alerts`);
  console.log(`📝 Logs: http://localhost:${PORT}/api/monitoring/logs`);
  console.log(`========================================\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Encerrando servidor...');
  servidor.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Encerrando servidor...');
  servidor.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});

module.exports = app;
