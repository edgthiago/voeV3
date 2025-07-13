import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Alert, Badge, InputGroup, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { produtosService } from '../../services';
import './PainelColaborador.css';

const GerenciarProdutos = () => {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);

  useEffect(() => {
    carregarProdutos();
  }, []);

  useEffect(() => {
    filtrarProdutos();
  }, [produtos, filtro, categoriaFiltro, statusFiltro]);

  const filtrarProdutos = () => {
    let produtosFiltradosTemp = produtos;

    // Filtro por nome/marca
    if (filtro) {
      produtosFiltradosTemp = produtosFiltradosTemp.filter(produto =>
        produto.nome.toLowerCase().includes(filtro.toLowerCase()) ||
        produto.marca?.toLowerCase().includes(filtro.toLowerCase())
      );
    }

    // Filtro por categoria
    if (categoriaFiltro) {
      produtosFiltradosTemp = produtosFiltradosTemp.filter(produto =>
        produto.categoria === categoriaFiltro
      );
    }

    // Filtro por status
    if (statusFiltro === 'ativo') {
      produtosFiltradosTemp = produtosFiltradosTemp.filter(produto => produto.ativo);
    } else if (statusFiltro === 'inativo') {
      produtosFiltradosTemp = produtosFiltradosTemp.filter(produto => !produto.ativo);
    } else if (statusFiltro === 'sem-estoque') {
      produtosFiltradosTemp = produtosFiltradosTemp.filter(produto => (produto.estoque || produto.quantidade_estoque) === 0);
    } else if (statusFiltro === 'estoque-baixo') {
      produtosFiltradosTemp = produtosFiltradosTemp.filter(produto => {
        const estoque = produto.estoque || produto.quantidade_estoque;
        return estoque > 0 && estoque < 5;
      });
    }

    setProdutosFiltrados(produtosFiltradosTemp);
  };

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      const response = await produtosService.buscarTodos();
      if (response.sucesso) {
        setProdutos(response.dados || []);
        setError(null);
      } else {
        console.error('Erro na API:', response.mensagem);
        usarDadosFallback();
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      usarDadosFallback();
    } finally {
      setLoading(false);
    }
  };

  const usarDadosFallback = () => {
    console.log('🔄 Usando dados de demonstração - API não disponível');
    // Dados de demonstração atualizados para papelaria
    const produtosMock = [
      {
        id: 1,
        nome: 'Kit Escolar Completo - 50 Itens',
        categoria: 'Material Escolar',
        preco_atual: '59.99',
        quantidade_estoque: 25,
        ativo: true,
        marca: 'Faber-Castell',
        imagem: '/papelaria_produtos.png'
      },
      {
        id: 2,
        nome: 'Caderno Universitário Espiral 200 Folhas',
        categoria: 'Cadernos e Blocos',
        preco_atual: '12.90',
        quantidade_estoque: 35,
        ativo: true,
        marca: 'Tilibra',
        imagem: '/papelaria_produtos.png'
      },
      {
        id: 3,
        nome: 'Caneta Esferográfica Azul - Pack 10 Unidades',
        categoria: 'Canetas e Lápis',
        preco_atual: '8.50',
        quantidade_estoque: 0,
        ativo: true,
        marca: 'BIC',
        imagem: '/papelaria_produtos.png'
      },
      {
        id: 4,
        nome: 'Papel Sulfite A4 500 Folhas',
        categoria: 'Papel e Cartolina',
        preco_atual: '15.99',
        quantidade_estoque: 2,
        ativo: true,
        marca: 'Chamex',
        imagem: '/papelaria_produtos.png'
      }
    ];
    
    setProdutos(produtosMock);
    setError('Dados de demonstração - Sistema funcionando em modo offline');
  };

  const obterCategorias = () => {
    const categorias = [...new Set(produtos.map(p => p.categoria))];
    return categorias.filter(Boolean);
  };

  const obterEstatisticas = () => {
    const total = produtosFiltrados.length;
    const ativos = produtosFiltrados.filter(p => p.ativo).length;
    const semEstoque = produtosFiltrados.filter(p => (p.estoque || p.quantidade_estoque) === 0).length;
    const estoqueBaixo = produtosFiltrados.filter(p => {
      const estoque = p.estoque || p.quantidade_estoque;
      return estoque > 0 && estoque < 5;
    }).length;

    return { total, ativos, semEstoque, estoqueBaixo };
  };

  const navegarParaEdicao = (produto = null) => {
    console.log('🔧 Navegando para edição do produto:', produto);
    if (produto) {
      console.log('🔄 Redirecionando para:', `/dashboard/produtos/editar/${produto.id}`);
      navigate(`/dashboard/produtos/editar/${produto.id}`);
    } else {
      console.log('🔄 Redirecionando para adicionar produto');
      navigate('/dashboard/produtos/novo');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-colaborador">
        <Container fluid className="py-4">
          <div className="loading-container">
            <div className="loading-content">
              <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
                <span className="visually-hidden">Carregando...</span>
              </div>
              <h4 className="mb-2">Carregando produtos...</h4>
              <p className="text-muted">Buscando informações no banco de dados</p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  const estatisticas = obterEstatisticas();

  return (
    <div className="dashboard-colaborador">
      <Container fluid className="py-4">
        {/* Header com título e ações principais */}
        <div className="dashboard-header mb-4">
          <Row className="align-items-center">
            <Col lg={8}>
              <div className="header-title">
                <h1 className="mb-1">
                  <i className="bi bi-box-seam me-3"></i>
                  Gerenciar Produtos
                </h1>
                <p className="text-muted mb-0">
                  Administre o catálogo de produtos da sua papelaria
                </p>
              </div>
            </Col>
            <Col lg={4} className="text-lg-end">
              <div className="header-actions">
                <Button 
                  variant="success" 
                  size="lg"
                  className="me-2 px-4"
                  onClick={() => navegarParaEdicao()}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Novo Produto
                </Button>
                <Link to="/admin/colaborador" className="btn btn-outline-secondary">
                  <i className="bi bi-arrow-left me-2"></i>
                  Voltar
                </Link>
              </div>
            </Col>
          </Row>
        </div>

        {/* Cards de estatísticas */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="stats-card border-0 h-100">
              <Card.Body className="text-center">
                <div className="stats-icon bg-primary bg-opacity-10 rounded-circle mx-auto mb-3">
                  <i className="bi bi-box-seam text-primary"></i>
                </div>
                <h3 className="stats-number text-primary">{estatisticas.total}</h3>
                <p className="stats-label text-muted mb-0">Total de Produtos</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stats-card border-0 h-100">
              <Card.Body className="text-center">
                <div className="stats-icon bg-success bg-opacity-10 rounded-circle mx-auto mb-3">
                  <i className="bi bi-check-circle text-success"></i>
                </div>
                <h3 className="stats-number text-success">{estatisticas.ativos}</h3>
                <p className="stats-label text-muted mb-0">Produtos Ativos</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stats-card border-0 h-100">
              <Card.Body className="text-center">
                <div className="stats-icon bg-warning bg-opacity-10 rounded-circle mx-auto mb-3">
                  <i className="bi bi-exclamation-triangle text-warning"></i>
                </div>
                <h3 className="stats-number text-warning">{estatisticas.estoqueBaixo}</h3>
                <p className="stats-label text-muted mb-0">Estoque Baixo</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stats-card border-0 h-100">
              <Card.Body className="text-center">
                <div className="stats-icon bg-danger bg-opacity-10 rounded-circle mx-auto mb-3">
                  <i className="bi bi-x-circle text-danger"></i>
                </div>
                <h3 className="stats-number text-danger">{estatisticas.semEstoque}</h3>
                <p className="stats-label text-muted mb-0">Sem Estoque</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filtros e busca */}
        <Card className="filter-card border-0 mb-4">
          <Card.Body>
            <Row className="align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-search me-2"></i>
                    Buscar Produto
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="bi bi-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Digite o nome ou marca..."
                      value={filtro}
                      onChange={(e) => setFiltro(e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-tag me-2"></i>
                    Categoria
                  </Form.Label>
                  <Form.Select
                    value={categoriaFiltro}
                    onChange={(e) => setCategoriaFiltro(e.target.value)}
                  >
                    <option value="">Todas as categorias</option>
                    {obterCategorias().map(categoria => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-filter me-2"></i>
                    Status
                  </Form.Label>
                  <Form.Select
                    value={statusFiltro}
                    onChange={(e) => setStatusFiltro(e.target.value)}
                  >
                    <option value="">Todos os status</option>
                    <option value="ativo">Ativos</option>
                    <option value="inativo">Inativos</option>
                    <option value="estoque-baixo">Estoque Baixo</option>
                    <option value="sem-estoque">Sem Estoque</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <div className="d-grid">
                  <Button 
                    variant="outline-secondary"
                    onClick={() => {
                      setFiltro('');
                      setCategoriaFiltro('');
                      setStatusFiltro('');
                    }}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Limpar
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Alerta de erro */}
        {error && (
          <Alert variant="warning" className="mb-4 border-0">
            <div className="d-flex align-items-center">
              <i className="bi bi-info-circle me-3 fs-4"></i>
              <div className="flex-grow-1">
                <strong>Modo Demonstração</strong>
                <p className="mb-0">{error}</p>
              </div>
              <Button 
                variant="outline-warning" 
                size="sm"
                onClick={carregarProdutos}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Reconectar
              </Button>
            </div>
          </Alert>
        )}

        {/* Tabela de produtos */}
        <Card className="products-table-card border-0">
          <Card.Header className="bg-white border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Lista de Produtos
                <Badge bg="secondary" className="ms-2">{produtosFiltrados.length}</Badge>
              </h5>
              <div className="table-actions">
                <Button variant="outline-primary" size="sm" onClick={carregarProdutos}>
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Atualizar
                </Button>
              </div>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            {produtosFiltrados.length === 0 ? (
              <div className="empty-state text-center py-5">
                <div className="empty-icon mb-3">
                  <i className="bi bi-inbox display-1 text-muted"></i>
                </div>
                <h4 className="mb-2">Nenhum produto encontrado</h4>
                <p className="text-muted mb-4">
                  {produtos.length === 0 
                    ? 'Comece adicionando seu primeiro produto à papelaria.' 
                    : 'Tente ajustar os filtros de busca ou adicionar um novo produto.'
                  }
                </p>
                <Button variant="primary" onClick={() => navegarParaEdicao()}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Adicionar Primeiro Produto
                </Button>
              </div>
            ) : (
              <div className="table-responsive">
                <Table className="products-table mb-0" hover>
                  <thead className="table-light">
                    <tr>
                      <th className="border-0">Produto</th>
                      <th className="border-0">Categoria</th>
                      <th className="border-0">Preço</th>
                      <th className="border-0">Estoque</th>
                      <th className="border-0">Status</th>
                      <th className="border-0 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosFiltrados.map((produto) => {
                      const estoque = produto.estoque || produto.quantidade_estoque || 0;
                      const preco = produto.preco || produto.preco_atual || '0';
                      
                      return (
                        <tr key={produto.id} className="product-row">
                          <td className="border-0">
                            <div className="d-flex align-items-center">
                              <div className="product-image me-3">
                                <img 
                                  src={produto.imagem || '/papelaria_produtos.png'} 
                                  alt={produto.nome}
                                  className="rounded"
                                />
                              </div>
                              <div className="product-info">
                                <h6 className="product-name mb-1">{produto.nome}</h6>
                                {produto.marca && (
                                  <small className="text-muted d-block">
                                    <i className="bi bi-building me-1"></i>
                                    {produto.marca}
                                  </small>
                                )}
                                <small className="text-muted">
                                  <i className="bi bi-hash me-1"></i>
                                  ID: {produto.id}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td className="border-0">
                            <Badge bg="light" text="dark" className="category-badge">
                              {produto.categoria}
                            </Badge>
                          </td>
                          <td className="border-0">
                            <span className="price-value">
                              R$ {typeof preco === 'string' ? preco : preco.toFixed(2)}
                            </span>
                          </td>
                          <td className="border-0">
                            <Badge 
                              bg={estoque === 0 ? 'danger' : estoque < 5 ? 'warning' : 'success'}
                              className="stock-badge"
                            >
                              <i className={`bi bi-${estoque === 0 ? 'x-circle' : estoque < 5 ? 'exclamation-triangle' : 'check-circle'} me-1`}></i>
                              {estoque} {estoque === 1 ? 'unidade' : 'unidades'}
                            </Badge>
                          </td>
                          <td className="border-0">
                            <Badge bg={produto.ativo ? 'success' : 'secondary'} className="status-badge">
                              <i className={`bi bi-${produto.ativo ? 'check-circle' : 'pause-circle'} me-1`}></i>
                              {produto.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </td>
                          <td className="border-0 text-center">
                            <div className="action-buttons">
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                className="me-1"
                                onClick={() => navegarParaEdicao(produto)}
                                title="Editar produto"
                              >
                                <i className="bi bi-pencil-square"></i>
                              </Button>
                              <Button 
                                variant="outline-info" 
                                size="sm"
                                onClick={() => window.open(`/produto/${produto.id}`, '_blank')}
                                title="Visualizar produto"
                              >
                                <i className="bi bi-eye"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default GerenciarProdutos;
