# Cursor-Based Pagination API

A REST API built with **Node.js**, **Express.js**, and **PostgreSQL** implementing efficient cursor-based pagination for large datasets.

## Features

- Cursor-based pagination
- Category filtering
- PostgreSQL database
- Connection pooling
- Efficient indexing
- Handles 200,000+ records

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- pg
- dotenv

---

## Installation

Clone the repository

```bash
git clone <repository-url>
cd cursor-pagination
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/pagination_db
PORT=3000
```

Start the server

```bash
npm start
```

Seed the database

```bash
npm run seed
```

---

## Database Schema

```sql
products
--------
id
name
category
price
created_at
```

---

## API Endpoints

### Health Check

```
GET /health
```

Response

```json
{
  "status":"ok"
}
```

---

### Get Products

```
GET /products
```

---

### Get Products with Limit

```
GET /products?limit=20
```

---

### Filter by Category

```
GET /products?category=electronics
```

---

### Next Page

```
GET /products?cursor=<nextCursor>
```

---

## Example Response

```json
{
    "data":[
        {
            "id":101,
            "name":"Premium Widget",
            "category":"electronics",
            "price":"499.99",
            "created_at":"2025-06-26T10:12:00Z"
        }
    ],
    "pagination":{
        "limit":20,
        "nextCursor":"eyJjcmVhdGVkX2F0Ijoi...",
        "hasNextPage":true
    }
}
```

---

## Performance

- Composite index on `(created_at, id)`
- Cursor pagination avoids OFFSET scans
- Efficient for millions of records