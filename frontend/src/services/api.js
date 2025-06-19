// Configuração da API
const API_BASE_URL = 'http://localhost:9999/api';

// Classe para gerenciar requisições à API
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }  // Método para fazer requisições HTTP
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Sempre buscar o token mais recente do localStorage
    const currentToken = this.getToken();
    if (currentToken) {
      console.log('Enviando requisição com token:', endpoint);
      config.headers.Authorization = `Bearer ${currentToken}`;
    } else {
      console.warn('Requisição sem token de autenticação:', endpoint);
    }

    try {
      console.log(`Requisição para ${url}`, config);
      const response = await fetch(url, config);
      const data = await response.json();
      console.log(`Resposta de ${url}:`, data);

      if (!response.ok) {
        console.error(`Erro na requisição ${url}:`, data);
        throw new Error(data.mensagem || `Erro ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  }
  // Métodos HTTP básicos
  async get(endpoint, params = {}) {
    // Filtrar parâmetros undefined, null ou vazios
    const filteredParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    const queryString = new URLSearchParams(filteredParams).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Métodos de autenticação
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }
  getToken() {
    return this.token || localStorage.getItem('token') || sessionStorage.getItem('token');
  }
  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  }

  // Verificar se está autenticado
  isAuthenticated() {
    return !!this.getToken();
  }
}

// Instância global da API
const api = new ApiService();

export default api;
