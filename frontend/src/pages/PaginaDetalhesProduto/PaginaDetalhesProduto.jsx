import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Breadcrumb, Tabs, Tab } from 'react-bootstrap';
import { useCarrinho } from '../../context/ContextoCarrinho';
import { produtosService } from '../../services';
import ComentariosProduto from '../../components/produtos/ComentariosProduto';
import './PaginaDetalhesProduto.css';

let PaginaDetalhesProduto = () => {
  let { id } = useParams();
  let { adicionarAoCarrinho } = useCarrinho();
  const navigate = useNavigate();
  let [produto, setProduto] = useState(null);
  let [carregando, setCarregando] = useState(true);
  let [quantidade, setQuantidade] = useState(1);
  let [imagemAtiva, setImagemAtiva] = useState(0);
  let [mostrarMensagemSucesso, setMostrarMensagemSucesso] = useState(false);  // Buscar dados do produto
  useEffect(() => {
    let estaMontado = true;
    
    const buscarProduto = async () => {
      try {
        setCarregando(true);
          // Tentar buscar da API primeiro
        const resposta = await produtosService.buscarPorId(id);
          if (resposta.sucesso && resposta.dados && estaMontado) {
          setProduto(resposta.dados.produto);
        }} catch (error) {
        console.error("Erro ao buscar produto da API:", error);
        
        if (estaMontado) {
          // Não há fallback - produto permanece null se não for encontrado
          setProduto(null);
        }
      } finally {
        if (estaMontado) {
          setCarregando(false);
        }
      }
    };
    
    buscarProduto();
    
    // Limpeza para evitar atualizações de estado após desmontagem
    return () => {
      estaMontado = false;
    };
  }, [id]);

  // Funções para manipular quantidade
  const aumentarQuantidade = () => {
    setQuantidade(prev => prev + 1);
  };

  const diminuirQuantidade = () => {
    if (quantidade > 1) {
      setQuantidade(prev => prev - 1);
    }
  };  
  const handleAdicionarAoCarrinho = async () => {
    if (produto) {
      try {
        // Chamar a função adicionarAoCarrinho com o produto e a quantidade selecionada
        const sucesso = await adicionarAoCarrinho(produto, quantidade);
        
        if (sucesso) {
          // Mostrar mensagem de sucesso
          setMostrarMensagemSucesso(true);
        }
      } catch (error) {
        console.error("Erro ao adicionar produto ao carrinho:", error);
        // Opcionalmente, mostrar uma mensagem de erro ao usuário
      }
    }
  };

  // Efeito para gerenciar o tempo de exibição da mensagem de sucesso
  useEffect(() => {
    let timeoutId;
    
    if (mostrarMensagemSucesso) {
      timeoutId = setTimeout(() => {
        setMostrarMensagemSucesso(false);
      }, 3000);
    }
    
    // Limpar timeout se o componente for desmontado ou a mensagem mudar
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [mostrarMensagemSucesso]);

  // Renderizar estrelas com base na classificação
  const renderizarEstrelas = (avaliacao) => {
    const estrelas = [];
    const estrelasCompletas = Math.floor(avaliacao);
    const temMeiaEstrela = avaliacao % 1 >= 0.5;
    
    // Adiciona estrelas cheias
    for (let i = 0; i < estrelasCompletas; i++) {
      estrelas.push(<i key={`star-${i}`} className="bi bi-star-fill"></i>);
    }
    
    // Adiciona meia estrela, se necessário
    if (temMeiaEstrela) {
      estrelas.push(<i key="half-star" className="bi bi-star-half"></i>);
    }
    
    // Completa com estrelas vazias
    const estrelasVazias = 5 - estrelas.length;
    for (let i = 0; i < estrelasVazias; i++) {
      estrelas.push(<i key={`empty-${i}`} className="bi bi-star"></i>);
    }
    
    return estrelas;
  };  // Galeria de imagens - usar galeria real se disponível, ou criar uma simulada
  const imagensProduto = produto ? 
    (produto.galeria_imagens && produto.galeria_imagens.length > 0) ? 
      produto.galeria_imagens :
      // Se não houver galeria, criar uma com a imagem principal repetida
      [
        produto.imagem,
        produto.imagem,
        produto.imagem,
        produto.imagem,
      ] 
    : [];

  if (carregando) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p className="mt-3">Carregando detalhes do produto...</p>
      </Container>
    );
  }

  if (!produto) {
    return (
      <Container className="my-5 text-center">
        <div className="alert alert-warning">
          <h2>Produto não encontrado</h2>
          <p>O produto que você está procurando não existe ou foi removido.</p>
          <Link to="/produtos" className="btn btn-primary mt-3">
            Voltar para a lista de produtos
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="my-5 pagina-detalhes-produto">
      {/* Breadcrumb */}      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Home</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/produtos" }}>Produtos</Breadcrumb.Item>
        <Breadcrumb.Item active>{produto.nome}</Breadcrumb.Item>
      </Breadcrumb>

      <Row>
        {/* Galeria de imagens */}
        <Col lg={6} md={6} className="mb-4">
          <div className="galeria-produto">            <div className="imagem-principal-produto">
              <img 
                src={imagensProduto[imagemAtiva]} 
                alt={produto.nome} 
                className="img-fluid imagem-produto-principal"
              />
              {produto.discount > 0 && (
                <Badge bg="danger" className="selo-desconto-produto">
                  {produto.discount}% OFF
                </Badge>
              )}
            </div>
            <div className="miniaturas-produto mt-3 d-flex">
              {imagensProduto.map((img, index) => (
                <div 
                  key={index}
                  className={`item-miniatura-produto ${imagemAtiva === index ? 'ativo' : ''}`}
                  onClick={() => setImagemAtiva(index)}
                >
                  <img src={img} alt={`Miniatura ${index + 1}`} className="img-fluid" />
                </div>
              ))}
            </div>
          </div>
        </Col>

        {/* Detalhes do produto */}
        <Col lg={6} md={6}>          <div className="info-produto">
            <p className="marca-produto mb-1">{produto.marca}</p>
            <h1 className="titulo-produto mb-3">{produto.nome}</h1>
              <div className="avaliacao-produto mb-4">
              <div className="estrelas-produto">
                {renderizarEstrelas(produto.avaliacao)}
              </div>              <span className="contagem-avaliacao-produto">({produto.numero_avaliacoes} avaliações)</span>
            </div>
              <div className="preco-produto mb-4">
              {produto.preco_antigo && (
                <span className="preco-antigo-produto">R$ {Number(produto.preco_antigo).toFixed(2).replace('.', ',')}</span>
              )}
              <span className="preco-atual-produto">R$ {Number(produto.preco_atual).toFixed(2).replace('.', ',')}</span>
              <span className="parcelas-produto">
                ou 10x de R$ {Number(produto.preco_atual / 10).toFixed(2).replace('.', ',')}
              </span>
            </div>
              <div className="descricao-produto mb-4">
              <p>
                {produto.categoria === 'cadernos' && `Este ${produto.nome} da ${produto.marca} é perfeito para suas anotações, estudos e criatividade. Com papel de alta qualidade e design funcional, é ideal para estudantes e profissionais.`}
                {produto.categoria === 'canetas' && `A ${produto.nome} da ${produto.marca} oferece escrita suave e precisa. Desenvolvida com tecnologia avançada, é perfeita para uso diário, desenhos e anotações importantes.`}
                {produto.categoria === 'material-escolar' && `O ${produto.nome} da ${produto.marca} é essencial para seu material escolar. Com qualidade superior e durabilidade, torna seus estudos mais organizados e eficientes.`}
                {produto.categoria === 'organização' && `Este ${produto.nome} da ${produto.marca} é ideal para manter seu espaço organizado. Com design moderno e funcional, combina praticidade e estilo em seu escritório ou casa.`}
                {!['cadernos', 'canetas', 'material-escolar', 'organização'].includes(produto.categoria) && `Este ${produto.nome} da ${produto.marca} é um produto de papelaria de alta qualidade. Perfeito para suas necessidades de escritório, estudos ou trabalhos criativos.`}
              </p>
            </div>
            
            <div className="acoes-produto mb-4">
              <div className="seletor-quantidade d-flex align-items-center mb-3">
                <span className="me-3">Quantidade:</span>
                <div className="controles-quantidade">
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={diminuirQuantidade}
                    disabled={quantidade <= 1}
                  >
                    -
                  </Button>
                  <span className="exibicao-quantidade">{quantidade}</span>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={aumentarQuantidade}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <div className="d-grid gap-2">
                <Button 
                  className="btn-adicionar-carrinho" 
                  size="lg"
                  onClick={handleAdicionarAoCarrinho}
                >
                  <i className="bi bi-cart-plus me-2"></i>
                  Adicionar ao Carrinho
                </Button>                <Button 
                  variant="light" 
                  className="btn-comprar-agora" 
                  size="lg"
                  onClick={async () => {
                    await handleAdicionarAoCarrinho();
                    navigate('/checkout');
                  }}
                >
                  <i className="bi bi-lightning-fill me-2"></i>
                  Comprar Agora
                </Button>
              </div>
            </div>
            
            {mostrarMensagemSucesso && (
              <div className="alert alert-success">
                Produto adicionado ao carrinho com sucesso!
              </div>
            )}
            
            <div className="meta-produto mt-4">
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-truck me-2 text-success"></i>
                <span>Frete grátis para compras acima de R$ 150,00</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-arrow-repeat me-2 text-primary"></i>
                <span>30 dias para troca ou devolução</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-shield-check me-2 text-success"></i>
                <span>Garantia contra defeitos de fabricação</span>
              </div>
              <div className="d-flex align-items-center">
                <i className="bi bi-heart me-2 text-danger"></i>
                <span>Produto sustentável e ecológico</span>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Tabs de informações adicionais */}
      <div className="tabs-detalhes-produto mt-5">
        <Tabs
          defaultActiveKey="description"
          className="mb-4"
        >
          <Tab eventKey="description" title="Descrição">
            <div className="tab-content-wrapper">
              <div className="descricao-detalhada">
                <h4 className="mb-3">Sobre o Produto</h4>
                <div className="descricao-texto">
                  {produto.categoria === 'cadernos' && (
                    <>
                      <p>O {produto.nome} da {produto.marca} é a escolha perfeita para quem busca qualidade e funcionalidade em um caderno. 
                      Desenvolvido com papel de alta gramatura, proporciona uma experiência de escrita suave e agradável.</p>
                      
                      <h5 className="mt-4 mb-3">Características Principais</h5>
                      <ul className="lista-caracteristicas">
                        <li><i className="bi bi-check-circle me-2"></i>Papel de alta qualidade, ideal para canetas e lápis</li>
                        <li><i className="bi bi-check-circle me-2"></i>Capa resistente e durável</li>
                        <li><i className="bi bi-check-circle me-2"></i>Espiral ou costura reforçada</li>
                        <li><i className="bi bi-check-circle me-2"></i>Design moderno e funcional</li>
                        <li><i className="bi bi-check-circle me-2"></i>Ideal para estudos, trabalho e anotações</li>
                      </ul>
                    </>
                  )}
                  
                  {produto.categoria === 'canetas' && (
                    <>
                      <p>A {produto.nome} da {produto.marca} oferece uma experiência de escrita excepcional. 
                      Com tecnologia avançada e design ergonômico, é perfeita para uso prolongado.</p>
                      
                      <h5 className="mt-4 mb-3">Características Principais</h5>
                      <ul className="lista-caracteristicas">
                        <li><i className="bi bi-check-circle me-2"></i>Tinta de alta qualidade e longa duração</li>
                        <li><i className="bi bi-check-circle me-2"></i>Ponta resistente e precisa</li>
                        <li><i className="bi bi-check-circle me-2"></i>Design ergonômico para conforto</li>
                        <li><i className="bi bi-check-circle me-2"></i>Escrita suave e uniforme</li>
                        <li><i className="bi bi-check-circle me-2"></i>Ideal para uso diário e profissional</li>
                      </ul>
                    </>
                  )}
                  
                  {produto.categoria === 'material-escolar' && (
                    <>
                      <p>O {produto.nome} da {produto.marca} é um item essencial para seu material escolar. 
                      Desenvolvido com materiais de qualidade superior para garantir durabilidade e eficiência.</p>
                      
                      <h5 className="mt-4 mb-3">Características Principais</h5>
                      <ul className="lista-caracteristicas">
                        <li><i className="bi bi-check-circle me-2"></i>Material resistente e durável</li>
                        <li><i className="bi bi-check-circle me-2"></i>Design funcional e prático</li>
                        <li><i className="bi bi-check-circle me-2"></i>Fácil de usar e transportar</li>
                        <li><i className="bi bi-check-circle me-2"></i>Cores vibrantes e atrativas</li>
                        <li><i className="bi bi-check-circle me-2"></i>Perfeito para estudantes de todas as idades</li>
                      </ul>
                    </>
                  )}
                  
                  {produto.categoria === 'organização' && (
                    <>
                      <p>Este {produto.nome} da {produto.marca} é a solução perfeita para manter seu espaço organizado. 
                      Combina funcionalidade e estilo para criar ambientes mais produtivos.</p>
                      
                      <h5 className="mt-4 mb-3">Características Principais</h5>
                      <ul className="lista-caracteristicas">
                        <li><i className="bi bi-check-circle me-2"></i>Design moderno e elegante</li>
                        <li><i className="bi bi-check-circle me-2"></i>Materiais de alta qualidade</li>
                        <li><i className="bi bi-check-circle me-2"></i>Múltiplas possibilidades de organização</li>
                        <li><i className="bi bi-check-circle me-2"></i>Fácil montagem e uso</li>
                        <li><i className="bi bi-check-circle me-2"></i>Ideal para escritório e casa</li>
                      </ul>
                    </>
                  )}
                  
                  {!['cadernos', 'canetas', 'material-escolar', 'organização'].includes(produto.categoria) && (
                    <>
                      <p>O {produto.nome} da {produto.marca} é um produto de papelaria de alta qualidade. 
                      Desenvolvido para atender suas necessidades com excelência e durabilidade.</p>
                      
                      <h5 className="mt-4 mb-3">Características Principais</h5>
                      <ul className="lista-caracteristicas">
                        <li><i className="bi bi-check-circle me-2"></i>Material de alta qualidade</li>
                        <li><i className="bi bi-check-circle me-2"></i>Design funcional e moderno</li>
                        <li><i className="bi bi-check-circle me-2"></i>Durabilidade garantida</li>
                        <li><i className="bi bi-check-circle me-2"></i>Fácil de usar</li>
                        <li><i className="bi bi-check-circle me-2"></i>Ideal para uso diário</li>
                      </ul>
                    </>
                  )}
                </div>
                
                <div className="cuidados-produto mt-4">
                  <h5 className="mb-3">Cuidados e Conservação</h5>
                  <div className="dica-cuidado">
                    <i className="bi bi-lightbulb me-2"></i>
                    <span>Mantenha em local seco e arejado para preservar a qualidade</span>
                  </div>
                  <div className="dica-cuidado">
                    <i className="bi bi-shield-check me-2"></i>
                    <span>Produto testado e aprovado pelos mais altos padrões de qualidade</span>
                  </div>
                </div>
              </div>
            </div>
          </Tab>
          <Tab eventKey="specifications" title="Especificações">
            <div className="tab-content-wrapper">
              <h4 className="mb-4">Especificações Técnicas</h4>
              <div className="tabela-especificacoes">
                <div className="linha-especificacoes">
                  <div className="rotulo-especificacoes">
                    <i className="bi bi-tag me-2"></i>Marca
                  </div>
                  <div className="valor-especificacoes">{produto.marca}</div>
                </div>
                <div className="linha-especificacoes">
                  <div className="rotulo-especificacoes">
                    <i className="bi bi-box me-2"></i>Produto
                  </div>
                  <div className="valor-especificacoes">{produto.nome}</div>
                </div>
                <div className="linha-especificacoes">
                  <div className="rotulo-especificacoes">
                    <i className="bi bi-collection me-2"></i>Categoria
                  </div>
                  <div className="valor-especificacoes">
                    {produto.categoria === 'cadernos' && 'Cadernos e Blocos'}
                    {produto.categoria === 'canetas' && 'Canetas e Instrumentos de Escrita'}
                    {produto.categoria === 'material-escolar' && 'Material Escolar'}
                    {produto.categoria === 'organização' && 'Organização e Arquivo'}
                    {!['cadernos', 'canetas', 'material-escolar', 'organização'].includes(produto.categoria) && produto.categoria}
                  </div>
                </div>
                <div className="linha-especificacoes">
                  <div className="rotulo-especificacoes">
                    <i className="bi bi-person me-2"></i>Público-Alvo
                  </div>
                  <div className="valor-especificacoes">
                    {produto.categoria === 'cadernos' && 'Estudantes, Profissionais, Uso Geral'}
                    {produto.categoria === 'canetas' && 'Estudantes, Escritório, Uso Diário'}
                    {produto.categoria === 'material-escolar' && 'Estudantes, Crianças, Jovens'}
                    {produto.categoria === 'organização' && 'Profissionais, Escritório, Casa'}
                    {!['cadernos', 'canetas', 'material-escolar', 'organização'].includes(produto.categoria) && 'Uso Geral'}
                  </div>
                </div>
                <div className="linha-especificacoes">
                  <div className="rotulo-especificacoes">
                    <i className="bi bi-award me-2"></i>Qualidade
                  </div>
                  <div className="valor-especificacoes">
                    {produto.condicao === 'new' ? 'Produto Novo - Primeira Linha' : 'Usado'}
                  </div>
                </div>
                <div className="linha-especificacoes">
                  <div className="rotulo-especificacoes">
                    <i className="bi bi-leaf me-2"></i>Sustentabilidade
                  </div>
                  <div className="valor-especificacoes">Produto Ecológico e Sustentável</div>
                </div>
                <div className="linha-especificacoes">
                  <div className="rotulo-especificacoes">
                    <i className="bi bi-upc me-2"></i>Código SKU
                  </div>
                  <div className="valor-especificacoes">VoePapel-{produto.id ? produto.id.toString().padStart(5, '0') : '00000'}</div>
                </div>
              </div>
              
              <div className="certificacoes mt-4">
                <h5 className="mb-3">Certificações e Qualidade</h5>
                <div className="badge-certificacao">
                  <i className="bi bi-patch-check me-2"></i>
                  ISO 9001 - Gestão da Qualidade
                </div>
                <div className="badge-certificacao">
                  <i className="bi bi-recycle me-2"></i>
                  Material Reciclável
                </div>
                <div className="badge-certificacao">
                  <i className="bi bi-shield-fill-check me-2"></i>
                  Testado e Aprovado
                </div>
              </div>
            </div>
          </Tab>
          <Tab eventKey="reviews" title={`Avaliações (${produto.numero_avaliacoes})`}>
            <div className="p-4 bg-light rounded">              <div className="d-flex align-items-center mb-4">                <div className="avaliacao-geral me-4">
                  <div className="numero-avaliacao">{Number(produto.avaliacao).toFixed(1)}</div>
                  <div className="estrelas-avaliacao">
                    {renderizarEstrelas(produto.avaliacao)}
                  </div>
                  <div className="contagem-avaliacao">({produto.numero_avaliacoes} avaliações)</div>
                </div>
                <div className="resumo-avaliacao flex-grow-1">
                  <div className="barra-avaliacao">
                    <span>5 estrelas</span>
                    <div className="progress">
                      <div className="progress-bar bg-success" style={{ width: "70%" }}></div>
                    </div>
                    <span>70%</span>
                  </div>
                  <div className="barra-avaliacao">
                    <span>4 estrelas</span>
                    <div className="progress">
                      <div className="progress-bar bg-success" style={{ width: "20%" }}></div>
                    </div>
                    <span>20%</span>
                  </div>
                  <div className="barra-avaliacao">
                    <span>3 estrelas</span>
                    <div className="progress">
                      <div className="progress-bar bg-warning" style={{ width: "5%" }}></div>
                    </div>
                    <span>5%</span>
                  </div>
                  <div className="barra-avaliacao">
                    <span>2 estrelas</span>
                    <div className="progress">
                      <div className="progress-bar bg-danger" style={{ width: "3%" }}></div>
                    </div>
                    <span>3%</span>
                  </div>
                  <div className="barra-avaliacao">
                    <span>1 estrela</span>
                    <div className="progress">
                      <div className="progress-bar bg-danger" style={{ width: "2%" }}></div>
                    </div>
                    <span>2%</span>
                  </div>
                </div>
              </div>
              
              <Button variant="outline-primary" className="btn-escrever-avaliacao">
                <i className="bi bi-pencil me-2"></i>
                Escrever avaliação
              </Button>
                <hr className="my-4" />
              
              {/* Integração do sistema de comentários */}
              <ComentariosProduto produtoId={id} />
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* Produtos relacionados (simulados) */}
      <div className="produtos-relacionados mt-5">
        <h3 className="titulo-secao mb-4">Produtos Relacionados</h3>
        <p className="text-center text-muted">
          Os produtos relacionados serão carregados em breve...
        </p>
      </div>
    </Container>
  );
};

export default PaginaDetalhesProduto;
