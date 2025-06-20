import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { produtosService } from '../../services';

const DashboardColaborador = () => {
  const { usuario } = useAuth();
  const [estatisticas, setEstatisticas] = useState({
    produtosCadastrados: 0,
    produtosSemEstoque: 0,
    pedidosPendentes: 0,
    vendasHoje: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      setError(null);
      // Buscar estatísticas específicas para colaborador usando o serviço
      const response = await produtosService.obterEstatisticas();
      
      if (response && response.sucesso) {
        console.log('Estatísticas recebidas:', response.dados);
        setEstatisticas(response.dados);
      } else {
        const errMsg = response?.mensagem || 'Erro ao obter estatísticas';
        console.error('Resposta com erro:', errMsg);
        setError(errMsg);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setError(`Erro ao carregar estatísticas: ${error.message}`);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">
          <i className="bi bi-box-seam me-2"></i>
          Painel do Colaborador
        </h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <div className="btn-group me-2">
            <span className="badge bg-success">
              Olá, {usuario?.nome}
            </span>
          </div>
        </div>
      </div>

      {/* Exibir mensagem de erro caso ocorra */}
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button 
            className="btn btn-sm btn-outline-danger float-end" 
            onClick={carregarEstatisticas}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Tentar novamente
          </button>
        </div>
      )}

      {/* Cards de estatísticas rápidas */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-white bg-primary">
            <div className="card-header">
              <i className="bi bi-box me-2"></i>
              Produtos Cadastrados
            </div>
            <div className="card-body">
              <h4 className="card-title">{estatisticas.produtosCadastrados}</h4>
              <p className="card-text">Total no sistema</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card text-white bg-warning">
            <div className="card-header">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Sem Estoque
            </div>
            <div className="card-body">
              <h4 className="card-title">{estatisticas.produtosSemEstoque}</h4>
              <p className="card-text">Precisam reposição</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card text-white bg-info">
            <div className="card-header">
              <i className="bi bi-clock me-2"></i>
              Pedidos Pendentes
            </div>
            <div className="card-body">
              <h4 className="card-title">{estatisticas.pedidosPendentes}</h4>
              <p className="card-text">Para processar</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card text-white bg-success">
            <div className="card-header">
              <i className="bi bi-graph-up me-2"></i>
              Vendas Hoje
            </div>
            <div className="card-body">
              <h4 className="card-title">R$ {estatisticas.vendasHoje}</h4>
              <p className="card-text">Faturamento diário</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ações principais do colaborador */}
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-plus-circle me-2"></i>
                Gerenciar Produtos
              </h5>
            </div>
            <div className="card-body">
              <p className="card-text">
                Adicione novos produtos, edite informações e gerencie o catálogo.
              </p>
              <div className="d-grid gap-2">
                <Link to="/dashboard/produtos/novo" className="btn btn-primary">
                  <i className="bi bi-plus me-2"></i>
                  Adicionar Produto
                </Link>
                <Link to="/dashboard/produtos" className="btn btn-outline-primary">
                  <i className="bi bi-list me-2"></i>
                  Ver Todos os Produtos
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-boxes me-2"></i>
                Controle de Estoque
              </h5>
            </div>
            <div className="card-body">
              <p className="card-text">
                Monitore e atualize os níveis de estoque dos produtos.
              </p>
              <div className="d-grid gap-2">
                <Link to="/dashboard/estoque" className="btn btn-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Produtos em Falta
                </Link>
                <Link to="/dashboard/estoque/atualizar" className="btn btn-outline-warning">
                  <i className="bi bi-arrow-repeat me-2"></i>
                  Atualizar Estoque
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-bag-check me-2"></i>
                Processar Pedidos
              </h5>
            </div>
            <div className="card-body">
              <p className="card-text">
                Veja e processe os pedidos dos clientes.
              </p>
              <div className="d-grid gap-2">
                <Link to="/dashboard/pedidos/pendentes" className="btn btn-info">
                  <i className="bi bi-clock me-2"></i>
                  Pedidos Pendentes
                </Link>
                <Link to="/dashboard/pedidos" className="btn btn-outline-info">
                  <i className="bi bi-list-check me-2"></i>
                  Todos os Pedidos
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Relatórios Básicos
              </h5>
            </div>
            <div className="card-body">
              <p className="card-text">
                Acesse relatórios básicos de vendas e produtos.
              </p>
              <div className="d-grid gap-2">
                <Link to="/dashboard/relatorios/vendas-basico" className="btn btn-success">
                  <i className="bi bi-bar-chart me-2"></i>
                  Relatório de Vendas
                </Link>
                <Link to="/dashboard/relatorios/produtos" className="btn btn-outline-success">
                  <i className="bi bi-box me-2"></i>
                  Relatório de Produtos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Limitações do cargo */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="alert alert-info">
            <h6 className="alert-heading">
              <i className="bi bi-info-circle me-2"></i>
              Permissões do Colaborador
            </h6>
            <p className="mb-1">
              <strong>Você pode:</strong> Gerenciar produtos, controlar estoque, processar pedidos e visualizar relatórios básicos.
            </p>
            <p className="mb-0">
              <strong>Para ações avançadas:</strong> Entre em contato com seu supervisor para criação de promoções, relatórios financeiros ou gestão de marketing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardColaborador;
