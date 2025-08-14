const https = require('https');
const http = require('http');

// Test configuration for local development
const BASE_URL = 'http://localhost:3000'; // Using port 3000 as shown in the logs
const API_ENDPOINT = '/api/projects';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'RedAI-Test-Client/1.0',
        ...options.headers
      }
    };

    console.log('Making request:', {
      method: requestOptions.method,
      url: `${urlObj.protocol}//${urlObj.hostname}:${urlObj.port}${urlObj.pathname}${urlObj.search}`,
      body: options.body ? 'Present' : 'None'
    });

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error.message);
      reject(error);
    });

    if (options.body) {
      const bodyString = JSON.stringify(options.body);
      console.log('Request body:', bodyString);
      req.write(bodyString);
    }
    
    req.end();
  });
}

// Test functions
async function testGetProjects() {
  console.log('\n🔍 Testing GET /api/projects...');
  try {
    const response = await makeRequest(`${BASE_URL}${API_ENDPOINT}?userId=test-user`);
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.status === 200;
  } catch (error) {
    console.error('❌ GET request failed:', error.message);
    return false;
  }
}

async function testCreateProject() {
  console.log('\n📝 Testing POST /api/projects...');
  try {
    const testProject = {
      name: 'Test Project',
      description: 'This is a test project',
      userId: 'test-user-123',
      budget: {
        min: 50000,
        max: 150000,
        currency: 'RUB'
      },
      preferredStyles: ['modern', 'minimalist'],
      status: 'draft'
    };

    const response = await makeRequest(`${BASE_URL}${API_ENDPOINT}`, {
      method: 'POST',
      body: testProject
    });

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Project created successfully!');
      return response.data.project.id;
    } else {
      console.log('❌ Failed to create project');
      return null;
    }
  } catch (error) {
    console.error('❌ POST request failed:', error.message);
    return null;
  }
}

async function testUpdateProject(projectId) {
  if (!projectId) {
    console.log('\n⚠️  Skipping UPDATE test - no project ID');
    return false;
  }

  console.log('\n🔄 Testing PUT /api/projects...');
  try {
    const updateData = {
      projectId: projectId,
      name: 'Updated Test Project',
      description: 'This project has been updated',
      status: 'in_progress'
    };

    const response = await makeRequest(`${BASE_URL}${API_ENDPOINT}`, {
      method: 'PUT',
      body: updateData
    });

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Project updated successfully!');
      return true;
    } else {
      console.log('❌ Failed to update project');
      return false;
    }
  } catch (error) {
    console.error('❌ PUT request failed:', error.message);
    return false;
  }
}

async function testDeleteProject(projectId) {
  if (!projectId) {
    console.log('\n⚠️  Skipping DELETE test - no project ID');
    return false;
  }

  console.log('\n🗑️  Testing DELETE /api/projects...');
  try {
    const response = await makeRequest(`${BASE_URL}${API_ENDPOINT}?projectId=${projectId}`, {
      method: 'DELETE'
    });

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Project deleted successfully!');
      return true;
    } else {
      console.log('❌ Failed to delete project');
      return false;
    }
  } catch (error) {
    console.error('❌ DELETE request failed:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting RedAI Projects API Tests (Local)');
  console.log('📍 Testing against:', BASE_URL);
  
  const results = {
    get: await testGetProjects(),
    create: await testCreateProject(),
    update: false,
    delete: false
  };

  if (results.create) {
    // Get the project ID from the create response
    const createResponse = await makeRequest(`${BASE_URL}${API_ENDPOINT}?userId=test-user-123`);
    if (createResponse.status === 200 && createResponse.data.projects && createResponse.data.projects.length > 0) {
      const projectId = createResponse.data.projects[0].id;
      results.update = await testUpdateProject(projectId);
      results.delete = await testDeleteProject(projectId);
    }
  }

  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('GET    /api/projects:', results.get ? '✅ PASS' : '❌ FAIL');
  console.log('POST   /api/projects:', results.create ? '✅ PASS' : '❌ FAIL');
  console.log('PUT    /api/projects:', results.update ? '✅ PASS' : '❌ FAIL');
  console.log('DELETE /api/projects:', results.delete ? '✅ PASS' : '❌ FAIL');

  const allPassed = Object.values(results).every(result => result);
  console.log('\n🎯 Overall Result:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  return allPassed;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, makeRequest }; 