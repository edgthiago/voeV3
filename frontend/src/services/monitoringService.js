/**
 * 📊 SERVIÇO DE MONITORAMENTO - FRONTEND
 * Data: 07 de Julho de 2025
 * Objetivo: API client para sistema de monitoramento
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:30011/api';

// Configurar interceptador para incluir token automaticamente
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Configurar interceptador para tratar erros
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

/**
 * Obter status do sistema de monitoramento
 */
export const getMonitoringStatus = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/monitoring/status`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Erro ao obter status do monitoramento');
    }
};

/**
 * Obter métricas atuais do sistema
 */
export const getCurrentMetrics = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/monitoring/metrics`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Erro ao obter métricas atuais');
    }
};

/**
 * Obter histórico de métricas
 */
export const getMetricsHistory = async (days = 7) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/monitoring/metrics/history?days=${days}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Erro ao obter histórico de métricas');
    }
};

/**
 * Iniciar monitoramento
 */
export const startMonitoring = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}/monitoring/start`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Erro ao iniciar monitoramento');
    }
};

/**
 * Parar monitoramento
 */
export const stopMonitoring = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}/monitoring/stop`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Erro ao parar monitoramento');
    }
};

/**
 * Obter alertas ativos
 */
export const getActiveAlerts = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/monitoring/alerts`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Erro ao obter alertas');
    }
};

/**
 * Obter logs do sistema
 */
export const getSystemLogs = async (level = 'all', limit = 100) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/logs?level=${level}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Erro ao obter logs do sistema');
    }
};

/**
 * Obter estatísticas de backup
 */
export const getBackupStats = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/backup/status`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Erro ao obter estatísticas de backup');
    }
};

/**
 * Obter estatísticas de cache
 */
export const getCacheStats = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/cache/stats`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Erro ao obter estatísticas de cache');
    }
};

/**
 * Formatar bytes para unidades legíveis
 */
export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Formatar uptime para formato legível
 */
export const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
};

/**
 * Obter cor baseada no status
 */
export const getStatusColor = (status) => {
    switch (status) {
        case 'healthy':
        case 'running':
        case 'active':
            return 'success';
        case 'warning':
        case 'degraded':
            return 'warning';
        case 'error':
        case 'critical':
        case 'stopped':
            return 'danger';
        default:
            return 'secondary';
    }
};

/**
 * Obter ícone baseado no status
 */
export const getStatusIcon = (status) => {
    switch (status) {
        case 'healthy':
        case 'running':
        case 'active':
            return 'check-circle-fill';
        case 'warning':
        case 'degraded':
            return 'exclamation-triangle-fill';
        case 'error':
        case 'critical':
        case 'stopped':
            return 'x-circle-fill';
        default:
            return 'question-circle-fill';
    }
};

export default {
    getMonitoringStatus,
    getCurrentMetrics,
    getMetricsHistory,
    startMonitoring,
    stopMonitoring,
    getActiveAlerts,
    getSystemLogs,
    getBackupStats,
    getCacheStats,
    formatBytes,
    formatUptime,
    getStatusColor,
    getStatusIcon
};
