"""
RED AI - FastAPI Backend
Interactive dashboard for AI-powered interior design assistant
"""

import os
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
import base64
import json
import uvicorn
from pathlib import Path

# Import our services
from ai_service import AIService
from azure_openai_service import create_azure_openai_service, generate_image_with_azure_dalle  # Import the new service and missing function
from azure_dalle_service import create_azure_dalle_service
from dotenv import load_dotenv
import sys
import os

# Load environment variables from multiple locations
load_dotenv()  # Load from current directory
load_dotenv("backend/dotenv/.env")  # Load from backend dotenv directory  
load_dotenv(".env.local")  # Load from local override file

# Add the backend directory to sys.path for local imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import settings from the custom config module
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'dotenv'))
from config import settings

# ==================== MODELS ====================

class DailyTask(BaseModel):
    """Daily task model for the dashboard"""
    id: str
    title: str
    description: str
    completed: bool = False
    priority: str = "medium"  # low, medium, high, urgent
    created_at: datetime = Field(default_factory=datetime.now)
    due_date: Optional[datetime] = None
    category: str = "general"  # general, design, client, analysis

class FavoriteClient(BaseModel):
    """Favorite client model"""
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None
    projects_count: int = 0
    last_contact: Optional[datetime] = None
    avatar_url: Optional[str] = None
    tags: List[str] = []

class DesignPreview(BaseModel):
    """Design preview model for gallery"""
    id: str
    title: str
    description: str
    image_url: str
    style: str
    room_type: str
    created_at: datetime = Field(default_factory=datetime.now)
    is_favorite: bool = False
    client_id: Optional[str] = None
    tags: List[str] = []

class InteractionHistory(BaseModel):
    """Client interaction history"""
    id: str
    client_id: str
    interaction_type: str  # call, email, meeting, design_review
    title: str
    description: str
    created_at: datetime = Field(default_factory=datetime.now)
    outcome: Optional[str] = None
    next_action: Optional[str] = None

class DashboardStats(BaseModel):
    """Dashboard statistics model"""
    total_projects: int
    active_projects: int
    completed_projects: int
    total_clients: int
    favorite_clients: int
    designs_generated: int
    tasks_completed: int
    monthly_revenue: float
    weekly_growth: float

# Request models
class FloorPlanAnalysisRequest(BaseModel):
    """Floor plan analysis request"""
    image_data: str  # base64 encoded image
    filename: str
    room_type: Optional[str] = None
    additional_info: Optional[str] = None

class DesignGenerationRequest(BaseModel):
    """Design generation request"""
    prompt: str
    style: str = "modern"
    room_type: str = "living"
    color_scheme: Optional[str] = None
    budget_range: Optional[str] = None

class ChatRequest(BaseModel):
    """AI chat request"""
    message: str
    context: Optional[Dict] = None
    conversation_id: Optional[str] = None

class AzureImageGenerationRequest(BaseModel):
    """Azure DALL-E image generation request"""
    prompt: str

class DalleRequest(BaseModel):
    """DALL-E 3 image generation request"""
    prompt: str
    style: str = "vivid"
    quality: str = "standard"
    size: str = "1024x1024"
    n: int = 1

# ==================== MOCK DATA ====================

# Mock data for demonstration
mock_tasks = [
    DailyTask(
        id="1",
        title="Analyze floor plan for apartment on 5th Ave",
        description="Client wants modern renovation of 3-bedroom apartment",
        priority="high",
        category="analysis",
        due_date=datetime.now() + timedelta(days=2)
    ),
    DailyTask(
        id="2", 
        title="Generate kitchen design concepts",
        description="Modern minimalist kitchen for the Johnson family",
        priority="medium",
        category="design",
        completed=True
    ),
    DailyTask(
        id="3",
        title="Client meeting with Sarah Wilson",
        description="Discuss bathroom renovation budget and timeline",
        priority="high",
        category="client",
        due_date=datetime.now() + timedelta(days=1)
    )
]

mock_clients = [
    FavoriteClient(
        id="1",
        name="Sarah Wilson",
        email="sarah@example.com",
        phone="+1-555-0123",
        company="Wilson Properties",
        projects_count=3,
        last_contact=datetime.now() - timedelta(days=2),
        tags=["VIP", "Referral Source"]
    ),
    FavoriteClient(
        id="2",
        name="Johnson Family",
        email="johnsons@example.com",
        phone="+1-555-0456",
        projects_count=1,
        last_contact=datetime.now() - timedelta(days=5),
        tags=["First-time Client"]
    )
]

mock_designs = [
    DesignPreview(
        id="1",
        title="Modern Living Room",
        description="Minimalist design with natural light",
        image_url="/api/placeholder/400/300",
        style="modern",
        room_type="living",
        is_favorite=True,
        client_id="1",
        tags=["minimalist", "natural light"]
    ),
    DesignPreview(
        id="2",
        title="Scandinavian Kitchen",
        description="Clean lines and functional design",
        image_url="/api/placeholder/400/300",
        style="scandinavian",
        room_type="kitchen",
        client_id="2",
        tags=["functional", "clean"]
    )
]

mock_interactions = [
    InteractionHistory(
        id="1",
        client_id="1",
        interaction_type="meeting",
        title="Initial consultation",
        description="Discussed project requirements and budget",
        created_at=datetime.now() - timedelta(days=3),
        outcome="Approved initial design concepts",
        next_action="Schedule design presentation"
    ),
    InteractionHistory(
        id="2",
        client_id="1",
        interaction_type="email",
        title="Design revisions",
        description="Client requested changes to kitchen layout",
        created_at=datetime.now() - timedelta(days=1),
        outcome="Revisions documented",
        next_action="Update 3D renderings"
    )
]

# ==================== FASTAPI APP ====================

app = FastAPI(
    title="RED AI - Interior Design Assistant API",
    description="Backend API for AI-powered interior design dashboard",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://74.234.32.197",
    ],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

# Initialize AI service
ai_service = AIService()

# Initialize Azure OpenAI service for additional functionality
azure_service = create_azure_openai_service()

# Initialize Azure DALL-E 3 service
dalle_service = create_azure_dalle_service()

# ==================== UTILITY FUNCTIONS ====================

def get_dashboard_stats() -> DashboardStats:
    """Generate dashboard statistics"""
    return DashboardStats(
        total_projects=len(mock_designs) + 15,
        active_projects=8,
        completed_projects=12,
        total_clients=len(mock_clients) + 25,
        favorite_clients=len(mock_clients),
        designs_generated=len(mock_designs) + 45,
        tasks_completed=sum(1 for task in mock_tasks if task.completed),
        monthly_revenue=45750.00,
        weekly_growth=12.5
    )

# ==================== HEALTH CHECK ====================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    azure_info = azure_service.get_service_info()
    dalle_info = dalle_service.get_service_info()
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "ai_configured": settings.is_ai_configured(),
        "services": {
            "azure_openai": {
                "configured": azure_info.get("configured", False),
                "has_api_key": azure_info.get("has_api_key", False),
                "has_endpoint": azure_info.get("has_endpoint", False),
                "endpoint": azure_info.get("endpoint", ""),
                "deployment": azure_info.get("deployment_name", ""),
                "api_version": azure_info.get("api_version", "")
            },
            "dalle_3": {
                "configured": dalle_service.is_configured(),
                "service": "Azure DALL-E 3",
                "endpoint": dalle_service.endpoint if dalle_service.is_configured() else "",
                "deployment": dalle_service.deployment_name if dalle_service.is_configured() else ""
            }
        }
    }

# ==================== DASHBOARD ENDPOINTS ====================

@app.get("/api/dashboard/stats", response_model=DashboardStats)
async def get_stats():
    """Get dashboard statistics"""
    return get_dashboard_stats()

@app.get("/api/dashboard/tasks", response_model=List[DailyTask])
async def get_tasks():
    """Get daily tasks"""
    return mock_tasks

@app.post("/api/dashboard/tasks", response_model=DailyTask)
async def create_task(task: DailyTask):
    """Create a new daily task"""
    task.id = str(len(mock_tasks) + 1)
    task.created_at = datetime.now()
    mock_tasks.append(task)
    return task

@app.put("/api/dashboard/tasks/{task_id}", response_model=DailyTask)
async def update_task(task_id: str, task_update: DailyTask):
    """Update a daily task"""
    for i, task in enumerate(mock_tasks):
        if task.id == task_id:
            task_update.id = task_id
            mock_tasks[i] = task_update
            return task_update
    raise HTTPException(status_code=404, detail="Task not found")

@app.delete("/api/dashboard/tasks/{task_id}")
async def delete_task(task_id: str):
    """Delete a daily task"""
    for i, task in enumerate(mock_tasks):
        if task.id == task_id:
            deleted_task = mock_tasks.pop(i)
            return {"message": "Task deleted successfully", "task": deleted_task}
    raise HTTPException(status_code=404, detail="Task not found")

# ==================== CLIENT MANAGEMENT ====================

@app.get("/api/dashboard/clients", response_model=List[FavoriteClient])
async def get_favorite_clients():
    """Get favorite clients"""
    return mock_clients

@app.post("/api/dashboard/clients", response_model=FavoriteClient)
async def add_favorite_client(client: FavoriteClient):
    """Add a favorite client"""
    client.id = str(len(mock_clients) + 1)
    mock_clients.append(client)
    return client

@app.delete("/api/dashboard/clients/{client_id}")
async def remove_favorite_client(client_id: str):
    """Remove a favorite client"""
    for i, client in enumerate(mock_clients):
        if client.id == client_id:
            deleted_client = mock_clients.pop(i)
            return {"message": "Client removed successfully", "client": deleted_client}
    raise HTTPException(status_code=404, detail="Client not found")

# ==================== DESIGN GALLERY ====================

@app.get("/api/dashboard/designs", response_model=List[DesignPreview])
async def get_design_previews():
    """Get design preview gallery"""
    return mock_designs

@app.post("/api/dashboard/designs/{design_id}/favorite")
async def toggle_design_favorite(design_id: str):
    """Toggle favorite status of a design"""
    for design in mock_designs:
        if design.id == design_id:
            design.is_favorite = not design.is_favorite
            return {"message": "Favorite status updated", "is_favorite": design.is_favorite}
    raise HTTPException(status_code=404, detail="Design not found")

@app.get("/api/dashboard/interactions", response_model=List[InteractionHistory])
async def get_interaction_history():
    """Get client interaction history"""
    return mock_interactions

# ==================== AI SERVICES ====================

@app.post("/api/ai/analyze-floor-plan")
async def analyze_floor_plan(request: FloorPlanAnalysisRequest):
    """Analyze floor plan with AI"""
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image_data)
        
        # Use AI service for analysis
        result = await ai_service.analyze_floor_plan(image_data, request.filename)
        
        return {
            "success": True,
            "analysis": result,
            "filename": request.filename,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@app.post("/api/ai/generate-design")
async def generate_design(request: DesignGenerationRequest):
    """Generate interior design with AI"""
    try:
        # Generate design suggestions
        suggestions = await ai_service.generate_design_suggestions(
            request.room_type, 
            request.style, 
            50000  # default budget
        )
        
        return {
            "success": True,
            "design_suggestions": suggestions,
            "prompt": request.prompt,
            "style": request.style,
            "room_type": request.room_type,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@app.post("/api/ai/chat")
async def chat_with_ai(request: ChatRequest):
    """Handle chat requests with the AI assistant"""
    try:
        response = ai_service.chat_completion(
            message=request.message,
            context=request.context,
            conversation_id=request.conversation_id
        )
        return JSONResponse(content={"reply": response})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/generate-image-azure")
async def generate_image_azure(request: AzureImageGenerationRequest):
    """Generate an image using Azure DALL-E service"""
    if not request.prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    # Check if Azure OpenAI is configured
    if not azure_service.is_configured():
        azure_info = azure_service.get_service_info()
        config_status = {
            "hasApiKey": azure_info.get("has_api_key", False),
            "hasEndpoint": azure_info.get("has_endpoint", False),
            "hasApiVersion": bool(azure_info.get("api_version")),
            "hasDeployment": bool(azure_info.get("deployment_name"))
        }
        
        print(f"Missing Azure OpenAI configuration: {json.dumps(config_status, indent=2)}")
        
        raise HTTPException(
            status_code=500, 
            detail=f"Azure OpenAI service not configured. Missing configuration: {config_status}"
        )

    try:
        result = await azure_service.generate_image(request.prompt)
        
        if result.get("success"):
            return JSONResponse(content={
                "success": True,
                "image_url": result.get("image_url"),
                "model": result.get("model"),
                "style": result.get("style"),
                "quality": result.get("quality")
            })
        else:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to generate image: {result.get('error', 'Unknown error')}"
            )
    except Exception as e:
        print(f"Azure image generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/generate-image-dalle")
async def generate_image_dalle(request: DalleRequest):
    """Generate an image using Azure DALL-E 3 service"""
    if not request.prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    # Check if Azure DALL-E 3 is configured
    if not dalle_service.is_configured():
        dalle_info = dalle_service.get_service_info()
        
        raise HTTPException(
            status_code=500, 
            detail=f"Azure DALL-E 3 service not configured. Service info: {dalle_info}"
        )

    try:
        result = await dalle_service.generate_image(
            prompt=request.prompt,
            style=request.style,
            quality=request.quality,
            size=request.size,
            n=request.n
        )
        
        if result.get("success"):
            return JSONResponse(content={
                "success": True,
                "image_url": result.get("image_url"),
                "revised_prompt": result.get("revised_prompt"),
                "model": result.get("model"),
                "service": result.get("service"),
                "prompt": result.get("prompt"),
                "parameters": result.get("parameters")
            })
        else:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to generate image: {result.get('error', 'Unknown error')}"
            )
    except Exception as e:
        print(f"Azure DALL-E 3 generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ai/suggestions")
async def get_design_suggestions():
    """Get AI-powered design suggestions"""
    suggestions = [
        {
            "category": "furniture",
            "items": [
                {"name": "Scandinavian Sofa", "price": 85000, "description": "Clean lines, neutral colors"},
                {"name": "Industrial Coffee Table", "price": 35000, "description": "Metal and wood combination"},
                {"name": "Minimalist Bookshelf", "price": 25000, "description": "Floating shelves design"}
            ]
        },
        {
            "category": "colors",
            "items": [
                {"name": "Sage Green", "hex": "#9CAF88", "description": "Calming nature-inspired"},
                {"name": "Warm Gray", "hex": "#8B8680", "description": "Sophisticated neutral"},
                {"name": "Cream White", "hex": "#F7F3E9", "description": "Soft and elegant"}
            ]
        },
        {
            "category": "materials",
            "items": [
                {"name": "Natural Oak", "price": 3500, "description": "Durable hardwood flooring"},
                {"name": "Marble Countertop", "price": 8500, "description": "Luxury kitchen surface"},
                {"name": "Linen Textiles", "price": 2200, "description": "Sustainable fabric choice"}
            ]
        }
    ]
    
    return {
        "success": True,
        "suggestions": suggestions,
        "timestamp": datetime.now().isoformat()
    }

# ==================== FEATURES ENDPOINT ====================

@app.get("/api/features")
async def get_features():
    """Get available features"""
    return {
        "dashboard": {
            "tasks": "Daily task management with CRUD operations",
            "clients": "Favorite client management",
            "designs": "Design preview gallery",
            "interactions": "Client interaction history",
            "analytics": "Real-time dashboard statistics"
        },
        "ai_services": {
            "floor_plan_analysis": "AI-powered floor plan analysis",
            "design_generation": "Interior design generation with Azure DALL-E 3",
            "chat_assistant": "Intelligent design consultation",
            "suggestions": "Personalized design recommendations",
            "dalle_3": "High-quality image generation with Azure DALL-E 3"
        },
        "integrations": {
            "azure_openai": "Azure OpenAI service integration",
            "dalle_3": "Azure DALL-E 3 image generation",
            "gpt4": "GPT-4 for analysis and chat"
        },
        "version": "2.0.0",
        "ai_configured": settings.is_ai_configured()
    }

# ==================== MAIN ====================

if __name__ == "__main__":
    print("🚀 Starting RED AI Backend Server...")
    print(f"📊 Dashboard features: Tasks, Clients, Designs, Analytics")
    print(f"🤖 AI services: Floor plan analysis, Design generation, Chat assistant")
    print(f"🔧 API Documentation: http://localhost:{settings.API_PORT}/docs")
    print(f"🎨 Features: http://localhost:{settings.API_PORT}/api/features")
    
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG,
        log_level="info"
    ) 