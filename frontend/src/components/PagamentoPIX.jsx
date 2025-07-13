import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './PagamentoPIX.css';

const PagamentoPIX = ({ pedidoId, valor, onPagamentoConfirmado, onCancelar }) => {
    const [dadosPIX, setDadosPIX] = useState(null);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [statusPagamento, setStatusPagamento] = useState('pending');
    const [tempoRestante, setTempoRestante] = useState(30 * 60); // 30 minutos

    useEffect(() => {
        criarPagamentoPIX();
    }, []);

    useEffect(() => {
        if (dadosPIX && statusPagamento === 'pending') {
            const interval = setInterval(verificarStatusPagamento, 5000); // Verificar a cada 5s
            return () => clearInterval(interval);
        }
    }, [dadosPIX, statusPagamento]);

    useEffect(() => {
        if (tempoRestante > 0 && statusPagamento === 'pending') {
            const timer = setTimeout(() => setTempoRestante(tempoRestante - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [tempoRestante, statusPagamento]);

    const criarPagamentoPIX = async () => {
        setLoading(true);
        setErro('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/pagamentos/pix', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    pedido_id: pedidoId,
                    valor: valor,
                    descricao: `Pedido #${pedidoId} - Papelaria Digital`
                })
            });

            const data = await response.json();

            if (data.sucesso) {
                setDadosPIX(data.dados);
                setStatusPagamento(data.dados.status);
            } else {
                setErro(data.erro || 'Erro ao criar pagamento PIX');
            }
        } catch (error) {
            console.error('Erro ao criar PIX:', error);
            setErro('Erro de conexão. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const verificarStatusPagamento = async () => {
        if (!dadosPIX) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/pagamentos/status/${dadosPIX.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.sucesso) {
                setStatusPagamento(data.dados.status);
                
                if (data.dados.status === 'approved') {
                    onPagamentoConfirmado(data.dados);
                }
            }
        } catch (error) {
            console.error('Erro ao verificar status:', error);
        }
    };

    const copiarCodigoPIX = () => {
        if (dadosPIX?.qr_code) {
            navigator.clipboard.writeText(dadosPIX.qr_code);
            // Mostrar feedback visual
            const btn = document.querySelector('.btn-copiar-pix');
            const textoOriginal = btn.textContent;
            btn.textContent = 'Copiado!';
            btn.classList.add('copiado');
            setTimeout(() => {
                btn.textContent = textoOriginal;
                btn.classList.remove('copiado');
            }, 2000);
        }
    };

    const formatarTempo = (segundos) => {
        const minutos = Math.floor(segundos / 60);
        const secs = segundos % 60;
        return `${minutos.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatarValor = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    if (loading) {
        return (
            <div className="pagamento-pix loading">
                <div className="spinner"></div>
                <p>Gerando código PIX...</p>
            </div>
        );
    }

    if (erro) {
        return (
            <div className="pagamento-pix erro">
                <div className="erro-container">
                    <h3>❌ Erro no Pagamento</h3>
                    <p>{erro}</p>
                    <div className="acoes">
                        <button onClick={criarPagamentoPIX} className="btn-tentar-novamente">
                            Tentar Novamente
                        </button>
                        <button onClick={onCancelar} className="btn-cancelar">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (statusPagamento === 'approved') {
        return (
            <div className="pagamento-pix sucesso">
                <div className="sucesso-container">
                    <h3>✅ Pagamento Confirmado!</h3>
                    <p>Seu pagamento PIX foi aprovado com sucesso.</p>
                    <p className="valor-pago">Valor: {formatarValor(dadosPIX?.valor)}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pagamento-pix">
            <div className="pix-container">
                <div className="pix-header">
                    <h3>💳 Pagamento PIX</h3>
                    <div className="valor-pagamento">
                        {formatarValor(dadosPIX?.valor || valor)}
                    </div>
                    <div className="tempo-restante">
                        ⏰ Expira em: {formatarTempo(tempoRestante)}
                    </div>
                </div>

                <div className="pix-content">
                    <div className="qr-code-section">
                        <h4>1. Escaneie o QR Code</h4>
                        <div className="qr-code-container">
                            {dadosPIX?.qr_code_base64 ? (
                                <img 
                                    src={`data:image/png;base64,${dadosPIX.qr_code_base64}`}
                                    alt="QR Code PIX"
                                    className="qr-code-image"
                                />
                            ) : dadosPIX?.qr_code ? (
                                <QRCodeSVG 
                                    value={dadosPIX.qr_code} 
                                    size={200}
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                />
                            ) : (
                                <div className="qr-placeholder">QR Code não disponível</div>
                            )}
                        </div>
                        <p className="qr-instrucoes">
                            Abra o app do seu banco e escaneie o código acima
                        </p>
                    </div>

                    <div className="ou-divider">
                        <span>OU</span>
                    </div>

                    <div className="codigo-pix-section">
                        <h4>2. Copie o código PIX</h4>
                        <div className="codigo-pix-container">
                            <input 
                                type="text" 
                                value={dadosPIX?.qr_code || ''} 
                                readOnly
                                className="codigo-pix-input"
                            />
                            <button 
                                onClick={copiarCodigoPIX}
                                className="btn-copiar-pix"
                                disabled={!dadosPIX?.qr_code}
                            >
                                📋 Copiar
                            </button>
                        </div>
                        <p className="codigo-instrucoes">
                            Cole este código na área PIX do seu banco
                        </p>
                    </div>
                </div>

                <div className="pix-status">
                    <div className="status-indicator">
                        <div className="spinner-small"></div>
                        <span>Aguardando pagamento...</span>
                    </div>
                    <p className="status-texto">
                        Assim que você efetuar o pagamento, confirmaremos automaticamente.
                    </p>
                </div>

                <div className="pix-acoes">
                    <button onClick={verificarStatusPagamento} className="btn-verificar">
                        🔄 Verificar Pagamento
                    </button>
                    <button onClick={onCancelar} className="btn-cancelar-pix">
                        Cancelar
                    </button>
                </div>

                <div className="pix-ajuda">
                    <h5>❓ Precisa de ajuda?</h5>
                    <ul>
                        <li>• O PIX é instantâneo e funciona 24/7</li>
                        <li>• Verifique se você tem PIX habilitado no seu banco</li>
                        <li>• O código expira em 30 minutos</li>
                        <li>• Em caso de problemas, entre em contato conosco</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PagamentoPIX;
