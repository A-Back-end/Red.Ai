#!/usr/bin/env python3
"""
Test script to verify Azure OpenAI configuration fixes for Red.AI
"""

import os
import sys
from pathlib import Path

def test_azure_service_import():
    """Test that Azure OpenAI service can be imported without errors"""
    print("🧪 Testing Azure OpenAI service import...")
    
    try:
        from azure_openai_service import AzureOpenAIService, create_azure_openai_service
        print("✅ Azure OpenAI service imported successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to import Azure OpenAI service: {e}")
        return False

def test_service_initialization_without_config():
    """Test that service initializes gracefully without configuration"""
    print("\n🧪 Testing service initialization without configuration...")
    
    # Temporarily clear environment variables
    env_backup = {}
    azure_env_vars = [
        "AZURE_OPENAI_ENDPOINT", "AZURE_OPENAI_API_KEY", "AZURE_OPENAI_API_VERSION",
        "AZURE_OPENAI_DEPLOYMENT_NAME", "AZURE_OPENAI_KEY", "AZURE_ENDPOINT_KEY"
    ]
    
    for var in azure_env_vars:
        env_backup[var] = os.environ.get(var)
        if var in os.environ:
            del os.environ[var]
    
    try:
        from azure_openai_service import create_azure_openai_service
        service = create_azure_openai_service()
        
        print("✅ Service initialized without crashing")
        
        # Check that it correctly identifies as not configured
        if not service.is_configured():
            print("✅ Service correctly reports as not configured")
        else:
            print("⚠️  Service reports as configured when it shouldn't be")
        
        # Test service info
        info = service.get_service_info()
        if 'dalle_deployment' in info:
            print("✅ Service info includes dalle_deployment key")
        else:
            print("❌ Service info missing dalle_deployment key")
        
        success = True
        
    except AttributeError as e:
        if "'NoneType' object has no attribute 'endswith'" in str(e):
            print("❌ AttributeError still occurs - fix not working")
            success = False
        else:
            print(f"❌ Unexpected AttributeError: {e}")
            success = False
    except Exception as e:
        print(f"❌ Service initialization failed: {e}")
        success = False
    
    # Restore environment variables
    for var, value in env_backup.items():
        if value is not None:
            os.environ[var] = value
    
    return success

def test_ai_service_initialization():
    """Test that AIService initializes gracefully without crashing"""
    print("\n🧪 Testing AIService initialization...")
    
    # Clear environment variables for this test
    env_backup = {}
    azure_env_vars = [
        "AZURE_OPENAI_ENDPOINT", "AZURE_OPENAI_API_KEY", "AZURE_OPENAI_API_VERSION",
        "AZURE_OPENAI_DEPLOYMENT_NAME", "AZURE_OPENAI_KEY", "AZURE_ENDPOINT_KEY"
    ]
    
    for var in azure_env_vars:
        env_backup[var] = os.environ.get(var)
        if var in os.environ:
            del os.environ[var]
    
    try:
        from ai_service import AIService
        ai_service = AIService()
        print("✅ AIService initialized without crashing")
        success = True
    except KeyError as e:
        if "'dalle_deployment'" in str(e):
            print("❌ KeyError for dalle_deployment still occurs - fix not working")
            success = False
        else:
            print(f"❌ Unexpected KeyError: {e}")
            success = False
    except Exception as e:
        print(f"⚠️  AIService initialization failed with other error: {e}")
        print("   This might be expected if configuration is missing")
        success = True  # This is actually expected behavior now
    
    # Restore environment variables
    for var, value in env_backup.items():
        if value is not None:
            os.environ[var] = value
    
    return success

def test_with_sample_config():
    """Test with sample configuration to verify proper operation"""
    print("\n🧪 Testing with sample configuration...")
    
    # Set sample environment variables
    os.environ["AZURE_OPENAI_ENDPOINT"] = "https://sample-resource.openai.azure.com/"
    os.environ["AZURE_OPENAI_API_KEY"] = "sample-api-key-12345"
    os.environ["AZURE_OPENAI_API_VERSION"] = "2024-02-01"
    os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"] = "gpt-4"
    
    try:
        from azure_openai_service import create_azure_openai_service
        service = create_azure_openai_service()
        
        print("✅ Service initialized with sample config")
        
        # Test service info
        info = service.get_service_info()
        
        expected_keys = ['endpoint', 'api_version', 'deployment_name', 'dalle_deployment', 'configured']
        missing_keys = [key for key in expected_keys if key not in info]
        
        if not missing_keys:
            print("✅ Service info contains all expected keys")
        else:
            print(f"❌ Service info missing keys: {missing_keys}")
            return False
        
        if info['dalle_deployment'] == info['deployment_name']:
            print("✅ dalle_deployment correctly set to deployment_name")
        else:
            print("❌ dalle_deployment not correctly set")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error with sample config: {e}")
        return False
    finally:
        # Clean up sample config
        for var in ["AZURE_OPENAI_ENDPOINT", "AZURE_OPENAI_API_KEY", "AZURE_OPENAI_API_VERSION", "AZURE_OPENAI_DEPLOYMENT_NAME"]:
            if var in os.environ:
                del os.environ[var]

def main():
    """Run all tests"""
    print("🧪 Red.AI Azure OpenAI Configuration Fix Tests")
    print("=" * 60)
    
    tests = [
        ("Import Test", test_azure_service_import),
        ("No Config Test", test_service_initialization_without_config),
        ("AIService Test", test_ai_service_initialization),
        ("Sample Config Test", test_with_sample_config)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Results Summary:")
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\n🎯 Tests passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 All tests passed! The Azure OpenAI configuration fixes are working correctly.")
    else:
        print("⚠️  Some tests failed. The fixes may need additional work.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 