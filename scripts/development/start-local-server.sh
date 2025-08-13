#!/bin/bash

# === Локальный сервер Red.AI для тестирования ===
# Использует Next.js dev сервер вместо Docker для избежания проблем с path mapping

set -e

echo "🚀 Запуск локального сервера Red.AI..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# --- Проверка зависимостей ---
echo -e "${BLUE}📦 Проверка зависимостей...${NC}"

# Проверка Node.js и npm
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js и/или npm не установлены. Пожалуйста, установите Node.js 18+ и npm.${NC}"
    exit 1
fi

# --- Проверка конфигурации ---
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  Файл конфигурации .env не найден.${NC}"
    echo -e "${BLUE}💡 Пожалуйста, скопируйте env.example в .env и заполните его вашими API ключами:${NC}"
    echo -e "cp env.example .env"
    exit 1
fi

# Установка зависимостей, если папка node_modules не существует
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Установка npm зависимостей...${NC}"
    npm install
fi

# Запуск локального сервера
echo -e "${GREEN}🌐 Запуск локального сервера на http://localhost:3000${NC}"
echo -e "${GREEN}⚡ Нажмите Ctrl+C для остановки${NC}"
echo ""

# Запуск в development режиме
npm run dev 