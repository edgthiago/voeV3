// Script para testar se as correções de imports estão funcionando
// Execute no console do navegador (F12)

console.log('🔧 Testando correções de importação...');

// Função para verificar se a página carrega sem erros de console
function verificarErrosConsole() {
    return new Promise((resolve) => {
        let errosCapturados = [];
        
        // Capturar erros de console
        const originalError = console.error;
        console.error = (...args) => {
            errosCapturados.push(args.join(' '));
            originalError.apply(console, args);
        };
        
        setTimeout(() => {
            console.error = originalError;
            resolve(errosCapturados);
        }, 2000);
    });
}

// Função para testar carregamento de uma rota específica
async function testarRotaSemErros(rota) {
    console.log(`🔍 Testando rota: ${rota.nome}`);
    
    // Navegar para a rota
    window.history.pushState({}, '', rota.url);
    
    // Aguardar carregamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar se não há erros visíveis na página
    const conteudo = document.body.innerText.toLowerCase();
    const temErroImport = conteudo.includes('syntaxerror') || 
                         conteudo.includes('does not provide an export') ||
                         conteudo.includes('unexpected token');
    
    if (temErroImport) {
        console.log(`❌ ${rota.nome}: Erro de importação detectado`);
        return false;
    } else {
        console.log(`✅ ${rota.nome}: Carregou sem erros de importação`);
        return true;
    }
}

// Lista de rotas para testar
const rotasParaTestar = [
    { nome: 'Dashboard Colaborador', url: '/admin/colaborador' },
    { nome: 'Gerenciar Produtos', url: '/dashboard/produtos' },
    { nome: 'Gerenciar Estoque', url: '/dashboard/estoque' },
    { nome: 'Gerenciar Pedidos', url: '/dashboard/pedidos' },
    { nome: 'Relatórios', url: '/dashboard/relatorios/vendas-basico' }
];

// Função principal de teste
async function testarCorrecoes() {
    console.log('\n=== 🧪 TESTE DE CORREÇÕES DE IMPORTAÇÃO ===\n');
    
    // Verificar autenticação primeiro
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    
    if (!token || !usuario) {
        console.log('⚠️ Usuário não autenticado. Fazendo login automático...');
        
        try {
            const response = await fetch('http://localhost:30011/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'colaborador@teste.com',
                    senha: '123456'
                })
            });

            const data = await response.json();
            
            if (data.sucesso) {
                localStorage.setItem('token', data.dados.token);
                localStorage.setItem('usuario', JSON.stringify(data.dados.usuario));
                console.log('✅ Login automático realizado');
                
                // Recarregar em 2 segundos
                setTimeout(() => window.location.reload(), 2000);
                return;
            }
        } catch (error) {
            console.log('❌ Erro no login automático:', error.message);
            return;
        }
    }
    
    // Testar cada rota
    const resultados = [];
    
    for (const rota of rotasParaTestar) {
        const sucesso = await testarRotaSemErros(rota);
        resultados.push({ ...rota, sucesso });
    }
    
    // Voltar para o dashboard
    window.history.pushState({}, '', '/admin/colaborador');
    
    // Resumo
    console.log('\n=== 📊 RESUMO DOS TESTES ===\n');
    
    const sucessos = resultados.filter(r => r.sucesso).length;
    const total = resultados.length;
    
    console.log(`✅ Sucessos: ${sucessos}/${total}`);
    console.log(`❌ Falhas: ${total - sucessos}/${total}`);
    
    resultados.forEach(resultado => {
        console.log(`${resultado.sucesso ? '✅' : '❌'} ${resultado.nome}`);
    });
    
    if (sucessos === total) {
        console.log('\n🎉 Todas as correções funcionaram! Nenhum erro de importação encontrado.');
    } else {
        console.log('\n⚠️ Algumas rotas ainda apresentam problemas. Verifique os detalhes acima.');
    }
    
    return resultados;
}

// Executar teste
testarCorrecoes();

// Expor funções para uso manual
window.testarCorrecoes = testarCorrecoes;
window.testarRotaSemErros = testarRotaSemErros;

console.log('\n📚 Funções disponíveis:');
console.log('- testarCorrecoes()');
console.log('- testarRotaSemErros(rota)');
