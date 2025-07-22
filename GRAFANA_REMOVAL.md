# Удаление Grafana из проекта Red.AI

## Что было удалено

### 🗂️ Файлы и папки
- `docker/grafana/` - Полная папка с конфигурацией Grafana
- `docker/grafana/dashboards/` - Дашборды Grafana
- `docker/grafana/provisioning/` - Конфигурация provisioning

### 📝 Конфигурационные файлы
- **docker-compose.yml** - Удален сервис `grafana` и volume `grafana_data`
- **docker-compose.yml.bak** - Удален сервис `grafana` и volume `grafana_data`
- **README.md** - Удалено упоминание Grafana из списка мониторинга
- **frontend/scripts/deploy.sh** - Удалены ссылки на Grafana в скриптах развертывания
- **frontend/scripts/start-dev.sh** - Удалены ссылки на Grafana в скриптах разработки
- **frontend/docs/ARCHITECTURE.md** - Удалено упоминание Grafana из архитектуры

### 🔧 Docker конфигурация
Удалены из docker-compose файлов:
```yaml
# Удаленный сервис Grafana
grafana:
  image: grafana/grafana:latest
  container_name: redai_grafana
  ports:
    - "3001:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-admin}
  volumes:
    - grafana_data:/var/lib/grafana
    - ./docker/grafana/dashboards:/var/lib/grafana/dashboards
    - ./docker/grafana/provisioning:/etc/grafana/provisioning
  depends_on:
    - prometheus

# Удаленный volume
grafana_data:
```

## Что осталось

### ✅ Сохраненные компоненты
- **Clerk** - Полностью сохранена аутентификация
- **Prometheus** - Мониторинг остается активным
- **Все остальные сервисы** - Без изменений

### 🔑 Ключевые переменные окружения Clerk
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 📊 Мониторинг
Теперь проект использует только:
- **Prometheus** - для сбора метрик (порт 9090)
- **Структурированное логирование** - для отслеживания ошибок

## Результат

✅ **Grafana полностью удален** из проекта  
✅ **Clerk аутентификация сохранена** и работает  
✅ **Мониторинг через Prometheus** остается активным  
✅ **Все остальные функции** работают без изменений  

Проект теперь использует только Clerk для аутентификации пользователей, что упрощает архитектуру и снижает потребление ресурсов. 