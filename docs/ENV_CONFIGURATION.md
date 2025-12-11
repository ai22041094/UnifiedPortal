# Environment Configuration

This document describes how to configure environment variables for the PCVISOR application.

## Quick Start

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your values

3. Restart the application

## Environment Variables Reference

### Database Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PGHOST` | No | PostgreSQL host (alternative to DATABASE_URL) |
| `PGPORT` | No | PostgreSQL port (default: 5432) |
| `PGUSER` | No | PostgreSQL username |
| `PGPASSWORD` | No | PostgreSQL password |
| `PGDATABASE` | No | PostgreSQL database name |

**Example:**
```
DATABASE_URL=postgresql://user:password@localhost:5432/pcvisor
```

### Session Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `SESSION_SECRET` | Yes | Secret key for session encryption (min 32 chars) |
| `TRUST_PROXY` | No | Set to `1` if behind a reverse proxy |

**Generate a session secret:**
```bash
openssl rand -hex 32
```

### License Server Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `LICENSE_SERVER_URL` | Yes | URL of the license validation server |

**Example:**
```
LICENSE_SERVER_URL=https://license.example.com
```

The license server URL can be verified in the License Management page (Admin Console > License Management).

### Push Notifications (VAPID)

| Variable | Required | Description |
|----------|----------|-------------|
| `VAPID_PUBLIC_KEY` | No | VAPID public key for web push |
| `VAPID_PRIVATE_KEY` | No | VAPID private key for web push |
| `VAPID_SUBJECT` | No | Contact email for VAPID |

**Generate VAPID keys:**
```bash
npx web-push generate-vapid-keys
```

### Application Settings

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 5000 | Application port |
| `NODE_ENV` | No | development | Environment mode |

## Deployment Notes

### Local/Self-Hosted Deployment

1. Copy `.env.example` to `.env`
2. Configure all required variables
3. Set up PostgreSQL database
4. Run `npm run db:push` to create database schema
5. Run `npm run build` to build the application
6. Run `npm run start` to start in production mode

### Docker Deployment

Pass environment variables via docker-compose or `-e` flags:
```yaml
environment:
  - DATABASE_URL=postgresql://user:pass@db:5432/pcvisor
  - SESSION_SECRET=your-secret-here
  - LICENSE_SERVER_URL=https://license.example.com
```

### Security Notes

- Never commit `.env` file to version control
- Use strong, unique values for `SESSION_SECRET`
- Rotate secrets periodically in production
- Use HTTPS for `LICENSE_SERVER_URL` in production
