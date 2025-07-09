/**
 * 🧪 TESTE DE INTEGRAÇÃO FRONTEND-BACKEND
 * Data: 07 de Julho de 2025
 * Objetivo: Testar conexão entre dashboard React e APIs de monitoramento
 */

import React, { useState, useEffect } from 'react';
import { getSystemStatus, getMetrics, getAlerts, getLogs } from '../services/monitoringService';

const TesteDashboard = () => {
    const [status, setStatus] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [alerts, setAlerts] = useState(null);
    const [logs, setLogs] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const testarConexao = async () => {
            try {
                setLoading(true);
                setError(null);
                
                console.log('🧪 Iniciando teste de conexão...');
                
                // Testar status
                const statusResponse = await getSystemStatus();
                setStatus(statusResponse);
                console.log('✅ Status obtido:', statusResponse);
                
                // Testar métricas
                const metricsResponse = await getMetrics();
                setMetrics(metricsResponse);
                console.log('✅ Métricas obtidas:', metricsResponse);
                
                // Testar alertas
                const alertsResponse = await getAlerts();
                setAlerts(alertsResponse);
                console.log('✅ Alertas obtidos:', alertsResponse);
                
                // Testar logs
                const logsResponse = await getLogs();
                setLogs(logsResponse);
                console.log('✅ Logs obtidos:', logsResponse);
                
                console.log('🎉 Teste de conexão concluído com sucesso!');
                
            } catch (err) {
                console.error('❌ Erro no teste de conexão:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        testarConexao();
    }, []);

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-header bg-primary text-white">
                                <h5>🧪 Teste de Conexão Backend-Frontend</h5>
                            </div>
                            <div className="card-body text-center">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Carregando...</span>
                                </div>
                                <p className="mt-3">Testando conexão com APIs de monitoramento...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-header bg-danger text-white">
                                <h5>❌ Erro de Conexão</h5>
                            </div>
                            <div className="card-body">
                                <div className="alert alert-danger">
                                    <h6>Erro:</h6>
                                    <p>{error}</p>
                                </div>
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => window.location.reload()}
                                >
                                    Tentar Novamente
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header bg-success text-white">
                            <h5>✅ Teste de Conexão - SUCESSO</h5>
                        </div>
                        <div className="card-body">
                            <p className="text-success">
                                <strong>🎉 Parabéns! A conexão entre frontend e backend está funcionando perfeitamente!</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mt-4">
                {/* Status do Sistema */}
                <div className="col-md-6 mb-4">
                    <div className="card">
                        <div className="card-header bg-info text-white">
                            <h6>📊 Status do Sistema</h6>
                        </div>
                        <div className="card-body">
                            {status ? (
                                <div>
                                    <p><strong>Status:</strong> {status.system?.status}</p>
                                    <p><strong>Uptime:</strong> {status.system?.uptime}s</p>
                                    <p><strong>CPU:</strong> {status.system?.cpuUsage}%</p>
                                    <p><strong>Memória:</strong> {status.system?.memoryUsage}%</p>
                                    <p><strong>Plataforma:</strong> {status.system?.platform}</p>
                                </div>
                            ) : (
                                <p>Nenhum dado disponível</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Métricas */}
                <div className="col-md-6 mb-4">
                    <div className="card">
                        <div className="card-header bg-warning text-white">
                            <h6>📈 Métricas</h6>
                        </div>
                        <div className="card-body">
                            {metrics ? (
                                <div>
                                    <p><strong>Req/s:</strong> {metrics.application?.requestsPerSecond}</p>
                                    <p><strong>Total Req:</strong> {metrics.application?.totalRequests}</p>
                                    <p><strong>Taxa de Erro:</strong> {metrics.application?.errorRate}%</p>
                                    <p><strong>Conexões DB:</strong> {metrics.database?.activeConnections}</p>
                                </div>
                            ) : (
                                <p>Nenhum dado disponível</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Alertas */}
                <div className="col-md-6 mb-4">
                    <div className="card">
                        <div className="card-header bg-danger text-white">
                            <h6>🚨 Alertas</h6>
                        </div>
                        <div className="card-body">
                            {alerts && alerts.length > 0 ? (
                                <div>
                                    {alerts.map((alert, index) => (
                                        <div key={index} className={`alert alert-${alert.type === 'error' ? 'danger' : alert.type === 'warning' ? 'warning' : 'info'}`}>
                                            <strong>{alert.message}</strong>
                                            <br />
                                            <small>Severidade: {alert.severity}</small>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-success">Nenhum alerta ativo</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Logs */}
                <div className="col-md-6 mb-4">
                    <div className="card">
                        <div className="card-header bg-secondary text-white">
                            <h6>📝 Logs Recentes</h6>
                        </div>
                        <div className="card-body">
                            {logs && logs.length > 0 ? (
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {logs.slice(0, 5).map((log, index) => (
                                        <div key={index} className="mb-2">
                                            <span className={`badge bg-${log.type === 'error' ? 'danger' : log.type === 'warning' ? 'warning' : log.type === 'info' ? 'info' : 'secondary'}`}>
                                                {log.type}
                                            </span>
                                            <span className="ms-2">{log.message}</span>
                                            <br />
                                            <small className="text-muted">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </small>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>Nenhum log disponível</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h6>🎯 Próximos Passos</h6>
                        </div>
                        <div className="card-body">
                            <ol>
                                <li><strong>✅ Conexão Backend-Frontend:</strong> Funcionando perfeitamente</li>
                                <li><strong>✅ APIs de Monitoramento:</strong> Todas as rotas respondendo corretamente</li>
                                <li><strong>✅ Componentes React:</strong> Carregando e exibindo dados</li>
                                <li><strong>🔄 Próximo:</strong> Integrar com dashboard principal</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TesteDashboard;
