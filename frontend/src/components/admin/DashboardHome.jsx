import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { adminService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import DashboardColaborador from './DashboardColaborador';
import DashboardSupervisor from './DashboardSupervisor';

const DashboardHome = () => {
  const { usuario } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Garantir que o token está disponível antes de carregar o dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verificar se o token é válido
      import('../../services/api').then(module => {
        const apiService = module.default;
        apiService.setToken(token);
      });
    }
    
    carregarDashboard();
  }, []);const carregarDashboard = async () => {
    try {
      setLoading(true);
      console.log('Iniciando carregamento do dashboard...');
      console.log('Usuário atual:', usuario);
      
      // Verificar token antes de fazer a requisição
      const token = localStorage.getItem('token');
      console.log('Token disponível:', !!token);
      
      const response = await adminService.obterDashboard();
      console.log('Resposta do dashboard:', response);
      
      if (response && response.sucesso) {
        console.log('Dados do dashboard recebidos com sucesso:', response.dados);
        
        if (!response.dados) {
          console.error('Resposta sem dados!');
          setError('Erro: O servidor retornou uma resposta vazia.');
          return;
        }
        
        // Verificação detalhada dos dados recebidos
        const { usuarios, produtos, carrinho, promocoes } = response.dados;
        console.log('Usuários details:', JSON.stringify(usuarios));
        console.log('Produtos details:', JSON.stringify(produtos));
        console.log('Carrinho details:', JSON.stringify(carrinho));
        console.log('Promoções details:', JSON.stringify(promocoes));
        
        setDashboardData(response.dados);
      } else {
        console.error('Erro na resposta do dashboard:', response);
        setError('Erro ao carregar dados do dashboard: ' + (response?.mensagem || 'Resposta inválida'));
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setError('Erro ao conectar com o servidor: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  // Verificar tipo de usuário e mostrar dashboard apropriado
  if (usuario?.tipo_usuario === 'colaborador') {
    return <DashboardColaborador />;
  }
  
  if (usuario?.tipo_usuario === 'supervisor') {
    return <DashboardSupervisor />;
  }

  // Para diretor, continua com o dashboard completo original
  if (loading) {
    return (
      <div className="admin-loading">
        <Spinner animation="border" className="mb-3" />
        <p>Carregando dashboard...</p>
      </div>
    );
  }
  if (error) {
    return (
      <Alert variant="danger" className="admin-alert">
        <Alert.Heading>Erro</Alert.Heading>
        <p>{error}</p>
        <hr />
        <div className="d-flex justify-content-between">
          <button 
            className="btn btn-outline-danger" 
            onClick={() => window.location.href = '/entrar'}
          >
            Voltar ao Login
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              carregarDashboard();
            }}
          >
            Tentar Novamente
          </button>
        </div>
      </Alert>
    );
  }

  const { usuarios, produtos, carrinho, promocoes } = dashboardData || {};

  // Função para verificar se o usuário tem a permissão necessária
  const hasPermission = (role) => {
    if (!usuario) return false;
    const userRole = usuario.tipo_usuario || usuario.nivel_acesso || usuario.tipo;
    if (role === 'colaborador') return ['colaborador', 'supervisor', 'diretor'].includes(userRole);
    if (role === 'supervisor') return ['supervisor', 'diretor'].includes(userRole);
    if (role === 'diretor') return ['diretor'].includes(userRole);
    return false;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-speedometer2 me-2"></i>
          Dashboard Administrativo
        </h2>
        <div className="text-muted">
          Bem-vindo, {usuario?.nome}!
        </div>
      </div>

      {/* Cards de estatísticas principais */}
      <Row className="mb-4">        <Col md={3} className="mb-3">
          <Card className="dashboard-card stat-card">
            <Card.Body>
              <i className="bi bi-people fs-1 text-primary mb-3"></i>
              <div className="stat-number">{usuarios?.total_usuarios || 0}</div>
              <div className="stat-label">Total de Usuários</div>
              {hasPermission('diretor') && (
                <small className="text-muted">
                  {usuarios?.usuarios_ativos || 0} ativos
                </small>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="dashboard-card stat-card">
            <Card.Body>
              <i className="bi bi-box fs-1 text-success mb-3"></i>
              <div className="stat-number">{produtos?.total_produtos || 0}</div>
              <div className="stat-label">Total de Produtos</div>
              <small className="text-muted">
                {produtos?.produtos_em_estoque || 0} em estoque
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="dashboard-card stat-card">
            <Card.Body>
              <i className="bi bi-cart fs-1 text-warning mb-3"></i>
              <div className="stat-number">{carrinho?.total_itens || 0}</div>
              <div className="stat-label">Itens em Carrinhos</div>
              <small className="text-muted">
                {carrinho?.carrinho_ativos || 0} carrinhos ativos
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="dashboard-card stat-card">
            <Card.Body>
              <i className="bi bi-tag fs-1 text-danger mb-3"></i>
              <div className="stat-number">{promocoes?.promocoes_totais || 0}</div>
              <div className="stat-label">Promoções</div>
              <small className="text-muted">
                {promocoes?.promocoes_ativas || 0} ativas
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Informações adicionais baseadas no nível de acesso */}
      <Row>
        <Col md={8}>
          <Card className="dashboard-card mb-4">
            <Card.Header>
              <i className="bi bi-graph-up me-2"></i>
              Visão Geral do Sistema
            </Card.Header>
            <Card.Body>              <Row>                <Col md={6}>
                  <h6>Produtos</h6>
                  <ul className="list-unstyled">
                    <li>• Total: {produtos?.total_produtos || 0}</li>
                    <li>• Com estoque: {produtos?.produtos_em_estoque || 0}</li>
                    <li>• Estoque baixo: {produtos?.produtos_estoque_baixo || 0}</li>
                    <li>• Sem estoque: {produtos?.produtos_sem_estoque || 0}</li>
                  </ul>
                  
                  <h6 className="mt-4">Carrinhos</h6>
                  <ul className="list-unstyled">
                    <li>• Carrinhos ativos: {carrinho?.carrinho_ativos || 0}</li>
                    <li>• Total de itens: {carrinho?.total_itens || 0}</li>
                    <li>• Valor médio: R$ {Number(carrinho?.valor_medio_carrinho || 0).toFixed(2)}</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h6>Usuários</h6>
                  <ul className="list-unstyled">
                    <li>• Total: {usuarios?.total_usuarios || 0}</li>
                    <li>• Ativos: {usuarios?.usuarios_ativos || 0}</li>
                    <li>• Colaboradores: {usuarios?.usuarios_por_nivel?.colaborador || 0}</li>
                    <li>• Supervisores: {usuarios?.usuarios_por_nivel?.supervisor || 0}</li>
                    <li>• Diretores: {usuarios?.usuarios_por_nivel?.diretor || 0}</li>
                  </ul>
                  
                  <h6 className="mt-4">Promoções</h6>
                  <ul className="list-unstyled">
                    <li>• Ativas: {promocoes?.promocoes_ativas || 0}</li>
                    <li>• Total: {promocoes?.promocoes_totais || 0}</li>
                    <li>• Desconto médio: {promocoes?.desconto_medio ? `${Number(promocoes.desconto_medio).toFixed(0)}%` : '0%'}</li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="dashboard-card mb-4">
            <Card.Header>
              <i className="bi bi-person-badge me-2"></i>
              Meu Perfil
            </Card.Header>
            <Card.Body>              <div className="text-center">
                <i className="bi bi-person-circle fs-1 text-primary mb-3"></i>
                <h6>{usuario?.nome}</h6>
                <span className={`badge nivel-${usuario?.tipo_usuario || usuario?.nivel_acesso}`}>
                  {(usuario?.tipo_usuario || usuario?.nivel_acesso || '')?.toUpperCase()}
                </span>
                <hr />
                <small className="text-muted">
                  <i className="bi bi-envelope me-1"></i>
                  {usuario?.email}
                </small>
              </div>
            </Card.Body>
          </Card>

          {hasPermission('supervisor') && (
            <Card className="dashboard-card">
              <Card.Header>
                <i className="bi bi-exclamation-triangle me-2"></i>
                Alertas
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">                  {produtos?.produtos_estoque_baixo > 0 && (
                    <Alert variant="warning" className="mb-2 py-2">
                      <small>
                        <i className="bi bi-box me-1"></i>
                        {produtos.produtos_estoque_baixo} produtos com estoque baixo
                      </small>
                    </Alert>
                  )}
                  {promocoes?.promocoes_expirando > 0 && (
                    <Alert variant="info" className="mb-2 py-2">
                      <small>
                        <i className="bi bi-clock me-1"></i>
                        {promocoes.promocoes_expirando} promoções expirando
                      </small>
                    </Alert>
                  )}
                  {!produtos?.produtos_estoque_baixo && !promocoes?.promocoes_expirando && (
                    <div className="text-center text-muted">
                      <i className="bi bi-check-circle me-1"></i>
                      Nenhum alerta
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Logs recentes para diretores */}
      {hasPermission('diretor') && dashboardData?.logs_recentes && (
        <Row>
          <Col>
            <Card className="dashboard-card">
              <Card.Header>
                <i className="bi bi-file-text me-2"></i>
                Atividades Recentes
              </Card.Header>
              <Card.Body>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {dashboardData.logs_recentes.length > 0 ? (
                    dashboardData.logs_recentes.map((log, index) => (
                      <div key={index} className="d-flex align-items-center py-2 border-bottom">                        <div className="flex-grow-1">
                          <small className="text-muted">
                            {new Date(log.data_acao).toLocaleString('pt-BR')}
                          </small>
                          <div>{log.acao}</div>
                        </div>
                        <small className="text-muted">
                          {log.usuario_nome || 'Sistema'}
                        </small>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted py-3">
                      Nenhuma atividade recente
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default DashboardHome;
