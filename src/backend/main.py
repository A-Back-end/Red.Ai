"""
Red.AI Backend - FastAPI Application
Главный файл для запуска API сервера
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
from typing import Optional

# Импорт модулей приложения
from core.config import settings
from core.database import get_db
from core.exceptions import RedAIException
from core.middleware import setup_middleware
from api.v1.router import api_router

# Создание приложения FastAPI
app = FastAPI(
    title="Red.AI API",
    description="AI-powered interior design platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение middleware
setup_middleware(app)

# Подключение роутеров
app.include_router(api_router, prefix="/api/v1")

# Статические файлы
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    """Главная страница API"""
    return RedirectResponse(url="/docs")

@app.get("/health")
async def health_check():
    """Проверка состояния сервера"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT
    }

@app.get("/info")
async def app_info():
    """Информация о приложении"""
    return {
        "app": "Red.AI Backend",
        "version": "1.0.0",
        "description": "AI-powered interior design platform",
        "features": [
            "AI image generation",
            "Room analysis",
            "Design recommendations",
            "Project management",
            "User authentication"
        ]
    }

# Обработчики ошибок
@app.exception_handler(RedAIException)
async def redai_exception_handler(request, exc: RedAIException):
    return HTTPException(
        status_code=exc.status_code,
        detail=exc.detail
    )

@app.exception_handler(404)
async def not_found_handler(request, exc):
    return HTTPException(
        status_code=404,
        detail="Resource not found"
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return HTTPException(
        status_code=500,
        detail="Internal server error"
    )

# Запуск сервера
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    ) 