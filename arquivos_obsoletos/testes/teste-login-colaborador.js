/**
 * 🧪 TESTE LOGIN E REDIRECIONAMENTO COLABORADOR
 * Data: 09 de Julho de 2025
 * Objetivo: Verificar login e redirecionamento do colaborador
 */

console.log('🧪 Testando login e redirecionamento do colaborador...');

// Script para ser executado no console do navegador
function testarLoginColaborador() {
    console.log('🔐 Iniciando teste de login...');
    
    // Fazer login
    fetch('http://localhost:30011/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'colaborador@teste.com',
            senha: '123456'
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('📊 Resposta do login:', data);
        
        if (data.sucesso) {
            // Salvar token no localStorage
            const token = data.dados?.token || data.token;
            const usuario = data.dados?.usuario || data.usuario;
            
            localStorage.setItem('token', token);
            localStorage.setItem('usuario', JSON.stringify(usuario));
            
            console.log('✅ Token salvo:', token);
            console.log('👤 Usuário salvo:', usuario);
            console.log('🎯 Tipo usuário:', usuario?.tipo_usuario || usuario?.nivel_acesso);
            
            // Verificar se deve redirecionar
            if (usuario?.tipo_usuario === 'colaborador') {
                console.log('🚀 Redirecionando para /admin/colaborador...');
                window.location.href = '/admin/colaborador';
            } else {
                console.warn('⚠️ Usuário não é colaborador:', usuario?.tipo_usuario);
            }
        } else {
            console.error('❌ Erro no login:', data.mensagem);
        }
    })
    .catch(error => {
        console.error('❌ Erro na requisição:', error);
    });
}

// Função para verificar estado atual
function verificarEstadoAtual() {
    console.log('🔍 Verificando estado atual...');
    
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    console.log('Token atual:', token ? 'Presente' : 'Ausente');
    console.log('Usuário atual:', usuario);
    console.log('Tipo usuário:', usuario?.tipo_usuario || usuario?.nivel_acesso || 'Não definido');
    console.log('URL atual:', window.location.href);
    
    // Verificar se a página atual é acessível
    if (window.location.pathname === '/admin/colaborador') {
        console.log('✅ Já está na página do colaborador');
    } else {
        console.log('📍 Não está na página do colaborador');
    }
}

// Executar verificações
console.log('1️⃣ Verificando estado atual:');
verificarEstadoAtual();

console.log('\n2️⃣ Para testar login, execute:');
console.log('testarLoginColaborador()');

// Tornar funções disponíveis no console
window.testarLoginColaborador = testarLoginColaborador;
window.verificarEstadoAtual = verificarEstadoAtual;
