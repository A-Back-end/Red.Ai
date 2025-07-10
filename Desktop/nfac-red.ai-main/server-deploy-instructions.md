# 🚀 Инструкции для развертывания Red.AI на сервере 20.189.121.46

## ⚠️ Предварительные требования

1. **Убедитесь, что сервер доступен:**
   ```bash
   ping 20.189.121.46
   ssh root@20.189.121.46
   ```

2. **Проверьте firewall настройки:**
   - Порт 22 (SSH) - открыт
   - Порт 80 (HTTP) - открыт  
   - Порт 443 (HTTPS) - открыт

## 🔧 Шаги развертывания

### Шаг 1: Подключение к серверу
```bash
ssh root@20.189.121.46
```

### Шаг 2: Установка зависимостей
```bash
# Обновить систему
apt update && apt upgrade -y

# Установить Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Установить Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Установить git
apt install git -y

# Установить nginx (опционально)
apt install nginx -y
```

### Шаг 3: Клонирование репозитория
```bash
# Клонировать репозиторий (замените на ваш URL)
git clone <YOUR_REPOSITORY_URL> /opt/red-ai
cd /opt/red-ai
```

### Шаг 4: Настройка переменных окружения
```bash
# Создать production файл окружения
cp env.production.example .env.production

# Отредактировать файл с реальными ключами
nano .env.production
```

**Важно заполнить в .env.production:**
```bash
# === API URLs ===
NEXT_PUBLIC_API_URL=http://20.189.121.46/api
NEXT_PUBLIC_APP_URL=http://20.189.121.46

# === Azure OpenAI (Основной AI сервис) ===
AZURE_OPENAI_API_KEY=your_real_azure_openai_api_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_DEPLOYMENT_NAME=dall-e-3

# === OpenAI (Запасной) ===
OPENAI_API_KEY=your_real_openai_api_key

# === Firebase Authentication ===
NEXT_PUBLIC_FIREBASE_API_KEY=your_real_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
```

### Шаг 5: Исправление известных проблем
```bash
# Добавить отсутствующую функцию в lib/utils.ts
cat >> lib/utils.ts << 'EOF'

export function formatTokenCount(tokens: number): string {
  if (tokens === 0) return "0"
  if (tokens < 1000) return tokens.toString()
  if (tokens < 1000000) return (tokens / 1000).toFixed(1) + "K"
  return (tokens / 1000000).toFixed(1) + "M"
}
EOF

# Экспортировать translations
sed -i 's/const translations:/export const translations:/' lib/translations.ts

# Отключить проблемный Header.tsx
mv frontend/src/frontend/components/common/Header.tsx frontend/src/frontend/components/common/Header.tsx.disabled 2>/dev/null || true
```

### Шаг 6: Запуск приложения
```bash
# Запустить deployment скрипт
chmod +x deploy-server.sh
./deploy-server.sh
```

**Или вручную:**
```bash
# Собрать и запустить контейнеры
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Проверить статус
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

### Шаг 7: Проверка развертывания
```bash
# Проверить доступность
curl http://20.189.121.46
curl http://20.189.121.46/api/health

# Проверить логи
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs nginx
```

## 🌐 Доступ к приложению

После успешного развертывания:
- **Frontend:** http://20.189.121.46
- **Backend API:** http://20.189.121.46/api
- **API Docs:** http://20.189.121.46/api/docs

## 🔒 Настройка SSL (опционально)

```bash
# Установить certbot
apt install certbot python3-certbot-nginx -y

# Получить сертификат (замените yourdomain.com)
certbot --nginx -d yourdomain.com

# Обновить nginx.conf на nginx.prod.conf
cp nginx.prod.conf nginx.conf
docker-compose -f docker-compose.prod.yml restart nginx
```

## 🛠️ Полезные команды

```bash
# Перезапуск сервисов
docker-compose -f docker-compose.prod.yml restart

# Обновление приложения
git pull
docker-compose -f docker-compose.prod.yml up -d --build

# Просмотр логов
docker-compose -f docker-compose.prod.yml logs -f

# Остановка сервисов
docker-compose -f docker-compose.prod.yml down

# Очистка Docker
docker system prune -a
```

## 🚨 Решение проблем

### Сервер недоступен
1. Проверьте статус сервера в облачной панели
2. Убедитесь, что firewall настроен правильно
3. Проверьте SSH ключи и учетные данные

### Docker build ошибки
1. Убедитесь, что все файлы загружены правильно
2. Проверьте переменные окружения
3. Запустите `docker system prune -a` для очистки

### Приложение не отвечает
1. Проверьте логи: `docker-compose logs`
2. Убедитесь, что все контейнеры запущены: `docker-compose ps`
3. Проверьте порты: `netstat -tlnp`

## 📞 Поддержка

При возникновении проблем:
1. Сохраните логи: `docker-compose logs > deployment-logs.txt`
2. Проверьте статус всех сервисов
3. Убедитесь, что все API ключи правильно настроены 