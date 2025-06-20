import React, { useState, useEffect } from 'react';
import { Card, Table, Alert, Spinner, Row, Col, Button, Badge } from 'react-bootstrap';
import { adminService } from '../../services';

const RelatoriosEstoque = () => {
  const [relatorioData, setRelatorioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    carregarRelatorio();
  }, []);
  const carregarRelatorio = async () => {
    try {
      setLoading(true);
      console.log('Solicitando relatório de estoque...');
      const response = await adminService.relatorios.estoque();
      console.log('Resposta do relatório de estoque:', response);
      
      if (response && response.sucesso) {
        setRelatorioData(response.dados);
        console.log('Dados do relatório de estoque carregados:', response.dados);
      } else {
        const errorMsg = response?.mensagem || 'Erro ao carregar relatório de estoque';
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
    // Garante que o valor seja sempre um número
    const valorNumerico = Number(valor || 0);
    
    // Verifica se é um número válido, não NaN ou Infinity
    if (!isFinite(valorNumerico)) {
      console.warn('Valor inválido detectado:', valor);
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(0);
    }
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valorNumerico);
  };

  const getEstoqueBadge = (estoque) => {
    if (estoque === 0) {
      return <Badge bg="danger">Sem Estoque</Badge>;
    } else if (estoque <= 10) {
      return <Badge bg="warning">Estoque Baixo</Badge>;
    } else if (estoque <= 50) {
      return <Badge bg="info">Estoque Normal</Badge>;
    } else {
      return <Badge bg="success">Estoque Alto</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <Spinner animation="border" className="mb-3" />
        <p>Carregando relatório de estoque...</p>
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

  const { estoques_baixos, estoque_por_categoria, estoque_por_marca } = relatorioData || {};

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-box me-2"></i>
          Relatórios de Estoque
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
        {/* Produtos com estoque baixo */}
        <Col md={12} className="mb-4">
          <Card className="dashboard-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>
                <i className="bi bi-exclamation-triangle me-2"></i>
                Produtos com Estoque Baixo (≤ 10 unidades)
              </span>
              {estoques_baixos && (
                <Badge bg="danger">{estoques_baixos.length} produtos</Badge>
              )}
            </Card.Header>
            <Card.Body>
              {estoques_baixos && estoques_baixos.length > 0 ? (
                <div className="table-responsive">
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Produto</th>
                        <th>Marca</th>
                        <th>Categoria</th>
                        <th>Estoque Atual</th>
                        <th>Preço</th>
                        <th>Status</th>
                        <th>Valor em Estoque</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estoques_baixos.map((produto) => (
                        <tr key={produto.id}>
                          <td>{produto.id}</td>
                          <td>
                            <strong>{produto.nome}</strong>
                          </td>
                          <td>
                            <span className="text-muted">{produto.marca}</span>
                          </td>
                          <td>
                            <span className="text-muted">{produto.categoria}</span>
                          </td>
                          <td>
                            <span className="fw-bold text-danger">
                              {produto.estoque}
                            </span>
                          </td>
                          <td>
                            {formatarMoeda(produto.preco_atual)}
                          </td>
                          <td>
                            {getEstoqueBadge(produto.estoque)}
                          </td>
                          <td><strong>
                              {formatarMoeda(Number(produto.estoque || 0) * Number(produto.preco_atual || 0))}
                            </strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-check-circle fs-1 text-success mb-3"></i>
                  <h5 className="text-success">Excelente!</h5>
                  <p className="text-muted">
                    Nenhum produto com estoque baixo no momento.
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Estoque por categoria */}
        <Col md={6} className="mb-4">
          <Card className="dashboard-card">
            <Card.Header>
              <i className="bi bi-tags me-2"></i>
              Estoque por Categoria
            </Card.Header>
            <Card.Body>
              {estoque_por_categoria && estoque_por_categoria.length > 0 ? (
                <div className="table-responsive">
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>Categoria</th>
                        <th>Produtos</th>
                        <th>Estoque Total</th>
                        <th>Estoque Médio</th>
                        <th>Valor Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estoque_por_categoria.map((categoria, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{categoria.categoria}</strong>
                          </td>
                          <td>
                            <Badge bg="primary">{categoria.total_produtos}</Badge>
                          </td>
                          <td>
                            <Badge bg="info">{categoria.total_estoque}</Badge>                          </td>
                          <td><span className="text-muted">
                              {Math.round(Number(categoria.estoque_medio || 0))}
                            </span></td>
                          <td><strong>{formatarMoeda(Number(categoria.valor_total || 0))}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-tags fs-1 text-muted mb-3"></i>
                  <p className="text-muted">Nenhuma categoria encontrada</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Estoque por marca */}
        <Col md={6} className="mb-4">
          <Card className="dashboard-card">
            <Card.Header>
              <i className="bi bi-bookmark me-2"></i>
              Estoque por Marca
            </Card.Header>
            <Card.Body>
              {estoque_por_marca && estoque_por_marca.length > 0 ? (
                <div className="table-responsive">
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>Marca</th>
                        <th>Produtos</th>
                        <th>Estoque Total</th>
                        <th>Preço Médio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estoque_por_marca.map((marca, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{marca.marca}</strong>
                          </td>
                          <td>
                            <Badge bg="primary">{marca.total_produtos}</Badge>
                          </td>
                          <td>
                            <Badge bg="info">{marca.total_estoque}</Badge>                          </td>
                          <td><span className="text-muted">
                              {formatarMoeda(Number(marca.preco_medio || 0))}
                            </span></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-bookmark fs-1 text-muted mb-3"></i>
                  <p className="text-muted">Nenhuma marca encontrada</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Resumo geral */}
      <Row>
        <Col>
          <Card className="dashboard-card">
            <Card.Header>
              <i className="bi bi-bar-chart me-2"></i>
              Resumo Geral do Estoque
            </Card.Header>
            <Card.Body>
              <Row>                <Col md={3}>
                  <div className="stat-card text-center">
                    <div className="stat-number text-primary">
                      {estoque_por_categoria?.reduce((total, cat) => total + Number(cat.total_produtos || 0), 0) || 0}
                    </div>
                    <div className="stat-label">Total de Produtos</div>
                  </div>
                </Col>                <Col md={3}>
                  <div className="stat-card text-center">
                    <div className="stat-number text-success">
                      {estoque_por_categoria?.reduce((total, cat) => total + Number(cat.total_estoque || 0), 0) || 0}
                    </div>
                    <div className="stat-label">Unidades em Estoque</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="stat-card text-center">
                    <div className="stat-number text-danger">
                      {estoques_baixos?.length || 0}
                    </div>
                    <div className="stat-label">Produtos com Estoque Baixo</div>
                  </div>
                </Col>                <Col md={3}>
                  <div className="stat-card text-center">
                    <div className="stat-number text-warning">
                      {formatarMoeda(estoque_por_categoria?.reduce((total, cat) => total + Number(cat.valor_total || 0), 0) || 0)}
                    </div>
                    <div className="stat-label">Valor Total em Estoque</div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Alertas e recomendações */}
      <Row className="mt-4">
        <Col>
          <Alert variant="info" className="admin-alert">
            <Alert.Heading>
              <i className="bi bi-lightbulb me-2"></i>
              Recomendações de Estoque
            </Alert.Heading>
            <ul className="mb-0">
              <li>
                <strong>Estoque Baixo:</strong> Considere reabastecer produtos com estoque ≤ 10 unidades
              </li>
              <li>
                <strong>Sem Estoque:</strong> Produtos com estoque 0 não estão disponíveis para venda
              </li>
              <li>
                <strong>Monitoramento:</strong> Verifique regularmente os produtos mais vendidos para evitar rupturas
              </li>
              <li>
                <strong>Diversificação:</strong> Considere expandir categorias com boa performance
              </li>
            </ul>
          </Alert>
        </Col>
      </Row>
    </div>
  );
};

export default RelatoriosEstoque;
