// Serviços específicos para o sistema de pedidos
import api from './api.js';

// Serviço de Autenticação
export const authService = {  // Login
  async login(email, senha) {
    try {
      const response = await api.post('/auth/login', { email, senha });
      
      if (response.sucesso && response.dados && response.dados.token) {
        api.setToken(response.dados.token);
        localStorage.setItem('usuario', JSON.stringify(response.dados.usuario || {}));
      }
      
      return response;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },

  // Registro
  async register(dadosUsuario) {
    try {
      return await api.post('/auth/register', dadosUsuario);
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  },

  // Logout
  logout() {
    api.clearToken();
    localStorage.removeItem('usuario');
  },

  // Verificar se está logado
  isLoggedIn() {
    return api.isAuthenticated();
  },
  // Obter usuário atual
  getCurrentUser() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },  // Verificar se token é válido
  async verificarToken() {
    try {
      const token = api.getToken();
      console.log('🔍 Verificando token:', token ? 'Token encontrado' : 'Token não encontrado');
      
      if (!token) {
        console.warn('❌ Verificação falhou: Token não encontrado');
        this.logout(); // Limpar dados inconsistentes
        return { sucesso: false, mensagem: 'Token não encontrado' };
      }
      
      // Validação básica do formato JWT
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('❌ Token malformado detectado');
        this.logout(); // Limpar token malformado
        return { sucesso: false, mensagem: 'Token malformado' };
      }
      
      // Verificar se o token é válido fazendo uma chamada para o backend
      const response = await api.get('/auth/verificar-token');
      console.log('✅ Resposta da verificação:', response);
      
      return { sucesso: true, mensagem: 'Token válido', dados: response.dados };
    } catch (error) {
      console.error('❌ Erro ao verificar token:', error);
      
      // Se for erro 401 ou 403, o token é definitivamente inválido
      if (error.message && (error.message.includes('401') || error.message.includes('403'))) {
        console.warn('❌ Token inválido ou expirado (401/403)');
        this.logout(); // Limpar token inválido
        return { sucesso: false, mensagem: 'Token inválido ou expirado' };
      }
      
      // Para erros de rede, não invalidar imediatamente
      if (error.message && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        console.warn('⚠️ Erro de rede na verificação, assumindo token válido temporariamente');
        return { sucesso: true, mensagem: 'Assumindo token válido (erro de rede)' };
      }
      
      // Para outros erros, ser conservador e invalidar
      console.warn('❌ Erro desconhecido na verificação, invalidando token');
      this.logout();
      return { sucesso: false, mensagem: 'Erro na verificação do token' };
    }
  }
};

// Serviço de Produtos
export const produtosService = {
  // Buscar todos os produtos
  async buscarTodos(filtros = {}) {
    try {
      return await api.get('/produtos', filtros);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  },

  // Buscar produto por ID
  async buscarPorId(id) {
    try {
      return await api.get(`/produtos/${id}`);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
  },

  // Buscar produtos em promoção
  async buscarPromocoes() {
    try {
      return await api.get('/produtos/promocoes');
    } catch (error) {
      console.error('Erro ao buscar promoções:', error);
      throw error;
    }
  }
};

// Serviço de Carrinho
export const carrinhoService = {
  // Buscar carrinho do usuário
  async buscarCarrinho() {
    try {
      return await api.get('/carrinho');
    } catch (error) {
      console.error('Erro ao buscar carrinho:', error);
      throw error;
    }
  },

  // Adicionar item ao carrinho
  async adicionarItem(produtoId, quantidade = 1, tamanho = null) {
    try {
      return await api.post('/carrinho/adicionar', {
        produto_id: produtoId,
        quantidade,
        tamanho
      });
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      throw error;
    }
  },

  // Atualizar quantidade do item
  async atualizarItem(itemId, quantidade) {
    try {
      return await api.put(`/carrinho/item/${itemId}`, { quantidade });
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      throw error;
    }
  },

  // Remover item do carrinho
  async removerItem(itemId) {
    try {
      return await api.delete(`/carrinho/item/${itemId}`);
    } catch (error) {
      console.error('Erro ao remover item:', error);
      throw error;
    }
  },

  // Limpar carrinho
  async limparCarrinho() {
    try {
      return await api.delete('/carrinho');
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
      throw error;
    }
  }
};

// Serviço de Pedidos
export const pedidosService = {
  // Buscar pedidos do usuário
  async buscarPedidos(filtros = {}) {
    try {
      return await api.get('/pedidos', filtros);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      throw error;
    }
  },

  // Buscar pedido específico
  async buscarPedido(pedidoId) {
    try {
      return await api.get(`/pedidos/${pedidoId}`);
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      throw error;
    }
  },

  // Criar novo pedido
  async criarPedido(dadosPedido) {
    try {
      return await api.post('/pedidos', dadosPedido);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw error;
    }
  },

  // Finalizar pedido (checkout)
  async finalizarPedido(dadosCheckout) {
    try {
      return await api.post('/pedidos/finalizar', dadosCheckout);
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      throw error;
    }
  },

  // Cancelar pedido
  async cancelarPedido(pedidoId) {
    try {
      return await api.patch(`/pedidos/${pedidoId}/cancelar`);
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
      throw error;
    }
  }
};

// Serviço de Promoções
export const promocoesService = {
  // Buscar promoções ativas
  async buscarAtivas() {
    try {
      return await api.get('/promocoes/ativas');
    } catch (error) {
      console.error('Erro ao buscar promoções:', error);
      throw error;
    }
  },

  // Aplicar cupom de desconto
  async aplicarCupom(codigo) {
    try {
      return await api.post('/promocoes/aplicar', { codigo });
    } catch (error) {
      console.error('Erro ao aplicar cupom:', error);
      throw error;
    }
  },

  // Verificar promoção relâmpago
  async verificarPromocaoRelampago() {
    try {
      return await api.get('/promocoes/relampago');
    } catch (error) {
      console.error('Erro ao verificar promoção relâmpago:', error);
      throw error;
    }
  }
};

// Serviço Utilitário
export const utilService = {
  // Buscar CEP
  async buscarCep(cep) {
    try {
      // Remove formatação do CEP
      const cepLimpo = cep.replace(/\D/g, '');
      
      if (cepLimpo.length !== 8) {
        throw new Error('CEP deve ter 8 dígitos');
      }

      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        throw new Error('CEP não encontrado');
      }

      return {
        sucesso: true,
        dados: data
      };
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      return {
        sucesso: false,
        mensagem: error.message
      };
    }
  },

  // Calcular frete
  async calcularFrete(cep, itens) {
    try {
      return await api.post('/frete/calcular', { cep, itens });
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      throw error;
    }
  },

  // Validar dados
  validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  validarCPF(cpf) {
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    if (cpfLimpo.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
    
    // Validar dígitos verificadores
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
    }
    
    let digito1 = 11 - (soma % 11);
    if (digito1 > 9) digito1 = 0;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
    }
    
    let digito2 = 11 - (soma % 11);
    if (digito2 > 9) digito2 = 0;
    
    return digito1 === parseInt(cpfLimpo.charAt(9)) && 
           digito2 === parseInt(cpfLimpo.charAt(10));
  },

  formatarPreco(valor) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  },

  formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

// Exportar todos os serviços
export default {
  auth: authService,
  produtos: produtosService,
  carrinho: carrinhoService,
  pedidos: pedidosService,
  promocoes: promocoesService,
  util: utilService
};
