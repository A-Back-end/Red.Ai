#!/bin/bash

# Скрипт для обновления всех .env файлов с реальными значениями
# Заменяет placeholder значения на актуальные ключи

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Обновление всех .env файлов с реальными значениями...${NC}"

# Функция для безопасного получения значения из файла
get_env_value() {
    local file=$1
    local key=$2
    if [ -f "$file" ]; then
        grep "^${key}=" "$file" | cut -d'=' -f2- | tr -d '"' | tr -d "'"
    fi
}

# Получаем реальные значения из .env.local (основной источник)
echo -e "${YELLOW}📖 Чтение реальных значений из .env.local...${NC}"

# Azure OpenAI значения
AZURE_OPENAI_API_KEY=$(get_env_value ".env.local" "AZURE_OPENAI_API_KEY")
AZURE_OPENAI_ENDPOINT=$(get_env_value ".env.local" "AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_API_VERSION=$(get_env_value ".env.local" "AZURE_OPENAI_API_VERSION")
AZURE_OPENAI_DEPLOYMENT_NAME=$(get_env_value ".env.local" "AZURE_OPENAI_DEPLOYMENT_NAME")

# Clerk значения
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$(get_env_value ".env.local" "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY")
CLERK_SECRET_KEY=$(get_env_value ".env.local" "CLERK_SECRET_KEY")

# BFL API
BFL_API_KEY=$(get_env_value ".env.local" "BFL_API_KEY")

# Если .env.local не содержит нужных значений, пробуем .env
if [ -z "$AZURE_OPENAI_API_KEY" ]; then
    AZURE_OPENAI_API_KEY=$(get_env_value ".env" "AZURE_OPENAPI_KEY")
fi

if [ -z "$AZURE_OPENAI_ENDPOINT" ]; then
    AZURE_OPENAI_ENDPOINT=$(get_env_value ".env" "AZURE_ENDPOINT_KEY")
fi

if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$(get_env_value ".env" "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY")
fi

if [ -z "$CLERK_SECRET_KEY" ]; then
    CLERK_SECRET_KEY=$(get_env_value ".env" "CLERK_SECRET_KEY")
fi

if [ -z "$BFL_API_KEY" ]; then
    BFL_API_KEY=$(get_env_value ".env" "BFL_API_KEY")
fi

# Проверяем, что получили все необходимые значения
echo -e "${BLUE}📋 Проверка полученных значений:${NC}"
echo -e "  Azure OpenAI API Key: ${GREEN}${AZURE_OPENAI_API_KEY:0:20}...${NC}"
echo -e "  Azure OpenAI Endpoint: ${GREEN}${AZURE_OPENAI_ENDPOINT}${NC}"
echo -e "  Clerk Publishable Key: ${GREEN}${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:0:20}...${NC}"
echo -e "  BFL API Key: ${GREEN}${BFL_API_KEY:0:20}...${NC}"

# Функция для обновления файла
update_env_file() {
    local file=$1
    local description=$2
    
    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}⚠️  Файл $file не найден, пропускаем${NC}"
        return
    fi
    
    echo -e "${BLUE}🔄 Обновление $description ($file)...${NC}"
    
    # Создаем временный файл
    local temp_file="${file}.tmp"
    
    # Копируем файл
    cp "$file" "$temp_file"
    
    # Заменяем placeholder значения на реальные
    if [ ! -z "$AZURE_OPENAI_API_KEY" ]; then
        sed -i.bak "s/your_azure_openai_api_key_here/$AZURE_OPENAI_API_KEY/g" "$temp_file"
        sed -i.bak "s/AZURE_OPENAI_API_KEY=.*/AZURE_OPENAI_API_KEY=$AZURE_OPENAI_API_KEY/g" "$temp_file"
    fi
    
    if [ ! -z "$AZURE_OPENAI_ENDPOINT" ]; then
        sed -i.bak "s|https://your-resource.openai.azure.com/|$AZURE_OPENAI_ENDPOINT|g" "$temp_file"
        sed -i.bak "s|AZURE_OPENAI_ENDPOINT=.*|AZURE_OPENAI_ENDPOINT=$AZURE_OPENAI_ENDPOINT|g" "$temp_file"
    fi
    
    if [ ! -z "$AZURE_OPENAI_API_VERSION" ]; then
        sed -i.bak "s/AZURE_OPENAI_API_VERSION=.*/AZURE_OPENAI_API_VERSION=$AZURE_OPENAI_API_VERSION/g" "$temp_file"
    fi
    
    if [ ! -z "$AZURE_OPENAI_DEPLOYMENT_NAME" ]; then
        sed -i.bak "s/AZURE_OPENAI_DEPLOYMENT_NAME=.*/AZURE_OPENAI_DEPLOYMENT_NAME=$AZURE_OPENAI_DEPLOYMENT_NAME/g" "$temp_file"
        sed -i.bak "s/your-deployment-name/$AZURE_OPENAI_DEPLOYMENT_NAME/g" "$temp_file"
    fi
    
    if [ ! -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then
        sed -i.bak "s/your_clerk_publishable_key_here/$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY/g" "$temp_file"
        sed -i.bak "s/pk_live_YOUR_PRODUCTION_CLERK_PUBLISHABLE_KEY_HERE/$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY/g" "$temp_file"
        sed -i.bak "s/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=.*/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY/g" "$temp_file"
    fi
    
    if [ ! -z "$CLERK_SECRET_KEY" ]; then
        sed -i.bak "s/your_clerk_secret_key_here/$CLERK_SECRET_KEY/g" "$temp_file"
        sed -i.bak "s/sk_live_YOUR_PRODUCTION_CLERK_SECRET_KEY_HERE/$CLERK_SECRET_KEY/g" "$temp_file"
        sed -i.bak "s/CLERK_SECRET_KEY=.*/CLERK_SECRET_KEY=$CLERK_SECRET_KEY/g" "$temp_file"
    fi
    
    if [ ! -z "$BFL_API_KEY" ]; then
        sed -i.bak "s/BFL_API_KEY=.*/BFL_API_KEY=$BFL_API_KEY/g" "$temp_file"
    fi
    
    # Заменяем оригинальный файл
    mv "$temp_file" "$file"
    rm -f "${file}.bak" 2>/dev/null || true
    
    echo -e "${GREEN}✅ $description обновлен${NC}"
}

# Обновляем все .env файлы
echo -e "${BLUE}🚀 Начинаем обновление файлов...${NC}"

# Основные файлы
update_env_file ".env" "основной .env файл"
update_env_file ".env.local" "локальный .env файл"
update_env_file ".env.production" "продакшн .env файл"

# Проверяем, есть ли другие .env файлы в backend
if [ -f "backend/dotenv/.env" ]; then
    update_env_file "backend/dotenv/.env" "backend .env файл"
fi

# Создаем .env.example с реальными значениями (без секретов)
echo -e "${BLUE}📝 Создание обновленного .env.example...${NC}"
cat > .env.example.updated << 'EOF'
# RED AI - Environment Variables Example
# This file contains the structure but NOT the actual secret values

# ==================== Core Configuration ====================
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ==================== Authentication (Clerk) ====================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# ==================== Azure OpenAI Configuration ====================
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
AZURE_OPENAI_API_VERSION=2024-05-01-preview

# ==================== BFL API ====================
BFL_API_KEY=your_bfl_api_key_here

# ==================== Development Settings ====================
DEBUG=true
LOG_LEVEL=DEBUG
RATE_LIMIT_REQUESTS_PER_MINUTE=50

# ==================== Domovenok Configuration ====================
DOMOVENOK_NAME=Домовёнок
DOMOVENOK_PERSONALITY=friendly
DOMOVENOK_SPECIALIZATION=realtor
DOMOVENOK_MAX_TOKENS=1800
DOMOVENOK_TEMPERATURE=0.7

# ==================== Clerk Settings ====================
NEXT_PUBLIC_CLERK_DISABLE_CAPTCHA=true
CLERK_DISABLE_CAPTCHA=true
EOF

echo -e "${GREEN}✅ .env.example.updated создан${NC}"

# Показываем итоговую статистику
echo -e "${BLUE}📊 Итоговая статистика:${NC}"
echo -e "  Обновлено файлов: ${GREEN}3-4${NC}"
echo -e "  Основные переменные: ${GREEN}Azure OpenAI, Clerk, BFL API${NC}"
echo -e "  Создан: ${GREEN}.env.example.updated${NC}"

echo -e "${GREEN}🎉 Все .env файлы успешно обновлены!${NC}"
echo -e "${YELLOW}💡 Рекомендации:${NC}"
echo -e "  1. Проверьте обновленные файлы"
echo -e "  2. Убедитесь, что все ключи корректны"
echo -e "  3. Не коммитьте .env файлы в git"
echo -e "  4. Используйте .env.example.updated как шаблон для новых развертываний" 