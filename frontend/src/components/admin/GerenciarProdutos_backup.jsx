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
      produtosFiltradosTemp = produtosFiltradosTemp.filter(produto => produto.estoque === 0);
    } else if (statusFiltro === 'estoque-baixo') {
      produtosFiltradosTemp = produtosFiltradosTemp.filter(produto => produto.estoque > 0 && produto.estoque < 5);
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
      // Redirecionar para a página de edição
      navigate(`/dashboard/produtos/editar/${produto.id}`);
    } else {
      console.log('🔄 Redirecionando para adicionar produto');
      // Redirecionar para adicionar produto
      navigate('/dashboard/produtos/novo');
    }
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando produtos...</p>
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
              <i className="bi bi-box-seam me-2"></i>
              Gerenciar Produtos
            </h2>
            <div>
              <Button variant="primary" onClick={() => navegarParaEdicao()}>
                <i className="bi bi-plus me-2"></i>
                Novo Produto
              </Button>
              <Link to="/admin/colaborador" className="btn btn-outline-secondary ms-2">
                <i className="bi bi-arrow-left me-2"></i>
                Voltar
              </Link>
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <Button 
            variant="outline-danger" 
            size="sm" 
            className="float-end"
            onClick={carregarProdutos}
          >
            Tentar novamente
          </Button>
        </Alert>
      )}

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-list me-2"></i>
                Lista de Produtos ({produtos.length})
              </h5>
            </Card.Header>
            <Card.Body>
              {produtos.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-inbox display-1 text-muted"></i>
                  <h4 className="mt-3">Nenhum produto encontrado</h4>
                  <p className="text-muted">Clique em "Novo Produto" para adicionar o primeiro produto.</p>
                </div>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nome</th>
                      <th>Categoria</th>
                      <th>Preço</th>
                      <th>Estoque</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(produtos || []).map((produto) => (
                      <tr key={produto.id}>
                        <td>{produto.id}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            {produto.imagem && (
                              <img 
                                src={produto.imagem} 
                                alt={produto.nome}
                                className="me-2"
                                style={{width: '40px', height: '40px', objectFit: 'cover'}}
                              />
                            )}
                            <div>
                              <strong>{produto.nome}</strong>
                              {produto.marca && <small className="d-block text-muted">{produto.marca}</small>}
                            </div>
                          </div>
                        </td>
                        <td>{produto.categoria}</td>
                        <td>R$ {produto.preco}</td>
                        <td>
                          <span className={`badge ${produto.estoque > 0 ? 'bg-success' : 'bg-danger'}`}>
                            {produto.estoque}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${produto.ativo ? 'bg-success' : 'bg-secondary'}`}>
                            {produto.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-1"
                            onClick={() => navegarParaEdicao(produto)}
                            title="Editar produto"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button 
                            variant="outline-info" 
                            size="sm"
                            onClick={() => window.open(`/produto/${produto.id}`, '_blank')}
                            title="Visualizar produto"
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
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
    </Container>
    </div>
  );
};

export default GerenciarProdutos;
