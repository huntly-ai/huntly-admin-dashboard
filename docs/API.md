# Huntly Admin Dashboard - API Documentation

Base URL: `https://admin.huntlyai.xyz/api`

## Interactive Documentation (Swagger UI)

Access the interactive API documentation at: `/docs`

OpenAPI specification available at: `/api/openapi`

## Quick Start for Integrations

1. Create an API Key in the dashboard
2. Use the key in the `X-API-Key` header
3. Make requests to the API

```bash
curl -X POST https://admin.huntlyai.xyz/api/financeiro \
  -H "Content-Type: application/json" \
  -H "X-API-Key: hntly_your-api-key" \
  -d '{"type":"EXPENSE","category":"INFRASTRUCTURE","amount":49.99,"description":"Server costs"}'
```

## Authentication

All API endpoints (except `/api/auth/login`) require authentication via JWT token stored in HTTP-only cookie.

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password",
  "remember": true
}
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "member": {
      "id": "member-id",
      "name": "User Name",
      "role": "ADMIN",
      "status": "ACTIVE"
    }
  }
}
```

The response sets an `auth-token` HTTP-only cookie that must be included in subsequent requests.

### For External Integrations

When integrating from external apps, you need to:

1. Login once to get the auth cookie
2. Store and send the cookie with all requests

**Example with cURL:**
```bash
# Login and save cookie
curl -X POST https://admin.huntlyai.xyz/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"your-password"}' \
  -c cookies.txt

# Use cookie in subsequent requests
curl https://admin.huntlyai.xyz/api/financeiro \
  -b cookies.txt
```

**Example with JavaScript/Node.js:**
```javascript
// Using fetch with credentials
const response = await fetch('https://admin.huntlyai.xyz/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email, password })
});

// Subsequent requests
const transactions = await fetch('https://admin.huntlyai.xyz/api/financeiro', {
  credentials: 'include'
});
```

---

## Financial Transactions

### List All Transactions

```http
GET /api/financeiro
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | Filter by type: `INCOME` or `EXPENSE` |
| category | string | Filter by category (see categories below) |
| startDate | string | Filter from date (ISO 8601) |
| endDate | string | Filter to date (ISO 8601) |

**Response:**
```json
[
  {
    "id": "transaction-id",
    "type": "INCOME",
    "category": "PROJECT_PAYMENT",
    "amount": 5000.00,
    "description": "Payment for project X",
    "date": "2024-12-20T00:00:00.000Z",
    "paymentMethod": "PIX",
    "notes": "Invoice #123",
    "client": { "id": "client-id", "name": "Client Name" },
    "project": { "id": "project-id", "name": "Project Name" },
    "internalProject": null
  }
]
```

### Create Transaction

```http
POST /api/financeiro
Content-Type: application/json

{
  "type": "EXPENSE",
  "category": "INFRASTRUCTURE",
  "amount": 150.00,
  "description": "AWS hosting costs",
  "date": "2024-12-20",
  "paymentMethod": "CARTAO_CREDITO",
  "notes": "Monthly server costs",
  "internalProjectId": "internal-project-id"
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | `INCOME` or `EXPENSE` |
| category | string | Yes | See categories below |
| amount | number | Yes | Transaction amount |
| description | string | Yes | Description of transaction |
| date | string | No | Date (ISO 8601), defaults to now |
| paymentMethod | string | No | Payment method |
| notes | string | No | Additional notes |
| clientId | string | No | Link to client |
| projectId | string | No | Link to client project |
| internalProjectId | string | No | Link to internal project |
| invoiceNumber | string | No | Invoice reference |

### Update Transaction

```http
PUT /api/financeiro/{id}
Content-Type: application/json

{
  "amount": 175.00,
  "notes": "Updated amount"
}
```

### Delete Transaction

```http
DELETE /api/financeiro/{id}
```

---

## Transaction Categories

### Income Categories
| Value | Description |
|-------|-------------|
| `PROJECT_PAYMENT` | Payment for client project |
| `CONSULTING` | Consulting services |
| `LICENSE` | License sales |
| `SUBSCRIPTION` | Subscription revenue |
| `OTHER_INCOME` | Other income |

### Expense Categories
| Value | Description |
|-------|-------------|
| `SALARIES` | Employee salaries |
| `INFRASTRUCTURE` | Servers, hosting, cloud |
| `SOFTWARE` | Software licenses |
| `MARKETING` | Marketing expenses |
| `OFFICE` | Office expenses |
| `TAXES` | Tax payments |
| `OTHER_EXPENSE` | Other expenses |

### Payment Methods
| Value | Description |
|-------|-------------|
| `PIX` | PIX instant payment |
| `BOLETO` | Bank slip |
| `CARTAO_CREDITO` | Credit card |
| `TRANSFERENCIA` | Bank transfer |
| `CRIPTO` | Cryptocurrency |

---

## Internal Projects

Internal projects are used to track expenses and revenue for your own apps/products.

### List Internal Projects

```http
GET /api/projetos-internos
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status: `ACTIVE` or `ARCHIVED` |

**Response:**
```json
[
  {
    "id": "project-id",
    "name": "My App",
    "description": "Internal application",
    "status": "ACTIVE",
    "createdAt": "2024-12-20T00:00:00.000Z",
    "_count": {
      "transactions": 15,
      "tasks": 8
    },
    "financials": {
      "totalIncome": 10000.00,
      "totalExpense": 2500.00,
      "profit": 7500.00
    }
  }
]
```

### Create Internal Project

```http
POST /api/projetos-internos
Content-Type: application/json

{
  "name": "My New App",
  "description": "Description of the app",
  "status": "ACTIVE",
  "color": "#3B82F6"
}
```

### Get Internal Project Details

```http
GET /api/projetos-internos/{id}
```

Returns project with tasks, transactions, and financial summary.

### Update Internal Project

```http
PUT /api/projetos-internos/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "status": "ARCHIVED"
}
```

### Delete Internal Project

```http
DELETE /api/projetos-internos/{id}
```

Note: Projects with transactions cannot be deleted. Archive them instead.

---

## Internal Project Transactions

Transactions linked to a specific internal project.

### List Project Transactions

```http
GET /api/projetos-internos/{id}/transactions
```

### Create Project Transaction

```http
POST /api/projetos-internos/{id}/transactions
Content-Type: application/json

{
  "type": "EXPENSE",
  "category": "INFRASTRUCTURE",
  "amount": 29.99,
  "description": "Monthly hosting",
  "date": "2024-12-20",
  "paymentMethod": "PIX"
}
```

---

## Internal Project Tasks

Kanban-style task management for internal projects.

### List Project Tasks

```http
GET /api/projetos-internos/{id}/tasks
```

**Response:**
```json
[
  {
    "id": "task-id",
    "title": "Implement feature X",
    "description": "Details...",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "dueDate": "2024-12-25T00:00:00.000Z",
    "estimatedHours": 8,
    "actualHours": 4,
    "order": 0
  }
]
```

### Create Task

```http
POST /api/projetos-internos/{id}/tasks
Content-Type: application/json

{
  "title": "New task",
  "description": "Task description",
  "status": "TODO",
  "priority": "MEDIUM",
  "dueDate": "2024-12-25",
  "estimatedHours": 4
}
```

### Update Task

```http
PUT /api/projetos-internos/{id}/tasks/{taskId}
Content-Type: application/json

{
  "status": "DONE",
  "actualHours": 6
}
```

### Delete Task

```http
DELETE /api/projetos-internos/{id}/tasks/{taskId}
```

### Reorder Tasks (Kanban)

```http
PUT /api/projetos-internos/{id}/tasks/reorder
Content-Type: application/json

{
  "taskId": "task-id",
  "newStatus": "IN_PROGRESS",
  "newOrder": 0
}
```

### Task Statuses
| Value | Description |
|-------|-------------|
| `TODO` | To do |
| `IN_PROGRESS` | In progress |
| `IN_REVIEW` | In review |
| `DONE` | Completed |

### Task Priorities
| Value | Description |
|-------|-------------|
| `LOW` | Low priority |
| `MEDIUM` | Medium priority |
| `HIGH` | High priority |
| `URGENT` | Urgent |

---

## Integration Examples

### Auto-register expenses from your app

```javascript
// Example: Log infrastructure expense from your app
async function logExpense(appId, amount, description) {
  const response = await fetch(
    `https://admin.huntlyai.xyz/api/projetos-internos/${appId}/transactions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        type: 'EXPENSE',
        category: 'INFRASTRUCTURE',
        amount: amount,
        description: description,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'PIX'
      })
    }
  );
  return response.json();
}

// Usage
await logExpense('cm123...', 49.99, 'Monthly Vercel hosting');
```

### Auto-register revenue from your app

```javascript
// Example: Log subscription revenue
async function logRevenue(appId, amount, description, customerId) {
  const response = await fetch(
    `https://admin.huntlyai.xyz/api/projetos-internos/${appId}/transactions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        type: 'INCOME',
        category: 'SUBSCRIPTION',
        amount: amount,
        description: description,
        date: new Date().toISOString().split('T')[0],
        notes: `Customer: ${customerId}`
      })
    }
  );
  return response.json();
}

// Usage: When a user subscribes
await logRevenue('cm123...', 29.90, 'Monthly subscription', 'user_456');
```

### Webhook Integration (Stripe example)

```javascript
// In your Stripe webhook handler
app.post('/webhook/stripe', async (req, res) => {
  const event = req.body;

  if (event.type === 'invoice.paid') {
    const invoice = event.data.object;

    await fetch(
      `https://admin.huntlyai.xyz/api/projetos-internos/${APP_ID}/transactions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `auth-token=${AUTH_TOKEN}`
        },
        body: JSON.stringify({
          type: 'INCOME',
          category: 'SUBSCRIPTION',
          amount: invoice.amount_paid / 100,
          description: `Stripe payment - ${invoice.customer_email}`,
          date: new Date(invoice.created * 1000).toISOString().split('T')[0],
          paymentMethod: 'CARTAO_CREDITO',
          notes: `Invoice: ${invoice.id}`
        })
      }
    );
  }

  res.json({ received: true });
});
```

---

## Other Endpoints

### Clients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clientes` | List all clients |
| POST | `/api/clientes` | Create client |
| GET | `/api/clientes/{id}` | Get client |
| PUT | `/api/clientes/{id}` | Update client |
| DELETE | `/api/clientes/{id}` | Delete client |

### Client Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projetos` | List all projects |
| POST | `/api/projetos` | Create project |
| GET | `/api/projetos/{id}` | Get project |
| PUT | `/api/projetos/{id}` | Update project |
| DELETE | `/api/projetos/{id}` | Delete project |

### Leads

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | List all leads |
| POST | `/api/leads` | Create lead |
| GET | `/api/leads/{id}` | Get lead |
| PUT | `/api/leads/{id}` | Update lead |
| DELETE | `/api/leads/{id}` | Delete lead |
| POST | `/api/leads/{id}/convert` | Convert lead to client |

### Contracts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contratos` | List all contracts |
| POST | `/api/contratos` | Create contract |
| GET | `/api/contratos/{id}` | Get contract |
| PUT | `/api/contratos/{id}` | Update contract |
| DELETE | `/api/contratos/{id}` | Delete contract |

### Team Members

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/membros` | List all members |
| POST | `/api/membros` | Create member |
| GET | `/api/membros/{id}` | Get member |
| PUT | `/api/membros/{id}` | Update member |
| DELETE | `/api/membros/{id}` | Delete member |

### Teams

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/times` | List all teams |
| POST | `/api/times` | Create team |
| GET | `/api/times/{id}` | Get team |
| PUT | `/api/times/{id}` | Update team |
| DELETE | `/api/times/{id}` | Delete team |

### Meetings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reunioes` | List all meetings |
| POST | `/api/reunioes` | Create meeting |
| GET | `/api/reunioes/{id}` | Get meeting |
| PUT | `/api/reunioes/{id}` | Update meeting |
| DELETE | `/api/reunioes/{id}` | Delete meeting |

### Dashboard Metrics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/metrics` | Get dashboard stats |

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message in Portuguese"
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Not logged in |
| 403 | Forbidden - Not allowed |
| 404 | Not Found |
| 500 | Server Error |

---

## Rate Limiting

Currently no rate limiting is implemented. Be mindful of request frequency when integrating.

## CORS

For external integrations, you may need to configure CORS headers on the server or use a server-side proxy.
