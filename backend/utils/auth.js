const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthUtils {
    // Hash básico de senha
    static async hashSenha(senha) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
        return await bcrypt.hash(senha, saltRounds);
    }
    
    // Verificar senha
    static async verificarSenha(senha, hash) {
        return await bcrypt.compare(senha, hash);
    }
    
    // Gerar JWT simples
    static gerarToken(usuario) {
        if (!process.env.JWT_SECRET) {
            console.warn('⚠️ JWT_SECRET não configurado! Configure no .env');
        }
        
        return jwt.sign(
            { 
                id: usuario.id, 
                email: usuario.email,
                tipo: usuario.tipo_usuario || 'usuario'
            },
            process.env.JWT_SECRET || 'chave_temporaria_dev',
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );
    }
    
    // Verificar token básico
    static verificarToken(token) {
        try {
            return jwt.verify(
                token, 
                process.env.JWT_SECRET || 'chave_temporaria_dev'
            );
        } catch (error) {
            throw new Error('Token inválido');
        }
    }
    
    // Middleware básico de autenticação
    static middlewareAuth(req, res, next) {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                sucesso: false, 
                erro: 'Token de acesso requerido' 
            });
        }
        
        try {
            const usuario = AuthUtils.verificarToken(token);
            req.usuario = usuario;
            next();
        } catch (error) {
            return res.status(401).json({ 
                sucesso: false, 
                erro: 'Token inválido' 
            });
        }
    }
}

module.exports = AuthUtils;