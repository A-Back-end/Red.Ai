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

  console.log('[BFL API Client] Generating design with payload:', {
    promptLength: payload.prompt?.length || 0,
    hasImage: !!payload.input_image,
    priority: payload.priority
  });

  const response = await bflApiClient.post(BFL_API_CONFIG.endpoints.generate, payload, {
    headers: {
      'x-key': apiKey
    }
  });

  console.log('[BFL API Client] Generation response received:', {
    hasPollingUrl: !!response.data.polling_url,
    pollingUrlType: typeof response.data.polling_url,
    pollingUrlStartsWithHttp: response.data.polling_url?.startsWith('http')
  });

  return response.data;
};

// Check generation status
export const checkStatus = async (pollingUrl: string) => {
  const apiKey = getBflApiKey();
  
  if (!apiKey) {
    throw new Error('BFL_API_KEY environment variable is missing or invalid');
  }

  // Validate polling URL
  if (!pollingUrl || typeof pollingUrl !== 'string') {
    throw new Error('Invalid polling URL: URL is missing or not a string');
  }

  if (!pollingUrl.startsWith('http')) {
    throw new Error(`Invalid polling URL format: ${pollingUrl}`);
  }

  // Additional validation for BFL.ai URLs
  const validHosts = ['api.bfl.ai', 'api.eu1.bfl.ai', 'api.eu4.bfl.ai', 'api.us1.bfl.ai', '13.107.246.45'];
  const urlObj = new URL(pollingUrl);
  if (!validHosts.includes(urlObj.hostname)) {
    console.warn('[BFL API Client] Warning: Polling URL hostname not in valid list:', urlObj.hostname);
  }

  console.log('[BFL API Client] Checking status at:', pollingUrl);

  // Use direct axios call - this works perfectly as shown by debug endpoint
  const response = await axios.get(pollingUrl, {
    headers: {
      'Content-Type': 'application/json',
      'x-key': apiKey
    },
    timeout: BFL_API_CONFIG.timeout
  });

  console.log('[BFL API Client] Status response received');
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