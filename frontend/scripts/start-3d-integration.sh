#!/bin/bash

# 🎨 RED AI 3D Blender Integration Startup Script
# Быстрый запуск системы 3D дизайна интерьеров

echo "🎨 Starting RED AI 3D Blender Integration..."
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo -e "${BLUE}📋 Checking system requirements...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ to continue.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm to continue.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher. Current version: $(node --version)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) detected${NC}"

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Please run this script from the project root directory.${NC}"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Check if Blender is available (optional)
echo -e "${BLUE}🔍 Checking for Blender installation...${NC}"
if command -v blender &> /dev/null; then
    BLENDER_VERSION=$(blender --version | head -n 1)
    echo -e "${GREEN}✅ $BLENDER_VERSION detected${NC}"
    echo -e "${GREEN}   You can use generated Python scripts directly in Blender!${NC}"
else
    echo -e "${YELLOW}⚠️  Blender not found in PATH${NC}"
    echo -e "${YELLOW}   You can still generate 3D scripts and use them manually${NC}"
fi

# Start the development server
echo -e "${BLUE}🚀 Starting RED AI 3D Integration...${NC}"
echo ""
echo -e "${GREEN}🌟 3D Features Available:${NC}"
echo -e "   • 📸 Image-based room analysis"
echo -e "   • 🤖 Claude AI integration for 3D instructions"
echo -e "   • 🐍 Automatic Blender Python script generation"
echo -e "   • 🏠 Support for living rooms, bedrooms, kitchens"
echo -e "   • 🎨 Modern, minimalist, and classic styles"
echo -e "   • 📦 Complete asset download with ZIP export"
echo ""
echo -e "${BLUE}📖 Documentation: BLENDER_3D_INTEGRATION_README.md${NC}"
echo ""
echo -e "${YELLOW}🔗 Your app will be available at:${NC}"

# Try to start on port 3001 if 3000 is taken
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Port 3000 is busy, trying 3001...${NC}"
    PORT=3001 npm run dev
else
    echo -e "${GREEN}🌐 http://localhost:3000${NC}"
    npm run dev
fi 