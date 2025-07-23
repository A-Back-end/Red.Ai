#!/bin/bash

# Start Production Environment for redai.site
# Запуск production окружения с SSL поддержкой

echo "🚀 Starting RED.AI production environment..."

# Проверяем наличие необходимых файлов
if [ ! -f "nginx-redai.conf" ]; then
    echo "❌ nginx-redai.conf not found!"
    exit 1
fi

if [ ! -f "docker-compose-redai-prod.yml" ]; then
    echo "❌ docker-compose-redai-prod.yml not found!"
    exit 1
fi

# Проверяем наличие SSL сертификата
echo "🔍 Checking SSL certificate..."
if docker run --rm -v letsencrypt:/etc/letsencrypt certbot/certbot certificates 2>/dev/null | grep -q "redai.site"; then
    echo "✅ SSL certificate found"
else
    echo "⚠️  SSL certificate not found. Running setup..."
    ./setup-ssl.sh
    if [ $? -ne 0 ]; then
        echo "❌ SSL setup failed. Exiting."
        exit 1
    fi
fi

# Останавливаем dev сервер если запущен
echo "🛑 Stopping development server..."
pkill -f "next dev" || true
pkill -f "node.*3000" || true

# Останавливаем существующие Docker контейнеры
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose-redai-prod.yml down 2>/dev/null || true

# Создаем .env файл если его нет
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# Environment variables for production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bGVhcm5pbmctamVubmV0LTgzLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_Q4dXsL37jneHgKUCm87G9B80YPPqoZjNyAoqU5kTEu
BFL_API_KEY=501cf430-f9d9-445b-9b60-1949650f352a
AZURE_OPENAI_API_KEY=FM1DHQMuPkCX1TKRnIVVprIoQ1RwI6yaPBNEJ0gx3kdRUNMpprAlJQQJ99BGACYeBjFXJ3w3AAABACOGLuJD
AZURE_OPENAI_ENDPOINT=https://neuroflow-hub.openai.azure.com/
AZURE_OPENAI_API_VERSION=2024-05-01-preview
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://redai.site
NEXT_PUBLIC_API_URL=https://redai.site/api
EOF
    echo "⚠️  .env file created with production values"
fi

# Билдим и запускаем контейнеры
echo "🔨 Building and starting containers..."
docker-compose -f docker-compose-redai-prod.yml up --build -d

# Ждем запуска сервисов
echo "⏳ Waiting for services to start..."
sleep 30

# Проверяем статус сервисов
echo "📊 Checking service status..."
docker-compose -f docker-compose-redai-prod.yml ps

# Проверяем доступность через HTTP
echo "🌐 Testing HTTP access..."
if curl -f -s http://localhost/health > /dev/null; then
    echo "✅ HTTP access working"
else
    echo "⚠️  HTTP access not working"
fi

# Проверяем доступность через HTTPS
echo "🔒 Testing HTTPS access..."
if curl -f -s -k https://localhost/health > /dev/null; then
    echo "✅ HTTPS access working"
else
    echo "⚠️  HTTPS access not working"
fi

# Показываем логи
echo "📋 Recent logs:"
docker-compose -f docker-compose-redai-prod.yml logs --tail=20

echo ""
echo "🎉 Production environment started!"
echo ""
echo "🌐 Your site should be available at:"
echo "   📄 https://redai.site"
echo "   📄 https://www.redai.site"
echo ""
echo "🔧 Management commands:"
echo "   📋 View logs: docker-compose -f docker-compose-redai-prod.yml logs -f"
echo "   🛑 Stop: docker-compose -f docker-compose-redai-prod.yml down"
echo "   🔄 Restart: docker-compose -f docker-compose-redai-prod.yml restart"
echo "   📊 Status: docker-compose -f docker-compose-redai-prod.yml ps"
echo ""
echo "🔐 SSL certificate will auto-renew every 12 hours" 