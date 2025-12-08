# Guia de Deploy na Vercel

Este guia explica como fazer o deploy do Huntly Admin Dashboard na Vercel com Prisma e PostgreSQL.

## Pré-requisitos

1. Conta na Vercel
2. Banco de dados PostgreSQL em produção (sugestões: Neon, Supabase, Railway, ou Vercel Postgres)
3. Repositório Git (GitHub, GitLab, ou Bitbucket)

## Passo a Passo

### 1. Preparar o Banco de Dados

Primeiro, você precisa de um banco PostgreSQL em produção. Aqui estão algumas opções gratuitas:

**Opção A: Neon (Recomendado)**
- Acesse: https://neon.tech
- Crie uma conta gratuita
- Crie um novo projeto
- Copie a `DATABASE_URL` fornecida

**Opção B: Supabase**
- Acesse: https://supabase.com
- Crie um projeto
- Vá em Settings > Database > Connection String
- Use a connection string no formato direto (Direct connection)

**Opção C: Vercel Postgres**
- No dashboard da Vercel, vá em Storage > Create Database
- Escolha Postgres
- Copie a `DATABASE_URL`

### 2. Configurar Variáveis de Ambiente na Vercel

No dashboard da Vercel, vá em seu projeto > Settings > Environment Variables e adicione:

```
DATABASE_URL=sua_connection_string_postgresql_aqui
JWT_SECRET=gere_uma_string_aleatoria_segura_aqui
NODE_ENV=production
```

**IMPORTANTE:** 
- Para PostgreSQL na Vercel/Neon/Supabase, adicione `?pgbouncer=true&connection_limit=1` ao final da URL se estiver usando connection pooling
- Exemplo: `postgresql://user:pass@host/db?pgbouncer=true&connection_limit=1`

**Para gerar um JWT_SECRET seguro, use:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Fazer Deploy

#### Opção 1: Via Dashboard da Vercel (Recomendado para primeira vez)

1. Acesse https://vercel.com/new
2. Importe seu repositório Git
3. Configure as variáveis de ambiente (passo 2)
4. Clique em "Deploy"

A Vercel automaticamente:
- Instalará as dependências
- Gerará o Prisma Client (`postinstall` hook)
- Rodará as migrations (`prisma migrate deploy`)
- Buildará o projeto Next.js

#### Opção 2: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 4. Verificar o Deploy

Após o deploy, verifique:

1. **Build Logs**: Verifique se as migrations rodaram com sucesso
2. **Function Logs**: Monitore erros em tempo real
3. **Teste a aplicação**: Faça login e teste as funcionalidades

### 5. Configurações Avançadas

#### Connection Pooling (Importante para produção)

Se estiver usando Neon, Supabase ou outro provider com pooling:

1. Use a connection string com pooling
2. Adicione ao final da URL: `?pgbouncer=true&connection_limit=1`

#### Timeouts

Ajuste timeouts do Prisma se necessário em `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["jsonProtocol"]
}
```

### 6. Redeploy (Atualizações)

Para fazer redeploy após mudanças:

```bash
# Via Git (automático)
git push origin main

# Via CLI
vercel --prod
```

### 7. Migrations em Produção

**Para adicionar novas migrations:**

1. Desenvolva localmente e crie a migration:
   ```bash
   npx prisma migrate dev --name sua_migration
   ```

2. Commit e push:
   ```bash
   git add .
   git commit -m "Add new migration"
   git push
   ```

3. A Vercel automaticamente rodará `prisma migrate deploy` no build

**NUNCA** rode `prisma migrate dev` em produção! Sempre use `prisma migrate deploy`.

### 8. Rollback (Se necessário)

Se algo der errado:

1. Acesse o dashboard da Vercel
2. Vá em Deployments
3. Encontre o último deploy estável
4. Clique nos 3 pontos > "Promote to Production"

### 9. Monitoramento

- **Logs**: Vercel Dashboard > Seu Projeto > Functions
- **Analytics**: Vercel Dashboard > Analytics
- **Erros**: Configure Sentry ou similar para produção

## Troubleshooting

### Erro: "Can't reach database server"
- Verifique se a `DATABASE_URL` está correta
- Confirme que o IP da Vercel não está bloqueado no seu provider de database
- Teste a conexão localmente com a mesma URL

### Erro: "Migration failed"
- Verifique os logs de build na Vercel
- Certifique-se que todas as migrations estão commitadas
- Rode `npx prisma migrate resolve --applied <migration_name>` se necessário

### Erro: "P1002 - The database server was reached but timed out" (Advisory Lock Timeout)
Este erro ocorre quando o Prisma não consegue adquirir o advisory lock do PostgreSQL dentro do timeout padrão (10 segundos).

**Soluções:**
1. O script `vercel-build` já está configurado com timeout aumentado (30 segundos)
2. Se o problema persistir, adicione a variável de ambiente na Vercel:
   - Nome: `PRISMA_MIGRATE_LOCK_TIMEOUT`
   - Valor: `30000` (30 segundos em milissegundos)
3. Verifique se há conexões pendentes no banco de dados
4. Certifique-se de que não há múltiplos builds rodando simultaneamente

### Erro: "Prisma Client not generated"
- O `postinstall` hook deve resolver isso automaticamente
- Se persistir, adicione `prisma generate` manualmente no build command

### Performance Issues
- Considere usar connection pooling
- Ajuste o `connection_limit` na URL do database
- Use indexes apropriados no schema do Prisma

## Recursos Úteis

- [Vercel + Prisma Docs](https://vercel.com/guides/nextjs-prisma-postgres)
- [Prisma Deploy Docs](https://www.prisma.io/docs/guides/deployment)
- [Neon Docs](https://neon.tech/docs)
- [Supabase Docs](https://supabase.com/docs)

## Checklist Final

- [ ] Banco de dados PostgreSQL criado
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Repositório Git conectado
- [ ] Build com sucesso
- [ ] Migrations aplicadas
- [ ] Aplicação funcionando
- [ ] Login testado
- [ ] CRUD de entidades testado
- [ ] Kanban board testado

