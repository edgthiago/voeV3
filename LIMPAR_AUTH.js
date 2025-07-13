// Script para limpar dados de autenticação no browser
// Execute no console do navegador

console.log('🧹 Limpando dados de autenticação...');

// Limpar localStorage
localStorage.removeItem('token');
localStorage.removeItem('usuario');

// Limpar sessionStorage
sessionStorage.removeItem('token');
sessionStorage.removeItem('usuario');

// Limpar todos os itens relacionados à autenticação
const keys = Object.keys(localStorage);
keys.forEach(key => {
  if (key.includes('auth') || key.includes('user') || key.includes('token')) {
    localStorage.removeItem(key);
    console.log('🗑️ Removido:', key);
  }
});

console.log('✅ Limpeza concluída! Recarregue a página e tente fazer login novamente.');

// Recarregar a página
window.location.reload();
