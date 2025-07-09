// Teste simplificado do servidor sem operações de banco
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const app = express();

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de teste
app.get('/test', (req, res) => {
  res.json({ message: 'Servidor funcionando!' });
});

// Inicializar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor teste iniciado na porta ${PORT}`);
  console.log(`🔗 Teste: http://localhost:${PORT}/test`);
});

module.exports = app;
