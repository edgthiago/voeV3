import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { adminService } from '../../services';
import { Alert, Spinner } from 'react-bootstrap';

const DashboardSupervisor = () => {
  const { usuario } = useAuth();
  const [estatisticas, setEstatisticas] = useState({
    totalVendas: 0,
    promocoesAtivas: 0,
    campanhasAtivas: 0,
    conversaoMarketing: 0,
    colaboradoresAtivos: 0,
    metaMensal: 0,
    progressoMeta: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    carregarEstatisticas();
  }, []);
  const carregarEstatisticas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Usando o adminService para buscar as estatísticas
      const response = await adminService.obterEstatisticasSupervisor();
      
      if (response && response.sucesso) {
        console.log('Estatísticas do supervisor carregadas:', response.dados);
        setEstatisticas(response.dados);
      } else {
        throw new Error(response?.mensagem || 'Erro na resposta da API');
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setError(`Erro ao carregar estatísticas: ${error.message}`);
      
      // Dados de fallback para demonstração
      setEstatisticas({
        totalVendas: 15000,
        promocoesAtivas: 3,
        campanhasAtivas: 2,
        conversaoMarketing: 7.5,
        colaboradoresAtivos: 5,
        metaMensal: 25000,
        progressoMeta: 60
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Carregando estatísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Ocorreu um erro
        </h4>
        <p>{error}</p>
        <hr />
        <p className="mb-0">
          Tente novamente mais tarde ou entre em contato com o suporte.
        </p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">
          <i className="bi bi-bullseye me-2"></i>
          Painel do Supervisor
        </h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <div className="btn-group me-2">
            <span className="badge bg-warning">
              Olá, {usuario?.nome} - Marketing Manager
            </span>
          </div>
        </div>
      </div>

      {/* Cards de estatísticas de marketing */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-white bg-success">
            <div className="card-header">
              <i className="bi bi-graph-up me-2"></i>
              Vendas Totais
            </div>
            <div className="card-body">
              <h4 className="card-title">R$ {estatisticas.totalVendas.toLocaleString()}</h4>
              <p className="card-text">Este mês</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card text-white bg-primary">
            <div className="card-header">
              <i className="bi bi-percent me-2"></i>
              Promoções Ativas
            </div>
            <div className="card-body">
              <h4 className="card-title">{estatisticas.promocoesAtivas}</h4>
              <p className="card-text">Campanhas em andamento</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card text-white bg-info">
            <div className="card-header">
              <i className="bi bi-megaphone me-2"></i>
              Campanhas Marketing
            </div>
            <div className="card-body">
              <h4 className="card-title">{estatisticas.campanhasAtivas}</h4>
              <p className="card-text">Ativas no momento</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card text-white bg-warning">
            <div className="card-header">
              <i className="bi bi-people me-2"></i>
              Colaboradores
            </div>
            <div className="card-body">
              <h4 className="card-title">{estatisticas.colaboradoresAtivos}</h4>
              <p className="card-text">Sob sua gestão</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progresso da meta mensal */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-target me-2"></i>
                Meta de Vendas - {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Progresso da Meta</span>
                <span>{estatisticas.progressoMeta}%</span>
              </div>
              <div className="progress mb-2" style={{ height: '20px' }}>
                <div 
                  className="progress-bar bg-success" 
                  role="progressbar" 
                  style={{ width: `${Math.min(estatisticas.progressoMeta, 100)}%` }}
                >
                  R$ {estatisticas.totalVendas.toLocaleString()}
                </div>
              </div>
              <small className="text-muted">
                Meta: R$ {estatisticas.metaMensal.toLocaleString()} | 
                Faltam: R$ {Math.max(0, estatisticas.metaMensal - estatisticas.totalVendas).toLocaleString()}
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Ações principais do supervisor */}
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-percent me-2"></i>
                Gestão de Promoções
              </h5>
            </div>
            <div className="card-body">
              <p className="card-text">
                Crie e gerencie promoções, descontos e campanhas especiais.
              </p>
              <div className="d-grid gap-2">
                <Link to="/dashboard/promocoes/nova" className="btn btn-primary">
                  <i className="bi bi-plus me-2"></i>
                  Criar Promoção
                </Link>
                <Link to="/dashboard/promocoes" className="btn btn-outline-primary">
                  <i className="bi bi-list me-2"></i>
                  Gerenciar Promoções
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-megaphone me-2"></i>
                Marketing & Campanhas
              </h5>
            </div>
            <div className="card-body">
              <p className="card-text">
                Gerencie campanhas de marketing e analytics avançados.
              </p>
              <div className="d-grid gap-2">
                <Link to="/dashboard/marketing/campanhas" className="btn btn-info">
                  <i className="bi bi-lightning me-2"></i>
                  Criar Campanha
                </Link>
                <Link to="/dashboard/marketing/analytics" className="btn btn-outline-info">
                  <i className="bi bi-graph-up me-2"></i>
                  Analytics Avançado
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
                <i className="bi bi-bar-chart me-2"></i>
                Relatórios de Marketing
              </h5>
            </div>
            <div className="card-body">
              <p className="card-text">
                Acesse relatórios detalhados de vendas e performance.
              </p>
              <div className="d-grid gap-2">
                <Link to="/dashboard/relatorios/vendas" className="btn btn-success">
                  <i className="bi bi-clipboard-data me-2"></i>
                  Relatório de Vendas
                </Link>
                <Link to="/dashboard/relatorios/marketing" className="btn btn-outline-success">
                  <i className="bi bi-graph-up me-2"></i>
                  Performance Marketing
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-people me-2"></i>
                Gestão de Equipe
              </h5>
            </div>
            <div className="card-body">
              <p className="card-text">
                Gerencie colaboradores e monitore performance da equipe.
              </p>
              <div className="d-grid gap-2">
                <Link to="/dashboard/equipe/colaboradores" className="btn btn-warning">
                  <i className="bi bi-person-gear me-2"></i>
                  Gerenciar Colaboradores
                </Link>
                <Link to="/dashboard/equipe/performance" className="btn btn-outline-warning">
                  <i className="bi bi-speedometer2 me-2"></i>
                  Performance da Equipe
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acesso a funcionalidades herdadas */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-tools me-2"></i>
                Ferramentas Operacionais (Herdadas)
              </h5>
            </div>
            <div className="card-body">
              <p className="card-text mb-3">
                Como supervisor, você também tem acesso a todas as funcionalidades de colaborador:
              </p>
              <div className="row">
                <div className="col-md-4">
                  <Link to="/dashboard/produtos" className="btn btn-outline-secondary w-100 mb-2">
                    <i className="bi bi-box me-2"></i>
                    Gerenciar Produtos
                  </Link>
                </div>
                <div className="col-md-4">
                  <Link to="/dashboard/estoque" className="btn btn-outline-secondary w-100 mb-2">
                    <i className="bi bi-boxes me-2"></i>
                    Controle de Estoque
                  </Link>
                </div>
                <div className="col-md-4">
                  <Link to="/dashboard/pedidos" className="btn btn-outline-secondary w-100 mb-2">
                    <i className="bi bi-bag-check me-2"></i>
                    Processar Pedidos
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Limitações do cargo */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="alert alert-warning">
            <h6 className="alert-heading">
              <i className="bi bi-shield-check me-2"></i>
              Permissões do Supervisor
            </h6>
            <p className="mb-1">
              <strong>Você pode:</strong> Todas as funções de colaborador + gestão de marketing, promoções, campanhas, relatórios avançados e gerenciamento de colaboradores.
            </p>
            <p className="mb-0">
              <strong>Restrições:</strong> Não pode acessar configurações do sistema, relatórios financeiros completos ou gerenciar usuários de nível superior. Para isso, consulte a diretoria.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSupervisor;
