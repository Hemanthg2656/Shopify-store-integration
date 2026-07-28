# Shopify Store Data Integration Platform

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![Shopify](https://img.shields.io/badge/Shopify-Admin_API-success)
![Tests](https://img.shields.io/badge/Tests-432%20Passing-brightgreen)
![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen)
![Jest](https://img.shields.io/badge/Tested%20With-Jest-red)
![License](https://img.shields.io/badge/License-MIT-yellow)

A full-stack Shopify Store Integration Platform built using **Next.js**, **Node.js**, **Express**, and **PostgreSQL**.

The application allows Shopify merchants to securely connect their stores through **Shopify OAuth 2.0**, synchronize store data into PostgreSQL, and manage products, orders, customers, and analytics through a modern dashboard.

---

## Project Status

> **Status:** ✅ Completed

### Completed Features

- Shopify OAuth 2.0 Authentication
- JWT Authentication with Refresh Tokens
- Secure Access Token Storage (AES-256-GCM Encryption)
- Store Management
- Product Synchronization
- Order Synchronization
- Customer Synchronization
- Dashboard Analytics
- Repository-Service-Controller Architecture
- PostgreSQL Integration
- Complete Automated Unit Testing

# Features

## Authentication

- Shopify OAuth 2.0 Integration
- HMAC verification
- CSRF protection using state parameter
- JWT Authentication
- Access & Refresh Token Rotation
- HttpOnly Cookie Authentication
- AES-256-GCM encrypted Shopify access tokens

## Store Management

- Connect Shopify Store
- Store Profile
- Store Plan Information
- Currency & Timezone
- Owner Details

## Products

- Product Listing
- Search
- Filter
- Sorting
- Pagination
- Product Details
- Shopify Admin Product Link

## Orders

- Order Listing
- Search
- Date Filters
- Financial Status Filter
- Fulfillment Status Filter
- Pagination

## Customers

- Customer Listing
- Search
- Sorting
- Pagination

## Dashboard Analytics

- Total Products
- Total Orders
- Total Customers
- Total Revenue
- Monthly Revenue
- Monthly Orders
- Order Status Distribution
- Product Status Distribution
- Top Selling Products
- Recent Orders

## Sync System

- Manual Product Sync
- Manual Order Sync
- Manual Customer Sync
- Automatic Background Sync (Every 3 Hours)
- Sync Logs
- Sync Status Monitoring

## Security

- Helmet
- Rate Limiting
- Zod Validation
- Parameterized SQL Queries
- Encrypted Shopify Tokens
- Hashed Refresh Tokens
## Testing
- Comprehensive Automated Unit Testing (100% Coverage)
---

# Tech Stack

### Frontend

- Next.js 16
- React 19
- Tailwind CSS v4
- Redux Toolkit
- Axios
- React Hook Form
- Recharts

### Backend

- Node.js
- Express.js
- PostgreSQL
- JWT
- Shopify Admin GraphQL API
- Node Cron
- Pino Logger
- Zod

---

# Folder Structure

```text
Shopify-store-integration/
│
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── controller/
│   │   ├── database/
│   │   ├── GraphQL/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── service/
│   │   ├── utils/
│   │   └── validators/
│   │
│   ├── tests/
│   │   ├── controller/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── package.json
│   ├── jest.config.js
│   ├── .env.example
│   └── server.js
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── redux/
│   ├── services/
│   ├── utils/
│   ├── public/
│   ├── package.json
│   └── next.config.js
│
├── PROJECT_DOCUMENTATION.md
├── README.md
└── .gitignore
```

# Installation

## Clone Repository

```bash
git clone https://github.com/Hemanthg2656/Shopify-store-integration.git

cd Shopify-store-integration
```

## Backend

```bash
cd Backend

npm install

npm run dev
```

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# Environment Variables

## Backend

```env
PORT=

DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=

SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=
SHOPIFY_REDIRECT_URI=
SHOPIFY_SCOPES=
SHOPIFY_API_VERSION=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
TOKEN_ENCRYPTION_KEY=

FRONTEND_URL=
```

## Frontend

```env
NEXT_PUBLIC_API_URL=
```

---

# API Endpoints Implemented

## Authentication

| Method | Endpoint                      |
| ------ | ----------------------------- |
| GET    | /api/v1/auth/shopify/install  |
| GET    | /api/v1/auth/shopify/callback |
| POST   | /api/v1/auth/refresh          |
| POST   | /api/v1/auth/logout           |
| GET    | /api/v1/auth/me               |

---

## Store

| Method | Endpoint      |
| ------ | ------------- |
| GET    | /api/v1/store |

---

## Products

| Method | Endpoint                                 |
| ------ | ---------------------------------------- |
| GET    | /api/v1/products                         |
| GET    | /api/v1/products/types                   |
| GET    | /api/v1/products/:productId/shopify-link |

---

## Orders

| Method | Endpoint       |
| ------ | -------------- |
| GET    | /api/v1/orders |

---

## Customers

| Method | Endpoint          |
| ------ | ----------------- |
| GET    | /api/v1/customers |

---

## Dashboard

| Method | Endpoint                    |
| ------ | --------------------------- |
| GET    | /api/v1/dashboard           |
| GET    | /api/v1/dashboard/analytics |

---

## Sync

| Method | Endpoint               |
| ------ | ---------------------- |
| POST   | /api/v1/sync/products  |
| POST   | /api/v1/sync/orders    |
| POST   | /api/v1/sync/customers |
| GET    | /api/v1/sync/status    |

---

# Sample API Responses

## GET /api/v1/auth/me

```json
{
  "success": true,
  "user": {
    "userId": 4,
    "storeId": 2,
    "sessionId": 17
  }
}
```

---

## GET /api/v1/products

```json
{
  "success": true,
  "count": 48,
  "pageInfo": {
    "page": 1,
    "limit": 10,
    "totalPages": 5
  },
  "products": [
    {
      "title": "Classic Cotton Tee",
      "price": "19.99",
      "status": "ACTIVE"
    }
  ]
}
```

---

## POST /api/v1/sync/products

```json
{
  "success": true,
  "message": "Products synced successfully",
  "data": {
    "synced": 48
  }
}
```

---

# Testing

The backend includes a comprehensive automated unit test suite built using **Jest**.

The test suite validates every major layer of the application, including:

- Controllers
- Services
- Repositories
- Middleware
- Utilities
- Validators
- Shopify OAuth Flow
- HMAC & State Validation
- JWT Authentication
- Token Encryption
- Shopify REST Client
- Shopify GraphQL Client
- Dashboard Analytics
- Product, Order, Customer & Store APIs

### Run Tests

```bash
cd Backend

npm test
```

### Test Results

- ✅ 46 Test Suites Passed
- ✅ 432 Test Cases Passed
- ✅ 100% Statement Coverage
- ✅ 100% Branch Coverage
- ✅ 100% Function Coverage
- ✅ 100% Line Coverage

# Challenges Faced

- Implementing Shopify OAuth 2.0 Authentication
- Verifying HMAC Signatures securely
- Managing JWT Authentication with Refresh Token Rotation
- Encrypting Shopify Access Tokens using AES-256-GCM
- Designing a scalable synchronization mechanism
- Handling Shopify GraphQL Rate Limiting
- Mapping Shopify GraphQL data into PostgreSQL
- Building dashboard analytics from synchronized data

---

# Blockers / Issues Encountered

- Understanding Shopify OAuth authentication flow
- Handling GraphQL cost-based rate limiting
- Managing secure token storage and refresh flow
- Designing efficient synchronization between Shopify and PostgreSQL
- Handling pagination differences between Shopify GraphQL and local database

---

# Future Improvements

- Shopify Webhook Integration
- Real-Time Synchronization
- Automated Testing
- Cursor-Based Pagination
- Multi-Store Support
- Docker Deployment
- CI/CD Pipeline

---

# License

This project is licensed under the MIT License.

---

# Author

**Hemanth**

GitHub: https://github.com/Hemanthg2656
