import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Alert, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { pedidosService } from '../../services/index.js';
import './PainelColaborador.css';

const PedidosPendentes = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [novoStatus, setNovoStatus] = useState('');

  useEffect(() => {
    carregarPedidosPendentes();
  }, []);

  const carregarPedidosPendentes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Tentar buscar da API real
      const response = await pedidosService.buscarPendentes();
      
      if (response.sucesso && response.dados) {
        console.log('✅ Pedidos carregados da API:', response.dados.length);
        
        // Mapear dados da API para a estrutura esperada pelo componente
        const pedidosMapeados = response.dados.map(pedido => ({
          id: pedido.id,
          cliente: 'Cliente não informado', // API não retorna dados do cliente
          email: 'email@nao-informado.com',
          telefone: '(00) 00000-0000',
          status: pedido.status_pedido,
          total: parseFloat(pedido.valor_total),
          data: pedido.data_pedido,
          endereco: 'Endereço não informado',
          itens: pedido.itens || [],
          pagamento: pedido.forma_pagamento,
          observacoes: pedido.observacoes || ''
        }));
        
        setPedidos(pedidosMapeados);
      } else {
        throw new Error(response.mensagem || 'Erro ao carregar pedidos');
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos pendentes:', error);
      
      // Definir mensagem de erro para exibição
      setError({
        message: `Erro ao conectar com a API: ${error.message}`,
        details: 'Verifique se você está logado e se o backend está funcionando.'
      });
      
      // Usar dados de demonstração apenas como último recurso
      console.log('⚠️ Falha na API, usando dados de demonstração. Erro:', error.message);
      const pedidosPendentesMock = [
        {
          id: 1,
          cliente: 'João Silva',
          email: 'joao@email.com',
          telefone: '(11) 99999-9999',
          status: 'pendente',
          total: 299.90,
          data: '2025-07-09T10:30:00',
          endereco: 'Rua das Flores, 123 - São Paulo/SP',
          itens: [
            { produto: 'Caderno Universitário 100 folhas', quantidade: 1, preco: 299.90 }
          ],
          pagamento: 'cartao_credito',
          observacoes: 'Entrega urgente'
        },
        {
          id: 2,
          cliente: 'Maria Santos',
          email: 'maria@email.com',
          telefone: '(11) 88888-8888',
          status: 'pendente',
          total: 159.90,
          data: '2025-07-09T09:15:00',
          endereco: 'Av. Paulista, 456 - São Paulo/SP',
          itens: [
            { produto: 'Caneta Esferográfica Azul', quantidade: 1, preco: 159.90 }
          ],
          pagamento: 'pix',
          observacoes: ''
        },
        {
          id: 3,
          cliente: 'Pedro Costa',
          email: 'pedro@email.com',
          telefone: '(11) 77777-7777',
          status: 'pendente',
          total: 179.80,
          data: '2025-07-09T08:45:00',
          endereco: 'Rua da Liberdade, 789 - São Paulo/SP',
          itens: [
            { produto: 'Papel A4 Sulfite 500 folhas', quantidade: 2, preco: 89.90 }
          ],
          pagamento: 'boleto',
          observacoes: 'Deixar com porteiro'
        },
        {
          id: 4,
          cliente: 'Ana Oliveira',
          email: 'ana@email.com',
          telefone: '(11) 66666-6666',
          status: 'pendente',
          total: 319.80,
          data: '2025-07-08T16:20:00',
          endereco: 'Rua Oscar Freire, 321 - São Paulo/SP',
          itens: [
            { produto: 'Marcador Permanente Preto', quantidade: 1, preco: 139.90 },
            { produto: 'Lápis HB Kit 12 unidades', quantidade: 2, preco: 89.95 }
          ],
          pagamento: 'cartao_debito',
          observacoes: 'Andar 12, apt 121'
        }
      ];
      
      setPedidos(pedidosPendentesMock);
      setError(`API não disponível (${error.message}) - Usando dados de demonstração`);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalStatus = (pedido) => {
    setPedidoSelecionado(pedido);
    setNovoStatus(pedido.status);
    setShowModal(true);
  };

  const atualizarStatus = async () => {
    try {
      console.log(`Atualizando pedido ${pedidoSelecionado.id} para status: ${novoStatus}`);
      
      // Simular atualização
      setPedidos(prev => prev.map(pedido => 
        pedido.id === pedidoSelecionado.id 
          ? { ...pedido, status: novoStatus }
          : pedido
      ));
      
      setShowModal(false);
      setPedidoSelecionado(null);
      setNovoStatus('');
      
      // Se o status mudou para algo diferente de 'pendente', remover da lista
      if (novoStatus !== 'pendente') {
        setTimeout(() => {
          setPedidos(prev => prev.filter(pedido => pedido.id !== pedidoSelecionado.id));
        }, 1000);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setError('Erro ao atualizar status do pedido');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pendente': { variant: 'warning', text: 'Pendente' },
      'processando': { variant: 'info', text: 'Processando' },
      'enviado': { variant: 'primary', text: 'Enviado' },
      'entregue': { variant: 'success', text: 'Entregue' },
      'cancelado': { variant: 'danger', text: 'Cancelado' }
    };
    
    return statusConfig[status] || { variant: 'secondary', text: 'Desconhecido' };
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  if (loading) {
    return (
      <div className="dashboard-colaborador">
        <Container fluid className="py-4">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="mt-3">Carregando pedidos pendentes...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="dashboard-colaborador">
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <h2>
                <i className="bi bi-clock me-2"></i>
                Pedidos Pendentes
              </h2>
              <Link to="/dashboard/pedidos" className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left me-2"></i>
                Todos os Pedidos
              </Link>
            </div>
          </Col>
        </Row>

        {error && (
          <Alert variant="warning" className="mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={carregarPedidosPendentes}
                disabled={loading}
              >
                {loading ? 'Carregando...' : 'Tentar Novamente'}
              </Button>
            </div>
          </Alert>
        )}

        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <i className="bi bi-clock text-warning display-6"></i>
                <h4 className="mt-2">{pedidos.length}</h4>
                <p className="text-muted mb-0">Pedidos Pendentes</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <i className="bi bi-currency-dollar text-success display-6"></i>
                <h4 className="mt-2">
                  {formatarMoeda(pedidos.reduce((sum, pedido) => sum + pedido.total, 0))}
                </h4>
                <p className="text-muted mb-0">Valor Total</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <i className="bi bi-person text-primary display-6"></i>
                <h4 className="mt-2">{new Set(pedidos.map(p => p.cliente)).size}</h4>
                <p className="text-muted mb-0">Clientes</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <i className="bi bi-calendar text-info display-6"></i>
                <h4 className="mt-2">Hoje</h4>
                <p className="text-muted mb-0">Últimos Pedidos</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card>
          <Card.Header>
            <h5 className="mb-0">Lista de Pedidos Pendentes</h5>
          </Card.Header>
          <Card.Body>
            {pedidos.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-check-circle text-success display-4"></i>
                <h4 className="mt-3">Parabéns!</h4>
                <p className="text-muted">Não há pedidos pendentes no momento.</p>
                <Link to="/dashboard/pedidos" className="btn btn-primary">
                  Ver Todos os Pedidos
                </Link>
              </div>
            ) : (
              <Table responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Data/Hora</th>
                    <th>Itens</th>
                    <th>Total</th>
                    <th>Pagamento</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((pedido) => {
                    const statusBadge = getStatusBadge(pedido.status || pedido.status_pedido);
                    return (
                      <tr key={pedido.id}>
                        <td>
                          <strong>#{pedido.id}</strong>
                        </td>
                        <td>
                          <div>
                            <strong>{pedido.cliente}</strong>
                            <br />
                            <small className="text-muted">{pedido.email}</small>
                            <br />
                            <small className="text-muted">{pedido.telefone}</small>
                          </div>
                        </td>
                        <td>
                          <small>{formatarData(pedido.data)}</small>
                        </td>
                        <td>
                          <div>
                            {pedido.itens && pedido.itens.length > 0 ? (
                              pedido.itens.map((item, index) => (
                                <div key={index} className="mb-1">
                                  <small>
                                    {item.quantidade}x {item.nome || item.produto}
                                    <br />
                                    <span className="text-success">
                                      {formatarMoeda(item.preco_unitario || item.preco)}
                                    </span>
                                  </small>
                                </div>
                              ))
                            ) : (
                              <small className="text-muted">Itens não informados</small>
                            )}
                          </div>
                        </td>
                        <td>
                          <strong className="text-success">
                            {formatarMoeda(pedido.total)}
                          </strong>
                        </td>
                        <td>
                          <Badge bg="secondary">
                            {pedido.pagamento.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={statusBadge.variant}>
                            {statusBadge.text}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => abrirModalStatus(pedido)}
                            className="me-1"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-info"
                            title="Ver Detalhes"
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* Modal para atualizar status */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Atualizar Status do Pedido</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {pedidoSelecionado && (
              <div>
                <p><strong>Pedido:</strong> #{pedidoSelecionado.id}</p>
                <p><strong>Cliente:</strong> {pedidoSelecionado.cliente}</p>
                <p><strong>Total:</strong> {formatarMoeda(pedidoSelecionado.total)}</p>
                
                <Form.Group className="mb-3">
                  <Form.Label>Novo Status</Form.Label>
                  <Form.Select
                    value={novoStatus}
                    onChange={(e) => setNovoStatus(e.target.value)}
                  >
                    <option value="pendente">Pendente</option>
                    <option value="processando">Processando</option>
                    <option value="enviado">Enviado</option>
                    <option value="entregue">Entregue</option>
                    <option value="cancelado">Cancelado</option>
                  </Form.Select>
                </Form.Group>

                {pedidoSelecionado.observacoes && (
                  <div>
                    <strong>Observações:</strong>
                    <p className="text-muted">{pedidoSelecionado.observacoes}</p>
                  </div>
                )}

                <div>
                  <strong>Endereço de Entrega:</strong>
                  <p className="text-muted">{pedidoSelecionado.endereco}</p>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={atualizarStatus}>
              Atualizar Status
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default PedidosPendentes;
