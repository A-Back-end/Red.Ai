# RED AI Platform - Localhost Setup

## 🚀 Quick Start

### Option 1: Using the script (Recommended)
```bash
./scripts/start-localhost.sh
```

### Option 2: Manual start
```bash
# Kill any existing processes
pkill -f "npm run dev"
lsof -ti:3000 | xargs kill -9

# Start the server
npm run dev
```

## 🌐 Available URLs

- **Main Page**: http://localhost:3000
- **Static Landing Page**: http://localhost:3000/index.html
- **Dashboard**: http://localhost:3000/dashboard
- **Login**: http://localhost:3000/login
- **Image Generator**: http://localhost:3000/image-generator
- **Interior Design**: http://localhost:3000/interior-design

## 🔧 What was fixed

### 1. CSS @import Issue
- **Problem**: `@import` rules were not at the top of CSS files
- **Solution**: Moved `@import` rules to the very beginning of `app/globals.css` and `public/globals.css`

### 2. Clerk Authentication Issues
- **Problem**: Middleware was too strict and causing authentication errors
- **Solution**: 
  - Modified `middleware.ts` to allow all routes in development mode
  - Updated `AuthErrorHandler.tsx` to only show errors in production
  - Disabled aggressive error handling in development

### 3. Development Mode Configuration
- **Problem**: Authentication was blocking development
- **Solution**: Configured the app to bypass authentication checks in development mode

## 🛠️ Troubleshooting

### If you see "Authentication Error":
1. Make sure you're in development mode (`NODE_ENV=development`)
2. The app should automatically bypass authentication in development
3. If the error persists, try refreshing the page

### If the server won't start:
1. Check if port 3000 is free: `lsof -ti:3000`
2. Kill any processes: `kill -9 <PID>`
3. Try running: `npm run dev`

### If CSS is not loading:
1. Check that `@import` rules are at the top of CSS files
2. Clear browser cache
3. Restart the development server

## 📁 Key Files Modified

- `app/globals.css` - Fixed @import order
- `public/globals.css` - Fixed @import order  
- `middleware.ts` - Relaxed authentication for development
- `components/auth/AuthErrorHandler.tsx` - Disabled error handling in development
- `app/page.tsx` - Added test page functionality

## 🎯 Next Steps

1. Open http://localhost:3000 in your browser
2. Test the static landing page at http://localhost:3000/index.html
3. Try accessing the dashboard (should work without authentication in dev mode)
4. Test the image generator and other features

## 🔍 Monitoring

The server logs will show:
- Compilation status
- API requests
- Authentication status
- Any errors or warnings

If you see any issues, check the terminal output for error messages. 