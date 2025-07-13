import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Alert, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './PainelColaborador.css';

const TodosPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [pesquisa, setPesquisa] = useState('');

  useEffect(() => {
    carregarTodosPedidos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [pedidos, filtroStatus, pesquisa]);

  const carregarTodosPedidos = async () => {
    try {
      setLoading(true);
      // Simulando dados completos de pedidos
      const pedidosCompletos = [
        {
          id: 1,
          cliente: 'João Silva',
          email: 'joao@email.com',
          status: 'pendente',
          total: 299.90,
          data: '2025-07-09T10:30:00',
          endereco: 'Rua das Flores, 123 - São Paulo/SP',
          itens: [
            { produto: 'Caderno Universitário 100 folhas', quantidade: 1, preco: 299.90 }
          ],
          pagamento: 'cartao_credito'
        },
        {
          id: 2,
          cliente: 'Maria Santos',
          email: 'maria@email.com',
          status: 'processando',
          total: 159.90,
          data: '2025-07-09T09:15:00',
          endereco: 'Av. Paulista, 456 - São Paulo/SP',
          itens: [
            { produto: 'Caneta Esferográfica Azul', quantidade: 1, preco: 159.90 }
          ],
          pagamento: 'pix'
        },
        {
          id: 3,
          cliente: 'Pedro Costa',
          email: 'pedro@email.com',
          status: 'enviado',
          total: 89.90,
          data: '2025-07-08T15:22:00',
          endereco: 'Rua da Paz, 789 - Rio de Janeiro/RJ',
          itens: [
            { produto: 'Chinelo Havaianas', quantidade: 1, preco: 89.90 }
          ],
          pagamento: 'cartao_debito'
        },
        {
          id: 4,
          cliente: 'Ana Oliveira',
          email: 'ana@email.com',
          status: 'entregue',
          total: 199.90,
          data: '2025-07-07T11:45:00',
          endereco: 'Av. Brasil, 321 - Belo Horizonte/MG',
          itens: [
            { produto: 'Lápis HB Kit 12 unidades', quantidade: 1, preco: 199.90 }
          ],
          pagamento: 'boleto'
        },
        {
          id: 5,
          cliente: 'Carlos Mendes',
          email: 'carlos@email.com',
          status: 'cancelado',
          total: 449.90,
          data: '2025-07-06T14:20:00',
          endereco: 'Rua das Palmeiras, 654 - Porto Alegre/RS',
          itens: [
            { produto: 'Estojo Triplo com Compartimentos', quantidade: 1, preco: 449.90 }
          ],
          pagamento: 'cartao_credito'
        },
        {
          id: 6,
          cliente: 'Fernanda Lima',
          email: 'fernanda@email.com',
          status: 'entregue',
          total: 129.90,
          data: '2025-07-05T16:10:00',
          endereco: 'Rua dos Jasmins, 987 - Salvador/BA',
          itens: [
            { produto: 'Sandália Melissa', quantidade: 1, preco: 129.90 }
          ],
          pagamento: 'pix'
        }
      ];

      setPedidos(pedidosCompletos);
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      setError('Erro ao carregar pedidos. Dados em modo demonstração.');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...pedidos];

    // Filtrar por status
    if (filtroStatus !== 'todos') {
      resultado = resultado.filter(pedido => pedido.status === filtroStatus);
    }

    // Filtrar por pesquisa (cliente ou ID)
    if (pesquisa.trim()) {
      const termoPesquisa = pesquisa.toLowerCase();
      resultado = resultado.filter(pedido => 
        pedido.cliente.toLowerCase().includes(termoPesquisa) ||
        pedido.id.toString().includes(termoPesquisa) ||
        pedido.email.toLowerCase().includes(termoPesquisa)
      );
    }

    setPedidosFiltrados(resultado);
  };

  const obterCorStatus = (status) => {
    switch (status) {
      case 'pendente': return 'warning';
      case 'processando': return 'info';
      case 'enviado': return 'primary';
      case 'entregue': return 'success';
      case 'cancelado': return 'danger';
      default: return 'secondary';
    }
  };

  const obterTextoStatus = (status) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'processando': return 'Processando';
      case 'enviado': return 'Enviado';
      case 'entregue': return 'Entregue';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const contarPorStatus = (status) => {
    return pedidos.filter(pedido => pedido.status === status).length;
  };

  if (loading) {
    return (
      <Container fluid className="mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando todos os pedidos...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2><i className="bi bi-list-check me-2"></i>Todos os Pedidos</h2>
              <p className="text-muted">Visualize e gerencie todos os pedidos do sistema</p>
            </div>
            <Link to="/admin/colaborador" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-2"></i>
              Voltar ao Painel
            </Link>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="warning" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Estatísticas rápidas */}
      <Row className="mb-4">
        <Col md={2}>
          <Card className="text-center border-warning">
            <Card.Body className="bg-warning bg-opacity-10">
              <h5 className="text-warning">{contarPorStatus('pendente')}</h5>
              <small className="text-dark">Pendentes</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-info">
            <Card.Body className="bg-info bg-opacity-10">
              <h5 className="text-info">{contarPorStatus('processando')}</h5>
              <small className="text-dark">Processando</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-primary">
            <Card.Body className="bg-primary bg-opacity-10">
              <h5 className="text-primary">{contarPorStatus('enviado')}</h5>
              <small className="text-dark">Enviados</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-success">
            <Card.Body className="bg-success bg-opacity-10">
              <h5 className="text-success">{contarPorStatus('entregue')}</h5>
              <small className="text-dark">Entregues</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-danger">
            <Card.Body className="bg-danger bg-opacity-10">
              <h5 className="text-danger">{contarPorStatus('cancelado')}</h5>
              <small className="text-dark">Cancelados</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center border-secondary">
            <Card.Body className="bg-secondary bg-opacity-10">
              <h5 className="text-secondary">{pedidos.length}</h5>
              <small className="text-dark">Total</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Label>Filtrar por Status:</Form.Label>
              <Form.Select 
                value={filtroStatus} 
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="todos">Todos os Status</option>
                <option value="pendente">Pendente</option>
                <option value="processando">Processando</option>
                <option value="enviado">Enviado</option>
                <option value="entregue">Entregue</option>
                <option value="cancelado">Cancelado</option>
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label>Pesquisar:</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Buscar por cliente, email ou ID..."
                  value={pesquisa}
                  onChange={(e) => setPesquisa(e.target.value)}
                />
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabela de pedidos */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-table me-2"></i>
            Lista de Pedidos ({pedidosFiltrados.length})
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          {pedidosFiltrados.length === 0 ? (
            <div className="text-center p-4">
              <i className="bi bi-inbox display-1 text-muted"></i>
              <h5 className="mt-3">Nenhum pedido encontrado</h5>
              <p className="text-muted">
                {pesquisa ? 'Tente ajustar os filtros de pesquisa.' : 'Não há pedidos para exibir.'}
              </p>
            </div>
          ) : (
            <Table responsive striped hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Pagamento</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.map(pedido => (
                  <tr key={pedido.id}>
                    <td>
                      <strong>#{pedido.id}</strong>
                    </td>
                    <td>
                      <div>
                        <strong>{pedido.cliente}</strong>
                        <br />
                        <small className="text-muted">{pedido.email}</small>
                      </div>
                    </td>
                    <td>
                      <small>{formatarData(pedido.data)}</small>
                    </td>
                    <td>
                      <Badge bg={obterCorStatus(pedido.status)}>
                        {obterTextoStatus(pedido.status)}
                      </Badge>
                    </td>
                    <td>
                      <strong>R$ {Number(pedido.total || pedido.valor_total || 0).toFixed(2)}</strong>
                    </td>
                    <td>
                      <small className="text-muted">
                        {pedido.pagamento.replace('_', ' ').toUpperCase()}
                      </small>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          title="Ver detalhes"
                        >
                          <i className="bi bi-eye"></i>
                        </Button>
                        {pedido.status === 'pendente' && (
                          <Link
                            to="/dashboard/pedidos/pendentes"
                            className="btn btn-outline-warning btn-sm"
                            title="Processar"
                          >
                            <i className="bi bi-gear"></i>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Links de ação rápida */}
      <Row className="mt-4">
        <Col>
          <Card className="border-primary">
            <Card.Body className="text-center">
              <h6>Ações Rápidas</h6>
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <Link to="/dashboard/pedidos/pendentes" className="btn btn-warning btn-sm">
                  <i className="bi bi-clock me-2"></i>
                  Ver Pendentes
                </Link>
                <Button variant="outline-info" size="sm" onClick={carregarTodosPedidos}>
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Atualizar Lista
                </Button>
                <Link to="/dashboard/relatorios/vendas-basico" className="btn btn-outline-success btn-sm">
                  <i className="bi bi-graph-up me-2"></i>
                  Relatório de Vendas
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TodosPedidos;
