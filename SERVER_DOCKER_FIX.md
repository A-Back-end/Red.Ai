# 🚨 Server Docker Fix - No Space Left on Device

## ❌ Проблема

```
failed to solve: ResourceExhausted: write /var/lib/docker/overlay2/...
no space left on device
```

**Причины:**
- Закончилось место на диске сервера
- Docker build context слишком большой (146MB+)
- Накопился кэш Docker

## ⚡ Быстрое исправление

На сервере выполните команды **по порядку**:

### 1. Проверьте место на диске
```bash
df -h /
```

### 2. Быстрая очистка Docker
```bash
# Остановите все контейнеры
docker stop $(docker ps -aq)

# Агрессивная очистка Docker
docker system prune -af --volumes

# Удалите build кэш
docker builder prune -af
```

### 3. Очистите проект от больших файлов
```bash
cd ~/Red.Ai

# Удалите кэш и временные файлы
rm -rf .next
rm -rf node_modules/.cache
rm -rf backend/.venv
rm -rf backend/venv
rm -rf __pycache__
find . -name "*.pyc" -delete
find . -name "*.log" -size +1M -delete

# Очистите временные папки
rm -rf temp/*
rm -rf tmp/*
rm -rf logs/*
```

### 4. Проверьте результат
```bash
df -h /
```

### 5. Попробуйте заново
```bash
docker-compose up -d --build
```

## 🛠️ Автоматические скрипты

Если у вас есть доступ к скриптам:

```bash
# Быстрое исправление
./scripts/fix-docker-disk-space.sh

# Полная очистка
./scripts/server-disk-cleanup.sh
```

## 🔍 Диагностика проблем

### Проверить самые большие файлы:
```bash
# В корне проекта
du -sh * | sort -hr | head -10

# В системе
sudo du -sh /var/lib/docker/*
```

### Проверить использование Docker:
```bash
docker system df
```

### Найти большие логи:
```bash
find /var/log -name "*.log" -size +100M
sudo journalctl --disk-usage
```

## 📋 Размеры Docker Context

**Проблема:** Docker пытается загрузить 146MB+ файлов в build context.

**Решение:** Убедитесь что `.dockerignore` содержит:
```
node_modules/
.next/
__pycache__/
*.pyc
.venv/
venv/
backend/.venv/
backend/venv/
logs/
*.log
temp/
tmp/
.git/
```

## 🚨 Критические команды

### Если диск заполнен на 100%:
```bash
# Экстренная очистка
sudo rm -rf /tmp/*
sudo rm -rf /var/tmp/*
sudo apt clean
sudo journalctl --vacuum-time=1d

# Очистка Docker
docker system prune -af --volumes
```

### Освободить место в Docker:
```bash
# Удалить все неиспользуемые образы
docker image prune -af

# Удалить все остановленные контейнеры
docker container prune -f

# Удалить все неиспользуемые volumes
docker volume prune -f
```

## ✅ Проверка успеха

После очистки:
1. `df -h /` должно показывать < 80% использования
2. `docker-compose up -d --build` должно работать без ошибок
3. Build context должен быть < 50MB

## 🔄 Предотвращение проблемы

1. **Регулярная очистка:**
   ```bash
   # Добавьте в cron (еженедельно)
   0 2 * * 0 docker system prune -af
   ```

2. **Мониторинг места:**
   ```bash
   # Проверяйте место каждый день
   df -h /
   ```

3. **Оптимизированный .dockerignore**
   - Исключайте все cache файлы
   - Исключайте virtual environments  
   - Исключайте логи и временные файлы

## 📞 Если ничего не помогает

1. **Увеличьте размер диска** на сервере
2. **Переместите Docker на другой диск:**
   ```bash
   sudo systemctl stop docker
   sudo mv /var/lib/docker /new/location/docker
   sudo ln -s /new/location/docker /var/lib/docker
   sudo systemctl start docker
   ```

3. **Используйте Docker с удаленным registry** вместо локальной сборки 