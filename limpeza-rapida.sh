#!/bin/bash

echo "🧹 LIMPEZA COMPLETA E MERGE DE ARQUIVOS OBSOLETOS"
echo "================================================="

# Criar estrutura completa para arquivos obsoletos
mkdir -p arquivos_obsoletos/relatorios
mkdir -p arquivos_obsoletos/testes
mkdir -p arquivos_obsoletos/backups
mkdir -p arquivos_obsoletos/diversos
mkdir -p arquivos_obsoletos/logs
mkdir -p arquivos_obsoletos/temp
mkdir -p arquivos_obsoletos/cache

echo "📁 Criando estrutura de pastas..."

# Mover todos os arquivos de relatório e documentação
echo "📊 Movendo relatórios e documentação..."
mv *RELATORIO*.md arquivos_obsoletos/relatorios/ 2>/dev/null
mv *STATUS*.md arquivos_obsoletos/relatorios/ 2>/dev/null
mv *INSTRUCOES*.md arquivos_obsoletos/relatorios/ 2>/dev/null
mv *DOCUMENTACAO*.md arquivos_obsoletos/relatorios/ 2>/dev/null
mv *ROADMAP*.md arquivos_obsoletos/relatorios/ 2>/dev/null
mv *SOLUCAO*.md arquivos_obsoletos/relatorios/ 2>/dev/null
mv *CONFIRMACAO*.md arquivos_obsoletos/relatorios/ 2>/dev/null
mv *FUNCIONALIDADES*.md arquivos_obsoletos/relatorios/ 2>/dev/null
mv *CORRECAO*.md arquivos_obsoletos/relatorios/ 2>/dev/null
mv *DASHBOARD*.md arquivos_obsoletos/relatorios/ 2>/dev/null
mv *BACKEND*.md arquivos_obsoletos/relatorios/ 2>/dev/null
mv *MONITORAMENTO*.md arquivos_obsoletos/relatorios/ 2>/dev/null
mv *CONFIGURACAO*.md arquivos_obsoletos/relatorios/ 2>/dev/null
mv *SEGURANCA*.md arquivos_obsoletos/relatorios/ 2>/dev/null
mv *ANALISE*.md arquivos_obsoletos/relatorios/ 2>/dev/null

# Mover todos os arquivos de teste e debug
echo "🧪 Movendo arquivos de teste e debug..."
mv teste-*.* arquivos_obsoletos/testes/ 2>/dev/null
mv testar*.* arquivos_obsoletos/testes/ 2>/dev/null
mv test-*.* arquivos_obsoletos/testes/ 2>/dev/null
mv debug-*.* arquivos_obsoletos/testes/ 2>/dev/null
mv *token*.txt arquivos_obsoletos/testes/ 2>/dev/null
mv login.txt arquivos_obsoletos/testes/ 2>/dev/null
mv diagnostico*.js arquivos_obsoletos/testes/ 2>/dev/null
mv *debug*.log arquivos_obsoletos/logs/ 2>/dev/null
mv *.tmp arquivos_obsoletos/temp/ 2>/dev/null
mv *cache*.json arquivos_obsoletos/cache/ 2>/dev/null

# Limpeza completa do backend
echo "🖥️ Limpeza completa do backend..."
cd backend 2>/dev/null && {
    # Servidores obsoletos
    mv servidor_*backup*.js ../arquivos_obsoletos/backups/ 2>/dev/null
    mv servidor_teste*.js ../arquivos_obsoletos/testes/ 2>/dev/null
    mv servidor_debug*.js ../arquivos_obsoletos/testes/ 2>/dev/null
    mv servidor_simples*.js ../arquivos_obsoletos/testes/ 2>/dev/null
    mv servidor_desenvolvimento.js ../arquivos_obsoletos/testes/ 2>/dev/null
    mv servidor_minimo.js ../arquivos_obsoletos/testes/ 2>/dev/null
    mv servidor_monitoramento.js ../arquivos_obsoletos/testes/ 2>/dev/null
    mv servidor_basico.js ../arquivos_obsoletos/testes/ 2>/dev/null
    mv servidor_real.js ../arquivos_obsoletos/testes/ 2>/dev/null
    
    # Arquivos de teste e debug
    mv teste_*.js ../arquivos_obsoletos/testes/ 2>/dev/null
    mv testar_*.js ../arquivos_obsoletos/testes/ 2>/dev/null
    mv test_*.js ../arquivos_obsoletos/testes/ 2>/dev/null
    mv debug_*.js ../arquivos_obsoletos/testes/ 2>/dev/null
    mv *_teste.js ../arquivos_obsoletos/testes/ 2>/dev/null
    mv *_debug.js ../arquivos_obsoletos/testes/ 2>/dev/null
    
    # Backups e versões antigas
    mv *_backup*.js ../arquivos_obsoletos/backups/ 2>/dev/null
    mv *backup*.js ../arquivos_obsoletos/backups/ 2>/dev/null
    mv *.bak ../arquivos_obsoletos/backups/ 2>/dev/null
    mv *.old ../arquivos_obsoletos/backups/ 2>/dev/null
    
    # Scripts de setup e utilitários
    mv criar_*.js ../arquivos_obsoletos/diversos/ 2>/dev/null
    mv implementar_*.js ../arquivos_obsoletos/diversos/ 2>/dev/null
    mv atualizar_*.js ../arquivos_obsoletos/diversos/ 2>/dev/null
    mv adicionar_*.js ../arquivos_obsoletos/diversos/ 2>/dev/null
    mv documentar_*.js ../arquivos_obsoletos/diversos/ 2>/dev/null
    mv buscar_*.js ../arquivos_obsoletos/diversos/ 2>/dev/null
    mv monitor_*.js ../arquivos_obsoletos/diversos/ 2>/dev/null
    mv validacao_*.js ../arquivos_obsoletos/diversos/ 2>/dev/null
    mv verificacao_*.js ../arquivos_obsoletos/diversos/ 2>/dev/null
    mv verificar_*.js ../arquivos_obsoletos/diversos/ 2>/dev/null
    mv configurar_*.js ../arquivos_obsoletos/diversos/ 2>/dev/null
    
    # Relatórios do backend
    mv *RELATORIO*.md ../arquivos_obsoletos/relatorios/ 2>/dev/null
    mv *STATUS*.md ../arquivos_obsoletos/relatorios/ 2>/dev/null
    
    # Logs e arquivos temporários
    mv *.log ../arquivos_obsoletos/logs/ 2>/dev/null
    mv logs/*.log ../arquivos_obsoletos/logs/ 2>/dev/null
    mv temp/* ../arquivos_obsoletos/temp/ 2>/dev/null
    
    cd ..
}

# Limpeza do frontend
echo "🎨 Limpando frontend..."
cd frontend 2>/dev/null && {
    # Arquivos de build e cache
    mv build/ ../arquivos_obsoletos/cache/ 2>/dev/null
    mv dist/ ../arquivos_obsoletos/cache/ 2>/dev/null
    mv .cache/ ../arquivos_obsoletos/cache/ 2>/dev/null
    
    # Arquivos de teste do frontend
    mv src/**/*test*.js ../arquivos_obsoletos/testes/ 2>/dev/null
    mv src/**/*spec*.js ../arquivos_obsoletos/testes/ 2>/dev/null
    mv public/test* ../arquivos_obsoletos/testes/ 2>/dev/null
    
    cd ..
}

# Limpeza de arquivos temporários globais
echo "🗑️ Removendo arquivos temporários..."
mv *.tmp arquivos_obsoletos/temp/ 2>/dev/null
mv *.cache arquivos_obsoletos/cache/ 2>/dev/null
mv *.bak arquivos_obsoletos/backups/ 2>/dev/null
mv *.old arquivos_obsoletos/backups/ 2>/dev/null
mv *~ arquivos_obsoletos/temp/ 2>/dev/null

echo "✅ Limpeza e merge concluídos!"
echo ""
echo "📋 Resumo da organização:"
echo "   • Relatórios e Docs → arquivos_obsoletos/relatorios/"
echo "   • Testes e Debug → arquivos_obsoletos/testes/"
echo "   • Backups e Versões → arquivos_obsoletos/backups/"
echo "   • Scripts Diversos → arquivos_obsoletos/diversos/"
echo "   • Logs do Sistema → arquivos_obsoletos/logs/"
echo "   • Arquivos Temp → arquivos_obsoletos/temp/"
echo "   • Cache e Build → arquivos_obsoletos/cache/"
echo ""
echo "🚀 Projeto completamente otimizado!"

# Contar arquivos movidos
total_movidos=$(find arquivos_obsoletos -type f 2>/dev/null | wc -l)
echo "📊 Total de arquivos organizados: $total_movidos"

# Mostrar estrutura final
echo ""
echo "📁 Estrutura final do projeto:"
tree -L 2 -I 'node_modules|.git' . 2>/dev/null || {
    echo "inova/"
    echo "├── backend/"
    echo "├── frontend/" 
    echo "├── arquivos_obsoletos/"
    echo "└── arquivos principais"
}
