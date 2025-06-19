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
      const resposta = await fetch('http://localhost:5000/api/auth/registrar', {
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
    <div className="login-page d-flex align-items-center justify-content-center min-vh-100">
      <div className="card shadow border-0" style={{ maxWidth: '900px', width: '100%' }}>
        <div className="row g-0">
          {/* Formulário */}
          <div className="col-md-6 p-5">
            <h2 className="fw-bold mb-2">Crie sua conta</h2>
            <p className="text-muted mb-4">
              Já possui conta? Entre <a href="/entrar">aqui</a>.
            </p>

            {erro && <div className="alert alert-danger">{erro}</div>}
            {cadastroRealizado && (
              <div className="alert alert-success">
                Cadastro realizado com sucesso! Redirecionando para login...
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nome *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Insira seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>              <div className="mb-3">
                <label className="form-label">Senha *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Insira sua senha (mínimo 6 caracteres)"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Confirmar Senha *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Confirme sua senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                />
              </div>

              <div className="d-grid">
                <button type="submit" className="btn btn-danger" disabled={cadastroRealizado}>
                  {cadastroRealizado ? 'Cadastro realizado!' : 'Criar Conta'}
                </button>
              </div>
            </form>

            <div className="text-center mt-4">
              <small className="text-muted">Ou crie sua conta com</small>
              <div className="d-flex justify-content-center gap-3 mt-2">
                <img src="img/Microsoft_logo.svg.png" alt="Microsoft" height="20" />
                <img src="img/Google__G__logo.svg.png" alt="Google" height="20" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png" alt="Facebook" height="20" />
              </div>
            </div>
          </div>

          {/* Imagem */}
          <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center">
            <img
              src="img/cadastro.png"
              alt="Banner"
              className="img-fluid p-4"
              style={{ maxHeight: '900px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
