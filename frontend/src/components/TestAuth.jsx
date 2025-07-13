import React from 'react';
import { useAuth } from '../context/AuthContext';

const TestAuth = () => {
  const { usuario, isAuthenticated } = useAuth();

  const testarLogin = async () => {
    console.log('🧪 Testando login...');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'thiagoeucosta@gmail.com',
          senha: '123456'
        })
      });
      
      const data = await response.json();
      console.log('📊 Resposta da API:', data);
      
      if (data.sucesso) {
        localStorage.setItem('token', data.dados.token);
        localStorage.setItem('usuario', JSON.stringify(data.dados.usuario));
        console.log('✅ Dados salvos no localStorage');
        console.log('👤 Usuário salvo:', data.dados.usuario);
        window.location.reload();
      }
    } catch (error) {
      console.error('❌ Erro no teste:', error);
    }
  };

  const limparAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    console.log('🧹 Dados de auth limpos');
    window.location.reload();
  };

  const verificarLocalStorage = () => {
    console.log('🔍 Verificando localStorage:');
    console.log('🔑 Token:', localStorage.getItem('token'));
    console.log('👤 Usuário:', localStorage.getItem('usuario'));
    
    try {
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      console.log('📊 Usuário parseado:', usuario);
      console.log('🏷️ Tipo usuário:', usuario.tipo_usuario);
      console.log('🏷️ Nível acesso:', usuario.nivel_acesso);
    } catch (e) {
      console.error('❌ Erro ao parsear usuário:', e);
    }
  };

  return (
    <div className="container mt-4">
      <h2>🧪 Teste de Autenticação</h2>
      
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Status Atual</h5>
            </div>
            <div className="card-body">
              <p><strong>Autenticado:</strong> {isAuthenticated ? '✅ Sim' : '❌ Não'}</p>
              <p><strong>Usuário:</strong></p>
              <pre>{JSON.stringify(usuario, null, 2)}</pre>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Ações de Teste</h5>
            </div>
            <div className="card-body">
              <button 
                className="btn btn-primary me-2 mb-2" 
                onClick={testarLogin}
              >
                🔐 Testar Login
              </button>
              
              <button 
                className="btn btn-warning me-2 mb-2" 
                onClick={verificarLocalStorage}
              >
                🔍 Verificar localStorage
              </button>
              
              <button 
                className="btn btn-danger me-2 mb-2" 
                onClick={limparAuth}
              >
                🧹 Limpar Auth
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAuth;
