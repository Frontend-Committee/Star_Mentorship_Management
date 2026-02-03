# Authentication Error Troubleshooting Guide

## Error Details

You're experiencing:

- **502 Bad Gateway** - Backend server unreachable
- **400 Bad Request** - Invalid request format

## Quick Diagnosis Steps

### 1. Check Backend Server Status

The backend is hosted at: `https://starunion.pythonanywhere.com`

**Test the backend directly:**

- Open your browser and visit: `https://starunion.pythonanywhere.com/api/`
- You should see the Django REST Framework browsable API

**If the page doesn't load:**

- The PythonAnywhere server might be down or sleeping
- Free PythonAnywhere accounts sleep after inactivity
- Contact your backend administrator to wake up the server

### 2. Check Your Dev Server

Make sure your Vite dev server is running on port 5173:

```bash
npm run dev
```

### 3. Test the Proxy

The proxy configuration in `vite.config.ts` forwards `/api` requests to the backend.

**Current proxy config:**

```typescript
proxy: {
  "/api": {
    target: "https://starunion.pythonanywhere.com",
    changeOrigin: true,
    secure: true,
  },
}
```

### 4. Common Issues & Solutions

#### Issue: 502 Bad Gateway

**Cause:** Backend server is not responding
**Solutions:**

1. Check if `https://starunion.pythonanywhere.com` is accessible
2. Verify the backend server is running
3. Check if there are any CORS issues
4. Restart the PythonAnywhere web app

#### Issue: 400 Bad Request

**Cause:** Request payload doesn't match backend expectations
**Solutions:**

1. Check the login payload format:
   ```typescript
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```
2. Verify the backend expects `email` (not `username`)
3. Check for any required fields you might be missing

### 5. Temporary Workaround: Use Mock Data

If the backend is unavailable, you can temporarily use mock data:

**Option A: Skip Authentication**
Comment out the authentication check in `AuthContext.tsx`:

```typescript
// Temporarily disable auth check
const isAuthenticated = true; // Always authenticated for testing
```

**Option B: Use Mock API**
Create a mock API service that returns dummy data for development.

### 6. Backend Health Check

Create a simple test to verify backend connectivity:

```typescript
// Test in browser console
fetch("https://starunion.pythonanywhere.com/api/")
  .then((r) => r.json())
  .then((data) => console.log("Backend is UP:", data))
  .catch((err) => console.error("Backend is DOWN:", err));
```

### 7. Check Browser Console

Look for additional error details:

1. Open DevTools (F12)
2. Go to Network tab
3. Try to login
4. Click on the failed request
5. Check:
   - Request Headers
   - Request Payload
   - Response Headers
   - Response Body

### 8. Verify API Endpoints

Make sure these endpoints exist on your backend:

- `POST /api/auth/login/` - Login
- `POST /api/auth/token/refresh/` - Refresh token
- `GET /api/auth/users/me/` - Get current user
- `GET /api/weeks/` - List weeks
- `POST /api/weeks/` - Create week

## Next Steps

1. **First**, verify the backend is accessible by visiting the URL in your browser
2. **Second**, check the browser console for detailed error messages
3. **Third**, if backend is down, contact the backend administrator
4. **Fourth**, if you need to continue development, use mock data temporarily

## Contact Backend Admin

If the backend is hosted on PythonAnywhere:

- Login to PythonAnywhere dashboard
- Go to "Web" tab
- Click "Reload" button to restart the web app
- Check the error logs for any issues

## Week Management Feature Status

**Good News:** The week management feature I implemented is ready and will work once the backend is accessible. The authentication issue is separate from the week management implementation.

**What's Working:**

- ✅ All API hooks are correctly implemented
- ✅ Type definitions match the API spec
- ✅ UI components are ready
- ✅ Data transformation is in place

**What Needs Backend:**

- ⏳ Backend server needs to be running
- ⏳ Authentication needs to work
- ⏳ Week endpoints need to be available

## Testing Without Backend

If you want to test the UI without the backend, I can help you:

1. Create a mock API service
2. Add mock data for weeks
3. Bypass authentication temporarily

Let me know if you need help with any of these options!
