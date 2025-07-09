#!/bin/bash
# Script para extrair token do colaborador

# Fazer login e extrair token
RESPONSE=$(curl -s -X POST http://localhost:30011/api/auth/login -H "Content-Type: application/json" -d '{"email":"colaborador@teste.com","senha":"123456"}')

# Extrair o token usando grep e sed
TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*"' | sed 's/"token":"\([^"]*\)"/\1/')

echo "Token do colaborador: $TOKEN"

# Testar acesso às estatísticas
echo "Testando acesso às estatísticas..."
curl -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" http://localhost:30011/api/produtos/admin/estatisticas
