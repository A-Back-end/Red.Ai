# BFL API DNS Resolution Fix

## Problem Description

The `/api/generate-design` endpoint was returning a 500 error with the message "fetch failed" when running locally. The issue was caused by DNS resolution problems in the Next.js development environment.

### Root Cause

The error `getaddrinfo EAI_AGAIN api.bfl.ai` indicated that the Next.js server could not resolve the domain name `api.bfl.ai` to an IP address, even though DNS resolution worked fine from the terminal.

### Investigation Steps

1. **Verified API Key Configuration**: Confirmed that `BFL_API_KEY` was properly set in `.env.local`
2. **Tested Direct API Access**: Successfully tested the BFL API directly using curl from terminal
3. **Identified DNS Issue**: Found that the Next.js server environment had DNS resolution problems
4. **Tried Different Approaches**: 
   - Used IP address directly with Host header
   - Switched from `fetch` to `axios`
   - Disabled SSL verification

## Solution Implemented

### 1. Created BFL API Client Utility (`utils/bflApiClient.ts`)

- **Centralized Configuration**: Created a dedicated module for BFL API interactions
- **IP Address Resolution**: Used the direct IP address `13.107.246.45` to bypass DNS issues
- **Custom Axios Instance**: Configured with proper headers and SSL settings
- **Error Handling**: Implemented robust error handling and retry logic

### 2. Updated API Endpoints

- **Generate Design** (`/api/generate-design`): Now uses the new BFL API client
- **Check Status** (`/api/check-status`): Updated to use the centralized client
- **Removed Duplicate Code**: Eliminated redundant API key validation and request logic

### 3. Key Technical Changes

```typescript
// Before: Direct fetch with DNS issues
const response = await fetch('https://api.bfl.ai/v1/flux-kontext-pro', {
  method: 'POST',
  headers: { 'x-key': apiKey },
  body: JSON.stringify(payload)
});

// After: Custom axios client with IP resolution
const bflApiClient = axios.create({
  baseURL: 'https://13.107.246.45',
  headers: { 'Host': 'api.bfl.ai' },
  httpsAgent: new https.Agent({ rejectUnauthorized: false })
});
```

## Files Modified

1. **`utils/bflApiClient.ts`** - New utility module for BFL API interactions
2. **`app/api/generate-design/route.ts`** - Updated to use new client
3. **`app/api/check-status/route.ts`** - Updated to use new client
4. **`app/api/test-bfl/route.ts`** - Removed (was temporary debugging endpoint)

## Testing Results

✅ **Generate Design**: Returns proper polling URL  
✅ **Check Status**: Successfully retrieves generation status  
✅ **Error Handling**: Proper error messages and retry logic  
✅ **Local Development**: Works correctly in Next.js dev environment  

## Environment Requirements

- `BFL_API_KEY` must be set in `.env.local`
- `axios` package installed (`npm install axios`)
- Next.js development server running

## Notes

- The solution uses IP address `13.107.246.45` which resolves to the BFL API
- SSL verification is disabled for development (should be enabled in production)
- The fix is specific to the local development environment DNS resolution issue
- Production deployment may require different configuration

## Future Improvements

1. **Production SSL**: Enable SSL verification for production environments
2. **DNS Fallback**: Implement fallback to domain names if IP resolution fails
3. **Health Checks**: Add periodic API health checks
4. **Rate Limiting**: Implement proper rate limiting for API calls 