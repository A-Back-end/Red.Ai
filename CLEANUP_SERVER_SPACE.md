# Очистка места на сервере - No space left on device

## 🐛 Проблема
```
ERROR: Could not install packages due to an OSError: [Errno 28] No space left on device
```

## 🔧 Решение

### Шаг 1: Проверить использование диска
```bash
# Проверить свободное место
df -h

# Проверить использование места в текущей директории
du -sh *

# Проверить большие файлы
find . -type f -size +100M -exec ls -lh {} \;
```

### Шаг 2: Очистить Docker
```bash
# Остановить все контейнеры
docker-compose down

# Удалить неиспользуемые контейнеры
docker container prune -f

# Удалить неиспользуемые образы
docker image prune -a -f

# Удалить неиспользуемые volumes
docker volume prune -f

# Удалить неиспользуемые networks
docker network prune -f

# Полная очистка Docker (осторожно!)
docker system prune -a -f --volumes
```

### Шаг 3: Очистить логи и временные файлы
```bash
# Очистить логи
sudo journalctl --vacuum-time=3d

# Очистить временные файлы
sudo rm -rf /tmp/*
sudo rm -rf /var/tmp/*

# Очистить кэш apt
sudo apt-get clean
sudo apt-get autoremove -y
```

### Шаг 4: Очистить проект
```bash
# Удалить node_modules (если есть)
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null

# Удалить .next папки
find . -name ".next" -type d -exec rm -rf {} + 2>/dev/null

# Удалить __pycache__
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null

# Удалить .pytest_cache
find . -name ".pytest_cache" -type d -exec rm -rf {} + 2>/dev/null

# Удалить .coverage файлы
find . -name ".coverage" -type f -delete

# Удалить .DS_Store файлы
find . -name ".DS_Store" -type f -delete
```

### Шаг 5: Проверить результат
```bash
# Проверить свободное место после очистки
df -h

# Если места достаточно, попробовать собрать снова
docker-compose up -d --build
```

## 🚀 Альтернативное решение - Увеличить диск

Если очистка не помогла, нужно увеличить размер диска:

### Для Azure:
```bash
# Остановить VM
az vm deallocate --resource-group YOUR_RG --name YOUR_VM_NAME

# Увеличить диск
az disk update --resource-group YOUR_RG --name YOUR_DISK_NAME --size-gb 50

# Запустить VM
az vm start --resource-group YOUR_RG --name YOUR_VM_NAME

# Расширить файловую систему
sudo growpart /dev/sda 1
sudo resize2fs /dev/sda1
```

### Для AWS:
```bash
# Остановить EC2
aws ec2 stop-instances --instance-ids i-1234567890abcdef0

# Увеличить EBS volume через консоль AWS

# Запустить EC2
aws ec2 start-instances --instance-ids i-1234567890abcdef0

# Расширить файловую систему
sudo growpart /dev/xvda 1
sudo resize2fs /dev/xvda1
```

## 📊 Мониторинг места

### Создать скрипт для мониторинга:
```bash
#!/bin/bash
# monitor-disk.sh

echo "=== Disk Usage ==="
df -h

echo -e "\n=== Docker Usage ==="
docker system df

echo -e "\n=== Large Files ==="
find . -type f -size +50M -exec ls -lh {} \; 2>/dev/null | head -10
```

### Добавить в crontab:
```bash
# Проверять каждые 6 часов
0 */6 * * * /path/to/monitor-disk.sh >> /var/log/disk-monitor.log
```

## ⚠️ Профилактика

### 1. Настроить логирование
```bash
# Ограничить размер логов Docker
sudo nano /etc/docker/daemon.json
```

Добавить:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### 2. Настроить автоматическую очистку
```bash
# Создать скрипт автоматической очистки
sudo nano /usr/local/bin/docker-cleanup.sh
```

```bash
#!/bin/bash
# Автоматическая очистка Docker

# Проверить свободное место
FREE_SPACE=$(df / | awk 'NR==2 {print $4}')
MIN_SPACE=5242880  # 5GB в KB

if [ $FREE_SPACE -lt $MIN_SPACE ]; then
    echo "Low disk space detected. Cleaning up Docker..."
    docker system prune -a -f --volumes
    docker image prune -a -f
    docker container prune -f
    docker volume prune -f
    echo "Cleanup completed."
fi
```

### 3. Настроить мониторинг
```bash
# Установить htop для мониторинга
sudo apt-get install htop

# Установить ncdu для анализа использования диска
sudo apt-get install ncdu
```

## 🎯 Быстрое решение

Если нужно быстро освободить место:

```bash
# Остановить все
docker-compose down

# Полная очистка Docker
docker system prune -a -f --volumes

# Очистить логи
sudo journalctl --vacuum-time=1d

# Проверить место
df -h

# Попробовать собрать снова
docker-compose up -d --build
```

**После очистки места Docker сборка должна пройти успешно!** 🎉 