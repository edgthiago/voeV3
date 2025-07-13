# 🔑 CREDENCIAIS DE TESTE - SISTEMA VOE V3

## 👨‍💼 **USUÁRIOS DISPONÍVEIS**

### 🔴 **DIRETOR** (Acesso Total)
- **Email**: `admin@teste.com`
- **Senha**: `123456`
- **Acesso**: Todas as funcionalidades administrativas
- **Redirecionamento**: `/admin/diretor`

### 🟡 **SUPERVISOR** (Gestão Operacional)
- **Email**: `supervisor@teste.com`
- **Senha**: `123456`
- **Acesso**: Relatórios, promoções, dashboards avançados
- **Redirecionamento**: `/admin/supervisor`

### 🔵 **COLABORADOR** (Operações Básicas)
- **Email**: `colaborador@teste.com`
- **Senha**: `123456`
- **Acesso**: Produtos, pedidos, estoque
- **Redirecionamento**: `/admin/colaborador`

### 🟢 **USUÁRIO COMUM**
- **Email**: `usuario@teste.com`
- **Senha**: `123456`
- **Acesso**: Área do cliente, compras
- **Redirecionamento**: `/dashboard`

---

## 🧪 **TESTE RÁPIDO DE LOGIN**

### Via cURL (Diretor):
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@teste.com","senha":"123456"}'
```

### Via cURL (Colaborador):
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"colaborador@teste.com","senha":"123456"}'
```

---

## ✅ **STATUS DE CORREÇÃO**

### Problemas Corrigidos:
- ✅ **Proxy configurado** no Vite
- ✅ **API conectada** corretamente
- ✅ **AuthContext integrado** no componente de login
- ✅ **Redirecionamento** baseado no nível de acesso
- ✅ **Logs detalhados** para debugging

### Fluxo de Login:
1. **Usuário insere credenciais** → Componente Entrar.jsx
2. **AuthContext.login()** → Chama integracaoService
3. **API /auth/login** → Valida credenciais no backend
4. **Token armazenado** → localStorage + AuthContext
5. **Redirecionamento** → Baseado no tipo_usuario

---

## 🚀 **PRÓXIMOS PASSOS**

1. **Testar login** no browser: http://localhost:3001/entrar
2. **Verificar redirecionamento** automático
3. **Validar funcionalidades** em cada nível de acesso
4. **Confirmar dados reais** nas telas administrativas

---

**📅 Atualizado**: 10 de Julho de 2025  
**🎯 Status**: Pronto para teste no browser
