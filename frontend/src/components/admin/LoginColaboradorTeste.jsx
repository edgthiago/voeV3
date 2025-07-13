import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services';

const LoginColaboradorTeste = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fazerLoginTeste = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Tentar login com credenciais de colaborador padrão
      const response = await authService.login('colaborador@teste.com', '123456');
      
      if (response.sucesso) {
        setMessage({
          type: 'success',
          text: '✅ Login realizado com sucesso! Redirecionando para o painel...'
        });
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          navigate('/admin/colaborador');
        }, 2000);
      } else {
        setMessage({
          type: 'warning',
          text: '⚠️ Login falhou, mas você pode acessar o painel em modo demonstração.'
        });
        
        // Mesmo assim redirecionar em modo demo
        setTimeout(() => {
          navigate('/admin/colaborador');
        }, 3000);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setMessage({
        type: 'info',
        text: '🔄 Erro na autenticação, mas redirecionando para modo demonstração...'
      });
      
      // Redirecionar em modo demo
      setTimeout(() => {
        navigate('/admin/colaborador');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const criarContaColaborador = () => {
    setShowModal(true);
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card>
            <Card.Header className="text-center bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-person-badge me-2"></i>
                Acesso de Colaborador
              </h4>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-4">
                <p className="text-muted">
                  Acesse o painel administrativo do colaborador para gerenciar produtos, estoque e pedidos.
                </p>
              </div>

              {message && (
                <Alert variant={message.type} className="text-center">
                  {message.text}
                </Alert>
              )}

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={fazerLoginTeste}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Entrando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Entrar como Colaborador
                    </>
                  )}
                </Button>

                <Button
                  variant="outline-secondary"
                  onClick={criarContaColaborador}
                  disabled={loading}
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Criar Conta de Colaborador
                </Button>

                <hr />

                <Link to="/" className="btn btn-outline-primary">
                  <i className="bi bi-house me-2"></i>
                  Voltar ao Site
                </Link>
              </div>
            </Card.Body>
          </Card>

          {/* Informações sobre funcionalidades */}
          <Card className="mt-4">
            <Card.Header>
              <h6 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Funcionalidades do Colaborador
              </h6>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <i className="bi bi-check text-success me-2"></i>
                  <strong>Gerenciar Produtos:</strong> Adicionar, editar e visualizar produtos
                </li>
                <li className="mb-2">
                  <i className="bi bi-check text-success me-2"></i>
                  <strong>Controle de Estoque:</strong> Monitorar e atualizar níveis de estoque
                </li>
                <li className="mb-2">
                  <i className="bi bi-check text-success me-2"></i>
                  <strong>Processar Pedidos:</strong> Visualizar e gerenciar pedidos dos clientes
                </li>
                <li className="mb-2">
                  <i className="bi bi-check text-success me-2"></i>
                  <strong>Relatórios Básicos:</strong> Acessar relatórios de vendas e produtos
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal para criar conta */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Criar Conta de Colaborador</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <h6><i className="bi bi-info-circle me-2"></i>Modo Demonstração</h6>
            <p className="mb-0">
              Esta é uma versão de demonstração. Para criar contas reais de colaborador, 
              entre em contato com o administrador do sistema.
            </p>
          </Alert>
          
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome</Form.Label>
                  <Form.Control type="text" placeholder="Seu nome completo" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>CPF</Form.Label>
                  <Form.Control type="text" placeholder="000.000.000-00" />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="colaborador@empresa.com" />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Senha</Form.Label>
              <Form.Control type="password" placeholder="Digite sua senha" />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Telefone</Form.Label>
              <Form.Control type="text" placeholder="(11) 99999-9999" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => {
            setShowModal(false);
            setMessage({
              type: 'info',
              text: '📧 Solicitação enviada! Em um sistema real, um administrador aprovaria sua conta.'
            });
          }}>
            <i className="bi bi-send me-2"></i>
            Solicitar Acesso
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default LoginColaboradorTeste;
