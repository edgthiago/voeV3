import React, { useState, useEffect } from 'react';
import { Card, Table, Alert, Spinner, Row, Col, Button } from 'react-bootstrap';
import { adminService } from '../../services';

const RelatoriosVendas = () => {
  const [relatorioData, setRelatorioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    carregarRelatorio();
  }, []);
  const carregarRelatorio = async () => {
    try {
      setLoading(true);
      console.log('Solicitando relatório de vendas...');
      const response = await adminService.relatorios.vendas();
      console.log('Resposta do relatório:', response);
      
      if (response && response.sucesso) {
        setRelatorioData(response.dados);
        console.log('Dados do relatório carregados:', response.dados);
      } else {
        const errorMsg = response?.mensagem || 'Erro ao carregar relatório de vendas';
        console.error('Erro na resposta:', errorMsg);
        setError(errorMsg);
      }
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      setError(`Erro ao conectar com o servidor: ${error.message || 'Verifique a conexão'}`);
    } finally {
      setLoading(false);
    }
  };
  const formatarMoeda = (valor) => {
    // Certificar-se de que o valor é um número
    const valorNumerico = parseFloat(valor);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(isNaN(valorNumerico) ? 0 : valorNumerico);
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <Spinner animation="border" className="mb-3" />
        <p>Carregando relatório de vendas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="admin-alert">
        <Alert.Heading>Erro</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  const { vendas_por_dia, top_produtos } = relatorioData || {};

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-graph-up me-2"></i>
          Relatórios de Vendas
        </h2>
        <Button 
          variant="primary" 
          onClick={carregarRelatorio}
          className="btn-admin"
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Atualizar
        </Button>
      </div>

      <Row>
        {/* Resumo das vendas */}
        <Col md={12} className="mb-4">
          <Card className="dashboard-card">
            <Card.Header>
              <i className="bi bi-calendar-event me-2"></i>
              Vendas dos Últimos 30 Dias
            </Card.Header>
            <Card.Body>
              {vendas_por_dia && vendas_por_dia.length > 0 ? (
                <div>
                  {/* Estatísticas resumidas */}
                  <Row className="mb-4">
                    <Col md={3}>
                      <div className="stat-card text-center">
                        <div className="stat-number text-primary">
                          {vendas_por_dia.reduce((total, item) => total + item.total_promocoes, 0)}
                        </div>
                        <div className="stat-label">Total de Promoções</div>
                      </div>
                    </Col>                    <Col md={3}>
                      <div className="stat-card text-center">
                        <div className="stat-number text-success">
                          {vendas_por_dia.reduce((total, item) => total + parseInt(item.produtos_vendidos || 0), 0)}
                        </div>
                        <div className="stat-label">Produtos Vendidos</div>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="stat-card text-center">
                        <div className="stat-number text-warning">
                          {formatarMoeda(vendas_por_dia.reduce((total, item) => total + parseFloat(item.receita || 0), 0))}
                        </div>
                        <div className="stat-label">Receita Total</div>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="stat-card text-center">
                        <div className="stat-number text-info">
                          {vendas_por_dia.length}
                        </div>
                        <div className="stat-label">Dias com Vendas</div>
                      </div>
                    </Col>
                  </Row>

                  {/* Tabela detalhada */}
                  <div className="table-responsive">
                    <Table striped hover>                      <thead>
                      <tr>
                        <th>Data</th>
                        <th>Promoções</th>
                        <th>Produtos Vendidos</th>
                        <th>Receita</th>
                        <th>Ticket Médio</th>
                      </tr>
                      </thead>
                      <tbody>
                        {vendas_por_dia.map((item, index) => (<tr key={index}>
                            <td>{formatarData(item.data)}</td>
                            <td>
                              <span className="badge bg-primary">
                                {parseInt(item.total_promocoes || 0)}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-success">
                                {parseInt(item.produtos_vendidos || 0)}
                              </span>
                            </td>
                            <td>
                              <strong>{formatarMoeda(parseFloat(item.receita || 0))}</strong>
                            </td>
                            <td>
                              {formatarMoeda(parseFloat(item.receita || 0) / (parseInt(item.produtos_vendidos || 1)))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-graph-down fs-1 text-muted mb-3"></i>
                  <h5 className="text-muted">Nenhuma venda registrada</h5>
                  <p className="text-muted">
                    Não há dados de vendas para exibir no momento.
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Top produtos */}
        <Col md={12}>
          <Card className="dashboard-card">
            <Card.Header>
              <i className="bi bi-trophy me-2"></i>
              Top 10 Produtos Mais Vendidos
            </Card.Header>
            <Card.Body>
              {top_produtos && top_produtos.length > 0 ? (
                <div className="table-responsive">
                  <Table striped hover>                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Produto</th>
                        <th>Marca</th>
                        <th>Quantidade Vendida</th>
                        <th>Preço Atual</th>
                        <th>Estoque</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {top_produtos.map((produto, index) => (
                        <tr key={index}>
                          <td>
                            <span className="badge bg-warning">
                              {index + 1}º
                            </span>
                          </td>
                          <td>
                            <strong>{produto.nome}</strong>
                          </td>
                          <td>
                            <span className="text-muted">{produto.marca}</span>
                          </td>
                          <td>
                            <span className="badge bg-success">
                              {produto.quantidade_vendida}
                            </span>
                          </td>
                          <td>
                            <strong>{formatarMoeda(produto.preco_atual)}</strong>
                          </td>
                          <td>
                            <span className={`badge ${produto.estoque < 10 ? 'bg-danger' : 'bg-success'}`}>
                              {produto.estoque}
                            </span>
                          </td>
                          <td>
                            {produto.estoque > 0 ? (
                              <span className="badge bg-success">Em Estoque</span>
                            ) : (
                              <span className="badge bg-danger">Sem Estoque</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-box fs-1 text-muted mb-3"></i>
                  <h5 className="text-muted">Nenhum produto vendido</h5>
                  <p className="text-muted">
                    Não há dados de produtos vendidos para exibir.
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Informações adicionais */}
      <Row className="mt-4">
        <Col>
          <Alert variant="info" className="admin-alert">
            <Alert.Heading>
              <i className="bi bi-info-circle me-2"></i>
              Informações sobre o Relatório
            </Alert.Heading>
            <ul className="mb-0">
              <li>Os dados são baseados nas promoções relâmpago criadas no sistema</li>
              <li>As vendas são contabilizadas apenas quando há quantidade vendida registrada</li>
              <li>O ticket médio é calculado dividindo a receita pela quantidade de produtos vendidos</li>
              <li>Os produtos são ordenados por quantidade vendida (decrescente)</li>
            </ul>
          </Alert>
        </Col>
      </Row>
    </div>
  );
};

export default RelatoriosVendas;
