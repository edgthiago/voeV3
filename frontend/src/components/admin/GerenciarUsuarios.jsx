import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Alert, Spinner, Modal, Form, Row, Col } from 'react-bootstrap';
import { adminService } from '../../services';

const GerenciarUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filtros, setFiltros] = useState({
    nivel_acesso: '',
    ativo: '',
    busca: ''
  });

  useEffect(() => {
    carregarUsuarios();
  }, [filtros]);
  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      console.log('Buscando usuários com filtros:', filtros);
      const response = await adminService.buscarUsuarios(filtros);
      console.log('Resposta da API:', response);
      
      if (response.sucesso) {
        setUsuarios(response.dados);
        console.log('Usuários carregados:', response.dados.length);
      } else {
        console.error('Erro na resposta:', response);
        setError('Erro ao carregar usuários: ' + response.mensagem || 'Resposta inválida');
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError('Erro ao conectar com o servidor: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };
  const alterarNivelAcesso = async (userId, novoNivel) => {
    try {
      console.log(`Alterando nível de acesso do usuário ${userId} para ${novoNivel}`);
      const response = await adminService.alterarNivelAcesso(userId, novoNivel);
      console.log('Resposta:', response);
      
      if (response.sucesso) {
        carregarUsuarios();
        setShowModal(false);
        setSelectedUser(null);
      } else {
        setError(response.mensagem || 'Erro ao alterar nível de acesso');
      }
    } catch (error) {
      console.error('Erro ao alterar nível de acesso:', error);
      setError('Erro ao conectar com o servidor: ' + (error.message || 'Erro desconhecido'));
    }
  };
  const alterarStatusUsuario = async (userId, novoStatus) => {
    try {
      console.log(`Alterando status do usuário ${userId} para ${novoStatus ? 'ativo' : 'inativo'}`);
      const response = await adminService.alterarStatusUsuario(userId, novoStatus);
      console.log('Resposta:', response);
      
      if (response.sucesso) {
        carregarUsuarios();
      } else {
        setError(response.mensagem || 'Erro ao alterar status do usuário');
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      setError('Erro ao conectar com o servidor: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const abrirModalEdicao = (usuario) => {
    setSelectedUser(usuario);
    setShowModal(true);
  };
  const getBadgeVariant = (nivel) => {
    switch (nivel?.toLowerCase()) {
      case 'diretor':
        return 'primary';
      case 'supervisor':
        return 'warning';
      case 'colaborador':
        return 'secondary';
      case 'usuario':
        return 'info';
      case 'visitante':
        return 'dark';
      default:
        return 'danger'; // Vermelho para casos não tratados, para tornar visível
    }
  };  const getStatusBadge = (ativo) => {
    // Lógica mais robusta para verificar o status
    const isAtivo = ativo === true || 
                    ativo === "ativo" || 
                    ativo === "true" || 
                    ativo === 1 || 
                    String(ativo).toLowerCase() === "ativo";
                    
    return isAtivo ? (
      <Badge bg="success">Ativo</Badge>
    ) : (
      <Badge bg="danger">Inativo</Badge>
    );
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <Spinner animation="border" className="mb-3" />
        <p>Carregando usuários...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-people me-2"></i>
          Gerenciar Usuários
        </h2>
        <Button 
          variant="primary" 
          onClick={carregarUsuarios}
          className="btn-admin"
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Atualizar
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filtros */}
      <Card className="dashboard-card mb-4">
        <Card.Header>
          <i className="bi bi-funnel me-2"></i>
          Filtros
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Nível de Acesso</Form.Label>
                <Form.Select
                  value={filtros.nivel_acesso}
                  onChange={(e) => setFiltros({ ...filtros, nivel_acesso: e.target.value })}
                >                  <option value="">Todos</option>
                  <option value="visitante">Visitante</option>
                  <option value="usuario">Usuário</option>
                  <option value="colaborador">Colaborador</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="diretor">Diretor</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={filtros.ativo}
                  onChange={(e) => setFiltros({ ...filtros, ativo: e.target.value })}
                >
                  <option value="">Todos</option>
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Buscar</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nome ou email..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabela de usuários */}
      <Card className="admin-table">
        <Card.Header>
          <i className="bi bi-table me-2"></i>
          Lista de Usuários ({usuarios.length})
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive striped hover className="mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Nível de Acesso</th>
                <th>Status</th>
                <th>Data Cadastro</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length > 0 ? (
                usuarios.map((usuario) => (                  <tr key={usuario.id}>
                    <td>{usuario.id}</td>
                    <td>
                      <div>
                        <strong>{usuario.nome}</strong>
                        {usuario.telefone && (
                          <>
                            <br />
                            <small className="text-muted">{usuario.telefone}</small>
                          </>
                        )}
                      </div>
                    </td>
                    <td>{usuario.email}</td>
                    <td>
                      <Badge bg={getBadgeVariant(usuario.tipo_usuario || usuario.nivel_acesso)} className="text-uppercase">
                        {(usuario.tipo_usuario || usuario.nivel_acesso || "desconhecido")}
                      </Badge>
                    </td>
                    <td>{getStatusBadge(usuario.status || usuario.ativo)}</td>
                    <td>
                      {new Date(usuario.data_criacao).toLocaleDateString('pt-BR')}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => abrirModalEdicao(usuario)}
                          className="btn-admin"
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant={usuario.ativo ? "outline-danger" : "outline-success"}
                          onClick={() => alterarStatusUsuario(usuario.id, !usuario.ativo)}
                          className="btn-admin"
                        >
                          <i className={`bi bi-${usuario.ativo ? 'x' : 'check'}-circle`}></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="text-muted">
                      <i className="bi bi-people fs-1 mb-3"></i>
                      <p>Nenhum usuário encontrado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal de edição */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-pencil me-2"></i>
            Editar Usuário
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              <div className="mb-3">
                <strong>Nome:</strong> {selectedUser.nome}
              </div>
              <div className="mb-3">
                <strong>Email:</strong> {selectedUser.email}
              </div>
              <Form.Group>
                <Form.Label>Nível de Acesso</Form.Label>                <Form.Select
                  defaultValue={selectedUser.nivel_acesso}
                  onChange={(e) => setSelectedUser({ 
                    ...selectedUser, 
                    nivel_acesso: e.target.value 
                  })}
                >
                  <option value="visitante">Visitante</option>
                  <option value="usuario">Usuário</option>
                  <option value="colaborador">Colaborador</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="diretor">Diretor</option>
                </Form.Select>                <Form.Text className="text-muted">
                  Visitante: Apenas navegação<br />
                  Usuário: Carrinho e compras<br />
                  Colaborador: + Gerenciar produtos<br />
                  Supervisor: + Criar promoções e ver relatórios<br />
                  Diretor: + Gerenciar usuários e ver logs
                </Form.Text>
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={() => alterarNivelAcesso(selectedUser.id, selectedUser.nivel_acesso)}
          >
            Salvar Alterações
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GerenciarUsuarios;
