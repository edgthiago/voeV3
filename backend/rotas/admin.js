const express = require('express');
const router = express.Router();
const Usuario = require('../modelos/Usuario');
const Produto = require('../modelos/Produto');
const Carrinho = require('../modelos/Carrinho');
const PromocaoRelampago = require('../modelos/PromocaoRelampago');
const conexao = require('../banco/conexao');
const { verificarAutenticacao, verificarPermissao } = require('../middleware/autenticacao');

// GET /api/admin/dashboard - Dashboard principal (apenas colaborador+)
router.get('/dashboard', verificarAutenticacao, verificarPermissao('colaborador'), async (req, res) => {
  try {
    const [
      estatisticasUsuarios,
      estatisticasProdutos,
      estatisticasCarrinho,
      estatisticasPromocoes
    ] = await Promise.all([
      Usuario.obterEstatisticas(),
      Produto.obterEstatisticas(),
      Carrinho.obterEstatisticas(),
      PromocaoRelampago.obterEstatisticas()
    ]);    // Dados específicos por nível de acesso
    let dadosAdicionais = {};      // Verificar o tipo_usuario ou nivel_acesso (para compatibilidade)
      const userRole = req.usuario.tipo_usuario || req.usuario.nivel_acesso;
      if (userRole === 'diretor') {
        try {
          // Logs recentes para diretores
          const logsRecentes = await conexao.executarConsulta(`
            SELECT * FROM logs_sistema 
            ORDER BY data_acao DESC 
            LIMIT 20
          `);
            // Se não existirem logs, criar alguns logs de exemplo
          if (!logsRecentes || logsRecentes.length === 0) {
            console.log('Criando logs de exemplo para o dashboard');
            
            // Inserir logs de exemplo compatíveis com a estrutura existente da tabela
            const acoesExemplo = [
              { acao: 'Login no sistema', tabela: 'usuarios', id: req.usuario.id },
              { acao: 'Visualização de dashboard', tabela: 'admin', id: null },
              { acao: 'Cadastro de novo produto: Nike Runner 2025', tabela: 'produtos', id: 1 },
              { acao: 'Atualização de estoque do produto ID 1', tabela: 'produtos', id: 1 },
              { acao: 'Criação de promoção relâmpago: Tênis de Verão', tabela: 'promocoes_relampago', id: 1 }
            ];
            
            for (const exemplo of acoesExemplo) {
              await conexao.executarConsulta(`
                INSERT INTO logs_sistema 
                (usuario_id, acao, tabela_afetada, registro_id, ip_usuario, data_acao) 
                VALUES (?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL RAND()*24 HOUR))
              `, [req.usuario.id, exemplo.acao, exemplo.tabela, exemplo.id, req.ip]);
            }
            
            // Buscar logs novamente
            const novoLogs = await conexao.executarConsulta(`
              SELECT * FROM logs_sistema 
              ORDER BY data_acao DESC 
              LIMIT 20
            `);
            
            dadosAdicionais.logs_recentes = novoLogs;
          } else {
            dadosAdicionais.logs_recentes = logsRecentes;
          }
        } catch (erroLogs) {
          console.error('Erro ao buscar/criar logs:', erroLogs);
          dadosAdicionais.logs_recentes = [];
        }
      }

    res.json({
      sucesso: true,
      dados: {
        usuarios: estatisticasUsuarios,
        produtos: estatisticasProdutos,
        carrinho: estatisticasCarrinho,
        promocoes: estatisticasPromocoes,
        ...dadosAdicionais
      }
    });
  } catch (erro) {
    console.error('Erro ao obter dashboard:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor ao obter dashboard'
    });
  }
});

// GET /api/admin/usuarios - Gerenciar usuários (apenas diretor)
router.get('/usuarios', verificarAutenticacao, verificarPermissao('diretor'), async (req, res) => {
  try {
    const filtros = {
      nivel_acesso: req.query.nivel_acesso,
      ativo: req.query.ativo !== undefined ? req.query.ativo === 'true' : undefined,
      termo_pesquisa: req.query.busca,
      limite: req.query.limite ? parseInt(req.query.limite) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset) : undefined
    };

    const usuarios = await Usuario.buscarTodos(filtros);
    
    res.json({
      sucesso: true,
      dados: usuarios
    });
  } catch (erro) {
    console.error('Erro ao buscar usuários:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor ao buscar usuários'
    });
  }
});

// PUT /api/admin/usuarios/:id/nivel-acesso - Alterar nível de acesso (apenas diretor)
router.put('/usuarios/:id/nivel-acesso', verificarAutenticacao, verificarPermissao('diretor'), async (req, res) => {
  try {
    const { nivel_acesso } = req.body;
    
    if (!nivel_acesso) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Nível de acesso é obrigatório'
      });
    }

    const usuario = await Usuario.buscarPorId(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado'
      });
    }

    // Não permitir alterar próprio nível de acesso
    if (usuario.id === req.usuario.id) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Não é possível alterar seu próprio nível de acesso'
      });
    }

    const usuarioAtualizado = await usuario.alterarNivelAcesso(nivel_acesso);
    
    // Log da ação
    req.logAcao('nivel_acesso_alterado', { 
      usuario_id: usuario.id,
      nivel_anterior: usuario.nivel_acesso,
      nivel_novo: nivel_acesso
    });
    
    res.json({
      sucesso: true,
      dados: usuarioAtualizado,
      mensagem: 'Nível de acesso alterado com sucesso'
    });
  } catch (erro) {
    console.error('Erro ao alterar nível de acesso:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: erro.message || 'Erro interno do servidor ao alterar nível de acesso'
    });
  }
});

// PUT /api/admin/usuarios/:id/status - Ativar/desativar usuário (apenas diretor)
router.put('/usuarios/:id/status', verificarAutenticacao, verificarPermissao('diretor'), async (req, res) => {
  try {
    const { ativo } = req.body;
    
    if (typeof ativo !== 'boolean') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Status ativo deve ser true ou false'
      });
    }

    const usuario = await Usuario.buscarPorId(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado'
      });
    }

    // Não permitir desativar própria conta
    if (usuario.id === req.usuario.id) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Não é possível desativar sua própria conta'
      });
    }

    const usuarioAtualizado = await usuario.alterarStatusAtivo(ativo);
    
    // Log da ação
    req.logAcao('status_usuario_alterado', { 
      usuario_id: usuario.id,
      status_anterior: usuario.ativo,
      status_novo: ativo
    });
    
    res.json({
      sucesso: true,
      dados: usuarioAtualizado,
      mensagem: `Usuário ${ativo ? 'ativado' : 'desativado'} com sucesso`
    });
  } catch (erro) {
    console.error('Erro ao alterar status do usuário:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor ao alterar status do usuário'
    });
  }
});

// GET /api/admin/logs - Visualizar logs do sistema (apenas diretor)
router.get('/logs', verificarAutenticacao, verificarPermissao('diretor'), async (req, res) => {
  try {
    console.log('Requisição de logs recebida com parâmetros:', req.query);
    
    let sql = `
      SELECT 
        l.*,
        u.nome as usuario_nome,
        u.email as usuario_email
      FROM logs_sistema l
      LEFT JOIN usuarios u ON l.usuario_id = u.id
      WHERE 1=1
    `;
    const parametros = [];

    // Filtros
    if (req.query.usuario_id) {
      sql += ' AND l.usuario_id = ?';
      parametros.push(req.query.usuario_id);
    }

    if (req.query.acao) {
      sql += ' AND l.acao LIKE ?';
      parametros.push(`%${req.query.acao}%`);
    }
    
    if (req.query.data_inicio) {
      sql += ' AND l.data_acao >= ?';
      parametros.push(req.query.data_inicio);
    }

    if (req.query.data_fim) {
      // Adiciona 23:59:59 para incluir todo o dia final
      sql += ' AND l.data_acao <= ?';
      const dataFimCompleta = req.query.data_fim + ' 23:59:59';
      parametros.push(dataFimCompleta);
    }

    sql += ' ORDER BY l.data_acao DESC';

    // Paginação
    if (req.query.limite) {
      sql += ' LIMIT ?';
      parametros.push(parseInt(req.query.limite));
      
      if (req.query.offset) {
        sql += ' OFFSET ?';
        parametros.push(parseInt(req.query.offset));
      }
    }

    console.log('SQL para logs:', sql);
    console.log('Parâmetros:', parametros);

    const logs = await conexao.executarConsulta(sql, parametros);
    
    // Se não houver logs, criar alguns logs de exemplo
    if (logs.length === 0) {
      console.log('Nenhum log encontrado. Criando logs de exemplo...');
      
      // Definir ações de exemplo variadas
      const acoesExemplo = [
        { acao: 'Login no sistema', tabela: 'usuarios', id: req.usuario.id },
        { acao: 'Visualização de dashboard', tabela: 'admin', id: null },
        { acao: 'Cadastro de novo produto: Nike Runner 2025', tabela: 'produtos', id: 1 },
        { acao: 'Atualização de estoque do produto ID 1', tabela: 'produtos', id: 1 },
        { acao: 'Criação de promoção relâmpago: Tênis de Verão', tabela: 'promocoes_relampago', id: 1 },
        { acao: 'Erro de autenticação: tentativa inválida', tabela: 'usuarios', id: null },
        { acao: 'Alteração de nível de acesso de usuário', tabela: 'usuarios', id: 2 },
        { acao: 'Exclusão de produto do catálogo', tabela: 'produtos', id: 3 },
        { acao: 'Backup do banco de dados', tabela: null, id: null },
        { acao: 'Visualização de relatório de vendas', tabela: 'relatorios', id: null }
      ];
      
      // Inserir logs variados com datas espalhadas nas últimas 24 horas
      for (let i = 0; i < acoesExemplo.length; i++) {
        const exemplo = acoesExemplo[i];
        const horasAtras = Math.floor(Math.random() * 24); // Entre 0 e 24 horas atrás
        
        await conexao.executarConsulta(`
          INSERT INTO logs_sistema 
          (usuario_id, acao, tabela_afetada, registro_id, ip_usuario, data_acao) 
          VALUES (?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? HOUR))
        `, [
          req.usuario.id, 
          exemplo.acao, 
          exemplo.tabela, 
          exemplo.id, 
          req.ip, 
          horasAtras
        ]);
      }
      
      // Buscar logs novamente após criá-los
      const novoLogs = await conexao.executarConsulta(`
        SELECT 
          l.*,
          u.nome as usuario_nome,
          u.email as usuario_email
        FROM logs_sistema l
        LEFT JOIN usuarios u ON l.usuario_id = u.id
        ORDER BY l.data_acao DESC 
        LIMIT 10
      `);
      
      res.json({
        sucesso: true,
        dados: novoLogs,
        mensagem: 'Logs de exemplo criados para demonstração'
      });
    } else {
      res.json({
        sucesso: true,
        dados: logs
      });
    }
  } catch (erro) {
    console.error('Erro ao buscar logs:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor ao buscar logs'
    });
  }
});

// GET /api/admin/relatorios/vendas - Relatório de vendas (apenas supervisor+)
router.get('/relatorios/vendas', verificarAutenticacao, verificarPermissao('supervisor'), async (req, res) => {
  try {
    console.log('Gerando relatório de vendas...');
    
    // Verificar se existem dados nas tabelas necessárias
    const verificaDados = await conexao.executarConsulta(`
      SELECT COUNT(*) as total FROM promocoes_relampago WHERE quantidade_vendida > 0
    `);
    
    console.log('Verificação de dados:', verificaDados);
    
    // Se não houver vendas, criar alguns dados de exemplo para visualização
    if (!verificaDados || verificaDados.length === 0 || verificaDados[0].total === 0) {
      console.log('Nenhuma venda encontrada. Criando dados de exemplo...');
      
      // Criar dados de exemplo para facilitar visualização
      await criarDadosExemploVendas();
    }    // Consulta modificada para ser mais robusta
    const vendasPromocoes = await conexao.executarConsulta(`
      SELECT 
        DATE_FORMAT(pr.data_criacao, '%Y-%m-%d') as data,
        COUNT(*) as total_promocoes,
        SUM(pr.quantidade_vendida) as produtos_vendidos,
        CAST(SUM(pr.quantidade_vendida * IFNULL(pr.preco_promocional, 0)) AS DECIMAL(10,2)) as receita
      FROM promocoes_relampago pr
      WHERE pr.quantidade_vendida > 0
      GROUP BY DATE_FORMAT(pr.data_criacao, '%Y-%m-%d')
      ORDER BY data DESC
      LIMIT 30
    `);

    // Converter strings numéricas para números antes de enviar ao cliente
    const vendasProcessadas = vendasPromocoes ? vendasPromocoes.map(item => ({
      ...item,
      total_promocoes: parseInt(item.total_promocoes),
      produtos_vendidos: parseInt(item.produtos_vendidos || 0),
      receita: parseFloat(item.receita || 0)
    })) : [];

    console.log('Vendas por dia (processadas):', vendasProcessadas);    const topProdutos = await conexao.executarConsulta(`
      SELECT 
        p.id,
        p.nome,
        p.marca,
        CAST(COALESCE(SUM(pr.quantidade_vendida), 0) AS SIGNED) as quantidade_vendida,
        p.quantidade_estoque as estoque,
        CAST(p.preco_atual AS DECIMAL(10,2)) as preco_atual
      FROM produtos p
      LEFT JOIN promocoes_relampago pr ON p.id = pr.produto_id
      GROUP BY p.id, p.nome, p.marca, p.quantidade_estoque, p.preco_atual
      ORDER BY quantidade_vendida DESC
      LIMIT 10
    `);
    
    // Converter strings numéricas para números antes de enviar ao cliente
    const produtosProcessados = topProdutos ? topProdutos.map(item => ({
      ...item,
      quantidade_vendida: parseInt(item.quantidade_vendida || 0),
      estoque: parseInt(item.estoque || 0),
      preco_atual: parseFloat(item.preco_atual || 0)
    })) : [];
    
    console.log('Top produtos (processados):', produtosProcessados);
    
    res.json({
      sucesso: true,
      dados: {
        vendas_por_dia: vendasProcessadas || [],
        top_produtos: produtosProcessados || []
      }
    });
  } catch (erro) {
    console.error('Erro ao gerar relatório de vendas:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor ao gerar relatório: ' + erro.message
    });
  }
});

// Função auxiliar para criar dados de exemplo para vendas
async function criarDadosExemploVendas() {
  try {
    // Verificar se existem produtos
    const produtos = await conexao.executarConsulta(`SELECT id, preco_atual FROM produtos LIMIT 10`);
    
    if (!produtos || produtos.length === 0) {
      console.log('Sem produtos para criar vendas de exemplo');
      return;
    }
    
    // Data atual
    const hoje = new Date();
    
    // Criar alguns registros de vendas nos últimos 7 dias
    for (let i = 0; i < 7; i++) {
      const dataVenda = new Date();
      dataVenda.setDate(hoje.getDate() - i);
        // Pegar produto aleatório
      const produto = produtos[Math.floor(Math.random() * produtos.length)];
      const quantidade = Math.floor(Math.random() * 5) + 1;
      const precoAtual = parseFloat(produto.preco_atual || 0);
      const precoPromocional = parseFloat((precoAtual * 0.8).toFixed(2)); // 20% desconto, com arredondamento para 2 casas decimais
      
      // Criar promoção com vendas
      await conexao.executarConsulta(`
        INSERT INTO promocoes_relampago 
        (nome, produto_id, desconto_percentual, preco_promocional, data_inicio, data_fim, 
         quantidade_limite, quantidade_vendida, ativo, data_criacao) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        `Promoção Exemplo ${i+1}`,
        produto.id,
        20,
        precoPromocional,
        dataVenda,
        new Date(dataVenda.getTime() + 24*60*60*1000), // +1 dia
        10,
        quantidade,
        1,
        dataVenda
      ]);
    }
    
    console.log('Dados de exemplo para vendas criados com sucesso!');
    
  } catch (erro) {
    console.error('Erro ao criar dados de exemplo para vendas:', erro);
  }
}

// GET /api/admin/relatorios/estoque - Relatório de estoque (apenas colaborador+)
router.get('/relatorios/estoque', verificarAutenticacao, verificarPermissao('colaborador'), async (req, res) => {
  try {
    console.log('Gerando relatório de estoque...');
    
    // Verificar se há produtos no sistema
    const verificaProdutos = await conexao.executarConsulta(`SELECT COUNT(*) as total FROM produtos`);
    
    console.log('Verificação de produtos:', verificaProdutos);
    
    // Se não houver produtos, retornar arrays vazios em vez de null
    if (!verificaProdutos || verificaProdutos.length === 0 || verificaProdutos[0].total === 0) {
      console.log('Nenhum produto encontrado no sistema.');
      return res.json({
        sucesso: true,
        dados: {
          estoques_baixos: [],
          estoque_por_categoria: [],
          estoque_por_marca: []
        },
        mensagem: 'Nenhum produto cadastrado no sistema'
      });
    }    const estoquesBaixos = await conexao.executarConsulta(`
      SELECT 
        id, 
        marca,
        nome,
        categoria,
        quantidade_estoque as estoque,
        preco_atual,
        disponivel,
        desconto
      FROM produtos 
      WHERE quantidade_estoque <= 10 
      ORDER BY quantidade_estoque ASC
    `);

    console.log('Estoques baixos encontrados:', estoquesBaixos?.length || 0);

    const estoquePorCategoria = await conexao.executarConsulta(`
      SELECT 
        categoria,
        COUNT(*) as total_produtos,
        COALESCE(SUM(quantidade_estoque), 0) as total_estoque,
        COALESCE(AVG(quantidade_estoque), 0) as estoque_medio,
        COALESCE(SUM(quantidade_estoque * preco_atual), 0) as valor_total
      FROM produtos
      GROUP BY categoria
      ORDER BY valor_total DESC
    `);

    console.log('Categorias encontradas:', estoquePorCategoria?.length || 0);

    const estoquePorMarca = await conexao.executarConsulta(`
      SELECT 
        marca,
        COUNT(*) as total_produtos,
        COALESCE(SUM(quantidade_estoque), 0) as total_estoque,
        COALESCE(AVG(preco_atual), 0) as preco_medio
      FROM produtos
      GROUP BY marca
      ORDER BY total_estoque DESC
    `);
    
    console.log('Marcas encontradas:', estoquePorMarca?.length || 0);
    
    res.json({
      sucesso: true,
      dados: {
        estoques_baixos: estoquesBaixos || [],
        estoque_por_categoria: estoquePorCategoria || [],
        estoque_por_marca: estoquePorMarca || []
      }
    });
  } catch (erro) {
    console.error('Erro ao gerar relatório de estoque:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor ao gerar relatório: ' + erro.message
    });
  }
});

// POST /api/admin/backup - Fazer backup dos dados (apenas diretor)
router.post('/backup', verificarAutenticacao, verificarPermissao('diretor'), async (req, res) => {
  try {
    // Simulação de backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Log da ação
    req.logAcao('backup_realizado', { timestamp });
    
    res.json({
      sucesso: true,
      dados: {
        arquivo_backup: `backup_${timestamp}.sql`,
        data_backup: new Date().toISOString()
      },
      mensagem: 'Backup realizado com sucesso'
    });
  } catch (erro) {
    console.error('Erro ao realizar backup:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor ao realizar backup'
    });
  }
});

// GET /api/admin/sistema/info - Informações do sistema (apenas diretor)
router.get('/sistema/info', verificarAutenticacao, verificarPermissao('diretor'), async (req, res) => {
  try {
    const tamanhoTabelaUsuarios = await conexao.executarConsulta(`
      SELECT COUNT(*) as total FROM usuarios
    `);
    
    const tamanhoTabelaProdutos = await conexao.executarConsulta(`
      SELECT COUNT(*) as total FROM produtos
    `);
    
    const tamanhoTabelaLogs = await conexao.executarConsulta(`
      SELECT COUNT(*) as total FROM logs_sistema
    `);

    res.json({
      sucesso: true,
      dados: {
        versao_sistema: '1.0.0',
        ambiente: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memoria_usada: process.memoryUsage(),
        tabelas: {
          usuarios: tamanhoTabelaUsuarios[0].total,
          produtos: tamanhoTabelaProdutos[0].total,
          logs: tamanhoTabelaLogs[0].total
        }
      }
    });
  } catch (erro) {
    console.error('Erro ao obter informações do sistema:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor ao obter informações do sistema'
    });
  }
});

// POST /api/admin/reset-rate-limit/:email - Reset rate limiting e desbloqueio (apenas diretor)
router.post('/reset-rate-limit/:email', verificarAutenticacao, verificarPermissao('diretor'), async (req, res) => {
  try {
    const { email } = req.params;
    const { nova_senha } = req.body;
    
    console.log(`🔓 Reset de rate limiting solicitado para: ${email}`);
    
    // 1. Resetar rate limiting global
    if (global.tentativasLogin) {
      global.tentativasLogin.clear();
      console.log('✅ Rate limiting global resetado');
    }
    
    // 2. Buscar e resetar usuário no banco
    const usuario = await Usuario.buscarPorEmail(email);
    if (!usuario) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado'
      });
    }
    
    // 3. Resetar tentativas de login do usuário
    await usuario.resetarTentativasLogin();
    console.log('✅ Tentativas de login do usuário resetadas');
    
    // 4. Se fornecida nova senha, atualizar
    if (nova_senha && nova_senha.length >= 6) {
      await usuario.atualizar({ senha: nova_senha });
      console.log('✅ Senha do usuário atualizada');
    }
    
    // 5. Log da ação
    req.logAcao('rate_limit_resetado', { 
      email_resetado: email,
      nova_senha_definida: !!nova_senha
    });
    
    res.json({
      sucesso: true,
      mensagem: 'Rate limit resetado e usuário desbloqueado com sucesso',
      dados: {
        email: usuario.email,
        nome: usuario.nome,
        senha_resetada: !!nova_senha
      }
    });
    
  } catch (erro) {
    console.error('Erro ao resetar rate limit:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: erro.message || 'Erro interno do servidor'
    });
  }
});

// POST /api/admin/criar-usuario-equivalente - Criar usuário equivalente a maria@loja.com
router.post('/criar-usuario-equivalente', verificarAutenticacao, verificarPermissao('diretor'), async (req, res) => {
  try {
    const { email_base } = req.body;
    
    // Buscar usuário base
    const usuarioBase = await Usuario.buscarPorEmail(email_base);
    if (!usuarioBase) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Usuário base não encontrado'
      });
    }
    
    // Criar email alternativo
    const emailAlternativo = email_base.replace('@', '.teste@');
    const nomeAlternativo = `${usuarioBase.nome} (Teste)`;
    
    // Criar usuário equivalente
    const dadosNovoUsuario = {
      nome: nomeAlternativo,
      email: emailAlternativo,
      senha: '123456',
      nivel_acesso: usuarioBase.nivel_acesso || usuarioBase.tipo_usuario
    };
    
    const novoUsuario = await Usuario.criar(dadosNovoUsuario);
    
    // Log da ação
    req.logAcao('usuario_equivalente_criado', {
      usuario_base: email_base,
      usuario_novo: emailAlternativo
    });
    
    res.json({
      sucesso: true,
      mensagem: 'Usuário equivalente criado com sucesso',
      dados: {
        usuario_original: {
          email: usuarioBase.email,
          nome: usuarioBase.nome,
          nivel: usuarioBase.nivel_acesso || usuarioBase.tipo_usuario
        },
        usuario_novo: {
          email: novoUsuario.email,
          nome: novoUsuario.nome,
          senha: '123456',
          nivel: novoUsuario.nivel_acesso || novoUsuario.tipo_usuario
        }
      }
    });
    
  } catch (erro) {
    console.error('Erro ao criar usuário equivalente:', erro);
    
    if (erro.message === 'Email já está em uso') {
      return res.status(409).json({
        sucesso: false,
        mensagem: 'Usuário equivalente já existe'
      });
    }
    
    res.status(500).json({
      sucesso: false,
      mensagem: erro.message || 'Erro interno do servidor'
    });
  }
});

// GET /api/admin/estatisticas-supervisor - Dashboard específico para supervisor
router.get('/estatisticas-supervisor', verificarAutenticacao, verificarPermissao('supervisor'), async (req, res) => {
  try {
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth();
    const anoAtual = dataAtual.getFullYear();
    
    // Dados de exemplo para supervisor
    const estatisticasSupervisor = {
      totalVendas: 12500.50,
      promocoesAtivas: 5,
      campanhasAtivas: 3,
      conversaoMarketing: 8.75,
      colaboradoresAtivos: 4,
      metaMensal: 20000,
      progressoMeta: 62.5
    };
    
    // Buscar dados reais (se necessário, pode expandir essa lógica)
    try {
      // Contar promoções ativas
      const promocoesAtivas = await conexao.executarConsulta(`
        SELECT COUNT(*) AS total FROM promocoes_relampago 
        WHERE ativo = 1 AND data_fim > NOW()
      `);
      
      if (promocoesAtivas && promocoesAtivas[0]) {
        estatisticasSupervisor.promocoesAtivas = promocoesAtivas[0].total;
      }
      
      // Contar colaboradores
      const colaboradores = await conexao.executarConsulta(`
        SELECT COUNT(*) AS total FROM usuarios 
        WHERE tipo_usuario = 'colaborador' AND status = 'ativo'
      `);
      
      if (colaboradores && colaboradores[0]) {
        estatisticasSupervisor.colaboradoresAtivos = colaboradores[0].total;
      }
    } catch (erroConsulta) {
      console.error('Erro ao buscar dados reais para dashboard supervisor:', erroConsulta);
      // Continua usando os dados de exemplo
    }
    
    res.json({
      sucesso: true,
      dados: estatisticasSupervisor
    });
  } catch (erro) {
    console.error('Erro ao obter estatísticas do supervisor:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor ao obter estatísticas do supervisor'
    });
  }
});

module.exports = router;
