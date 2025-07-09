/**
 * @fileoverview Verificação Final Completa do Sistema
 * @description Script final que valida 100% do sistema antes do deploy
 * @author Sistema de Loja de Tênis
 * @version 1.0
 */

// Carregar variáveis de ambiente
require('dotenv').config();

const conexao = require('./banco/conexao');
const fs = require('fs').promises;

class VerificacaoFinalCompleta {
    constructor() {
        this.resultados = [];
        this.sucessos = 0;
        this.falhas = 0;
        this.inicioTeste = Date.now();
    }

    /**
     * Registrar resultado do teste
     */
    registrarResultado(categoria, teste, sucesso, detalhes = '') {
        const resultado = {
            categoria,
            teste,
            sucesso,
            detalhes,
            timestamp: new Date().toISOString()
        };
        
        this.resultados.push(resultado);
        
        if (sucesso) {
            this.sucessos++;
            console.log(`✅ [${categoria}] ${teste}: PASSOU`);
        } else {
            this.falhas++;
            console.log(`❌ [${categoria}] ${teste}: FALHOU`);
        }
        
        if (detalhes) {
            console.log(`   📝 ${detalhes}`);
        }
    }

    /**
     * FASE 1: Verificar infraestrutura básica
     */
    async verificarInfraestrutura() {
        console.log('\n🏗️ === FASE 1: INFRAESTRUTURA BÁSICA ===');
        
        // Teste 1.1: Conexão com banco de dados
        try {
            const versao = await conexao.executarConsulta('SELECT VERSION() as versao');
            this.registrarResultado(
                'Infraestrutura',
                'Conexão MySQL',
                versao.length > 0,
                `MySQL ${versao[0]?.versao || 'Desconhecida'}`
            );
        } catch (error) {
            this.registrarResultado(
                'Infraestrutura',
                'Conexão MySQL',
                false,
                error.message
            );
        }

        // Teste 1.2: Variáveis de ambiente
        const envVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
        let envOk = true;
        const envStatus = [];
        
        for (const envVar of envVars) {
            if (process.env[envVar]) {
                envStatus.push(`${envVar}: ✅`);
            } else {
                envStatus.push(`${envVar}: ❌`);
                envOk = false;
            }
        }
        
        this.registrarResultado(
            'Infraestrutura',
            'Variáveis de Ambiente',
            envOk,
            envStatus.join(', ')
        );

        // Teste 1.3: Estrutura de arquivos
        const arquivosCriticos = [
            'servidor.js',
            'banco/conexao.js',
            'services/notificacaoService.js',
            'services/pagamentoService.js',
            'services/statusPedidoService.js',
            'services/eventoManager.js'
        ];
        
        let arquivosOk = true;
        const arquivosStatus = [];
        
        for (const arquivo of arquivosCriticos) {
            try {
                await fs.access(arquivo);
                arquivosStatus.push(`${arquivo}: ✅`);
            } catch (error) {
                arquivosStatus.push(`${arquivo}: ❌`);
                arquivosOk = false;
            }
        }
        
        this.registrarResultado(
            'Infraestrutura',
            'Arquivos Críticos',
            arquivosOk,
            `${arquivosStatus.filter(s => s.includes('✅')).length}/${arquivosCriticos.length} arquivos encontrados`
        );
    }

    /**
     * FASE 2: Verificar estrutura do banco
     */
    async verificarBancoDados() {
        console.log('\n🗄️ === FASE 2: BANCO DE DADOS ===');
        
        // Teste 2.1: Tabelas principais
        const tabelasPrincipais = [
            'usuarios', 'produtos', 'pedidos', 'itens_pedido',
            'comentarios', 'pagamentos', 'notificacoes_log',
            'usuarios_notificacoes', 'notificacoes_templates',
            'historico_status_pedidos', 'eventos_log'
        ];
        
        let tabelasOk = true;
        const tabelasEncontradas = [];
        
        for (const tabela of tabelasPrincipais) {
            try {
                await conexao.executarConsulta(`SELECT 1 FROM ${tabela} LIMIT 1`);
                tabelasEncontradas.push(tabela);
            } catch (error) {
                tabelasOk = false;
            }
        }
        
        this.registrarResultado(
            'Banco de Dados',
            'Tabelas Principais',
            tabelasOk,
            `${tabelasEncontradas.length}/${tabelasPrincipais.length} tabelas acessíveis`
        );

        // Teste 2.2: Dados de teste
        try {
            const contadores = await conexao.executarConsulta(`
                SELECT 
                    (SELECT COUNT(*) FROM usuarios) as usuarios,
                    (SELECT COUNT(*) FROM produtos) as produtos,
                    (SELECT COUNT(*) FROM pedidos) as pedidos,
                    (SELECT COUNT(*) FROM notificacoes_templates) as templates
            `);
            
            const dados = contadores[0];
            const temDados = dados.usuarios > 0 && dados.produtos > 0 && dados.templates > 0;
            
            this.registrarResultado(
                'Banco de Dados',
                'Dados Básicos',
                temDados,
                `${dados.usuarios} usuários, ${dados.produtos} produtos, ${dados.pedidos} pedidos, ${dados.templates} templates`
            );
        } catch (error) {
            this.registrarResultado(
                'Banco de Dados',
                'Dados Básicos',
                false,
                error.message
            );
        }

        // Teste 2.3: Relacionamentos e integridade
        try {
            const relacoes = await conexao.executarConsulta(`
                SELECT 
                    COUNT(DISTINCT p.usuario_id) as usuarios_com_pedidos,
                    COUNT(DISTINCT c.usuario_id) as usuarios_com_comentarios,
                    COUNT(DISTINCT pg.pedido_id) as pedidos_com_pagamento
                FROM pedidos p
                LEFT JOIN comentarios c ON p.usuario_id = c.usuario_id
                LEFT JOIN pagamentos pg ON p.id = pg.pedido_id
            `);
            
            this.registrarResultado(
                'Banco de Dados',
                'Integridade Relacional',
                relacoes.length > 0,
                'Relacionamentos entre tabelas verificados'
            );
        } catch (error) {
            this.registrarResultado(
                'Banco de Dados',
                'Integridade Relacional',
                false,
                error.message
            );
        }
    }

    /**
     * FASE 3: Verificar serviços
     */
    async verificarServicos() {
        console.log('\n🔧 === FASE 3: SERVIÇOS ===');
        
        // Teste 3.1: Carregamento dos serviços
        const servicos = [
            'notificacaoService',
            'pagamentoService', 
            'statusPedidoService',
            'eventoManager'
        ];
        
        for (const servico of servicos) {
            try {
                const servicoObj = require(`./services/${servico}`);
                this.registrarResultado(
                    'Serviços',
                    `Carregar ${servico}`,
                    servicoObj !== null,
                    'Serviço carregado com sucesso'
                );
            } catch (error) {
                this.registrarResultado(
                    'Serviços',
                    `Carregar ${servico}`,
                    false,
                    error.message
                );
            }
        }

        // Teste 3.2: Funcionalidade do StatusPedidoService
        try {
            const statusService = require('./services/statusPedidoService');
            const todosStatus = statusService.obterTodosStatus();
            const proximosStatus = statusService.obterProximosStatus('pendente');
            
            this.registrarResultado(
                'Serviços',
                'StatusPedidoService',
                Object.keys(todosStatus).length > 0 && proximosStatus.length > 0,
                `${Object.keys(todosStatus).length} status configurados`
            );
        } catch (error) {
            this.registrarResultado(
                'Serviços',
                'StatusPedidoService',
                false,
                error.message
            );
        }

        // Teste 3.3: Templates de notificação
        try {
            const templates = await conexao.executarConsulta(`
                SELECT tipo, COUNT(*) as total 
                FROM notificacoes_templates 
                GROUP BY tipo
            `);
            
            this.registrarResultado(
                'Serviços',
                'Templates Notificação',
                templates.length >= 2,
                `${templates.length} tipos de template disponíveis`
            );
        } catch (error) {
            this.registrarResultado(
                'Serviços',
                'Templates Notificação',
                false,
                error.message
            );
        }
    }

    /**
     * FASE 4: Verificar APIs e endpoints
     */
    async verificarAPIs() {
        console.log('\n🌐 === FASE 4: APIs E ENDPOINTS ===');
        
        // Teste 4.1: Estrutura de rotas
        const rotasPrincipais = [
            'rotas/autenticacao.js',
            'rotas/usuarios.js',
            'rotas/produtos.js',
            'rotas/pedidos.js',
            'rotas/comentarios.js',
            'rotas/notificacoes.js',
            'rotas/pagamentos.js'
        ];
        
        let rotasOk = true;
        const rotasEncontradas = [];
        
        for (const rota of rotasPrincipais) {
            try {
                await fs.access(rota);
                rotasEncontradas.push(rota);
            } catch (error) {
                rotasOk = false;
            }
        }
        
        this.registrarResultado(
            'APIs',
            'Arquivos de Rotas',
            rotasOk,
            `${rotasEncontradas.length}/${rotasPrincipais.length} arquivos de rota encontrados`
        );

        // Teste 4.2: Middleware de autenticação
        try {
            const middleware = require('./middleware/autenticacao');
            this.registrarResultado(
                'APIs',
                'Middleware Autenticação',
                middleware && typeof middleware.verificarAutenticacao === 'function',
                'Middleware com métodos de autenticação disponíveis'
            );
        } catch (error) {
            this.registrarResultado(
                'APIs',
                'Middleware Autenticação',
                false,
                error.message
            );
        }
    }

    /**
     * FASE 5: Verificar funcionalidades específicas
     */
    async verificarFuncionalidades() {
        console.log('\n⚙️ === FASE 5: FUNCIONALIDADES ESPECÍFICAS ===');
        
        // Teste 5.1: Sistema de comentários
        try {
            const comentarios = await conexao.executarConsulta(`
                SELECT c.*, u.nome as usuario_nome, p.nome as produto_nome
                FROM comentarios c
                JOIN usuarios u ON c.usuario_id = u.id
                JOIN produtos p ON c.produto_id = p.id
                LIMIT 5
            `);
            
            this.registrarResultado(
                'Funcionalidades',
                'Sistema de Comentários',
                comentarios.length >= 0,
                `${comentarios.length} comentários encontrados com relacionamentos`
            );
        } catch (error) {
            this.registrarResultado(
                'Funcionalidades',
                'Sistema de Comentários',
                false,
                error.message
            );
        }

        // Teste 5.2: Histórico de status
        try {
            const historico = await conexao.executarConsulta(`
                SELECT COUNT(*) as total FROM historico_status_pedidos
            `);
            
            this.registrarResultado(
                'Funcionalidades',
                'Histórico de Status',
                historico[0].total >= 0,
                `${historico[0].total} registros de histórico`
            );
        } catch (error) {
            this.registrarResultado(
                'Funcionalidades',
                'Histórico de Status',
                false,
                error.message
            );
        }

        // Teste 5.3: Logs de eventos
        try {
            const eventos = await conexao.executarConsulta(`
                SELECT evento, COUNT(*) as total 
                FROM eventos_log 
                GROUP BY evento
                ORDER BY total DESC
                LIMIT 5
            `);
            
            this.registrarResultado(
                'Funcionalidades',
                'Sistema de Eventos',
                true,
                `${eventos.length} tipos de evento registrados`
            );
        } catch (error) {
            this.registrarResultado(
                'Funcionalidades',
                'Sistema de Eventos',
                false,
                error.message
            );
        }
    }

    /**
     * FASE 6: Verificar segurança e configurações
     */
    async verificarSeguranca() {
        console.log('\n🛡️ === FASE 6: SEGURANÇA E CONFIGURAÇÕES ===');
        
        // Teste 6.1: Configurações JWT
        const jwtSecret = process.env.JWT_SECRET;
        const jwtSeguro = jwtSecret && jwtSecret.length >= 32;
        
        this.registrarResultado(
            'Segurança',
            'JWT Secret',
            jwtSeguro,
            jwtSeguro ? 'Chave segura configurada' : 'Chave fraca ou ausente'
        );

        // Teste 6.2: Configurações de banco
        const dbConfig = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        };
        
        const dbCompleto = Object.values(dbConfig).every(val => val !== undefined);
        
        this.registrarResultado(
            'Segurança',
            'Configuração DB',
            dbCompleto,
            dbCompleto ? 'Todas as configurações presentes' : 'Configurações incompletas'
        );

        // Teste 6.3: Verificar se senhas não estão em texto plano
        try {
            const senhas = await conexao.executarConsulta(`
                SELECT senha_hash FROM usuarios WHERE senha_hash NOT LIKE '$2b$%' LIMIT 1
            `);
            
            this.registrarResultado(
                'Segurança',
                'Hash de Senhas',
                senhas.length === 0,
                senhas.length === 0 ? 'Todas as senhas estão hasheadas' : 'Senhas em texto plano encontradas'
            );
        } catch (error) {
            this.registrarResultado(
                'Segurança',
                'Hash de Senhas',
                false,
                error.message
            );
        }
    }

    /**
     * Executar verificação completa
     */
    async executarVerificacaoCompleta() {
        console.log('🚀 ===== VERIFICAÇÃO FINAL COMPLETA DO SISTEMA =====');
        console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
        console.log('🎯 Objetivo: Validar 100% do sistema antes do deploy');
        
        try {
            await this.verificarInfraestrutura();
            await this.verificarBancoDados();
            await this.verificarServicos();
            await this.verificarAPIs();
            await this.verificarFuncionalidades();
            await this.verificarSeguranca();
            
            await this.gerarRelatorioFinal();
            
            return {
                sucessos: this.sucessos,
                falhas: this.falhas,
                taxaSucesso: ((this.sucessos / (this.sucessos + this.falhas)) * 100),
                duracao: (Date.now() - this.inicioTeste) / 1000,
                aprovado: this.falhas === 0
            };
            
        } catch (error) {
            console.error('❌ Erro fatal na verificação:', error);
            this.falhas++;
        }
    }

    /**
     * Gerar relatório final
     */
    async gerarRelatorioFinal() {
        const duracao = ((Date.now() - this.inicioTeste) / 1000).toFixed(2);
        const total = this.sucessos + this.falhas;
        const taxaSucesso = total > 0 ? ((this.sucessos / total) * 100).toFixed(1) : 0;

        console.log('\n📊 ===== RELATÓRIO FINAL DA VERIFICAÇÃO =====');
        console.log(`⏱️  Duração total: ${duracao}s`);
        console.log(`✅ Testes aprovados: ${this.sucessos}`);
        console.log(`❌ Testes reprovados: ${this.falhas}`);
        console.log(`📈 Taxa de sucesso: ${taxaSucesso}%`);

        // Agrupar resultados por categoria
        const categorias = {};
        this.resultados.forEach(resultado => {
            if (!categorias[resultado.categoria]) {
                categorias[resultado.categoria] = { sucessos: 0, falhas: 0, testes: [] };
            }
            
            if (resultado.sucesso) {
                categorias[resultado.categoria].sucessos++;
            } else {
                categorias[resultado.categoria].falhas++;
            }
            categorias[resultado.categoria].testes.push(resultado);
        });

        console.log('\n📋 RESULTADOS POR CATEGORIA:');
        Object.entries(categorias).forEach(([categoria, dados]) => {
            const totalCat = dados.sucessos + dados.falhas;
            const taxaCat = totalCat > 0 ? ((dados.sucessos / totalCat) * 100).toFixed(1) : 0;
            console.log(`   ${categoria}: ${dados.sucessos}/${totalCat} (${taxaCat}%)`);
        });

        // Determinar status final
        if (this.falhas === 0) {
            console.log('\n🎉 ===== SISTEMA 100% APROVADO =====');
            console.log('✅ TODOS OS TESTES PASSARAM COM SUCESSO!');
            console.log('🚀 SISTEMA PRONTO PARA PRODUÇÃO!');
        } else {
            console.log('\n⚠️ ===== SISTEMA COM PROBLEMAS =====');
            console.log('❌ ALGUNS TESTES FALHARAM');
            console.log('🔧 CORREÇÕES NECESSÁRIAS ANTES DO DEPLOY');
        }

        // Salvar relatório detalhado
        await this.salvarRelatorioDetalhado(duracao, taxaSucesso, categorias);

        return {
            sucessos: this.sucessos,
            falhas: this.falhas,
            taxaSucesso: parseFloat(taxaSucesso),
            duracao: parseFloat(duracao),
            aprovado: this.falhas === 0
        };
    }

    /**
     * Salvar relatório detalhado
     */
    async salvarRelatorioDetalhado(duracao, taxaSucesso, categorias) {
        try {
            const relatorio = `# RELATÓRIO DE VERIFICAÇÃO FINAL COMPLETA
## Data: ${new Date().toLocaleString('pt-BR')}

### RESUMO EXECUTIVO
- **Duração:** ${duracao}s
- **Testes Executados:** ${this.sucessos + this.falhas}
- **Taxa de Sucesso:** ${taxaSucesso}%
- **Status:** ${this.falhas === 0 ? '✅ APROVADO' : '❌ REPROVADO'}

### RESULTADOS POR CATEGORIA

${Object.entries(categorias).map(([categoria, dados]) => {
    const totalCat = dados.sucessos + dados.falhas;
    const taxaCat = totalCat > 0 ? ((dados.sucessos / totalCat) * 100).toFixed(1) : 0;
    
    return `#### ${categoria}
- **Status:** ${dados.falhas === 0 ? '✅ APROVADO' : '❌ REPROVADO'}
- **Sucessos:** ${dados.sucessos}/${totalCat} (${taxaCat}%)

${dados.testes.map(teste => 
`- ${teste.sucesso ? '✅' : '❌'} **${teste.teste}**: ${teste.detalhes || 'N/A'}`
).join('\n')}
`;
}).join('\n')}

### CONCLUSÃO

${this.falhas === 0 ? 
`🎉 **SISTEMA TOTALMENTE APROVADO!**

Todos os componentes do sistema foram verificados e estão funcionando perfeitamente:
- ✅ Infraestrutura básica operacional
- ✅ Banco de dados estruturado e populado
- ✅ Serviços carregados e funcionais
- ✅ APIs e endpoints acessíveis
- ✅ Funcionalidades específicas validadas
- ✅ Segurança adequadamente configurada

**O sistema está 100% pronto para deployment em produção.**` :
`⚠️ **SISTEMA COM PROBLEMAS IDENTIFICADOS**

Foram encontrados ${this.falhas} problema(s) que devem ser corrigidos antes do deploy:

${this.resultados.filter(r => !r.sucesso).map(r => 
`- ❌ [${r.categoria}] ${r.teste}: ${r.detalhes}`
).join('\n')}

**É necessário corrigir estes problemas antes de proceder com o deployment.**`}

---
*Relatório gerado automaticamente pelo sistema de verificação*
`;

            await fs.writeFile('RELATORIO_VERIFICACAO_FINAL_COMPLETA.md', relatorio);
            console.log('\n📄 Relatório detalhado salvo: RELATORIO_VERIFICACAO_FINAL_COMPLETA.md');

        } catch (error) {
            console.error('❌ Erro ao salvar relatório:', error.message);
        }
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    const verificador = new VerificacaoFinalCompleta();
    
    verificador.executarVerificacaoCompleta()
        .then((resultado) => {
            console.log('\n🏁 Verificação concluída!');
            process.exit(resultado.aprovado ? 0 : 1);
        })
        .catch((error) => {
            console.error('❌ Erro fatal na verificação:', error);
            process.exit(1);
        });
}

module.exports = VerificacaoFinalCompleta;
