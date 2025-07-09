const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const app = express();

// Middleware básico
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de teste
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Backend conectado com sucesso!',
        timestamp: new Date().toISOString(),
        port: process.env.PORT || 3001
    });
});

// Rota para produtos (básica)
app.get('/api/produtos', (req, res) => {
    res.json({
        sucesso: true,
        dados: [
            { id: 1, nome: 'Tênis Nike Air Max', preco: 299.99 },
            { id: 2, nome: 'Tênis Adidas Ultraboost', preco: 399.99 },
            { id: 3, nome: 'Tênis Puma RS-X', preco: 199.99 }
        ]
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend iniciado com sucesso!`);
    console.log(`📍 Porta: ${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📦 Produtos: http://localhost:${PORT}/api/produtos`);
    console.log(`🌐 CORS habilitado para frontend`);
});

module.exports = app;
