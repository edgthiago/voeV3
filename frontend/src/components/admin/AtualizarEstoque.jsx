import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { produtosService } from '../../services';
import './PainelColaborador.css';

const AtualizarEstoque = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    // Forçar carregamento imediato
    carregarProdutos();
    
    // Adicionar listener para visibilitychange (quando a aba volta a ficar visível)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Página visível novamente, recarregando produtos...');
        carregarProdutos();
      }
    };
    
    // Adicionar listener para focus (quando a janela recebe foco)
    const handleFocus = () => {
      console.log('🎯 Janela recebeu foco, recarregando produtos...');
      carregarProdutos();
    };
    
    // Adicionar listener para pageshow (quando a página é mostrada, incluindo após F5)
    const handlePageShow = (event) => {
      console.log('📄 Evento pageshow detectado, recarregando produtos...', event.persisted ? '(da cache)' : '(novo)');
      carregarProdutos();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('pageshow', handlePageShow);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando produtos...');
      
      // Limpar qualquer cache local
      if (window.localStorage) {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('produtos') || key.includes('estoque'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
      
      // Adicionar timestamp e parâmetros anti-cache
      const cacheBusting = {
        _t: Date.now(),
        _r: Math.random().toString(36).substring(7),
        _bust: 'true'
      };
      
      const response = await produtosService.buscarTodos(cacheBusting);
      
      if (response.sucesso) {
        console.log('✅ Produtos carregados:', response.dados?.length || 0);
        console.log('📦 Produto ID 1 estoque:', response.dados?.find(p => p.id === 1)?.estoque);
        console.log('📦 Todos os produtos:', response.dados?.map(p => ({ id: p.id, nome: p.nome, estoque: p.estoque })));
        setProdutos(response.dados || []);
        setError(null);
      } else {
        console.error('❌ Erro na API:', response.mensagem);
        usarDadosFallback();
      }
    } catch (error) {
      console.error('❌ Erro ao carregar produtos:', error);
      usarDadosFallback();
    } finally {
      setLoading(false);
    }
  };

  const usarDadosFallback = () => {
    console.log('🔄 Usando dados de demonstração - API não disponível');
    const produtosMock = [
      {
        id: 1,
        nome: 'Caderno Universitário 100 folhas',
        categoria: 'Cadernos',
        estoque: 15,
        estoque_minimo: 10,
        imagem: 'https://via.placeholder.com/40x40'
      },
      {
        id: 2,
        nome: 'Caneta Esferográfica Azul',
        categoria: 'Lápis',
        estoque: 3,
        estoque_minimo: 5,
        imagem: 'https://via.placeholder.com/40x40'
      },
      {
        id: 3,
        nome: 'Papel A4 Sulfite 500 folhas',
        categoria: 'Canetas',
        estoque: 0,
        estoque_minimo: 8,
        imagem: 'https://via.placeholder.com/40x40'
      },
      {
        id: 4,
        nome: 'Marcador Permanente Preto',
        categoria: 'Canetas',
        estoque: 25,
        estoque_minimo: 15,
        imagem: 'https://via.placeholder.com/40x40'
      },
      {
        id: 5,
        nome: 'Lápis HB Kit 12 unidades',
        categoria: 'Canetas',
        estoque: 2,
        estoque_minimo: 10,
        imagem: 'https://via.placeholder.com/40x40'
      }
    ];
    
    setError('API não disponível - Usando dados de demonstração');
    setProdutos(produtosMock);
  };

  const handleEstoqueChange = (produtoId, novoEstoque) => {
    // Garantir que o valor seja um número válido
    const estoqueNumerico = parseInt(novoEstoque) || 0;
    
    setProdutos(prev => (prev || []).map(produto => 
      produto.id === produtoId 
        ? { ...produto, estoque: estoqueNumerico }
        : produto
    ));
  };

  const atualizarEstoque = async (produtoId) => {
    setUpdating(true);
    setError(null);
    setSuccess(null);
    
    try {
      const produto = produtos.find(p => p.id === produtoId);
      console.log(`🔄 Atualizando estoque do produto ${produtoId} de ${produto.estoque} para ${produto.estoque}`);
      
      const response = await produtosService.atualizarEstoque(produtoId, produto.estoque);
      console.log('📦 Resposta da atualização:', response);
      
      if (response.sucesso) {
        setSuccess(`Estoque do produto "${produto.nome}" atualizado com sucesso!`);
        
        // Limpar TODOS os possíveis caches
        if (window.localStorage) {
          Object.keys(localStorage).forEach(key => {
            if (key.includes('produtos') || key.includes('estoque') || key.includes('api')) {
              localStorage.removeItem(key);
            }
          });
        }
        
        if (window.sessionStorage) {
          Object.keys(sessionStorage).forEach(key => {
            if (key.includes('produtos') || key.includes('estoque') || key.includes('api')) {
              sessionStorage.removeItem(key);
            }
          });
        }
        
        // Aguardar um pouco e recarregar dados do servidor
        setTimeout(async () => {
          try {
            console.log('🔄 Recarregando produtos após atualização...');
            await carregarProdutos();
            console.log('✅ Produtos recarregados com sucesso');
          } catch (error) {
            console.warn('⚠️ Erro ao recarregar produtos:', error);
          }
        }, 500);
        
        // Forçar recarregamento adicional após 2 segundos
        setTimeout(async () => {
          console.log('🔄 Recarregamento adicional para garantir persistência...');
          await carregarProdutos();
        }, 2000);
        
      } else {
        setError(`Erro ao atualizar estoque: ${response.mensagem}`);
        // Reverter mudança local em caso de erro
        await carregarProdutos();
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar estoque:', error);
      setError(`Erro ao atualizar estoque: ${error.message}`);
      // Reverter mudança local em caso de erro
      await carregarProdutos();
    } finally {
      setUpdating(false);
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
    }
  };

  const atualizarTodos = async () => {
    setUpdating(true);
    try {
      let sucessos = 0;
      for (const produto of produtos) {
        try {
          await produtosService.atualizarEstoque(produto.id, produto.estoque);
          sucessos++;
        } catch (error) {
          console.error(`Erro ao atualizar produto ${produto.id}:`, error);
        }
      }
      
      setSuccess(`${sucessos} produtos atualizados com sucesso! (Modo demonstração)`);
    } catch (error) {
      setError('Erro ao atualizar estoques em lote');
    } finally {
      setUpdating(false);
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    }
  };

  const produtosFiltrados = (produtos || []).filter(produto => {
    if (filtro === 'sem_estoque') return produto.estoque === 0;
    if (filtro === 'baixo_estoque') return produto.estoque > 0 && produto.estoque <= (produto.estoque_minimo || 5);
    if (filtro === 'estoque_ok') return produto.estoque > (produto.estoque_minimo || 5);
    return true;
  });

  const getEstoqueStatus = (produto) => {
    if (produto.estoque === 0) return { variant: 'danger', text: 'Sem Estoque' };
    if (produto.estoque <= (produto.estoque_minimo || 5)) return { variant: 'warning', text: 'Baixo Estoque' };
    return { variant: 'success', text: 'Estoque OK' };
  };

  if (loading) {
    return (
      <div className="dashboard-colaborador">
        <Container fluid className="py-4">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="mt-3">Carregando dados de estoque...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="dashboard-colaborador">
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <h2>
                <i className="bi bi-arrow-repeat me-2"></i>
                Atualizar Estoque
              </h2>
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-primary" 
                  onClick={() => {
                    console.log('🔄 Botão recarregar clicado');
                    carregarProdutos();
                  }}
                  disabled={loading}
                >
                  <i className={`bi ${loading ? 'bi-arrow-clockwise spin' : 'bi-arrow-clockwise'} me-2`}></i>
                  {loading ? 'Carregando...' : 'Recarregar'}
                </Button>
                <Button 
                  variant="outline-warning" 
                  onClick={() => {
                    console.log('🔥 Hard refresh - recarregando página completa');
                    window.location.reload(true);
                  }}
                  title="Força recarregamento completo da página (útil se houver cache)"
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Hard Refresh
                </Button>
                <Link to="/dashboard/estoque" className="btn btn-outline-secondary">
                  <i className="bi bi-arrow-left me-2"></i>
                  Voltar para Estoque
                </Link>
              </div>
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
            {success}
          </Alert>
        )}

        {/* Debug Info */}
        <Card className="mb-4" bg="light">
          <Card.Header>
            <h6 className="mb-0">
              <i className="bi bi-bug me-2"></i>
              Informações de Debug
            </h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <small><strong>Última atualização:</strong> {new Date().toLocaleTimeString()}</small><br/>
                <small><strong>Total de produtos:</strong> {produtos.length}</small><br/>
                <small><strong>Produto ID 1 estoque:</strong> {produtos.find(p => p.id === 1)?.estoque || 'N/A'}</small><br/>
                <small><strong>Frontend port:</strong> 3000</small>
              </Col>
              <Col md={6}>
                <small><strong>Cache localStorage:</strong> {typeof window !== 'undefined' ? localStorage.length : 0} itens</small><br/>
                <small><strong>Cache sessionStorage:</strong> {typeof window !== 'undefined' ? sessionStorage.length : 0} itens</small><br/>
                <small><strong>Status loading:</strong> {loading ? 'Sim' : 'Não'}</small><br/>
                <small><strong>Backend port:</strong> 3001</small>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Row className="mb-4">
          <Col md={6}>
            <Card>
              <Card.Body>
                <h6>Filtrar Produtos</h6>
                <Form.Select
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                >
                  <option value="todos">Todos os Produtos</option>
                  <option value="sem_estoque">Sem Estoque</option>
                  <option value="baixo_estoque">Baixo Estoque</option>
                  <option value="estoque_ok">Estoque OK</option>
                </Form.Select>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="d-flex align-items-end">
            <Button
              variant="success"
              onClick={atualizarTodos}
              disabled={updating}
              className="w-100"
            >
              {updating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Atualizando...
                </>
              ) : (
                <>
                  <i className="bi bi-arrow-repeat me-2"></i>
                  Atualizar Todos os Estoques
                </>
              )}
            </Button>
          </Col>
        </Row>

        <Card>
          <Card.Header>
            <h5 className="mb-0">
              Produtos ({produtosFiltrados.length} de {produtos.length})
            </h5>
          </Card.Header>
          <Card.Body>
            {produtosFiltrados.length === 0 ? (
              <div className="text-center py-4">
                <i className="bi bi-inbox display-4 text-muted"></i>
                <p className="mt-3 text-muted">Nenhum produto encontrado com os filtros aplicados.</p>
              </div>
            ) : (
              <Table responsive>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Categoria</th>
                    <th>Estoque Atual</th>
                    <th>Novo Estoque</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {produtosFiltrados.map((produto) => {
                    const status = getEstoqueStatus(produto);
                    return (
                      <tr key={produto.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={produto.imagem}
                              alt={produto.nome}
                              width="40"
                              height="40"
                              className="me-2 rounded"
                            />
                            <div>
                              <strong>{produto.nome}</strong>
                            </div>
                          </div>
                        </td>
                        <td>{produto.categoria}</td>
                        <td>
                          <Badge bg={status.variant}>
                            {produto.estoque} unidades
                          </Badge>
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            min="0"
                            value={produto.estoque}
                            onChange={(e) => handleEstoqueChange(produto.id, e.target.value)}
                            style={{ width: '100px' }}
                          />
                        </td>
                        <td>
                          <Badge bg={status.variant}>
                            {status.text}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => atualizarEstoque(produto.id)}
                            disabled={updating}
                          >
                            {updating ? (
                              <span className="spinner-border spinner-border-sm" />
                            ) : (
                              <i className="bi bi-save"></i>
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        <Row className="mt-4">
          <Col>
            <Card>
              <Card.Header>
                <h6 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Dicas de Gestão de Estoque
                </h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <div className="text-center mb-3">
                      <i className="bi bi-exclamation-triangle text-danger display-6"></i>
                      <h6>Sem Estoque</h6>
                      <p className="small text-muted">Produtos que precisam de reposição urgente</p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center mb-3">
                      <i className="bi bi-exclamation-circle text-warning display-6"></i>
                      <h6>Baixo Estoque</h6>
                      <p className="small text-muted">Produtos que estão próximos do limite mínimo</p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center mb-3">
                      <i className="bi bi-check-circle text-success display-6"></i>
                      <h6>Estoque OK</h6>
                      <p className="small text-muted">Produtos com estoque adequado</p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AtualizarEstoque;
