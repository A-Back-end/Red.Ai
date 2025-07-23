#!/bin/bash

# === Скрипт развертывания Red.AI на удаленном сервере ===
# Автоматизирует подключение по SSH, установку Docker, клонирование репозитория и запуск проекта.
#
# Использование:
# ./deploy-server.sh [user@]server_address
# Пример: ./deploy-server.sh admin@your-domain.com
# Если адрес не указан, скрипт попытается определить его автоматически.

set -e

# --- Переменные ---
# Используем первый аргумент как адрес сервера, иначе пытаемся определить его
SERVER_ADDR=${1:-$(curl -s ifconfig.me || echo "localhost")} 
SERVER_USER=$(echo "$SERVER_ADDR" | cut -d@ -f1)
if [[ "$SERVER_ADDR" == *"@"* ]]; then
  SERVER_IP=$(echo "$SERVER_ADDR" | cut -d@ -f2)
else
  SERVER_IP=$SERVER_ADDR
  SERVER_USER="root" # или ваш пользователь по умолчанию
fi

APP_DIR="/home/$SERVER_USER/red-ai"
GITHUB_REPO="https://github.com/your-username/red-ai.git" # <-- ЗАМЕНИТЕ НА ВАШ РЕПОЗИТОРИЙ

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🚀 Deploying Red.AI to server $SERVER_IP as user $SERVER_USER..."

# --- Шаг 1: Проверка и установка Docker ---
echo -e "${BLUE}Checking for Docker on the server...${NC}"
if ! ssh "$SERVER_USER@$SERVER_IP" "command -v docker" &> /dev/null; then
    echo -e "${YELLOW}Docker not found. Installing Docker...${NC}"
    ssh "$SERVER_USER@$SERVER_IP" "bash -s" < <(cat <<'EOF'
        sudo apt-get update
        sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io
        sudo usermod -aG docker $USER
        echo "✅ Docker installed successfully."
EOF
    )
else
    echo -e "${GREEN}Docker is already installed.${NC}"
fi

# --- Шаг 2: Проверка и установка Docker Compose ---
echo -e "${BLUE}Checking for Docker Compose...${NC}"
if ! ssh "$SERVER_USER@$SERVER_IP" "command -v docker-compose" &> /dev/null; then
    echo -e "${YELLOW}Docker Compose not found. Installing...${NC}"
    ssh "$SERVER_USER@$SERVER_IP" "bash -s" < <(cat <<'EOF'
        sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        echo "✅ Docker Compose installed successfully."
EOF
    )
else
    echo -e "${GREEN}Docker Compose is already installed.${NC}"
fi


# --- Шаг 3: Настройка проекта на сервере ---
echo -e "${BLUE}Setting up project directory on the server...${NC}"
ssh "$SERVER_USER@$SERVER_IP" "bash -s" -- "$APP_DIR" "$GITHUB_REPO" < <(cat <<'EOF'
    APP_DIR=$1
    GITHUB_REPO=$2
    if [ -d "$APP_DIR" ]; then
        echo "Directory $APP_DIR already exists. Pulling latest changes..."
        cd "$APP_DIR"
        git pull
    else
        echo "Cloning repository..."
        git clone "$GITHUB_REPO" "$APP_DIR"
    fi
EOF
)

# --- Шаг 4: Копирование .env файла ---
echo -e "${BLUE}Copying environment file to the server...${NC}"
if [ -f ".env" ]; then
    scp .env "$SERVER_USER@$SERVER_IP:$APP_DIR/.env"
    echo -e "${GREEN}.env file copied.${NC}"
else
    echo -e "${YELLOW}⚠️  .env file not found locally. Skipping copy. Please create it on the server manually.${NC}"
    ssh "$SERVER_USER@$SERVER_IP" "touch $APP_DIR/.env"
fi

# --- Шаг 5: Запуск Docker контейнеров ---
echo -e "${BLUE}🚀 Starting Docker containers...${NC}"
ssh "$SERVER_USER@$SERVER_IP" "cd $APP_DIR && docker-compose -f docker-compose.prod.yml up -d --build"

# --- Шаг 6: Проверка статуса ---
echo -e "${BLUE}🔍 Verifying deployment status...${NC}"
sleep 15

# Проверка доступности фронтенда
echo -n "Checking frontend..."
if curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_IP" | grep -q "200"; then
    echo -e " ${GREEN}✅ Frontend is accessible: http://$SERVER_IP${NC}"
else
    echo -e " ${YELLOW}⚠️  Could not connect to frontend at http://$SERVER_IP. Check Docker logs.${NC}"
fi

# Проверка доступности бэкенда
echo -n "Checking backend..."
if curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_IP/api/health" | grep -q "200"; then
    echo -e " ${GREEN}✅ Backend is accessible: http://$SERVER_IP/api/health${NC}"
else
    echo -e " ${YELLOW}⚠️  Could not connect to backend at http://$SERVER_IP/api/health. Check Docker logs.${NC}"
fi

echo -e "\n🎉 ${GREEN}Deployment finished!${NC}"
echo -e "----------------------------------------"
echo -e "${BLUE}   Frontend: http://$SERVER_IP${NC}"
echo -e "${BLUE}   Backend API: http://$SERVER_IP/api${NC}"
echo -e "${BLUE}   API Docs: http://$SERVER_IP/api/docs${NC}"
echo -e "----------------------------------------"
echo -e "ℹ️  To view logs, run: ssh $SERVER_USER@$SERVER_IP 'cd $APP_DIR && docker-compose -f docker-compose.prod.yml logs -f'" 