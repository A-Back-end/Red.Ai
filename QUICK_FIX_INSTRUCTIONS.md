# 🚀 Быстрое исправление API Projects

## Проблема
`POST https://redai.site/api/projects` возвращает 500 ошибку

## Быстрое решение (1 минута)

### Вариант 1: Автоматический скрипт
```bash
./deploy-projects-api-fix.sh
```

### Вариант 2: Ручное исправление
```bash
# 1. Остановить контейнеры
docker-compose -f docker-compose.prod.yml down

# 2. Запустить с исправленной конфигурацией
docker-compose -f docker-compose.prod.yml up -d

# 3. Проверить
curl -X POST https://redai.site/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","userId":"test"}'
```

## Что исправлено

✅ **nginx-redai-fixed.conf** - `/api/projects` теперь идет на frontend  
✅ **docker-compose.prod.yml** - использует исправленную конфигурацию  
✅ **app/api/projects/route.ts** - улучшенное логирование и валидация  

## Тест после исправления

```bash
# Должен вернуть 200 OK и JSON с проектом
curl -X POST https://redai.site/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","userId":"test-user"}'
```

## Если не работает

1. Проверьте логи: `docker-compose -f docker-compose.prod.yml logs`
2. Проверьте статус: `docker-compose -f docker-compose.prod.yml ps`
3. Перезапустите: `docker-compose -f docker-compose.prod.yml restart`

**🎉 API Projects должен работать!** 