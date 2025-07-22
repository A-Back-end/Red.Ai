import axios from 'axios';
import https from 'https';

// BFL API configuration
const BFL_API_CONFIG = {
  baseUrl: 'https://13.107.246.45',
  endpoints: {
    generate: '/v1/flux-kontext-pro',
    status: '/v1/get_result'
  },
  timeout: 15000
};

// Create a custom axios instance for BFL API
const bflApiClient = axios.create({
  baseURL: BFL_API_CONFIG.baseUrl,
  timeout: BFL_API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Host': 'api.bfl.ai' // Use the main domain as Host header
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false // Disable SSL verification for development
  })
});

// Helper to get BFL API key
export const getBflApiKey = (): string | null => {
  const envKey = process.env.BFL_API_KEY;
  
  if (!envKey || envKey === 'BFL_API_KEY' || envKey.trim() === '') {
    return null;
  }
  
  return envKey;
};

// Generate design using BFL API
export const generateDesign = async (payload: any) => {
  const apiKey = getBflApiKey();
  
  if (!apiKey) {
    throw new Error('BFL_API_KEY environment variable is missing or invalid');
  }

  const response = await bflApiClient.post(BFL_API_CONFIG.endpoints.generate, payload, {
    headers: {
      'x-key': apiKey
    }
  });

  return response.data;
};

// Check generation status
export const checkStatus = async (pollingUrl: string) => {
  const apiKey = getBflApiKey();
  
  if (!apiKey) {
    throw new Error('BFL_API_KEY environment variable is missing or invalid');
  }

  // Extract the ID from the polling URL
  const url = new URL(pollingUrl);
  const id = url.searchParams.get('id');
  
  if (!id) {
    throw new Error('Invalid polling URL: missing ID parameter');
  }

  // Use our custom client with the ID
  const response = await bflApiClient.get(`${BFL_API_CONFIG.endpoints.status}?id=${id}`, {
    headers: {
      'x-key': apiKey
    }
  });

  return response.data;
};

// Test BFL API connection
export const testConnection = async () => {
  const apiKey = getBflApiKey();
  
  if (!apiKey) {
    throw new Error('BFL_API_KEY environment variable is missing or invalid');
  }

  const testPayload = {
    prompt: "Simple test prompt for debugging"
  };

  const response = await bflApiClient.post(BFL_API_CONFIG.endpoints.generate, testPayload, {
    headers: {
      'x-key': apiKey
    }
  });

  return response.data;
}; 