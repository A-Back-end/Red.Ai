#!/bin/bash

# 🔐 Comprehensive SSL Diagnostic and Fix Script for redai.site
# Этот скрипт диагностирует и исправляет проблемы с SSL сертификатами

echo "🔍 RED.AI SSL Diagnostic Tool v1.0"
echo "=================================="

DOMAIN="redai.site"
DOMAIN_WWW="www.redai.site"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo_success() { echo -e "${GREEN}✅ $1${NC}"; }
echo_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
echo_error() { echo -e "${RED}❌ $1${NC}"; }
echo_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# 1. Проверка DNS
echo ""
echo "🌐 Step 1: DNS Configuration Check"
echo "=================================="

DOMAIN_IP=$(dig +short $DOMAIN)
SERVER_IP=$(curl -s -m 10 ifconfig.me 2>/dev/null || curl -s -m 10 ipv4.icanhazip.com 2>/dev/null || echo "Unable to detect")

echo_info "Domain $DOMAIN points to: $DOMAIN_IP"
echo_info "This server IP: $SERVER_IP"

if [ "$DOMAIN_IP" = "$SERVER_IP" ]; then
    echo_success "DNS configuration is correct"
else
    echo_warning "DNS might not be correctly configured"
    echo_info "Make sure $DOMAIN A record points to $SERVER_IP"
fi

# 2. Проверка портов
echo ""
echo "🔌 Step 2: Port Connectivity Check"
echo "================================="

# Проверка порта 80
if timeout 5 bash -c "</dev/tcp/$DOMAIN/80" 2>/dev/null; then
    echo_success "Port 80 (HTTP) is accessible"
else
    echo_error "Port 80 (HTTP) is not accessible"
fi

# Проверка порта 443
if timeout 5 bash -c "</dev/tcp/$DOMAIN/443" 2>/dev/null; then
    echo_success "Port 443 (HTTPS) is accessible"
else
    echo_error "Port 443 (HTTPS) is not accessible"
fi

# 3. Проверка SSL сертификата
echo ""
echo "🔐 Step 3: SSL Certificate Check"
echo "==============================="

# Проверка через openssl
if command -v openssl &> /dev/null; then
    echo_info "Checking SSL certificate with OpenSSL..."
    
    SSL_INFO=$(echo | timeout 10 openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null)
    
    if echo "$SSL_INFO" | grep -q "Verify return code: 0"; then
        echo_success "SSL certificate is valid"
        
        # Извлекаем информацию о сертификате
        CERT_SUBJECT=$(echo "$SSL_INFO" | grep "subject=" | head -1)
        CERT_ISSUER=$(echo "$SSL_INFO" | grep "issuer=" | head -1)
        echo_info "Certificate subject: $CERT_SUBJECT"
        echo_info "Certificate issuer: $CERT_ISSUER"
        
    else
        echo_error "SSL certificate validation failed"
        VERIFY_ERROR=$(echo "$SSL_INFO" | grep "Verify return code:" | head -1)
        echo_error "Error: $VERIFY_ERROR"
    fi
else
    echo_warning "OpenSSL not available for certificate check"
fi

# 4. Проверка через curl
echo ""
echo "🌐 Step 4: HTTPS Connectivity Test"
echo "================================="

# Тест HTTP redirect
echo_info "Testing HTTP to HTTPS redirect..."
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -L "http://$DOMAIN" 2>/dev/null)
if [ "$HTTP_RESPONSE" = "200" ]; then
    echo_success "HTTP redirects to HTTPS successfully"
elif [ "$HTTP_RESPONSE" = "301" ] || [ "$HTTP_RESPONSE" = "302" ]; then
    echo_success "HTTP redirects properly (code: $HTTP_RESPONSE)"
else
    echo_error "HTTP redirect failed (code: $HTTP_RESPONSE)"
fi

# Тест HTTPS
echo_info "Testing HTTPS connectivity..."
HTTPS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" 2>/dev/null)
if [ "$HTTPS_RESPONSE" = "200" ]; then
    echo_success "HTTPS is working correctly"
else
    echo_error "HTTPS failed (code: $HTTPS_RESPONSE)"
fi

# 5. Проверка Docker контейнеров
echo ""
echo "🐳 Step 5: Docker Services Check"
echo "==============================="

if command -v docker &> /dev/null; then
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(nginx|certbot)" > /dev/null; then
        echo_success "SSL-related Docker containers are running:"
        docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(nginx|certbot)" | sed 's/^/  /'
    else
        echo_warning "No SSL-related Docker containers found running"
        echo_info "You may need to start the production environment"
    fi
else
    echo_warning "Docker not available for container check"
fi

# 6. Проверка сертификата Let's Encrypt
echo ""
echo "🔑 Step 6: Let's Encrypt Certificate Status"
echo "=========================================="

if docker volume ls | grep -q letsencrypt; then
    echo_info "Let's Encrypt volume exists"
    
    # Проверяем сертификаты внутри volume
    CERT_STATUS=$(docker run --rm -v letsencrypt:/etc/letsencrypt certbot/certbot certificates 2>/dev/null)
    
    if echo "$CERT_STATUS" | grep -q "$DOMAIN"; then
        echo_success "Let's Encrypt certificate found for $DOMAIN"
        echo "$CERT_STATUS" | grep -A 5 -B 5 "$DOMAIN" | sed 's/^/  /'
    else
        echo_error "No Let's Encrypt certificate found for $DOMAIN"
    fi
else
    echo_warning "Let's Encrypt volume not found"
fi

# 7. Рекомендации по исправлению
echo ""
echo "🛠️  Step 7: Recommendations"
echo "=========================="

echo_info "Based on the diagnostic results:"

if [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    echo "1. Fix DNS: Update A record for $DOMAIN to point to $SERVER_IP"
fi

if ! timeout 5 bash -c "</dev/tcp/$DOMAIN/443" 2>/dev/null; then
    echo "2. Check firewall: Ensure ports 80 and 443 are open"
    echo "   - sudo ufw allow 80"
    echo "   - sudo ufw allow 443"
fi

if [ "$HTTPS_RESPONSE" != "200" ]; then
    echo "3. SSL Setup: Run the SSL setup and production startup:"
    echo "   - ./setup-ssl.sh"
    echo "   - ./start-production.sh"
fi

echo ""
echo "🚀 Quick Fix Commands:"
echo "====================="
echo "1. Get new SSL certificate:"
echo "   ./setup-ssl.sh"
echo ""
echo "2. Start production environment:"
echo "   ./start-production.sh"
echo ""
echo "3. Check logs if issues persist:"
echo "   docker-compose -f docker-compose-redai-prod.yml logs -f"
echo ""
echo "4. Test SSL online:"
echo "   https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"

echo ""
echo_success "Diagnostic completed! Check the recommendations above." 