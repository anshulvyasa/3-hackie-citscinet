# Authentication Implementation Guide

## Overview
The signup and login pages are now fully functional with token storage in the frontend.

## Files Created

### 1. **UI Components**
- [components/forms/signup-form.tsx](components/forms/signup-form.tsx) - Signup form with validation
- [components/forms/login-form.tsx](components/forms/login-form.tsx) - Login form with token storage

### 2. **Pages**
- [app/signup/page.tsx](app/signup/page.tsx) - Signup page
- [app/login/page.tsx](app/login/page.tsx) - Login page

### 3. **Utilities & Hooks**
- [lib/auth-utils.ts](lib/auth-utils.ts) - Authentication utility functions
- [hooks/use-auth.ts](hooks/use-auth.ts) - React hooks for auth management

## Features Implemented

✅ **Signup Form**
- Username validation (min 3 chars)
- Password validation (min 8 chars)
- Account type selection (Citizen Science / Professional)
- Form validation with error messages
- Redirect to login after signup

✅ **Login Form**
- Email/username and password fields
- Token stored in localStorage as `auth_token`
- User info stored (id, username, type)
- Auto-redirect to dashboard after login
- Secure authentication

✅ **Token Management**
- Tokens automatically stored in localStorage
- Methods to retrieve, clear, and validate tokens
- Authorization header generation for API calls

## How to Use

### In Components - Get Auth Status

```tsx
'use client';
import { useAuth } from '@/hooks/use-auth';

export function MyComponent() {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) {
    return <p>Not logged in</p>;
  }

  return (
    <div>
      <p>Welcome, {user?.username}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### In Components - Protect Routes

```tsx
'use client';
import { useProtectedRoute } from '@/hooks/use-auth';

export function ProtectedComponent() {
  const { isAuthenticated, isLoading } = useProtectedRoute();

  if (isLoading) return <p>Loading...</p>;
  if (!isAuthenticated) return null; // Auto-redirects to login

  return <p>This is protected content</p>;
}
```

### Get Token for API Calls

```tsx
import { authUtils } from '@/lib/auth-utils';

// Get token
const token = authUtils.getToken();

// Get authorization header
const headers = authUtils.getAuthHeader();

// API call
const response = await fetch('/api/observations', {
  headers: {
    'Content-Type': 'application/json',
    ...headers,
  },
});
```

### Logout

```tsx
import { authUtils } from '@/lib/auth-utils';

button.onClick = () => {
  authUtils.clearToken();
  router.push('/login');
};
```

## Token Storage Structure

Tokens are stored in localStorage with the following keys:
- `auth_token` - JWT token
- `user_id` - User ID
- `username` - Username
- `user_type` - User type (normal/scientist)

## Endpoints Used

- `POST /api/signup` - Create new user
- `POST /api/login` - Authenticate user
- `GET /api/login` - Validate token (optional)

## Next Steps

1. **Update Dashboard** - Add logout button and user info display
2. **Protect API Routes** - Verify token on server endpoints
3. **Update Navigation** - Show login/signup links when not authenticated
4. **Add Refresh Logic** - Handle token expiration (7 days)
