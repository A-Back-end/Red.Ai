#!/bin/bash

# Script to fix nginx configuration for RedAI projects API
echo "🔧 Fixing nginx configuration for RedAI projects API..."

# Check if we're running in Docker
if [ -f /.dockerenv ]; then
    echo "🐳 Running in Docker container"
    
    # Copy the fixed nginx configuration
    cp /app/nginx-redai-fixed.conf /etc/nginx/nginx.conf
    
    # Test nginx configuration
    echo "🧪 Testing nginx configuration..."
    nginx -t
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx configuration is valid"
        
        # Reload nginx
        echo "🔄 Reloading nginx..."
        nginx -s reload
        
        if [ $? -eq 0 ]; then
            echo "✅ Nginx reloaded successfully"
        else
            echo "❌ Failed to reload nginx"
            exit 1
        fi
    else
        echo "❌ Nginx configuration is invalid"
        exit 1
    fi
else
    echo "🖥️  Running on host system"
    
    # Check if nginx is installed
    if ! command -v nginx &> /dev/null; then
        echo "❌ Nginx is not installed"
        exit 1
    fi
    
    # Backup current configuration
    echo "💾 Backing up current nginx configuration..."
    sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)
    
    # Copy the fixed configuration
    echo "📝 Copying fixed nginx configuration..."
    sudo cp nginx-redai-fixed.conf /etc/nginx/nginx.conf
    
    # Test nginx configuration
    echo "🧪 Testing nginx configuration..."
    sudo nginx -t
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx configuration is valid"
        
        # Reload nginx
        echo "🔄 Reloading nginx..."
        sudo nginx -s reload
        
        if [ $? -eq 0 ]; then
            echo "✅ Nginx reloaded successfully"
        else
            echo "❌ Failed to reload nginx"
            echo "🔄 Restarting nginx..."
            sudo systemctl restart nginx
        fi
    else
        echo "❌ Nginx configuration is invalid"
        echo "🔄 Restoring backup configuration..."
        sudo cp /etc/nginx/nginx.conf.backup.* /etc/nginx/nginx.conf
        exit 1
    fi
fi

echo "🎉 Nginx configuration updated successfully!"
echo "📋 The /api/projects endpoint should now work correctly"
echo "🧪 You can test it with: curl -X POST https://redai.site/api/projects -H 'Content-Type: application/json' -d '{\"name\":\"Test\",\"userId\":\"test\"}'" 