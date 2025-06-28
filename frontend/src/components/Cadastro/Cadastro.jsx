import React, { useState } from 'react';
import './Cadastro.css';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [cadastroRealizado, setCadastroRealizado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    
    // Validações no frontend
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }
    
    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    console.log('Enviando dados para cadastro:', { nome, email });
    try {
      const resposta = await fetch('http://localhost:8080/api/auth/registrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome,
          email,
          senha,
          confirmar_senha: confirmarSenha
        })
      });      const dados = await resposta.json();
      console.log('Resposta do cadastro:', dados);

      if (!resposta.ok) {
        throw new Error(dados.mensagem || 'Erro ao cadastrar');
      }

      // Cadastro realizado com sucesso
      setCadastroRealizado(true);
      
      // Se quiser guardar o token e redirecionar direto
      if (dados.dados && dados.dados.token) {
        localStorage.setItem('token', dados.dados.token);
        localStorage.setItem('usuario', JSON.stringify(dados.dados.usuario));
      }
      
      setTimeout(() => {
        window.location.href = '/entrar';
      }, 2000);
    } catch (erro) {
      console.error('Erro ao cadastrar:', erro);
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
              <h2 className="fw-bold mb-2" style={{color: 'var(--primary-color)'}}>✨ Junte-se à Voe Papel</h2>
              <p className="text-muted mb-4">
                Já tem conta? <a href="/entrar" style={{color: 'var(--primary-color)'}}>Faça login aqui</a> e continue criando! 🎨
              </p>
            </div>

            {erro && (
              <div className="alert alert-danger" style={{backgroundColor: 'var(--primary-light)', borderColor: 'var(--primary-color)', color: 'var(--primary-dark)'}}>
                ⚠️ {erro}
              </div>
            )}
            {cadastroRealizado && (
              <div className="alert alert-success" style={{backgroundColor: 'var(--success-color)', borderColor: 'var(--success-color)', color: 'var(--text-dark)'}}>
                🎉 Cadastro realizado com sucesso! Redirecionando para login...
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{color: 'var(--text-dark)'}}>👤 Nome Completo *</label>
                <input
                  type="text"
                  className="form-control rounded-pill"
                  placeholder="Como podemos te chamar?"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  style={{border: '2px solid var(--border-color)', padding: '12px 20px'}}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold" style={{color: 'var(--text-dark)'}}>📧 Email *</label>
                <input
                  type="email"
                  className="form-control rounded-pill"
                  placeholder="Seu melhor email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{border: '2px solid var(--border-color)', padding: '12px 20px'}}
                />
              </div>              <div className="mb-3">
                <label className="form-label fw-semibold" style={{color: 'var(--text-dark)'}}>🔒 Senha *</label>
                <input
                  type="password"
                  className="form-control rounded-pill"
                  placeholder="Mínimo 6 caracteres"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  minLength={6}
                  style={{border: '2px solid var(--border-color)', padding: '12px 20px'}}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold" style={{color: 'var(--text-dark)'}}>🔐 Confirmar Senha *</label>
                <input
                  type="password"
                  className="form-control rounded-pill"
                  placeholder="Digite a senha novamente"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                  style={{border: '2px solid var(--border-color)', padding: '12px 20px'}}
                />
              </div>

              <div className="d-grid mb-3">
                <button 
                  type="submit" 
                  className="btn btn-primary rounded-pill py-3 fw-semibold" 
                  disabled={cadastroRealizado}
                  style={{background: 'var(--gradient-primary)', border: 'none', fontSize: '16px'}}
                >
                  {cadastroRealizado ? '✅ Cadastro realizado!' : '🚀 Criar minha conta'}
                </button>
              </div>
            </form>

            <div className="text-center mt-4">
              <small className="text-muted">🌟 Ou cadastre-se com suas redes sociais</small>
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
          <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center" style={{background: 'var(--gradient-secondary)', borderRadius: '0 20px 20px 0'}}>
            <div className="text-center text-white p-4">
              <img
                src="img/voePapel/IMG_8529.jpg"
                alt="Voe Papel - Arte e Criatividade"
                className="img-fluid rounded-4 shadow-lg mb-4"
                style={{ maxHeight: '300px', objectFit: 'cover' }}
              />
              <h3 className="fw-bold mb-3">🎨 Desperte sua Criatividade!</h3>
              <p className="lead">
                Cadastre-se e tenha acesso às melhores ofertas em materiais escolares, arte e escritório!
              </p>
              <div className="mt-4">
                <span className="badge bg-light text-primary me-2 p-2 mb-2">📚 Material Escolar</span>
                <span className="badge bg-light text-primary me-2 p-2 mb-2">🎭 Arte & Craft</span>
                <span className="badge bg-light text-primary me-2 p-2 mb-2">💼 Escritório</span>
                <span className="badge bg-light text-primary me-2 p-2 mb-2">🎁 Ofertas Exclusivas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
