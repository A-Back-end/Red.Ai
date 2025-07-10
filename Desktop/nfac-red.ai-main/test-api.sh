#!/bin/bash

echo "🎨 Interior Design Studio - API Test Script"
echo "=============================================="

BASE_URL="http://localhost:3000"

echo ""
echo "1. Testing Upload API endpoint..."
curl -X GET "${BASE_URL}/api/upload-image" \
  -H "Accept: application/json" \
  --max-time 10 \
  -s | head -20
echo ""

echo ""
echo "2. Testing Generation API endpoint..."
curl -X GET "${BASE_URL}/api/generate-design" \
  -H "Accept: application/json" \
  --max-time 10 \
  -s | head -20
echo ""

echo ""
echo "3. Testing with a sample image upload..."
echo "Creating a test image file..."

# Create a minimal test image (1x1 pixel PNG)
echo -n "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHGmSMrYgAAAABJRU5ErkJggg==" | base64 -d > test-image.png

echo "Uploading test image..."
curl -X POST "${BASE_URL}/api/upload-image" \
  -F "image=@test-image.png" \
  --max-time 30 \
  -s

echo ""
echo ""
echo "4. Cleanup..."
rm -f test-image.png

echo ""
echo "✅ API test completed!"
echo ""
echo "To test the full system:"
echo "1. Go to ${BASE_URL}/interior-design"
echo "2. Upload a real apartment image"
echo "3. Configure settings and generate" 