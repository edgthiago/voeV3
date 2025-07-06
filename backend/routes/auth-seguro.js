const express = require('express');
const AuthUtils = require('../utils/auth');
const bancoDados = require('../banco/conexao');

const router = express.Router();

// Login com senha segura
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        
        if (!email || !senha) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Email e senha são obrigatórios'
            });
        }
        
        // Buscar usuário no banco
        const usuarios = await bancoDados.executarConsulta(
            'SELECT id, nome, email, senha, tipo_usuario FROM usuarios WHERE email = ?',
            [email]
        );
        
        if (usuarios.length === 0) {
            return res.status(401).json({
                sucesso: false,
                erro: 'Credenciais inválidas'
            });
        }
        
        const usuario = usuarios[0];
        
        // Verificar senha (se for hash) ou comparar diretamente (temporário)
        let senhaValida = false;
        if (usuario.senha.startsWith('$2b$')) {
            // É hash bcrypt
            senhaValida = await AuthUtils.verificarSenha(senha, usuario.senha);
        } else {
            // Senha em texto plano (temporário para não quebrar dados existentes)
            senhaValida = senha === usuario.senha;
            console.warn('⚠️ Senha em texto plano detectada. Considere atualizar.');
        }
        
        if (!senhaValida) {
            return res.status(401).json({
                sucesso: false,
                erro: 'Credenciais inválidas'
            });
        }
        
        // Gerar token
        const token = AuthUtils.gerarToken(usuario);
        
        res.json({
            sucesso: true,
            mensagem: 'Login realizado com sucesso',
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo_usuario
            }
        });
        
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// Cadastro com senha hasheada
router.post('/cadastro', async (req, res) => {
    try {
        const { nome, email, senha } = req.body;
        
        if (!nome || !email || !senha) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Nome, email e senha são obrigatórios'
            });
        }
        
        // Verificar se email já existe
        const usuariosExistentes = await bancoDados.executarConsulta(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );
        
        if (usuariosExistentes.length > 0) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Email já cadastrado'
            });
        }
        
        // Hash da senha
        const senhaHash = await AuthUtils.hashSenha(senha);
        
        // Inserir usuário
        const resultado = await bancoDados.executarConsulta(
            'INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES (?, ?, ?, ?)',
            [nome, email, senhaHash, 'usuario']
        );
        
        // Gerar token para o novo usuário
        const novoUsuario = {
            id: resultado.insertId,
            nome,
            email,
            tipo_usuario: 'usuario'
        };
        
        const token = AuthUtils.gerarToken(novoUsuario);
        
        res.status(201).json({
            sucesso: true,
            mensagem: 'Usuário cadastrado com sucesso',
            token,
            usuario: {
                id: novoUsuario.id,
                nome: novoUsuario.nome,
                email: novoUsuario.email,
                tipo: novoUsuario.tipo_usuario
            }
        });
        
    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// Rota protegida de exemplo
router.get('/perfil', AuthUtils.middlewareAuth, async (req, res) => {
    try {
        const usuario = await bancoDados.executarConsulta(
            'SELECT id, nome, email, tipo_usuario FROM usuarios WHERE id = ?',
            [req.usuario.id]
        );
        
        if (usuario.length === 0) {
            return res.status(404).json({
                sucesso: false,
                erro: 'Usuário não encontrado'
            });
        }
        
        res.json({
            sucesso: true,
            usuario: usuario[0]
        });
        
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

module.exports = router;