// Script para buscar usuário específico
const conexao = require('./banco/conexao');

async function buscarUsuario() {
    try {
        console.log('🔍 Buscando usuário thiagoeucosta@gmail.com...\n');
        
        const usuarios = await conexao.executarConsulta(
            'SELECT * FROM usuarios WHERE email = ?',
            ['thiagoeucosta@gmail.com']
        );
        
        if (usuarios.length > 0) {
            console.log('✅ Usuário encontrado:');
            console.log(usuarios[0]);
        } else {
            console.log('❌ Usuário não encontrado');
            
            console.log('\n📋 Usuários disponíveis (primeiros 5):');
            const todosUsuarios = await conexao.executarConsulta(
                'SELECT id, nome, email, tipo_usuario, status FROM usuarios LIMIT 5'
            );
            console.log(todosUsuarios);
        }
        
    } catch (erro) {
        console.error('❌ Erro:', erro);
    }
    
    process.exit(0);
}

buscarUsuario();
