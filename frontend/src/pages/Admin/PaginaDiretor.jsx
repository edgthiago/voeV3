import React, { useState } from 'react';
import ProtecaoRota from '../../components/common/ProtecaoRota';
import DashboardMonitoramento from '../../components/monitoring/DashboardMonitoramento';
import MetricasTempoReal from '../../components/monitoring/MetricasTempoReal';
import ControleServicos from '../../components/monitoring/ControleServicos';

const DashboardDiretor = () => {
  const [activeView, setActiveView] = useState('dashboard');

  const renderContent = () => {
    switch (activeView) {
      case 'monitoring':
        return <DashboardMonitoramento />;
      case 'realtime':
        return <MetricasTempoReal />;
      case 'services':
        return <ControleServicos />;
      default:
        return renderDashboardContent();
    }
  };

  const renderDashboardContent = () => {
    return (
      <div className="row g-4">
        {/* Configurações do Sistema */}
        <div className="col-xl-4 col-md-6">
          <div className="card h-100 border-primary">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-gear-fill me-2"></i>Configurações do Sistema
              </h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <button 
                  className="list-group-item list-group-item-action"
                  onClick={() => setActiveView('monitoring')}
                >
                  <i className="bi bi-bar-chart-line me-2"></i>Dashboard de Monitoramento
                </button>
                <button 
                  className="list-group-item list-group-item-action"
                  onClick={() => setActiveView('realtime')}
                >
                  <i className="bi bi-activity me-2"></i>Métricas em Tempo Real
                </button>
                <button 
                  className="list-group-item list-group-item-action"
                  onClick={() => setActiveView('services')}
                >
                  <i className="bi bi-gear me-2"></i>Controle de Serviços
                </button>
                <button className="list-group-item list-group-item-action">
                  <i className="bi bi-shield-check me-2"></i>Configurações de Segurança
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas Rápidas */}
        <div className="col-xl-8 col-md-6">
          <div className="card h-100 border-success">
            <div className="card-header bg-success text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-graph-up me-2"></i>Visão Geral do Sistema
              </h5>
            </div>
            <div className="card-body">
              <MetricasTempoReal />
            </div>
          </div>
        </div>

        {/* Relatórios Financeiros */}
        <div className="col-xl-4 col-md-6">
          <div className="card h-100 border-info">
            <div className="card-header bg-info text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-graph-up me-2"></i>Relatórios Financeiros
              </h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <button className="list-group-item list-group-item-action">
                  <i className="bi bi-currency-dollar me-2"></i>Vendas por Período
                </button>
                <button className="list-group-item list-group-item-action">
                  <i className="bi bi-pie-chart me-2"></i>Lucro/Prejuízo
                </button>
                <button className="list-group-item list-group-item-action">
                  <i className="bi bi-receipt me-2"></i>Fluxo de Caixa
                </button>
                <button className="list-group-item list-group-item-action">
                  <i className="bi bi-bar-chart me-2"></i>ROI por Categoria
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gestão de Usuários */}
        <div className="col-xl-4 col-md-6">
          <div className="card h-100 border-warning">
            <div className="card-header bg-warning text-dark">
              <h5 className="card-title mb-0">
                <i className="bi bi-people-fill me-2"></i>Gestão de Usuários
              </h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <button className="list-group-item list-group-item-action">
                  <i className="bi bi-person-plus me-2"></i>Criar Usuários
                </button>
                <button className="list-group-item list-group-item-action">
                  <i className="bi bi-person-gear me-2"></i>Gerenciar Permissões
                </button>
                <button className="list-group-item list-group-item-action">
                  <i className="bi bi-shield-exclamation me-2"></i>Auditoria de Acesso
                </button>
                <button className="list-group-item list-group-item-action">
                  <i className="bi bi-person-x me-2"></i>Usuários Bloqueados
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Avançados */}
        <div className="col-xl-4 col-md-6">
          <div className="card h-100 border-danger">
            <div className="card-header bg-danger text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-graph-down me-2"></i>Analytics Avançados
              </h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <button className="list-group-item list-group-item-action">
                  <i className="bi bi-people me-2"></i>Análise de Usuários
                </button>
                <button className="list-group-item list-group-item-action">
                  <i className="bi bi-graph-up-arrow me-2"></i>Tendências de Vendas
                </button>
                <button className="list-group-item list-group-item-action">
                  <i className="bi bi-pie-chart-fill me-2"></i>Segmentação de Clientes
                </button>
                <button className="list-group-item list-group-item-action">
                  <i className="bi bi-bar-chart-steps me-2"></i>Funil de Conversão
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo Executivo */}
        <div className="col-12">
          <div className="card border-secondary">
            <div className="card-header bg-secondary text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-speedometer2 me-2"></i>Resumo Executivo
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-md-3">
                  <div className="bg-primary bg-opacity-10 p-3 rounded text-center">
                    <h3 className="text-primary mb-1">R$ 145.690</h3>
                    <small className="text-muted">Receita Total (Mês)</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="bg-success bg-opacity-10 p-3 rounded text-center">
                    <h3 className="text-success mb-1">2.847</h3>
                    <small className="text-muted">Pedidos Concluídos</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="bg-warning bg-opacity-10 p-3 rounded text-center">
                    <h3 className="text-warning mb-1">156</h3>
                    <small className="text-muted">Usuários Ativos</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="bg-info bg-opacity-10 p-3 rounded text-center">
                    <h3 className="text-info mb-1">23%</h3>
                    <small className="text-muted">Crescimento</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2><i className="bi bi-shield-crown text-primary"></i> Painel do Diretor</h2>
            <div>
              <button 
                className={`btn btn-sm me-2 ${activeView === 'dashboard' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveView('dashboard')}
              >
                <i className="bi bi-speedometer2 me-1"></i>Dashboard
              </button>
              <button 
                className={`btn btn-sm me-2 ${activeView === 'monitoring' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveView('monitoring')}
              >
                <i className="bi bi-bar-chart-line me-1"></i>Monitoramento
              </button>
              <button 
                className={`btn btn-sm me-2 ${activeView === 'realtime' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveView('realtime')}
              >
                <i className="bi bi-activity me-1"></i>Tempo Real
              </button>
              <button 
                className={`btn btn-sm ${activeView === 'services' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveView('services')}
              >
                <i className="bi bi-gear me-1"></i>Serviços
              </button>
            </div>
          </div>
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

const PaginaDiretor = () => {
  return (
    <ProtecaoRota tipoUsuarioMinimo="diretor">
      <DashboardDiretor />
    </ProtecaoRota>
  );
};

export default PaginaDiretor;
