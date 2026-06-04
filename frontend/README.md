# 🐾 PetConnect - Aplicativo de Conectividade Animal

> **Seu app totalmente direcionado a ajudar animais**

PetConnect é uma aplicação mobile desenvolvida com **Ionic e Angular** que conecta pessoas, ONGs e animais, facilitando adoções, doações e denúncias de maus-tratos animal.

![Versão](https://img.shields.io/badge/versão-0.0.1-blue)
![Stack](https://img.shields.io/badge/stack-Ionic%208%20%2B%20Angular%2020-orange)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Sumário

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Stack Tecnológico](#-stack-tecnológico)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Setup](#-instalação-e-setup)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Guia de Uso](#-guia-de-uso)
- [Contribuição](#-contribuição)

---

## 🎯 Visão Geral

PetConnect é uma plataforma social focada no bem-estar animal que permite:

✅ **Encontrar e adotar animais** de resgatistas e ONGs  
✅ **Fazer doações** via PIX para organizações protetoras  
✅ **Denunciar maus-tratos** animal de forma segura  
✅ **Comunicar-se** diretamente com ONGs através de chat  
✅ **Compartilhar postagens** sobre animais em situação de risco  
✅ **Gerenciar perfil pessoal** com histórico de ações  

O app promove uma comunidade engajada no cuidado e proteção animal.

---

## 🚀 Funcionalidades

### 🏠 **Tela Inicial (Início)**

A página principal do aplicativo apresenta:

- **Comunicados**: Cards de avisos importantes sobre animais em situação de risco
- **Apoie uma ONG**: Listagem de organizações para doações via PIX
- **Filtro de busca**: Pesquisa rápida por nome ou localização das ONGs
- **Design moderno**: Interface intuitiva com cards informativos

**Acesso**: Menu inferior - ícone de casa

---

### ❤️ **Adoções**

Seção dedicada para encontrar e adotar animais:

#### Funcionalidades:
- 🔍 **Busca avançada**: Pesquisa por nome de animal
- 🏷️ **Filtros dinâmicos**:
  - Tipo de animal (Gato, Cachorro, Coelho, Ave)
  - Cidade/região
  - Idade aproximada
  - Tamanho
  - Status de vacinação

- 📋 **Listagem de animais**: Cards com foto, nome, descrição
- 👁️ **Detalhes completos**: Página dedicada com informações detalhadas do animal
- 🤝 **Contato com ONG**: Iniciar conversa para saber mais sobre a adoção

#### Fluxo:
1. Acessar aba "Adoções"
2. Aplicar filtros desejados
3. Clicar no card do animal
4. Ver detalhes e entrar em contato com a ONG responsável

**Acesso**: Menu inferior - ícone de coração

---

### 🚨 **Denúncias**

Sistema seguro para reportar casos de maus-tratos animal:

#### Funcionalidades:
- 📝 **Formulário de denúncia**: Campos para descrição detalhada
- 📸 **Envio de fotos/vídeos**: Documentar evidências
- 📍 **Localização**: Registrar local do incidente
- 🔒 **Anonimato opcional**: Denunciar sem identificação
- ✅ **Confirmação**: Receber número de protocolo de denúncia
- 📊 **Histórico**: Ver status das denúncias já realizadas

#### Processo:
1. Acessar aba "Denúncias"
2. Preencher formulário com detalhes
3. Anexar evidências (fotos/vídeos)
4. Confirmar envio
5. Receber protocolo para acompanhamento

**Acesso**: Menu inferior - ícone de alerta

---

### 💬 **Chat com ONG**

Comunicação direta com organizações:

#### Funcionalidades:
- 💭 **Conversas em tempo real**: Chat com ONGs responsáveis por animais
- 📬 **Histórico de mensagens**: Manter conversa salva
- 📱 **Notificações**: Receber resposta das ONGs
- 🔗 **Contexto**: Mensagens vinculadas a animal específico

**Uso**: Acessar pelo card de animal ou seção de chat direto.

---

### 📄 **Postagens**

Compartilhar conteúdo sobre animais:

#### Funcionalidades:
- ✍️ **Criar postagem**: Texto, fotos e descrição
- 🖼️ **Upload de imagens**: Galeria ou câmera
- ❤️ **Reações**: Curtir e comentar em postagens
- 💬 **Comentários**: Discussão sobre tópicos
- 🔄 **Compartilhar**: Repassar para mais pessoas
- 🔍 **Busca**: Encontrar postagens por tema

**Acesso**: Botão flutuante (+) no menu inferior

---

### 👤 **Perfil**

Gerenciamento de dados pessoais e histórico:

#### Funcionalidades:
- 📋 **Informações pessoais**: Nome, email, telefone, localização
- 🖼️ **Foto de perfil**: Upload e customização
- 📊 **Estatísticas**:
  - Animais adotados
  - Doações realizadas
  - Denúncias enviadas
  - Postagens criadas

- ✏️ **Editar perfil**: Atualizar dados a qualquer momento
- 🔐 **Segurança**: Alterar senha
- 📞 **Suporte**: Contato com time de suporte

**Acesso**: Menu inferior

---

### 🆔 **Autenticação**

Sistema seguro de login e registro:

#### Funcionalidades:
- 📱 **Registro**: Email, senha, dados pessoais
- 🔑 **Login**: Autenticação segura
- 🔐 **Recuperação de senha**: Via email de confirmação
- ✔️ **Verificação de email**: Código de confirmação
- 🔒 **Sessão persistente**: Manter-se conectado

---

### 📢 **Comunicados**

Sistema de notificações e avisos:

#### Funcionalidades:
- 📌 **Avisos importantes**: Sobre animais em situação crítica
- ⏰ **Data e hora**: Registro quando o aviso foi criado
- 🔔 **Notificações**: Alertas para comunicados novos
- 🔖 **Categorização**: Alertas por tipo/urgência

**Acesso**: Tela inicial

---

### 💳 **Doações via PIX**

Suporte direto a ONGs:

#### Funcionalidades:
- 🏷️ **Listar ONGs**: Organizações apoiadas
- 💰 **Valores flexíveis**: Escolher quanto doar
- 🔑 **PIX instantâneo**: Integração com sistema de pagamento
- 📜 **Comprovante**: Receber confirmação de doação
- 📊 **Histórico**: Ver doações realizadas

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnologia | Versão | Função |
|-----------|--------|---------|
| **Ionic Framework** | 8.0.0 | Framework mobile híbrido |
| **Angular** | 20.3.16 | Framework JS para SPA |
| **TypeScript** | - | Tipagem estática |
| **SCSS** | - | Preprocessador CSS |
| **RxJS** | 7.8.0 | Programação reativa |
| **Ionicons** | 7.0.0 | Ícones vetoriais |

### Ferramentas de Build & Dev
| Ferramenta | Versão | Função |
|-----------|--------|---------|
| **Angular CLI** | 20.3.24 | CLI do Angular |
| **Ionic CLI** | - | CLI do Ionic |
| **TypeScript Compiler** | 5.x | Compilador TS |
| **Webpack** | - | Module bundler |

### QA & Lint
| Ferramenta | Versão | Função |
|-----------|--------|---------|
| **Karma** | 6.4.0 | Test runner |
| **Jasmine** | 5.1.0 | Framework de testes |
| **ESLint** | 9.16.0 | Linter JavaScript |
| **Angular ESLint** | 20.0.0 | ESLint para Angular |

---

## 📦 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:

```bash
# Node.js e npm
node --version  # v18.0.0 ou superior
npm --version   # v9.0.0 ou superior

# Ionic CLI (opcional, mas recomendado)
npm install -g ionic

# Git
git --version
```

---

## 🚀 Instalação e Setup

### 1️⃣ **Clonar Repositório**

```bash
git clone https://github.com/seu-usuario/front-tcc.git
cd front-tcc
```

### 2️⃣ **Instalar Dependências**

```bash
npm install
```

### 3️⃣ **Configurar Variáveis de Ambiente**

Criar arquivo `.env` na raiz do projeto (se necessário):

```env
IONIC_ENV=development
API_URL=http://localhost:3000/api
```

### 4️⃣ **Iniciar Servidor de Desenvolvimento**

```bash
# Opção 1: Usando Ionic CLI
ionic serve

# Opção 2: Usando Angular CLI
ng serve

# Ambos estarão disponíveis em: http://localhost:4200
```

### 5️⃣ **Build para Produção**

```bash
ng build --configuration production
```

### 6️⃣ **Executar Testes**

```bash
# Testes unitários
ng test

# Testes com coverage
ng test --code-coverage

# Testes e2e (se configurado)
ng e2e
```

### 7️⃣ **Lint do Código**

```bash
ng lint
```

---

## 📂 Estrutura do Projeto

```
front-tcc/
├── src/
│   ├── app/
│   │   ├── components/              # Componentes reutilizáveis
│   │   │   ├── footer/
│   │   │   ├── topbar/
│   │   │   └── explore-container/
│   │   ├── pages/                   # Páginas principais
│   │   │   ├── inicio/              # Tela inicial com comunicados
│   │   │   ├── adocoes/             # Listagem e filtro de adoções
│   │   │   ├── adocoes-detalhes/    # Detalhes de animal
│   │   │   ├── denuncias/           # Sistema de denúncias
│   │   │   ├── denuncias-detalhes/  # Detalhes da denúncia
│   │   │   ├── doacoes/             # Doações via PIX
│   │   │   ├── doacoes-detalhes/    # Detalhes da ONG
│   │   │   ├── chat-ong/            # Chat com ONG
│   │   │   ├── postagem/            # Criar/editar postagens
│   │   │   ├── comentario/          # Gerenciar comentários
│   │   │   ├── comunicado/          # Detalhes do comunicado
│   │   │   ├── perfil/              # Perfil do usuário
│   │   │   ├── perfil-publico/      # Perfil de outra pessoa
│   │   │   ├── editar-perfil/       # Editar dados pessoais
│   │   │   ├── home/                # Landing page
│   │   │   ├── login/               # Autenticação
│   │   │   ├── registro/            # Cadastro de novo usuário
│   │   │   ├── recuperar-senha/     # Reset de senha
│   │   │   ├── nova-senha/          # Definir nova senha
│   │   │   ├── codigo-verificacao/  # Validação 2FA
│   │   │   └── tabs/                # Layout com tabs
│   │   ├── services/                # Serviços (APIs, lógica)
│   │   │   └── api.service.ts       # Conexão com backend
│   │   ├── guards/                  # Guards de rota (auth)
│   │   ├── app-routing.module.ts    # Roteamento principal
│   │   ├── app.component.ts         # Componente raiz
│   │   └── app.module.ts            # Módulo principal
│   ├── assets/                      # Imagens, ícones, etc
│   │   ├── icon/
│   │   ├── logo.png
│   │   └── ...
│   ├── theme/                       # Temas e variáveis SCSS
│   │   └── variables.scss
│   ├── global.scss                  # Estilos globais
│   ├── index.html                   # HTML entry point
│   ├── main.ts                      # Bootstrap da aplicação
│   └── polyfills.ts                 # Polyfills do navegador
├── angular.json                     # Configuração Angular CLI
├── ionic.config.json                # Configuração Ionic
├── karma.conf.js                    # Configuração Karma (testes)
├── package.json                     # Dependências npm
├── tsconfig.json                    # Configuração TypeScript
└── README.md                        # Este arquivo
```

### 🗂️ **Estrutura de Páginas Detalhada**

Cada página segue o padrão:
```
pagina/
├── pagina.page.ts          # Lógica do componente
├── pagina.page.html        # Template
├── pagina.page.scss        # Estilos
├── pagina.page.spec.ts     # Testes
├── pagina-routing.module.ts # Rotas
└── pagina.module.ts        # Módulo (se não standalone)
```

---

## 💻 Guia de Uso

### 🚀 **Para Usuários Finais**

#### Primeiro Acesso:
1. Baixar o app
2. Criar conta (Home → Cadastro)
3. Preencher dados pessoais
4. Confirmar email
5. Fazer login

#### Navegação Principal:
- **Ícone Home**: Comunicados e doações
- **Ícone Coração**: Buscar e filtrar adoções
- **Ícone +**: Criar nova postagem
- **Ícone Alerta**: Denunciar maus-tratos
- **Perfil**: Gerenciar dados

### 👨‍💻 **Para Desenvolvedores**

#### Adicionar Nova Página:

```bash
# Gerar novo módulo
ionic generate page nome-pagina

# Arquivo criado em: src/app/nome-pagina/
```

#### Estrutura de Componente:

```typescript
// nome-pagina.page.ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nome-pagina',
  templateUrl: './nome-pagina.page.html',
  styleUrls: ['./nome-pagina.page.scss'],
  standalone: false // ou true se usar standalone
})
export class NomePaginaPage implements OnInit {
  constructor() { }
  
  ngOnInit() {
    // Inicialização
  }
}
```

#### Adicionar Rota:

```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: 'nome-pagina',
    loadChildren: () => 
      import('./nome-pagina/nome-pagina.module')
        .then(m => m.NomePaginaPageModule)
  }
];
```

#### Consumir API:

```typescript
// Injetar ApiService
constructor(private api: ApiService) {}

// Usar serviço
this.api.get('/animais').subscribe(
  (dados) => console.log(dados),
  (erro) => console.error(erro)
);
```

---

## 🎨 **Temas e Cores**

### Cor Principal: **#3ecf8e** 🟢

O app utiliza uma paleta verde moderna para reforçar o tema de cuidado animal:

```scss
// theme/variables.scss
--ion-color-primary: #3ecf8e;    // Verde principal
--ion-color-primary-rgb: 62, 207, 142;

// Gradientes
background: linear-gradient(135deg, #5ad9a3 0%, #3ecf8e 100%);
```

### Componentes Customizados:
- ✅ Buttons com cor padrão
- ✅ Toolbars com gradiente
- ✅ Cards com sombras suaves
- ✅ Ícones em verde

---

## 📚 **Padrões e Boas Práticas**

### TypeScript
- ✅ Usar `strict: true` no tsconfig
- ✅ Evitar `any`, preferir tipos específicos
- ✅ Usar interfaces para contratos

### Angular
- ✅ Componentes funcionais (standalone quando possível)
- ✅ Services para lógica compartilhada
- ✅ RxJS para programação reativa
- ✅ Lazy loading de módulos

### HTML/Template
- ✅ Usar `[(ngModel)]` para two-way binding
- ✅ `*ngIf` para condicionalidade
- ✅ `*ngFor` para iterações
- ✅ Event binding com `(click)`, `(ionInput)`, etc

### SCSS
- ✅ Nesting com `&` para pseudo-seletores
- ✅ Variáveis para cores e tamanhos
- ✅ Mobile-first responsive design
- ✅ Comentários descritivos

---

## 🐛 **Troubleshooting**

### Erro: "Module not found"
```bash
# Limpar node_modules e reinstalar
rm -rf node_modules
npm install
```

### Erro: "Port 4200 already in use"
```bash
# Usar porta diferente
ng serve --port 4300
```

### Erro: "Ionic not found"
```bash
npm install -g ionic
```

### Erro de Build
```bash
# Limpar cache Angular
ng cache clean
ng build
```

---

## 📋 **Checklist de Desenvolvimento**

- [ ] Código seguindo padrão ESLint
- [ ] Testes unitários escritos
- [ ] Responsivo em mobile e tablet
- [ ] Sem console.log em produção
- [ ] Tratamento de erros implementado
- [ ] Loading indicators enquanto aguarda API
- [ ] Validação de formulários
- [ ] Mensagens de sucesso/erro amigáveis

---

## 🤝 **Contribuição**

### Como Contribuir

1. **Fork** o projeto
2. Criar uma **branch** para sua feature (`git checkout -b feature/MinhaFeature`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. **Push** para a branch (`git push origin feature/MinhaFeature`)
5. Abrir um **Pull Request**

### Diretrizes
- Seguir o padrão de código existente
- Adicionar testes para novas funcionalidades
- Atualizar README se necessário
- Usar commit messages descritivas

---

## 📝 **Licença**

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 👥 **Autores**

- **Desenvolvedor(a)**: [Seu Nome]
- **Instituição**: [Seu Curso/Universidade]
- **Ano**: 2025-2026

---

## 📞 **Suporte e Contato**

- 📧 Email: [seu-email@example.com]
- 💬 Issues: Abrir issue no GitHub
- 🐦 Twitter: [@seu-usuario]

---

## 🙏 **Agradecimentos**

- Ionic Framework pela excelente documentação
- Angular Community
- Comunidade de protetores de animais que inspiram este projeto

---

## 📊 **Estatísticas do Projeto**

```
Total de Páginas: 15+
Total de Componentes: 5+
Linhas de Código (aproximado): 10.000+
Arquivos SCSS: 20+
Testes Unitários: [em desenvolvimento]
Cobertura: [em desenvolvimento]
```

---

## 🗺️ **Roadmap Futuro**

- [ ] Integração com mapa (Google Maps)
- [ ] Push notifications
- [ ] Modo offline
- [ ] App nativa (iOS/Android com Capacitor)
- [ ] Backend GraphQL
- [ ] Progressive Web App (PWA)
- [ ] Suporte a múltiplos idiomas
- [ ] Gamificação (badges, pontos)
- [ ] AI para recomendação de animais
- [ ] Integração com redes sociais

---

**Desenvolvido com ❤️ para ajudar animais** 🐾

*Last updated: Junho 2026*

