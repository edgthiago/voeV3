import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Pagination, Button, Spinner, Modal } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import FiltroProduto from '../../components/FiltroProduto/FiltroProduto';
import CardProduto from '../../components/CardProduto/CardProduto';
import ItemListaProduto from '../../components/ItemListaProduto/ItemListaProduto';
import CabecalhoListaProdutos from '../../components/CabecalhoListaProdutos/CabecalhoListaProdutos';
import OrdenacaoProdutos from '../../components/OrdenacaoProdutos/OrdenacaoProdutos';
import { produtosService } from '../../services';
import './PaginaProdutos.css';

const PaginaProdutos = () => {  const location = useLocation();
  const navigate = useNavigate();
  
  // Obter o termo de pesquisa da URL
  const parametrosURL = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const termoPesquisa = parametrosURL.get('search') || '';
  
  // Estados para gerenciar os produtos e a paginação
  const [produtos, setProdutos] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [produtosPorPagina, setProdutosPorPagina] = useState(15);
  const [filtros, setFiltros] = useState({ searchTerm: termoPesquisa });
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [ordenacaoAtual, setOrdenacaoAtual] = useState('featured');
  const [modoVisualizacao, setModoVisualizacao] = useState('grid'); // 'grid' ou 'list'
  const [carregando, setCarregando] = useState(false); // Estado para indicador de carregamento
  const [produtosSelecionados, setProdutosSelecionados] = useState([]); // Estado para produtos selecionados para comparação
  const [mostrarModalComparacao, setMostrarModalComparacao] = useState(false); // Estado para controlar a exibição do modal de comparação
  // Efeito para atualizar os filtros quando o termo de pesquisa mudar
  useEffect(() => {
    setFiltros(filtrosAnteriores => ({
      ...filtrosAnteriores,
      searchTerm: termoPesquisa
    }));
  }, [termoPesquisa]);
    // Efeito para filtrar produtos quando os filtros mudam
  useEffect(() => {
    let estaMontado = true;
    setCarregando(true);
    
    // Função para buscar produtos da API
    const buscarProdutos = async () => {
      try {        // Preparar parâmetros de filtro para a API
        const parametrosAPI = {
          termo_pesquisa: filtros.searchTerm || '',
          marcas: filtros.brands ? filtros.brands.join(',') : '',
          categorias: filtros.categories ? filtros.categories.join(',') : '',
          tipos_material: filtros.tipoMaterial ? filtros.tipoMaterial.join(',') : '',
          condicao: filtros.condition || '',
          apenas_em_estoque: true,
          limite: produtosPorPagina,
          offset: (paginaAtual - 1) * produtosPorPagina
        };

        // Adicionar parâmetros opcionais apenas se eles têm valores válidos
        if (filtros.price && filtros.price.min !== undefined && filtros.price.min > 0) {
          parametrosAPI.preco_min = filtros.price.min;
        }
        if (filtros.price && filtros.price.max !== undefined && filtros.price.max < 1000) {
          parametrosAPI.preco_max = filtros.price.max;
        }
        if (filtros.minRating && filtros.minRating > 0) {
          parametrosAPI.avaliacao_minima = filtros.minRating;
        }
        if (ordenacaoAtual && ordenacaoAtual !== 'featured') {
          parametrosAPI.ordenar_por = ordenacaoAtual;        }

        const resposta = await produtosService.buscarTodos(parametrosAPI);
        
        if (estaMontado && resposta.sucesso) {
          setProdutos(resposta.dados || []);
          setTotalProdutos(resposta.total || 0);        }
      } catch (erro) {
        console.error('Erro ao buscar produtos:', erro);
        if (estaMontado) {
          // Exibir erro sem dados de fallback
          setProdutos([]);
          setTotalProdutos(0);
        }
      } finally {
        if (estaMontado) {
          setCarregando(false);
        }
      }
    };

    // Pequeno delay para evitar muitas requisições
    const temporizador = setTimeout(() => {
      if (estaMontado) {
        buscarProdutos();
      }
    }, 300);
    
    // Função de limpeza
    return () => {
      estaMontado = false;
      clearTimeout(temporizador);
    };
  }, [filtros, ordenacaoAtual, paginaAtual, produtosPorPagina]);

  // Carregar filtros da URL quando a página é carregada
  useEffect(() => {
    // Obter parâmetros da URL
    const ordenacaoURL = parametrosURL.get('sort');
    const visualizacaoURL = parametrosURL.get('view');
    const marcasURL = parametrosURL.get('brands');
    const categoriasURL = parametrosURL.get('categories');
    const precoMinimoURL = parametrosURL.get('min_price');
    const precoMaximoURL = parametrosURL.get('max_price');
    const avaliacaoURL = parametrosURL.get('rating');
      // Configurar visualização
    if (visualizacaoURL && (visualizacaoURL === 'grid' || visualizacaoURL === 'list')) {
      setModoVisualizacao(visualizacaoURL);
      localStorage.setItem('modoVisualizacao', visualizacaoURL);
    }
    
    // Configurar ordenação
    if (ordenacaoURL) {
      setOrdenacaoAtual(ordenacaoURL);
    }
    
    // Preparar objeto de filtros
    const filtrosURL = { searchTerm: termoPesquisa };
    
    // Adicionar marcas
    if (marcasURL) {
      filtrosURL.brands = marcasURL.split(',');
    }
    
    // Adicionar categorias
    if (categoriasURL) {
      filtrosURL.categories = categoriasURL.split(',');
    }
    
    // Adicionar preço
    if (precoMinimoURL || precoMaximoURL) {
      filtrosURL.price = {
        min: precoMinimoURL ? parseInt(precoMinimoURL) : 0,
        max: precoMaximoURL ? parseInt(precoMaximoURL) : 1000
      };
    }
    
    // Adicionar classificação mínima
    if (avaliacaoURL) {
      filtrosURL.minRating = parseFloat(avaliacaoURL);
    }
      // Aplicar filtros apenas se houver parâmetros adicionais além do termo de pesquisa
    if (Object.keys(filtrosURL).length > 1 || 
        (Object.keys(filtrosURL).length === 1 && !filtrosURL.searchTerm)) {
      setFiltros(filtrosURL);
    }
  }, [termoPesquisa, location.search, parametrosURL]);

  // Função para adicionar/remover produto da lista de comparação
  const alternarComparacaoProduto = (produto) => {
    setProdutosSelecionados(produtosAnteriores => {
      if (produtosAnteriores.some(p => p.id === produto.id)) {
        // Se o produto já está na lista, removê-lo
        return produtosAnteriores.filter(p => p.id !== produto.id);
      } else {
        // Se não está na lista e há menos de 4 produtos, adicioná-lo
        if (produtosAnteriores.length < 4) {
          return [...produtosAnteriores, produto];
        } else {
          alert('Você só pode comparar até 4 produtos simultaneamente.');
          return produtosAnteriores;
        }
      }
    });
  };

  // Função para limpar a lista de produtos selecionados
  const limparProdutosSelecionados = () => {
    setProdutosSelecionados([]);
  };
  // Carregar preferências do usuário para o modo de visualização
  useEffect(() => {
    const modoVisualizacaoSalvo = localStorage.getItem('modoVisualizacao');
    if (modoVisualizacaoSalvo) {
      setModoVisualizacao(modoVisualizacaoSalvo);
    }
  }, []);
  // Salvar preferências do usuário para o modo de visualização
  const aoMudarModoVisualizacao = (modo) => {
    setModoVisualizacao(modo);
    localStorage.setItem('modoVisualizacao', modo);
    
    // Atualizar URL para refletir o modo de visualização
    const parametros = new URLSearchParams(location.search);
    if (modo === 'grid') {
      parametros.delete('view');
    } else {
      parametros.set('view', modo);
    }
    navigate({
      pathname: location.pathname,
      search: parametros.toString()
    }, { replace: true });
  };

  // Calcular índices para a página atual
  const indiceProdutoFinal = paginaAtual * produtosPorPagina;
  const indiceProdutoInicial = indiceProdutoFinal - produtosPorPagina;
  const produtosAtuais = produtos.slice(indiceProdutoInicial, indiceProdutoFinal);

  // Número total de páginas
  const totalPaginas = Math.ceil(produtos.length / produtosPorPagina);

  // Função para mudar a página
  const aoMudarPagina = (numeroPagina) => {
    setPaginaAtual(numeroPagina);
    window.scrollTo(0, 0); // Scroll para o topo ao mudar de página
  };

  // Função para mudar o número de produtos por página
  const aoMudarProdutosPorPagina = (numero) => {
    setProdutosPorPagina(numero);
    setPaginaAtual(1); // Resetar para a primeira página
  };

  // Função para aplicar filtros
  const aoMudarFiltro = (novosFiltros) => {
    // Preservar o termo de pesquisa ao aplicar outros filtros
    const filtrosAtualizados = { ...novosFiltros, searchTerm: termoPesquisa };
    setFiltros(filtrosAtualizados);
    
    // Atualizar a URL com os filtros aplicados
    atualizarURLComFiltros(filtrosAtualizados);
  };

  // Função para ordenar produtos
  const aoMudarOrdenacao = (opcaoOrdenacao) => {
    setOrdenacaoAtual(opcaoOrdenacao);
    
    // Atualizar a URL com a nova ordenação
    const filtrosAtualizados = { ...filtros, sort: opcaoOrdenacao };
    atualizarURLComFiltros(filtrosAtualizados);
  };

  // Função para atualizar a URL com os filtros aplicados
  const atualizarURLComFiltros = (filtrosAplicados) => {
    const parametros = new URLSearchParams();
    
    // Adicionar termo de pesquisa se existir
    if (filtrosAplicados.searchTerm) {
      parametros.set('search', filtrosAplicados.searchTerm);
    }
    
    // Adicionar ordenação se não for a padrão
    if (ordenacaoAtual !== 'featured') {
      parametros.set('sort', ordenacaoAtual);
    }
    
    // Adicionar visualização se não for a padrão
    if (modoVisualizacao !== 'grid') {
      parametros.set('view', modoVisualizacao);
    }
    
    // Adicionar marcas selecionadas
    if (filtrosAplicados.brands && filtrosAplicados.brands.length > 0) {
      parametros.set('brands', filtrosAplicados.brands.join(','));
    }
    
    // Adicionar categorias selecionadas
    if (filtrosAplicados.categories && filtrosAplicados.categories.length > 0) {
      parametros.set('categories', filtrosAplicados.categories.join(','));
    }
    
    // Adicionar filtro de preço
    if (filtrosAplicados.price) {
      if (filtrosAplicados.price.min > 0) {
        parametros.set('min_price', filtrosAplicados.price.min.toString());
      }
      if (filtrosAplicados.price.max < 1000) {
        parametros.set('max_price', filtrosAplicados.price.max.toString());
      }
    }
    
    // Adicionar filtro de classificação mínima
    if (filtrosAplicados.minRating > 0) {
      parametros.set('rating', filtrosAplicados.minRating.toString());
    }
    
    // Atualizar a URL sem recarregar a página
    navigate({
      pathname: location.pathname,
      search: parametros.toString()
    }, { replace: true });
  };

  // Renderizar itens de paginação
  const renderizarItensPaginacao = () => {
    const itens = [];
    const maximoPaginasVisiveis = 5;
    
    // Sempre mostrar a primeira página
    itens.push(
      <Pagination.Item
        key={1}
        active={paginaAtual === 1}
        onClick={() => aoMudarPagina(1)}
      >
        1
      </Pagination.Item>
    );
    
    // Adicionar ellipsis se necessário
    if (paginaAtual > 3) {
      itens.push(<Pagination.Ellipsis key="ellipsis-1" disabled />);
    }
    
    // Adicionar páginas próximas à página atual
    for (let i = Math.max(2, paginaAtual - 1); i <= Math.min(totalPaginas - 1, paginaAtual + 1); i++) {
      if (i <= maximoPaginasVisiveis) {
        itens.push(
          <Pagination.Item
            key={i}
            active={paginaAtual === i}
            onClick={() => aoMudarPagina(i)}
          >
            {i}
          </Pagination.Item>
        );
      }
    }
    
    // Adicionar ellipsis se necessário
    if (paginaAtual < totalPaginas - 2 && totalPaginas > maximoPaginasVisiveis) {
      itens.push(<Pagination.Ellipsis key="ellipsis-2" disabled />);
    }
    
    // Sempre mostrar a última página, se houver mais de uma página
    if (totalPaginas > 1) {
      itens.push(
        <Pagination.Item
          key={totalPaginas}
          active={paginaAtual === totalPaginas}
          onClick={() => aoMudarPagina(totalPaginas)}
        >
          {totalPaginas}
        </Pagination.Item>
      );
    }
    
    return itens;
  };

  // Renderizar produtos com base no modo de visualização
  const renderizarProdutos = () => {
    if (carregando) {
      return (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Carregando...</span>
          </Spinner>
        </div>
      );
    }    if (produtos.length === 0) {
      return (
        <div className="sem-produtos-encontrados text-center py-5 bg-light rounded">
          <i className="bi bi-search display-1 text-muted mb-3 icone-sem-resultados"></i>
          <h3>Nenhum produto encontrado</h3>
          <p className="text-muted">Tente ajustar seus filtros ou pesquisar por outro termo.</p>
        </div>
      );
    }

    if (modoVisualizacao === 'grid') {
      return (
        <Row xs={1} sm={2} md={2} lg={3} xl={3} className="g-4">
          {produtosAtuais.map(produto => (
            <CardProduto 
              key={produto.id} 
              produto={produto} 
              estaSelecionado={produtosSelecionados.some(p => p.id === produto.id)}
              aoAlternarComparacao={() => alternarComparacaoProduto(produto)}
            />
          ))}
        </Row>
      );      } else {
      return (
        <div className="container-visualizacao-lista">
          {produtosAtuais.map(produto => (
            <ItemListaProduto 
              key={produto.id} 
              produto={produto} 
              estaSelecionado={produtosSelecionados.some(p => p.id === produto.id)}
              aoAlternarComparacao={() => alternarComparacaoProduto(produto)}
            />
          ))}
        </div>
      );
    }
  };

  // Modal de comparação de produtos
  const modalComparacao = (
    <Modal 
      show={mostrarModalComparacao} 
      onHide={() => setMostrarModalComparacao(false)}
      size="xl"
      centered
    >      <Modal.Header closeButton>
        <Modal.Title>Comparação de Produtos</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {produtosSelecionados.length > 0 ? (
          <div className="table-responsive">            <table className="tabela-comparacao table table-bordered table-striped">
              <thead>                <tr>
                  <th>Características</th>
                  {produtosSelecionados.map(produto => (
                    <th key={produto.id} className="text-center">
                      {produto.nome}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>                <tr>
                  <td>Imagem</td>
                  {produtosSelecionados.map(produto => (
                    <td key={`img-${produto.id}`} className="text-center">
                      <img 
                        src={produto.imagem} 
                        alt={produto.nome} 
                        className="img-fluid"
                        style={{ maxHeight: '100px' }}
                      />
                    </td>
                  ))}
                </tr>                <tr>
                  <td>Marca</td>
                  {produtosSelecionados.map(produto => (
                    <td key={`brand-${produto.id}`} className="text-center">
                      {produto.marca}
                    </td>
                  ))}
                </tr><tr>
                  <td>Preço</td>
                  {produtosSelecionados.map(produto => (
                    <td key={`price-${produto.id}`} className="text-center font-weight-bold">
                      R$ {Number(produto.preco_atual).toFixed(2)}
                    </td>
                  ))}
                </tr>                <tr>
                  <td>Desconto</td>
                  {produtosSelecionados.map(produto => (
                    <td key={`discount-${produto.id}`} className="text-center">
                      {produto.desconto ? `${produto.desconto}%` : 'Sem desconto'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Avaliação</td>
                  {produtosSelecionados.map(produto => (
                    <td key={`rating-${produto.id}`} className="text-center">
                      {produto.avaliacao} / 5 ({produto.numero_avaliacoes} avaliações)
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Categoria</td>
                  {produtosSelecionados.map(produto => (
                    <td key={`category-${produto.id}`} className="text-center">
                      {produto.categoria}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Gênero</td>
                  {produtosSelecionados.map(produto => (
                    <td key={`gender-${produto.id}`} className="text-center">
                      {produto.genero}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4">
            <p>Nenhum produto selecionado para comparação.</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModalComparacao(false)}>
          Fechar
        </Button>
        <Button variant="danger" onClick={limparProdutosSelecionados}>
          Limpar Seleção
        </Button>
      </Modal.Footer>
    </Modal>
  );
  return (
    <Container fluid className="py-4 pagina-produtos">
      {/* Título da página */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2" style={{color: 'var(--primary-color)'}}>📚 Nossos Produtos de Papelaria</h1>
        {termoPesquisa && (
          <div className="search-results-info">
            <p className="mb-0">
              Resultados para: <strong>{termoPesquisa}</strong>
            </p>
          </div>        )}
      </div>

      {/* Botão de comparação fixo (aparece quando há produtos selecionados) */}
      {produtosSelecionados.length > 0 && (
        <div className="botao-comparacao-produtos">
          <Button 
            variant="primary" 
            className="position-fixed bottom-0 end-0 mb-4 me-4 shadow"
            onClick={() => setMostrarModalComparacao(true)}
          >
            <i className="bi bi-bar-chart-fill me-2"></i>
            Comparar {produtosSelecionados.length} {produtosSelecionados.length > 1 ? 'produtos' : 'produto'}
          </Button>
        </div>
      )}

      <Row>
        {/* Componente de filtro lateral */}
        <Col md={3} className="d-none d-md-block">
          <FiltroProduto onFilterChange={aoMudarFiltro} />
        </Col>

        {/* Seção de produtos */}
        <section className="col-md-9" aria-labelledby="produtosTitulo">
          <h2 id="produtosTitulo" className="visually-hidden">Catálogo de produtos</h2>
          {/* Componente de cabeçalho da lista de produtos */}          <CabecalhoListaProdutos 
            totalProdutos={totalProdutos}
            paginaAtual={paginaAtual}
            produtosPorPagina={produtosPorPagina}
            aoMudarProdutosPorPagina={aoMudarProdutosPorPagina}
            modoVisualizacao={modoVisualizacao}
            aoMudarModoVisualizacao={aoMudarModoVisualizacao}
            ordenacaoAtual={ordenacaoAtual}
            aoMudarOrdenacao={aoMudarOrdenacao}
          />

          {/* Opções de ordenação para dispositivos móveis */}
          <div className="d-block d-md-none mb-3">            <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded">
              <span className="text-muted small">Ordenar produtos:</span>
              <OrdenacaoProdutos
                ordenacaoAtual={ordenacaoAtual}
                aoMudarOrdenacao={aoMudarOrdenacao}
                className="ordenacao-mobile"
              />
            </div>
          </div>

          {/* Galeria de produtos */}
          <Container fluid className="px-0">
            {renderizarProdutos()}

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="d-flex justify-content-center mt-4 mb-5">
                <Pagination>
                  <Pagination.Prev 
                    onClick={() => aoMudarPagina(paginaAtual - 1)}
                    disabled={paginaAtual === 1}
                  />
                  {renderizarItensPaginacao()}
                  <Pagination.Next 
                    onClick={() => aoMudarPagina(paginaAtual + 1)}
                    disabled={paginaAtual === totalPaginas}
                  />
                </Pagination>
              </div>
            )}
          </Container>
        </section>
      </Row>

      {/* Modal de comparação */}
      {modalComparacao}
    </Container>
  );
};

export default PaginaProdutos;
