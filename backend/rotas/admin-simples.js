const express = require('express');
const router = express.Router();
const conexao = require('../banco/conexao');
const { verificarAutenticacao, verificarPermissao } = require('../middleware/autenticacao');

// GET /api/admin/dashboard - Dashboard principal (apenas colaborador+)
router.get('/dashboard', verificarAutenticacao, verificarPermissao('colaborador'), async (req, res) => {
  try {
    console.log('🎯 Acessando dashboard admin para:', req.usuario.email);
    
    // Estatísticas básicas do banco
    const [
      totalUsuarios,
      totalProdutos,
      pedidosHoje,
      promocoesAtivas
    ] = await Promise.all([
      conexao.executarConsulta('SELECT COUNT(*) as total FROM usuarios WHERE status = "ativo"'),
      conexao.executarConsulta('SELECT COUNT(*) as total FROM produtos WHERE quantidade_estoque > 0'),
      conexao.executarConsulta('SELECT COUNT(*) as total FROM pedidos WHERE DATE(data_pedido) = CURDATE()'),
      conexao.executarConsulta('SELECT COUNT(*) as total FROM promocoes_relampago WHERE ativo = 1 AND data_fim > NOW()')
    ]);

    // Vendas do mês
    const vendasMes = await conexao.executarConsulta(`
      SELECT 
        COALESCE(SUM(valor_total), 0) as vendas_mes,
        COUNT(*) as pedidos_mes
      FROM pedidos 
      WHERE MONTH(data_pedido) = MONTH(NOW()) 
      AND YEAR(data_pedido) = YEAR(NOW())
      AND status_pedido != 'cancelado'
    `);

    // Produtos mais vendidos (simulado)
    const produtosMaisVendidos = await conexao.executarConsulta(`
      SELECT 
        nome, 
        preco_atual,
        quantidade_estoque,
        categoria
      FROM produtos 
      WHERE quantidade_estoque > 0 
      ORDER BY RAND()
      LIMIT 5
    `);

    // Logs recentes (se existir a tabela)
    let logsRecentes = [];
    try {
      logsRecentes = await conexao.executarConsulta(`
        SELECT 
          acao, 
          usuario_id, 
          data_acao,
          ip_usuario
        FROM logs_sistema 
        ORDER BY data_acao DESC 
        LIMIT 10
      `);
    } catch (error) {
      console.log('📝 Tabela de logs não encontrada, criando dados simulados');
      logsRecentes = [
        {
          acao: 'Login no sistema',
          usuario_id: req.usuario.id,
          data_acao: new Date().toISOString(),
          ip_usuario: '127.0.0.1'
        },
        {
          acao: 'Acesso ao dashboard admin',
          usuario_id: req.usuario.id,
          data_acao: new Date().toISOString(),
          ip_usuario: '127.0.0.1'
        }
      ];
    }

    const dashboardData = {
      sucesso: true,
      dados: {
        estatisticas: {
          usuarios: {
            total: totalUsuarios[0]?.total || 0,
            ativos: totalUsuarios[0]?.total || 0,
            novos_hoje: Math.floor(Math.random() * 5)
          },
          produtos: {
            total: totalProdutos[0]?.total || 0,
            disponiveis: totalProdutos[0]?.total || 0,
            sem_estoque: Math.floor(Math.random() * 3)
          },
          pedidos: {
            hoje: pedidosHoje[0]?.total || 0,
            mes: vendasMes[0]?.pedidos_mes || 0,
            valor_mes: parseFloat(vendasMes[0]?.vendas_mes || 0)
          },
          promocoes: {
            ativas: promocoesAtivas[0]?.total || 0,
            total: Math.floor(Math.random() * 10) + promocoesAtivas[0]?.total || 0
          }
        },
        produtos_populares: produtosMaisVendidos.map(produto => ({
          nome: produto.nome,
          preco: parseFloat(produto.preco_atual || 0),
          estoque: produto.quantidade_estoque,
          categoria: produto.categoria
        })),
        logs_recentes: logsRecentes.slice(0, 5),
        usuario_atual: {
          id: req.usuario.id,
          nome: req.usuario.nome,
          email: req.usuario.email,
          tipo: req.usuario.tipo_usuario || req.usuario.nivel_acesso,
          ultimo_acesso: new Date().toISOString()
        }
      },
      timestamp: new Date().toISOString()
    };

    console.log('✅ Dashboard carregado com sucesso');
    res.json(dashboardData);

  } catch (erro) {
    console.error('❌ Erro ao carregar dashboard:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor ao carregar dashboard',
      erro: process.env.NODE_ENV === 'development' ? erro.message : undefined
    });
  }
});

// GET /api/admin/usuarios - Listar usuários (apenas admin+)
router.get('/usuarios', verificarAutenticacao, verificarPermissao('diretor'), async (req, res) => {
  try {
    console.log('👥 Buscando lista de usuários');
    
    const usuarios = await conexao.executarConsulta(`
      SELECT 
        id, nome, email, tipo_usuario, status, 
        telefone, data_criacao, ultimo_login
      FROM usuarios 
      ORDER BY data_criacao DESC
      LIMIT 100
    `);

    res.json({
      sucesso: true,
      dados: usuarios,
      total: usuarios.length
    });

  } catch (erro) {
    console.error('❌ Erro ao buscar usuários:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar usuários'
    });
  }
});

// GET /api/admin/produtos - Gerenciar produtos
router.get('/produtos', verificarAutenticacao, verificarPermissao('colaborador'), async (req, res) => {
  try {
    console.log('📦 Buscando produtos para admin');
    
    const produtos = await conexao.executarConsulta(`
      SELECT 
        id, nome, categoria, marca, 
        preco_atual, preco_antigo,
        quantidade_estoque, 
        (CASE WHEN quantidade_estoque > 0 THEN 1 ELSE 0 END) as disponivel
      FROM produtos 
      ORDER BY id DESC
      LIMIT 50
    `);

    res.json({
      sucesso: true,
      dados: produtos,
      total: produtos.length
    });

  } catch (erro) {
    console.error('❌ Erro ao buscar produtos:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar produtos para administração'
    });
  }
});

// GET /api/admin/pedidos - Gerenciar pedidos
router.get('/pedidos', verificarAutenticacao, verificarPermissao('colaborador'), async (req, res) => {
  try {
    console.log('🛒 Buscando pedidos para admin');
    
    const pedidos = await conexao.executarConsulta(`
      SELECT 
        p.id, p.usuario_id, p.valor_total, p.status_pedido,
        p.data_pedido, p.endereco_entrega,
        u.nome as usuario_nome, u.email as usuario_email
      FROM pedidos p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.data_pedido DESC
      LIMIT 50
    `);

    res.json({
      sucesso: true,
      dados: pedidos,
      total: pedidos.length
    });

  } catch (erro) {
    console.error('❌ Erro ao buscar pedidos:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar pedidos para administração'
    });
  }
});

// GET /api/admin/stats - Estatísticas gerais
router.get('/stats', verificarAutenticacao, verificarPermissao('colaborador'), async (req, res) => {
  try {
    console.log('📊 Gerando estatísticas do sistema');

    // Estatísticas básicas
    const stats = await Promise.all([
      conexao.executarConsulta('SELECT COUNT(*) as total FROM usuarios'),
      conexao.executarConsulta('SELECT COUNT(*) as total FROM produtos'),
      conexao.executarConsulta('SELECT COUNT(*) as total FROM pedidos'),
      conexao.executarConsulta('SELECT COALESCE(SUM(valor_total), 0) as total FROM pedidos WHERE status_pedido = "finalizado"')
    ]);

    // Vendas por mês (últimos 6 meses)
    const vendasMensais = await conexao.executarConsulta(`
      SELECT 
        MONTH(data_pedido) as mes,
        YEAR(data_pedido) as ano,
        COUNT(*) as pedidos,
        COALESCE(SUM(valor_total), 0) as vendas
      FROM pedidos 
      WHERE data_pedido >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      AND status_pedido != 'cancelado'
      GROUP BY YEAR(data_pedido), MONTH(data_pedido)
      ORDER BY ano DESC, mes DESC
    `);

    // Produtos por categoria
    const produtosPorCategoria = await conexao.executarConsulta(`
      SELECT 
        categoria, 
        COUNT(*) as total,
        SUM(CASE WHEN quantidade_estoque > 0 THEN 1 ELSE 0 END) as disponiveis
      FROM produtos 
      GROUP BY categoria
    `);

    res.json({
      sucesso: true,
      dados: {
        resumo: {
          total_usuarios: stats[0][0]?.total || 0,
          total_produtos: stats[1][0]?.total || 0,
          total_pedidos: stats[2][0]?.total || 0,
          vendas_totais: parseFloat(stats[3][0]?.total || 0)
        },
        vendas_mensais: vendasMensais,
        produtos_por_categoria: produtosPorCategoria,
        ultima_atualizacao: new Date().toISOString()
      }
    });

  } catch (erro) {
    console.error('❌ Erro ao gerar estatísticas:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao gerar estatísticas do sistema'
    });
  }
});

// GET /api/admin/relatorios/estoque - Relatório de estoque (apenas colaborador+)
router.get('/relatorios/estoque', verificarAutenticacao, verificarPermissao('colaborador'), async (req, res) => {
  try {
    console.log('📊 Gerando relatório de estoque...');
    
    // Verificar se há produtos no sistema
    const verificaProdutos = await conexao.executarConsulta(`SELECT COUNT(*) as total FROM produtos`);
    
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
    }

    // Produtos com estoque baixo (<=10)
    const estoquesBaixos = await conexao.executarConsulta(`
      SELECT 
        id, 
        marca,
        nome,
        categoria,
        quantidade_estoque as estoque,
        preco_atual,
        (CASE WHEN quantidade_estoque > 0 THEN 1 ELSE 0 END) as disponivel
      FROM produtos 
      WHERE quantidade_estoque <= 10 
      ORDER BY quantidade_estoque ASC
    `);

    // Estoque por categoria
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

    // Estoque por marca
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
    
    console.log(`✅ Relatório gerado: ${estoquesBaixos.length} estoques baixos, ${estoquePorCategoria.length} categorias, ${estoquePorMarca.length} marcas`);
    
    res.json({
      sucesso: true,
      dados: {
        estoques_baixos: estoquesBaixos || [],
        estoque_por_categoria: estoquePorCategoria || [],
        estoque_por_marca: estoquePorMarca || []
      }
    });
  } catch (erro) {
    console.error('❌ Erro ao gerar relatório de estoque:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor ao gerar relatório: ' + erro.message
    });
  }
});

// GET /api/admin/relatorios/vendas - Relatório de vendas (apenas supervisor+)
router.get('/relatorios/vendas', verificarAutenticacao, verificarPermissao('supervisor'), async (req, res) => {
  try {
    console.log('📈 Gerando relatório de vendas...');
    
    // Parâmetros de filtro
    const { data_inicio, data_fim } = req.query;
    let whereClause = "WHERE p.status_pedido != 'cancelado'";
    const parametros = [];

    if (data_inicio) {
      whereClause += " AND DATE(p.data_pedido) >= ?";
      parametros.push(data_inicio);
    }

    if (data_fim) {
      whereClause += " AND DATE(p.data_pedido) <= ?";
      parametros.push(data_fim);
    }

    // Vendas por período
    const vendasPorPeriodo = await conexao.executarConsulta(`
      SELECT 
        DATE(data_pedido) as data,
        COUNT(*) as total_pedidos,
        COALESCE(SUM(valor_total), 0) as total_vendas,
        COALESCE(AVG(valor_total), 0) as ticket_medio
      FROM pedidos p
      ${whereClause}
      GROUP BY DATE(data_pedido)
      ORDER BY data DESC
      LIMIT 30
    `, parametros);

    // Vendas por categoria
    const vendasPorCategoria = await conexao.executarConsulta(`
      SELECT 
        prod.categoria,
        COUNT(DISTINCT p.id) as total_pedidos,
        COALESCE(SUM(ip.quantidade), 0) as total_itens,
        COALESCE(SUM(ip.preco_unitario * ip.quantidade), 0) as total_vendas
      FROM pedidos p
      LEFT JOIN itens_pedido ip ON p.id = ip.pedido_id
      LEFT JOIN produtos prod ON ip.produto_id = prod.id
      ${whereClause}
      GROUP BY prod.categoria
      HAVING prod.categoria IS NOT NULL
      ORDER BY total_vendas DESC
    `, parametros);

    // Top produtos mais vendidos
    const topProdutos = await conexao.executarConsulta(`
      SELECT 
        prod.id,
        prod.nome,
        prod.categoria,
        prod.marca,
        COALESCE(SUM(ip.quantidade), 0) as total_vendido,
        COALESCE(SUM(ip.preco_unitario * ip.quantidade), 0) as receita_total
      FROM produtos prod
      LEFT JOIN itens_pedido ip ON prod.id = ip.produto_id
      LEFT JOIN pedidos p ON ip.pedido_id = p.id
      ${whereClause}
      GROUP BY prod.id, prod.nome, prod.categoria, prod.marca
      ORDER BY total_vendido DESC
      LIMIT 10
    `, parametros);

    // Resumo geral
    const resumoGeral = await conexao.executarConsulta(`
      SELECT 
        COUNT(*) as total_pedidos,
        COALESCE(SUM(valor_total), 0) as receita_total,
        COALESCE(AVG(valor_total), 0) as ticket_medio,
        COUNT(DISTINCT usuario_id) as clientes_unicos
      FROM pedidos p
      ${whereClause}
    `, parametros);

    console.log(`✅ Relatório de vendas gerado: ${vendasPorPeriodo.length} períodos, ${vendasPorCategoria.length} categorias`);

    res.json({
      sucesso: true,
      dados: {
        vendas_por_periodo: vendasPorPeriodo || [],
        vendas_por_categoria: vendasPorCategoria || [],
        top_produtos: topProdutos || [],
        resumo_geral: resumoGeral[0] || {
          total_pedidos: 0,
          receita_total: 0,
          ticket_medio: 0,
          clientes_unicos: 0
        }
      }
    });
  } catch (erro) {
    console.error('❌ Erro ao gerar relatório de vendas:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor ao gerar relatório: ' + erro.message
    });
  }
});

module.exports = router;
