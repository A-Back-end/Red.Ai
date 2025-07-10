# ☁️ Azure OpenAI GPT-4.1 Integration Guide

## 🌟 Overview

RED AI now supports **Azure OpenAI GPT-4.1** for maximum accuracy and performance. Azure OpenAI provides enterprise-level security and performance for AI assistant functionality.

## 🔑 Setup

### Environment Variables Added:
```bash
AZURE_OPENAI_ENDPOINT=https://neuroflow-hub.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4.1
AZURE_OPENAI_API_VERSION=2025-01-01-preview
AZURE_OPENAI_KEY_1=<YOUR_AZURE_OPENAI_KEY_1>
AZURE_OPENAI_KEY_2=<YOUR_AZURE_OPENAI_KEY_2>
```

### Files Created:
- `/app/api/azure-ai-chat/route.ts` - Azure OpenAI API endpoint
- `/components/dashboard/AzureAIAssistant.tsx` - Azure AI UI component
- Documentation in `/docs/`

## 🚀 Features

### AI Provider Selection
Users can switch between:
- **☁️ Azure OpenAI GPT-4.1** (Default)
- **🧠 OpenAI GPT-4o** (Alternative)

### Enhanced Capabilities
- **Faster response times**
- **Enterprise security**
- **Russian market optimization**
- **Advanced error handling**

## 🎨 UI Differences

Azure AI Assistant features:
- Blue gradient theme
- Cloud icons
- Azure branding
- Enhanced status indicators

## 🔧 Technical Implementation

### API Endpoint: `/api/azure-ai-chat`
- Uses AzureOpenAI client
- Comprehensive error handling
- Russian market prompts
- Usage tracking

### Security Features
- API keys in `.env.local`
- Protected by `.gitignore`
- Client-side provider switching
- Error logging

Ready for testing! 🚀 