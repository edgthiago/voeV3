import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Alert, Form, Button, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { adminService } from '../../services';
import './PainelColaborador.css';

const RelatorioVendas = () => {
  const [vendas, setVendas] = useState([]);
  const [periodo, setPeriodo] = useState('7_dias');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [relatorioData, setRelatorioData] = useState(null);
  const [resumo, setResumo] = useState({
    totalVendas: 0,
    totalQuantidade: 0,
    ticketMedio: 0,
    melhorDia: '',
    produtoMaisVendido: ''
  });

  useEffect(() => {
    carregarRelatorioVendas();
  }, [periodo]);

  const carregarRelatorioVendas = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Carregando relatório de vendas...');
      
      // Preparar filtros baseados no período
      const filtros = {};
      const hoje = new Date();
      
      switch (periodo) {
        case '7_dias':
          const seteDiasAtras = new Date(hoje);
          seteDiasAtras.setDate(hoje.getDate() - 7);
          filtros.data_inicio = seteDiasAtras.toISOString().split('T')[0];
          break;
        case '30_dias':
          const trintaDiasAtras = new Date(hoje);
          trintaDiasAtras.setDate(hoje.getDate() - 30);
          filtros.data_inicio = trintaDiasAtras.toISOString().split('T')[0];
          break;
        case '90_dias':
          const noventaDiasAtras = new Date(hoje);
          noventaDiasAtras.setDate(hoje.getDate() - 90);
          filtros.data_inicio = noventaDiasAtras.toISOString().split('T')[0];
          break;
      }
      
      const response = await adminService.relatorios.vendas(filtros);
      console.log('📊 Resposta do relatório:', response);
      
      if (response && response.sucesso) {
        setRelatorioData(response.dados);
        processarDadosVendas(response.dados);
        console.log('✅ Dados do relatório carregados:', response.dados);
      } else {
        const errorMsg = response?.mensagem || 'Erro ao carregar relatório de vendas';
        console.error('❌ Erro na resposta:', errorMsg);
        setError(errorMsg);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar relatório:', error);
      setError(`Erro ao conectar com o servidor: ${error.message || 'Verifique a conexão'}`);
    } finally {
      setLoading(false);
    }
  };

  const processarDadosVendas = (dados) => {
    if (!dados) return;

    // Processar vendas por período para criar lista de vendas individuais
    const vendasProcessadas = [];
    
    if (dados.vendas_por_periodo && Array.isArray(dados.vendas_por_periodo)) {
      dados.vendas_por_periodo.forEach(periodo => {
        vendasProcessadas.push({
          data: periodo.data,
          total_pedidos: periodo.total_pedidos,
          total_vendas: periodo.total_vendas,
          ticket_medio: periodo.ticket_medio
        });
      });
    }

    setVendas(vendasProcessadas);

    // Calcular resumo
    if (dados.resumo_geral) {
      setResumo({
        totalVendas: dados.resumo_geral.receita_total || 0,
        totalQuantidade: dados.resumo_geral.total_pedidos || 0,
        ticketMedio: dados.resumo_geral.ticket_medio || 0,
        melhorDia: encontrarMelhorDia(dados.vendas_por_periodo),
        produtoMaisVendido: encontrarProdutoMaisVendido(dados.top_produtos)
      });
    }
  };

  const encontrarMelhorDia = (vendasPorPeriodo) => {
    if (!vendasPorPeriodo || vendasPorPeriodo.length === 0) return 'N/A';
    
    const melhorDia = vendasPorPeriodo.reduce((melhor, atual) => {
      return parseFloat(atual.total_vendas) > parseFloat(melhor.total_vendas) ? atual : melhor;
    });
    
    return formatarData(melhorDia.data);
  };

  const encontrarProdutoMaisVendido = (topProdutos) => {
    if (!topProdutos || topProdutos.length === 0) return 'N/A';
    return topProdutos[0]?.nome || 'N/A';
  };

  const formatarData = (dataString) => {
    if (!dataString) return 'N/A';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const formatarMoeda = (valor) => {
    const valorNumerico = parseFloat(valor);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(isNaN(valorNumerico) ? 0 : valorNumerico);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <Container fluid className="mt-4">
          <Row className="justify-content-center">
            <Col xs={12} className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Carregando relatório de vendas...</p>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <Container fluid className="mt-4">
        <Row>
          <Col>
            <Alert variant="danger">
              <Alert.Heading>Erro ao carregar relatório</Alert.Heading>
              <p>{error}</p>
              <Button variant="outline-danger" onClick={carregarRelatorioVendas}>
                Tentar Novamente
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2><i className="bi bi-graph-up me-2"></i>Relatório de Vendas</h2>
              <p className="text-muted">Análise detalhada das vendas por período</p>
            </div>
            <Link to="/admin/colaborador" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-2"></i>
              Voltar ao Painel
            </Link>
          </div>
        </Col>
      </Row>

      {/* Filtros */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Form.Label>Período:</Form.Label>
              <Form.Select 
                value={periodo} 
                onChange={(e) => setPeriodo(e.target.value)}
              >
                <option value="7_dias">Últimos 7 dias</option>
                <option value="30_dias">Últimos 30 dias</option>
                <option value="90_dias">Últimos 90 dias</option>
              </Form.Select>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body className="text-end">
              <Button variant="primary" onClick={carregarRelatorioVendas}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Atualizar Relatório
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Resumo */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <h3 className="text-success">{formatarMoeda(resumo.totalVendas)}</h3>
              <p className="text-muted mb-0">Total em Vendas</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <h3 className="text-info">{resumo.totalQuantidade}</h3>
              <p className="text-muted mb-0">Total de Pedidos</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <h3 className="text-warning">{formatarMoeda(resumo.ticketMedio)}</h3>
              <p className="text-muted mb-0">Ticket Médio</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <h3 className="text-primary">{resumo.melhorDia}</h3>
              <p className="text-muted mb-0">Melhor Dia</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Produtos Mais Vendidos */}
      {relatorioData && relatorioData.top_produtos && relatorioData.top_produtos.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <i className="bi bi-trophy me-2"></i>
                  Top Produtos Mais Vendidos
                </h5>
              </Card.Header>
              <Card.Body>
                <Table responsive hover className="table-light">
                  <thead className="table-primary">
                    <tr>
                      <th>Produto</th>
                      <th>Categoria</th>
                      <th>Quantidade Vendida</th>
                      <th>Receita Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(relatorioData.top_produtos || []).map((produto, index) => (
                      <tr key={produto.id || index}>
                        <td>
                          <strong>{produto.nome}</strong>
                          {produto.marca && <div className="text-muted small">{produto.marca}</div>}
                        </td>
                        <td>
                          <Badge bg="secondary">{produto.categoria}</Badge>
                        </td>
                        <td>
                          <strong>{produto.total_vendido}</strong> unidades
                        </td>
                        <td>
                          <strong className="text-success">{formatarMoeda(produto.receita_total)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Vendas por Categoria */}
      {relatorioData && relatorioData.vendas_por_categoria && relatorioData.vendas_por_categoria.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <i className="bi bi-pie-chart me-2"></i>
                  Vendas por Categoria
                </h5>
              </Card.Header>
              <Card.Body>
                <Table responsive hover className="table-light">
                  <thead className="table-primary">
                    <tr>
                      <th>Categoria</th>
                      <th>Total de Pedidos</th>
                      <th>Total de Itens</th>
                      <th>Total de Vendas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(relatorioData.vendas_por_categoria || []).map((categoria, index) => (
                      <tr key={categoria.categoria || index}>
                        <td>
                          <Badge bg="info">{categoria.categoria}</Badge>
                        </td>
                        <td>{categoria.total_pedidos}</td>
                        <td>{categoria.total_itens}</td>
                        <td>
                          <strong className="text-success">{formatarMoeda(categoria.total_vendas)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Vendas por Período */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-calendar3 me-2"></i>
                Vendas por Data ({periodo.replace('_', ' ')})
              </h5>
            </Card.Header>
            <Card.Body>
              {vendas.length === 0 ? (
                <Alert variant="info">
                  <i className="bi bi-info-circle me-2"></i>
                  Nenhuma venda encontrada para o período selecionado.
                </Alert>
              ) : (
                <Table responsive hover className="table-light">
                  <thead className="table-primary">
                    <tr>
                      <th>Data</th>
                      <th>Total de Pedidos</th>
                      <th>Total de Vendas</th>
                      <th>Ticket Médio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendas.map((venda, index) => (
                      <tr key={venda.data || index}>
                        <td>
                          <strong>{formatarData(venda.data)}</strong>
                        </td>
                        <td>
                          <Badge bg="info">{venda.total_pedidos}</Badge>
                        </td>
                        <td>
                          <strong className="text-success">{formatarMoeda(venda.total_vendas)}</strong>
                        </td>
                        <td>
                          {formatarMoeda(venda.ticket_medio)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Informação sobre dados reais */}
      <Row className="mt-4">
        <Col>
          <Alert variant="success">
            <i className="bi bi-check-circle me-2"></i>
            <strong>Dados em tempo real:</strong> Este relatório exibe dados reais do banco de dados, 
            atualizados em tempo real conforme novas vendas são processadas.
          </Alert>
        </Col>
      </Row>
    </Container>
  );
};

export default RelatorioVendas;
