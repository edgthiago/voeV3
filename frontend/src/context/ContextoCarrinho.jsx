import React, { createContext, useState, useContext, useEffect } from 'react';
import { carrinhoService, authService } from '../services';

// Criando o contexto do carrinho
export const ContextoCarrinho = createContext();

// Hook personalizado para usar o contexto do carrinho
export const useCarrinho = () => useContext(ContextoCarrinho);

// Provedor do contexto do carrinho
export const ProvedorCarrinho = ({ children }) => {
  // Estado para armazenar os itens do carrinho
  const [itensCarrinho, setItensCarrinho] = useState([]);
  // Carregar itens do localStorage quando o componente é montado
  useEffect(() => {
    let estaMontado = true;

    const carregarCarrinho = async () => {
      try {
        // Verificar se o usuário está autenticado
        if (authService.isAuthenticated()) {
          // Se autenticado, carregar do backend
          const resposta = await carrinhoService.obter();
          if (resposta.sucesso && estaMontado) {
            setItensCarrinho(resposta.dados?.itens || []);
            return;
          }
        }
        
        // Se não autenticado ou falha na API, carregar do localStorage
        const carrinhoArmazenado = localStorage.getItem('carrinho');
        if (carrinhoArmazenado && estaMontado) {
          setItensCarrinho(JSON.parse(carrinhoArmazenado));
        }
      } catch (erro) {
        console.error('Erro ao carregar o carrinho:', erro);
        if (estaMontado) {
          // Fallback para localStorage
          try {
            const carrinhoArmazenado = localStorage.getItem('carrinho');          if (carrinhoArmazenado) {
              setItensCarrinho(JSON.parse(carrinhoArmazenado));
            }
          } catch {
            setItensCarrinho([]);
          }
        }
      }
    };

    carregarCarrinho();

    return () => {
      estaMontado = false;
    };
  }, []);

  // Salvar itens no localStorage sempre que o carrinho for atualizado
  useEffect(() => {
    // Usar uma referência para verificar se o componente ainda está montado
    let estaMontado = true;

    // Função para salvar no localStorage de forma segura
    const salvarNoLocalStorage = async () => {
      try {
        if (estaMontado) {
          localStorage.setItem('carrinho', JSON.stringify(itensCarrinho));
        }
      } catch (erro) {
        console.error('Erro ao salvar o carrinho:', erro);
      }
    };

    salvarNoLocalStorage();

    // Limpar na desmontagem do componente
    return () => {
      estaMontado = false;
    };
  }, [itensCarrinho]);  // Adicionar um item ao carrinho
  const adicionarAoCarrinho = async (produto, quantidade = 1) => {
    if (!produto) return false;

    try {
      // Se o usuário estiver autenticado, sincronizar com o backend
      if (authService.isAuthenticated()) {
        const resposta = await carrinhoService.adicionarItem({
          produto_id: produto.id,
          quantidade: quantidade
        });
        
        if (resposta.sucesso) {
          // Atualizar estado local com dados do backend
          const carrinhoAtualizado = await carrinhoService.obter();
          if (carrinhoAtualizado.sucesso) {
            setItensCarrinho(carrinhoAtualizado.dados?.itens || []);
            return true;
          }
        }
      }
        // Fallback para operação local
      setItensCarrinho(itensPrevios => {
        const indiceItemExistente = itensPrevios.findIndex(item => item.id === produto.id);
        if (indiceItemExistente >= 0) {
          const novosItens = [...itensPrevios];
          novosItens[indiceItemExistente] = {
            ...novosItens[indiceItemExistente],
            quantidade: novosItens[indiceItemExistente].quantidade + quantidade
          };
          return novosItens;
        } else {
          // Normalizar estrutura do produto para garantir compatibilidade
          const produtoNormalizado = {
            ...produto,
            quantidade: quantidade,
            // Garantir que currentPrice esteja disponível
            currentPrice: produto.currentPrice || produto.preco_atual || produto.preco_unitario || 0,
            // Garantir que o nome esteja disponível
            name: produto.name || produto.nome || "Produto sem nome",
            // Garantir que a imagem esteja disponível
            image: produto.image || produto.imagem || produto.imagem_url || "/tenis_produtos.png"
          };
          return [...itensPrevios, produtoNormalizado];
        }
      });

      return true;
    } catch (erro) {
      console.error('Erro ao adicionar ao carrinho:', erro);
      return false;
    }
  };
  // Remover um item do carrinho
  const removerDoCarrinho = async (idProduto) => {
    try {
      if (authService.isAuthenticated()) {
        const resposta = await carrinhoService.removerItem(idProduto);
        if (resposta.sucesso) {
          const carrinhoAtualizado = await carrinhoService.obter();
          if (carrinhoAtualizado.sucesso) {
            setItensCarrinho(carrinhoAtualizado.dados?.itens || []);
            return true;
          }
        }
      }
      
      // Fallback para operação local
      setItensCarrinho(itensPrevios => itensPrevios.filter(item => item.id !== idProduto));
      return true;
    } catch (erro) {
      console.error('Erro ao remover do carrinho:', erro);
      return false;
    }
  };
  // Atualizar a quantidade de um item no carrinho
  const atualizarQuantidade = async (idProduto, quantidade) => {
    try {
      if (quantidade <= 0) {
        return await removerDoCarrinho(idProduto);
      }
      
      if (authService.isAuthenticated()) {
        const resposta = await carrinhoService.atualizarItem(idProduto, { quantidade });
        if (resposta.sucesso) {
          const carrinhoAtualizado = await carrinhoService.obter();
          if (carrinhoAtualizado.sucesso) {
            setItensCarrinho(carrinhoAtualizado.dados?.itens || []);
            return true;
          }
        }
      }
      
      // Fallback para operação local
      setItensCarrinho(itensPrevios =>
        itensPrevios.map(item =>
          item.id === idProduto ? { ...item, quantidade: quantidade } : item
        )
      );
      return true;
    } catch (erro) {
      console.error('Erro ao atualizar quantidade:', erro);
      return false;
    }
  };
  // Limpar o carrinho
  const limparCarrinho = async () => {
    try {
      if (authService.isAuthenticated()) {
        const resposta = await carrinhoService.limpar();
        if (resposta.sucesso) {
          setItensCarrinho([]);
          return true;
        }
      }
      
      // Fallback para operação local
      setItensCarrinho([]);
      return true;
    } catch (erro) {
      console.error('Erro ao limpar o carrinho:', erro);
      return false;
    }
  };  // Calcular o total de itens no carrinho
  const obterQuantidadeItensCarrinho = () => {
    return itensCarrinho.reduce((total, item) => {
      const quantidade = item.quantidade === undefined ? 0 : Number(item.quantidade);
      return total + (isNaN(quantidade) ? 0 : quantidade);
    }, 0);
  };  // Calcular o valor total do carrinho
  const obterTotalCarrinho = () => {
    return itensCarrinho.reduce((total, item) => {
      const preco = Number(item.currentPrice || item.preco_atual || item.preco_unitario || 0);
      const quantidade = item.quantidade === undefined ? 0 : Number(item.quantidade);
      
      // Verificar se os valores são válidos
      if (isNaN(preco) || isNaN(quantidade)) {
        console.warn('Produto com valores inválidos no carrinho:', item);
        return total;
      }
      
      return total + (preco * quantidade);
    }, 0);
  };

  // Obter todos os itens do carrinho
  const obterCarrinho = () => {
    return itensCarrinho;
  };
  // Valores e funções que serão expostos pelo contexto
  const valor = {
    carrinho: itensCarrinho,
    adicionarAoCarrinho,
    removerDoCarrinho,
    atualizarQuantidade,
    limparCarrinho,
    obterQuantidadeItensCarrinho,
    obterTotalCarrinho,
    obterCarrinho
  };
  return (
    <ContextoCarrinho.Provider value={valor}>
      {children}
    </ContextoCarrinho.Provider>
  );
};
