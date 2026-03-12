#!/bin/bash

# ============================================
# TripCraft AI - Local Setup Script
# ============================================
# This script automates the setup process for running
# TripCraft AI on a local machine.
# ============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Header
echo ""
echo "============================================"
echo "   TripCraft AI - Local Setup Script"
echo "============================================"
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "client" ]; then
    print_error "Please run this script from the travel-agent directory"
    print_error "Expected structure: backend/ and client/ folders"
    exit 1
fi

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ============================================
# STEP 1: Check Prerequisites
# ============================================
print_status "Checking prerequisites..."

# Check Python
if command_exists python3; then
    PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
    print_success "Python found: $PYTHON_VERSION"
else
    print_error "Python 3 is not installed. Please install Python 3.12+"
    exit 1
fi

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
else
    print_error "Node.js is not installed. Please install Node.js 20+"
    exit 1
fi

# Check pnpm
if command_exists pnpm; then
    PNPM_VERSION=$(pnpm --version)
    print_success "pnpm found: $PNPM_VERSION"
else
    print_warning "pnpm not found. Installing..."
    npm install -g pnpm
    print_success "pnpm installed"
fi

# Check Docker (optional)
if command_exists docker; then
    DOCKER_VERSION=$(docker --version)
    print_success "Docker found: $DOCKER_VERSION"
    DOCKER_AVAILABLE=true
else
    print_warning "Docker not found. Docker setup will be skipped."
    DOCKER_AVAILABLE=false
fi

echo ""

# ============================================
# STEP 2: Setup Backend
# ============================================
print_status "Setting up backend..."

cd backend

# Create virtual environment if not exists
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Install uv for faster package installation
print_status "Installing uv package manager..."
pip install --quiet uv

# Install dependencies
print_status "Installing Python dependencies..."
uv pip install -e . || pip install -e .

# Create .env file if not exists
if [ ! -f ".env" ]; then
    print_status "Creating backend .env file..."
    cat > .env << 'EOF'
# ============================================
# TripCraft AI Backend Configuration
# ============================================

# DATABASE CONFIGURATION
# Option 1: Neon Cloud PostgreSQL (recommended for quick setup)
DATABASE_URL=postgresql+asyncpg://YOUR_USER:YOUR_PASSWORD@YOUR_HOST.neon.tech/YOUR_DB

# Option 2: Local PostgreSQL
# DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/tripcraft_db

# AI/LLM API KEYS (REQUIRED)
# Get from: https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY_HERE

# Get from: https://exa.ai/
EXA_API_KEY=YOUR_KEY_HERE

# Get from: https://firecrawl.dev/
FIRECRAWL_API_KEY=fc-YOUR_KEY_HERE
EOF
    print_warning "Backend .env file created. Please edit it with your API keys!"
else
    print_success "Backend .env file already exists"
fi

cd ..
print_success "Backend setup complete"

echo ""

# ============================================
# STEP 3: Setup Frontend
# ============================================
print_status "Setting up frontend..."

cd client

# Install dependencies
print_status "Installing Node.js dependencies..."
pnpm install

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# Create .env.local file if not exists
if [ ! -f ".env.local" ]; then
    print_status "Creating frontend .env.local file..."
    cat > .env.local << 'EOF'
# ============================================
# TripCraft AI Frontend Configuration
# ============================================

# APPLICATION URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
BACKEND_API_URL=http://localhost:8000

# DATABASE CONFIGURATION (for Prisma)
# Option 1: Neon Cloud PostgreSQL
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@YOUR_HOST.neon.tech/YOUR_DB?sslmode=require

# Option 2: Local PostgreSQL
# DATABASE_URL=postgresql://postgres:password@localhost:5432/tripcraft_db

# AUTHENTICATION
BETTER_AUTH_SECRET=tripcraft-ai-secret-key-change-in-production
EOF
    print_warning "Frontend .env.local file created. Please edit it with your database URL!"
else
    print_success "Frontend .env.local file already exists"
fi

cd ..
print_success "Frontend setup complete"

echo ""

# ============================================
# STEP 4: Create helper scripts
# ============================================
print_status "Creating helper scripts..."

# Create start-backend.sh
cat > start-backend.sh << 'EOF'
#!/bin/bash
cd backend
source venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
EOF
chmod +x start-backend.sh

# Create start-frontend.sh
cat > start-frontend.sh << 'EOF'
#!/bin/bash
cd client
pnpm dev
EOF
chmod +x start-frontend.sh

# Create start-all.sh (for tmux users)
cat > start-all.sh << 'EOF'
#!/bin/bash
echo "Starting TripCraft AI..."
echo ""
echo "Starting Backend on port 8000..."
cd backend
source venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

echo "Waiting for backend to start..."
sleep 5

echo "Starting Frontend on port 3000..."
cd client
pnpm dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "============================================"
echo "TripCraft AI is running!"
echo "============================================"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo "Health:   http://localhost:8000/api/health"
echo "============================================"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
EOF
chmod +x start-all.sh

print_success "Helper scripts created"

echo ""

# ============================================
# STEP 5: Docker setup (if available)
# ============================================
if [ "$DOCKER_AVAILABLE" = true ]; then
    print_status "Docker is available. Creating Docker environment file..."
    
    if [ ! -f ".env" ]; then
        cat > .env << 'EOF'
# Docker Compose Environment Variables
OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY_HERE
EXA_API_KEY=YOUR_KEY_HERE
FIRECRAWL_API_KEY=fc-YOUR_KEY_HERE
BETTER_AUTH_SECRET=tripcraft-ai-secret-key
EOF
        print_warning "Docker .env file created. Please edit with your API keys!"
    fi
    
    # Create docker helper script
    cat > start-docker.sh << 'EOF'
#!/bin/bash
echo "Starting TripCraft AI with Docker..."
docker-compose up -d --build
echo ""
echo "============================================"
echo "TripCraft AI is starting..."
echo "============================================"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo "Database: localhost:5432"
echo "============================================"
echo ""
echo "View logs: docker-compose logs -f"
echo "Stop:      docker-compose down"
EOF
    chmod +x start-docker.sh
    
    print_success "Docker setup complete"
fi

echo ""

# ============================================
# FINAL SUMMARY
# ============================================
echo "============================================"
echo "   Setup Complete!"
echo "============================================"
echo ""
print_success "TripCraft AI has been set up successfully!"
echo ""
echo "NEXT STEPS:"
echo ""
echo "1. Configure API Keys:"
echo "   - Edit backend/.env with your API keys"
echo "   - Edit client/.env.local with your database URL"
echo ""
echo "2. Start the application:"
echo ""
echo "   Option A: Manual start (2 terminals)"
echo "   Terminal 1: ./start-backend.sh"
echo "   Terminal 2: ./start-frontend.sh"
echo ""
echo "   Option B: Start all at once"
echo "   ./start-all.sh"
echo ""
if [ "$DOCKER_AVAILABLE" = true ]; then
echo "   Option C: Docker Compose"
echo "   ./start-docker.sh"
echo ""
fi
echo "3. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo ""
echo "4. Verify backend is running:"
echo "   curl http://localhost:8000/api/health"
echo ""
echo "============================================"
echo "   Required API Keys"
echo "============================================"
echo "OpenRouter: https://openrouter.ai/keys"
echo "Exa Search: https://exa.ai/"
echo "Firecrawl:  https://firecrawl.dev/"
echo "============================================"
echo ""
print_warning "Don't forget to edit the .env files with your API keys!"
echo ""
