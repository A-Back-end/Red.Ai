#!/usr/bin/env python3
"""
DALL·E Image Generation Service
Flask backend for generating images using OpenAI DALL·E 3 API
"""

import os
import sys
import json
import base64
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
from openai import OpenAI
import requests
from PIL import Image
from io import BytesIO
import uuid

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- CORS Configuration ---
# Read allowed origins from environment variable, split by comma
allowed_origins_str = os.getenv("DALLE_ALLOWED_ORIGINS", "http://localhost:3000,https://redai.site")
ALLOWED_ORIGINS = [origin.strip() for origin in allowed_origins_str.split(',')]
logger.info(f"CORS allowed origins: {ALLOWED_ORIGINS}")

# Flask app setup
app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# OpenAI client setup
client = None
try:
    api_key = os.getenv('AZURE_OPENAI_KEY') or os.getenv('AZURE_OPENAI_API_KEY')
    if api_key:
        client = OpenAI(api_key=api_key)
        logger.info("OpenAI client initialized successfully")
    else:
        logger.warning("AZURE_OPENAI_KEY или AZURE_OPENAI_API_KEY not found in environment variables")
except Exception as e:
    logger.error(f"Failed to initialize OpenAI client: {e}")

# Generation history storage (in production, use a proper database)
generation_history: List[Dict[str, Any]] = []

class DalleGenerator:
    """DALL·E 3 Image Generator"""
    
    def __init__(self, openai_client: OpenAI):
        self.client = openai_client
        
    def generate_images(
        self,
        prompt: str,
        image_count: int = 1,
        quality: str = "standard",
        style: str = "vivid",
        reference_image: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate images using DALL·E 3
        
        Args:
            prompt: Text description for image generation
            image_count: Number of images to generate (1-4)
            quality: Image quality ('standard' or 'hd')
            style: Image style ('vivid' or 'natural')
            reference_image: Base64 encoded reference image (optional)
            
        Returns:
            Dictionary with generated images and metadata
        """
        try:
            # Validate inputs
            if not prompt or len(prompt.strip()) == 0:
                raise ValueError("Prompt is required")
                
            if image_count < 1 or image_count > 4:
                raise ValueError("Image count must be between 1 and 4")
                
            if quality not in ["standard", "hd"]:
                raise ValueError("Quality must be 'standard' or 'hd'")
                
            if style not in ["vivid", "natural"]:
                raise ValueError("Style must be 'vivid' or 'natural'")
            
            # Enhance prompt
            enhanced_prompt = self._enhance_prompt(prompt, reference_image)
            
            # Generate images
            generated_images = []
            
            for i in range(image_count):
                try:
                    logger.info(f"Generating image {i + 1}/{image_count}")
                    
                    response = self.client.images.generate(
                        model="dall-e-3",
                        prompt=enhanced_prompt,
                        n=1,  # DALL·E 3 only supports n=1
                        size="1024x1024",
                        quality=quality,
                        style=style,
                        response_format="url"
                    )
                    
                    if response.data and response.data[0] and response.data[0].url:
                        image_url = response.data[0].url
                        generated_images.append({
                            "url": image_url,
                            "revised_prompt": getattr(response.data[0], 'revised_prompt', enhanced_prompt),
                            "index": i
                        })
                        logger.info(f"Successfully generated image {i + 1}")
                    else:
                        logger.error(f"Failed to generate image {i + 1}")
                        
                except Exception as img_error:
                    logger.error(f"Error generating image {i + 1}: {img_error}")
                    continue
            
            if not generated_images:
                raise Exception("Failed to generate any images")
            
            # Create generation record
            generation_id = str(uuid.uuid4())
            generation_record = {
                "id": generation_id,
                "timestamp": datetime.utcnow().isoformat(),
                "original_prompt": prompt,
                "enhanced_prompt": enhanced_prompt,
                "image_count": image_count,
                "generated_count": len(generated_images),
                "images": generated_images,
                "quality": quality,
                "style": style,
                "has_reference_image": bool(reference_image)
            }
            
            # Store in history
            generation_history.append(generation_record)
            
            # Keep only last 100 generations
            if len(generation_history) > 100:
                generation_history.pop(0)
            
            return {
                "success": True,
                "generation_id": generation_id,
                "images": [img["url"] for img in generated_images],
                "generation": generation_record,
                "metadata": {
                    "original_prompt": prompt,
                    "enhanced_prompt": enhanced_prompt,
                    "generated_count": len(generated_images),
                    "requested_count": image_count,
                    "quality": quality,
                    "style": style,
                    "timestamp": generation_record["timestamp"]
                }
            }
            
        except Exception as e:
            logger.error(f"Error in generate_images: {e}")
            return {
                "success": False,
                "error": str(e),
                "error_type": type(e).__name__
            }
    
    def _enhance_prompt(self, prompt: str, reference_image: Optional[str] = None) -> str:
        """Enhance the user prompt for better results"""
        enhanced = prompt.strip()
        
        if reference_image:
            enhanced = f"Based on the reference image provided, create: {enhanced}. Maintain the overall composition and lighting style of the reference while applying the requested changes."
        
        # Add quality descriptors
        enhanced += " High quality, professional photography, detailed and realistic, sharp focus, good lighting."
        
        return enhanced

# Global generator instance
generator = None
if client:
    generator = DalleGenerator(client)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "DALL·E Image Generator",
        "timestamp": datetime.utcnow().isoformat(),
        "openai_configured": bool(client)
    })

@app.route('/generate', methods=['POST'])
def generate_images_endpoint():
    """Generate images using DALL·E 3"""
    try:
        if not generator:
            return jsonify({
                "error": "OpenAI client not configured",
                "details": "OPENAI_API_KEY environment variable not set"
            }), 500
        
        # Parse request data
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        prompt = data.get('prompt', '').strip()
        image_count = data.get('imageCount', 1)
        quality = data.get('quality', 'standard')
        style = data.get('style', 'vivid')
        reference_image = data.get('referenceImage')
        
        # Validate required fields
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        logger.info(f"Generation request: {prompt[:50]}... (count: {image_count}, quality: {quality}, style: {style})")
        
        # Generate images
        result = generator.generate_images(
            prompt=prompt,
            image_count=image_count,
            quality=quality,
            style=style,
            reference_image=reference_image
        )
        
        if result["success"]:
            return jsonify(result)
        else:
            return jsonify({
                "error": result["error"],
                "error_type": result.get("error_type", "GenerationError")
            }), 500
            
    except Exception as e:
        logger.error(f"Error in generate endpoint: {e}")
        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500

@app.route('/history', methods=['GET'])
def get_generation_history():
    """Get generation history"""
    try:
        limit = request.args.get('limit', 10, type=int)
        limit = min(max(limit, 1), 50)  # Clamp between 1 and 50
        
        return jsonify({
            "success": True,
            "history": generation_history[-limit:],
            "total": len(generation_history)
        })
        
    except Exception as e:
        logger.error(f"Error in history endpoint: {e}")
        return jsonify({
            "error": "Failed to retrieve history",
            "details": str(e)
        }), 500

@app.route('/regenerate/<generation_id>', methods=['POST'])
def regenerate_from_history(generation_id: str):
    """Regenerate images from history"""
    try:
        if not generator:
            return jsonify({
                "error": "OpenAI client not configured"
            }), 500
        
        # Find generation record
        generation_record = None
        for record in generation_history:
            if record["id"] == generation_id:
                generation_record = record
                break
        
        if not generation_record:
            return jsonify({"error": "Generation record not found"}), 404
        
        # Regenerate with same parameters
        result = generator.generate_images(
            prompt=generation_record["original_prompt"],
            image_count=generation_record["image_count"],
            quality=generation_record["quality"],
            style=generation_record["style"],
            reference_image=None  # Don't carry over reference images
        )
        
        if result["success"]:
            return jsonify(result)
        else:
            return jsonify({
                "error": result["error"],
                "error_type": result.get("error_type", "RegenerationError")
            }), 500
            
    except Exception as e:
        logger.error(f"Error in regenerate endpoint: {e}")
        return jsonify({
            "error": "Failed to regenerate",
            "details": str(e)
        }), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get generation statistics"""
    try:
        total_generations = len(generation_history)
        total_images = sum(record["generated_count"] for record in generation_history)
        
        # Style distribution
        style_counts = {}
        quality_counts = {}
        
        for record in generation_history:
            style = record.get("style", "unknown")
            quality = record.get("quality", "unknown")
            
            style_counts[style] = style_counts.get(style, 0) + 1
            quality_counts[quality] = quality_counts.get(quality, 0) + 1
        
        return jsonify({
            "success": True,
            "stats": {
                "total_generations": total_generations,
                "total_images": total_images,
                "style_distribution": style_counts,
                "quality_distribution": quality_counts,
                "average_images_per_generation": total_images / max(total_generations, 1)
            }
        })
        
    except Exception as e:
        logger.error(f"Error in stats endpoint: {e}")
        return jsonify({
            "error": "Failed to get stats",
            "details": str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "error": "Endpoint not found",
        "available_endpoints": [
            "/health",
            "/generate",
            "/history",
            "/regenerate/<generation_id>",
            "/stats"
        ]
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "error": "Internal server error",
        "details": "An unexpected error occurred"
    }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting DALL·E Image Generation Service on port {port}")
    logger.info(f"Debug mode: {debug}")
    logger.info(f"OpenAI configured: {bool(client)}")
    
    app.run(host='0.0.0.0', port=port, debug=debug) 