// Script para testar e corrigir o problema de acesso negado
// Execute no console do navegador (F12)

console.log('🔍 Diagnóstico de Acesso Negado - Dashboard Colaborador');

// Função para verificar o estado atual
function verificarEstadoAuth() {
    console.log('\n=== 📊 ESTADO ATUAL DA AUTENTICAÇÃO ===');
    
    // Verificar localStorage
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    
    console.log('🔑 Token no localStorage:', token ? 'Presente' : 'Ausente');
    console.log('👤 Usuário no localStorage:', usuario ? 'Presente' : 'Ausente');
    
    if (usuario) {
        try {
            const usuarioObj = JSON.parse(usuario);
            console.log('📋 Dados do usuário:');
            console.log('  - ID:', usuarioObj.id);
            console.log('  - Nome:', usuarioObj.nome);
            console.log('  - Email:', usuarioObj.email);
            console.log('  - Tipo (tipo_usuario):', usuarioObj.tipo_usuario);
            console.log('  - Nível (nivel_acesso):', usuarioObj.nivel_acesso);
            console.log('  - Tipo alternativo:', usuarioObj.tipo);
            console.log('  - Status:', usuarioObj.status);
            console.log('  - Todos os campos:', usuarioObj);
            
            return usuarioObj;
        } catch (error) {
            console.error('❌ Erro ao fazer parse do usuário:', error);
        }
    }
    
    return null;
}

// Função para fazer login correto
async function fazerLoginColaborador() {
    console.log('\n=== 🔄 FAZENDO LOGIN DO COLABORADOR ===');
    
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
            console.log('📦 Dados recebidos:', data.dados);
            
            // Salvar dados corretamente
            localStorage.setItem('token', data.dados.token);
            localStorage.setItem('usuario', JSON.stringify(data.dados.usuario));
            
            console.log('💾 Dados salvos no localStorage');
            
            // Verificar se salvou corretamente
            const usuarioSalvo = verificarEstadoAuth();
            
            return usuarioSalvo;
        } else {
            console.error('❌ Erro no login:', data.mensagem);
            return null;
        }
    } catch (error) {
        console.error('❌ Erro ao fazer login:', error);
        return null;
    }
}

// Função para verificar hierarquia de permissões
function verificarPermissoes(usuario) {
    console.log('\n=== 🔐 VERIFICAÇÃO DE PERMISSÕES ===');
    
    if (!usuario) {
        console.log('❌ Usuário não fornecido');
        return false;
    }
    
    const hierarquia = ['visitante', 'usuario', 'colaborador', 'supervisor', 'diretor'];
    const tipoUsuario = usuario.tipo_usuario || usuario.nivel_acesso || usuario.tipo || 'visitante';
    
    console.log('🎯 Tipo do usuário:', tipoUsuario);
    console.log('📊 Hierarquia completa:', hierarquia);
    
    const nivelAtual = hierarquia.indexOf(tipoUsuario);
    const nivelMinimo = hierarquia.indexOf('colaborador');
    
    console.log('📍 Nível atual:', nivelAtual);
    console.log('📍 Nível mínimo (colaborador):', nivelMinimo);
    console.log('✅ Tem permissão?', nivelAtual >= nivelMinimo);
    
    return nivelAtual >= nivelMinimo;
}

// Função para corrigir o problema
async function corrigirProblema() {
    console.log('\n=== 🛠️ CORRIGINDO PROBLEMA DE ACESSO ===');
    
    // 1. Verificar estado atual
    let usuario = verificarEstadoAuth();
    
    // 2. Se não tem usuário ou usuário inadequado, fazer login
    if (!usuario || !verificarPermissoes(usuario)) {
        console.log('🔄 Fazendo login do colaborador...');
        usuario = await fazerLoginColaborador();
        
        if (!usuario) {
            console.log('❌ Não foi possível fazer login. Verifique se o backend está rodando.');
            return false;
        }
    }
    
    // 3. Verificar se agora tem permissão
    if (verificarPermissoes(usuario)) {
        console.log('✅ Usuário tem permissão de colaborador!');
        
        // 4. Recarregar a página para aplicar as mudanças
        console.log('🔄 Recarregando página em 3 segundos...');
        setTimeout(() => {
            window.location.reload();
        }, 3000);
        
        return true;
    } else {
        console.log('❌ Usuário ainda não tem permissão adequada');
        return false;
    }
}

// Função para limpar e resetar autenticação
function limparAuth() {
    console.log('\n=== 🧹 LIMPANDO AUTENTICAÇÃO ===');
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    console.log('✅ Dados de autenticação removidos');
}

// Executar diagnóstico e correção
async function diagnosticoCompleto() {
    console.log('\n🚀 Iniciando diagnóstico completo...');
    
    // Verificar estado atual
    const estadoInicial = verificarEstadoAuth();
    
    if (estadoInicial) {
        const temPermissao = verificarPermissoes(estadoInicial);
        if (temPermissao) {
            console.log('✅ Usuário já está autenticado com permissões adequadas!');
            console.log('🔄 Se ainda está vendo "Acesso Negado", tente recarregar a página.');
            return;
        }
    }
    
    // Tentar corrigir
    const corrigido = await corrigirProblema();
    
    if (corrigido) {
        console.log('✅ Problema corrigido! A página será recarregada.');
    } else {
        console.log('❌ Não foi possível corrigir o problema automaticamente.');
        console.log('🔧 Tente executar: limparAuth() e depois fazerLoginColaborador()');
    }
}

// Expor funções para uso manual
window.verificarEstadoAuth = verificarEstadoAuth;
window.fazerLoginColaborador = fazerLoginColaborador;
window.verificarPermissoes = verificarPermissoes;
window.limparAuth = limparAuth;
window.corrigirProblema = corrigirProblema;

// Executar automaticamente
diagnosticoCompleto();

console.log('\n📚 Funções disponíveis:');
console.log('- verificarEstadoAuth()');
console.log('- fazerLoginColaborador()');
console.log('- verificarPermissoes(usuario)');
console.log('- limparAuth()');
console.log('- corrigirProblema()');
