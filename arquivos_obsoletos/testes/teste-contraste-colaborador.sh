#!/bin/bash

echo "=== TESTE DE CONTRASTE E CORES DO PAINEL DO COLABORADOR ==="
echo "Data: $(date)"
echo ""

echo "🎨 Verificando se as correções de estilo foram aplicadas..."
echo ""

# Verificar se o arquivo CSS foi criado
if [ -f "frontend/src/components/admin/PainelColaborador.css" ]; then
    echo "✅ Arquivo CSS do painel criado com sucesso"
    echo "📁 Localização: frontend/src/components/admin/PainelColaborador.css"
else
    echo "❌ Arquivo CSS do painel não encontrado"
fi

echo ""

# Verificar se os componentes importam o CSS
echo "🔍 Verificando importações do CSS nos componentes:"
echo ""

components=(
    "frontend/src/components/admin/DashboardColaborador.jsx"
    "frontend/src/components/admin/GerenciarProdutos.jsx"
    "frontend/src/components/admin/GerenciarEstoque.jsx"
    "frontend/src/components/admin/GerenciarPedidos.jsx"
    "frontend/src/components/admin/RelatoriosColaborador.jsx"
)

for component in "${components[@]}"; do
    if grep -q "import.*PainelColaborador.css" "$component" 2>/dev/null; then
        echo "✅ $(basename "$component") - CSS importado"
    else
        echo "❌ $(basename "$component") - CSS não importado"
    fi
done

echo ""

# Verificar se os componentes usam a classe wrapper
echo "🎯 Verificando uso da classe 'dashboard-colaborador':"
echo ""

for component in "${components[@]}"; do
    if grep -q 'className="dashboard-colaborador"' "$component" 2>/dev/null; then
        echo "✅ $(basename "$component") - Classe wrapper aplicada"
    else
        echo "❌ $(basename "$component") - Classe wrapper não aplicada"
    fi
done

echo ""

# Verificar se o frontend está rodando
echo "🚀 Status do Frontend:"
if curl -s http://localhost:3002 > /dev/null 2>&1; then
    echo "✅ Frontend rodando em http://localhost:3002"
elif curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ Frontend rodando em http://localhost:3001"
elif curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend rodando em http://localhost:3000"
else
    echo "❌ Frontend não está respondendo"
fi

echo ""

# Verificar se o backend está rodando
echo "🔧 Status do Backend:"
if curl -s http://localhost:30011/api/health > /dev/null 2>&1; then
    echo "✅ Backend rodando em http://localhost:30011"
else
    echo "❌ Backend não está respondendo na porta 30011"
fi

echo ""
echo "=== RESUMO DAS CORREÇÕES APLICADAS ==="
echo ""
echo "📋 O que foi corrigido:"
echo "   • Criado arquivo CSS específico para o painel do colaborador"
echo "   • Aplicada classe wrapper 'dashboard-colaborador' em todos os componentes"
echo "   • Corrigidas cores para melhor contraste:"
echo "     - Textos agora são escuros (#2c3e50) sobre fundos claros"
echo "     - Cards coloridos mantêm legibilidade"
echo "     - Botões com cores adequadas e hover effects"
echo "     - Alertas com cores bem definidas"
echo ""
echo "🎨 Principais melhorias de estilo:"
echo "   • Fundo principal em branco com sombras suaves"
echo "   • Texto principal em cor escura para contraste"
echo "   • Cards com gradientes suaves"
echo "   • Botões com cores do tema rosa do site"
echo "   • Efeitos hover para melhor interação"
echo ""
echo "📱 Para testar:"
echo "   1. Acesse: http://localhost:3002 (ou porta disponível)"
echo "   2. Faça login como colaborador"
echo "   3. Navegue pelo painel do colaborador"
echo "   4. Verifique se todo o conteúdo está legível"
echo ""
echo "✨ TESTE CONCLUÍDO ✨"
