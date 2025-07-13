/**
 * 🔐 SCRIPT DE LOGIN AUTOMÁTICO PARA TESTES - JULHO 2025
 * 
 * Este script faz login automaticamente no sistema usando as credenciais fornecidas
 * e armazena o token para que o dashboard administrativo funcione corretamente.
 * 
 * Como usar:
 * 1. Abra o console do navegador em http://localhost:3003
 * 2. Cole este script e execute
 * 3. O login será feito automaticamente
 * 4. Navegue para o dashboard administrativo
 * 
 * Ou acesse diretamente: http://localhost:3003/entrar
 */

(async function loginAutomatico() {
    try {
        console.log('🔐 Iniciando login automático...');
        
        // Credenciais do diretor
        const credenciais = {
            email: 'thiagoeucosta@gmail.com',
            senha: '123456'
        };
        
        // Fazer requisição de login
        const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credenciais)
        });
        
        const data = await response.json();
        
        if (data.sucesso && data.dados && data.dados.token) {
            // Armazenar token e dados do usuário
            localStorage.setItem('token', data.dados.token);
            localStorage.setItem('usuario', JSON.stringify(data.dados.usuario));
            
            console.log('✅ Login realizado com sucesso!');
            console.log('👤 Usuário:', data.dados.usuario.nome);
            console.log('🎯 Tipo:', data.dados.usuario.tipo_usuario);
            console.log('🔑 Token armazenado no localStorage');
            
            // Mostrar instruções
            console.log('\n📋 PRÓXIMOS PASSOS:');
            console.log('1. Recarregue a página (F5)');
            console.log('2. Navegue para o dashboard administrativo');
            console.log('3. Acesse a gestão de usuários');
            
            // Opcional: recarregar a página automaticamente
            setTimeout(() => {
                console.log('🔄 Recarregando página...');
                window.location.reload();
            }, 2000);
            
        } else {
            console.error('❌ Erro no login:', data.mensagem || 'Resposta inválida');
        }
        
    } catch (error) {
        console.error('❌ Erro ao fazer login automático:', error);
    }
})();

// Também disponibilizar funções para testes manuais
window.testeLogin = {
    // Função para fazer login manual
    async login(email, senha) {
        try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });
            
            const data = await response.json();
            
            if (data.sucesso && data.dados && data.dados.token) {
                localStorage.setItem('token', data.dados.token);
                localStorage.setItem('usuario', JSON.stringify(data.dados.usuario));
                console.log('✅ Login realizado:', data.dados.usuario.nome);
                return true;
            } else {
                console.error('❌ Erro no login:', data.mensagem);
                return false;
            }
        } catch (error) {
            console.error('❌ Erro:', error);
            return false;
        }
    },
    
    // Função para verificar status atual
    status() {
        const token = localStorage.getItem('token');
        const usuario = localStorage.getItem('usuario');
        
        console.log('🔍 STATUS DE AUTENTICAÇÃO:');
        console.log('Token presente:', !!token);
        console.log('Usuário presente:', !!usuario);
        
        if (usuario) {
            const dadosUsuario = JSON.parse(usuario);
            console.log('Nome:', dadosUsuario.nome);
            console.log('Email:', dadosUsuario.email);
            console.log('Tipo:', dadosUsuario.tipo_usuario);
        }
    },
    
    // Função para limpar dados de login
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        console.log('🚪 Logout realizado');
    },
    
    // Função para testar acesso à rota protegida
    async testarAdmin() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('❌ Token não encontrado. Faça login primeiro.');
            return;
        }
        
        try {
            const response = await fetch('http://localhost:3001/api/admin/usuarios', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.sucesso) {
                console.log('✅ Acesso à rota admin funcionando');
                console.log(`📊 ${data.total} usuários encontrados`);
            } else {
                console.error('❌ Erro ao acessar rota admin:', data.mensagem);
            }
        } catch (error) {
            console.error('❌ Erro na requisição:', error);
        }
    }
};

console.log('\n🛠️ FUNÇÕES DISPONÍVEIS:');
console.log('testeLogin.login(email, senha) - Fazer login manual');
console.log('testeLogin.status() - Verificar status de autenticação');
console.log('testeLogin.logout() - Fazer logout');
console.log('testeLogin.testarAdmin() - Testar acesso à rota administrativa');
