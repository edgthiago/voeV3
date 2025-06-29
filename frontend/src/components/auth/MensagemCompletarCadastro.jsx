import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MensagemCompletarCadastro = () => {
  const { usuario, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCompletarCadastro = async () => {
    setLoading(true);
    try {
      // Aqui você pode implementar a lógica para upgrade automático
      // Por exemplo, atualizar o tipo_usuario para 'usuario'
      
      // Simulação de upgrade para usuário nível 2
      await updateUser({ tipo_usuario: 'usuario' });
      
      // Redirecionar para checkout
      navigate('/checkout');
    } catch (error) {
      console.error('Erro ao completar cadastro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg">
            <div className="card-header bg-warning text-dark text-center">
              <h4 className="mb-0">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Complete seu Cadastro
              </h4>
            </div>
            <div className="card-body text-center p-4">
              <div className="mb-4">
                <i className="bi bi-person-plus display-1 text-warning"></i>
              </div>
              
              <h5 className="mb-3">Para finalizar sua compra, você precisa se tornar um usuário completo!</h5>
              
              <div className="alert alert-info text-start">
                <h6 className="alert-heading">
                  <i className="bi bi-info-circle me-2"></i>
                  Como funciona nosso sistema:
                </h6>
                <ul className="mb-0">
                  <li><strong>Visitante:</strong> Pode navegar, ver produtos e adicionar ao carrinho</li>
                  <li><strong>Usuário Nível 2:</strong> Pode finalizar compras, comentar produtos comprados e acessar histórico</li>
                  <li><strong>Colaborador/Supervisor/Diretor:</strong> Acesso administrativo</li>
                </ul>
              </div>

              <div className="mb-4">
                <p className="text-muted">
                  Olá, <strong>{usuario?.nome}</strong>! 
                  <br />
                  Você está logado como <span className="badge bg-secondary">Visitante</span>
                </p>
              </div>

              <div className="d-grid gap-2">
                <button 
                  onClick={handleCompletarCadastro}
                  className="btn btn-success btn-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Processando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Completar Cadastro Agora
                    </>
                  )}
                </button>
                
                <Link to="/cadastro-completo" className="btn btn-outline-primary">
                  <i className="bi bi-pencil me-2"></i>
                  Completar Dados Manualmente
                </Link>
                
                <Link to="/carrinho" className="btn btn-outline-secondary">
                  <i className="bi bi-arrow-left me-2"></i>
                  Voltar ao Carrinho
                </Link>
              </div>
            </div>
            
            <div className="card-footer text-muted text-center">
              <small>
                <i className="bi bi-shield-check me-2"></i>
                Seus dados estão seguros conosco
              </small>
            </div>
          </div>
        </div>
      </div>
      
      {/* Benefícios de se tornar usuário completo */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-gift me-2"></i>
                Benefícios de ser um Usuário Completo
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 text-center mb-3">
                  <i className="bi bi-bag-check display-4 text-success"></i>
                  <h6 className="mt-2">Finalizar Compras</h6>
                  <p className="text-muted small">
                    Acesso completo ao checkout e formas de pagamento
                  </p>
                </div>
                <div className="col-md-4 text-center mb-3">
                  <i className="bi bi-chat-dots display-4 text-primary"></i>
                  <h6 className="mt-2">Comentar Produtos</h6>
                  <p className="text-muted small">
                    Avalie e comente produtos que você comprou
                  </p>
                </div>
                <div className="col-md-4 text-center mb-3">
                  <i className="bi bi-clock-history display-4 text-info"></i>
                  <h6 className="mt-2">Histórico de Compras</h6>
                  <p className="text-muted small">
                    Acompanhe todos os seus pedidos e compras anteriores
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MensagemCompletarCadastro;
