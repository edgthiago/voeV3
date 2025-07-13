import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './PainelColaborador.css';

const RelatoriosColaborador = () => {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simular dados de vendas
    const vendasMock = [
      { produto: 'Caderno Universitário 100 folhas', quantidade: 15, total: 2250.00, data: '2025-07-08' },
      { produto: 'Caneta Esferográfica Azul', quantidade: 8, total: 1600.00, data: '2025-07-08' },
      { produto: 'Papel A4 Sulfite 500 folhas', quantidade: 12, total: 1080.00, data: '2025-07-07' },
      { produto: 'Marcador Permanente Preto', quantidade: 20, total: 1400.00, data: '2025-07-07' },
      { produto: 'Lápis HB Kit 12 unidades', quantidade: 25, total: 1875.00, data: '2025-07-06' }
    ];
    
    setVendas(vendasMock);
  }, []);

  const totalVendas = vendas.reduce((sum, venda) => sum + venda.total, 0);
  const totalQuantidade = vendas.reduce((sum, venda) => sum + venda.quantidade, 0);

  return (
    <div className="dashboard-colaborador">
      <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>
              <i className="bi bi-graph-up me-2"></i>
              Relatórios Básicos
            </h2>
            <Link to="/admin/colaborador" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-2"></i>
              Voltar
            </Link>
          </div>
        </Col>
      </Row>

      <Alert variant="info" className="mb-4">
        <Alert.Heading>
          <i className="bi bi-info-circle me-2"></i>
          Relatórios do Colaborador
        </Alert.Heading>
        <p className="mb-0">
          Como colaborador, você tem acesso aos relatórios básicos de vendas e produtos. 
          Para relatórios financeiros detalhados, entre em contato com seu supervisor.
        </p>
      </Alert>

      {/* Resumo de vendas */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center border-success">
            <Card.Body>
              <h3 className="text-success">R$ {Number(totalVendas || 0).toFixed(2)}</h3>
              <p className="mb-0">Total em Vendas</p>
              <small className="text-muted">Últimos 7 dias</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center border-primary">
            <Card.Body>
              <h3 className="text-primary">{totalQuantidade}</h3>
              <p className="mb-0">Produtos Vendidos</p>
              <small className="text-muted">Últimos 7 dias</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center border-info">
            <Card.Body>
              <h3 className="text-info">{vendas.length}</h3>
              <p className="mb-0">Transações</p>
              <small className="text-muted">Últimos 7 dias</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Relatório de vendas por produto */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-bar-chart me-2"></i>
                Vendas por Produto - Últimos 7 dias
              </h5>
            </Card.Header>
            <Card.Body>
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Quantidade</th>
                    <th>Total (R$)</th>
                    <th>Última Venda</th>
                    <th>% do Total</th>
                  </tr>
                </thead>
                <tbody>
                  {vendas.map((venda, index) => {
                    const percentual = Number((venda.total || 0) / (totalVendas || 1) * 100).toFixed(1);
                    return (
                      <tr key={index}>
                        <td>
                          <strong>{venda.produto}</strong>
                        </td>
                        <td>
                          <span className="badge bg-primary">{venda.quantidade}</span>
                        </td>
                        <td>
                          <strong>R$ {Number(venda.total || 0).toFixed(2)}</strong>
                        </td>
                        <td>
                          {new Date(venda.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div 
                              className="progress me-2" 
                              style={{width: '60px', height: '10px'}}
                            >
                              <div 
                                className="progress-bar bg-success" 
                                style={{width: `${percentual}%`}}
                              ></div>
                            </div>
                            <small>{percentual}%</small>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Cards de ações adicionais */}
      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <i className="bi bi-download me-2"></i>
                Exportar Relatórios
              </h6>
            </Card.Header>
            <Card.Body>
              <p className="card-text">
                Exporte os relatórios em diferentes formatos para análise offline.
              </p>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-success" disabled>
                  <i className="bi bi-file-earmark-excel me-2"></i>
                  Exportar para Excel (Em breve)
                </button>
                <button className="btn btn-outline-danger" disabled>
                  <i className="bi bi-file-earmark-pdf me-2"></i>
                  Exportar para PDF (Em breve)
                </button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">
                <i className="bi bi-calendar-range me-2"></i>
                Período dos Relatórios
              </h6>
            </Card.Header>
            <Card.Body>
              <p className="card-text">
                Personalize o período dos seus relatórios.
              </p>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-info" disabled>
                  <i className="bi bi-calendar3 me-2"></i>
                  Selecionar Período (Em breve)
                </button>
                <button className="btn btn-outline-secondary" disabled>
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Atualizar Dados (Em breve)
                </button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    </div>
  );
};

export default RelatoriosColaborador;
