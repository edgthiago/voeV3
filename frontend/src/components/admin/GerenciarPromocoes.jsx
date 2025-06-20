import React, { useState, useEffect } from 'react';
import { adminService, promocoesService, produtosService } from '../../services';

const GerenciarPromocoes = ({ userPermissions }) => {
    const [promocoes, setPromocoes] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errorDetail, setErrorDetail] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingPromocao, setEditingPromocao] = useState(null);
    const [filtroStatus, setFiltroStatus] = useState('all');
    const [filtroTipo, setFiltroTipo] = useState('all');

    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        tipo: 'desconto_percentual',
        valor: '',
        produto_id: '',
        codigo: '',
        data_inicio: '',
        data_fim: '',
        limite_uso: '',
        ativo: true
    });

    // Verificar permissões
    const canCreate = userPermissions?.includes('criar_promocoes') || userPermissions?.includes('admin_total');
    const canEdit = userPermissions?.includes('editar_promocoes') || userPermissions?.includes('admin_total');
    const canDelete = userPermissions?.includes('deletar_promocoes') || userPermissions?.includes('admin_total');

    useEffect(() => {
        carregarDados();
    }, []);    const carregarDados = async () => {
        try {
            setLoading(true);
            console.log('Carregando promoções e produtos...');
            
            const [promocoesData, produtosData] = await Promise.all([
                promocoesService.buscarTodas(),
                produtosService.buscarTodos()
            ]);
            
            console.log('Dados recebidos - Promoções:', promocoesData);
            console.log('Dados recebidos - Produtos:', produtosData);
            
            // Verifica se os dados vieram no formato esperado e extrai apenas o que precisamos
            const promocoesArray = promocoesData?.dados || [];
            const produtosArray = produtosData?.dados || [];
            
            setPromocoes(promocoesArray);
            setProdutos(produtosArray);
            
            if (promocoesArray.length === 0) {
                console.warn('Nenhuma promoção encontrada. Verifique se o usuário tem permissões adequadas.');
            }
            
            if (produtosArray.length === 0) {
                console.warn('Nenhum produto encontrado. Verifique se há produtos cadastrados.');
            }        } catch (err) {
            console.error('Erro ao carregar dados:', err);
            const mensagemErro = 'Erro ao carregar dados: ' + (err.message || 'Erro de comunicação com o servidor');
            setError(mensagemErro);
            setErrorDetail({
                mensagem: mensagemErro,
                permissao: mensagemErro.toLowerCase().includes('permissão') || 
                           mensagemErro.toLowerCase().includes('autorização'),
                timestamp: new Date().toISOString()
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            
            const promocaoData = {
                ...formData,
                valor: parseFloat(formData.valor),
                limite_uso: formData.limite_uso ? parseInt(formData.limite_uso) : null,
                produto_id: formData.produto_id || null
            };            if (editingPromocao) {
                await promocoesService.atualizar(editingPromocao.id, promocaoData);
            } else {
                await promocoesService.criar(promocaoData);
            }

            await carregarDados();
            resetForm();
            setShowModal(false);
        } catch (err) {
            setError('Erro ao salvar promoção: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (promocao) => {
        setEditingPromocao(promocao);
        setFormData({
            nome: promocao.nome,
            descricao: promocao.descricao || '',
            tipo: promocao.tipo,
            valor: promocao.valor.toString(),
            produto_id: promocao.produto_id || '',
            codigo: promocao.codigo || '',
            data_inicio: promocao.data_inicio ? promocao.data_inicio.split('T')[0] : '',
            data_fim: promocao.data_fim ? promocao.data_fim.split('T')[0] : '',
            limite_uso: promocao.limite_uso || '',
            ativo: promocao.ativo
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta promoção?')) return;
        
        try {
            setLoading(true);
            await promocoesService.deletar(id);
            await carregarDados();
        } catch (err) {
            setError('Erro ao excluir promoção: ' + err.message);
        } finally {
            setLoading(false);
        }
    };    const toggleStatus = async (id, novoStatus) => {
        try {
            await promocoesService.alterarStatus(id, novoStatus);
            await carregarDados();
        } catch (err) {
            console.error('Erro ao atualizar status:', err);
            setError('Erro ao atualizar status: ' + (err.message || 'Erro de comunicação com o servidor'));
        }
    };

    const resetForm = () => {
        setFormData({
            nome: '',
            descricao: '',
            tipo: 'desconto_percentual',
            valor: '',
            produto_id: '',
            codigo: '',
            data_inicio: '',
            data_fim: '',
            limite_uso: '',
            ativo: true
        });
        setEditingPromocao(null);
    };

    const promocoesFiltradas = promocoes.filter(promocao => {
        if (filtroStatus !== 'all' && promocao.ativo.toString() !== filtroStatus) return false;
        if (filtroTipo !== 'all' && promocao.tipo !== filtroTipo) return false;
        return true;
    });

    const formatarValor = (tipo, valor) => {
        switch (tipo) {
            case 'desconto_percentual':
                return `${valor}%`;
            case 'desconto_fixo':
                return `R$ ${valor.toFixed(2)}`;
            case 'frete_gratis':
                return 'Frete Grátis';
            default:
                return valor;
        }
    };

    const obterStatusPromocao = (promocao) => {
        const agora = new Date();
        const inicio = new Date(promocao.data_inicio);
        const fim = new Date(promocao.data_fim);

        if (!promocao.ativo) return { status: 'inativa', label: 'Inativa', class: 'status-inactive' };
        if (agora < inicio) return { status: 'agendada', label: 'Agendada', class: 'status-scheduled' };
        if (agora > fim) return { status: 'expirada', label: 'Expirada', class: 'status-expired' };
        return { status: 'ativa', label: 'Ativa', class: 'status-active' };
    };    if (loading && promocoes.length === 0) {
        return <div className="loading">Carregando promoções...</div>;
    }
    
    // Verifica se o usuário não tem permissão para acessar promoções
    const permissaoInsuficiente = error && error.includes("não tem permissão");
    if (permissaoInsuficiente) {
        return (
            <div className="error-container">
                <h2>Acesso Restrito</h2>
                <p>Você não possui permissão para visualizar ou gerenciar promoções.</p>
                <p>Entre em contato com um administrador para solicitar acesso.</p>
            </div>
        );
    }

    return (
        <div className="gerenciar-promocoes">
            <div className="page-header">
                <h2>Gerenciar Promoções</h2>
                {canCreate && (
                    <button 
                        className="btn btn-primary"
                        onClick={() => setShowModal(true)}
                    >
                        Nova Promoção
                    </button>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Filtros */}
            <div className="filters-section">
                <div className="filter-group">
                    <label>Status:</label>
                    <select 
                        value={filtroStatus} 
                        onChange={(e) => setFiltroStatus(e.target.value)}
                    >
                        <option value="all">Todos</option>
                        <option value="true">Ativas</option>
                        <option value="false">Inativas</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Tipo:</label>
                    <select 
                        value={filtroTipo} 
                        onChange={(e) => setFiltroTipo(e.target.value)}
                    >
                        <option value="all">Todos</option>
                        <option value="desconto_percentual">Desconto %</option>
                        <option value="desconto_fixo">Desconto Fixo</option>
                        <option value="frete_gratis">Frete Grátis</option>
                    </select>
                </div>
            </div>

            {/* Lista de Promoções */}
            <div className="promocoes-grid">
                {promocoesFiltradas.map(promocao => {
                    const statusInfo = obterStatusPromocao(promocao);
                    const produto = produtos.find(p => p.id === promocao.produto_id);
                    
                    return (
                        <div key={promocao.id} className="promocao-card">
                            <div className="promocao-header">
                                <h3>{promocao.nome}</h3>
                                <span className={`status-badge ${statusInfo.class}`}>
                                    {statusInfo.label}
                                </span>
                            </div>

                            <div className="promocao-info">
                                <p className="descricao">{promocao.descricao}</p>
                                <div className="promocao-details">
                                    <div className="detail-item">
                                        <strong>Valor:</strong> {formatarValor(promocao.tipo, promocao.valor)}
                                    </div>
                                    {promocao.codigo && (
                                        <div className="detail-item">
                                            <strong>Código:</strong> {promocao.codigo}
                                        </div>
                                    )}
                                    {produto && (
                                        <div className="detail-item">
                                            <strong>Produto:</strong> {produto.nome}
                                        </div>
                                    )}
                                    <div className="detail-item">
                                        <strong>Período:</strong> 
                                        {new Date(promocao.data_inicio).toLocaleDateString()} - 
                                        {new Date(promocao.data_fim).toLocaleDateString()}
                                    </div>
                                    {promocao.limite_uso && (
                                        <div className="detail-item">
                                            <strong>Usos:</strong> {promocao.usos_realizados || 0}/{promocao.limite_uso}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="promocao-actions">
                                {canEdit && (
                                    <button 
                                        className="btn btn-secondary"
                                        onClick={() => handleEdit(promocao)}
                                    >
                                        Editar
                                    </button>
                                )}
                                {canEdit && (
                                    <button 
                                        className={`btn ${promocao.ativo ? 'btn-warning' : 'btn-success'}`}
                                        onClick={() => toggleStatus(promocao.id, !promocao.ativo)}
                                    >
                                        {promocao.ativo ? 'Desativar' : 'Ativar'}
                                    </button>
                                )}
                                {canDelete && (
                                    <button 
                                        className="btn btn-danger"
                                        onClick={() => handleDelete(promocao.id)}
                                    >
                                        Excluir
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {promocoesFiltradas.length === 0 && (
                <div className="empty-state">
                    <div className="no-data-message">
                        <p>Nenhuma promoção encontrada.</p>
                        {canCreate && (
                            <p>Clique em "Nova Promoção" para criar a primeira promoção.</p>
                        )}
                        {!canCreate && (
                            <p>Você não possui permissão para criar promoções. Entre em contato com um administrador.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de Criação/Edição */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingPromocao ? 'Editar Promoção' : 'Nova Promoção'}</h3>
                            <button 
                                className="modal-close"
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Nome da Promoção:</label>
                                <input
                                    type="text"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Descrição:</label>
                                <textarea
                                    value={formData.descricao}
                                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                                    rows="3"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tipo:</label>
                                    <select
                                        value={formData.tipo}
                                        onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                                        required
                                    >
                                        <option value="desconto_percentual">Desconto Percentual</option>
                                        <option value="desconto_fixo">Desconto Fixo</option>
                                        <option value="frete_gratis">Frete Grátis</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Valor:</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.valor}
                                        onChange={(e) => setFormData({...formData, valor: e.target.value})}
                                        required={formData.tipo !== 'frete_gratis'}
                                        disabled={formData.tipo === 'frete_gratis'}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Produto (opcional):</label>
                                    <select
                                        value={formData.produto_id}
                                        onChange={(e) => setFormData({...formData, produto_id: e.target.value})}
                                    >
                                        <option value="">Todos os produtos</option>
                                        {produtos.map(produto => (
                                            <option key={produto.id} value={produto.id}>
                                                {produto.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Código (opcional):</label>
                                    <input
                                        type="text"
                                        value={formData.codigo}
                                        onChange={(e) => setFormData({...formData, codigo: e.target.value.toUpperCase()})}
                                        placeholder="Ex: DESCONTO10"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Data Início:</label>
                                    <input
                                        type="date"
                                        value={formData.data_inicio}
                                        onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Data Fim:</label>
                                    <input
                                        type="date"
                                        value={formData.data_fim}
                                        onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Limite de Uso (opcional):</label>
                                <input
                                    type="number"
                                    value={formData.limite_uso}
                                    onChange={(e) => setFormData({...formData, limite_uso: e.target.value})}
                                    placeholder="Deixe vazio para uso ilimitado"
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.ativo}
                                        onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                                    />
                                    Promoção ativa
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Salvando...' : (editingPromocao ? 'Atualizar' : 'Criar')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GerenciarPromocoes;
