"""
Red.AI Database Configuration
Подключение к базе данных и управление сессиями
"""

from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
import os
from typing import Generator

from .config import settings, get_database_url

# URL базы данных
DATABASE_URL = get_database_url()

# Создание движка базы данных
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=10,
        max_overflow=20
    )

# Создание сессии
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для моделей
Base = declarative_base()

# Метаданные для миграций
metadata = MetaData()

def get_db() -> Generator[Session, None, None]:
    """
    Получение сессии базы данных
    Используется как dependency в FastAPI
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Инициализация базы данных"""
    # Импорт всех моделей для создания таблиц
    from ..models import user, project, design, chat
    
    # Создание таблиц
    Base.metadata.create_all(bind=engine)
    
    print("Database initialized successfully")

def check_db_connection():
    """Проверка подключения к базе данных"""
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False

# Supabase клиент (если используется)
supabase_client = None
if settings.SUPABASE_URL and settings.SUPABASE_KEY:
    try:
        from supabase import create_client, Client
        supabase_client: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )
        print("Supabase client initialized")
    except ImportError:
        print("Supabase client not available. Install python-supabase package.")
    except Exception as e:
        print(f"Supabase client initialization failed: {e}")

def get_supabase() -> Client:
    """Получение Supabase клиента"""
    if not supabase_client:
        raise ValueError("Supabase client not initialized")
    return supabase_client

# Утилиты для работы с базой данных
class DatabaseUtils:
    """Утилиты для работы с базой данных"""
    
    @staticmethod
    def create_tables():
        """Создание всех таблиц"""
        Base.metadata.create_all(bind=engine)
    
    @staticmethod
    def drop_tables():
        """Удаление всех таблиц"""
        Base.metadata.drop_all(bind=engine)
    
    @staticmethod
    def reset_database():
        """Сброс базы данных"""
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
    
    @staticmethod
    def get_table_names():
        """Получение списка таблиц"""
        return engine.table_names()
    
    @staticmethod
    def execute_raw_sql(query: str, params: dict = None):
        """Выполнение произвольного SQL запроса"""
        db = SessionLocal()
        try:
            result = db.execute(query, params or {})
            db.commit()
            return result
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()

# Контекстный менеджер для работы с базой данных
class DatabaseManager:
    """Контекстный менеджер для работы с базой данных"""
    
    def __init__(self):
        self.db = None
    
    def __enter__(self) -> Session:
        self.db = SessionLocal()
        return self.db
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            self.db.rollback()
        self.db.close()

# Декоратор для автоматического управления сессией
def with_db_session(func):
    """Декоратор для автоматического управления сессией базы данных"""
    def wrapper(*args, **kwargs):
        with DatabaseManager() as db:
            return func(db, *args, **kwargs)
    return wrapper 