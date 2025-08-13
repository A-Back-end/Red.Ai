#!/bin/bash

# Setup SSL Certificate for redai.site
# Этот скрипт поможет получить SSL сертификат для домена redai.site

echo "🔐 Setting up SSL certificate for redai.site..."

# Проверяем, что домен указывает на этот сервер
echo "📋 Checking DNS configuration..."
DOMAIN_IP=$(dig +short redai.site)
SERVER_IP=$(curl -s ifconfig.me)

echo "Domain redai.site points to: $DOMAIN_IP"
echo "This server IP: $SERVER_IP"

if [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    echo "⚠️  WARNING: Domain redai.site does not point to this server!"
    echo "Please update your DNS A record to point redai.site to $SERVER_IP"
    echo "Continuing anyway for testing purposes..."
fi

# Создаем временную конфигурацию Nginx для получения сертификата
echo "📝 Creating temporary Nginx configuration..."
cat > nginx-temp.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name redai.site www.redai.site;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 200 "Server is ready for SSL setup";
            add_header Content-Type text/plain;
        }
    }
}
EOF

# Останавливаем существующие процессы на портах 80 и 443
echo "🛑 Stopping existing services..."
sudo lsof -ti:80 | xargs sudo kill -9 2>/dev/null || true
sudo lsof -ti:443 | xargs sudo kill -9 2>/dev/null || true

# Запускаем временный Docker контейнер для получения сертификата
echo "🚀 Starting temporary Nginx for certificate generation..."
docker run -d --name nginx-temp \
    -p 80:80 \
    -v $(pwd)/nginx-temp.conf:/etc/nginx/nginx.conf:ro \
    -v certbot-www:/var/www/certbot \
    nginx:alpine

# Ждем запуска Nginx
sleep 5

# Получаем SSL сертификат
echo "🔑 Requesting SSL certificate from Let's Encrypt..."
docker run --rm \
    -v letsencrypt:/etc/letsencrypt \
    -v certbot-www:/var/www/certbot \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@redai.site \
    --agree-tos \
    --no-eff-email \
    -d redai.site \
    -d www.redai.site

# Проверяем успешность получения сертификата
if docker run --rm -v letsencrypt:/etc/letsencrypt certbot/certbot certificates | grep -q "redai.site"; then
    echo "✅ SSL certificate successfully obtained!"
    
    # Проверяем срок действия сертификата
    echo "📅 Certificate information:"
    docker run --rm -v letsencrypt:/etc/letsencrypt certbot/certbot certificates
    
    # Останавливаем временный контейнер
    docker stop nginx-temp
    docker rm nginx-temp
    
    # Удаляем временный файл
    rm nginx-temp.conf
    
    echo "🎉 SSL setup completed! You can now start the production environment:"
    echo "   ./start-production.sh"
    
else
    echo "❌ Failed to obtain SSL certificate!"
    echo "Please check:"
    echo "1. Domain redai.site points to this server IP: $SERVER_IP"
    echo "2. Ports 80 and 443 are accessible from the internet"
    echo "3. Firewall allows HTTP/HTTPS traffic"
    
    # Останавливаем временный контейнер
    docker stop nginx-temp
    docker rm nginx-temp
    rm nginx-temp.conf
    
    exit 1
fi 