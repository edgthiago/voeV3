import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; // ✅ useEffect e useLocation
import { useProdutos } from '../../hooks/useApiIntegration';
import { useUtils } from '../../hooks/useApiIntegration';
import { useCarrinho } from '../../context/ContextoCarrinho';

const ListaProdutos = () => {
  const location = useLocation(); // ✅ pega os parâmetros da URL

  const [filtros, setFiltros] = useState({
    categoria: '',
    marca: '',
    preco_min: '',
    preco_max: '',
    ordem: 'nome'
  });

  const [termoBusca, setTermoBusca] = useState('');

  const { produtos, loading, error, buscarProdutos } = useProdutos(filtros);
  const { adicionarAoCarrinho } = useCarrinho();
  const [carrinhoLoading, setCarrinhoLoading] = useState(false);
  const { formatarPreco } = useUtils();

  // ✅ Busca o termo passado na URL (?search=xxx) e faz a busca automaticamente
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const busca = params.get('search') || '';

    if (busca) {
      setTermoBusca(busca);
      buscarProdutos({ ...filtros, busca });
    }
  }, [location.search]);
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBusca = (e) => {
    e.preventDefault();
    buscarProdutos({ ...filtros, busca: termoBusca });
  };

  const limparFiltros = () => {
    setFiltros({
      categoria: '',
      marca: '',
      preco_min: '',
      preco_max: '',
      ordem: 'nome'
    });
    setTermoBusca('');
  };
  const handleAdicionarAoCarrinho = async (produto) => {
    try {
      setCarrinhoLoading(true);
      const sucesso = await adicionarAoCarrinho(produto);

      if (sucesso) {
        // Mostrar notificação de sucesso
        alert('Produto adicionado ao carrinho!');
      } else {
        alert('Erro ao adicionar produto');
      }
    } catch (error) {
      alert('Erro ao adicionar produto ao carrinho');
      console.error('Erro:', error);
    } finally {
      setCarrinhoLoading(false);
    }
  };

  const renderProdutoCard = (produto) => (
    <div key={produto.id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
      <div className="card h-100 shadow-sm produto-card">
        {/* Imagem do produto */}
        <div className="position-relative">
          <img
            src={produto.imagem_url || '/papelaria_produtos.png'}
            className="card-img-top"
            alt={produto.nome}
            style={{ height: '200px', objectFit: 'cover' }}
          />

          {/* Badge de promoção */}
          {produto.em_promocao && (
            <span className="badge bg-danger position-absolute top-0 start-0 m-2">
              OFERTA
            </span>
          )}

          {/* Badge de novo */}
          {produto.is_novo && (
            <span className="badge bg-success position-absolute top-0 end-0 m-2">
              NOVO
            </span>
          )}
        </div>

        <div className="card-body d-flex flex-column">
          {/* Nome do produto */}
          <h5 className="card-title text-truncate" title={produto.nome}>
            {produto.nome}
          </h5>

          {/* Marca */}
          <p className="card-text text-muted small mb-1">
            {produto.marca}
          </p>

          {/* Descrição */}
          <p className="card-text text-muted small flex-grow-1">
            {produto.descricao?.substring(0, 80)}
            {produto.descricao?.length > 80 && '...'}
          </p>

          {/* Preços */}
          <div className="mb-2">
            {produto.preco_promocional ? (
              <>
                <span className="text-decoration-line-through text-muted me-2">
                  {formatarPreco(produto.preco)}
                </span>
                <span className="fw-bold text-danger fs-5">
                  {formatarPreco(produto.preco_promocional)}
                </span>
              </>
            ) : (
              <span className="fw-bold text-primary fs-5">
                {formatarPreco(produto.preco)}
              </span>
            )}
          </div>

          {/* Avaliação */}
          {produto.avaliacao_media && (
            <div className="mb-2">
              <div className="d-flex align-items-center">
                {[...Array(5)].map((_, i) => (
                  <i
                    key={i}
                    className={`bi ${i < Math.floor(produto.avaliacao_media)
                        ? 'bi-star-fill text-warning'
                        : 'bi-star text-muted'
                      }`}
                  ></i>
                ))}
                <span className="ms-1 text-muted small">
                  ({produto.total_avaliacoes || 0})
                </span>
              </div>
            </div>
          )}

          {/* Status do estoque */}
          <div className="mb-3">
            {produto.quantidade_estoque > 0 ? (
              <span className="badge bg-success">Em estoque</span>
            ) : (
              <span className="badge bg-danger">Fora de estoque</span>
            )}
          </div>

          {/* Botões */}
          <div className="mt-auto">
            <div className="d-grid gap-2">
              <Link
                to={`/produto/${produto.id}`}
                className="btn btn-outline-primary btn-sm"
              >
                <i className="bi bi-eye me-1"></i>
                Ver Detalhes
              </Link>
              <button
                onClick={() => handleAdicionarAoCarrinho(produto)}
                disabled={produto.quantidade_estoque === 0 || carrinhoLoading}
                className="btn btn-primary btn-sm"
              >
                {carrinhoLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1"></span>
                    Adicionando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-cart-plus me-1"></i>
                    Adicionar ao Carrinho
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h2 className="mb-0">Nossos Produtos</h2>
          <p className="text-muted">Encontre os melhores produtos de papelaria para você</p>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="row mb-4">
        <div className="col">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleBusca}>
                <div className="row g-3">
                  {/* Busca */}
                  <div className="col-md-4">
                    <label className="form-label">Buscar</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nome do produto..."
                        value={termoBusca}
                        onChange={(e) => setTermoBusca(e.target.value)}
                      />
                      <button type="submit" className="btn btn-primary">
                        <i className="bi bi-search"></i>
                      </button>
                    </div>
                  </div>

                  {/* Categoria */}
                  <div className="col-md-2">
                    <label className="form-label">Categoria</label>
                    <select
                      name="categoria"
                      className="form-select"
                      value={filtros.categoria}
                      onChange={handleFiltroChange}
                    >
                      <option value="">Todas</option>
                      <option value="esportivo">Esportivo</option>
                      <option value="casual">Casual</option>
                      <option value="corrida">Corrida</option>
                      <option value="basquete">Basquete</option>
                    </select>
                  </div>

                  {/* Marca */}
                  <div className="col-md-2">
                    <label className="form-label">Marca</label>
                    <select
                      name="marca"
                      className="form-select"
                      value={filtros.marca}
                      onChange={handleFiltroChange}
                    >
                      <option value="">Todas</option>
                      <option value="Nike">Nike</option>
                      <option value="Adidas">Adidas</option>
                      <option value="Puma">Puma</option>
                      <option value="Mizuno">Mizuno</option>
                    </select>
                  </div>

                  {/* Preço Mínimo */}
                  <div className="col-md-2">
                    <label className="form-label">Preço Min.</label>
                    <input
                      type="number"
                      name="preco_min"
                      className="form-control"
                      placeholder="R$ 0"
                      value={filtros.preco_min}
                      onChange={handleFiltroChange}
                    />
                  </div>

                  {/* Preço Máximo */}
                  <div className="col-md-2">
                    <label className="form-label">Preço Max.</label>
                    <input
                      type="number"
                      name="preco_max"
                      className="form-control"
                      placeholder="R$ 1000"
                      value={filtros.preco_max}
                      onChange={handleFiltroChange}
                    />
                  </div>
                </div>

                <div className="row mt-3">
                  <div className="col-md-3">
                    <label className="form-label">Ordenar por</label>
                    <select
                      name="ordem"
                      className="form-select"
                      value={filtros.ordem}
                      onChange={handleFiltroChange}
                    >
                      <option value="nome">Nome A-Z</option>
                      <option value="preco_asc">Menor Preço</option>
                      <option value="preco_desc">Maior Preço</option>
                      <option value="mais_vendidos">Mais Vendidos</option>
                      <option value="lancamentos">Lançamentos</option>
                    </select>
                  </div>

                  <div className="col-md-3 d-flex align-items-end">
                    <button
                      type="button"
                      onClick={limparFiltros}
                      className="btn btn-outline-secondary"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="row mb-3">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <p className="mb-0 text-muted">
              {loading ? 'Carregando...' : `${produtos.length} produtos encontrados`}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Produtos */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando produtos...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          <h5 className="alert-heading">Erro ao carregar produtos</h5>
          <p className="mb-0">{error}</p>
          <hr />
          <button
            onClick={() => buscarProdutos()}
            className="btn btn-outline-danger btn-sm"
          >
            Tentar novamente
          </button>
        </div>
      ) : produtos.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-search display-1 text-muted"></i>
          <h4 className="mt-3">Nenhum produto encontrado</h4>
          <p className="text-muted">Tente ajustar os filtros de busca</p>
          <button onClick={limparFiltros} className="btn btn-primary">
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="row">
          {produtos.map(renderProdutoCard)}
        </div>
      )}
    </div>
  );
};

export default ListaProdutos;
