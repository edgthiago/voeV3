/**
 * 📊 DASHBOARD DE MONITORAMENTO
 * Data: 07 de Julho de 2025
 * Objetivo: Interface visual para monitoramento do sistema
 */

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Badge, Button, Spinner, Tab, Nav } from 'react-bootstrap';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    PieChart, 
    Pie, 
    Cell 
} from 'recharts';
import monitoringService from '../../services/monitoringService';
import ProtecaoRota from '../common/ProtecaoRota';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const DashboardMonitoramento = () => {
    const [metrics, setMetrics] = useState(null);
    const [history, setHistory] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [logs, setLogs] = useState([]);
    const [backupStats, setBackupStats] = useState(null);
    const [cacheStats, setCacheStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Carregar dados iniciais
    useEffect(() => {
        loadAllData();
    }, []);

    // Auto-refresh a cada 30 segundos
    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                loadAllData();
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const loadAllData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Carregar dados em paralelo
            const [
                metricsData,
                historyData,
                alertsData,
                logsData,
                backupData,
                cacheData
            ] = await Promise.allSettled([
                monitoringService.getCurrentMetrics(),
                monitoringService.getMetricsHistory(7),
                monitoringService.getActiveAlerts(),
                monitoringService.getSystemLogs('all', 50),
                monitoringService.getBackupStats(),
                monitoringService.getCacheStats()
            ]);

            if (metricsData.status === 'fulfilled') {
                const metricsResponse = metricsData.value?.dados?.metrics || 
                                      metricsData.value?.data?.metrics || 
                                      metricsData.value?.dados || 
                                      metricsData.value?.data || {};
                setMetrics(metricsResponse);
                console.log('📊 Métricas carregadas:', metricsResponse);
            } else {
                console.warn('Erro ao carregar métricas:', metricsData.reason);
            }

            if (historyData.status === 'fulfilled') {
                setHistory(historyData.value?.data || historyData.value?.dados || []);
            } else {
                console.warn('Erro ao carregar histórico:', historyData.reason);
            }

            if (alertsData.status === 'fulfilled') {
                const alerts = alertsData.value?.data?.alerts || 
                              alertsData.value?.alerts || 
                              alertsData.value?.dados || [];
                setAlerts(Array.isArray(alerts) ? alerts : []);
            } else {
                console.warn('Erro ao carregar alertas:', alertsData.reason);
                setAlerts([]); // Garantir que alerts seja sempre um array
            }

            if (logsData.status === 'fulfilled') {
                setLogs(logsData.value?.data || logsData.value?.dados || []);
            } else {
                console.warn('Erro ao carregar logs:', logsData.reason);
            }

            if (backupData.status === 'fulfilled') {
                setBackupStats(backupData.value?.data || backupData.value?.dados || {});
            } else {
                console.warn('Erro ao carregar backup stats:', backupData.reason);
            }

            if (cacheData.status === 'fulfilled') {
                setCacheStats(cacheData.value?.data || cacheData.value?.dados || {});
            } else {
                console.warn('Erro ao carregar cache stats:', cacheData.reason);
            }

        } catch (err) {
            console.error('Erro geral no dashboard:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatChartData = (data) => {
        if (!data || !Array.isArray(data)) return [];
        
        return data.map(item => ({
            ...item,
            timestamp: new Date(item.timestamp).toLocaleTimeString(),
            cpuUsage: parseFloat(item.cpu?.usage) || 0,
            memoryUsage: parseFloat(item.memory?.usage) || 0,
            diskUsage: parseFloat(item.disk?.usage) || 0
        }));
    };

    const renderSystemOverview = () => {
        if (!metrics) return null;

        console.log('🔍 Estrutura de metrics:', metrics);
        
        // Adaptar para a estrutura real da API
        const cpu = metrics.cpu || {};
        const memory = metrics.memory || {};
        const disk = metrics.disk || {};
        const network = metrics.network || {};
        const database = metrics.database || {};
        const api = metrics.api || {};
        
        const uptime = monitoringService.formatUptime(metrics.uptime || 0);
        const memoryUsed = memory.used ? `${memory.used} MB` : '0 MB';
        const memoryTotal = memory.total ? `${memory.total} MB` : '0 MB';
        const cpuUsage = cpu.usage ? `${cpu.usage.toFixed(1)}%` : '0.0%';
        const systemStatus = metrics.uptime > 0 ? 'Conectado' : 'Desconectado';

        return (
            <Row className="g-4">
                {/* Status Cards */}
                <Col md={3}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <h5 className="card-title">
                                <i className={`bi bi-${systemStatus === 'Conectado' ? 'check-circle text-success' : 'x-circle text-danger'}`}></i>
                            </h5>
                            <h6 className="card-subtitle mb-2 text-muted">Status do Sistema</h6>
                            <Badge bg={systemStatus === 'Conectado' ? 'success' : 'danger'}>
                                {systemStatus}
                            </Badge>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <h5 className="card-title text-primary">
                                <i className="bi bi-clock"></i>
                            </h5>
                            <h6 className="card-subtitle mb-2 text-muted">Uptime</h6>
                            <p className="card-text">{uptime}</p>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <h5 className="card-title text-warning">
                                <i className="bi bi-cpu"></i>
                            </h5>
                            <h6 className="card-subtitle mb-2 text-muted">CPU</h6>
                            <p className="card-text">{cpuUsage}</p>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <h5 className="card-title text-info">
                                <i className="bi bi-memory"></i>
                            </h5>
                            <h6 className="card-subtitle mb-2 text-muted">Memória</h6>
                            <p className="card-text">{memoryUsed} / {memoryTotal}</p>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Gráfico de Performance */}
                <Col md={8}>
                    <Card>
                        <Card.Header>
                            <h5><i className="bi bi-graph-up me-2"></i>Performance do Sistema</h5>
                        </Card.Header>
                        <Card.Body>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={formatChartData(history)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="timestamp" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="cpuUsage" stroke="#8884d8" name="CPU %" />
                                    <Line type="monotone" dataKey="memoryUsage" stroke="#82ca9d" name="Memória %" />
                                    <Line type="monotone" dataKey="diskUsage" stroke="#ffc658" name="Disco %" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Alertas */}
                <Col md={4}>
                    <Card>
                        <Card.Header>
                            <h5><i className="bi bi-exclamation-triangle me-2"></i>Alertas Ativos</h5>
                        </Card.Header>
                        <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {alerts.length === 0 ? (
                                <Alert variant="success">
                                    <i className="bi bi-check-circle me-2"></i>
                                    Nenhum alerta ativo
                                </Alert>
                            ) : (
                                alerts.map((alert, index) => (
                                    <Alert key={index} variant={monitoringService.getStatusColor(alert.severity || alert.type || 'info')}>
                                        <strong>{alert.message || alert.title || 'Alerta sem descrição'}</strong>
                                        <small className="d-block text-muted">
                                            {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : 'Data não disponível'}
                                        </small>
                                    </Alert>
                                ))
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        );
    };

    const renderLogsTab = () => {
        return (
            <Card>
                <Card.Header>
                    <h5><i className="bi bi-file-text me-2"></i>Logs do Sistema</h5>
                </Card.Header>
                <Card.Body>
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {logs.length === 0 ? (
                            <Alert variant="info">Nenhum log encontrado</Alert>
                        ) : (
                            logs.map((log, index) => (
                                <div key={index} className="mb-2 p-2 border-bottom">
                                    <Badge bg={log.level === 'error' ? 'danger' : log.level === 'warn' ? 'warning' : 'info'}>
                                        {log.level}
                                    </Badge>
                                    <span className="ms-2">{log.message}</span>
                                    <small className="text-muted d-block">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </small>
                                </div>
                            ))
                        )}
                    </div>
                </Card.Body>
            </Card>
        );
    };

    const renderServicesTab = () => {
        return (
            <Row className="g-4">
                {/* Cache Statistics */}
                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <h5><i className="bi bi-hdd me-2"></i>Cache Redis</h5>
                        </Card.Header>
                        <Card.Body>
                            {cacheStats ? (
                                <div>
                                    <p><strong>Status:</strong> <Badge bg="success">Ativo</Badge></p>
                                    <p><strong>Hits:</strong> {cacheStats.hits || 0}</p>
                                    <p><strong>Misses:</strong> {cacheStats.misses || 0}</p>
                                    <p><strong>Hit Rate:</strong> {cacheStats.hitRate || 0}%</p>
                                </div>
                            ) : (
                                <Alert variant="warning">Cache não configurado</Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Backup Statistics */}
                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <h5><i className="bi bi-shield-check me-2"></i>Backup</h5>
                        </Card.Header>
                        <Card.Body>
                            {backupStats ? (
                                <div>
                                    <p><strong>Status:</strong> <Badge bg="success">Ativo</Badge></p>
                                    <p><strong>Último Backup:</strong> {new Date(backupStats.lastBackup).toLocaleString()}</p>
                                    <p><strong>Próximo Backup:</strong> {new Date(backupStats.nextBackup).toLocaleString()}</p>
                                    <p><strong>Tamanho:</strong> {monitoringService.formatBytes(backupStats.size || 0)}</p>
                                </div>
                            ) : (
                                <Alert variant="warning">Backup não configurado</Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        );
    };

    if (loading) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Carregando dados de monitoramento...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <h4>Erro ao carregar dashboard</h4>
                    <p>{error}</p>
                    <Button variant="outline-danger" onClick={loadAllData}>
                        Tentar Novamente
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            <Row>
                <Col>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2>
                            <i className="bi bi-bar-chart-line me-2"></i>
                            Dashboard de Monitoramento
                        </h2>
                        <div>
                            <Button 
                                variant={autoRefresh ? "success" : "outline-secondary"} 
                                size="sm" 
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className="me-2"
                            >
                                <i className="bi bi-arrow-repeat me-1"></i>
                                Auto-refresh
                            </Button>
                            <Button variant="primary" size="sm" onClick={loadAllData}>
                                <i className="bi bi-arrow-clockwise me-1"></i>
                                Atualizar
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>

            <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Nav variant="tabs" className="mb-4">
                    <Nav.Item>
                        <Nav.Link eventKey="overview">
                            <i className="bi bi-speedometer2 me-2"></i>
                            Visão Geral
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="logs">
                            <i className="bi bi-file-text me-2"></i>
                            Logs
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="services">
                            <i className="bi bi-gear me-2"></i>
                            Serviços
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content>
                    <Tab.Pane eventKey="overview">
                        {renderSystemOverview()}
                    </Tab.Pane>
                    <Tab.Pane eventKey="logs">
                        {renderLogsTab()}
                    </Tab.Pane>
                    <Tab.Pane eventKey="services">
                        {renderServicesTab()}
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </Container>
    );
};

// Componente protegido que só permite acesso a administradores
const DashboardMonitoramentoProtegido = () => {
    return (
        <ProtecaoRota niveisPermitidos={['admin', 'diretor']}>
            <DashboardMonitoramento />
        </ProtecaoRota>
    );
};

export default DashboardMonitoramentoProtegido;
