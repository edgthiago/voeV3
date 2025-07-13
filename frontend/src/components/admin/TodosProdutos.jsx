import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Alert, Form, InputGroup, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { produtosService } from '../../services';
import './PainelColaborador.css';

const TodosProdutos = () => {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroEstoque, setFiltroEstoque] = useState('todos');
  const [pesquisa, setPesquisa] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  useEffect(() => {
    carregarTodosProdutos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [produtos, filtroCategoria, filtroEstoque, pesquisa]);

  const carregarTodosProdutos = async () => {
    try {
      setLoading(true);
      const response = await produtosService.buscarTodos();
      
      if (response.sucesso && response.dados) {
        setProdutos(response.dados);
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
    const produtosMock = [
      {
        id: 1,
        nome: 'Caderno Universitário 100 folhas',
        descricao: 'Caderno com folhas pautadas, ideal para anotações',
        categoria: 'Cadernos',
        marca: 'Nike',
        preco: 299.90,
        estoque: 15,
        estoque_minimo: 10,
        ativo: true,
        cor: 'Preto',
        tamanhos: ['38', '39', '40', '41', '42'],
        imagem: 'https://via.placeholder.com/80x80'
      },
      {
        id: 2,
        nome: 'Caneta Esferográfica Azul',
        descricao: 'Caneta de alta qualidade com tinta duradoura',
        categoria: 'Cadernos',
        marca: 'Adidas',
        preco: 459.90,
        estoque: 8,
        estoque_minimo: 10,
        ativo: true,
        cor: 'Branco',
        tamanhos: ['38', '39', '40', '41', '42', '43'],
        imagem: 'https://via.placeholder.com/80x80'
      },
      {
        id: 3,
        nome: 'Chinelo Havaianas',
        descricao: 'Chinelo tradicional brasileiro',
        categoria: 'Chinelos',
        marca: 'Havaianas',
        preco: 29.90,
        estoque: 0,
        estoque_minimo: 20,
        ativo: true,
        cor: 'Azul',
        tamanhos: ['35-36', '37-38', '39-40', '41-42'],
        imagem: 'https://via.placeholder.com/80x80'
      },
      {
        id: 4,
        nome: 'Lápis HB Kit 12 unidades',
        descricao: 'Kit de lápis com diferentes durezas',
        categoria: 'Canetas',
        marca: 'Converse',
        preco: 199.90,
        estoque: 25,
        estoque_minimo: 15,
        ativo: true,
        cor: 'Vermelho',
        tamanhos: ['36', '37', '38', '39', '40', '41', '42', '43'],
        imagem: 'https://via.placeholder.com/80x80'
      },
      {
        id: 5,
        nome: 'Sandália Melissa',
        descricao: 'Sandália feminina elegante',
        categoria: 'Sandálias',
        marca: 'Melissa',
        preco: 129.90,
        estoque: 12,
        estoque_minimo: 8,
        ativo: true,
        cor: 'Rosa',
        tamanhos: ['34', '35', '36', '37', '38', '39'],
        imagem: 'https://via.placeholder.com/80x80'
      },
      {
        id: 6,
        nome: 'Bota Timberland',
        descricao: 'Bota resistente para trabalho',
        categoria: 'Botas',
        marca: 'Timberland',
        preco: 649.90,
        estoque: 5,
        estoque_minimo: 8,
        ativo: false,
        cor: 'Marrom',
        tamanhos: ['39', '40', '41', '42', '43', '44'],
        imagem: 'https://via.placeholder.com/80x80'
      }
    ];
    
    setProdutos(produtosMock);
    setError('⚠️ Dados em modo demonstração - API não disponível');
  };

  const aplicarFiltros = () => {
    let resultado = [...produtos];

    // Filtrar por categoria
    if (filtroCategoria !== 'todas') {
      resultado = resultado.filter(produto => produto.categoria === filtroCategoria);
    }

    // Filtrar por estoque
    if (filtroEstoque === 'com_estoque') {
      resultado = resultado.filter(produto => produto.estoque > 0);
    } else if (filtroEstoque === 'sem_estoque') {
      resultado = resultado.filter(produto => produto.estoque === 0);
    } else if (filtroEstoque === 'estoque_baixo') {
      resultado = resultado.filter(produto => produto.estoque > 0 && produto.estoque <= produto.estoque_minimo);
    }

    // Filtrar por pesquisa
    if (pesquisa.trim()) {
      const termoPesquisa = pesquisa.toLowerCase();
      resultado = resultado.filter(produto => 
        produto.nome.toLowerCase().includes(termoPesquisa) ||
        produto.marca.toLowerCase().includes(termoPesquisa) ||
        produto.categoria.toLowerCase().includes(termoPesquisa)
      );
    }

    setProdutosFiltrados(resultado);
  };

  const obterCategorias = () => {
    return [...new Set(produtos.map(produto => produto.categoria))];
  };

  const navegarParaEdicao = (produto) => {
    console.log('🔧 Navegando para edição do produto:', produto);
    navigate(`/dashboard/produtos/editar/${produto.id}`);
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

  const contarPorStatus = (status) => {
    switch (status) {
      case 'total':
        return produtos.length;
      case 'ativo':
        return produtos.filter(p => p.ativo).length;
      case 'inativo':
        return produtos.filter(p => !p.ativo).length;
      case 'sem_estoque':
        return produtos.filter(p => p.estoque === 0).length;
      case 'estoque_baixo':
        return produtos.filter(p => p.estoque > 0 && p.estoque <= p.estoque_minimo).length;
      default:
        return 0;
    }
  };

  const visualizarDetalhes = (produto) => {
    setProdutoSelecionado(produto);
    setShowModal(true);
  };

  if (loading) {
    return (
      <Container fluid className="mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando todos os produtos...</p>
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
              <h2><i className="bi bi-box me-2"></i>Todos os Produtos</h2>
              <p className="text-muted">Visualize e gerencie todos os produtos do catálogo</p>
            </div>
            <div className="d-flex gap-2">
              <Link to="/dashboard/produtos/novo" className="btn btn-primary">
                <i className="bi bi-plus me-2"></i>
                Novo Produto
              </Link>
              <Link to="/admin/colaborador" className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left me-2"></i>
                Voltar ao Painel
              </Link>
            </div>
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
          <Card className="text-center bg-primary text-white">
            <Card.Body>
              <h5>{contarPorStatus('total')}</h5>
              <small>Total</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center bg-success text-white">
            <Card.Body>
              <h5>{contarPorStatus('ativo')}</h5>
              <small>Ativos</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center bg-secondary text-white">
            <Card.Body>
              <h5>{contarPorStatus('inativo')}</h5>
              <small>Inativos</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center bg-danger text-white">
            <Card.Body>
              <h5>{contarPorStatus('sem_estoque')}</h5>
              <small>Sem Estoque</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center bg-warning text-white">
            <Card.Body>
              <h5>{contarPorStatus('estoque_baixo')}</h5>
              <small>Estoque Baixo</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center bg-info text-white">
            <Card.Body>
              <h5>{produtosFiltrados.length}</h5>
              <small>Filtrados</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
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
            </Col>
            <Col md={3}>
              <Form.Label>Estoque:</Form.Label>
              <Form.Select 
                value={filtroEstoque} 
                onChange={(e) => setFiltroEstoque(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="com_estoque">Com Estoque</option>
                <option value="sem_estoque">Sem Estoque</option>
                <option value="estoque_baixo">Estoque Baixo</option>
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label>Pesquisar:</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Buscar por nome, marca ou categoria..."
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

      {/* Tabela de produtos */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-table me-2"></i>
            Lista de Produtos ({produtosFiltrados.length})
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          {produtosFiltrados.length === 0 ? (
            <div className="text-center p-4">
              <i className="bi bi-inbox display-1 text-muted"></i>
              <h5 className="mt-3">Nenhum produto encontrado</h5>
              <p className="text-muted">
                {pesquisa ? 'Tente ajustar os filtros de pesquisa.' : 'Não há produtos para exibir.'}
              </p>
              <Link to="/dashboard/produtos/novo" className="btn btn-primary">
                <i className="bi bi-plus me-2"></i>
                Adicionar Primeiro Produto
              </Link>
            </div>
          ) : (
            <Table responsive striped hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Imagem</th>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.map(produto => (
                  <tr key={produto.id}>
                    <td>
                      <img 
                        src={produto.imagem} 
                        alt={produto.nome}
                        width="50"
                        height="50"
                        className="rounded"
                        style={{ objectFit: 'cover' }}
                      />
                    </td>
                    <td>
                      <div>
                        <strong>{produto.nome}</strong>
                        <br />
                        <small className="text-muted">{produto.marca}</small>
                        <br />
                        <small className="text-muted">{produto.cor}</small>
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
                    <td>
                      <Badge bg={produto.ativo ? 'success' : 'danger'}>
                        {produto.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          title="Ver detalhes"
                          onClick={() => visualizarDetalhes(produto)}
                        >
                          <i className="bi bi-eye"></i>
                        </Button>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          title="Editar"
                          onClick={() => navegarParaEdicao(produto)}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        {produto.estoque <= produto.estoque_minimo && (
                          <Link
                            to="/dashboard/estoque/atualizar"
                            className="btn btn-outline-info btn-sm"
                            title="Atualizar estoque"
                          >
                            <i className="bi bi-arrow-repeat"></i>
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
                <Link to="/dashboard/produtos/novo" className="btn btn-primary btn-sm">
                  <i className="bi bi-plus me-2"></i>
                  Novo Produto
                </Link>
                <Link to="/dashboard/estoque" className="btn btn-warning btn-sm">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Produtos em Falta
                </Link>
                <Button variant="outline-info" size="sm" onClick={carregarTodosProdutos}>
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Atualizar Lista
                </Button>
                <Link to="/dashboard/relatorios/produtos" className="btn btn-outline-success btn-sm">
                  <i className="bi bi-graph-up me-2"></i>
                  Relatório de Produtos
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal de detalhes do produto */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-box me-2"></i>
            Detalhes do Produto
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {produtoSelecionado && (
            <Row>
              <Col md={4}>
                <img 
                  src={produtoSelecionado.imagem} 
                  alt={produtoSelecionado.nome}
                  className="img-fluid rounded"
                />
              </Col>
              <Col md={8}>
                <h5>{produtoSelecionado.nome}</h5>
                <p className="text-muted">{produtoSelecionado.descricao}</p>
                <Table borderless size="sm">
                  <tbody>
                    <tr>
                      <td><strong>Marca:</strong></td>
                      <td>{produtoSelecionado.marca}</td>
                    </tr>
                    <tr>
                      <td><strong>Categoria:</strong></td>
                      <td>{produtoSelecionado.categoria}</td>
                    </tr>
                    <tr>
                      <td><strong>Cor:</strong></td>
                      <td>{produtoSelecionado.cor}</td>
                    </tr>
                    <tr>
                      <td><strong>Preço:</strong></td>
                      <td><strong>R$ {Number(produtoSelecionado.preco || produtoSelecionado.preco_atual || produtoSelecionado.preco_unitario || 0).toFixed(2)}</strong></td>
                    </tr>
                    <tr>
                      <td><strong>Estoque:</strong></td>
                      <td>
                        <Badge bg={obterCorEstoque(produtoSelecionado)} className="me-2">
                          {produtoSelecionado.estoque} unidades
                        </Badge>
                        {obterTextoEstoque(produtoSelecionado)}
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Status:</strong></td>
                      <td>
                        <Badge bg={produtoSelecionado.ativo ? 'success' : 'danger'}>
                          {produtoSelecionado.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Tamanhos:</strong></td>
                      <td>
                        {(produtoSelecionado.tamanhos || []).map(tamanho => (
                          <Badge key={tamanho} bg="secondary" className="me-1">
                            {tamanho}
                          </Badge>
                        ))}
                        {(!produtoSelecionado.tamanhos || produtoSelecionado.tamanhos.length === 0) && (
                          <span className="text-muted">Nenhum tamanho informado</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fechar
          </Button>
          <Button variant="warning">
            <i className="bi bi-pencil me-2"></i>
            Editar Produto
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TodosProdutos;
