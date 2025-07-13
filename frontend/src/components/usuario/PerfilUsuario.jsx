// Componente de Perfil do Usuário integrado
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAuth as useUsuarioHooks, usePedidos } from '../../hooks/useApiIntegration';
import LoadingSpinner from '../common/LoadingSpinner';

const PerfilUsuario = () => {
  const { user, logout } = useAuth();
  const { atualizarPerfil, loading: perfilLoading, error: perfilError } = useUsuarioHooks();
  const { buscarPedidos: listarPedidos, loading: pedidosLoading } = usePedidos();
  
  const [activeTab, setActiveTab] = useState('perfil');
  const [pedidos, setPedidos] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    endereco: {
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: ''
    }
  });
  const [showSuccess, setShowSuccess] = useState(false);

  // Carregar dados do usuário
  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || '',
        email: user.email || '',
        telefone: user.telefone || '',
        cpf: user.cpf || '',
        endereco: user.endereco || {
          cep: '',
          rua: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          estado: ''
        }
      });
    }
  }, [user]);

  // Carregar pedidos quando aba for ativada
  useEffect(() => {
    if (activeTab === 'pedidos') {
      carregarPedidos();
    }
  }, [activeTab, carregarPedidos]);
  const carregarPedidos = useCallback(async () => {
    try {
      const response = await listarPedidos();
      if (response.sucesso) {
        setPedidos(response.dados || []);
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  }, [listarPedidos]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('endereco.')) {
      const enderecoField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [enderecoField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await atualizarPerfil(formData);
      if (response.sucesso) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pendente': { class: 'warning', text: 'Pendente' },
      'processando': { class: 'info', text: 'Processando' },
      'enviado': { class: 'primary', text: 'Enviado' },
      'entregue': { class: 'success', text: 'Entregue' },
      'cancelado': { class: 'danger', text: 'Cancelado' }
    };
    
    const config = statusConfig[status] || statusConfig['pendente'];
    return <span className={`badge bg-${config.class}`}>{config.text}</span>;
  };

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">
            <i className="bi bi-person-circle me-2"></i>
            Minha Conta
          </h2>
        </div>
      </div>

      <div className="row">
        {/* Sidebar de navegação */}
        <div className="col-lg-3 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                <button
                  className={`list-group-item list-group-item-action ${activeTab === 'perfil' ? 'active' : ''}`}
                  onClick={() => setActiveTab('perfil')}
                >
                  <i className="bi bi-person me-2"></i>
                  Meus Dados
                </button>
                <button
                  className={`list-group-item list-group-item-action ${activeTab === 'pedidos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pedidos')}
                >
                  <i className="bi bi-bag me-2"></i>
                  Meus Pedidos
                </button>
                <button
                  className={`list-group-item list-group-item-action ${activeTab === 'endereco' ? 'active' : ''}`}
                  onClick={() => setActiveTab('endereco')}
                >
                  <i className="bi bi-geo-alt me-2"></i>
                  Endereços
                </button>
                <button
                  className="list-group-item list-group-item-action text-danger"
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja sair?')) {
                      logout();
                    }
                  }}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="col-lg-9">
          {/* Aba Perfil */}
          {activeTab === 'perfil' && (
            <div className="card border-0 shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">Informações Pessoais</h5>
              </div>
              <div className="card-body">
                {showSuccess && (
                  <div className="alert alert-success alert-dismissible fade show">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Perfil atualizado com sucesso!
                    <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                  </div>
                )}

                {perfilError && (
                  <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {perfilError}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nome Completo</label>
                      <input
                        type="text"
                        className="form-control"
                        name="nome"
                        value={formData.nome}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Telefone</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">CPF</label>
                      <input
                        type="text"
                        className="form-control"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="text-end">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={perfilLoading}
                    >
                      {perfilLoading ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Carregando...</span>
                          </div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check2 me-2"></i>
                          Salvar Alterações
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Aba Pedidos */}
          {activeTab === 'pedidos' && (
            <div className="card border-0 shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">Histórico de Pedidos</h5>
              </div>
              <div className="card-body">
                {pedidosLoading ? (
                  <LoadingSpinner message="Carregando pedidos..." />
                ) : pedidos.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-bag-x fs-1 text-muted mb-3"></i>
                    <h5 className="text-muted">Nenhum pedido encontrado</h5>
                    <p className="text-muted">Você ainda não fez nenhuma compra.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Pedido</th>
                          <th>Data</th>
                          <th>Status</th>
                          <th>Total</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pedidos.map((pedido) => (
                          <tr key={pedido.id}>
                            <td>
                              <strong>#{pedido.id}</strong>
                            </td>
                            <td>
                              {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}
                            </td>
                            <td>
                              {getStatusBadge(pedido.status)}
                            </td>
                            <td>
                              <strong>R$ {(pedido.valor_total || 0).toFixed(2)}</strong>
                            </td>
                            <td>
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => {
                                  // Implementar visualização detalhada do pedido

                                }}
                              >
                                <i className="bi bi-eye me-1"></i>
                                Ver Detalhes
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Aba Endereços */}
          {activeTab === 'endereco' && (
            <div className="card border-0 shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">Endereço de Entrega</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">CEP</label>
                      <input
                        type="text"
                        className="form-control"
                        name="endereco.cep"
                        value={formData.endereco.cep}
                        onChange={handleInputChange}
                        placeholder="00000-000"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Rua</label>
                      <input
                        type="text"
                        className="form-control"
                        name="endereco.rua"
                        value={formData.endereco.rua}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-2 mb-3">
                      <label className="form-label">Número</label>
                      <input
                        type="text"
                        className="form-control"
                        name="endereco.numero"
                        value={formData.endereco.numero}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Complemento</label>
                      <input
                        type="text"
                        className="form-control"
                        name="endereco.complemento"
                        value={formData.endereco.complemento}
                        onChange={handleInputChange}
                        placeholder="Opcional"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Bairro</label>
                      <input
                        type="text"
                        className="form-control"
                        name="endereco.bairro"
                        value={formData.endereco.bairro}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Cidade</label>
                      <input
                        type="text"
                        className="form-control"
                        name="endereco.cidade"
                        value={formData.endereco.cidade}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Estado</label>
                      <select
                        className="form-select"
                        name="endereco.estado"
                        value={formData.endereco.estado}
                        onChange={handleInputChange}
                      >
                        <option value="">Selecione...</option>
                        <option value="AC">Acre</option>
                        <option value="AL">Alagoas</option>
                        <option value="AP">Amapá</option>
                        <option value="AM">Amazonas</option>
                        <option value="BA">Bahia</option>
                        <option value="CE">Ceará</option>
                        <option value="DF">Distrito Federal</option>
                        <option value="ES">Espírito Santo</option>
                        <option value="GO">Goiás</option>
                        <option value="MA">Maranhão</option>
                        <option value="MT">Mato Grosso</option>
                        <option value="MS">Mato Grosso do Sul</option>
                        <option value="MG">Minas Gerais</option>
                        <option value="PA">Pará</option>
                        <option value="PB">Paraíba</option>
                        <option value="PR">Paraná</option>
                        <option value="PE">Pernambuco</option>
                        <option value="PI">Piauí</option>
                        <option value="RJ">Rio de Janeiro</option>
                        <option value="RN">Rio Grande do Norte</option>
                        <option value="RS">Rio Grande do Sul</option>
                        <option value="RO">Rondônia</option>
                        <option value="RR">Roraima</option>
                        <option value="SC">Santa Catarina</option>
                        <option value="SP">São Paulo</option>
                        <option value="SE">Sergipe</option>
                        <option value="TO">Tocantins</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-end">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={perfilLoading}
                    >
                      {perfilLoading ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Carregando...</span>
                          </div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check2 me-2"></i>
                          Salvar Endereço
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerfilUsuario;
