"""
AI Processor FastAPI Server
Provides REST API endpoints for AI services
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import asyncio
from typing import Optional, Dict, Any
import json

from ai_service import AIService

# Initialize FastAPI app
app = FastAPI(
    title="Red.AI AI Processor",
    description="AI service for interior design assistance",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI service
ai_service = AIService()

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Red.AI AI Processor Service",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ai-processor",
        "timestamp": "2025-07-26T14:00:00Z"
    }

@app.post("/analyze-floor-plan")
async def analyze_floor_plan(file: UploadFile = File(...)):
    """Analyze floor plan image"""
    try:
        # Read image data
        image_data = await file.read()
        
        # Analyze with AI service
        result = await ai_service.analyze_floor_plan(image_data, file.filename)
        
        return JSONResponse(content=result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/generate-design")
async def generate_design(
    room_type: str = Form(...),
    style: str = Form(...),
    budget: int = Form(100000)
):
    """Generate interior design suggestions"""
    try:
        result = await ai_service.generate_design_suggestions(room_type, style, budget)
        return JSONResponse(content=result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Design generation failed: {str(e)}")

@app.post("/chat")
async def chat_with_ai(
    message: str = Form(...),
    context: Optional[str] = Form(None)
):
    """Chat with AI assistant"""
    try:
        # Parse context if provided
        parsed_context = None
        if context:
            try:
                parsed_context = json.loads(context)
            except:
                parsed_context = {"context": context}
        
        result = await ai_service.chat_with_ai(message, parsed_context)
        return {"response": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@app.get("/mock-analysis")
async def get_mock_analysis():
    """Get mock floor plan analysis for testing"""
    return ai_service._mock_analysis()

@app.get("/mock-design")
async def get_mock_design():
    """Get mock design suggestions for testing"""
    return ai_service._mock_design_suggestions()

if __name__ == "__main__":
    print("🤖 Starting Red.AI AI Processor Server...")
    print("=" * 50)
    
    # Run the server
    uvicorn.run(
        "ai_server:app",
        host="0.0.0.0",
        port=8001,
        reload=False,
        log_level="info"
    ) 