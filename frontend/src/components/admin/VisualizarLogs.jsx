import React, { useState, useEffect } from 'react';
import { Card, Table, Alert, Spinner, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import { adminService } from '../../services';

const VisualizarLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    usuario_id: '',
    acao: '',
    data_inicio: '',
    data_fim: '',
    limite: 50
  });

  useEffect(() => {
    carregarLogs();
  }, []); // Removido o efeito secundário nos filtros para evitar múltiplas chamadas

  const aplicarFiltros = () => {
    carregarLogs();
  };

  const carregarLogs = async () => {
    try {
      setLoading(true);
      setError(null); // Limpa erros anteriores
      
      const filtrosParaEnvio = { ...filtros };
      
      // Remover campos vazios
      Object.keys(filtrosParaEnvio).forEach(key => {
        if (!filtrosParaEnvio[key]) {
          delete filtrosParaEnvio[key];
        }
      });
      
      console.log('Enviando filtros para API:', filtrosParaEnvio);
      
      const response = await adminService.buscarLogs(filtrosParaEnvio);
      
      if (response.sucesso) {
        console.log('Logs recebidos:', response.dados);
        setLogs(response.dados);
      } else {
        console.error('Erro na resposta:', response);
        setError(response.mensagem || 'Erro ao carregar logs do sistema');
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data) => {
    try {
      return new Date(data).toLocaleString('pt-BR');
    } catch (e) {
      return 'Data inválida';
    }
  };

  const getAcaoBadge = (acao) => {
    if (!acao) return <Badge bg="secondary">Desconhecida</Badge>;
    
    const acaoLower = acao.toLowerCase();
    
    if (acaoLower.includes('login') || acaoLower.includes('autenticacao')) {
      return <Badge bg="success">{acao}</Badge>;
    } else if (acaoLower.includes('erro') || acaoLower.includes('falha')) {
      return <Badge bg="danger">{acao}</Badge>;
    } else if (acaoLower.includes('criar') || acaoLower.includes('cadastro')) {
      return <Badge bg="primary">{acao}</Badge>;
    } else if (acaoLower.includes('alterar') || acaoLower.includes('atualizar')) {
      return <Badge bg="warning">{acao}</Badge>;
    } else if (acaoLower.includes('deletar') || acaoLower.includes('remover')) {
      return <Badge bg="danger">{acao}</Badge>;
    } else {
      return <Badge bg="secondary">{acao}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <Spinner animation="border" className="mb-3" />
        <p>Carregando logs do sistema...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-file-text me-2"></i>
          Logs do Sistema
        </h2>
        <Button 
          variant="primary" 
          onClick={carregarLogs}
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
          Filtros de Logs
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Data Início</Form.Label>
                <Form.Control
                  type="date"
                  value={filtros.data_inicio}
                  onChange={(e) => setFiltros({ ...filtros, data_inicio: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Data Fim</Form.Label>
                <Form.Control
                  type="date"
                  value={filtros.data_fim}
                  onChange={(e) => setFiltros({ ...filtros, data_fim: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Ação</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Digite a ação..."
                  value={filtros.acao}
                  onChange={(e) => setFiltros({ ...filtros, acao: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Limite</Form.Label>
                <Form.Select
                  value={filtros.limite}
                  onChange={(e) => setFiltros({ ...filtros, limite: parseInt(e.target.value) })}
                >
                  <option value={25}>25 registros</option>
                  <option value={50}>50 registros</option>
                  <option value={100}>100 registros</option>
                  <option value={200}>200 registros</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex justify-content-end">
            <Button variant="outline-primary" onClick={aplicarFiltros}>
              <i className="bi bi-funnel-fill me-2"></i>
              Aplicar Filtros
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Tabela de logs */}
      <Card className="admin-table">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>
            <i className="bi bi-table me-2"></i>
            Registros de Log
          </span>
          <Badge bg="info">{logs.length} registros</Badge>
        </Card.Header>
        <Card.Body className="p-0">
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <Table responsive striped hover className="mb-0">
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 1 }}>
                <tr>
                  <th>ID</th>
                  <th>Data/Hora</th>
                  <th>Usuário</th>
                  <th>Ação</th>
                  <th>IP</th>
                  <th>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <small className="text-muted">#{log.id}</small>
                      </td>
                      <td>
                        <small>{formatarData(log.data_acao || log.data_criacao)}</small>
                      </td>
                      <td>
                        <div>
                          <small>
                            <strong>{log.usuario_nome || 'Sistema'}</strong>
                            <br />
                            <span className="text-muted">{log.usuario_email}</span>
                          </small>
                        </div>
                      </td>
                      <td>
                        {getAcaoBadge(log.acao)}
                      </td>
                      <td>
                        <small className="text-muted">{log.ip_usuario || log.ip || 'N/A'}</small>
                      </td>
                      <td>
                        {log.detalhes_json && (
                          <details>
                            <summary className="text-primary" style={{ cursor: 'pointer' }}>
                              <small>Ver detalhes</small>
                            </summary>
                            <pre style={{ fontSize: '0.7rem', maxWidth: '300px', overflow: 'auto' }}>
                              {JSON.stringify(JSON.parse(log.detalhes_json), null, 2)}
                            </pre>
                          </details>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="text-muted">
                        <i className="bi bi-file-text fs-1 mb-3"></i>
                        <p>Nenhum log encontrado</p>
                        <small>Tente ajustar os filtros para ver mais resultados</small>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Informações sobre logs */}
      <Row className="mt-4">
        <Col>
          <Alert variant="info" className="admin-alert">
            <Alert.Heading>
              <i className="bi bi-info-circle me-2"></i>
              Sobre os Logs do Sistema
            </Alert.Heading>
            <Row>
              <Col md={6}>
                <ul className="mb-0">
                  <li>Os logs registram todas as ações importantes do sistema</li>
                  <li>Incluem autenticações, alterações de dados e erros</li>
                  <li>Cada log contém usuário, IP, timestamp e detalhes da ação</li>
                </ul>
              </Col>
              <Col md={6}>
                <ul className="mb-0">
                  <li><Badge bg="success">Verde</Badge> - Login/Autenticação</li>
                  <li><Badge bg="primary">Azul</Badge> - Criação de dados</li>
                  <li><Badge bg="warning">Amarelo</Badge> - Alteração de dados</li>
                  <li><Badge bg="danger">Vermelho</Badge> - Erros/Exclusões</li>
                </ul>
              </Col>
            </Row>
          </Alert>
        </Col>
      </Row>
    </div>
  );
};

export default VisualizarLogs;
