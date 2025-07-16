# 🚀 Production Deployment Guide for redai.site

## ✅ Исправления проблемы с редиректами

### Проблема
При переходе на https://redai.site/index.html происходил редирект на https://redai.site:3000/login, но нужно редиректить на https://redai.site/login без порта.

### Исправления
1. ✅ **public/index.html** - заменены все ссылки с `http://localhost:3000/login` на `/login`
2. ✅ **next.config.js** - обновлен `NEXT_PUBLIC_APP_URL` для production
3. ✅ **Backend CORS** - добавлен `https://redai.site` во все CORS конфигурации
4. ✅ **Тестовые файлы** - обновлены для использования относительных путей

## 🔧 Настройка Production Environment

### 1. Создайте файл .env.production
```bash
cp env.production.example .env.production
# Отредактируйте .env.production с вашими реальными API ключами
```

### 2. Основные переменные для production:
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://redai.site
ALLOWED_ORIGINS=https://redai.site
DALLE_ALLOWED_ORIGINS=https://redai.site
```

### 3. Nginx конфигурация
Убедитесь, что ваш nginx.conf проксирует запросы правильно:
```nginx
server {
    listen 443 ssl;
    server_name redai.site;
    
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔧 Deployment Steps

### 1. Build и запуск Docker контейнеров
```bash
# Из корневой директории проекта
docker-compose -f docker-compose.prod.yml up --build -d
```

### 2. Проверка статуса
```bash
docker-compose -f docker-compose.prod.yml ps
```

### 3. Проверка логов
```bash
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs backend
```

## 🧪 Тестирование

После deployment проверьте:
1. ✅ https://redai.site - главная страница загружается
2. ✅ https://redai.site/login - страница логина без редиректов на :3000
3. ✅ https://redai.site/dashboard - доступ к dashboard
4. ✅ Все ссылки на главной странице ведут на относительные пути

## 🔍 Troubleshooting

### Если всё ещё есть редиректы на :3000:
1. Проверьте переменную окружения `NEXT_PUBLIC_APP_URL`
2. Очистите кеш браузера
3. Проверьте nginx конфигурацию
4. Перезапустите Docker контейнеры

### Полезные команды:
```bash
# Перезапуск только frontend
docker-compose -f docker-compose.prod.yml restart frontend

# Просмотр переменных окружения в контейнере
docker-compose -f docker-compose.prod.yml exec frontend env | grep NEXT_PUBLIC

# Проверка nginx конфигурации
docker-compose -f docker-compose.prod.yml exec nginx nginx -t
```

## 📝 Что было изменено

### Файлы с исправлениями:
- ✅ `public/index.html` - все ссылки теперь относительные
- ✅ `next.config.js` - правильный URL для production
- ✅ `src/backend/core/config.py` - добавлен redai.site в CORS
- ✅ `backend/config.py` - добавлен redai.site в CORS
- ✅ `backend/main.py` - добавлен redai.site в CORS
- ✅ `backend/dalle_service.py` - добавлен redai.site в CORS
- ✅ `backend/dotenv/env.example` - обновлён пример CORS
- ✅ `test-theme-translation.html` - исправлены тестовые ссылки
- ✅ `env.production.example` - создан новый файл для production

### Файлы без изменений (уже корректные):
- ✅ `middleware.ts` - уже использует относительные пути для редиректов
- ✅ Все остальные Next.js компоненты используют относительные пути

Теперь ваш сайт https://redai.site должен работать без редиректов на порт 3000! 🎉 