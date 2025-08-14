#!/bin/bash

# ========================================
# DOCKER BUILD FIX SCRIPT
# ========================================
# Скрипт для исправления проблем с Docker build

set -e

echo "🔧 Исправление проблем с Docker build..."

# Проверяем Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен!"
    exit 1
fi

# Очищаем Docker cache
echo "🧹 Очищаем Docker cache..."
docker system prune -f
docker builder prune -f

# Проверяем сетевые настройки
echo "🌐 Проверяем сетевые настройки..."
docker network ls

# Создаем сеть если её нет
if ! docker network ls | grep -q "redai_network"; then
    echo "🔗 Создаем сеть redai_network..."
    docker network create redai_network
fi

# Пробуем разные стратегии сборки
echo "🔨 Пробуем сборку с исправлениями..."

# Стратегия 1: Обычная сборка
echo "📦 Стратегия 1: Обычная сборка..."
if docker-compose build --no-cache; then
    echo "✅ Сборка успешна!"
    exit 0
fi

# Стратегия 2: Сборка с принудительным pull
echo "📦 Стратегия 2: Сборка с принудительным pull..."
if docker-compose build --no-cache --pull; then
    echo "✅ Сборка успешна!"
    exit 0
fi

# Стратегия 3: Сборка только frontend
echo "📦 Стратегия 3: Сборка только frontend..."
if docker build --no-cache -f Dockerfile.frontend .; then
    echo "✅ Frontend сборка успешна!"
    echo "🔄 Теперь пробуем полную сборку..."
    if docker-compose build --no-cache; then
        echo "✅ Полная сборка успешна!"
        exit 0
    fi
fi

# Стратегия 4: Сборка с альтернативным npm registry
echo "📦 Стратегия 4: Сборка с альтернативным npm registry..."
cat > Dockerfile.frontend.temp << 'EOF'
# Frontend Dockerfile - Production Ready with npm fixes
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies with multiple npm registry fallbacks
COPY package*.json ./
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 5 && \
    npm config set timeout 60000 && \
    (npm ci --only=production || \
     npm install --only=production || \
     npm install --only=production --registry https://registry.npmjs.org/)

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Accept Clerk publishable key as build argument
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

# Set environment variables for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
EOF

# Пробуем сборку с временным Dockerfile
if docker build --no-cache -f Dockerfile.frontend.temp .; then
    echo "✅ Временная сборка успешна!"
    echo "🔄 Заменяем основной Dockerfile..."
    mv Dockerfile.frontend.temp Dockerfile.frontend
    if docker-compose build --no-cache; then
        echo "✅ Полная сборка успешна!"
        exit 0
    fi
fi

# Очищаем временные файлы
rm -f Dockerfile.frontend.temp

echo "❌ Все стратегии сборки не удались!"
echo ""
echo "🔍 Возможные решения:"
echo "1. Проверьте интернет соединение"
echo "2. Попробуйте использовать VPN"
echo "3. Проверьте настройки прокси"
echo "4. Попробуйте позже (возможно проблемы с npm registry)"
echo ""
echo "📋 Попробуйте вручную:"
echo "   docker-compose build --no-cache --pull"
echo "   docker system prune -a"
echo "   docker-compose build --no-cache"

exit 1
