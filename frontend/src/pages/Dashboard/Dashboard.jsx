// Painel Administrativo Principal
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DashboardHome from '../../components/admin/DashboardHome';
import GerenciarUsuarios from '../../components/admin/GerenciarUsuarios';
import RelatoriosVendas from '../../components/admin/RelatoriosVendas';
import RelatoriosEstoque from '../../components/admin/RelatoriosEstoque';
import VisualizarLogs from '../../components/admin/VisualizarLogs';
import GerenciarPromocoes from '../../components/admin/GerenciarPromocoes';
import Configuracoes from '../../components/admin/Configuracoes';
import './Dashboard.css';

const Dashboard = () => {
  const { usuario, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar se o usuário tem permissão para acessar o painel administrativo
    const tipoUsuario = usuario?.tipo_usuario || usuario?.nivel_acesso || usuario?.tipo;
    const hierarquia = ['visitante', 'usuario', 'colaborador', 'supervisor', 'diretor'];
    const nivelAtual = hierarquia.indexOf(tipoUsuario);
    const nivelMinimo = hierarquia.indexOf('colaborador');
    
    if (nivelAtual < nivelMinimo) {
      setError('Você não tem permissão para acessar o painel administrativo.');
      setLoading(false);
      return;
    }
    setLoading(false);
  }, [usuario, hasPermission]);

  if (loading) {
    return <LoadingSpinner message="Carregando painel administrativo..." />;
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Acesso Negado</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardHome />;
      case 'usuarios':
        return hasPermission('diretor') ? <GerenciarUsuarios /> : <Alert variant="warning">Acesso restrito a diretores</Alert>;
      case 'promocoes':
        return hasPermission('supervisor') ? <GerenciarPromocoes /> : <Alert variant="warning">Acesso restrito a supervisores+</Alert>;
      case 'vendas':
        return hasPermission('supervisor') ? <RelatoriosVendas /> : <Alert variant="warning">Acesso restrito a supervisores+</Alert>;
      case 'estoque':
        return <RelatoriosEstoque />;
      case 'logs':
        return hasPermission('diretor') ? <VisualizarLogs /> : <Alert variant="warning">Acesso restrito a diretores</Alert>;
      case 'configuracoes':
        return hasPermission('diretor') ? <Configuracoes /> : <Alert variant="warning">Acesso restrito a diretores</Alert>;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <Container fluid className="dashboard-container">
      <Row>
        {/* Sidebar */}
        <Col md={3} lg={2} className="dashboard-sidebar bg-dark text-white min-vh-100 p-0">
          <div className="p-3">
            <h4 className="text-center mb-4">
              <i className="bi bi-speedometer2 me-2"></i>
              Painel Admin
            </h4>
            <div className="text-center mb-3">
              <div className="user-info">
                <i className="bi bi-person-circle fs-1"></i>
                <div className="mt-2">
                  <small className="d-block">{usuario?.nome}</small>
                  <small className="text-muted">{usuario?.tipo_usuario || usuario?.nivel_acesso || usuario?.tipo}</small>
                </div>
              </div>
            </div>
          </div>

          <Nav variant="pills" className="flex-column">
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'home'}
                onClick={() => setActiveTab('home')}
                className="text-white"
              >
                <i className="bi bi-house me-2"></i>
                Dashboard
              </Nav.Link>
            </Nav.Item>

            {hasPermission('diretor') && (
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'usuarios'}
                  onClick={() => setActiveTab('usuarios')}
                  className="text-white"
                >
                  <i className="bi bi-people me-2"></i>
                  Usuários
                </Nav.Link>
              </Nav.Item>
            )}

            {hasPermission('supervisor') && (
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'promocoes'}
                  onClick={() => setActiveTab('promocoes')}
                  className="text-white"
                >
                  <i className="bi bi-tag me-2"></i>
                  Promoções
                </Nav.Link>
              </Nav.Item>
            )}

            {hasPermission('supervisor') && (
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'vendas'}
                  onClick={() => setActiveTab('vendas')}
                  className="text-white"
                >
                  <i className="bi bi-graph-up me-2"></i>
                  Relatórios de Vendas
                </Nav.Link>
              </Nav.Item>
            )}

            <Nav.Item>
              <Nav.Link
                active={activeTab === 'estoque'}
                onClick={() => setActiveTab('estoque')}
                className="text-white"
              >
                <i className="bi bi-box me-2"></i>
                Relatórios de Estoque
              </Nav.Link>
            </Nav.Item>

            {hasPermission('diretor') && (
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'logs'}
                  onClick={() => setActiveTab('logs')}
                  className="text-white"
                >
                  <i className="bi bi-file-text me-2"></i>
                  Logs do Sistema
                </Nav.Link>
              </Nav.Item>
            )}

            {hasPermission('diretor') && (
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'configuracoes'}
                  onClick={() => setActiveTab('configuracoes')}
                  className="text-white"
                >
                  <i className="bi bi-gear me-2"></i>
                  Configurações
                </Nav.Link>
              </Nav.Item>
            )}
          </Nav>
        </Col>

        {/* Content */}
        <Col md={9} lg={10} className="dashboard-content p-4">
          {renderContent()}
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
