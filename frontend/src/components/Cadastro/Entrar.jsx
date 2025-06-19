import React, { useState } from 'react';
import './Entrar.css';

export default function Login() {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Iniciando processo de login...');
    console.log('Endpoint de login:', 'http://localhost:5000/api/auth/login');
    console.log('Dados de login:', { email: login });

    try {
      // Remover espaços extras dos campos antes de enviar
      const emailLimpo = login.trim();
      const senhaLimpa = senha.trim();
      
      // Usar o serviço de API em vez de fetch diretamente
      // Isso garante que o token seja configurado corretamente
      const resposta = await fetch('http://localhost:5000/api/auth/login', {
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
    <div className="login-page d-flex align-items-center justify-content-center min-vh-100">
      <div className="card shadow border-0" style={{ maxWidth: '900px', width: '100%' }}>
        <div className="row g-0">

          {/* Formulário */}
          <div className="col-md-6 p-5">
            <h2 className="fw-bold mb-2">Acesse sua conta</h2>
            <p className="text-muted mb-4">
              Novo cliente? Então registre-se <a href="/cadastro">aqui</a>.
            </p>

            {erro && <div className="alert alert-danger">{erro}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Login *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Insira seu login ou email"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Senha *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Insira sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
                <div className="mt-2">
                  <a href="#" className="small">Esqueci minha senha</a>
                </div>
              </div>

              <div className="d-grid">
                <button type="submit" className="btn btn-danger">Acessar Conta</button>
              </div>
            </form>

            <div className="text-center mt-4">
              <small className="text-muted">Ou faça login com</small>
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
