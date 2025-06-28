import React, { useState } from 'react';
import './Entrar.css';

export default function Login() {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Iniciando processo de login...');
    console.log('Endpoint de login:', 'http://localhost:8080/api/auth/login');
    console.log('Dados de login:', { email: login });

    try {
      // Remover espaços extras dos campos antes de enviar
      const emailLimpo = login.trim();
      const senhaLimpa = senha.trim();
      
      // Usar o serviço de API em vez de fetch diretamente
      // Isso garante que o token seja configurado corretamente
      const resposta = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: emailLimpo,
          senha: senhaLimpa
        })
      });

      console.log('Resposta recebida:', resposta.status);
      const dados = await resposta.json();
      console.log('Dados da resposta:', dados);if (!resposta.ok) {
        throw new Error(dados.mensagem || 'Falha no login');
      }      // Armazenar token e redirecionar
      if (dados.dados && dados.dados.token) {
        // Armazenar o token utilizando um método mais robusto
        // Primeiro limpar qualquer token antigo
        localStorage.removeItem('token');
          // Depois armazenar o novo token
        localStorage.setItem('token', dados.dados.token);
        
        // Normalizar os dados do usuário garantindo que o campo tipo seja preenchido
        const usuario = dados.dados.usuario;
        // Garantir que haja um campo tipo para compatibilidade
        if (usuario && !usuario.tipo && (usuario.tipo_usuario || usuario.nivel_acesso)) {
          usuario.tipo = usuario.tipo_usuario || usuario.nivel_acesso;
        }
        
        localStorage.setItem('usuario', JSON.stringify(usuario));
        
        // Garantir que a API seja inicializada com o token
        const apiService = await import('../../services/api');
        apiService.default.setToken(dados.dados.token);
        
        // Redirecionar com base no nível de acesso
        const tipoUsuario = dados.dados.usuario?.tipo_usuario || dados.dados.usuario?.nivel_acesso || 'usuario';
        let destino = '/';
        
        // Redirecionamento baseado no tipo de usuário
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
            destino = '/'; // usuário comum
        }
        
        alert('Login realizado com sucesso!');
        window.location.href = destino;
      } else {
        throw new Error('Token não encontrado na resposta');
      }

    } catch (erro) {
      console.error('Erro ao fazer login:', erro);
      setErro(erro.message);
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
