import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { produtosService } from '../../services';
import './PainelColaborador.css';

const GerenciarEstoque = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    carregarProdutos();
  }, []);

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
    // Dados de demonstração para estoque
    const produtosMock = [
      {
        id: 1,
        nome: 'Caderno Universitário 100 folhas',
        categoria: 'Cadernos',
        estoque: 15,
        imagem: 'https://via.placeholder.com/40x40'
      },
      {
        id: 2,
        nome: 'Caneta Esferográfica Azul',
        categoria: 'Lápis',
        estoque: 3,
        imagem: 'https://via.placeholder.com/40x40'
      },
      {
        id: 3,
        nome: 'Marcador Permanente Preto',
        categoria: 'Canetas',
        estoque: 0,
        imagem: 'https://via.placeholder.com/40x40'
      },
      {
        id: 4,
        nome: 'Lápis HB Kit 12 unidades',
        categoria: 'Canetas',
        estoque: 25,
        imagem: 'https://via.placeholder.com/40x40'
      }
    ];
    
    setProdutos(produtosMock);
    setError('Dados de demonstração - Verifique se o backend está rodando na porta correta');
  };

  const produtosFiltrados = produtos.filter(produto => {
    switch (filtro) {
      case 'sem-estoque':
        return produto.estoque === 0;
      case 'estoque-baixo':
        return produto.estoque > 0 && produto.estoque <= 5;
      case 'estoque-normal':
        return produto.estoque > 5;
      default:
        return true;
    }
  });

  const atualizarEstoque = async (produtoId, novoEstoque) => {
    try {
      const response = await produtosService.atualizarEstoque(produtoId, novoEstoque);
      if (response.sucesso) {
        // Atualizar o produto na lista local
        setProdutos(prev => prev.map(p => 
          p.id === produtoId ? { ...p, estoque: novoEstoque } : p
        ));
      } else {
        setError(response.mensagem || 'Erro ao atualizar estoque');
      }
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      setError('Erro ao atualizar estoque');
    }
  };

  const getStatusEstoque = (estoque) => {
    if (estoque === 0) return { variant: 'danger', texto: 'Sem Estoque' };
    if (estoque <= 5) return { variant: 'warning', texto: 'Estoque Baixo' };
    return { variant: 'success', texto: 'Estoque Normal' };
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando estoque...</p>
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
              <i className="bi bi-boxes me-2"></i>
              Controle de Estoque
            </h2>
            <Link to="/admin/colaborador" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-2"></i>
              Voltar
            </Link>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Resumo rápido */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">{produtos.length}</h3>
              <p className="mb-0">Total de Produtos</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-danger">{produtos.filter(p => p.estoque === 0).length}</h3>
              <p className="mb-0">Sem Estoque</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">{produtos.filter(p => p.estoque > 0 && p.estoque <= 5).length}</h3>
              <p className="mb-0">Estoque Baixo</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{produtos.filter(p => p.estoque > 5).length}</h3>
              <p className="mb-0">Estoque Normal</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Row className="mb-3">
        <Col>
          <Form.Select 
            value={filtro} 
            onChange={(e) => setFiltro(e.target.value)}
            className="w-auto"
          >
            <option value="todos">Todos os Produtos</option>
            <option value="sem-estoque">Sem Estoque</option>
            <option value="estoque-baixo">Estoque Baixo (≤5)</option>
            <option value="estoque-normal">Estoque Normal (&gt;5)</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Tabela de produtos */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-list me-2"></i>
                Produtos ({produtosFiltrados.length})
              </h5>
            </Card.Header>
            <Card.Body>
              {produtosFiltrados.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-inbox display-1 text-muted"></i>
                  <h4 className="mt-3">Nenhum produto encontrado</h4>
                  <p className="text-muted">Tente alterar o filtro para ver outros produtos.</p>
                </div>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Categoria</th>
                      <th>Estoque Atual</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosFiltrados.map((produto) => {
                      const status = getStatusEstoque(produto.estoque);
                      return (
                        <tr key={produto.id}>
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
                                <small className="d-block text-muted">ID: {produto.id}</small>
                              </div>
                            </div>
                          </td>
                          <td>{produto.categoria}</td>
                          <td>
                            <span className="h5">{produto.estoque}</span>
                          </td>
                          <td>
                            <Badge bg={status.variant}>{status.texto}</Badge>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button 
                                variant="outline-success" 
                                size="sm"
                                onClick={() => {
                                  const novoEstoque = prompt(`Novo estoque para ${produto.nome}:`, produto.estoque);
                                  if (novoEstoque !== null && !isNaN(novoEstoque)) {
                                    atualizarEstoque(produto.id, parseInt(novoEstoque));
                                  }
                                }}
                              >
                                <i className="bi bi-pencil me-1"></i>
                                Editar
                              </Button>
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => atualizarEstoque(produto.id, produto.estoque + 10)}
                              >
                                <i className="bi bi-plus me-1"></i>
                                +10
                              </Button>
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
        </Col>
      </Row>
    </Container>
    </div>
  );
};

export default GerenciarEstoque;
