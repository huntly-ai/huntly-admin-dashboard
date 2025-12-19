# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Huntly Admin Dashboard is an administrative dashboard for managing leads, clients, projects, contracts, finances, teams, and meetings. Built with Next.js 16 (App Router), TypeScript, Prisma ORM, and PostgreSQL.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production (includes Prisma generate and migrate)
npm run build

# Run linting
npm run lint

# Start PostgreSQL via Docker
docker-compose up -d

# Prisma commands
npx prisma migrate dev --name <migration_name>  # Create new migration
npx prisma generate                              # Generate Prisma Client
npx prisma studio                                # Open database GUI
npx prisma migrate reset                         # Reset database
```

## Architecture

### Directory Structure

- `app/(dashboard)/` - Protected dashboard pages using route groups
- `app/api/` - API routes organized by entity (leads, clientes, projetos, etc.)
- `components/ui/` - shadcn/ui components
- `lib/` - Shared utilities (Prisma client, auth helpers, formatters)
- `prisma/` - Database schema and migrations

### Authentication Flow

- JWT-based authentication using `jose` library
- Auth tokens stored in HTTP-only cookies (`auth-token`)
- `AuthGuard` component wraps protected routes in `app/(dashboard)/layout.tsx`
- Auth helpers in `lib/auth.ts`: `hashPassword`, `verifyPassword`, `createToken`, `verifyToken`, `verifyAuth`

### Database Schema (Prisma)

Core entities and relationships:
- **Lead** → Can convert to **Client**
- **Client** → Has many **Project**, **Transaction**, **Contract**
- **Project** → Contains **Epic** → **Story** → **Task** (Scrum hierarchy)
- **TeamMember** → Linked to **User** for auth, assigned to **Team**, **Project**, **Task**, **Story**, **Meeting**
- **Contract** → Has **ContractPayment** installments, links to multiple **Project** via **ContractProject**

Key enums: `LeadStatus`, `ProjectStatus`, `TaskStatus`, `StoryStatus`, `BillingType`, `TransactionType`

### API Pattern

All API routes follow this pattern:
- Use `prisma` from `@/lib/prisma`
- GET: Fetch with optional query params, include related data
- POST: Create with request body validation
- PUT/PATCH: Update by ID from route params
- DELETE: Delete by ID from route params
- Return `NextResponse.json()` with appropriate status codes

### UI Components

- Uses shadcn/ui with Radix UI primitives
- Tailwind CSS 4 for styling
- Recharts for dashboard charts
- dnd-kit for drag-and-drop (Kanban board in project detail)
- Lucide React for icons

### Project Management (Kanban)

Projects have a Scrum-like structure with a Kanban board:
- Stories are displayed as swimlanes
- Tasks (subtasks) can be dragged between columns: TODO → IN_PROGRESS → IN_REVIEW → DONE
- Located in `app/(dashboard)/projetos/[id]/components/`

## Environment Variables

Required in `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/huntly_dashboard?schema=public"
JWT_SECRET="your-secret-key"
```

## Code Patterns

- Follow Clean Architecture and Clean Code principles
- Portuguese language for business domain (clientes, projetos, financeiro, reunioes, membros, times)
- English for technical code (variables, functions, components)
- All monetary values stored as `Float` in database
- Dates handled with `date-fns` library
