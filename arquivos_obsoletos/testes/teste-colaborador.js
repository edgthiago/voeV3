/**
 * 🧪 TESTE FUNCIONALIDADES DO COLABORADOR
 * Data: 09 de Julho de 2025
 * Objetivo: Testar todas as funcionalidades do colaborador
 */

console.log('🧪 Testando funcionalidades do colaborador...');

async function testarColaborador() {
    try {
        // 1. Fazer login como colaborador
        console.log('🔐 1. Fazendo login como colaborador...');
        const loginResponse = await fetch('http://localhost:30011/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'colaborador@teste.com',
                senha: '123456'
            })
        });

        if (!loginResponse.ok) {
            throw new Error('Falha no login do colaborador');
        }

        const loginData = await loginResponse.json();
        console.log('✅ Login realizado:', loginData.dados?.usuario?.nome || loginData.usuario?.nome);
        
        const token = loginData.dados?.token || loginData.token;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 2. Testar estatísticas de produtos
        console.log('\n📊 2. Testando estatísticas de produtos...');
        const statsResponse = await fetch('http://localhost:30011/api/produtos/admin/estatisticas', {
            headers
        });
        
        if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            console.log('✅ Estatísticas:', statsData.dados);
        } else {
            console.error('❌ Erro nas estatísticas:', await statsResponse.text());
        }

        // 3. Testar dashboard do colaborador
        console.log('\n🏠 3. Testando dashboard do colaborador...');
        const dashboardResponse = await fetch('http://localhost:30011/api/admin/dashboard', {
            headers
        });
        
        if (dashboardResponse.ok) {
            const dashboardData = await dashboardResponse.json();
            console.log('✅ Dashboard:', Object.keys(dashboardData.dados || {}));
        } else {
            console.error('❌ Erro no dashboard:', await dashboardResponse.text());
        }

        // 4. Testar lista de produtos para administração
        console.log('\n📦 4. Testando produtos para administração...');
        const produtosResponse = await fetch('http://localhost:30011/api/admin/produtos', {
            headers
        });
        
        if (produtosResponse.ok) {
            const produtosData = await produtosResponse.json();
            console.log('✅ Produtos admin:', produtosData.dados?.length, 'produtos');
        } else {
            console.error('❌ Erro nos produtos admin:', await produtosResponse.text());
        }

        // 5. Testar pedidos para administração
        console.log('\n🛒 5. Testando pedidos para administração...');
        const pedidosResponse = await fetch('http://localhost:30011/api/admin/pedidos', {
            headers
        });
        
        if (pedidosResponse.ok) {
            const pedidosData = await pedidosResponse.json();
            console.log('✅ Pedidos admin:', pedidosData.dados?.length, 'pedidos');
        } else {
            console.error('❌ Erro nos pedidos admin:', await pedidosResponse.text());
        }

        // 6. Testar estatísticas administrativas
        console.log('\n📈 6. Testando estatísticas administrativas...');
        const adminStatsResponse = await fetch('http://localhost:30011/api/admin/stats', {
            headers
        });
        
        if (adminStatsResponse.ok) {
            const adminStatsData = await adminStatsResponse.json();
            console.log('✅ Stats admin:', Object.keys(adminStatsData.dados || {}));
        } else {
            console.error('❌ Erro nas stats admin:', await adminStatsResponse.text());
        }

        // 7. Testar relatório de estoque
        console.log('\n📋 7. Testando relatório de estoque...');
        const estoqueResponse = await fetch('http://localhost:30011/api/admin/relatorios/estoque', {
            headers
        });
        
        if (estoqueResponse.ok) {
            const estoqueData = await estoqueResponse.json();
            console.log('✅ Relatório estoque:', estoqueData.dados?.length, 'itens');
        } else {
            console.error('❌ Erro no relatório estoque:', await estoqueResponse.text());
        }

        console.log('\n🎉 TESTE CONCLUÍDO! Verifique os resultados acima.');

    } catch (error) {
        console.error('❌ Erro geral no teste:', error.message);
    }
}

// Executar teste
testarColaborador();
