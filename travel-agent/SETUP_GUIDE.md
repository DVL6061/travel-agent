# TripCraft AI - Complete Local Setup Guide

> **For Antigravity AI and Local Development**

This guide provides complete instructions for setting up and running the TripCraft AI Travel Planner on a local machine.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [System Requirements](#system-requirements)
3. [Quick Start](#quick-start)
4. [Detailed Setup Instructions](#detailed-setup-instructions)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Running with Docker](#running-with-docker)
8. [Running without Docker](#running-without-docker)
9. [API Keys Setup](#api-keys-setup)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**TripCraft AI** is an AI-powered travel planning system using multi-agent architecture.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                      │
│                    http://localhost:3000                     │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/REST
┌─────────────────────────▼───────────────────────────────────┐
│                      BACKEND (FastAPI)                       │
│                    http://localhost:8000                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Multi-Agent System (Agno)               │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │    │
│  │  │Destination│ │ Flight   │ │  Hotel   │            │    │
│  │  │  Agent   │ │  Agent   │ │  Agent   │            │    │
│  │  └──────────┘ └──────────┘ └──────────┘            │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │    │
│  │  │  Food    │ │Itinerary │ │ Budget   │            │    │
│  │  │  Agent   │ │  Agent   │ │  Agent   │            │    │
│  │  └──────────┘ └──────────┘ └──────────┘            │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │OpenRouter│ │   Exa    │ │Firecrawl │ │ Google   │       │
│  │   API    │ │  Search  │ │   API    │ │ Flights  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    DATABASE (PostgreSQL)                     │
│              Neon Cloud or Local PostgreSQL                  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Frontend | Next.js | 15.3.3 |
| Backend | FastAPI (Python) | Latest |
| AI Framework | Agno | 1.5.6+ |
| Database | PostgreSQL | 14+ |
| ORM (Frontend) | Prisma | 6.8.2 |
| ORM (Backend) | SQLAlchemy | 2.0+ |
| Package Manager | pnpm | 9.15.0 |
| Python Version | Python | 3.12+ |

---

## 💻 System Requirements

### Minimum Requirements

| Resource | Requirement |
|----------|-------------|
| **OS** | Windows 10/11, macOS 10.15+, Ubuntu 20.04+ |
| **RAM** | 8 GB |
| **Storage** | 5 GB free space |
| **CPU** | 4 cores |

### Required Software

| Software | Version | Installation |
|----------|---------|--------------|
| **Python** | 3.12+ | https://www.python.org/downloads/ |
| **Node.js** | 20.x+ | https://nodejs.org/ |
| **pnpm** | 9.x+ | `npm install -g pnpm` |
| **Git** | Latest | https://git-scm.com/ |
| **Docker** (optional) | Latest | https://www.docker.com/ |

---

## ⚡ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/DVL6061/travel-agent.git
cd travel-agent/travel-agent

# 2. Setup Backend
cd backend
cp .env.example .env
# Edit .env with your API keys
pip install uv
uv pip install -e .

# 3. Setup Frontend
cd ../client
cp .env.local.example .env.local  # Or create manually
pnpm install
npx prisma generate

# 4. Start Backend (Terminal 1)
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# 5. Start Frontend (Terminal 2)
cd client
pnpm dev

# 6. Open http://localhost:3000 in browser
```

---

## 📝 Detailed Setup Instructions

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/DVL6061/travel-agent.git

# Navigate to project directory
cd travel-agent/travel-agent

# Verify structure
ls -la
# Should show: backend/ client/ README.md
```

### Step 2: Install Python (3.12+)

#### macOS
```bash
brew install python@3.12
python3.12 --version
```

#### Windows
```powershell
# Download from https://www.python.org/downloads/
# Or use winget
winget install Python.Python.3.12
python --version
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install python3.12 python3.12-venv python3-pip
python3.12 --version
```

### Step 3: Install Node.js (20.x+)

#### macOS
```bash
brew install node@20
node --version
npm --version
```

#### Windows
```powershell
# Download from https://nodejs.org/
# Or use winget
winget install OpenJS.NodeJS.LTS
node --version
```

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
```

### Step 4: Install pnpm

```bash
npm install -g pnpm
pnpm --version
```

---

## 🔐 Environment Configuration

### Backend Environment File

**File:** `backend/.env`

```dotenv
# ============================================
# TripCraft AI Backend Configuration
# ============================================

# --------------------------------------------
# DATABASE CONFIGURATION
# --------------------------------------------
# Option 1: Neon Cloud PostgreSQL (Recommended for quick setup)
DATABASE_URL=postgresql+asyncpg://neondb_owner:YOUR_PASSWORD@YOUR_HOST.neon.tech/neondb

# Option 2: Local PostgreSQL
# DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/tripcraft_db

# --------------------------------------------
# AI/LLM API KEYS (REQUIRED)
# --------------------------------------------
# OpenRouter API Key (for LLM access)
# Get from: https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxx

# Exa Search API Key (for web search)
# Get from: https://exa.ai/
EXA_API_KEY=xxxxxxxxxxxxxxxxxxxx

# Firecrawl API Key (for web scraping)
# Get from: https://firecrawl.dev/
FIRECRAWL_API_KEY=fc-xxxxxxxxxxxxxxxxxxxx

# --------------------------------------------
# OPTIONAL API KEYS
# --------------------------------------------
# OpenAI API Key (if using directly instead of OpenRouter)
# OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx

# Google Gemini API Key (if using directly)
# GOOGLE_API_KEY=xxxxxxxxxxxxxxxxxxxx

# Bright Data (for advanced web scraping)
# BRIGHT_DATA_API_TOKEN=xxxxxxxxxxxxxxxxxxxx
# BRIGHT_DATA_BROWSER_AUTH=xxxxxxxxxxxxxxxxxxxx

# Cloudflare R2 (for file storage)
# CLOUDFLARE_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxx
# CLOUDFLARE_R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxx
# CLOUDFLARE_R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxx
```

### Frontend Environment File

**File:** `client/.env.local`

```dotenv
# ============================================
# TripCraft AI Frontend Configuration
# ============================================

# --------------------------------------------
# APPLICATION URLs
# --------------------------------------------
# Frontend base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Backend API URL (client-side requests)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend API URL (server-side requests)
BACKEND_API_URL=http://localhost:8000

# --------------------------------------------
# DATABASE CONFIGURATION
# --------------------------------------------
# PostgreSQL connection for Prisma
# Option 1: Neon Cloud PostgreSQL
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@YOUR_HOST.neon.tech/neondb?sslmode=require

# Option 2: Local PostgreSQL
# DATABASE_URL=postgresql://postgres:password@localhost:5432/tripcraft_db

# --------------------------------------------
# AUTHENTICATION
# --------------------------------------------
# Better Auth secret key (generate a random string)
# Generate with: openssl rand -base64 32
BETTER_AUTH_SECRET=your-super-secret-key-change-in-production
```

---

## 🗄️ Database Setup

### Option 1: Use Neon Cloud PostgreSQL (Easiest)

1. Go to https://neon.tech/
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Update both `.env` files with the connection string

**Backend format:**
```
DATABASE_URL=postgresql+asyncpg://user:password@host/database
```

**Frontend format:**
```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

### Option 2: Local PostgreSQL

#### Install PostgreSQL

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Windows:**
```powershell
# Download installer from https://www.postgresql.org/download/windows/
# Or use Chocolatey
choco install postgresql14
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Create Database

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE tripcraft_db;
CREATE USER tripcraft_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE tripcraft_db TO tripcraft_user;
\q
```

#### Update Environment Files

**Backend `.env`:**
```dotenv
DATABASE_URL=postgresql+asyncpg://tripcraft_user:your_password@localhost:5432/tripcraft_db
```

**Frontend `.env.local`:**
```dotenv
DATABASE_URL=postgresql://tripcraft_user:your_password@localhost:5432/tripcraft_db
```

#### Run Migrations

```bash
cd client
npx prisma migrate deploy
npx prisma generate
```

---

## 🐳 Running with Docker

### Docker Compose Setup

Create `docker-compose.yml` in the project root:

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:14-alpine
    container_name: tripcraft-db
    environment:
      POSTGRES_USER: tripcraft_user
      POSTGRES_PASSWORD: tripcraft_password
      POSTGRES_DB: tripcraft_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U tripcraft_user -d tripcraft_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: tripcraft-backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://tripcraft_user:tripcraft_password@postgres:5432/tripcraft_db
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - EXA_API_KEY=${EXA_API_KEY}
      - FIRECRAWL_API_KEY=${FIRECRAWL_API_KEY}
    depends_on:
      postgres:
        condition: service_healthy
    command: python -m uvicorn main:app --host 0.0.0.0 --port 8000

  # Frontend
  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: tripcraft-frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_BASE_URL=http://localhost:3000
      - NEXT_PUBLIC_API_URL=http://localhost:8000
      - BACKEND_API_URL=http://backend:8000
      - DATABASE_URL=postgresql://tripcraft_user:tripcraft_password@postgres:5432/tripcraft_db
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Create Frontend Dockerfile

**File:** `client/Dockerfile`

```dockerfile
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN pnpm build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm

COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
```

### Update Backend Dockerfile

**File:** `backend/Dockerfile` (Updated for local development)

```dockerfile
FROM python:3.12-slim-bookworm

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    libpq-dev \
    postgresql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast package installation
RUN pip install --no-cache-dir uv

WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock* ./

# Install dependencies
RUN uv pip install --system -e . || pip install -e .

# Copy application code
COPY . .

# Create log directory
RUN mkdir -p logs && chmod 777 logs

EXPOSE 8000

# Run with uvicorn
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Environment File

**File:** `.env` (in project root for Docker Compose)

```dotenv
# API Keys for Docker Compose
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxx
EXA_API_KEY=xxxxxxxxxxxxxxxxxxxx
FIRECRAWL_API_KEY=fc-xxxxxxxxxxxxxxxxxxxx
BETTER_AUTH_SECRET=your-super-secret-key
```

### Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up -d --build
```

---

## 🖥️ Running without Docker

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
.\venv\Scripts\activate

# Install uv (fast package installer)
pip install uv

# Install dependencies
uv pip install -e .

# Or using pip directly
pip install -e .

# Create .env file
cp .env.example .env
# Edit .env with your API keys

# Run the server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup

```bash
# Navigate to frontend
cd client

# Install dependencies
pnpm install

# Generate Prisma client
npx prisma generate

# Run migrations (if using local database)
npx prisma migrate deploy

# Create .env.local file with configuration
# (see Environment Configuration section)

# Run development server
pnpm dev
```

### Verify Installation

```bash
# Check backend health
curl http://localhost:8000/api/health
# Expected: {"status":"healthy","timestamp":"..."}

# Check frontend
# Open http://localhost:3000 in browser
```

---

## 🔑 API Keys Setup

### Required API Keys

| API | Purpose | Get From |
|-----|---------|----------|
| **OpenRouter** | LLM Access (Gemini, GPT-4o) | https://openrouter.ai/keys |
| **Exa Search** | Web Search for Agents | https://exa.ai/ |
| **Firecrawl** | Web Scraping | https://firecrawl.dev/ |

### Getting OpenRouter API Key

1. Go to https://openrouter.ai/
2. Sign up / Sign in
3. Navigate to "Keys" section
4. Click "Create Key"
5. Copy the key (starts with `sk-or-v1-`)

### Getting Exa API Key

1. Go to https://exa.ai/
2. Sign up for an account
3. Go to Dashboard → API Keys
4. Create new API key
5. Copy the key

### Getting Firecrawl API Key

1. Go to https://firecrawl.dev/
2. Sign up for an account
3. Go to API Keys section
4. Generate new key (starts with `fc-`)
5. Copy the key

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

#### 2. Database Connection Failed

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list  # macOS

# Test connection
psql -h localhost -U postgres -d tripcraft_db

# Check DATABASE_URL format
# Backend: postgresql+asyncpg://user:pass@host:port/db
# Frontend: postgresql://user:pass@host:port/db
```

#### 3. Python Version Error

```bash
# Check Python version
python --version
python3 --version

# Use specific version
python3.12 -m uvicorn main:app --host 0.0.0.0 --port 8000
```

#### 4. Prisma Generation Error

```bash
cd client

# Clean and regenerate
rm -rf node_modules/.prisma
rm -rf lib/generated/prisma

# Reinstall and generate
pnpm install
npx prisma generate
```

#### 5. API Key Errors

```bash
# Verify .env file exists and has correct format
cat backend/.env

# Check for extra spaces or quotes
# Wrong: OPENROUTER_API_KEY = "sk-or-v1-xxx"
# Right: OPENROUTER_API_KEY=sk-or-v1-xxx
```

#### 6. CORS Errors

The backend is configured to allow all origins. If you still face CORS issues:

```python
# In backend/api/app.py - already configured
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 7. SSL Certificate Errors (Local PostgreSQL)

For local PostgreSQL, remove SSL parameters:

```dotenv
# Instead of:
DATABASE_URL=postgresql://user:pass@localhost:5432/db?sslmode=require

# Use:
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

---

## 📊 Service Ports Summary

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend API | 8000 | http://localhost:8000 |
| PostgreSQL | 5432 | localhost:5432 |
| Health Check | 8000 | http://localhost:8000/api/health |

---

## 🚀 Production Deployment Notes

For production deployment, consider:

1. **Use environment-specific `.env` files**
2. **Enable HTTPS** with proper SSL certificates
3. **Use a process manager** (PM2, systemd, supervisord)
4. **Set up proper logging** and monitoring
5. **Configure rate limiting** for API endpoints
6. **Use Docker Compose** for easier deployment
7. **Set up CI/CD pipeline** for automated deployments

---

## 📞 Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review logs: `docker-compose logs -f` or terminal output
3. Verify all API keys are valid and have sufficient credits
4. Ensure database is running and accessible

---

## 📁 Project Structure

```
travel-agent/
├── backend/
│   ├── agents/           # AI Agents (destination, flight, hotel, food, itinerary, budget)
│   ├── api/              # FastAPI application setup
│   ├── config/           # Configuration (LLM, logger)
│   ├── models/           # Pydantic models
│   ├── repository/       # Database repositories
│   ├── router/           # API routes
│   ├── services/         # Business logic services
│   ├── tools/            # Custom tools (Google Flights)
│   ├── .env              # Environment variables (create this)
│   ├── main.py           # Application entry point
│   └── pyproject.toml    # Python dependencies
│
├── client/
│   ├── app/              # Next.js pages and routes
│   ├── components/       # React components
│   ├── lib/              # Utilities and Prisma client
│   ├── prisma/           # Database schema and migrations
│   ├── .env.local        # Environment variables (create this)
│   └── package.json      # Node.js dependencies
│
├── docker-compose.yml    # Docker Compose configuration (create this)
├── SETUP_GUIDE.md        # This file
└── README.md             # Project overview
```

---

*Last updated: January 2026*
