/**
 * PaginaProdutosPersonalizados
 * 
 * Página para criação de produtos personalizados onde o cliente pode:
 * - Escolher o tipo de produto
 * - Personalizar com nome, texto, cores
 * - Visualizar preview em tempo real
 * - Adicionar ao carrinho
 */

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { BsStarFill, BsCartPlus, BsEye, BsPalette, BsTypeBold, BsJournalBookmark, BsCalendarEvent, BsClipboard, BsGraphUp, BsCalendar3, BsTags, BsTruck, BsPaletteFill, BsGift, BsShieldCheck } from 'react-icons/bs';
import { useCarrinho } from '../../context/ContextoCarrinho';
import './PaginaProdutosPersonalizados.css';

const PaginaProdutosPersonalizados = () => {
  const { adicionarAoCarrinho } = useCarrinho();

  // Estados para personalização
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [personalizacao, setPersonalizacao] = useState({
    nome: '',
    texto: '',
    cor: '#E8C5D8',
    fonte: 'Arial',
    tamanho: 'M'
  });
  const [precoFinal, setPrecoFinal] = useState(0);
  const [mostrarAlert, setMostrarAlert] = useState(false);

  // Produtos disponíveis para personalização
  const produtosPersonalizaveis = [
    {
      id: 'caderno-personalizado',
      nome: 'Caderno Personalizado',
      categoria: 'Cadernos',
      precoBase: 25.90,
      imagem: '/tenis_produtos.png',
      descricao: 'Caderno com capa personalizada, 200 páginas',
      opcoes: {
        tamanhos: ['A4', 'A5', 'A6'],
        cores: ['#E8C5D8', '#FFB6C1', '#DDA0DD', '#98FB98', '#87CEEB'],
        fontes: ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Poppins']
      }
    },
    {
      id: 'agenda-personalizada',
      nome: 'Agenda Personalizada',
      categoria: 'Agendas',
      precoBase: 35.90,
      imagem: '/tenis_produtos.png',
      descricao: 'Agenda anual com capa personalizada',
      opcoes: {
        tamanhos: ['A4', 'A5'],
        cores: ['#E8C5D8', '#FFB6C1', '#DDA0DD', '#F0E68C', '#FFA07A'],
        fontes: ['Arial', 'Times New Roman', 'Verdana', 'Georgia', 'Montserrat']
      }
    },
    {
      id: 'bloco-personalizado',
      nome: 'Bloco de Notas Personalizado',
      categoria: 'Blocos',
      precoBase: 12.90,
      imagem: '/tenis_produtos.png',
      descricao: 'Bloco de notas com capa personalizada, 100 folhas',
      opcoes: {
        tamanhos: ['A5', 'A6'],
        cores: ['#E8C5D8', '#FFB6C1', '#DDA0DD', '#87CEEB', '#98FB98'],
        fontes: ['Arial', 'Impact', 'Comic Sans MS', 'Georgia', 'Dancing Script']
      }
    },
    {
      id: 'planner-personalizado',
      nome: 'Planner Personalizado',
      categoria: 'Planners',
      precoBase: 42.90,
      imagem: '/tenis_produtos.png',
      descricao: 'Planner anual com layout personalizado',
      opcoes: {
        tamanhos: ['A4', 'A5'],
        cores: ['#E8C5D8', '#FFB6C1', '#DDA0DD', '#98FB98', '#FFA07A'],
        fontes: ['Arial', 'Times New Roman', 'Verdana', 'Roboto', 'Open Sans']
      }
    },
    {
      id: 'calendario-personalizado',
      nome: 'Calendário Personalizado',
      categoria: 'Calendários',
      precoBase: 28.90,
      imagem: '/tenis_produtos.png',
      descricao: 'Calendário de mesa com fotos e textos personalizados',
      opcoes: {
        tamanhos: ['A4', 'A5', 'A3'],
        cores: ['#E8C5D8', '#FFB6C1', '#DDA0DD', '#87CEEB', '#F0E68C'],
        fontes: ['Arial', 'Times New Roman', 'Georgia', 'Verdana', 'Poppins']
      }
    },
    {
      id: 'etiquetas-personalizadas',
      nome: 'Etiquetas Personalizadas',
      categoria: 'Etiquetas',
      precoBase: 15.90,
      imagem: '/tenis_produtos.png',
      descricao: 'Kit com 50 etiquetas personalizadas',
      opcoes: {
        tamanhos: ['P', 'M', 'G'],
        cores: ['#E8C5D8', '#FFB6C1', '#DDA0DD', '#98FB98', '#FFA07A'],
        fontes: ['Arial', 'Times New Roman', 'Verdana', 'Impact', 'Roboto']
      }
    }
  ];

  // Calcular preço final baseado nas personalizações
  useEffect(() => {
    if (!produtoSelecionado) return;

    let preco = produtoSelecionado.precoBase;
    
    // Adicionar custo por personalização
    if (personalizacao.nome) preco += 5.00;
    if (personalizacao.texto) preco += 3.00;
    if (personalizacao.tamanho === 'G' || personalizacao.tamanho === 'A4') preco += 8.00;
    if (personalizacao.tamanho === 'A5' || personalizacao.tamanho === '400ml') preco += 4.00;

    setPrecoFinal(preco);
  }, [produtoSelecionado, personalizacao]);

  const selecionarProduto = (produto) => {
    setProdutoSelecionado(produto);
    setPersonalizacao({
      nome: '',
      texto: '',
      cor: produto.opcoes.cores[0],
      fonte: produto.opcoes.fontes[0],
      tamanho: produto.opcoes.tamanhos[0]
    });
  };

  const atualizarPersonalizacao = (campo, valor) => {
    setPersonalizacao(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const adicionarProdutoPersonalizado = () => {
    if (!produtoSelecionado) return;

    const produtoPersonalizado = {
      id: `${produtoSelecionado.id}-${Date.now()}`,
      nome: `${produtoSelecionado.nome} - Personalizado`,
      marca: 'Voe Papel',
      categoria: produtoSelecionado.categoria,
      preco_atual: precoFinal,
      preco_antigo: null,
      desconto: 0,
      imagem: produtoSelecionado.imagem,
      avaliacao: 5,
      numero_avaliacoes: 1,
      personalizado: true,
      detalhes_personalizacao: {
        nome: personalizacao.nome,
        texto: personalizacao.texto,
        cor: personalizacao.cor,
        fonte: personalizacao.fonte,
        tamanho: personalizacao.tamanho
      }
    };

    adicionarAoCarrinho(produtoPersonalizado, 1);
    setMostrarAlert(true);
    setTimeout(() => setMostrarAlert(false), 3000);
  };

  const getIconeProduto = (id) => {
    if (id.includes('caderno')) return <BsJournalBookmark size={28} style={{color: 'var(--primary-color)'}} />;
    if (id.includes('agenda')) return <BsCalendarEvent size={28} style={{color: 'var(--primary-color)'}} />;
    if (id.includes('bloco')) return <BsClipboard size={28} style={{color: 'var(--primary-color)'}} />;
    if (id.includes('planner')) return <BsGraphUp size={28} style={{color: 'var(--primary-color)'}} />;
    if (id.includes('calendario')) return <BsCalendar3 size={28} style={{color: 'var(--primary-color)'}} />;
    if (id.includes('etiquetas')) return <BsTags size={28} style={{color: 'var(--primary-color)'}} />;
    return <BsClipboard size={28} style={{color: 'var(--primary-color)'}} />;
  };

  const renderizarPreview = () => {
    if (!produtoSelecionado) return null;

    return (
      <div className="preview-container">
        <div 
          className="preview-produto"
          style={{ 
            backgroundColor: personalizacao.cor,
            fontFamily: personalizacao.fonte
          }}
        >
          <div className="preview-icone">
            {getIconeProduto(produtoSelecionado.id)}
          </div>
          {personalizacao.nome && (
            <div className="preview-nome">
              {personalizacao.nome}
            </div>
          )}
          {personalizacao.texto && (
            <div className="preview-texto">
              {personalizacao.texto}
            </div>
          )}
        </div>
        <p className="preview-info">
          <BsEye className="me-1" />
          Preview em tempo real
        </p>
      </div>
    );
  };

  return (
    <Container fluid className="py-5 pagina-produtos-personalizados">
      <Container>
        <Row>
          <Col>
            <div className="d-flex align-items-center justify-content-center mb-5">
              <div className="text-center">
                <div className="mb-3">
                  <BsPalette size={48} style={{color: 'var(--primary-color)'}} />
                </div>
                <h1 className="h1 mb-3">
                  🎨 Produtos Personalizados
                </h1>
                <p className="text-muted mb-0 lead">
                  Crie produtos únicos com seu nome e estilo pessoal. Transforme suas ideias em realidade!
                </p>
                <div className="mt-4">
                  <span className="badge bg-primary fs-6 px-4 py-2">
                    ✨ Design Premium • Entrega Rápida • Qualidade Garantida
                  </span>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {mostrarAlert && (
          <Alert variant="success" className="alert-personalizado mb-4">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <div className="alert-icon">
                  ✅
                </div>
              </div>
              <div>
                <strong>Sucesso!</strong> Produto personalizado adicionado ao carrinho com sucesso!
              </div>
            </div>
          </Alert>
        )}

        <Row className="g-4">
          {/* Seleção de Produtos */}
          <Col lg={4} className="mb-4">
            <Card className="produtos-card h-100">
              <Card.Header className="bg-gradient-primary text-white">
                <h5 className="mb-0 d-flex align-items-center">
                  <BsStarFill className="me-2" />
                  Escolha seu Produto
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="mb-3">
                  <p className="text-muted small mb-3">
                    Selecione o produto que deseja personalizar e deixe sua marca única!
                  </p>
                </div>
                {produtosPersonalizaveis.map(produto => (
                  <Card 
                    key={produto.id}
                    className={`produto-item mb-3 ${produtoSelecionado?.id === produto.id ? 'selecionado' : ''}`}
                    onClick={() => selecionarProduto(produto)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Card.Body className="p-3">
                      <div className="d-flex align-items-center">
                        <div className="produto-thumb me-3 d-flex align-items-center justify-content-center">
                          {getIconeProduto(produto.id)}
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fw-bold">{produto.nome}</h6>
                          <p className="text-muted small mb-2">{produto.descricao}</p>
                          <div className="d-flex align-items-center justify-content-between">
                            <Badge bg="primary" className="px-3 py-1">
                              A partir de R$ {produto.precoBase.toFixed(2)}
                            </Badge>
                            <small className="text-muted">
                              {produto.categoria}
                            </small>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </Card.Body>
            </Card>
          </Col>

          {/* Personalização */}
          <Col lg={4} className="mb-4">
            <Card className="personalizacao-card h-100">
              <Card.Header className="bg-gradient-primary text-white">
                <h5 className="mb-0 d-flex align-items-center">
                  <BsTypeBold className="me-2" />
                  Personalização
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                {produtoSelecionado ? (
                  <>
                    <div className="mb-3">
                      <p className="text-muted small mb-3">
                        Customize seu <strong>{produtoSelecionado.nome}</strong> da forma que quiser!
                      </p>
                    </div>

                    <Form.Group className="mb-4">
                      <Form.Label className="d-flex align-items-center">
                        <span className="me-2">📝</span>
                        Nome Personalizado
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Digite seu nome ou texto..."
                        value={personalizacao.nome}
                        onChange={(e) => atualizarPersonalizacao('nome', e.target.value)}
                        maxLength="20"
                        className="form-control-premium"
                      />
                      <Form.Text className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        Adiciona R$ 5,00 • Máximo 20 caracteres
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="d-flex align-items-center">
                        <span className="me-2">💬</span>
                        Texto Adicional
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Adicione uma frase especial..."
                        value={personalizacao.texto}
                        onChange={(e) => atualizarPersonalizacao('texto', e.target.value)}
                        maxLength="50"
                        className="form-control-premium"
                      />
                      <Form.Text className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        Adiciona R$ 3,00 • Máximo 50 caracteres
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="d-flex align-items-center">
                        <span className="me-2">🎨</span>
                        Escolha a Cor
                      </Form.Label>
                      <div className="cores-container">
                        {produtoSelecionado.opcoes.cores.map(cor => (
                          <div
                            key={cor}
                            className={`cor-opcao ${personalizacao.cor === cor ? 'selecionada' : ''}`}
                            style={{ backgroundColor: cor }}
                            onClick={() => atualizarPersonalizacao('cor', cor)}
                            title={`Cor: ${cor}`}
                          />
                        ))}
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="d-flex align-items-center">
                        <span className="me-2">🔤</span>
                        Fonte
                      </Form.Label>
                      <Form.Select
                        value={personalizacao.fonte}
                        onChange={(e) => atualizarPersonalizacao('fonte', e.target.value)}
                        className="form-select-premium"
                      >
                        {produtoSelecionado.opcoes.fontes.map(fonte => (
                          <option key={fonte} value={fonte} style={{fontFamily: fonte}}>
                            {fonte}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="d-flex align-items-center">
                        <span className="me-2">📏</span>
                        Tamanho
                      </Form.Label>
                      <Form.Select
                        value={personalizacao.tamanho}
                        onChange={(e) => atualizarPersonalizacao('tamanho', e.target.value)}
                        className="form-select-premium"
                      >
                        {produtoSelecionado.opcoes.tamanhos.map(tamanho => (
                          <option key={tamanho} value={tamanho}>
                            {tamanho}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <div className="preco-final mb-4">
                      <div className="text-center">
                        <h5 className="mb-2">
                          <i className="bi bi-calculator me-2"></i>
                          Valor Total
                        </h5>
                        <div className="display-6 fw-bold">
                          R$ {precoFinal.toFixed(2)}
                        </div>
                        <small className="text-muted">
                          Produto personalizado
                        </small>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="lg"
                      className="w-100 btn-premium"
                      onClick={adicionarProdutoPersonalizado}
                      disabled={!personalizacao.nome && !personalizacao.texto}
                    >
                      <BsCartPlus className="me-2" />
                      Adicionar ao Carrinho
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-5">
                    <div className="mb-4">
                      <BsPalette size={64} className="text-muted opacity-50" />
                    </div>
                    <h6 className="text-muted mb-2">Escolha um produto</h6>
                    <p className="text-muted small">
                      Selecione um produto na lista ao lado para começar a personalizar
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

        {/* Preview */}
        <Col lg={4} className="mb-4">
          <Card className="preview-card h-100">
            <Card.Header className="bg-gradient-primary text-white">
              <h5 className="mb-0">
                <BsEye className="me-2" />
                Preview
              </h5>
            </Card.Header>
            <Card.Body className="text-center">
              {produtoSelecionado ? (
                renderizarPreview()
              ) : (
                <div className="py-5">
                  <BsEye size={48} className="text-muted mb-3" />
                  <h6 className="text-muted">Preview aparecerá aqui</h6>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Informações Adicionais */}
      <Row className="mt-4">
        <Col>
          <Card className="info-card">
            <Card.Body>
              <Row>
                <Col md={3} className="text-center mb-3">
                  <div className="info-icon">
                    <BsTruck size={40} style={{color: 'var(--primary-color)'}} />
                  </div>
                  <h6>Entrega Rápida</h6>
                  <p className="text-muted small">Produtos personalizados em até 5 dias úteis</p>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div className="info-icon">
                    <BsPaletteFill size={40} style={{color: 'var(--primary-color)'}} />
                  </div>
                  <h6>Alta Qualidade</h6>
                  <p className="text-muted small">Impressão e bordado com materiais premium</p>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div className="info-icon">
                    <BsGift size={40} style={{color: 'var(--primary-color)'}} />
                  </div>
                  <h6>Presente Único</h6>
                  <p className="text-muted small">Ideal para presentes personalizados</p>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <div className="info-icon">
                    <BsShieldCheck size={40} style={{color: 'var(--primary-color)'}} />
                  </div>
                  <h6>Garantia</h6>
                  <p className="text-muted small">Satisfação garantida ou seu dinheiro de volta</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default PaginaProdutosPersonalizados;
