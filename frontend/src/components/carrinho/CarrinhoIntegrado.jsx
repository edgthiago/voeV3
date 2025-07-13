// Componente de Carrinho totalmente integrado com backend
import React, { useState, useEffect } from 'react';
import { useCarrinho } from '../../context/ContextoCarrinho';
import { useAuth } from '../../context/AuthContext';
import { useCarrinho as useCarrinhoHooks } from '../../hooks/useApiIntegration';
import LoadingSpinner from '../common/LoadingSpinner';
import { Link } from 'react-router-dom';

const CarrinhoIntegrado = () => {
  const { itensCarrinho, loading: carrinhoLoading } = useCarrinho();
  const { isAuthenticated } = useAuth();
  const { 
    atualizarQuantidade, 
    removerItem, 
    calcularTotais,
    loading: actionLoading,
    error 
  } = useCarrinhoHooks();
  
  const [totais, setTotais] = useState({
    subtotal: 0,
    desconto: 0,
    frete: 0,
    total: 0
  });
  const [loadingItem, setLoadingItem] = useState(null);

  // Calcular totais quando itens mudarem
  useEffect(() => {
    const calcular = async () => {
      try {
        const resultado = await calcularTotais();
        if (resultado.sucesso) {
          setTotais(resultado.dados);
        }
      } catch (error) {
        console.error('Erro ao calcular totais:', error);
      }
    };

    if (itensCarrinho.length > 0) {
      calcular();
    } else {
      setTotais({ subtotal: 0, desconto: 0, frete: 0, total: 0 });
    }
  }, [itensCarrinho, calcularTotais]);

  const handleAtualizarQuantidade = async (produtoId, novaQuantidade) => {
    if (novaQuantidade < 1) {
      return handleRemoverItem(produtoId);
    }

    setLoadingItem(produtoId);
    try {
      await atualizarQuantidade(produtoId, novaQuantidade);
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
    } finally {
      setLoadingItem(null);
    }
  };

  const handleRemoverItem = async (produtoId) => {
    setLoadingItem(produtoId);
    try {
      await removerItem(produtoId);
    } catch (error) {
      console.error('Erro ao remover item:', error);
    } finally {
      setLoadingItem(null);
    }
  };

  if (carrinhoLoading) {
    return <LoadingSpinner message="Carregando carrinho..." />;
  }

  if (itensCarrinho.length === 0) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 text-center">
            <div className="card border-0 shadow-sm">
              <div className="card-body py-5">
                <i className="bi bi-cart-x fs-1 text-muted mb-3"></i>
                <h3 className="text-muted mb-3">Seu carrinho está vazio</h3>
                <p className="text-muted mb-4">
                  Que tal dar uma olhada em nossos produtos incríveis?
                </p>
                <Link to="/produtos" className="btn btn-primary btn-lg">
                  <i className="bi bi-shop me-2"></i>
                  Continuar Comprando
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">
            <i className="bi bi-cart3 me-2"></i>
            Meu Carrinho ({itensCarrinho.length} {itensCarrinho.length === 1 ? 'item' : 'itens'})
          </h2>
        </div>
      </div>

      {/* Erro global */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
        </div>
      )}

      <div className="row">
        {/* Lista de itens */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {itensCarrinho.map((item, index) => (
                <div key={item.produto_id || index} className="border-bottom p-4">
                  <div className="row align-items-center">
                    {/* Imagem do produto */}
                    <div className="col-md-2 col-3">
                      <img
                        src={item.imagem || '/img/img/papelaria_produtos.png'}
                        alt={item.nome}
                        className="img-fluid rounded"
                        style={{ maxHeight: '80px', objectFit: 'cover' }}
                      />
                    </div>

                    {/* Informações do produto */}
                    <div className="col-md-4 col-9">
                      <h6 className="mb-1">{item.nome}</h6>
                      <p className="text-muted small mb-1">
                        Tamanho: {item.tamanho || 'N/A'}
                      </p>
                      <p className="text-muted small mb-0">
                        Cor: {item.cor || 'N/A'}
                      </p>
                    </div>

                    {/* Controles de quantidade */}
                    <div className="col-md-3 col-6">
                      <div className="input-group input-group-sm">
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          disabled={loadingItem === item.produto_id}
                          onClick={() => handleAtualizarQuantidade(item.produto_id, item.quantidade - 1)}
                        >
                          <i className="bi bi-dash"></i>
                        </button>
                        <input
                          type="number"
                          className="form-control text-center"
                          value={item.quantidade}
                          min="1"
                          max="10"
                          disabled={loadingItem === item.produto_id}
                          onChange={(e) => {
                            const valor = parseInt(e.target.value) || 1;
                            handleAtualizarQuantidade(item.produto_id, valor);
                          }}
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          disabled={loadingItem === item.produto_id || item.quantidade >= 10}
                          onClick={() => handleAtualizarQuantidade(item.produto_id, item.quantidade + 1)}
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                      </div>
                    </div>                    {/* Preço e ações */}
                    <div className="col-md-3 col-6 text-end">
                      <div className="d-flex align-items-center justify-content-end">                        <div className="me-3">
                          <div className="fw-bold">
                            R$ {Number((item.preco_atual || item.preco_unitario || item.preco || 0) * item.quantidade).toFixed(2)}
                          </div>
                          <small className="text-muted">
                            R$ {Number(item.preco_atual || item.preco_unitario || item.preco || 0).toFixed(2)} cada
                          </small>
                        </div>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          disabled={loadingItem === item.produto_id}
                          onClick={() => handleRemoverItem(item.produto_id)}
                          title="Remover item"
                        >
                          {loadingItem === item.produto_id ? (
                            <div className="spinner-border spinner-border-sm" role="status">
                              <span className="visually-hidden">Carregando...</span>
                            </div>
                          ) : (
                            <i className="bi bi-trash"></i>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Continuar comprando */}
          <div className="mt-3">
            <Link to="/produtos" className="btn btn-outline-primary">
              <i className="bi bi-arrow-left me-2"></i>
              Continuar Comprando
            </Link>
          </div>
        </div>

        {/* Resumo do pedido */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">Resumo do Pedido</h5>
            </div>
            <div className="card-body">              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>R$ {Number(totais.subtotal).toFixed(2)}</span>
              </div>
              
              {totais.desconto > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Desconto:</span>
                  <span>-R$ {Number(totais.desconto).toFixed(2)}</span>
                </div>
              )}
              
              <div className="d-flex justify-content-between mb-2">
                <span>Frete:</span>
                <span>
                  {totais.frete === 0 ? 'Grátis' : `R$ ${Number(totais.frete).toFixed(2)}`}
                </span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong className="text-primary fs-5">
                  R$ {Number(totais.total || 0).toFixed(2)}
                </strong>
              </div>

              {/* Botão de finalizar */}
              {isAuthenticated ? (
                <Link
                  to="/checkout"
                  className="btn btn-primary w-100 btn-lg"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Carregando...</span>
                      </div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-credit-card me-2"></i>
                      Finalizar Compra
                    </>
                  )}
                </Link>
              ) : (
                <div className="text-center">
                  <p className="small text-muted mb-3">
                    Faça login para finalizar sua compra
                  </p>
                  <Link to="/login" className="btn btn-primary w-100">
                    <i className="bi bi-person-circle me-2"></i>
                    Fazer Login
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Informações de segurança */}
          <div className="card border-0 shadow-sm mt-3">
            <div className="card-body text-center">
              <i className="bi bi-shield-check text-success fs-3 mb-2"></i>
              <h6 className="mb-2">Compra Segura</h6>
              <small className="text-muted">
                Seus dados estão protegidos com certificado SSL
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarrinhoIntegrado;
