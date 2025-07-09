import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './PainelColaborador.css';

const GerenciarPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('pendentes');

  useEffect(() => {
    carregarPedidos();
  }, []);

  const carregarPedidos = async () => {
    try {
      setLoading(true);
      // Como não temos pedidosService ainda, vamos simular dados
      const pedidosMock = [
        {
          id: 1,
          cliente: 'João Silva',
          status: 'pendente',
          total: 299.90,
          data: '2025-07-08',
          itens: 3
        },
        {
          id: 2,
          cliente: 'Maria Santos',
          status: 'processando',
          total: 159.90,
          data: '2025-07-08',
          itens: 2
        },
        {
          id: 3,
          cliente: 'Pedro Costa',
          status: 'enviado',
          total: 89.90,
          data: '2025-07-07',
          itens: 1
        },
        {
          id: 4,
          cliente: 'Ana Oliveira',
          status: 'entregue',
          total: 199.90,
          data: '2025-07-06',
          itens: 2
        }
      ];
      
      setPedidos(pedidosMock);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      setError('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    switch (filtro) {
      case 'pendentes':
        return pedido.status === 'pendente';
      case 'processando':
        return pedido.status === 'processando';
      case 'enviados':
        return pedido.status === 'enviado';
      case 'entregues':
        return pedido.status === 'entregue';
      default:
        return true;
    }
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      'pendente': { variant: 'warning', texto: 'Pendente' },
      'processando': { variant: 'info', texto: 'Processando' },
      'enviado': { variant: 'primary', texto: 'Enviado' },
      'entregue': { variant: 'success', texto: 'Entregue' },
      'cancelado': { variant: 'danger', texto: 'Cancelado' }
    };
    return statusMap[status] || { variant: 'secondary', texto: status };
  };

  const atualizarStatus = (pedidoId, novoStatus) => {
    setPedidos(prev => prev.map(pedido => 
      pedido.id === pedidoId ? { ...pedido, status: novoStatus } : pedido
    ));
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando pedidos...</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="dashboard-colaborador">
      <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>
              <i className="bi bi-bag-check me-2"></i>
              Gerenciar Pedidos
            </h2>
            <Link to="/admin/colaborador" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-2"></i>
              Voltar
            </Link>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Resumo rápido */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">{pedidos.filter(p => p.status === 'pendente').length}</h3>
              <p className="mb-0">Pendentes</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-info">{pedidos.filter(p => p.status === 'processando').length}</h3>
              <p className="mb-0">Processando</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">{pedidos.filter(p => p.status === 'enviado').length}</h3>
              <p className="mb-0">Enviados</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{pedidos.filter(p => p.status === 'entregue').length}</h3>
              <p className="mb-0">Entregues</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Row className="mb-3">
        <Col>
          <div className="btn-group" role="group">
            <input
              type="radio"
              className="btn-check"
              name="filtro"
              id="todos"
              checked={filtro === 'todos'}
              onChange={() => setFiltro('todos')}
            />
            <label className="btn btn-outline-primary" htmlFor="todos">
              Todos ({pedidos.length})
            </label>

            <input
              type="radio"
              className="btn-check"
              name="filtro"
              id="pendentes"
              checked={filtro === 'pendentes'}
              onChange={() => setFiltro('pendentes')}
            />
            <label className="btn btn-outline-warning" htmlFor="pendentes">
              Pendentes ({pedidos.filter(p => p.status === 'pendente').length})
            </label>

            <input
              type="radio"
              className="btn-check"
              name="filtro"
              id="processando"
              checked={filtro === 'processando'}
              onChange={() => setFiltro('processando')}
            />
            <label className="btn btn-outline-info" htmlFor="processando">
              Processando ({pedidos.filter(p => p.status === 'processando').length})
            </label>

            <input
              type="radio"
              className="btn-check"
              name="filtro"
              id="enviados"
              checked={filtro === 'enviados'}
              onChange={() => setFiltro('enviados')}
            />
            <label className="btn btn-outline-primary" htmlFor="enviados">
              Enviados ({pedidos.filter(p => p.status === 'enviado').length})
            </label>
          </div>
        </Col>
      </Row>

      {/* Tabela de pedidos */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-list me-2"></i>
                Pedidos ({pedidosFiltrados.length})
              </h5>
            </Card.Header>
            <Card.Body>
              {pedidosFiltrados.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-inbox display-1 text-muted"></i>
                  <h4 className="mt-3">Nenhum pedido encontrado</h4>
                  <p className="text-muted">Não há pedidos com o status selecionado.</p>
                </div>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Pedido #</th>
                      <th>Cliente</th>
                      <th>Data</th>
                      <th>Itens</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidosFiltrados.map((pedido) => {
                      const statusInfo = getStatusBadge(pedido.status);
                      return (
                        <tr key={pedido.id}>
                          <td>
                            <strong>#{pedido.id.toString().padStart(6, '0')}</strong>
                          </td>
                          <td>{pedido.cliente}</td>
                          <td>{new Date(pedido.data).toLocaleDateString('pt-BR')}</td>
                          <td>{pedido.itens} itens</td>
                          <td>
                            <strong>R$ {pedido.total.toFixed(2)}</strong>
                          </td>
                          <td>
                            <Badge bg={statusInfo.variant}>{statusInfo.texto}</Badge>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button variant="outline-info" size="sm" title="Ver detalhes">
                                <i className="bi bi-eye"></i>
                              </Button>
                              {pedido.status === 'pendente' && (
                                <Button 
                                  variant="outline-success" 
                                  size="sm" 
                                  title="Processar"
                                  onClick={() => atualizarStatus(pedido.id, 'processando')}
                                >
                                  <i className="bi bi-play-fill"></i>
                                </Button>
                              )}
                              {pedido.status === 'processando' && (
                                <Button 
                                  variant="outline-primary" 
                                  size="sm" 
                                  title="Marcar como enviado"
                                  onClick={() => atualizarStatus(pedido.id, 'enviado')}
                                >
                                  <i className="bi bi-truck"></i>
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    </div>
  );
};

export default GerenciarPedidos;
