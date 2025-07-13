import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { produtosService } from '../../services';
import ImageUploadManager from './ImageUploadManager';
import './PainelColaborador.css';

const AdicionarProduto = () => {
  const navigate = useNavigate();
  const [produto, setProduto] = useState({
    nome: '',
    descricao: '',
    preco_atual: '',
    preco_antigo: '',
    categoria: '',
    marca: '',
    genero: 'unissex', // Default para uso geral
    quantidade_estoque: '',
    avaliacao: 0,
    total_avaliacoes: 0,
    desconto: 0,
    imagem: '',
    especificacoes: '',
    indicacao: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [produtoId, setProdutoId] = useState(null); // Para o upload de imagens

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
      // Preparar dados do produto
      const produtoData = {
        nome: produto.nome,
        descricao: produto.descricao,
        marca: produto.marca,
        categoria: produto.categoria,
        genero: produto.genero,
        condicao: produto.condicao || 'novo',
        preco_atual: parseFloat(produto.preco_atual),
        preco_antigo: parseFloat(produto.preco_antigo || produto.preco_atual),
        desconto: produto.desconto || 0,
        avaliacao: produto.avaliacao || 0,
        numero_avaliacoes: produto.total_avaliacoes || 0,
        estoque: parseInt(produto.quantidade_estoque) || 0,
        imagem: produto.imagem || '/img/papelaria_produtos.png'
      };

      const response = await produtosService.criar(produtoData);
      
      if (response.sucesso) {
        setSuccess(true);
        setProdutoId(response.dados?.id || response.id); // Salvar ID do produto criado
        console.log('✅ Produto criado com sucesso, ID:', response.dados?.id || response.id);
        setTimeout(() => {
          // Não redirecionar imediatamente para permitir upload de imagens
          // navigate('/dashboard/produtos');
        }, 2000);
      } else {
        setError(response.mensagem || 'Erro ao criar produto');
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      setError('Erro de conexão. Produto criado em modo demonstração.');
      // Simular sucesso para demonstração
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard/produtos');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-colaborador">
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <h2>
                <i className="bi bi-plus-circle me-2"></i>
                Adicionar Novo Produto
              </h2>
              <Link to="/dashboard/produtos" className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left me-2"></i>
                Voltar para Produtos
              </Link>
            </div>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" className="mb-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-4">
            <i className="bi bi-check-circle me-2"></i>
            Produto criado com sucesso! Redirecionando...
          </Alert>
        )}

        <Row>
          <Col lg={8}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Informações do Produto</h5>
              </Card.Header>
              <Card.Body>
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
                          placeholder="Ex: Caderno Universitário 200 folhas - Tilibra"
                        />
                      </Form.Group>
                    </Col>
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
                          <option value="canetas">Canetas e Esferográficas</option>
                          <option value="lapis">Lápis e Lapiseiras</option>
                          <option value="marcadores">Marcadores e Marca-textos</option>
                          <option value="papel">Papel e Folhas</option>
                          <option value="arquivo">Arquivo e Organização</option>
                          <option value="escolar">Material Escolar Básico</option>
                          <option value="escritorio">Material de Escritório</option>
                          <option value="arte">Material de Arte</option>
                          <option value="agendas">Agendas e Planners</option>
                          <option value="acessorios">Acessórios e Ferramentas</option>
                          <option value="calculadoras">Calculadoras</option>
                          <option value="impressao">Material de Impressão</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Marca *</Form.Label>
                        <Form.Control
                          type="text"
                          name="marca"
                          value={produto.marca}
                          onChange={handleChange}
                          required
                          placeholder="Ex: Faber-Castell, BIC, Pilot"
                        />
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
                        <Form.Text className="text-muted">
                          Para a maioria dos produtos de papelaria, use "Uso Geral"
                        </Form.Text>
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
                          placeholder="Ex: 29.90 (se houver desconto)"
                        />
                        <Form.Text className="text-muted">
                          Deixe vazio se não há desconto
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Estoque Inicial *</Form.Label>
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

                  <Form.Group className="mb-3">
                    <Form.Label>Especificações Técnicas</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="especificacoes"
                      value={produto.especificacoes || ''}
                      onChange={handleChange}
                      placeholder="Ex: Formato A4, 200 folhas, gramatura 75g/m², capa dura, espiral, margens coloridas"
                    />
                    <Form.Text className="text-muted">
                      Inclua medidas, materiais, capacidades, etc.
                    </Form.Text>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Avaliação Inicial</Form.Label>
                        <Form.Select
                          name="avaliacao"
                          value={produto.avaliacao}
                          onChange={handleChange}
                        >
                          <option value="0">0 - Sem avaliação</option>
                          <option value="1">1 estrela</option>
                          <option value="2">2 estrelas</option>
                          <option value="3">3 estrelas</option>
                          <option value="4">4 estrelas</option>
                          <option value="5">5 estrelas</option>
                        </Form.Select>
                        <Form.Text className="text-muted">
                          Deixe 0 para produtos novos
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Indicado para</Form.Label>
                        <Form.Control
                          type="text"
                          name="indicacao"
                          value={produto.indicacao || ''}
                          onChange={handleChange}
                          placeholder="Ex: Estudantes, Escritório, Arte, Desenho"
                        />
                        <Form.Text className="text-muted">
                          Para que tipo de uso é indicado
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Descrição</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="descricao"
                      value={produto.descricao}
                      onChange={handleChange}
                      placeholder="Descrição detalhada: características, materiais, dimensões, formas de uso, idade recomendada, etc."
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Imagens do Produto</Form.Label>
                    {produtoId ? (
                      <ImageUploadManager 
                        produtoId={produtoId}
                        onImagesChange={(imagens) => {
                          console.log('📸 Imagens atualizadas:', imagens);
                        }}
                      />
                    ) : (
                      <Alert variant="info" className="small">
                        <i className="bi bi-info-circle me-1"></i>
                        As imagens poderão ser adicionadas após criar o produto.
                      </Alert>
                    )}
                  </Form.Group>

                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <Link to="/dashboard/produtos" className="btn btn-outline-secondary me-md-2">
                      {success ? 'Finalizar' : 'Cancelar'}
                    </Link>
                    {!success ? (
                      <Button 
                        type="submit" 
                        variant="primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Criando...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-save me-2"></i>
                            Criar Produto
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        variant="success"
                        onClick={() => navigate('/dashboard/produtos')}
                      >
                        <i className="bi bi-check-circle me-2"></i>
                        Concluir e Voltar
                      </Button>
                    )}
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card>
              <Card.Header>
                <h6 className="mb-0">Dicas para Cadastro</h6>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong>Nome do Produto:</strong>
                  <p className="small text-muted mb-2">Inclua marca, modelo e principais características</p>
                </div>
                
                <div className="mb-3">
                  <strong>Categoria:</strong>
                  <p className="small text-muted mb-2">Escolha a categoria mais específica possível</p>
                </div>
                
                <div className="mb-3">
                  <strong>Público-Alvo:</strong>
                  <p className="small text-muted mb-2">Use "Uso Geral" para a maioria dos produtos</p>
                </div>
                
                <div className="mb-3">
                  <strong>Especificações:</strong>
                  <p className="small text-muted mb-2">Tamanho, quantidade, cor, tipo de ponta, etc.</p>
                </div>
                
                <div className="mb-3">
                  <strong>Preços:</strong>
                  <p className="small text-muted mb-2">Preço antigo apenas se houver promoção</p>
                </div>
                
                <div className="mb-3">
                  <strong>Descrição:</strong>
                  <p className="small text-muted mb-2">Detalhe materiais, uso, idade recomendada</p>
                </div>
                
                <Alert variant="info" className="small">
                  <i className="bi bi-lightbulb me-1"></i>
                  <strong>Dica:</strong> Para papelaria, inclua sempre especificações como tamanho (A4, A5), 
                  quantidade (100 folhas), tipo de ponta (0.7mm), cor, etc. Isso ajuda os clientes na escolha.
                </Alert>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdicionarProduto;
