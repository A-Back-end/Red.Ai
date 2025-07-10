"""
Red.AI Backend Exceptions
Кастомные исключения для приложения
"""

from fastapi import HTTPException
from typing import Any, Dict, Optional


class RedAIException(Exception):
    """Базовое исключение для Red.AI"""
    
    def __init__(
        self,
        message: str,
        status_code: int = 500,
        detail: Optional[str] = None,
        headers: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.status_code = status_code
        self.detail = detail or message
        self.headers = headers
        super().__init__(self.message)


class ValidationError(RedAIException):
    """Ошибка валидации данных"""
    
    def __init__(self, message: str, field: Optional[str] = None):
        self.field = field
        super().__init__(
            message=message,
            status_code=422,
            detail=f"Validation error: {message}"
        )


class AuthenticationError(RedAIException):
    """Ошибка аутентификации"""
    
    def __init__(self, message: str = "Authentication required"):
        super().__init__(
            message=message,
            status_code=401,
            detail="Authentication credentials were not provided or are invalid"
        )


class AuthorizationError(RedAIException):
    """Ошибка авторизации"""
    
    def __init__(self, message: str = "Access denied"):
        super().__init__(
            message=message,
            status_code=403,
            detail="You don't have permission to perform this action"
        )


class NotFoundError(RedAIException):
    """Ошибка "не найдено" """
    
    def __init__(self, resource: str, identifier: Optional[str] = None):
        message = f"{resource} not found"
        if identifier:
            message += f" with identifier: {identifier}"
        
        super().__init__(
            message=message,
            status_code=404,
            detail=message
        )


class ConflictError(RedAIException):
    """Ошибка конфликта ресурсов"""
    
    def __init__(self, message: str):
        super().__init__(
            message=message,
            status_code=409,
            detail=f"Conflict: {message}"
        )


class RateLimitError(RedAIException):
    """Ошибка превышения лимита запросов"""
    
    def __init__(self, message: str = "Rate limit exceeded"):
        super().__init__(
            message=message,
            status_code=429,
            detail="Too many requests. Please try again later."
        )


class ServiceUnavailableError(RedAIException):
    """Ошибка недоступности сервиса"""
    
    def __init__(self, service: str, message: Optional[str] = None):
        msg = message or f"{service} service is temporarily unavailable"
        super().__init__(
            message=msg,
            status_code=503,
            detail=f"Service unavailable: {msg}"
        )


class AIServiceError(RedAIException):
    """Ошибка AI сервиса"""
    
    def __init__(self, service: str, message: str):
        super().__init__(
            message=f"AI service error ({service}): {message}",
            status_code=502,
            detail=f"External AI service error: {message}"
        )


class DatabaseError(RedAIException):
    """Ошибка базы данных"""
    
    def __init__(self, message: str):
        super().__init__(
            message=f"Database error: {message}",
            status_code=500,
            detail="Internal database error occurred"
        )


class FileUploadError(RedAIException):
    """Ошибка загрузки файла"""
    
    def __init__(self, message: str):
        super().__init__(
            message=f"File upload error: {message}",
            status_code=400,
            detail=f"File upload failed: {message}"
        )


class InvalidFileTypeError(RedAIException):
    """Ошибка неподдерживаемого типа файла"""
    
    def __init__(self, file_type: str, allowed_types: list):
        message = f"Invalid file type: {file_type}. Allowed types: {', '.join(allowed_types)}"
        super().__init__(
            message=message,
            status_code=400,
            detail=message
        )


class QuotaExceededError(RedAIException):
    """Ошибка превышения квоты"""
    
    def __init__(self, quota_type: str, current: int, limit: int):
        message = f"{quota_type} quota exceeded: {current}/{limit}"
        super().__init__(
            message=message,
            status_code=402,
            detail=f"Quota exceeded: {message}"
        )


class ExternalServiceError(RedAIException):
    """Ошибка внешнего сервиса"""
    
    def __init__(self, service: str, error: str):
        message = f"External service error ({service}): {error}"
        super().__init__(
            message=message,
            status_code=502,
            detail=f"External service unavailable: {error}"
        )


# Утилиты для обработки ошибок
def handle_database_error(error: Exception) -> RedAIException:
    """Обработка ошибок базы данных"""
    error_msg = str(error)
    
    if "unique constraint" in error_msg.lower():
        return ConflictError("Resource already exists")
    elif "foreign key" in error_msg.lower():
        return ValidationError("Referenced resource does not exist")
    elif "not null" in error_msg.lower():
        return ValidationError("Required field is missing")
    else:
        return DatabaseError(error_msg)


def handle_ai_service_error(service: str, error: Exception) -> RedAIException:
    """Обработка ошибок AI сервисов"""
    error_msg = str(error)
    
    if "rate limit" in error_msg.lower():
        return RateLimitError(f"Rate limit exceeded for {service}")
    elif "quota" in error_msg.lower():
        return QuotaExceededError(service, 0, 0)
    elif "authentication" in error_msg.lower():
        return AuthenticationError(f"Invalid {service} API key")
    else:
        return AIServiceError(service, error_msg)


def create_http_exception(exc: RedAIException) -> HTTPException:
    """Создание HTTP исключения из кастомного исключения"""
    return HTTPException(
        status_code=exc.status_code,
        detail=exc.detail,
        headers=exc.headers
    ) 