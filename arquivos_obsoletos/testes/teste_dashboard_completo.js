/**
 * 🧪 TESTE AUTOMATIZADO COMPLETO - DASHBOARD VISUAL DE MONITORAMENTO
 * Data: 07 de Julho de 2025
 * Objetivo: Validar integração completa frontend-backend, componentes React, APIs REST
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configurações do teste
const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_COMPONENTS_PATH = path.join(__dirname, '../frontend/src/components');
const TIMEOUT = 5000;

// Cores para output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Função para log colorido
const log = (message, color = 'reset') => {
    console.log(colors[color] + message + colors.reset);
};

// Função para testar APIs
const testarAPI = async (url, descricao) => {
    try {
        log(`🧪 Testando: ${descricao}`, 'cyan');
        const response = await axios.get(url, { timeout: TIMEOUT });
        
        if (response.status === 200 && (response.data.success || response.data.sucesso)) {
            log(`✅ ${descricao} - SUCESSO`, 'green');
            return { success: true, data: response.data };
        } else {
            log(`❌ ${descricao} - FALHA: Status ${response.status}`, 'red');
            return { success: false, error: `Status ${response.status}` };
        }
    } catch (error) {
        log(`❌ ${descricao} - ERRO: ${error.message}`, 'red');
        return { success: false, error: error.message };
    }
};

// Função para verificar arquivos
const verificarArquivo = (caminho, descricao) => {
    try {
        log(`📁 Verificando: ${descricao}`, 'cyan');
        if (fs.existsSync(caminho)) {
            log(`✅ ${descricao} - EXISTE`, 'green');
            return { success: true, path: caminho };
        } else {
            log(`❌ ${descricao} - NÃO ENCONTRADO`, 'red');
            return { success: false, error: 'Arquivo não encontrado' };
        }
    } catch (error) {
        log(`❌ ${descricao} - ERRO: ${error.message}`, 'red');
        return { success: false, error: error.message };
    }
};

// Função para análise de componente React
const analisarComponente = (caminho, descricao) => {
    try {
        log(`⚛️ Analisando: ${descricao}`, 'cyan');
        const conteudo = fs.readFileSync(caminho, 'utf8');
        
        const checks = {
            imports: conteudo.includes('import'),
            react: conteudo.includes('React'),
            export: conteudo.includes('export'),
            jsx: conteudo.includes('return ('),
            hooks: conteudo.includes('useState') || conteudo.includes('useEffect'),
            monitoring: conteudo.includes('monitoring') || conteudo.includes('Monitoring'),
            api: conteudo.includes('axios') || conteudo.includes('fetch')
        };
        
        const score = Object.values(checks).filter(Boolean).length;
        const maxScore = Object.keys(checks).length;
        
        if (score >= maxScore * 0.7) {
            log(`✅ ${descricao} - VÁLIDO (${score}/${maxScore})`, 'green');
            return { success: true, score, maxScore, checks };
        } else {
            log(`⚠️ ${descricao} - ATENÇÃO (${score}/${maxScore})`, 'yellow');
            return { success: false, score, maxScore, checks };
        }
    } catch (error) {
        log(`❌ ${descricao} - ERRO: ${error.message}`, 'red');
        return { success: false, error: error.message };
    }
};

// Função principal de teste
const executarTeste = async () => {
    log('\n🚀 ===== TESTE AUTOMATIZADO - DASHBOARD VISUAL DE MONITORAMENTO =====', 'bright');
    log('Data: ' + new Date().toISOString(), 'blue');
    log('Objetivo: Validar integração completa frontend-backend\n', 'blue');
    
    const resultados = {
        apis: [],
        componentes: [],
        arquivos: [],
        erros: [],
        sucessos: 0,
        total: 0
    };
    
    // 1. TESTAR APIs DE MONITORAMENTO
    log('\n📊 === TESTANDO APIs DE MONITORAMENTO ===', 'magenta');
    
    const apisParaTestar = [
        { url: `${BACKEND_URL}/api/health`, desc: 'API de Saúde' },
        { url: `${BACKEND_URL}/api/monitoring/status`, desc: 'Status do Sistema' },
        { url: `${BACKEND_URL}/api/monitoring/metrics`, desc: 'Métricas do Sistema' },
        { url: `${BACKEND_URL}/api/monitoring/alerts`, desc: 'Alertas do Sistema' },
        { url: `${BACKEND_URL}/api/monitoring/logs`, desc: 'Logs do Sistema' }
    ];
    
    for (const api of apisParaTestar) {
        const resultado = await testarAPI(api.url, api.desc);
        resultados.apis.push({ ...api, resultado });
        resultados.total++;
        if (resultado.success) resultados.sucessos++;
    }
    
    // 2. VERIFICAR COMPONENTES REACT
    log('\n⚛️ === VERIFICANDO COMPONENTES REACT ===', 'magenta');
    
    const componentesParaVerificar = [
        { path: path.join(FRONTEND_COMPONENTS_PATH, 'monitoring/DashboardMonitoramento.jsx'), desc: 'Dashboard de Monitoramento' },
        { path: path.join(FRONTEND_COMPONENTS_PATH, 'monitoring/MetricasTempoReal.jsx'), desc: 'Métricas em Tempo Real' },
        { path: path.join(FRONTEND_COMPONENTS_PATH, 'monitoring/ControleServicos.jsx'), desc: 'Controle de Serviços' },
        { path: path.join(FRONTEND_COMPONENTS_PATH, 'TesteDashboard.jsx'), desc: 'Teste de Dashboard' }
    ];
    
    for (const comp of componentesParaVerificar) {
        const existe = verificarArquivo(comp.path, comp.desc);
        resultados.total++;
        if (existe.success) {
            resultados.sucessos++;
            const analise = analisarComponente(comp.path, comp.desc + ' (Análise)');
            resultados.componentes.push({ ...comp, existe, analise });
            resultados.total++;
            if (analise.success) resultados.sucessos++;
        } else {
            resultados.componentes.push({ ...comp, existe });
        }
    }
    
    // 3. VERIFICAR ARQUIVOS CRÍTICOS
    log('\n📁 === VERIFICANDO ARQUIVOS CRÍTICOS ===', 'magenta');
    
    const arquivosCriticos = [
        { path: path.join(__dirname, '../frontend/src/services/monitoringService.js'), desc: 'Serviço de Monitoramento' },
        { path: path.join(__dirname, '../frontend/src/styles/monitoring.css'), desc: 'Estilos de Monitoramento' },
        { path: path.join(__dirname, '../frontend/src/pages/Admin/PaginaDiretor.jsx'), desc: 'Página do Diretor' },
        { path: path.join(__dirname, 'servidor_monitoramento.js'), desc: 'Servidor de Monitoramento' }
    ];
    
    for (const arquivo of arquivosCriticos) {
        const resultado = verificarArquivo(arquivo.path, arquivo.desc);
        resultados.arquivos.push({ ...arquivo, resultado });
        resultados.total++;
        if (resultado.success) resultados.sucessos++;
    }
    
    // 4. TESTE DE INTEGRAÇÃO COMPLETA
    log('\n🔗 === TESTE DE INTEGRAÇÃO COMPLETA ===', 'magenta');
    
    try {
        log('🧪 Testando sequência completa de APIs...', 'cyan');
        
        // Testar sequência de chamadas
        const status = await axios.get(`${BACKEND_URL}/api/monitoring/status`);
        const metrics = await axios.get(`${BACKEND_URL}/api/monitoring/metrics`);
        const alerts = await axios.get(`${BACKEND_URL}/api/monitoring/alerts`);
        const logs = await axios.get(`${BACKEND_URL}/api/monitoring/logs`);
        
        if (status.data.success && metrics.data.success && alerts.data.success && logs.data.success) {
            log('✅ Integração completa - SUCESSO', 'green');
            resultados.sucessos++;
        } else {
            log('❌ Integração completa - FALHA', 'red');
            resultados.erros.push('Falha na integração completa');
        }
        
        resultados.total++;
    } catch (error) {
        log(`❌ Integração completa - ERRO: ${error.message}`, 'red');
        resultados.erros.push(`Erro na integração: ${error.message}`);
        resultados.total++;
    }
    
    // 5. RELATÓRIO FINAL
    log('\n📋 === RELATÓRIO FINAL ===', 'magenta');
    
    const porcentagemSucesso = Math.round((resultados.sucessos / resultados.total) * 100);
    
    log(`📊 Sucessos: ${resultados.sucessos}/${resultados.total} (${porcentagemSucesso}%)`, 'blue');
    
    if (porcentagemSucesso >= 90) {
        log('🎉 RESULTADO: EXCELENTE - Dashboard pronto para produção!', 'green');
    } else if (porcentagemSucesso >= 70) {
        log('👍 RESULTADO: BOM - Alguns ajustes necessários', 'yellow');
    } else {
        log('⚠️ RESULTADO: REQUER ATENÇÃO - Várias correções necessárias', 'red');
    }
    
    // Log detalhado dos erros
    if (resultados.erros.length > 0) {
        log('\n❌ ERROS ENCONTRADOS:', 'red');
        resultados.erros.forEach((erro, index) => {
            log(`${index + 1}. ${erro}`, 'red');
        });
    }
    
    // Gerar relatório JSON
    const relatorio = {
        timestamp: new Date().toISOString(),
        resumo: {
            total: resultados.total,
            sucessos: resultados.sucessos,
            falhas: resultados.total - resultados.sucessos,
            porcentagem: porcentagemSucesso
        },
        detalhes: resultados
    };
    
    const nomeRelatorio = `teste_dashboard_monitoramento_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(nomeRelatorio, JSON.stringify(relatorio, null, 2));
    
    log(`\n📄 Relatório salvo em: ${nomeRelatorio}`, 'cyan');
    log('\n✅ Teste completo finalizado!\n', 'bright');
    
    return relatorio;
};

// Executar teste se chamado diretamente
if (require.main === module) {
    executarTeste().catch(error => {
        console.error('❌ Erro durante execução do teste:', error);
        process.exit(1);
    });
}

module.exports = { executarTeste };
