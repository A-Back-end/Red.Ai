# Red.AI Server Deployment Guide

## Overview

This guide provides instructions for deploying Red.AI to a production server using Docker with optimized configurations to prevent space issues and ensure reliable deployment.

## Prerequisites

- Docker and Docker Compose installed on the server
- At least 10GB of available disk space
- 4GB+ RAM recommended
- Linux server (Ubuntu 20.04+ recommended)

## Quick Deployment

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd Red.Ai

# Copy environment file
cp env.production.example .env

# Edit environment variables
nano .env
```

### 2. Run Deployment Script

```bash
# Make script executable
chmod +x scripts/deploy-server.sh

# Deploy with cache (faster)
./scripts/deploy-server.sh

# Or deploy without cache (fresh build)
./scripts/deploy-server.sh --no-cache
```

## Manual Deployment

### 1. Clean Docker Resources

```bash
# Stop existing containers
docker-compose -f docker/docker-compose-server.yml down --remove-orphans

# Clean up unused resources
docker system prune -f
docker volume prune -f
```

### 2. Build Images

```bash
# Enable BuildKit for better performance
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Build all services
docker-compose -f docker/docker-compose-server.yml build --parallel
```

### 3. Start Services

```bash
# Start all services
docker-compose -f docker/docker-compose-server.yml up -d

# Check status
docker-compose -f docker/docker-compose-server.yml ps
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_BACKUP_KEY=your_backup_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_VERSION=2024-05-01-preview
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4.1

# Application Settings
NODE_ENV=production
DEBUG=false
USE_AZURE_AD=false

# Database (if using external database)
DATABASE_URL=postgresql://user:password@host:port/database

# Redis (if using external Redis)
REDIS_URL=redis://host:port
```

### Nginx Configuration

The deployment includes Nginx for reverse proxy. Configure SSL certificates:

```bash
# Create SSL directory
mkdir -p docker/ssl

# Copy your SSL certificates
cp your-cert.pem docker/ssl/
cp your-key.pem docker/ssl/
```

## Service Architecture

### Services Overview

- **Frontend** (Port 3000): Next.js React application
- **Backend** (Port 8000): Python FastAPI backend
- **AI Processor** (Port 8001): AI model processing service
- **Nginx** (Port 80/443): Reverse proxy and SSL termination

### Resource Limits

- Frontend: 512MB RAM, 0.5 CPU
- Backend: 2GB RAM, 1.0 CPU
- AI Processor: 4GB RAM, 2.0 CPU
- Nginx: 128MB RAM, 0.25 CPU

## Monitoring and Maintenance

### Check Service Status

```bash
# View running containers
docker-compose -f docker/docker-compose-server.yml ps

# View logs
docker-compose -f docker/docker-compose-server.yml logs -f

# Check resource usage
docker stats
```

### Health Checks

All services include health checks:

- Backend: `http://localhost:8000/health`
- AI Processor: `http://localhost:8001/health`

### Backup and Restore

```bash
# Backup volumes
docker run --rm -v redai_uploads_data:/data -v $(pwd):/backup alpine tar czf /backup/uploads_backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v redai_uploads_data:/data -v $(pwd):/backup alpine tar xzf /backup/uploads_backup.tar.gz -C /data
```

## Troubleshooting

### Common Issues

#### 1. "No space left on device"

```bash
# Clean Docker system
docker system prune -a -f

# Check disk space
df -h

# Remove unused images
docker image prune -a -f
```

#### 2. Build Failures

```bash
# Clear Docker build cache
docker builder prune -f

# Rebuild without cache
docker-compose -f docker/docker-compose-server.yml build --no-cache
```

#### 3. Service Won't Start

```bash
# Check logs
docker-compose -f docker/docker-compose-server.yml logs [service-name]

# Check resource usage
docker stats

# Restart specific service
docker-compose -f docker/docker-compose-server.yml restart [service-name]
```

### Performance Optimization

#### 1. Enable Docker BuildKit

```bash
# Add to /etc/docker/daemon.json
{
  "features": {
    "buildkit": true
  }
}

# Restart Docker
sudo systemctl restart docker
```

#### 2. Optimize Storage Driver

```bash
# Use overlay2 storage driver
# Add to /etc/docker/daemon.json
{
  "storage-driver": "overlay2"
}
```

## Security Considerations

### 1. Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp  # SSH
sudo ufw enable
```

### 2. SSL/TLS Configuration

```bash
# Generate SSL certificate (Let's Encrypt)
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates to Docker SSL directory
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem docker/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem docker/ssl/
```

### 3. Regular Updates

```bash
# Update images
docker-compose -f docker/docker-compose-server.yml pull

# Rebuild and restart
docker-compose -f docker/docker-compose-server.yml up -d --build
```

## Scaling

### Horizontal Scaling

```bash
# Scale specific service
docker-compose -f docker/docker-compose-server.yml up -d --scale backend=3
```

### Load Balancer Configuration

For production deployments, consider using a load balancer (HAProxy, Traefik) in front of the services.

## Support

For issues and questions:

1. Check the logs: `docker-compose -f docker/docker-compose-server.yml logs`
2. Review this documentation
3. Check GitHub issues
4. Contact the development team

## Changelog

- **v1.0**: Initial optimized deployment configuration
- **v1.1**: Added multi-stage builds for smaller images
- **v1.2**: Added resource limits and health checks
- **v1.3**: Improved error handling and monitoring 