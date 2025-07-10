#!/usr/bin/env python3
"""
Test script for DALL·E service
"""

import requests
import json
import sys

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get('http://localhost:5000/health')
        print(f"Health check: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_generate():
    """Test image generation"""
    try:
        data = {
            "prompt": "A modern living room with minimalist furniture",
            "imageCount": 1,
            "quality": "standard",
            "style": "vivid"
        }
        
        response = requests.post(
            'http://localhost:5000/generate',
            json=data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Generate test: {response.status_code}")
        result = response.json()
        
        if response.status_code == 200:
            print(f"Success! Generated {len(result.get('images', []))} images")
            print(f"Generation ID: {result.get('generation_id')}")
        else:
            print(f"Error: {result.get('error')}")
            
        return response.status_code == 200
        
    except Exception as e:
        print(f"Generate test failed: {e}")
        return False

def test_history():
    """Test history endpoint"""
    try:
        response = requests.get('http://localhost:5000/history')
        print(f"History test: {response.status_code}")
        result = response.json()
        
        if response.status_code == 200:
            print(f"History contains {result.get('total', 0)} generations")
        else:
            print(f"Error: {result.get('error')}")
            
        return response.status_code == 200
        
    except Exception as e:
        print(f"History test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("Testing DALL·E Service...")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health),
        ("History", test_history),
        ("Image Generation", test_generate),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        result = test_func()
        results.append(result)
        print(f"Result: {'✅ PASS' if result else '❌ FAIL'}")
    
    print("\n" + "=" * 50)
    print(f"Tests passed: {sum(results)}/{len(results)}")
    
    if all(results):
        print("🎉 All tests passed!")
        sys.exit(0)
    else:
        print("❌ Some tests failed!")
        sys.exit(1)

if __name__ == '__main__':
    main() 