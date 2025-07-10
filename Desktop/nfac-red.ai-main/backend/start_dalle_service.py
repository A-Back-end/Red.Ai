#!/usr/bin/env python3
"""
Startup script for DALL·E Image Generation Service
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def check_requirements():
    """Check if all requirements are met"""
    print("🔍 Checking requirements...")
    
    # Check if OpenAI API key is set
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ OPENAI_API_KEY environment variable is not set!")
        print("   Please set it with: export OPENAI_API_KEY='your-api-key'")
        return False
    else:
        print("✅ OpenAI API key found")
    
    # Check if required packages are installed
    try:
        import flask
        import openai
        import requests
        import PIL
        print("✅ Required packages installed")
    except ImportError as e:
        print(f"❌ Missing required package: {e}")
        print("   Please install with: pip install -r requirements.txt")
        return False
    
    return True

def create_requirements_file():
    """Create requirements.txt if it doesn't exist"""
    requirements_file = Path(__file__).parent / "requirements.txt"
    
    if not requirements_file.exists():
        print("📝 Creating requirements.txt...")
        requirements = [
            "flask>=2.3.0",
            "flask-cors>=4.0.0", 
            "openai>=1.0.0",
            "requests>=2.31.0",
            "Pillow>=10.0.0",
            "python-dotenv>=1.0.0"
        ]
        
        with open(requirements_file, 'w') as f:
            f.write('\n'.join(requirements))
        
        print("✅ requirements.txt created")
    else:
        print("✅ requirements.txt exists")

def check_port(port=5000):
    """Check if port is available"""
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        result = s.connect_ex(('localhost', port))
        return result != 0

def start_service():
    """Start the DALL·E service"""
    print("🚀 Starting DALL·E Image Generation Service...")
    
    # Check if port is available
    port = int(os.getenv('PORT', 5000))
    if not check_port(port):
        print(f"❌ Port {port} is already in use!")
        print(f"   Please free the port or set a different PORT environment variable")
        return False
    
    # Set environment variables
    os.environ.setdefault('FLASK_APP', 'dalle_service.py')
    os.environ.setdefault('FLASK_ENV', 'development')
    
    # Start the service
    service_file = Path(__file__).parent / "dalle_service.py"
    
    try:
        print(f"📡 Starting service on port {port}...")
        print(f"🌐 Service will be available at: http://localhost:{port}")
        print("📊 Endpoints:")
        print("   • GET  /health - Health check")
        print("   • POST /generate - Generate images")
        print("   • GET  /history - Get generation history")
        print("   • GET  /stats - Get statistics")
        print("\n⌨️  Press Ctrl+C to stop the service\n")
        
        # Run the service
        subprocess.run([sys.executable, str(service_file)], check=True)
        
    except KeyboardInterrupt:
        print("\n🛑 Service stopped by user")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Service failed to start: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def main():
    """Main startup function"""
    print("🎨 DALL·E Image Generation Service Startup")
    print("=" * 50)
    
    # Create requirements file
    create_requirements_file()
    
    # Check requirements
    if not check_requirements():
        print("\n💡 Setup instructions:")
        print("1. Install required packages: pip install -r requirements.txt")
        print("2. Set OpenAI API key: export OPENAI_API_KEY='your-api-key'")
        print("3. Run this script again")
        sys.exit(1)
    
    # Start service
    print("\n" + "=" * 50)
    success = start_service()
    
    if success:
        print("✅ Service shutdown successfully")
        sys.exit(0)
    else:
        print("❌ Service failed to start")
        sys.exit(1)

if __name__ == '__main__':
    main() 