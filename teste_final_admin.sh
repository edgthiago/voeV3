#!/bin/bash

# Script de teste final das funcionalidades admin
echo "🧪 TESTANDO INTEGRAÇÃO FRONTEND-BACKEND..."

# Verificar se backend está rodando
echo "🔍 Verificando backend..."
curl -f http://localhost:3002/api/health 2>/dev/null && echo "✅ Backend OK" || echo "❌ Backend offline"

# Verificar se frontend está rodando
echo "🔍 Verificando frontend..."
curl -f http://localhost:3001 2>/dev/null && echo "✅ Frontend OK" || echo "❌ Frontend offline"

# Testar endpoints principais
echo "🔍 Testando endpoints..."

# Teste 1: Produtos
echo "📦 Testando produtos..."
curl -s http://localhost:3002/api/produtos | grep -q "sucesso" && echo "✅ API Produtos OK" || echo "❌ API Produtos falhou"

# Teste 2: Health check
echo "💓 Testando health..."
curl -s http://localhost:3002/api/health | grep -q "status" && echo "✅ Health OK" || echo "❌ Health falhou"

# Teste 3: Info da API
echo "ℹ️ Testando info..."
curl -s http://localhost:3002/api/info | grep -q "nome" && echo "✅ Info OK" || echo "❌ Info falhou"

echo ""
echo "🎯 TESTE CONCLUÍDO!"
echo "📊 Para teste completo, acesse: http://localhost:3001"
echo "🔑 Faça login com credenciais de colaborador/supervisor/diretor"
echo "🧭 Navegue pelas funcionalidades admin para validar dados reais"
