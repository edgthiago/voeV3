/**
 * 🔴 MÉTRICAS EM TEMPO REAL
 * Data: 07 de Julho de 2025
 * Objetivo: Componente para exibir métricas em tempo real
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Alert, ProgressBar } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import monitoringService from '../../services/monitoringService';

const MetricasTempoReal = () => {
    const [metrics, setMetrics] = useState(null);
    const [history, setHistory] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Atualizar métricas a cada 5 segundos
    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const [metricsData, alertsData] = await Promise.all([
                    monitoringService.getCurrentMetrics(),
                    monitoringService.getActiveAlerts()
                ]);

                console.log('📊 Dados recebidos - metricsData:', metricsData);
                console.log('🚨 Dados recebidos - alertsData:', alertsData);

                const processedMetrics = metricsData?.dados?.metrics || metricsData?.data?.metrics || metricsData;
                setMetrics(processedMetrics);
                setAlerts(alertsData?.dados?.alerts || alertsData?.data?.alerts || alertsData?.alerts || []);
                
                // Adicionar ao histórico (manter apenas últimos 20 pontos)
                const newDataPoint = {
                    timestamp: new Date().toLocaleTimeString(),
                    cpuUsage: processedMetrics?.cpu?.usage || 0,
                    memoryUsage: processedMetrics?.memory?.usage || 0,
                    diskUsage: processedMetrics?.disk?.usage || 0,
                    requestsPerSecond: processedMetrics?.api?.requests || 0
                };

                setHistory(prev => {
                    const newHistory = [...prev, newDataPoint];
                    return newHistory.slice(-20);
                });

                setLoading(false);
                setError(null);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchMetrics();
        const interval = setInterval(fetchMetrics, 5000);
        return () => clearInterval(interval);
    }, []);

    const getProgressVariant = (value) => {
        if (value >= 80) return 'danger';
        if (value >= 60) return 'warning';
        return 'success';
    };

    const getStatusBadge = (status) => {
        const color = monitoringService.getStatusColor(status);
        const icon = monitoringService.getStatusIcon(status);
        return (
            <Badge bg={color}>
                <i className={`bi bi-${icon} me-1`}></i>
                {status}
            </Badge>
        );
    };

    if (loading) {
        return (
            <Alert variant="info">
                <i className="bi bi-arrow-repeat spin me-2"></i>
                Carregando métricas...
            </Alert>
        );
    }

    if (error) {
        return (
            <Alert variant="danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Erro ao carregar métricas: {error}
            </Alert>
        );
    }

    if (!metrics) {
        return (
            <Alert variant="warning">
                <i className="bi bi-question-circle me-2"></i>
                Nenhuma métrica disponível
            </Alert>
        );
    }

    const cpu = metrics.cpu || {};
    const memory = metrics.memory || {};
    const disk = metrics.disk || {};
    const network = metrics.network || {};
    const database = metrics.database || {};
    const api = metrics.api || {};

    return (
        <div>
            {/* Alertas Críticos */}
            {alerts.length > 0 && (
                <Row className="mb-4">
                    <Col>
                        <Alert variant="warning">
                            <Alert.Heading>
                                <i className="bi bi-exclamation-triangle me-2"></i>
                                Alertas Ativos ({alerts.length})
                            </Alert.Heading>
                            {alerts.slice(0, 3).map((alert, index) => (
                                <div key={index} className="mb-1">
                                    <Badge bg={monitoringService.getStatusColor(alert.type)} className="me-2">
                                        {alert.type}
                                    </Badge>
                                    {alert.message}
                                </div>
                            ))}
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Métricas do Sistema */}
            <Row className="g-4 mb-4">
                <Col md={3}>
                    <Card className="h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="card-title mb-0">
                                    <i className="bi bi-cpu me-2"></i>CPU
                                </h6>
                                {getStatusBadge('normal')}
                            </div>
                            <div className="mt-3">
                                <div className="d-flex justify-content-between mb-1">
                                    <span>Uso:</span>
                                    <span>{(cpu.usage || 0).toFixed(1)}%</span>
                                </div>
                                <ProgressBar 
                                    now={cpu.usage || 0} 
                                    variant={getProgressVariant(cpu.usage || 0)}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="card-title mb-0">
                                    <i className="bi bi-memory me-2"></i>Memória
                                </h6>
                                <Badge bg="info">
                                    {memory.used || '0'} GB
                                </Badge>
                            </div>
                            <div className="mt-3">
                                <div className="d-flex justify-content-between mb-1">
                                    <span>Uso:</span>
                                    <span>{(memory.usage || 0).toFixed(1)}%</span>
                                </div>
                                <ProgressBar 
                                    now={memory.usage || 0} 
                                    variant={getProgressVariant(memory.usage || 0)}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="card-title mb-0">
                                    <i className="bi bi-hdd me-2"></i>Disco
                                </h6>
                                <Badge bg="secondary">
                                    {disk.free || '0'} GB livre
                                </Badge>
                            </div>
                            <div className="mt-3">
                                <div className="d-flex justify-content-between mb-1">
                                    <span>Uso:</span>
                                    <span>{(disk.usage || 0).toFixed(1)}%</span>
                                </div>
                                <ProgressBar 
                                    now={disk.usage || 0} 
                                    variant={getProgressVariant(disk.usage || 0)}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="card-title mb-0">
                                    <i className="bi bi-activity me-2"></i>Requisições
                                </h6>
                                <Badge bg="primary">
                                    {(api.requests || 0)}/total
                                </Badge>
                            </div>
                            <div className="mt-3">
                                <div className="d-flex justify-content-between mb-1">
                                    <span>Total:</span>
                                    <span>{api.requests || 0}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span>Erros:</span>
                                    <span className="text-danger">{api.errors || 0}</span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Gráfico de Performance em Tempo Real */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Header>
                            <h5>
                                <i className="bi bi-graph-up me-2"></i>
                                Performance em Tempo Real
                                <Badge bg="success" className="ms-2">
                                    <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }}></i>
                                    Ao Vivo
                                </Badge>
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={history}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="timestamp" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line 
                                        type="monotone" 
                                        dataKey="cpuUsage" 
                                        stroke="#8884d8" 
                                        name="CPU %" 
                                        strokeWidth={2}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="memoryUsage" 
                                        stroke="#82ca9d" 
                                        name="Memória %" 
                                        strokeWidth={2}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="requestsPerSecond" 
                                        stroke="#ffc658" 
                                        name="Req/s" 
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Métricas da Aplicação */}
            <Row className="g-4">
                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <h6>
                                <i className="bi bi-server me-2"></i>
                                Aplicação
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="row">
                                <div className="col-6">
                                    <div className="text-center">
                                        <h4 className="text-primary">{database.connections || 0}</h4>
                                        <small className="text-muted">Conexões Ativas</small>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="text-center">
                                        <h4 className="text-success">{(api.averageResponseTime || 0).toFixed(0)}ms</h4>
                                        <small className="text-muted">Tempo de Resposta</small>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <h6>
                                <i className="bi bi-database me-2"></i>
                                Banco de Dados
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="row">
                                <div className="col-6">
                                    <div className="text-center">
                                        <h4 className="text-info">{database.connections || 0}</h4>
                                        <small className="text-muted">Conexões DB</small>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="text-center">
                                        <h4 className="text-warning">{(database.responseTime || 0).toFixed(0)}ms</h4>
                                        <small className="text-muted">Tempo de Query</small>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default MetricasTempoReal;
