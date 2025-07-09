/**
 * ⚙️ CONTROLE DE SERVIÇOS
 * Data: 07 de Julho de 2025
 * Objetivo: Componente para controlar serviços do sistema
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Alert, Badge, Modal, Form, Table, Spinner } from 'react-bootstrap';
import monitoringService from '../../services/monitoringService';

const ControleServicos = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Carregar status dos serviços
    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            setLoading(true);
            const [metricsData, cacheData, backupData] = await Promise.allSettled([
                monitoringService.getCurrentMetrics(),
                monitoringService.getCacheStats(),
                monitoringService.getBackupStats()
            ]);

            console.log('🔧 Dados dos serviços:', { metricsData, cacheData, backupData });

            const servicesList = [];

            // Serviço de Monitoramento
            if (metricsData.status === 'fulfilled') {
                const metrics = metricsData.value?.dados?.metrics || metricsData.value?.data?.metrics;
                servicesList.push({
                    id: 'monitoring',
                    name: 'Sistema de Monitoramento',
                    status: metrics ? 'running' : 'unknown',
                    uptime: metrics?.uptime || 0,
                    description: 'Monitora métricas do sistema em tempo real',
                    actions: ['restart', 'stop', 'start']
                });
            } else {
                servicesList.push({
                    id: 'monitoring',
                    name: 'Sistema de Monitoramento',
                    status: 'stopped',
                    uptime: 0,
                    description: 'Monitora métricas do sistema em tempo real',
                    actions: ['start']
                });
            }

            // Serviço de Cache
            if (cacheData.status === 'fulfilled') {
                const cache = cacheData.value?.dados || cacheData.value?.data;
                servicesList.push({
                    id: 'cache',
                    name: 'Cache Redis',
                    status: cache?.status === 'active' ? 'running' : 'stopped',
                    uptime: cache?.stats?.uptime || 0,
                    description: 'Sistema de cache distribuído',
                    actions: ['restart', 'clear', 'stats']
                });
            } else {
                servicesList.push({
                    id: 'cache',
                    name: 'Cache Redis',
                    status: 'stopped',
                    uptime: 0,
                    description: 'Sistema de cache distribuído',
                    actions: ['start']
                });
            }

            // Serviço de Backup
            if (backupData.status === 'fulfilled') {
                const backup = backupData.value?.dados || backupData.value?.data;
                servicesList.push({
                    id: 'backup',
                    name: 'Backup Automatizado',
                    status: backup?.status === 'active' ? 'running' : 'stopped',
                    uptime: backup?.statistics?.totalBackups || 0,
                    description: 'Backup automático do banco de dados',
                    actions: ['run', 'schedule', 'logs']
                });
            } else {
                servicesList.push({
                    id: 'backup',
                    name: 'Backup Automatizado',
                    status: 'stopped',
                    uptime: 0,
                    description: 'Backup automático do banco de dados (erro ao conectar)',
                    actions: ['configure']
                });
            }

            // Serviço de Logs
            servicesList.push({
                id: 'logs',
                name: 'Sistema de Logs',
                status: 'running',
                uptime: 86400,
                description: 'Coleta e análise de logs do sistema',
                actions: ['restart', 'clear', 'export']
            });

            setServices(servicesList);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleServiceAction = async (service, action) => {
        setSelectedService(service);
        setShowModal(true);
    };

    const confirmAction = async () => {
        if (!selectedService) return;

        setActionLoading(true);
        try {
            // Simular ação do serviço
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Atualizar status do serviço
            setServices(prev => prev.map(s => 
                s.id === selectedService.id 
                    ? { ...s, status: 'running', uptime: 0 }
                    : s
            ));

            setShowModal(false);
            setSelectedService(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'running':
            case 'active':
                return 'success';
            case 'stopped':
            case 'inactive':
                return 'danger';
            case 'warning':
                return 'warning';
            default:
                return 'secondary';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'running':
            case 'active':
                return 'play-circle-fill';
            case 'stopped':
            case 'inactive':
                return 'stop-circle-fill';
            case 'warning':
                return 'exclamation-triangle-fill';
            default:
                return 'question-circle-fill';
        }
    };

    const renderServiceCard = (service) => (
        <Card key={service.id} className="mb-3">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h6 className="card-title mb-1">
                            <i className={`bi bi-${getStatusIcon(service.status)} text-${getStatusColor(service.status)} me-2`}></i>
                            {service.name}
                        </h6>
                        <p className="card-text text-muted mb-0">{service.description}</p>
                    </div>
                    <Badge bg={getStatusColor(service.status)}>
                        {service.status}
                    </Badge>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <small className="text-muted">Uptime:</small>
                        <div>{monitoringService.formatUptime(service.uptime)}</div>
                    </div>
                    <div className="col-6">
                        <small className="text-muted">Última verificação:</small>
                        <div>{new Date().toLocaleTimeString()}</div>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    {service.actions.map(action => (
                        <Button
                            key={action}
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleServiceAction(service, action)}
                        >
                            <i className={`bi bi-${getActionIcon(action)} me-1`}></i>
                            {getActionLabel(action)}
                        </Button>
                    ))}
                </div>
            </Card.Body>
        </Card>
    );

    const getActionIcon = (action) => {
        switch (action) {
            case 'start':
                return 'play';
            case 'stop':
                return 'stop';
            case 'restart':
                return 'arrow-repeat';
            case 'clear':
                return 'trash';
            case 'run':
                return 'play-circle';
            case 'schedule':
                return 'calendar-event';
            case 'logs':
                return 'file-text';
            case 'stats':
                return 'graph-up';
            case 'export':
                return 'download';
            default:
                return 'gear';
        }
    };

    const getActionLabel = (action) => {
        switch (action) {
            case 'start':
                return 'Iniciar';
            case 'stop':
                return 'Parar';
            case 'restart':
                return 'Reiniciar';
            case 'clear':
                return 'Limpar';
            case 'run':
                return 'Executar';
            case 'schedule':
                return 'Agendar';
            case 'logs':
                return 'Logs';
            case 'stats':
                return 'Estatísticas';
            case 'export':
                return 'Exportar';
            default:
                return action;
        }
    };

    if (loading) {
        return (
            <div className="text-center py-4">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Carregando serviços...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger">
                <h6>Erro ao carregar serviços</h6>
                <p>{error}</p>
                <Button variant="outline-danger" onClick={loadServices}>
                    Tentar Novamente
                </Button>
            </Alert>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5>
                    <i className="bi bi-gear me-2"></i>
                    Controle de Serviços
                </h5>
                <Button variant="outline-primary" onClick={loadServices}>
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Atualizar
                </Button>
            </div>

            {/* Resumo dos Serviços */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <h4 className="text-success">{services.filter(s => s.status === 'running').length}</h4>
                            <small className="text-muted">Serviços Ativos</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <h4 className="text-danger">{services.filter(s => s.status === 'stopped').length}</h4>
                            <small className="text-muted">Serviços Parados</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <h4 className="text-warning">{services.filter(s => s.status === 'warning').length}</h4>
                            <small className="text-muted">Com Alertas</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <h4 className="text-info">{services.length}</h4>
                            <small className="text-muted">Total de Serviços</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Lista de Serviços */}
            <Row>
                <Col md={6}>
                    {services.slice(0, Math.ceil(services.length / 2)).map(renderServiceCard)}
                </Col>
                <Col md={6}>
                    {services.slice(Math.ceil(services.length / 2)).map(renderServiceCard)}
                </Col>
            </Row>

            {/* Modal de Confirmação */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Ação</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedService && (
                        <p>
                            Tem certeza que deseja executar esta ação no serviço 
                            <strong> {selectedService.name}</strong>?
                        </p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancelar
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={confirmAction}
                        disabled={actionLoading}
                    >
                        {actionLoading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Executando...
                            </>
                        ) : (
                            'Confirmar'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ControleServicos;
