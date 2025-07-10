# 🚀 Red.AI Deployment Guide

## Quick Setup

### Prerequisites
- Node.js 18+ 
- Python 3.9+
- Git

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/red-ai.git
cd red-ai
```

### 2. Environment Setup
Copy environment template:
```bash
cp .env.example .env
```

Edit `.env` with your actual values:
```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=your_database_url_here
SECRET_KEY=your_secret_key_here

# Optional
AZURE_OPENAI_API_KEY=your_azure_key_here
```

### 3. Frontend Setup
```bash
npm install
npm run dev
```

### 4. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### 5. Docker (Alternative)
```bash
docker-compose up --build
```

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✅ | OpenAI API key for AI generation |
| `DATABASE_URL` | ✅ | Database connection string |
| `SECRET_KEY` | ✅ | Application secret key |
| `AZURE_OPENAI_API_KEY` | ❌ | Azure OpenAI fallback |
| `NODE_ENV` | ❌ | Environment (development/production) |

## 🏗️ Architecture

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Python Flask, OpenAI API
- **Database**: PostgreSQL/Supabase
- **AI**: OpenAI GPT-4, DALL-E 3
- **Deployment**: Docker, Vercel, Railway

## 📚 Documentation

- [API Documentation](./backend/README_API.md)
- [Frontend Guide](./frontend/docs/README.md)
- [Architecture Overview](./frontend/docs/ARCHITECTURE.md)

## 🐛 Troubleshooting

### Common Issues
1. **API Key Error**: Ensure `OPENAI_API_KEY` is set correctly
2. **Port Conflicts**: Change ports in `.env` if needed
3. **Dependencies**: Run `npm install` and `pip install -r requirements.txt`

### Support
- Check existing documentation in `docs/` folder
- Review error logs in console
- Ensure all environment variables are set 
