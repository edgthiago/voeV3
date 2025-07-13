import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { produtosService } from '../../services';
import './PainelColaborador.css';

const EditarProduto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [produto, setProduto] = useState({
    nome: '',
    descricao: '',
    preco_atual: '',
    preco_antigo: '',
    categoria: '',
    marca: '',
    genero: 'unissex',
    quantidade_estoque: '',
    imagem: '',
    especificacoes: '',
    indicacao: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingProduto, setLoadingProduto] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    carregarProduto();
  }, [id]);

  const carregarProduto = async () => {
    try {
      setLoadingProduto(true);
      setError(null);
      const response = await produtosService.buscarPorId(id);
      
      if (response.sucesso && response.dados) {
        const dadosProduto = response.dados.produto || response.dados;
        setProduto({
          nome: dadosProduto.nome || '',
          descricao: dadosProduto.descricao || '',
          preco_atual: dadosProduto.preco_atual || '',
          preco_antigo: dadosProduto.preco_antigo || '',
          categoria: dadosProduto.categoria || '',
          marca: dadosProduto.marca || '',
          genero: dadosProduto.genero || 'unissex',
          quantidade_estoque: dadosProduto.quantidade_estoque || '',
          imagem: dadosProduto.imagem || '',
          especificacoes: dadosProduto.especificacoes || '',
          indicacao: dadosProduto.indicacao || ''
        });
      } else {
        setError('Produto não encontrado');
      }
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      setError('Erro ao carregar dados do produto');
    } finally {
      setLoadingProduto(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const produtoData = {
        nome: produto.nome,
        descricao: produto.descricao,
        marca: produto.marca,
        categoria: produto.categoria,
        preco_atual: parseFloat(produto.preco_atual) || 0,
        preco_antigo: produto.preco_antigo ? parseFloat(produto.preco_antigo) : null,
        quantidade_estoque: parseInt(produto.quantidade_estoque) || 0,
        genero: produto.genero,
        condicao: 'novo', // Sempre novo para papelaria
        especificacoes: produto.especificacoes,
        indicacao: produto.indicacao,
        imagem: produto.imagem || '/papelaria_produtos.png'
      };

      console.log('🔄 Atualizando produto:', produtoData);

      const response = await produtosService.atualizar(id, produtoData);

      if (response.sucesso) {
        setSuccess(true);
        console.log('✅ Produto atualizado com sucesso!');
        setTimeout(() => {
          navigate('/dashboard/produtos');
        }, 1500);
      } else {
        setError(response.mensagem || 'Erro ao atualizar produto');
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      setError('Erro ao atualizar produto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduto) {
    return (
      <div className="admin-container">
        <Container>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="mt-2">Carregando dados do produto...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (error && !produto.nome) {
    return (
      <div className="admin-container">
        <Container>
          <Alert variant="danger">
            <Alert.Heading>Erro</Alert.Heading>
            <p>{error}</p>
            <hr />
            <div className="d-flex justify-content-end">
              <Link to="/dashboard/produtos" className="btn btn-outline-danger">
                Voltar para Produtos
              </Link>
            </div>
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <Container>
        <Row>
          <Col lg={8}>
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">
                      <i className="bi bi-pencil-square me-2"></i>
                      Editar Produto
                    </h5>
                    <small>Atualize as informações do produto de papelaria</small>
                  </div>
                  <Link to="/dashboard/produtos" className="btn btn-light btn-sm">
                    <i className="bi bi-arrow-left me-1"></i>
                    Voltar
                  </Link>
                </div>
              </Card.Header>
              
              <Card.Body>
                {error && (
                  <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert variant="success">
                    <i className="bi bi-check-circle me-2"></i>
                    Produto atualizado com sucesso! Redirecionando...
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nome do Produto *</Form.Label>
                        <Form.Control
                          type="text"
                          name="nome"
                          value={produto.nome}
                          onChange={handleChange}
                          required
                          placeholder="Ex: Caderno Universitário 10 Matérias"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Marca *</Form.Label>
                        <Form.Control
                          type="text"
                          name="marca"
                          value={produto.marca}
                          onChange={handleChange}
                          required
                          placeholder="Ex: Tilibra, Faber-Castell, BIC"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Descrição *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="descricao"
                      value={produto.descricao}
                      onChange={handleChange}
                      required
                      placeholder="Descreva o produto detalhadamente..."
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Categoria *</Form.Label>
                        <Form.Select
                          name="categoria"
                          value={produto.categoria}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Selecione uma categoria</option>
                          <option value="cadernos">Cadernos e Blocos</option>
                          <option value="canetas">Canetas e Lápis</option>
                          <option value="material-escolar">Material Escolar</option>
                          <option value="material-escritorio">Material de Escritório</option>
                          <option value="arte-artesanato">Arte e Artesanato</option>
                          <option value="organizacao">Organização</option>
                          <option value="livros-didaticos">Livros Didáticos</option>
                          <option value="tecnologia">Tecnologia</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Público-Alvo *</Form.Label>
                        <Form.Select
                          name="genero"
                          value={produto.genero}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Selecione o público-alvo</option>
                          <option value="unissex">Uso Geral</option>
                          <option value="masculino">Infantil Masculino</option>
                          <option value="feminino">Infantil Feminino</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Preço Atual (R$) *</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name="preco_atual"
                          value={produto.preco_atual}
                          onChange={handleChange}
                          required
                          placeholder="Ex: 25.90"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Preço Antigo (R$)</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name="preco_antigo"
                          value={produto.preco_antigo}
                          onChange={handleChange}
                          placeholder="Ex: 29.90"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Estoque *</Form.Label>
                        <Form.Control
                          type="number"
                          name="quantidade_estoque"
                          value={produto.quantidade_estoque}
                          onChange={handleChange}
                          required
                          placeholder="Ex: 50"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>URL da Imagem</Form.Label>
                        <Form.Control
                          type="url"
                          name="imagem"
                          value={produto.imagem}
                          onChange={handleChange}
                          placeholder="https://exemplo.com/imagem.jpg"
                        />
                        <Form.Text className="text-muted">
                          Deixe vazio para usar a imagem padrão
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Especificações Técnicas</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="especificacoes"
                      value={produto.especificacoes}
                      onChange={handleChange}
                      placeholder="Ex: Formato A4, 200 folhas, gramatura 75g/m², capa dura, espiral, margens coloridas"
                    />
                    <Form.Text className="text-muted">
                      Inclua medidas, materiais, capacidades, etc.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Indicação de Uso</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="indicacao"
                      value={produto.indicacao}
                      onChange={handleChange}
                      placeholder="Ex: Ideal para estudantes universitários, profissionais, anotações diárias"
                    />
                    <Form.Text className="text-muted">
                      Para quem e para que serve este produto
                    </Form.Text>
                  </Form.Group>

                  <div className="d-flex justify-content-between">
                    <Link to="/dashboard/produtos" className="btn btn-secondary">
                      <i className="bi bi-arrow-left me-1"></i>
                      Cancelar
                    </Link>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={loading}
                      className="px-4"
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Atualizando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg me-1"></i>
                          Atualizar Produto
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm">
              <Card.Header className="bg-light">
                <h6 className="mb-0">
                  <i className="bi bi-lightbulb me-2"></i>
                  Dicas para Edição
                </h6>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong>Nome do Produto:</strong>
                  <p className="small text-muted mb-2">Mantenha informativo e específico. Inclua características principais.</p>
                </div>
                
                <div className="mb-3">
                  <strong>Categorização:</strong>
                  <p className="small text-muted mb-2">Escolha a categoria mais específica possível para facilitar a busca.</p>
                </div>
                
                <div className="mb-3">
                  <strong>Preços:</strong>
                  <p className="small text-muted mb-2">Verifique se estão competitivos. Preço antigo cria senso de economia.</p>
                </div>
                
                <div className="mb-3">
                  <strong>Estoque:</strong>
                  <p className="small text-muted mb-2">Mantenha atualizado para evitar vendas de produtos indisponíveis.</p>
                </div>
                
                <div className="mb-3">
                  <strong>Avaliações:</strong>
                  <p className="small text-muted mb-2">Avaliação atual: {produto.avaliacao || 0} ⭐</p>
                  <p className="small text-muted mb-2">Total: {produto.total_avaliacoes || 0} avaliações</p>
                </div>
                
                <Alert variant="info" className="small">
                  <i className="bi bi-info-circle me-1"></i>
                  <strong>Nota:</strong> Todos os produtos de papelaria são considerados novos.
                </Alert>
                
                <Alert variant="warning" className="small">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  <strong>Atenção:</strong> Alterações em preço e estoque afetam vendas imediatamente.
                </Alert>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EditarProduto;
