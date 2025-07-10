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

echo -e "${BLUE}📦 Проверка зависимостей...${NC}"

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js не установлен. Установите Node.js 18+${NC}"
    exit 1
fi

# Проверка npm
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}⚠️  npm не установлен${NC}"
    exit 1
fi

# Установка зависимостей
echo -e "${BLUE}📦 Установка зависимостей...${NC}"
npm install

# Создание .env.local для локального тестирования
if [ ! -f ".env.local" ]; then
    echo -e "${BLUE}🔧 Создание локального .env файла...${NC}"
    cat > .env.local << 'EOF'
# === Локальная конфигурация для тестирования ===
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# === Тестовые ключи (замените на реальные) ===
OPENAI_API_KEY=sk-test-key-replace-with-real
AZURE_OPENAI_API_KEY=test-azure-key
AZURE_OPENAI_ENDPOINT=https://test.openai.azure.com/
AZURE_DEPLOYMENT_NAME=dall-e-3

# === Firebase (тестовые значения) ===
NEXT_PUBLIC_FIREBASE_API_KEY=test-firebase-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=test.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=test-project
EOF
    echo -e "${YELLOW}💡 Создан файл .env.local с тестовыми значениями${NC}"
    echo -e "${YELLOW}💡 Отредактируйте .env.local с реальными API ключами${NC}"
fi

# Запуск локального сервера
echo -e "${GREEN}🌐 Запуск локального сервера на http://localhost:3000${NC}"
echo -e "${GREEN}⚡ Нажмите Ctrl+C для остановки${NC}"
echo ""

# Запуск в development режиме
npm run dev 