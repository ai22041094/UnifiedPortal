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
NC='\033[0m' # No Color

# Print colored message
print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Header
echo "=============================================="
echo "  pcvisor Docker Setup"
echo "  Unified Access Control & Enterprise Management"
echo "=============================================="
echo ""

# -----------------------------------------------------------------------------
# Check and install Docker
# -----------------------------------------------------------------------------
check_docker() {
    print_info "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        print_warning "Docker not found. Installing..."
        
        # Detect OS
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            curl -fsSL https://get.docker.com | sh
            sudo usermod -aG docker $USER
            print_success "Docker installed. Please log out and back in for group changes."
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
    print_info "Checking Docker Compose installation..."
    
    if docker compose version &> /dev/null; then
        print_success "Docker Compose (plugin) is installed: $(docker compose version)"
    elif command -v docker-compose &> /dev/null; then
        print_success "Docker Compose (standalone) is installed: $(docker-compose --version)"
        # Create alias for consistency
        COMPOSE_CMD="docker-compose"
    else
        print_warning "Docker Compose not found. Installing..."
        
        # Install Docker Compose plugin
        DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
        mkdir -p $DOCKER_CONFIG/cli-plugins
        curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m) \
            -o $DOCKER_CONFIG/cli-plugins/docker-compose
        chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
        
        print_success "Docker Compose installed."
    fi
}

# Set compose command
COMPOSE_CMD="docker compose"
if ! docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker-compose"
fi

# -----------------------------------------------------------------------------
# Setup environment
# -----------------------------------------------------------------------------
setup_environment() {
    print_info "Setting up environment..."
    
    DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cd "$DEPLOY_DIR"
    
    # Check if .env exists, if not create from example
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_warning "Created .env from .env.example. Please update with your values."
        else
            print_info "Creating default .env file..."
            cat > .env << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://user:password@host:5432/database

# Session Secret (generate a strong random string)
SESSION_SECRET=your-super-secret-session-key-change-this

# Node Environment
NODE_ENV=production

# Application Port
PORT=5000

# Redis Configuration (auto-configured by docker-compose)
REDIS_URL=redis://redis:6379

# Trust Proxy (set to 1 when behind reverse proxy)
TRUST_PROXY=1
EOF
            print_warning "Created default .env file. Please update DATABASE_URL and SESSION_SECRET!"
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
    print_info "Creating Docker network..."
    
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
    print_info "Building and starting services..."
    
    DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cd "$DEPLOY_DIR"
    
    # Pull latest base images
    print_info "Pulling base images..."
    $COMPOSE_CMD pull redis nginx || true
    
    # Build application image
    print_info "Building application image..."
    $COMPOSE_CMD build --no-cache app
    
    # Start all services
    print_info "Starting services..."
    $COMPOSE_CMD up -d
    
    # Wait for services to be healthy
    print_info "Waiting for services to be healthy..."
    sleep 10
    
    # Check service status
    $COMPOSE_CMD ps
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
    echo "Useful Commands:"
    echo "  - View logs:    $COMPOSE_CMD logs -f"
    echo "  - Stop:         $COMPOSE_CMD down"
    echo "  - Restart:      $COMPOSE_CMD restart"
    echo "  - Scale app:    $COMPOSE_CMD up -d --scale app=3"
    echo ""
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
    print_access_info
}

# Run main function
main "$@"
