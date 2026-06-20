# StoreHub — Inventory Management System

A full-stack web application for managing product inventory, built with React, Node.js, and PostgreSQL. Containerised with Docker and automated via Jenkins CI/CD.

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 18, Vite, Tailwind CSS      |
| Backend  | Node.js, Express                  |
| Database | PostgreSQL (AWS RDS compatible)   |
| CI/CD    | Jenkins                           |
| Registry | Docker Hub / Nexus                |
| Deploy   | Docker Compose / Kubernetes       |

## Project Structure

```
storehub/
├── backend/
│   ├── src/
│   │   ├── controllers/productController.js
│   │   ├── routes/products.js
│   │   └── db.js
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── nginx.conf
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── Jenkinsfile
└── .gitignore
```

## API Endpoints

| Method | Path                   | Description       |
|--------|------------------------|-------------------|
| GET    | /api/health            | Health check      |
| GET    | /api/products/stats    | Dashboard stats   |
| GET    | /api/products          | List products     |
| GET    | /api/products/:id      | Get single product|
| POST   | /api/products          | Create product    |
| PUT    | /api/products/:id      | Update product    |
| DELETE | /api/products/:id      | Delete product    |

### Query parameters for GET /api/products
- `search` — text search on name/description
- `category` — filter by category (Electronics, Peripherals, etc.)

## Quick Start (Local)

### Option A — Docker Compose (recommended)
```bash
git clone https://github.com/yourusername/storehub.git
cd storehub
docker-compose up -d
```
App available at `http://localhost`

### Option B — Run services separately

**Backend**
```bash
cd backend
cp .env.example .env   # fill in your DB credentials
npm install
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

## Environment Variables (Backend)

| Variable    | Default      | Description                    |
|-------------|--------------|--------------------------------|
| PORT        | 5000         | Backend port                   |
| DB_HOST     | localhost    | PostgreSQL host (RDS endpoint) |
| DB_PORT     | 5432         | PostgreSQL port                |
| DB_NAME     | storehub     | Database name                  |
| DB_USER     | postgres     | Database user                  |
| DB_PASSWORD | —            | Database password              |
| DB_SSL      | false        | Set `true` for AWS RDS         |

## Jenkins Pipeline

The `Jenkinsfile` defines 5 stages:
1. **Checkout** — pulls source from SCM
2. **Install & Validate** — npm ci + build (parallel)
3. **Build Docker Images** — builds backend + frontend images (parallel)
4. **Push Images** — pushes to your registry with `IMAGE_TAG=git-short-sha`
5. **Deploy** — runs only on `main` branch (SSH, kubectl, or Helm — choose one)

### Required Jenkins credentials
- `registry-credentials` — Username + Password for your Docker registry

### Configure in Jenkinsfile
```groovy
REGISTRY       = 'your-registry'      // e.g. docker.io/omar or nexus:8082
REGISTRY_CREDS = 'registry-credentials'
```

## Features

- **Dashboard** — total products, inventory value, low-stock alerts
- **Products table** — search, filter by category, sort
- **CRUD** — add/edit/delete with modal dialogs
- **Live stock badges** — color-coded (green/amber/red)
- **Responsive** — works on mobile and desktop

## License

MIT
