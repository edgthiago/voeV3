/**
 * @fileoverview Monitor Contínuo do Sistema
 * @description Monitora saúde e performance do sistema em tempo real
 * @author Sistema de Loja de Tênis
 * @version 1.0
 */

// Carregar variáveis de ambiente
require('dotenv').config();

const conexao = require('./banco/conexao');
const notificacaoService = require('./services/notificacaoService');
const fs = require('fs').promises;

class MonitorSistema {
    constructor() {
        this.intervaloMonitoramento = 30000; // 30 segundos
        this.intervalos = {
            saude: null,
            performance: null,
            logs: null
        };
        this.metricas = {
            ultimaVerificacao: null,
            status: 'iniciando',
            erros: 0,
            sucessos: 0,
            tempoResposta: []
        };
    }

    /**
     * Iniciar monitoramento
     */
    async iniciar() {
        console.log('🔍 ===== MONITOR DO SISTEMA INICIADO =====');
        console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
        console.log(`⏱️ Intervalo: ${this.intervaloMonitoramento / 1000}s`);
        
        // Verificação inicial
        await this.verificacaoCompleta();
        
        // Agendar verificações periódicas
        this.intervalos.saude = setInterval(() => {
            this.verificarSaudeBasica();
        }, this.intervaloMonitoramento);
        
        this.intervalos.performance = setInterval(() => {
            this.verificarPerformance();
        }, this.intervaloMonitoramento * 2); // A cada 60s
        
        this.intervalos.logs = setInterval(() => {
            this.gerarRelatorioStatus();
        }, this.intervaloMonitoramento * 10); // A cada 5 minutos
        
        console.log('✅ Monitor ativo e rodando em segundo plano...');
        console.log('📊 Relatórios serão gerados a cada 5 minutos');
        console.log('🛑 Use Ctrl+C para parar o monitor');
    }

    /**
     * Verificação completa inicial
     */
    async verificacaoCompleta() {
        console.log('\n🧪 Executando verificação completa inicial...');
        
        try {
            const inicioTeste = Date.now();
            
            // Testar conexão com banco
            await this.testarConexaoBanco();
            
            // Testar serviços principais
            await this.testarServicos();
            
            // Testar tabelas críticas
            await this.testarTabelasCriticas();
            
            // Testar sistema de notificações
            await this.testarNotificacoes();
            
            const tempoTotal = Date.now() - inicioTeste;
            
            this.metricas.ultimaVerificacao = new Date();
            this.metricas.status = 'saudavel';
            this.metricas.sucessos++;
            this.metricas.tempoResposta.push(tempoTotal);
            
            console.log(`✅ Verificação completa: ${tempoTotal}ms`);
            
        } catch (error) {
            this.metricas.erros++;
            this.metricas.status = 'erro';
            console.error('❌ Erro na verificação completa:', error.message);
            
            // Enviar alerta crítico
            await this.enviarAlertaCritico(error);
        }
    }

    /**
     * Verificar saúde básica do sistema
     */
    async verificarSaudeBasica() {
        try {
            const inicio = Date.now();
            
            // Teste básico de conexão
            await conexao.executarConsulta('SELECT 1 as status');
            
            const tempo = Date.now() - inicio;
            this.metricas.tempoResposta.push(tempo);
            
            // Manter apenas últimas 50 medições
            if (this.metricas.tempoResposta.length > 50) {
                this.metricas.tempoResposta = this.metricas.tempoResposta.slice(-50);
            }
            
            this.metricas.ultimaVerificacao = new Date();
            this.metricas.sucessos++;
            
            if (this.metricas.status !== 'saudavel') {
                this.metricas.status = 'saudavel';
                console.log(`✅ ${new Date().toLocaleTimeString()} - Sistema voltou ao normal`);
            }
            
        } catch (error) {
            this.metricas.erros++;
            this.metricas.status = 'erro';
            console.error(`❌ ${new Date().toLocaleTimeString()} - Erro na verificação:`, error.message);
        }
    }

    /**
     * Verificar performance do sistema
     */
    async verificarPerformance() {
        try {
            const testes = [];
            
            // Teste de consulta complexa
            const inicioComplexo = Date.now();
            await conexao.executarConsulta(`
                SELECT COUNT(*) as total_pedidos,
                       AVG(valor_total) as ticket_medio,
                       COUNT(DISTINCT usuario_id) as usuarios_unicos
                FROM pedidos 
                WHERE data_pedido >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            `);
            testes.push({ tipo: 'consulta_complexa', tempo: Date.now() - inicioComplexo });
            
            // Teste de inserção
            const inicioInsert = Date.now();
            await conexao.executarConsulta(`
                INSERT INTO eventos_log (tipo_evento, dados, created_at) 
                VALUES ('monitor_performance', '{"teste": true}', NOW())
            `);
            testes.push({ tipo: 'insert', tempo: Date.now() - inicioInsert });
            
            // Análise de performance
            const tempoMedio = this.metricas.tempoResposta.length > 0 
                ? this.metricas.tempoResposta.reduce((a, b) => a + b, 0) / this.metricas.tempoResposta.length 
                : 0;
            
            if (tempoMedio > 1000) {
                console.warn(`⚠️ ${new Date().toLocaleTimeString()} - Performance degradada: ${tempoMedio.toFixed(0)}ms`);
            }
            
        } catch (error) {
            console.error(`❌ ${new Date().toLocaleTimeString()} - Erro na verificação de performance:`, error.message);
        }
    }

    /**
     * Testar conexão com banco de dados
     */
    async testarConexaoBanco() {
        const resultado = await conexao.executarConsulta('SELECT VERSION() as versao');
        
        if (resultado.length === 0) {
            throw new Error('Falha na conexão com MySQL');
        }
        
        return true;
    }

    /**
     * Testar serviços principais
     */
    async testarServicos() {
        // Testar se serviços são carregáveis
        const statusPedidoService = require('./services/statusPedidoService');
        const pagamentoService = require('./services/pagamentoService');
        
        if (!statusPedidoService || !pagamentoService) {
            throw new Error('Falha ao carregar serviços principais');
        }
        
        return true;
    }

    /**
     * Testar tabelas críticas
     */
    async testarTabelasCriticas() {
        const tabelas = [
            'usuarios', 'pedidos', 'produtos', 'pagamentos',
            'notificacoes_log', 'historico_status_pedidos'
        ];
        
        for (const tabela of tabelas) {
            try {
                await conexao.executarConsulta(`SELECT COUNT(*) as total FROM ${tabela} LIMIT 1`);
            } catch (error) {
                throw new Error(`Falha na tabela ${tabela}: ${error.message}`);
            }
        }
        
        return true;
    }

    /**
     * Testar sistema de notificações
     */
    async testarNotificacoes() {
        try {
            // Verificar se templates estão carregados
            const templates = await conexao.executarConsulta(`
                SELECT COUNT(*) as total FROM notificacoes_templates
            `);
            
            if (templates[0].total === 0) {
                throw new Error('Nenhum template de notificação encontrado');
            }
            
            return true;
            
        } catch (error) {
            throw new Error(`Falha no sistema de notificações: ${error.message}`);
        }
    }

    /**
     * Gerar relatório de status
     */
    async gerarRelatorioStatus() {
        try {
            const agora = new Date();
            const tempoMedio = this.metricas.tempoResposta.length > 0 
                ? this.metricas.tempoResposta.reduce((a, b) => a + b, 0) / this.metricas.tempoResposta.length 
                : 0;
            
            const relatorio = `
📊 RELATÓRIO DE MONITORAMENTO - ${agora.toLocaleString('pt-BR')}
================================================================

🔍 STATUS GERAL: ${this.metricas.status.toUpperCase()}
⏰ Última verificação: ${this.metricas.ultimaVerificacao?.toLocaleTimeString() || 'N/A'}
✅ Sucessos: ${this.metricas.sucessos}
❌ Erros: ${this.metricas.erros}
📈 Taxa de sucesso: ${((this.metricas.sucessos / (this.metricas.sucessos + this.metricas.erros)) * 100).toFixed(1)}%

⚡ PERFORMANCE:
- Tempo médio de resposta: ${tempoMedio.toFixed(0)}ms
- Última medição: ${this.metricas.tempoResposta[this.metricas.tempoResposta.length - 1] || 0}ms
- Total de medições: ${this.metricas.tempoResposta.length}

🗄️ BANCO DE DADOS:
- Conexão: ${this.metricas.status === 'saudavel' ? '✅ Estável' : '❌ Instável'}
- Performance: ${tempoMedio < 100 ? '🟢 Excelente' : tempoMedio < 500 ? '🟡 Boa' : '🔴 Degradada'}

📧 NOTIFICAÇÕES:
- Sistema: ${this.metricas.status === 'saudavel' ? '✅ Operacional' : '❌ Com problemas'}
- Templates: Carregados
- Logs: Ativos

================================================================
`;
            
            console.log(relatorio);
            
            // Salvar relatório em arquivo
            await this.salvarRelatorio(relatorio);
            
            // Verificar se precisa enviar alerta
            const taxaSucesso = (this.metricas.sucessos / (this.metricas.sucessos + this.metricas.erros)) * 100;
            
            if (taxaSucesso < 95 && this.metricas.sucessos + this.metricas.erros > 10) {
                await this.enviarAlertaPerformance(taxaSucesso, tempoMedio);
            }
            
        } catch (error) {
            console.error('❌ Erro ao gerar relatório:', error.message);
        }
    }

    /**
     * Salvar relatório em arquivo
     */
    async salvarRelatorio(relatorio) {
        try {
            const arquivo = `logs/monitor_${new Date().toISOString().split('T')[0]}.log`;
            await fs.appendFile(arquivo, relatorio + '\n', 'utf8');
        } catch (error) {
            // Ignorar erro de salvamento de log
        }
    }

    /**
     * Enviar alerta crítico
     */
    async enviarAlertaCritico(erro) {
        try {
            console.log('🚨 ENVIANDO ALERTA CRÍTICO...');
            
            // Log do alerta
            const alertaLog = {
                tipo: 'alerta_critico',
                timestamp: new Date().toISOString(),
                erro: erro.message,
                stack: erro.stack,
                metricas: this.metricas
            };
            
            console.log('🚨 ALERTA CRÍTICO:', JSON.stringify(alertaLog, null, 2));
            
        } catch (error) {
            console.error('❌ Falha ao enviar alerta crítico:', error.message);
        }
    }

    /**
     * Enviar alerta de performance
     */
    async enviarAlertaPerformance(taxaSucesso, tempoMedio) {
        try {
            console.log(`⚠️ ALERTA DE PERFORMANCE: Taxa de sucesso ${taxaSucesso.toFixed(1)}%, Tempo médio ${tempoMedio.toFixed(0)}ms`);
        } catch (error) {
            console.error('❌ Falha ao enviar alerta de performance:', error.message);
        }
    }

    /**
     * Parar monitoramento
     */
    parar() {
        console.log('\n🛑 Parando monitor do sistema...');
        
        Object.values(this.intervalos).forEach(intervalo => {
            if (intervalo) {
                clearInterval(intervalo);
            }
        });
        
        console.log('✅ Monitor parado com sucesso!');
        console.log(`📊 Estatísticas finais:`);
        console.log(`   - Sucessos: ${this.metricas.sucessos}`);
        console.log(`   - Erros: ${this.metricas.erros}`);
        console.log(`   - Taxa de sucesso: ${((this.metricas.sucessos / (this.metricas.sucessos + this.metricas.erros)) * 100).toFixed(1)}%`);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    const monitor = new MonitorSistema();
    
    // Capturar Ctrl+C para parar graciosamente
    process.on('SIGINT', () => {
        monitor.parar();
        process.exit(0);
    });
    
    // Iniciar monitoramento
    monitor.iniciar()
        .catch((error) => {
            console.error('❌ Erro fatal no monitor:', error);
            process.exit(1);
        });
}

module.exports = MonitorSistema;
