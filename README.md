# 🌸 Voe Papel - Papelaria Online

![Voe Papel](./frontend/img/voePapel/voePapel.jpeg)

Uma plataforma de e-commerce completa especializada em papelaria, materiais de escritório e produtos de arte. Desenvolvida com React no frontend e Node.js no backend, com design moderno em tons pastéis.

## 🚀 Funcionalidades

- � Catálogo completo de produtos de papelaria com filtros e busca
- 🛒 Carrinho de compras integrado e persistente
- 💳 Checkout completo com múltiplas formas de pagamento (PIX, Cartão, Boleto)
- 👤 Autenticação e registro de usuários
- 📊 Painel administrativo para gestão completa
- 📋 Sistema completo de pedidos e acompanhamento
- ⭐ Sistema de avaliações e comentários
- 🏷️ Promoções e descontos especiais
- 🎨 Design responsivo com tema rosa pastel
- 🔍 Filtros por categoria, marca, preço e tipo de material

## 🛠️ Tecnologias Utilizadas

### Frontend
- React 19
- Vite
- React Router DOM
- Context API para gerenciamento de estado
- CSS Modules + Bootstrap
- Axios para requisições HTTP

### Backend
- Node.js + Express
- MySQL para banco de dados
- JWT para autenticação
- bcrypt para criptografia de senhas
- CORS para requisições cross-origin

## 📋 Requisitos

- Node.js v18 ou superior
- NPM v9 ou superior  
- MySQL 8.0 ou superior

## ⚙️ Instalação e Configuração

### 1. Clone o repositório
```bash
git clone [URL_DO_REPOSITORIO]
cd projetofgt
```

### 2. Configuração do Backend

```bash
cd backend
npm install
```

**IMPORTANTE**: Crie o arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Configurações do Banco de Dados MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=papelaria

# Configurações do Servidor
PORT=5000
NODE_ENV=development

# Configurações de Segurança (MUDE EM PRODUÇÃO!)
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui
SESSION_SECRET=sua_session_secret_muito_segura_aqui

# CORS - Frontend URL
FRONTEND_URL=http://localhost:3000
```

```
projetofgt/
├── backend/                 # Servidor Node.js + Express
│   ├── banco/              # Scripts e configurações do banco
│   ├── middleware/         # Middlewares customizados
│   ├── modelos/           # Models do banco de dados
│   ├── rotas/             # Rotas da API
│   ├── utils/             # Utilitários e helpers
│   ├── .env.example       # Template de configuração
│   ├── package.json       # Dependências do backend
│   └── servidor.js        # Arquivo principal do servidor
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── context/       # Contextos React
│   │   ├── hooks/         # Hooks customizados
│   │   └── services/      # Serviços e API calls
│   ├── public/            # Arquivos estáticos
│   ├── package.json       # Dependências do frontend
│   └── vite.config.js     # Configuração do Vite
└── README.md              # Este arquivo
```

## 🧪 Testes

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## 📝 Desenvolvimento

### Scripts Disponíveis

#### Backend
- `npm start` - Inicia o servidor em modo produção
- `npm run dev` - Inicia o servidor em modo desenvolvimento
- `npm test` - Executa os testes

#### Frontend  
- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build para produção
- `npm run preview` - Preview do build de produção

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas, entre em contato através do email: [seu-email@exemplo.com]

---

⚠️ **IMPORTANTE**: 
- Sempre crie o arquivo `.env` no backend antes de executar o projeto
- Configure corretamente o banco de dados MySQL
- Em produção, altere as chaves secretas do JWT e Session

Execute os scripts SQL na ordem:

```bash
# Conecte ao MySQL e execute:
mysql -u root -p < banco/criar_tabelas.sql
mysql -u root -p < banco/inserir_dados.sql
```

### 4. Configuração do Frontend

```bash
cd frontend
npm install
```

## 🚀 Execução do Projeto

### Backend
```bash
cd backend
npm start
```
O servidor estará disponível em: http://localhost:5000

### Frontend
```bash
cd frontend
npm run dev
```
A aplicação estará disponível em: http://localhost:3000

## 🌐 Endpoints da API

- `GET /api/produtos` - Lista todos os produtos
- `GET /api/produtos/:id` - Detalhes de um produto
- `POST /api/auth/login` - Login do usuário
- `POST /api/auth/register` - Registro de usuário
- `GET /api/carrinho` - Carrinho do usuário
- `POST /api/pedidos` - Criar novo pedido

Documentação completa da API: http://localhost:5000/api/info

## 📁 Estrutura do Projeto
npm run dev
```

## Uso

Após iniciar o frontend e o backend, acesse:

- Frontend: http://localhost:5173
- API Backend: http://localhost:3000

## Desenvolvimento

### Scripts disponíveis

**Frontend:**
- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Compila o projeto para produção
- `npm run preview`: Visualiza a versão compilada

**Backend:**
- `npm run start`: Inicia o servidor
- `npm run dev`: Inicia o servidor com hot-reload

## Correções recentes

- Corrigido problema de cálculo no carrinho onde itens sem quantidade definida eram tratados como quantidade 1 em vez de 0
- Melhorada a manipulação de valores inválidos no carrinho

## Licença

Este projeto é licenciado sob a licença MIT.
