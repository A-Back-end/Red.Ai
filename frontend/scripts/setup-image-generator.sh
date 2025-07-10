#!/bin/bash

# 🎨 RED AI Image Generator - Setup Script
# Скрипт для настройки и запуска обновленного генератора изображений

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Функция для вывода заголовков
print_header() {
    echo -e "\n${PURPLE}========================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}========================================${NC}\n"
}

# Функция для вывода статуса
print_status() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

# Проверка существования файла
check_file() {
    if [ -f "$1" ]; then
        print_success "Файл $1 найден"
        return 0
    else
        print_warning "Файл $1 не найден"
        return 1
    fi
}

# Проверка установки зависимостей
check_dependencies() {
    print_header "Проверка зависимостей"
    
    # Проверка Node.js
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        print_success "Node.js установлен: $NODE_VERSION"
    else
        print_error "Node.js не установлен"
        exit 1
    fi
    
    # Проверка npm/yarn
    if command -v npm >/dev/null 2>&1; then
        NPM_VERSION=$(npm --version)
        print_success "npm установлен: $NPM_VERSION"
    else
        print_error "npm не установлен"
        exit 1
    fi
    
    # Проверка Next.js проекта
    if [ -f "package.json" ]; then
        print_success "Next.js проект найден"
    else
        print_error "package.json не найден. Убедитесь что вы в корневой директории проекта"
        exit 1
    fi
}

# Проверка API ключей
check_api_keys() {
    print_header "Проверка API ключей"
    
    if [ -f ".env" ]; then
        print_success ".env файл найден"
        
        # Проверка наличия OpenAI API ключа
        if grep -q "OPENAI_API_KEY=" .env; then
            OPENAI_KEY=$(grep "OPENAI_API_KEY=" .env | cut -d '=' -f2 | tr -d '"')
            if [ -n "$OPENAI_KEY" ] && [ "$OPENAI_KEY" != "your_openai_key_here" ]; then
                print_success "OpenAI API ключ настроен"
            else
                print_error "OpenAI API ключ не настроен или использует значение по умолчанию"
                echo -e "${YELLOW}Настройте OPENAI_API_KEY в файле .env${NC}"
                exit 1
            fi
        else
            print_error "OPENAI_API_KEY не найден в .env файле"
            exit 1
        fi
    else
        print_warning ".env файл не найден"
        echo -e "${YELLOW}Создайте .env файл на основе .env.example${NC}"
        
        if [ -f ".env.example" ]; then
            echo -e "${CYAN}Копирую .env.example в .env...${NC}"
            cp .env.example .env
            print_success ".env файл создан"
            print_warning "Необходимо настроить API ключи в .env файле"
            exit 1
        else
            print_error ".env.example не найден"
            exit 1
        fi
    fi
}

# Проверка API endpoints
check_api_endpoints() {
    print_header "Проверка API endpoints"
    
    # Проверка существования файлов endpoints
    check_file "app/api/dalle-generator/route.ts"
    check_file "app/api/generate-design/route.ts"
    
    # Проверка ImageGenerator компонента
    check_file "components/dashboard/ImageGenerator.tsx"
}

# Создание необходимых директорий
create_directories() {
    print_header "Создание необходимых директорий"
    
    # Создание папки для изображений
    if [ ! -d "public/generated-images" ]; then
        mkdir -p public/generated-images
        print_success "Создана папка public/generated-images/"
    else
        print_success "Папка public/generated-images/ уже существует"
    fi
    
    # Установка прав доступа
    chmod 755 public/generated-images
    print_success "Права доступа к папке настроены"
}

# Установка зависимостей
install_dependencies() {
    print_header "Установка зависимостей"
    
    print_status "Установка npm зависимостей..."
    npm install
    print_success "npm зависимости установлены"
    
    # Проверка наличия openai пакета
    if npm list openai >/dev/null 2>&1; then
        print_success "Пакет openai установлен"
    else
        print_status "Установка пакета openai..."
        npm install openai
        print_success "Пакет openai установлен"
    fi
}

# Запуск тестов
run_tests() {
    print_header "Запуск тестов API endpoints"
    
    if [ -f "test-dalle-endpoints.js" ]; then
        print_status "Запуск тестового скрипта..."
        echo -e "${YELLOW}Убедитесь что приложение запущено на порту 3000 в другом терминале${NC}"
        echo -e "${CYAN}Нажмите Enter чтобы продолжить, или Ctrl+C чтобы пропустить тесты${NC}"
        read
        
        node test-dalle-endpoints.js
    else
        print_warning "Тестовый скрипт test-dalle-endpoints.js не найден"
    fi
}

# Показать инструкции по запуску
show_instructions() {
    print_header "Инструкции по запуску"
    
    echo -e "${GREEN}🎉 Настройка завершена успешно!${NC}\n"
    
    echo -e "${CYAN}Для запуска приложения:${NC}"
    echo -e "  ${YELLOW}npm run dev${NC}        # Режим разработки"
    echo -e "  ${YELLOW}npm run build${NC}      # Сборка для продакшена"
    echo -e "  ${YELLOW}npm run start${NC}      # Запуск продакшен версии"
    
    echo -e "\n${CYAN}Для тестирования API:${NC}"
    echo -e "  ${YELLOW}node test-dalle-endpoints.js${NC}  # Тестирование endpoints"
    
    echo -e "\n${CYAN}Полезные ссылки:${NC}"
    echo -e "  ${BLUE}Dashboard:${NC} http://localhost:3000/dashboard"
    echo -e "  ${BLUE}Image Generator:${NC} http://localhost:3000/image-generator"
    echo -e "  ${BLUE}API Docs:${NC} README_IMAGE_GENERATOR.md"
    
    echo -e "\n${CYAN}Структура проекта:${NC}"
    echo -e "  ${YELLOW}app/api/dalle-generator/${NC}     # Простой DALL-E endpoint"
    echo -e "  ${YELLOW}app/api/generate-design/${NC}     # Комплексный endpoint"
    echo -e "  ${YELLOW}components/dashboard/ImageGenerator.tsx${NC}  # UI компонент"
    echo -e "  ${YELLOW}public/generated-images/${NC}     # Сохраненные изображения"
    
    echo -e "\n${CYAN}Мониторинг затрат:${NC}"
    echo -e "  ${YELLOW}Standard quality:${NC} ~$0.040 за изображение"
    echo -e "  ${YELLOW}HD quality:${NC} ~$0.080 за изображение"
    echo -e "  ${BLUE}Отслеживайте расходы в OpenAI Dashboard${NC}"
}

# Главная функция
main() {
    echo -e "${PURPLE}"
    echo "  ____  _____ ____     _    ___   ___                            "
    echo " |  _ \| ____|  _ \   / \  |_ _| |_ _|_ __ ___   __ _  __ _  ___  "
    echo " | |_) |  _| | | | | / _ \  | |   | || '_ \` _ \ / _\` |/ _\` |/ _ \ "
    echo " |  _ <| |___| |_| |/ ___ \ | |   | || | | | | | (_| | (_| |  __/ "
    echo " |_| \_\_____|____/_/   \_\___| |___|_| |_| |_|\__,_|\__, |\___| "
    echo "                                                    |___/        "
    echo " ____                           _             "
    echo "|  _ \ _   _ _ __  _ __   ___ _ __| |_ ___ _ __  "
    echo "| |_) | | | | '_ \| '_ \ / _ \ '__| __/ _ \ '__| "
    echo "|  _ <| |_| | | | | | | |  __/ |  | ||  __/ |    "
    echo "|_| \_\\\\__, |_| |_|_| |_|\___|_|   \__\___|_|    "
    echo "       |___/                                      "
    echo -e "${NC}"
    
    print_header "RED AI Image Generator - DALL-E 3 Setup"
    
    # Выполнение проверок и настройки
    check_dependencies
    check_api_keys
    check_api_endpoints
    create_directories
    install_dependencies
    
    show_instructions
    
    # Предложение запустить тесты
    echo -e "\n${CYAN}Хотите запустить тесты API endpoints? (y/n)${NC}"
    read -r answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        run_tests
    fi
    
    echo -e "\n${GREEN}🚀 RED AI Image Generator готов к работе!${NC}"
}

# Проверка аргументов командной строки
case "${1:-}" in
    "test")
        run_tests
        ;;
    "deps")
        check_dependencies
        install_dependencies
        ;;
    "dirs")
        create_directories
        ;;
    *)
        main
        ;;
esac 