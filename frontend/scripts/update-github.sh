#!/bin/bash

# Автоматическое обновление GitHub репозитория A-back-end
# Для проекта RED AI Dashboard

echo "🚀 Обновление GitHub репозитория A-back-end..."
echo "📋 Дэшборд AI RED - новые функции"
echo ""

# Проверяем текущий статус git
echo "📊 Проверяю статус git..."
git status

echo ""
echo "📦 Добавляю все изменения..."
git add .

echo ""
echo "📋 Создаю commit с подробным описанием..."
git commit -m "🎨 Add AI RED Dashboard API endpoints

- Added new dashboard endpoints for tasks, clients, designs, interactions
- Created DailyTask, FavoriteClient, DesignPreview, InteractionHistory models
- Added dashboard statistics and design suggestions endpoints
- Updated features list with new dashboard capabilities
- Added comprehensive API documentation
- Created launch script for dashboard backend

Features:
✅ Task management (create, update, delete daily tasks)
✅ Client management (favorites list with interaction history)
✅ Design preview widget with favorite toggle
✅ Interactive dashboard statistics
✅ Design element suggestions (furniture, decor, color schemes)
✅ Full CRUD operations with async/await support
✅ Pydantic models for data validation
✅ Mock data for demonstration

API endpoints:
- GET /api/dashboard/stats
- GET/POST/PUT/DELETE /api/dashboard/tasks
- GET/POST/DELETE /api/dashboard/clients
- GET/POST /api/dashboard/designs
- GET/POST /api/dashboard/interactions
- GET /api/dashboard/suggestions

Technical implementation:
- FastAPI with async/await
- Pydantic for data validation
- CORS support for frontend
- Comprehensive API documentation
- RESTful API design
- Modern minimalist design with muted blue/gray tones"

echo ""
echo "🌐 Проверяю удаленный репозиторий..."
git remote -v

echo ""
echo "📤 Отправляю изменения в GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Успешно обновлено!"
    echo "🎉 Репозиторий A-back-end обновлен с новыми функциями дэшборда AI RED"
    echo ""
    echo "📋 Что было добавлено:"
    echo "   🎯 Панель задач с ежедневными целями"
    echo "   👥 Список избранных клиентов"
    echo "   🎨 Виджет превью дизайнов"
    echo "   📊 Статистика дэшборда"
    echo "   💡 Предложения элементов дизайна"
    echo "   📝 История взаимодействий"
    echo ""
    echo "🔗 Проверьте обновления в GitHub!"
else
    echo ""
    echo "❌ Ошибка при отправке в GitHub"
    echo "🔧 Возможные решения:"
    echo "   1. Проверьте подключение к интернету"
    echo "   2. Убедитесь, что репозиторий настроен правильно"
    echo "   3. Проверьте права доступа к репозиторию"
fi 