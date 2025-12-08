# pcvisor Docker Deployment Guide

Production-grade Docker setup for pcvisor - Unified Access Control & Enterprise Management platform.

## Directory Structure

```
deploy/
├── Dockerfile                 # Multi-stage production Dockerfile
├── docker-compose.yml         # Standard Docker Compose (external database)
├── docker-compose.full.yml    # Full stack with built-in PostgreSQL
├── docker-compose.swarm.yml   # Docker Swarm with auto-scaling
├── setup.sh                   # One-command bootstrap script
├── .env.example               # Environment variables template
├── README.md                  # This documentation
├── nginx/
│   └── default.conf           # NGINX reverse proxy config
└── k8s/
    ├── deployment.yaml        # Kubernetes Deployment
    ├── service.yaml           # Kubernetes Services
    ├── ingress.yaml           # Kubernetes Ingress
    ├── hpa.yaml               # Horizontal Pod Autoscaler
    └── secrets.yaml           # Kubernetes Secrets template
```

## Quick Start

### Option 1: One-Command Setup

```bash
cd deploy
./setup.sh
```

This script will:
- Install Docker & Docker Compose (if missing)
- Create necessary networks
- Build the application image
- Start all services
- Print access URLs

### Option 2: Manual Setup (External Database)

Use this when you have an external PostgreSQL database (e.g., Neon, AWS RDS, Cloud SQL):

```bash
cd deploy

# Copy and edit environment file
cp .env.example .env
nano .env  # Update DATABASE_URL and SESSION_SECRET

# Build and start
docker compose up -d --build

# View logs
docker compose logs -f
```

### Option 3: Full Stack (Built-in Database)

Use this for fully self-contained deployment with PostgreSQL included:

```bash
cd deploy

# Copy and edit environment file
cp .env.example .env
nano .env  # Update DB_PASSWORD and SESSION_SECRET

# Build and start with full stack
docker compose -f docker-compose.full.yml up -d --build

# View logs
docker compose -f docker-compose.full.yml logs -f
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes* | PostgreSQL connection string (for docker-compose.yml) |
| `DB_PASSWORD` | Yes* | Database password (for docker-compose.full.yml) |
| `SESSION_SECRET` | Yes | Secret for session encryption |
| `REDIS_URL` | No | Redis URL (auto-configured in Docker) |
| `NODE_ENV` | No | Environment (default: production) |
| `PORT` | No | Application port (default: 5000) |
| `TRUST_PROXY` | No | Set to 1 when behind proxy |

*Note: Use `DATABASE_URL` with external database, or `DB_PASSWORD` with built-in PostgreSQL.

### Generate Session Secret

```bash
openssl rand -base64 32
```

## Deployment Options

### Local Development

```bash
docker compose up -d
```
Access at: http://localhost

### Docker Swarm (Production)

```bash
# Initialize swarm (if not already)
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.swarm.yml pcvisor

# Scale the app
docker service scale pcvisor_app=5

# View services
docker service ls

# View logs
docker service logs -f pcvisor_app
```

### Kubernetes

```bash
cd deploy/k8s

# Update secrets (IMPORTANT!)
# Edit secrets.yaml with base64 encoded values
kubectl apply -f secrets.yaml

# Deploy all resources
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml

# Check status
kubectl get pods -l app=pcvisor
kubectl get hpa pcvisor-app-hpa

# View logs
kubectl logs -f -l app=pcvisor,component=app
```

## Scaling

### Docker Compose (Manual)

```bash
docker compose up -d --scale app=3
```

### Docker Swarm (Auto)

The Swarm configuration includes:
- Min replicas: 2
- Max replicas: 20
- Rolling updates with zero downtime
- Automatic restart on failure

```bash
# Manual scaling
docker service scale pcvisor_app=10
```

### Kubernetes (HPA)

The HorizontalPodAutoscaler automatically scales based on:
- CPU utilization > 70%
- Memory utilization > 80%

```bash
# View autoscaler status
kubectl get hpa pcvisor-app-hpa

# Manual scaling (overrides HPA temporarily)
kubectl scale deployment pcvisor-app --replicas=5
```

## SSL/TLS Configuration

### NGINX (Docker Compose)

1. Place certificates in `deploy/nginx/ssl/`:
   - `cert.pem` - SSL certificate
   - `key.pem` - Private key

2. Uncomment HTTPS server block in `nginx/default.conf`

3. Restart NGINX:
```bash
docker compose restart nginx
```

### Kubernetes

```bash
# Create TLS secret
kubectl create secret tls pcvisor-tls-secret \
  --cert=path/to/cert.pem \
  --key=path/to/key.pem

# Update ingress.yaml with correct hostname
kubectl apply -f ingress.yaml
```

## Health Checks

All services include health checks:

- **App**: `GET /api/health`
- **Redis**: `redis-cli ping`
- **NGINX**: `nginx -t`

```bash
# Check health
curl http://localhost/api/health

# Docker health status
docker compose ps
```

## Useful Commands

```bash
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f app

# Restart all services
docker compose restart

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v

# Rebuild without cache
docker compose build --no-cache

# Update and restart
docker compose up -d --build
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs app

# Check container status
docker compose ps
```

### Redis connection issues

```bash
# Test Redis connection
docker compose exec redis redis-cli ping

# Check Redis logs
docker compose logs redis
```

### Database connection issues

1. Verify `DATABASE_URL` is correct
2. Ensure database is accessible from Docker network
3. Check firewall rules

### Performance issues

```bash
# Check resource usage
docker stats

# Scale up
docker compose up -d --scale app=3
```

## Post-Deployment Setup

### Database Migration

After first deployment, run the database migration to create tables:

```bash
# For docker-compose.yml (external database)
docker compose exec app npm run db:push

# For docker-compose.full.yml (built-in database)
docker compose -f docker-compose.full.yml exec app npm run db:push
```

### Create Admin User

Create the initial admin user:

```bash
# For docker-compose.yml
docker compose exec app node dist/create-admin.cjs

# For docker-compose.full.yml
docker compose -f docker-compose.full.yml exec app node dist/create-admin.cjs
```

## Default Credentials

After running the admin creation script, log in with:
- **Username**: admin
- **Password**: P@ssw0rd@123

**Important**: Change the admin password immediately after first login!

## Production Checklist

- [ ] Update `SESSION_SECRET` with a strong random value
- [ ] Configure proper `DATABASE_URL`
- [ ] Set up SSL/TLS certificates
- [ ] Change default admin password
- [ ] Configure backup strategy for Redis and database
- [ ] Set up monitoring and alerting
- [ ] Configure log aggregation
- [ ] Review and adjust resource limits
- [ ] Set up automated certificate renewal (Let's Encrypt)
