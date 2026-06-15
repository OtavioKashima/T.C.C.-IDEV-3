# API de Denúncias e Postagens

Uma API REST desenvolvida em Node.js que conecta cidadãos a ONGs através de um sistema de denúncias e postagens direcionadas. Projeto acadêmico (TCC).

## 📋 Sobre o Projeto

Esta é uma plataforma backend que permite:
- **Cadastro e autenticação** de usuários com segurança via JWT
- **Gerenciamento de postagens** com suporte a múltiplas imagens
- **Sistema de denúncias** direcionadas a ONGs específicas
- **Comentários** em postagens
- **Perfis de usuário** com informações pessoais e chave PIX
- **Diferenciação de perfil** (usuários comuns e ONGs)

## 🛠️ Stack Tecnológico

- **Runtime**: Node.js
- **Framework**: Express.js
- **Banco de Dados**: MySQL 8.0+
- **Autenticação**: JWT (JSON Web Token)
- **Criptografia**: bcrypt
- **Upload de Arquivos**: Multer
- **CORS**: Habilitado para requisições cross-origin
- **Variáveis de Ambiente**: dotenv

## 📦 Dependências

```json
{
  "bcrypt": "^6.0.0",
  "cors": "^2.8.6",
  "dotenv": "^17.2.3",
  "express": "^5.1.0",
  "jsonwebtoken": "^9.0.2",
  "multer": "^2.1.1",
  "mysql2": "^3.15.2",
  "nodemon": "^3.1.14"
}
```

## 🚀 Como Iniciar

### Pré-requisitos
- Node.js (v14+)
- MySQL Server
- npm ou yarn

### Instalação

1. **Clone o repositório**
```bash
git clone <seu-repositorio>
cd Back2provis-rio
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:
```env
JWT_SECRET=sua_chave_secreta_jwt_aqui
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=banco_tcc
DB_PORT=3306
```

4. **Crie o banco de dados**

Execute as migrations no MySQL:
```sql
CREATE DATABASE banco_tcc;
-- Execute os scripts SQL necessários
```

5. **Inicie o servidor**

**Modo desenvolvimento (com hot-reload):**
```bash
npm run dev
```

**Modo produção:**
```bash
npm start
```

O servidor rodará em `http://localhost:3000`

## 📚 Estrutura do Projeto

```
Back2provis-rio/
├── config/
│   └── db.js                 # Configuração de conexão MySQL
├── controllers/
│   ├── usuarioController.js  # Lógica de usuários
│   ├── postagemController.js # Lógica de postagens
│   └── comentariosController.js # Lógica de comentários
├── middleware/
│   ├── authMiddleware.js     # Autenticação JWT
│   ├── errorMiddleware.js    # Tratamento de erros
│   └── configMulter.js       # Configuração de uploads
├── routes/
│   ├── usuarioRoute.js       # Rotas de usuários
│   ├── postagemRoute.js      # Rotas de postagens
│   └── comentariosRoute.js   # Rotas de comentários
├── uploads/                  # Pasta para armazenar arquivos enviados
├── server.js                 # Arquivo principal da aplicação
├── package.json
└── README.md
```

## 🔌 Endpoints da API

### Usuários
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/usuarios` | Cadastrar novo usuário | ❌ |
| POST | `/api/login` | Fazer login | ❌ |
| GET | `/api/perfil` | Obter perfil do usuário logado | ✅ |
| GET | `/api/usuarios/:id` | Obter dados de um usuário | ❌ |
| PUT | `/api/perfiledit` | Atualizar perfil | ✅ |
| DELETE | `/api/perfildelete` | Deletar perfil | ✅ |
| GET | `/api/ongs` | Listar todas as ONGs | ❌ |

### Postagens
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/postagens` | Criar nova postagem | ✅ |
| GET | `/api/postagens/tipo/:tipo` | Listar postagens por tipo | ❌ |
| GET | `/api/postagens/usuario/:id` | Listar postagens de um usuário | ❌ |
| GET | `/api/postagens/:id` | Obter detalhes de uma postagem | ❌ |
| GET | `/api/postagens/direcionadas/:ong_id` | Listar denúncias para uma ONG | ❌ |
| GET | `/api/postperfil` | Listar postagens do usuário logado | ✅ |
| PUT | `/api/postperfil/:id` | Atualizar postagem | ✅ |
| DELETE | `/api/postagensDelete/:id` | Deletar postagem | ✅ |

## 🔐 Autenticação

A API usa **JWT (JSON Web Token)** para proteger rotas que necessitam autenticação.

### Como usar:
1. Faça login em `/api/login` com email e senha
2. Você receberá um token JWT
3. Para acessar rotas protegidas, envie o token no header:
```
Authorization: Bearer seu_token_jwt_aqui
```

## 📸 Upload de Arquivos

O projeto usa **Multer** para gerenciar uploads:
- **Foto de perfil**: Limite de 1 arquivo
- **Fotos de postagens**: Limite de 10 arquivos por postagem
- Os arquivos são salvos na pasta `/uploads`

## 🗄️ Banco de Dados

O projeto usa **MySQL** com as seguintes tabelas principais:
- `usuarios` - Dados de usuários e ONGs
- `postagens` - Postagens e denúncias
- `comentarios` - Comentários nas postagens

## ⚠️ Variáveis de Ambiente

Crie um arquivo `.env` com:
```env
JWT_SECRET=sua_chave_secreta_jwt
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=banco_tcc
DB_PORT=3306
PORT=3000
```

## 📝 Funcionalidades Principais

✅ Autenticação segura com JWT
✅ Cadastro de usuários e ONGs
✅ Sistema de postagens com múltiplas imagens
✅ Upload e armazenamento de fotos
✅ Denúncias direcionadas a ONGs específicas
✅ Comentários em postagens
✅ Perfis de usuário com informações pessoais
✅ Suporte a chave PIX para doações
✅ Tratamento de erros centralizado
✅ CORS habilitado

## 🐛 Tratamento de Erros

A API possui middleware centralizado de tratamento de erros que retorna respostas consistentes com:
- Código HTTP apropriado
- Mensagem de erro descritiva
- Validação de entrada em todos os endpoints

## 📞 Suporte e Contribuições

Para reportar bugs ou sugerir melhorias, abra uma issue no repositório.

## 📄 Licença

ISC

## 👤 Autor

Desenvolvido como Trabalho de Conclusão de Curso (TCC)
