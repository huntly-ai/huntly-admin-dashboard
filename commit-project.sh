#!/bin/bash

# Huntly Admin Dashboard - Git Commits Script
# This script commits the project following conventional commits pattern

set -e

echo "🚀 Starting Git commits for Huntly Admin Dashboard"
echo ""

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo ""
fi

# Configuration files
echo "⚙️  Committing configuration files..."
git add -f .gitignore package.json package-lock.json tsconfig.json 2>/dev/null || true
git add -f tailwind.config.ts next.config.ts components.json eslint.config.mjs postcss.config.mjs 2>/dev/null || true
if [ -n "$(git diff --cached --name-only)" ]; then
    git commit -m "build: initial project setup with Next.js 16, TypeScript, and Tailwind CSS

- Add Next.js 16 with App Router
- Configure TypeScript with strict mode
- Setup Tailwind CSS v4 with PostCSS
- Add ESLint configuration
- Configure package.json with project dependencies"
fi
echo ""

# Docker and Database
echo "🐳 Committing Docker and database configuration..."
git add -f docker-compose.yml prisma/schema.prisma prisma.config.ts lib/prisma.ts prisma/migrations/ 2>/dev/null || true
if [ -n "$(git diff --cached --name-only)" ]; then
    git commit -m "feat(database): setup PostgreSQL with Prisma ORM

- Add Docker Compose configuration for PostgreSQL 16
- Create comprehensive Prisma schema with all models
- Setup Lead, Client, Project, and Transaction models
- Configure relationships and indexes
- Add Prisma client singleton
- Include initial migration"
fi
echo ""

# UI Components
echo "🎨 Committing UI components..."
git add -f components/ui/ lib/utils.ts hooks/ 2>/dev/null || true
if [ -n "$(git diff --cached --name-only)" ]; then
    git commit -m "feat(ui): integrate shadcn/ui component library

- Add core UI components (Button, Card, Input, Label, etc.)
- Setup Dialog, Select, and Dropdown components
- Add Table, Badge, Avatar, and Separator
- Include Sheet and Sidebar components
- Configure utility functions with clsx and tailwind-merge
- Add custom hooks (use-mobile)"
fi
echo ""

# Layout and Navigation
echo "🧭 Committing layout and navigation..."
git add -f app/layout.tsx app/globals.css components/nav.tsx components/dashboard-layout.tsx 2>/dev/null || true
if [ -n "$(git diff --cached --name-only)" ]; then
    git commit -m "feat(layout): create responsive dashboard layout with navigation

- Setup root layout with Geist fonts
- Create sidebar navigation with mobile support
- Add dashboard layout wrapper component
- Implement responsive menu with sheet for mobile
- Style with gradient brand colors"
fi
echo ""

# Dashboard Page and API
echo "📊 Committing dashboard homepage..."
git add -f app/page.tsx app/api/dashboard/ 2>/dev/null || true
if [ -n "$(git diff --cached --name-only)" ]; then
    git commit -m "feat(dashboard): implement main dashboard with metrics and charts

- Create dashboard homepage with KPI cards
- Add revenue vs expenses chart (last 6 months)
- Implement leads distribution pie chart
- Display recent projects list
- Add financial summary cards
- Create metrics API endpoint with aggregations"
fi
echo ""

# Leads Module
echo "👥 Committing leads management..."
git add -f app/leads/ app/api/leads/ 2>/dev/null || true
if [ -n "$(git diff --cached --name-only)" ]; then
    git commit -m "feat(leads): implement complete leads management system

- Create leads listing page with CRUD operations
- Add lead creation and editing dialogs
- Implement status tracking (New, Contacted, Qualified, etc.)
- Add source tracking (Website, Referral, Social Media, etc.)
- Include lead to client conversion functionality
- Create REST API endpoints for leads
- Add estimated value and notes fields"
fi
echo ""

# Clients Module
echo "🏢 Committing clients management..."
git add -f app/clientes/ app/api/clientes/ 2>/dev/null || true
if [ -n "$(git diff --cached --name-only)" ]; then
    git commit -m "feat(clients): implement comprehensive client management

- Create clients listing page with full CRUD
- Add detailed client information forms
- Include business data (CNPJ, address, website)
- Implement status management (Active, Inactive, Churned)
- Add project and transaction counters
- Create REST API endpoints for clients
- Add validation to prevent deletion of clients with projects"
fi
echo ""

# Projects Module
echo "📁 Committing projects management..."
git add -f app/projetos/ app/api/projetos/ 2>/dev/null || true
if [ -n "$(git diff --cached --name-only)" ]; then
    git commit -m "feat(projects): implement project management system

- Create projects listing page with CRUD operations
- Add status tracking (Planning, In Progress, Completed, etc.)
- Implement priority levels (Low, Medium, High, Urgent)
- Include budget vs actual cost tracking
- Add timeline management (start date, deadline, end date)
- Create team members assignment
- Link projects to clients
- Create REST API endpoints for projects
- Calculate and display project margins"
fi
echo ""

# Financial Module
echo "💰 Committing financial management..."
git add -f app/financeiro/ app/api/financeiro/ 2>/dev/null || true
if [ -n "$(git diff --cached --name-only)" ]; then
    git commit -m "feat(finance): implement financial management system

- Create transactions listing page with CRUD
- Add income and expense categorization
- Implement detailed transaction forms
- Include client and project linking
- Add invoice number and payment method tracking
- Display financial summary cards (income, expense, balance)
- Create REST API endpoints for transactions
- Auto-update project actual costs on expense creation"
fi
echo ""

# README and Documentation
echo "📚 Committing documentation..."
git add -f README.md 2>/dev/null || true
if [ -n "$(git diff --cached --name-only)" ]; then
    git commit -m "docs: create comprehensive project documentation

- Add detailed README with features overview
- Include installation and setup instructions
- Document all technologies used
- Add database schema explanation
- Include useful commands for development
- Add deployment guidelines
- Document API structure"
fi
echo ""

# Type Safety and Lint Fixes
echo "🔧 Committing type safety improvements..."
git add -f app/ components/ lib/ 2>/dev/null || true
if [ -n "$(git diff --cached --name-only)" ]; then
    git commit -m "fix(types): add explicit types and fix linter errors

- Replace 'any' types with proper TypeScript interfaces
- Add explicit type annotations for all error handlers
- Fix Prisma error handling with proper type guards
- Add MetricsData interface for dashboard
- Escape HTML entities in JSX strings
- Fix React purity issues in sidebar component
- Remove unused imports
- Ensure all code passes ESLint validation"
fi
echo ""

# Public assets
echo "🖼️  Committing public assets..."
git add -f public/ 2>/dev/null || true
if [ -n "$(git diff --cached --name-only)" ]; then
    git commit -m "chore: add public assets and favicon

- Include all public assets
- Add favicon and app icons
- Add Next.js default assets"
fi
echo ""

# Commit script itself
echo "🔧 Committing commit script..."
git add -f commit-project.sh 2>/dev/null || true
if [ -n "$(git diff --cached --name-only)" ]; then
    git commit -m "chore: add commit script with conventional commits pattern

- Create automated commit script
- Follow conventional commits specification
- Organize commits by feature modules
- Include detailed commit messages"
fi
echo ""

# Final commit for any remaining files
if [ -n "$(git status --porcelain)" ]; then
    echo "📦 Committing remaining files..."
    git add -f .
    git commit -m "chore: add remaining project files

- Include any additional configuration files
- Ensure complete project structure"
    echo ""
fi

echo "✅ All commits completed successfully!"
echo ""
echo "📝 Commit summary:"
git log --oneline --graph -15
echo ""
echo "🎉 Project is ready! You can now push to your remote repository."
echo ""
echo "Next steps:"
echo "1. git remote add origin <your-repository-url>"
echo "2. git branch -M main"
echo "3. git push -u origin main"

