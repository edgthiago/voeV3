import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Alert, Form, Button, Badge, ProgressBar, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { adminService } from '../../services';
import './PainelColaborador.css';

const RelatorioProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [ordenacao, setOrdenacao] = useState('nome');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [relatorioData, setRelatorioData] = useState(null);
  const [resumo, setResumo] = useState({
    totalProdutos: 0,
    produtosAtivos: 0,
    produtosSemEstoque: 0,
    categorias: 0,
    valorTotalEstoque: 0
  });

  useEffect(() => {
    carregarRelatorioProdutos();
  }, []);

  useEffect(() => {
    if (relatorioData) {
      aplicarFiltrosEOrdenacao();
    }
  }, [filtroCategoria, ordenacao, relatorioData]);

  const carregarRelatorioProdutos = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Carregando relatório de produtos...');
      
      const response = await adminService.relatorios.produtos();
      console.log('📊 Resposta do relatório:', response);
      
      if (response && response.sucesso) {
        setRelatorioData(response.dados);
        console.log('✅ Dados do relatório carregados:', response.dados);
        
        // Calcular resumo
        if (response.dados.estatisticas) {
          setResumo({
            totalProdutos: response.dados.estatisticas.total_produtos || 0,
            produtosAtivos: response.dados.estatisticas.produtos_ativos || 0,
            produtosSemEstoque: response.dados.estatisticas.produtos_sem_estoque || 0,
            categorias: response.dados.estatisticas.total_categorias || 0,
            valorTotalEstoque: response.dados.estatisticas.valor_total_estoque || 0
          });
        }
      } else {
        const errorMsg = response?.mensagem || 'Erro ao carregar relatório de produtos';
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

  const aplicarFiltrosEOrdenacao = () => {
    if (!relatorioData || !relatorioData.produtos) return;

    let produtosFiltrados = [...relatorioData.produtos];
    
    // Aplicar filtro de categoria
    if (filtroCategoria !== 'todas') {
      produtosFiltrados = produtosFiltrados.filter(produto => produto.categoria === filtroCategoria);
    }
    
    // Aplicar ordenação
    produtosFiltrados.sort((a, b) => {
      switch (ordenacao) {
        case 'nome':
          return a.nome.localeCompare(b.nome);
        case 'preco_menor':
          return parseFloat(a.preco) - parseFloat(b.preco);
        case 'preco_maior':
          return parseFloat(b.preco) - parseFloat(a.preco);
        case 'estoque_menor':
          return parseInt(a.estoque) - parseInt(b.estoque);
        case 'estoque_maior':
          return parseInt(b.estoque) - parseInt(a.estoque);
        case 'vendas_maior':
          return parseInt(b.vendas_mes || 0) - parseInt(a.vendas_mes || 0);
        case 'margem_maior':
          return parseFloat(b.margem_lucro || 0) - parseFloat(a.margem_lucro || 0);
        default:
          return 0;
      }
    });
    
    setProdutos(produtosFiltrados);
  };

  const obterCategorias = () => {
    if (!relatorioData || !relatorioData.produtos || !Array.isArray(relatorioData.produtos)) return [];
    const todasCategorias = relatorioData.produtos.map(produto => produto.categoria);
    return [...new Set(todasCategorias)];
  };

  const obterCorEstoque = (produto) => {
    if (produto.estoque === 0) return 'danger';
    if (produto.estoque <= produto.estoque_minimo) return 'warning';
    return 'success';
  };

  const obterTextoEstoque = (produto) => {
    if (produto.estoque === 0) return 'Sem estoque';
    if (produto.estoque <= produto.estoque_minimo) return 'Estoque baixo';
    return 'Normal';
  };

  const calcularGiroEstoque = (produto) => {
    // Giro = Vendas no mês / Estoque atual
    if (produto.estoque === 0) return 'N/A';
    const giro = Number(produto.vendas_mes || 0) / Number(produto.estoque || 1);
    return Number(giro).toFixed(2);
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

  const obterPerformanceVendas = (vendasMes) => {
    if (vendasMes >= 20) return { cor: 'success', texto: 'Excelente' };
    if (vendasMes >= 10) return { cor: 'info', texto: 'Bom' };
    if (vendasMes >= 5) return { cor: 'warning', texto: 'Regular' };
    return { cor: 'danger', texto: 'Baixo' };
  };

  return (
    <Container fluid className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2><i className="bi bi-box me-2"></i>Relatório de Produtos</h2>
              <p className="text-muted">Análise completa do catálogo de produtos</p>
            </div>
            <Link to="/admin/colaborador" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-2"></i>
              Voltar ao Painel
            </Link>
          </div>
        </Col>
      </Row>

      {/* Estado de Loading */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Carregando relatório de produtos...</p>
        </div>
      )}

      {/* Estado de Erro */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Erro ao carregar relatório</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={carregarRelatorioProdutos}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Tentar novamente
          </Button>
        </Alert>
      )}

      {/* Conteúdo principal - só exibe se não estiver carregando e não houver erro */}
      {!loading && !error && relatorioData && (
        <>
          {/* Filtros */}
          <Row className="mb-4">
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Form.Label>Categoria:</Form.Label>
                  <Form.Select 
                    value={filtroCategoria} 
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                  >
                    <option value="todas">Todas as Categorias</option>
                    {obterCategorias().map(categoria => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </Form.Select>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Form.Label>Ordenar por:</Form.Label>
              <Form.Select 
                value={ordenacao} 
                onChange={(e) => setOrdenacao(e.target.value)}
              >
                <option value="nome">Nome (A-Z)</option>
                <option value="preco_menor">Menor Preço</option>
                <option value="preco_maior">Maior Preço</option>
                <option value="estoque_menor">Menor Estoque</option>
                <option value="estoque_maior">Maior Estoque</option>
                <option value="vendas_maior">Mais Vendidos</option>
                <option value="margem_maior">Maior Margem</option>
              </Form.Select>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Form.Label>&nbsp;</Form.Label>
              <Button 
                variant="outline-primary" 
                className="w-100"
                onClick={carregarRelatorioProdutos}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Atualizar Dados
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Cards de resumo */}
      <Row className="mb-4">
        <Col md={2}>
          <Card className="text-center bg-primary text-white">
            <Card.Body>
              <h4>{resumo.totalProdutos}</h4>
              <p className="mb-0">Total de Produtos</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center bg-success text-white">
            <Card.Body>
              <h4>{resumo.produtosAtivos}</h4>
              <p className="mb-0">Produtos Ativos</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center bg-danger text-white">
            <Card.Body>
              <h4>{resumo.produtosSemEstoque}</h4>
              <p className="mb-0">Sem Estoque</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center bg-info text-white">
            <Card.Body>
              <h4>{resumo.categorias}</h4>
              <p className="mb-0">Categorias</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center bg-warning text-white">
            <Card.Body>
              <h4>R$ {Number(resumo.valorTotalEstoque || 0).toFixed(2)}</h4>
              <p className="mb-0">Valor Total em Estoque</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabela de produtos */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-table me-2"></i>
            Análise Detalhada ({produtos.length} produtos)
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          ) : produtos.length === 0 ? (
            <div className="text-center p-4">
              <i className="bi bi-inbox display-1 text-muted"></i>
              <h5 className="mt-3">Nenhum produto encontrado</h5>
              <p className="text-muted">Ajuste os filtros ou adicione produtos ao catálogo.</p>
              <Link to="/dashboard/produtos/novo" className="btn btn-primary">
                <i className="bi bi-plus me-2"></i>
                Adicionar Produto
              </Link>
            </div>
          ) : (
            <Table responsive striped hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Vendas/Mês</th>
                  <th>Performance</th>
                  <th>Margem</th>
                  <th>Giro</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map(produto => {
                  const performance = obterPerformanceVendas(produto.vendas_mes);
                  return (
                    <tr key={produto.id}>
                      <td>
                        <div>
                          <strong>{produto.nome}</strong>
                          <br />
                          <small className="text-muted">{produto.marca}</small>
                        </div>
                      </td>
                      <td>
                        <Badge bg="info">{produto.categoria}</Badge>
                      </td>
                      <td>
                        <strong>R$ {Number(produto.preco || produto.preco_atual || produto.preco_unitario || 0).toFixed(2)}</strong>
                      </td>
                      <td>
                        <div>
                          <strong className={`text-${obterCorEstoque(produto)}`}>
                            {produto.estoque}
                          </strong>
                          <br />
                          <Badge bg={obterCorEstoque(produto)} className="small">
                            {obterTextoEstoque(produto)}
                          </Badge>
                        </div>
                      </td>
                      <td className="text-center">
                        <strong>{produto.vendas_mes}</strong>
                        <br />
                        <small className="text-muted">
                          Total: {produto.vendas_total}
                        </small>
                      </td>
                      <td>
                        <Badge bg={performance.cor}>
                          {performance.texto}
                        </Badge>
                        <br />
                        <ProgressBar 
                          variant={performance.cor} 
                          now={Math.min(produto.vendas_mes * 5, 100)} 
                          size="sm"
                          className="mt-1"
                        />
                      </td>
                      <td>
                        <strong className="text-success">
                          {Number(produto.margem_lucro || 0).toFixed(1)}%
                        </strong>
                      </td>
                      <td>
                        <strong>{calcularGiroEstoque(produto)}</strong>
                        <br />
                        <small className="text-muted">
                          {produto.estoque > 0 ? 'mês⁻¹' : ''}
                        </small>
                      </td>
                      <td>
                        <div>
                          <Badge bg={produto.ativo ? 'success' : 'danger'}>
                            {produto.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <br />
                          <small className="text-muted">
                            Últ. venda: {formatarData(produto.ultima_venda)}
                          </small>
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

      {/* Insights e recomendações */}
      <Row className="mt-4">
        <Col md={6}>
          <Card className="border-warning">
            <Card.Header className="bg-warning text-dark">
              <h6 className="mb-0">
                <i className="bi bi-lightbulb me-2"></i>
                Produtos que Precisam de Atenção
              </h6>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled mb-0">
                {produtos
                  .filter(p => p.estoque === 0 || p.estoque <= p.estoque_minimo)
                  .slice(0, 3)
                  .map(produto => (
                    <li key={produto.id} className="mb-2">
                      <strong>{produto.nome}</strong>
                      <br />
                      <small className="text-muted">
                        {produto.estoque === 0 ? 'Sem estoque' : `Apenas ${produto.estoque} unidades`}
                      </small>
                    </li>
                  ))}
                {produtos.filter(p => p.estoque === 0 || p.estoque <= p.estoque_minimo).length === 0 && (
                  <li className="text-success">
                    <i className="bi bi-check-circle me-2"></i>
                    Todos os produtos com estoque adequado!
                  </li>
                )}
              </ul>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-success">
            <Card.Header className="bg-success text-white">
              <h6 className="mb-0">
                <i className="bi bi-trophy me-2"></i>
                Top Performers
              </h6>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled mb-0">
                {produtos
                  .sort((a, b) => b.vendas_mes - a.vendas_mes)
                  .slice(0, 3)
                  .map((produto, index) => (
                    <li key={produto.id} className="mb-2">
                      <Badge bg="primary" className="me-2">#{index + 1}</Badge>
                      <strong>{produto.nome}</strong>
                      <br />
                      <small className="text-muted">
                        {produto.vendas_mes} vendas este mês
                      </small>
                    </li>
                  ))}
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Alertas informativos */}
      <Alert variant="info" className="mt-4">
        <Alert.Heading>
          <i className="bi bi-info-circle me-2"></i>
          Interpretação dos Dados
        </Alert.Heading>
        <Row>
          <Col md={6}>
            <ul className="mb-0">
              <li><strong>Giro de Estoque:</strong> Quantas vezes o estoque "gira" por mês</li>
              <li><strong>Performance:</strong> Baseada nas vendas mensais</li>
              <li><strong>Margem:</strong> Percentual de lucro estimado</li>
            </ul>
          </Col>
          <Col md={6}>
            <ul className="mb-0">
              <li>Giro alto (&gt;1.0) indica boa demanda</li>
              <li>Estoque baixo em produtos de alto giro precisa reposição</li>
              <li>Produtos inativos podem ser removidos do catálogo</li>
            </ul>
          </Col>
        </Row>
      </Alert>

      {/* Links de ação */}
      <Row className="mt-4">
        <Col>
          <Card className="border-primary">
            <Card.Body className="text-center">
              <h6>Ações Relacionadas</h6>
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <Link to="/dashboard/produtos" className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-eye me-2"></i>
                  Ver Todos os Produtos
                </Link>
                <Link to="/dashboard/produtos/novo" className="btn btn-primary btn-sm">
                  <i className="bi bi-plus me-2"></i>
                  Adicionar Produto
                </Link>
                <Link to="/dashboard/estoque" className="btn btn-warning btn-sm">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Gerenciar Estoque
                </Link>
                <Link to="/dashboard/relatorios/vendas-basico" className="btn btn-outline-success btn-sm">
                  <i className="bi bi-graph-up me-2"></i>
                  Relatório de Vendas
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
        </>
      )}
    </Container>
  );
};

export default RelatorioProdutos;
