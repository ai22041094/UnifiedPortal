#!/bin/bash
# =============================================================================
# pcvisor Docker Setup Script
# One-command bootstrap for local infrastructure deployment
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print colored message
print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_step() { echo -e "${CYAN}[STEP]${NC} $1"; }

# Default values
DEPLOYMENT_MODE="full"
COMPOSE_FILE="docker-compose.full.yml"
SKIP_ADMIN=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --external-db)
            DEPLOYMENT_MODE="external"
            COMPOSE_FILE="docker-compose.yml"
            shift
            ;;
        --full)
            DEPLOYMENT_MODE="full"
            COMPOSE_FILE="docker-compose.full.yml"
            shift
            ;;
        --skip-admin)
            SKIP_ADMIN=true
            shift
            ;;
        --help|-h)
            echo "Usage: ./setup.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --full          Use full-stack deployment with built-in PostgreSQL (default)"
            echo "  --external-db   Use external database (requires DATABASE_URL in .env)"
            echo "  --skip-admin    Skip admin user creation"
            echo "  --help, -h      Show this help message"
            echo ""
            echo "Examples:"
            echo "  ./setup.sh                    # Full-stack deployment"
            echo "  ./setup.sh --external-db      # Use external database"
            echo "  ./setup.sh --full --skip-admin"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Header
echo "=============================================="
echo "  pcvisor Docker Setup"
echo "  Unified Access Control & Enterprise Management"
echo "=============================================="
echo ""
echo "Deployment Mode: $DEPLOYMENT_MODE"
echo "Compose File: $COMPOSE_FILE"
echo ""

# Set compose command
COMPOSE_CMD="docker compose"
if ! docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker-compose"
fi

# -----------------------------------------------------------------------------
# Check and install Docker
# -----------------------------------------------------------------------------
check_docker() {
    print_step "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        print_warning "Docker not found. Installing..."
        
        # Detect OS
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            curl -fsSL https://get.docker.com | sh
            sudo usermod -aG docker $USER
            print_success "Docker installed. Please log out and back in for group changes."
            print_warning "After logging back in, run this script again."
            exit 0
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            print_error "Please install Docker Desktop for Mac from https://docker.com"
            exit 1
        else
            print_error "Unsupported OS. Please install Docker manually."
            exit 1
        fi
    else
        print_success "Docker is installed: $(docker --version)"
    fi
}

# -----------------------------------------------------------------------------
# Check and install Docker Compose
# -----------------------------------------------------------------------------
check_docker_compose() {
    print_step "Checking Docker Compose installation..."
    
    if docker compose version &> /dev/null; then
        print_success "Docker Compose (plugin) is installed: $(docker compose version)"
        COMPOSE_CMD="docker compose"
    elif command -v docker-compose &> /dev/null; then
        print_success "Docker Compose (standalone) is installed: $(docker-compose --version)"
        COMPOSE_CMD="docker-compose"
    else
        print_warning "Docker Compose not found. Installing..."
        
        # Install Docker Compose plugin
        DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
        mkdir -p $DOCKER_CONFIG/cli-plugins
        curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m) \
            -o $DOCKER_CONFIG/cli-plugins/docker-compose
        chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
        COMPOSE_CMD="docker compose"
        
        print_success "Docker Compose installed."
    fi
}

# -----------------------------------------------------------------------------
# Setup environment
# -----------------------------------------------------------------------------
setup_environment() {
    print_step "Setting up environment..."
    
    DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cd "$DEPLOY_DIR"
    
    # Generate session secret if not exists
    generate_session_secret() {
        if command -v openssl &> /dev/null; then
            openssl rand -base64 32
        else
            head -c 32 /dev/urandom | base64
        fi
    }
    
    # Check if .env exists, if not create from example
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            
            # Generate and set session secret
            SESSION_SECRET=$(generate_session_secret)
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s/change-this-to-a-strong-random-string/$SESSION_SECRET/" .env 2>/dev/null || true
            else
                sed -i "s/change-this-to-a-strong-random-string/$SESSION_SECRET/" .env 2>/dev/null || true
            fi
            
            print_success "Created .env from .env.example with generated SESSION_SECRET"
            
            if [ "$DEPLOYMENT_MODE" = "external" ]; then
                print_warning "IMPORTANT: Update DATABASE_URL in .env with your external database connection string!"
                echo ""
                read -p "Press Enter after updating .env, or Ctrl+C to cancel..."
            fi
        else
            print_info "Creating default .env file..."
            SESSION_SECRET=$(generate_session_secret)
            
            if [ "$DEPLOYMENT_MODE" = "full" ]; then
                cat > .env << EOF
# Database Configuration (for built-in PostgreSQL)
DB_PASSWORD=pcvisor_secure_$(openssl rand -hex 8 2>/dev/null || echo "password123")

# Session Secret
SESSION_SECRET=$SESSION_SECRET

# Node Environment
NODE_ENV=production

# Application Port
PORT=5000

# Redis Configuration (auto-configured by docker-compose)
REDIS_URL=redis://redis:6379

# Trust Proxy (set to 1 when behind reverse proxy)
TRUST_PROXY=1
EOF
            else
                cat > .env << EOF
# Database Configuration (REQUIRED - update with your database URL)
DATABASE_URL=postgresql://user:password@host:5432/database

# Session Secret
SESSION_SECRET=$SESSION_SECRET

# Node Environment
NODE_ENV=production

# Application Port
PORT=5000

# Redis Configuration (auto-configured by docker-compose)
REDIS_URL=redis://redis:6379

# Trust Proxy (set to 1 when behind reverse proxy)
TRUST_PROXY=1
EOF
                print_warning "IMPORTANT: Update DATABASE_URL in .env with your external database connection string!"
                echo ""
                read -p "Press Enter after updating .env, or Ctrl+C to cancel..."
            fi
            
            print_success "Created .env file with generated secrets"
        fi
    else
        print_success ".env file already exists."
    fi
    
    # Create SSL directory for nginx (optional)
    mkdir -p nginx/ssl
    
    # Fix permissions
    chmod 600 .env 2>/dev/null || true
}

# -----------------------------------------------------------------------------
# Create Docker network
# -----------------------------------------------------------------------------
create_network() {
    print_step "Creating Docker network..."
    
    if ! docker network inspect pcvisor-network &> /dev/null; then
        docker network create pcvisor-network
        print_success "Created network: pcvisor-network"
    else
        print_success "Network pcvisor-network already exists."
    fi
}

# -----------------------------------------------------------------------------
# Build and start services
# -----------------------------------------------------------------------------
start_services() {
    print_step "Building and starting services..."
    
    DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cd "$DEPLOY_DIR"
    
    # Pull latest base images
    print_info "Pulling base images..."
    if [ "$DEPLOYMENT_MODE" = "full" ]; then
        $COMPOSE_CMD -f $COMPOSE_FILE pull redis nginx db 2>/dev/null || true
    else
        $COMPOSE_CMD -f $COMPOSE_FILE pull redis nginx 2>/dev/null || true
    fi
    
    # Build application image
    print_info "Building application image..."
    $COMPOSE_CMD -f $COMPOSE_FILE build --no-cache app
    
    # Start all services
    print_info "Starting services..."
    $COMPOSE_CMD -f $COMPOSE_FILE up -d
    
    # Wait for services to be healthy
    print_info "Waiting for services to be healthy..."
    sleep 15
    
    # Check service status
    $COMPOSE_CMD -f $COMPOSE_FILE ps
}

# -----------------------------------------------------------------------------
# Run database migration
# -----------------------------------------------------------------------------
run_migration() {
    print_step "Running database migration..."
    
    DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cd "$DEPLOY_DIR"
    
    # Wait a bit more for database to be fully ready
    sleep 5
    
    # Run migration
    if $COMPOSE_CMD -f $COMPOSE_FILE exec -T app npm run db:push; then
        print_success "Database migration completed successfully!"
    else
        print_warning "Migration may have failed. You can run it manually later:"
        echo "  $COMPOSE_CMD -f $COMPOSE_FILE exec app npm run db:push"
    fi
}

# -----------------------------------------------------------------------------
# Create admin user
# -----------------------------------------------------------------------------
create_admin() {
    if [ "$SKIP_ADMIN" = true ]; then
        print_info "Skipping admin user creation (--skip-admin flag)"
        return
    fi
    
    print_step "Creating admin user..."
    
    DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cd "$DEPLOY_DIR"
    
    # Create admin user
    if $COMPOSE_CMD -f $COMPOSE_FILE exec -T app node dist/create-admin.cjs; then
        print_success "Admin user created successfully!"
    else
        print_warning "Admin user creation may have failed. You can run it manually later:"
        echo "  $COMPOSE_CMD -f $COMPOSE_FILE exec app node dist/create-admin.cjs"
    fi
}

# -----------------------------------------------------------------------------
# Seed predefined roles
# -----------------------------------------------------------------------------
seed_roles() {
    print_step "Seeding predefined roles..."
    
    DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cd "$DEPLOY_DIR"
    
    # Seed roles
    if $COMPOSE_CMD -f $COMPOSE_FILE exec -T app node dist/seed-roles.cjs; then
        print_success "Predefined roles seeded successfully!"
    else
        print_warning "Role seeding may have failed. You can run it manually later:"
        echo "  $COMPOSE_CMD -f $COMPOSE_FILE exec app node dist/seed-roles.cjs"
    fi
}

# -----------------------------------------------------------------------------
# Print access information
# -----------------------------------------------------------------------------
print_access_info() {
    echo ""
    echo "=============================================="
    echo "  Deployment Complete!"
    echo "=============================================="
    echo ""
    print_success "Services are running!"
    echo ""
    echo "Access URLs:"
    echo "  - Application: http://localhost"
    echo "  - Direct App:  http://localhost:5000"
    echo ""
    echo "Default Credentials:"
    echo "  - Username: admin"
    echo "  - Password: P@ssw0rd@123"
    echo ""
    print_warning "IMPORTANT: Change the admin password immediately after first login!"
    echo ""
    echo "Useful Commands:"
    echo "  - View logs:      $COMPOSE_CMD -f $COMPOSE_FILE logs -f"
    echo "  - View app logs:  $COMPOSE_CMD -f $COMPOSE_FILE logs -f app"
    echo "  - Stop:           $COMPOSE_CMD -f $COMPOSE_FILE down"
    echo "  - Restart:        $COMPOSE_CMD -f $COMPOSE_FILE restart"
    echo "  - Scale app:      $COMPOSE_CMD -f $COMPOSE_FILE up -d --scale app=3"
    echo ""
    if [ "$DEPLOYMENT_MODE" = "full" ]; then
        echo "Database Commands (built-in PostgreSQL):"
        echo "  - Access DB:      $COMPOSE_CMD -f $COMPOSE_FILE exec db psql -U pcvisor -d pcvisor"
        echo "  - Backup DB:      $COMPOSE_CMD -f $COMPOSE_FILE exec db pg_dump -U pcvisor pcvisor > backup.sql"
        echo ""
    fi
    echo "For Docker Swarm deployment:"
    echo "  - docker stack deploy -c docker-compose.swarm.yml pcvisor"
    echo "  - docker service scale pcvisor_app=5"
    echo ""
}

# -----------------------------------------------------------------------------
# Main execution
# -----------------------------------------------------------------------------
main() {
    check_docker
    check_docker_compose
    setup_environment
    create_network
    start_services
    run_migration
    create_admin
    seed_roles
    print_access_info
}

# Run main function
main "$@"
