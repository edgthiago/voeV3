#!/usr/bin/env node

/**
 * 🔍 TESTE DEBUG API
 * Data: 09 de Julho de 2025
 * Objetivo: Debugar API e verificar dados retornados
 */

const https = require('https');
const http = require('http');

const makeRequest = (url) => {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        
        client.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (err) {
                    resolve(data);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
};

async function testarAPI() {
    console.log('🔍 Testando API do Backend...\n');
    
    const endpoints = [
        'http://localhost:30011/api/health',
        'http://localhost:30011/api/monitoring/metrics',
        'http://localhost:30011/api/monitoring/alerts',
        'http://localhost:30011/api/monitoring/metrics/history?days=1'
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`📡 Testando: ${endpoint}`);
            const response = await makeRequest(endpoint);
            
            if (typeof response === 'object') {
                console.log('✅ Resposta JSON:');
                console.log(JSON.stringify(response, null, 2));
            } else {
                console.log('⚠️ Resposta não-JSON:');
                console.log(response.substring(0, 200) + '...');
            }
            
            console.log('─'.repeat(80));
        } catch (error) {
            console.error(`❌ Erro em ${endpoint}:`, error.message);
            console.log('─'.repeat(80));
        }
    }
}

testarAPI().catch(console.error);
