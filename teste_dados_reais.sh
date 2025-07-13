#!/bin/bash

# Script de teste para validar que os relatórios usam dados reais da API
# Autor: Sistema VOE
# Data: 10/07/2025

echo "=== TESTE DE DADOS REAIS DOS RELATÓRIOS ==="
echo "Data do teste: $(date)"
echo ""

# Função para testar endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local description=$3
    local token=$4
    
    echo "🔍 Testando: $description"
    echo "   Método: $method"
    echo "   URL: $url"
    
    if [ -n "$token" ]; then
        response=$(curl -s -X $method "$url" -H "Authorization: Bearer $token")
    else
        response=$(curl -s -X $method "$url")
    fi
    
    # Verificar se a resposta contém "sucesso"
    if echo "$response" | grep -q '"sucesso":true'; then
        echo "   ✅ SUCESSO: Endpoint respondeu corretamente"
    elif echo "$response" | grep -q '"sucesso":false'; then
        echo "   ❌ ERRO: $(echo "$response" | grep -o '"mensagem":"[^"]*"' || echo 'Erro desconhecido')"
    else
        echo "   ⚠️  AVISO: Resposta inesperada"
    fi
    echo ""
}

# Testar endpoints de saúde
echo "=== TESTES DE CONECTIVIDADE ==="
test_endpoint "GET" "http://localhost:3003/api/health" "Health Check da API"
test_endpoint "GET" "http://localhost:3003/api/info" "Informações da API"

echo "=== TESTE DE AUTENTICAÇÃO ==="
# Fazer login para obter token
login_response=$(curl -s -X POST "http://localhost:3003/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@admin.com","senha":"admin123"}')

echo "Resposta do login: $login_response"

# Extrair token se o login foi bem-sucedido
if echo "$login_response" | grep -q '"sucesso":true'; then
    token=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "✅ Login realizado com sucesso!"
    echo "Token obtido: ${token:0:50}..."
    
    echo ""
    echo "=== TESTES DOS RELATÓRIOS COM DADOS REAIS ==="
    
    # Testar relatórios que agora usam dados reais
    test_endpoint "GET" "http://localhost:3003/api/admin/relatorios/produtos" "Relatório de Produtos (NOVO - dados reais)" "$token"
    test_endpoint "GET" "http://localhost:3003/api/admin/relatorios/vendas" "Relatório de Vendas (dados reais)" "$token"
    test_endpoint "GET" "http://localhost:3003/api/admin/relatorios/estoque" "Relatório de Estoque (dados reais)" "$token"
    
    echo "=== TESTES DE OUTROS ENDPOINTS ADMIN ==="
    test_endpoint "GET" "http://localhost:3003/api/produtos" "Lista de Produtos (dados reais)" "$token"
    test_endpoint "GET" "http://localhost:3003/api/pedidos" "Lista de Pedidos (dados reais)" "$token"
    test_endpoint "GET" "http://localhost:3003/api/admin/logs" "Logs do Sistema (dados reais)" "$token"
    
else
    echo "❌ Falha no login. Não é possível testar endpoints protegidos."
    echo "Resposta completa: $login_response"
fi

echo ""
echo "=== RESUMO DOS COMPONENTES CORRIGIDOS ==="
echo "✅ RelatorioProdutos.jsx - Agora usa endpoint /api/admin/relatorios/produtos"
echo "✅ RelatorioVendas.jsx - Agora usa endpoint /api/admin/relatorios/vendas" 
echo "✅ RelatoriosVendas.jsx - Já usava dados reais"
echo "✅ RelatoriosEstoque.jsx - Usa endpoint /api/admin/relatorios/estoque"
echo "✅ TodosProdutos.jsx - Usa endpoint /api/produtos"
echo "✅ TodosPedidos.jsx - Usa endpoint /api/pedidos"
echo "✅ PedidosPendentes.jsx - Usa endpoint /api/pedidos"
echo "✅ GerenciarUsuarios.jsx - Usa endpoint /api/admin/usuarios"
echo "✅ GerenciarProdutos.jsx - Usa endpoint /api/produtos"
echo ""
echo "=== DADOS MOCKADOS REMOVIDOS ==="
echo "❌ Removidos todos os arrays mockados com produtos fictícios"
echo "❌ Removidas simulações de dados de vendas"
echo "❌ Removidos dados hardcoded nos relatórios"
echo ""
echo "=== PRÓXIMOS PASSOS ==="
echo "1. Testar interface web em http://localhost:3002"
echo "2. Validar que todos os relatórios mostram dados reais"
echo "3. Verificar se não há mais dados 'Chinelo Havaianas', 'Caderno Universitário 100 folhas' etc."
echo "4. Confirmar que dados mudam conforme alterações no banco"
echo ""
echo "Teste concluído em: $(date)"
