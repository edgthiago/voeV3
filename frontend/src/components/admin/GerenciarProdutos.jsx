import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { produtosService } from '../../services';
import './PainelColaborador.css';

const GerenciarProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);

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
    // Dados de demonstração
    const produtosMock = [
      {
        id: 1,
        nome: 'Tênis Nike Air Max',
        categoria: 'Tênis Esportivo',
        preco: '299.90',
        estoque: 15,
        ativo: true,
        marca: 'Nike',
        imagem: 'https://via.placeholder.com/40x40'
      },
      {
        id: 2,
        nome: 'Tênis Adidas Ultraboost',
        categoria: 'Tênis Corrida',
        preco: '399.90',
        estoque: 8,
        ativo: true,
        marca: 'Adidas',
        imagem: 'https://via.placeholder.com/40x40'
      },
      {
        id: 3,
        nome: 'Tênis Vans Old Skool',
        categoria: 'Tênis Casual',
        preco: '189.90',
        estoque: 0,
        ativo: true,
        marca: 'Vans',
        imagem: 'https://via.placeholder.com/40x40'
      }
    ];
    
    setProdutos(produtosMock);
    setError('Dados de demonstração - Verifique se o backend está rodando na porta correta');
  };

  const abrirModalEdicao = (produto = null) => {
    setProdutoEditando(produto);
    setShowModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
    setProdutoEditando(null);
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
              <Button variant="primary" onClick={() => abrirModalEdicao()}>
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
                    {produtos.map((produto) => (
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
                            onClick={() => abrirModalEdicao(produto)}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button 
                            variant="outline-info" 
                            size="sm"
                            onClick={() => window.open(`/produto/${produto.id}`, '_blank')}
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

      {/* Modal para edição/criação de produto */}
      <Modal show={showModal} onHide={fecharModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {produtoEditando ? 'Editar Produto' : 'Novo Produto'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center py-4">
            <i className="bi bi-tools display-1 text-muted"></i>
            <h4 className="mt-3">Funcionalidade em Desenvolvimento</h4>
            <p className="text-muted">
              O formulário de edição/criação de produtos será implementado em breve.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={fecharModal}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
    </div>
  );
};

export default GerenciarProdutos;
