// Script de correção de inconsistências - VoeV3
const conexao = require('./banco/conexao');

async function corrigirInconsistenciasCompletas() {
  try {
    console.log('🚀 INICIANDO CORREÇÃO COMPLETA DE INCONSISTÊNCIAS...\n');
    
    // 1. Verificar inconsistências antes da correção
    console.log('📊 VERIFICANDO INCONSISTÊNCIAS ANTES DA CORREÇÃO:');
    const antesCorrecao = await conexao.executarConsulta(`
      SELECT id, nome, email, tipo_usuario, tipo 
      FROM usuarios 
      WHERE tipo_usuario != tipo OR tipo IS NULL 
      ORDER BY id LIMIT 10
    `);
    
    console.log(`Encontradas ${antesCorrecao.length} inconsistências:`);
    antesCorrecao.forEach(u => {
      console.log(`  ID: ${u.id} | ${u.nome} | tipo_usuario: ${u.tipo_usuario} | tipo: ${u.tipo}`);
    });
    
    // 2. Corrigir todas as inconsistências
    console.log('\n🔄 EXECUTANDO CORREÇÃO...');
    const resultado = await conexao.executarConsulta(`
      UPDATE usuarios 
      SET tipo = tipo_usuario 
      WHERE tipo != tipo_usuario OR tipo IS NULL
    `);
    
    console.log(`✅ ${resultado.affectedRows} registros corrigidos com sucesso!`);
    
    // 3. Verificar se ainda há inconsistências
    console.log('\n🔍 VERIFICANDO APÓS CORREÇÃO:');
    const aposCorrecao = await conexao.executarConsulta(`
      SELECT COUNT(*) as total 
      FROM usuarios 
      WHERE tipo_usuario != tipo OR tipo IS NULL
    `);
    
    console.log(`Inconsistências restantes: ${aposCorrecao[0].total}`);
    
    // 4. Verificar Thiago Costa especificamente
    console.log('\n👤 VERIFICANDO THIAGO COSTA:');
    const thiago = await conexao.executarConsulta(`
      SELECT id, nome, email, tipo_usuario, tipo, status
      FROM usuarios 
      WHERE email = ?
    `, ['thiagoeucosta@gmail.com']);
    
    if (thiago.length > 0) {
      const t = thiago[0];
      console.log(`✅ ID: ${t.id} | ${t.nome}`);
      console.log(`✅ Email: ${t.email}`);
      console.log(`✅ tipo_usuario: ${t.tipo_usuario}`);
      console.log(`✅ tipo: ${t.tipo}`);
      console.log(`✅ Status: ${t.status}`);
      console.log(t.tipo_usuario === t.tipo ? '✅ CONSISTENTE!' : '❌ AINDA INCONSISTENTE');
    }
    
    // 5. Verificar distribuição por tipo após correção
    console.log('\n📊 DISTRIBUIÇÃO POR TIPO APÓS CORREÇÃO:');
    const distribuicao = await conexao.executarConsulta(`
      SELECT tipo_usuario, COUNT(*) as total 
      FROM usuarios 
      GROUP BY tipo_usuario 
      ORDER BY total DESC
    `);
    
    distribuicao.forEach(d => {
      console.log(`  ${d.tipo_usuario}: ${d.total} usuários`);
    });
    
    console.log('\n🎯 CORREÇÃO CONCLUÍDA COM SUCESSO!');
    
  } catch (erro) {
    console.error('❌ ERRO NA CORREÇÃO:', erro.message);
    throw erro;
  }
}

// Executar correção
corrigirInconsistenciasCompletas()
  .then(() => {
    console.log('\n✅ SCRIPT EXECUTADO COM SUCESSO!');
    process.exit(0);
  })
  .catch((erro) => {
    console.error('\n❌ FALHA NO SCRIPT:', erro.message);
    process.exit(1);
  });
