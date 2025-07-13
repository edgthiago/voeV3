import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Entrar.css';

export default function Login() {
  const navigate = useNavigate();
  const { login: loginAuth } = useAuth();
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 Iniciando processo de login...');
    console.log('📧 Email:', login.trim());

    try {
      setErro('');
      
      // Usar o serviço de autenticação do contexto
      const resultado = await loginAuth(login.trim(), senha.trim());
      
      console.log('📊 Resultado do login:', resultado);
      
      if (resultado.sucesso) {
        console.log('✅ Login bem-sucedido!');
        console.log('� Usuário:', resultado.usuario);
        
        // Determinar destino baseado no tipo de usuário
        const tipoUsuario = resultado.usuario?.tipo_usuario || resultado.usuario?.nivel_acesso || 'usuario';
        let destino = '/';
        
        console.log('🎯 Tipo de usuário detectado:', tipoUsuario);
        
        switch (tipoUsuario) {
          case 'diretor':
            destino = '/admin/diretor';
            break;
          case 'supervisor':
            destino = '/admin/supervisor';
            break;
          case 'colaborador':
            destino = '/admin/colaborador';
            break;
          default:
            destino = '/dashboard'; // usuário comum vai para dashboard
        }
        
        console.log('🚀 Redirecionando para:', destino);
        
        // Pequeno delay para garantir que o contexto foi atualizado
        setTimeout(() => {
          navigate(destino, { replace: true });
        }, 100);
        
      } else {
        console.error('❌ Falha no login:', resultado.mensagem);
        setErro(resultado.mensagem || 'Erro ao fazer login');
      }
      
    } catch (error) {
      console.error('💥 Erro no processo de login:', error);
      setErro(error.message || 'Erro inesperado ao fazer login');
    }
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center min-vh-100" style={{background: 'var(--bg-light)'}}>
      <div className="card shadow-lg border-0" style={{ maxWidth: '900px', width: '100%', borderRadius: '20px' }}>
        <div className="row g-0">

          {/* Formulário */}
          <div className="col-md-6 p-5">
            <div className="text-center mb-4">
              <img src="../../img/voePapel/voePapel.jpeg" alt="Voe Papel" style={{height: '60px', borderRadius: '12px', marginBottom: '1rem'}} />
              <h2 className="fw-bold mb-2" style={{color: 'var(--primary-color)'}}>📝 Entre na sua conta</h2>
              <p className="text-muted mb-4">
                Novo na Voe Papel? <a href="/cadastro" style={{color: 'var(--primary-color)'}}>Cadastre-se aqui</a> e descubra nosso mundo de papelaria! ✨
              </p>
            </div>

            {erro && <div className="alert alert-danger" style={{backgroundColor: 'var(--primary-light)', borderColor: 'var(--primary-color)', color: 'var(--primary-dark)'}}>{erro}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{color: 'var(--text-dark)'}}>📧 Email *</label>
                <input
                  type="email"
                  className="form-control rounded-pill"
                  placeholder="Digite seu email"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  required
                  style={{border: '2px solid var(--border-color)', padding: '12px 20px'}}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold" style={{color: 'var(--text-dark)'}}>🔒 Senha *</label>
                <input
                  type="password"
                  className="form-control rounded-pill"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  style={{border: '2px solid var(--border-color)', padding: '12px 20px'}}
                />
                <div className="mt-2">
                  <a href="#" className="small" style={{color: 'var(--primary-color)'}}>💭 Esqueci minha senha</a>
                </div>
              </div>

              <div className="d-grid mb-3">
                <button type="submit" className="btn btn-primary rounded-pill py-3 fw-semibold" style={{background: 'var(--gradient-primary)', border: 'none', fontSize: '16px'}}>
                  🚀 Entrar na Voe Papel
                </button>
              </div>
            </form>

            <div className="text-center mt-4">
              <small className="text-muted">🌟 Ou entre com suas redes sociais</small>
              <div className="d-flex justify-content-center gap-3 mt-3">
                <div className="social-login-btn">
                  <img src="img/Microsoft_logo.svg.png" alt="Microsoft" height="24" />
                </div>
                <div className="social-login-btn">
                  <img src="img/Google__G__logo.svg.png" alt="Google" height="24" />
                </div>
                <div className="social-login-btn">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png" alt="Facebook" height="24" />
                </div>
              </div>
            </div>
          </div>

          {/* Imagem */}
          <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center" style={{background: 'var(--gradient-primary)', borderRadius: '0 20px 20px 0'}}>
            <div className="text-center text-white p-4">
              <img
                src="img/voePapel/IMG_8431.jpg"
                alt="Voe Papel - Sua papelaria online"
                className="img-fluid rounded-4 shadow-lg mb-4"
                style={{ maxHeight: '300px', objectFit: 'cover' }}
              />
              <h3 className="fw-bold mb-3">✨ Bem-vindo à Voe Papel!</h3>
              <p className="lead">
                Sua papelaria online completa! 📚 Materiais escolares, 🎨 arte & criatividade, 💼 escritório e muito mais!
              </p>
              <div className="mt-4">
                <span className="badge bg-light text-primary me-2 p-2">📝 Cadernos</span>
                <span className="badge bg-light text-primary me-2 p-2">🖊️ Canetas</span>
                <span className="badge bg-light text-primary me-2 p-2">🎨 Tintas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
