// Teste completo do dashboard do colaborador
// Execute este script no navegador (F12 -> Console) após abrir http://localhost:3001

console.log('🔄 Iniciando teste completo do dashboard do colaborador...');

// Função para fazer login
async function fazerLogin() {
    console.log('📝 Fazendo login com colaborador@teste.com...');
    
    try {
        const response = await fetch('http://localhost:30011/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'colaborador@teste.com',
                senha: '123456'
            })
        });

        const data = await response.json();
        
        if (data.sucesso) {
            console.log('✅ Login realizado com sucesso!');
            console.log('👤 Usuário:', data.dados.usuario.nome);
            console.log('🔑 Token gerado:', data.dados.token.substring(0, 50) + '...');
            
            // Salvar token no localStorage
            localStorage.setItem('token', data.dados.token);
            localStorage.setItem('usuario', JSON.stringify(data.dados.usuario));
            
            console.log('💾 Token salvo no localStorage');
            return data.dados;
        } else {
            console.error('❌ Erro no login:', data.mensagem);
            return null;
        }
    } catch (error) {
        console.error('❌ Erro ao fazer login:', error);
        return null;
    }
}

// Função para testar API de estatísticas
async function testarEstatisticas() {
    console.log('📊 Testando API de estatísticas...');
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('❌ Token não encontrado. Faça login primeiro.');
        return;
    }

    try {
        const response = await fetch('http://localhost:30011/api/produtos/admin/estatisticas', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (data.sucesso) {
            console.log('✅ Estatísticas obtidas com sucesso!');
            console.log('📈 Dados:', data.dados);
        } else {
            console.error('❌ Erro ao obter estatísticas:', data.mensagem);
        }
    } catch (error) {
        console.error('❌ Erro ao testar estatísticas:', error);
    }
}

// Função para verificar se a página está acessível
function verificarPagina() {
    console.log('🌐 Verificando se a página /admin/colaborador está acessível...');
    
    const currentUrl = window.location.href;
    console.log('🔗 URL atual:', currentUrl);
    
    if (currentUrl.includes('/admin/colaborador')) {
        console.log('✅ Você está na página do colaborador!');
    } else {
        console.log('⚠️ Você não está na página do colaborador.');
        console.log('📍 Para testar, navegue para: http://localhost:3001/admin/colaborador');
    }
}

// Função para redirecionar para a página do colaborador
function irParaDashboard() {
    console.log('🚀 Redirecionando para o dashboard do colaborador...');
    window.location.href = '/admin/colaborador';
}

// Função principal de teste
async function testeCompleto() {
    console.log('\n=== 🧪 TESTE COMPLETO DO DASHBOARD DO COLABORADOR ===\n');
    
    // 1. Verificar página atual
    verificarPagina();
    
    // 2. Fazer login
    const loginData = await fazerLogin();
    
    if (!loginData) {
        console.log('❌ Não foi possível continuar o teste sem login válido.');
        return;
    }
    
    // 3. Testar APIs
    await testarEstatisticas();
    
    // 4. Verificar se está na página correta, senão redirecionar
    if (!window.location.href.includes('/admin/colaborador')) {
        console.log('\n⏳ Aguarde 3 segundos antes de redirecionar...');
        setTimeout(() => {
            irParaDashboard();
        }, 3000);
    }
    
    console.log('\n✅ Teste completo finalizado!');
    console.log('📝 Se você não foi redirecionado automaticamente, navegue manualmente para:');
    console.log('🔗 http://localhost:3001/admin/colaborador');
}

// Executar teste
testeCompleto();

// Funções auxiliares disponíveis para uso manual
window.fazerLogin = fazerLogin;
window.testarEstatisticas = testarEstatisticas;
window.irParaDashboard = irParaDashboard;
window.verificarPagina = verificarPagina;

console.log('\n📚 Funções disponíveis para uso manual:');
console.log('- fazerLogin()');
console.log('- testarEstatisticas()');
console.log('- irParaDashboard()');
console.log('- verificarPagina()');
