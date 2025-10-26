# 🚀 Huntly Admin Dashboard

Dashboard administrativo completo para gestão de leads, clientes, projetos e finanças da Huntly - empresa especializada em multi-agent systems, automações e desenvolvimento de sistemas web.

## ✨ Funcionalidades

### 📊 Dashboard Principal
- Métricas em tempo real (leads, clientes, projetos, receita)
- Gráficos de receitas e despesas (últimos 6 meses)
- Distribuição de leads por status
- Lista de projetos recentes
- Indicadores financeiros (receita, despesa, margem de lucro)

### 👥 Gestão de Leads
- ✅ Cadastro completo de leads
- ✅ Acompanhamento de status (Novo, Contactado, Qualificado, etc.)
- ✅ Rastreamento de origem (Website, Redes Sociais, Indicação, etc.)
- ✅ Conversão automática de lead para cliente
- ✅ Valor estimado e observações
- ✅ CRUD completo (Create, Read, Update, Delete)

### 🏢 Gestão de Clientes
- ✅ Cadastro detalhado de clientes
- ✅ Informações empresariais (CNPJ, endereço, website)
- ✅ Status de cliente (Ativo, Inativo, Perdido)
- ✅ Histórico de projetos e transações
- ✅ CRUD completo

### 📁 Gestão de Projetos
- ✅ Criação e acompanhamento de projetos
- ✅ Status (Planejamento, Em Andamento, Concluído, etc.)
- ✅ Prioridades (Baixa, Média, Alta, Urgente)
- ✅ Controle de orçamento vs custo real
- ✅ Datas de início, prazo e conclusão
- ✅ Membros da equipe
- ✅ Vinculação com clientes
- ✅ CRUD completo

### 💰 Gestão Financeira
- ✅ Registro de receitas e despesas
- ✅ Categorização detalhada
- ✅ Vinculação com clientes e projetos
- ✅ Controle de notas fiscais e métodos de pagamento
- ✅ Cálculo automático de saldo
- ✅ Atualização automática de custos de projetos
- ✅ CRUD completo

## 🛠️ Tecnologias Utilizadas

- **Framework**: Next.js 16 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Componentes UI**: shadcn/ui
- **Banco de Dados**: PostgreSQL 16
- **ORM**: Prisma
- **Containerização**: Docker Compose
- **Gráficos**: Recharts
- **Ícones**: Lucide React
- **Manipulação de Datas**: date-fns

## 📋 Pré-requisitos

- Node.js 18+ 
- Docker e Docker Compose
- npm ou yarn

## 🚀 Instalação e Execução

### 1. Clone o repositório (se aplicável)
```bash
git clone <seu-repositorio>
cd huntly-admin-dashboard
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Inicie o banco de dados PostgreSQL
```bash
docker-compose up -d
```

Isso iniciará um container PostgreSQL na porta 5432.

### 4. Execute as migrations do Prisma
```bash
npx prisma migrate dev
```

### 5. (Opcional) Seed do banco de dados
Se quiser adicionar dados de exemplo, você pode criar um arquivo `prisma/seed.ts` e executar:
```bash
npx prisma db seed
```

### 6. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

### 7. Acesse o dashboard
Abra seu navegador e acesse: [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
huntly-admin-dashboard/
├── app/
│   ├── api/                    # API Routes (Next.js)
│   │   ├── dashboard/          # Métricas do dashboard
│   │   ├── leads/              # CRUD de Leads
│   │   ├── clientes/           # CRUD de Clientes
│   │   ├── projetos/           # CRUD de Projetos
│   │   └── financeiro/         # CRUD de Transações
│   ├── leads/                  # Página de Leads
│   ├── clientes/               # Página de Clientes
│   ├── projetos/               # Página de Projetos
│   ├── financeiro/             # Página Financeira
│   ├── layout.tsx              # Layout principal
│   ├── page.tsx                # Dashboard (página inicial)
│   └── globals.css             # Estilos globais
├── components/
│   ├── ui/                     # Componentes shadcn/ui
│   ├── nav.tsx                 # Navegação do dashboard
│   └── dashboard-layout.tsx    # Layout wrapper
├── lib/
│   ├── prisma.ts               # Cliente Prisma
│   └── utils.ts                # Utilitários
├── prisma/
│   ├── schema.prisma           # Schema do banco de dados
│   └── migrations/             # Migrations
├── docker-compose.yml          # Configuração Docker
├── .env                        # Variáveis de ambiente
└── package.json
```

## 🗄️ Schema do Banco de Dados

### Tabelas Principais

- **Lead**: Gestão de leads e pipeline de vendas
- **Client**: Clientes ativos da empresa
- **Project**: Projetos vinculados aos clientes
- **Transaction**: Receitas e despesas

### Relacionamentos

- Lead → Client (conversão)
- Client → Project (1:N)
- Client → Transaction (1:N)
- Project → Transaction (1:N)

## 🔧 Comandos Úteis

### Prisma
```bash
# Criar uma nova migration
npx prisma migrate dev --name nome_da_migration

# Gerar Prisma Client
npx prisma generate

# Abrir Prisma Studio (GUI do banco)
npx prisma studio

# Reset do banco de dados
npx prisma migrate reset
```

### Docker
```bash
# Iniciar containers
docker-compose up -d

# Parar containers
docker-compose down

# Ver logs
docker-compose logs -f

# Remover volumes (CUIDADO: apaga dados)
docker-compose down -v
```

### Next.js
```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar produção
npm start

# Lint
npm run lint
```

## 🎨 Personalização

### Cores do Tema
As cores podem ser personalizadas no arquivo `app/globals.css` nas variáveis CSS do shadcn/ui.

### Componentes
Adicione novos componentes do shadcn/ui:
```bash
npx shadcn@latest add [component-name]
```

## 🔐 Variáveis de Ambiente

Arquivo `.env`:
```env
DATABASE_URL="postgresql://huntly:huntly123@localhost:5432/huntly_dashboard?schema=public"
```

## 📱 Design Responsivo

O dashboard é totalmente responsivo:
- **Desktop**: Navegação lateral fixa
- **Mobile**: Menu hambúrguer com sheet lateral

## 🚢 Deploy

### Vercel (Recomendado para Next.js)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Use um banco PostgreSQL em produção (Vercel Postgres, Supabase, etc.)

### Outras Plataformas
- Railway
- Render
- DigitalOcean App Platform
- AWS (EC2 + RDS)

**Importante**: Não esqueça de:
- Usar variáveis de ambiente seguras
- Configurar um banco PostgreSQL em produção
- Executar migrations em produção

## 🤝 Contribuindo

1. Crie uma branch para sua feature
2. Faça commit das suas alterações
3. Push para a branch
4. Abra um Pull Request

## 📄 Licença

Este projeto foi desenvolvido para uso interno da Huntly.

## 👨‍💻 Desenvolvido por

Dashboard criado com ❤️ para a Huntly

---

**Huntly** - Multi-Agent Systems | Automações | Desenvolvimento Web
