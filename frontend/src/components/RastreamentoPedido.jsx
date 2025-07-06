import React, { useState, useEffect } from 'react';
import './RastreamentoPedido.css';

const RastreamentoPedido = ({ pedidoId, codigoRastreamento, statusAtual, onFechar }) => {
    const [dadosRastreamento, setDadosRastreamento] = useState(null);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [historico, setHistorico] = useState([]);

    useEffect(() => {
        if (pedidoId) {
            buscarHistoricoPedido();
        }
        if (codigoRastreamento) {
            buscarRastreamento();
        }
    }, [pedidoId, codigoRastreamento]);

    const buscarHistoricoPedido = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/pedidos/${pedidoId}/historico`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.sucesso) {
                setHistorico(data.dados);
            }
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
        } finally {
            setLoading(false);
        }
    };

    const buscarRastreamento = async () => {
        if (!codigoRastreamento) return;

        setLoading(true);
        setErro('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/pedidos/rastreamento/${codigoRastreamento}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.sucesso) {
                setDadosRastreamento(data.dados);
            } else {
                setErro(data.erro || 'Erro ao buscar rastreamento');
            }
        } catch (error) {
            console.error('Erro ao buscar rastreamento:', error);
            setErro('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    const formatarData = (dataISO) => {
        const data = new Date(dataISO);
        return data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const obterIconeStatus = (status) => {
        const icones = {
            'pendente': '⏳',
            'aguardando_pagamento': '💳',
            'pagamento_aprovado': '✅',
            'em_separacao': '📦',
            'enviado': '🚚',
            'entregue': '🎉',
            'cancelado': '❌',
            'postado': '📮',
            'em_transito': '🚛',
            'saiu_para_entrega': '🏃‍♂️'
        };
        return icones[status] || '📋';
    };

    const obterCorStatus = (status) => {
        const cores = {
            'pendente': '#ffc107',
            'aguardando_pagamento': '#fd7e14',
            'pagamento_aprovado': '#28a745',
            'em_separacao': '#17a2b8',
            'enviado': '#6f42c1',
            'entregue': '#20c997',
            'cancelado': '#dc3545',
            'postado': '#007bff',
            'em_transito': '#6610f2',
            'saiu_para_entrega': '#e83e8c'
        };
        return cores[status] || '#6c757d';
    };

    return (
        <div className="rastreamento-overlay">
            <div className="rastreamento-modal">
                <div className="rastreamento-header">
                    <h3>📦 Rastreamento do Pedido</h3>
                    <button onClick={onFechar} className="btn-fechar">✕</button>
                </div>

                <div className="rastreamento-content">
                    {loading && (
                        <div className="loading-rastreamento">
                            <div className="spinner"></div>
                            <p>Buscando informações...</p>
                        </div>
                    )}

                    {erro && (
                        <div className="erro-rastreamento">
                            <p>❌ {erro}</p>
                        </div>
                    )}

                    {/* Informações do Pedido */}
                    <div className="info-pedido">
                        <div className="info-item">
                            <strong>Pedido:</strong> #{pedidoId}
                        </div>
                        {codigoRastreamento && (
                            <div className="info-item">
                                <strong>Código de Rastreamento:</strong> 
                                <span className="codigo-rastreamento">{codigoRastreamento}</span>
                            </div>
                        )}
                        {statusAtual && (
                            <div className="info-item">
                                <strong>Status Atual:</strong>
                                <span 
                                    className="status-badge"
                                    style={{ backgroundColor: obterCorStatus(statusAtual) }}
                                >
                                    {obterIconeStatus(statusAtual)} {statusAtual.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Histórico do Pedido */}
                    {historico.length > 0 && (
                        <div className="secao-historico">
                            <h4>📋 Histórico do Pedido</h4>
                            <div className="timeline">
                                {historico.map((evento, index) => (
                                    <div key={index} className="timeline-item">
                                        <div 
                                            className="timeline-marker"
                                            style={{ backgroundColor: obterCorStatus(evento.status_novo) }}
                                        >
                                            {obterIconeStatus(evento.status_novo)}
                                        </div>
                                        <div className="timeline-content">
                                            <div className="timeline-title">
                                                {evento.status_novo_info?.nome || evento.status_novo}
                                            </div>
                                            <div className="timeline-description">
                                                {evento.status_novo_info?.descricao || 'Status atualizado'}
                                            </div>
                                            {evento.observacoes && (
                                                <div className="timeline-observacoes">
                                                    <strong>Observações:</strong> {evento.observacoes}
                                                </div>
                                            )}
                                            <div className="timeline-data">
                                                {formatarData(evento.data_alteracao)}
                                                {evento.usuario_nome && (
                                                    <span> • Por: {evento.usuario_nome}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Rastreamento dos Correios */}
                    {dadosRastreamento && (
                        <div className="secao-correios">
                            <h4>🚚 Rastreamento dos Correios</h4>
                            <div className="info-correios">
                                <div className="info-item">
                                    <strong>Código:</strong> {dadosRastreamento.codigo}
                                </div>
                                <div className="info-item">
                                    <strong>Status:</strong> {dadosRastreamento.status_atual}
                                </div>
                                <div className="info-item">
                                    <strong>Última Atualização:</strong> {formatarData(dadosRastreamento.data_ultima_atualizacao)}
                                </div>
                            </div>

                            {dadosRastreamento.eventos && dadosRastreamento.eventos.length > 0 && (
                                <div className="eventos-correios">
                                    <h5>Eventos de Rastreamento:</h5>
                                    <div className="timeline">
                                        {dadosRastreamento.eventos.map((evento, index) => (
                                            <div key={index} className="timeline-item">
                                                <div 
                                                    className="timeline-marker"
                                                    style={{ backgroundColor: obterCorStatus(evento.status) }}
                                                >
                                                    {obterIconeStatus(evento.status)}
                                                </div>
                                                <div className="timeline-content">
                                                    <div className="timeline-title">
                                                        {evento.descricao}
                                                    </div>
                                                    <div className="timeline-data">
                                                        {formatarData(evento.data)} • {evento.local}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Botões de Ação */}
                    <div className="acoes-rastreamento">
                        {codigoRastreamento && (
                            <button 
                                onClick={buscarRastreamento}
                                className="btn-atualizar"
                                disabled={loading}
                            >
                                🔄 Atualizar Rastreamento
                            </button>
                        )}
                        
                        {codigoRastreamento && (
                            <a 
                                href={`https://www.correios.com.br/enviar/precisa-de-ajuda/videotutoriais/rastreamento-de-objeto`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-correios"
                            >
                                🌐 Site dos Correios
                            </a>
                        )}
                        
                        <button onClick={onFechar} className="btn-fechar-modal">
                            Fechar
                        </button>
                    </div>

                    {/* Dicas */}
                    <div className="dicas-rastreamento">
                        <h5>💡 Dicas:</h5>
                        <ul>
                            <li>• O rastreamento é atualizado automaticamente pelos Correios</li>
                            <li>• Em caso de dúvidas, entre em contato conosco</li>
                            <li>• Objetos podem levar até 24h para aparecer no sistema</li>
                            {codigoRastreamento && (
                                <li>• Você pode rastrear também no site ou app dos Correios</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RastreamentoPedido;
