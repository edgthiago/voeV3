import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { produtosService, authService, carrinhoService } from '../../services';

const TesteAPI = () => {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);
  const [statusAPI, setStatusAPI] = useState(null);

  // Testar conectividade da API
  const testarConectividade = async () => {
    try {
      setCarregando(true);
      setErro(null);
      
      const resposta = await fetch('http://localhost:8080/api/health');
      const dados = await resposta.json();
      
      setStatusAPI(dados);
      setSucesso('API conectada com sucesso!');
    } catch (error) {
      setErro('Erro ao conectar com a API: ' + error.message);
    } finally {
      setCarregando(false);
    }
  };

  // Testar busca de produtos
  const testarProdutos = async () => {
    try {
      setCarregando(true);
      setErro(null);
      
      const resposta = await produtosService.buscarTodos();
      
      if (resposta.sucesso) {
        setProdutos(resposta.dados || []);
        setSucesso(`${resposta.dados?.length || 0} produtos carregados!`);
      } else {
        setErro('Erro ao buscar produtos: ' + resposta.mensagem);
      }
    } catch (error) {
      setErro('Erro ao buscar produtos: ' + error.message);
    } finally {
      setCarregando(false);
    }
  };
  // Testar produto específico
  const testarProdutoEspecifico = async (id = 1) => {
    try {
      setCarregando(true);
      setErro(null);
      
      // Teste direto com fetch      // Testar produto específico
      const resposta = await fetch(`http://localhost:8080/api/produtos/${id}`);
      
      if (!resposta.ok) {
        const textoErro = await resposta.text();
        throw new Error(`HTTP ${resposta.status}: ${textoErro}`);
      }
      
      const dados = await resposta.json();
      
      if (dados.sucesso) {
        setSucesso(`Produto ${id} carregado: ${dados.dados?.nome || 'sem nome'}`);
      } else {
        setErro('Erro ao buscar produto: ' + dados.mensagem);
      }
    } catch (error) {
      console.error('Erro detalhado:', error);
      setErro('Erro ao buscar produto: ' + error.message);
    } finally {
      setCarregando(false);
    }
  };

  // Testar carrinho (se usuário autenticado)
  const testarCarrinho = async () => {
    try {
      setCarregando(true);
      setErro(null);
      
      if (!authService.isAuthenticated()) {
        setErro('Usuário não está autenticado para testar carrinho');
        return;
      }
      
      const resposta = await carrinhoService.obter();
      
      if (resposta.sucesso) {
        setSucesso(`Carrinho carregado: ${resposta.dados?.itens?.length || 0} itens`);
      } else {
        setErro('Erro ao buscar carrinho: ' + resposta.mensagem);
      }
    } catch (error) {
      setErro('Erro ao buscar carrinho: ' + error.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    testarConectividade();
  }, []);

  return (
    <Container className="py-4">
      <h2>Teste de Integração da API</h2>
      
      {carregando && (
        <div className="text-center py-3">
          <Spinner animation="border" variant="primary" />
          <p>Testando...</p>
        </div>
      )}
      
      {erro && (
        <Alert variant="danger" className="mt-3">
          {erro}
        </Alert>
      )}
      
      {sucesso && (
        <Alert variant="success" className="mt-3">
          {sucesso}
        </Alert>
      )}
      
      {statusAPI && (
        <Card className="mt-3">
          <Card.Header>Status da API</Card.Header>
          <Card.Body>
            <pre>{JSON.stringify(statusAPI, null, 2)}</pre>
          </Card.Body>
        </Card>
      )}
      
      <div className="mt-4">
        <h4>Testes Disponíveis</h4>
        <div className="d-flex gap-2 flex-wrap">
          <Button onClick={testarConectividade} disabled={carregando}>
            Testar Conectividade
          </Button>
          <Button onClick={testarProdutos} disabled={carregando}>
            Testar Produtos
          </Button>
          <Button onClick={() => testarProdutoEspecifico(1)} disabled={carregando}>
            Testar Produto #1
          </Button>
          <Button onClick={testarCarrinho} disabled={carregando}>
            Testar Carrinho
          </Button>
        </div>
      </div>
      
      {produtos.length > 0 && (
        <Card className="mt-4">
          <Card.Header>Produtos Carregados ({produtos.length})</Card.Header>
          <Card.Body>
            <div className="row">
              {produtos.slice(0, 6).map((produto, index) => (
                <div key={index} className="col-md-4 mb-3">
                  <Card>
                    <Card.Body>
                      <Card.Title>{produto.nome || 'Sem nome'}</Card.Title>
                      <Card.Text>
                        Marca: {produto.marca || 'Sem marca'}<br/>
                        Preço: R$ {produto.preco_atual || '0,00'}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default TesteAPI;
