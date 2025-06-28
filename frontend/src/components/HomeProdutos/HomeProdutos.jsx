import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { produtosService } from '../../services';
import CardProduto from '../CardProduto/CardProduto';
import './HomeProdutos.modules.css';

const ProdutosEmDestaque = () => {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const buscarProdutosEmDestaque = async () => {
      try {
        setCarregando(true);
        // Buscar produtos mais bem avaliados ou em destaque
        const resposta = await produtosService.buscarTodos({
          // Usando o nome correto do parâmetro conforme esperado pelo backend
          ordenar_por: 'avaliacao_desc',
          limite: 8
        });

        if (resposta.sucesso) {
          setProdutos(resposta.dados || []);
        } else {
          setErro('Erro ao carregar produtos');
        }
      } catch (error) {
        console.error('Erro ao buscar produtos em destaque:', error);
        setErro('Erro ao carregar produtos');
      } finally {
        setCarregando(false);
      }
    };

    buscarProdutosEmDestaque();
  }, []);

  if (carregando) {
    return (
      <section className="container mb-5">
        <div className="d-flex justify-content-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </section>
    );
  }

  if (erro) {
    return (
      <section className="container mb-5">
        <div className="alert alert-warning" role="alert">
          {erro}
        </div>
      </section>
    );
  }

  if (produtos.length === 0) {
    return (
      <section className="container mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0 text-primary">🌟 Produtos em destaque</h4>
          <Link to="/produtos" className="link-rosa fw-semibold text-decoration-none">
            Ver todos os produtos →
          </Link>
        </div>
        <div className="alert alert-info destaque-rosa">
          <div className="text-center">
            <h5 className="mb-2">📦 Novos produtos chegando em breve!</h5>
            <p className="mb-0">Estamos preparando novidades incríveis para você. Volte em breve!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0 text-primary">🌟 Produtos em destaque</h4>
        <Link to="/produtos" className="link-rosa fw-semibold text-decoration-none">
          Ver todos os produtos →
        </Link>
      </div>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        {produtos.map((produto) => (
          <CardProduto 
            key={produto.id} 
            produto={produto}
          />
        ))}
      </div>
    </section>
  );
};

export default ProdutosEmDestaque;
