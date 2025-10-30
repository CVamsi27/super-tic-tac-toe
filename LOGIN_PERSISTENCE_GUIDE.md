# 30-Day Persistent Login Guide

## Overview

Users can now stay logged in for up to **30 days** without needing to log in again. Their session is automatically restored when they return to the site.

## How It Works

### Storage Mechanism

Login credentials are stored in browser's `localStorage` with automatic expiration:

1. **Token Storage**: `auth_token` + `auth_token_expiry`
2. **User Profile Storage**: `user_profile` (no expiration for user info)
3. **Expiration**: 30 days from login time

### Session Flow

```
1. User logs in with Google OAuth
   ↓
2. Token + User profile saved to localStorage
   ↓
3. Expiry timestamp set (30 days from now)
   ↓
4. User closes browser/visits later
   ↓
5. App checks stored token expiry on load
   ↓
6a. If NOT expired → Auto-restore session ✅
   ↓
6b. If expired → User needs to login again ❌
```

## Implementation Details

### Code Changes

**File**: `context/AuthContext.tsx`

#### Helper Functions

```typescript
// Save with 30-day expiration
setStorageWithExpiry(key: string, value: string, days: number = 30)

// Retrieve and check expiration
getStorageWithExpiry(key: string): string | null

// Remove token and expiry
removeStorageWithExpiry(key: string)
```

#### Key Features

1. **Automatic Expiry Check**
   - Validates expiry timestamp on app load
   - Automatically clears expired tokens
   - User must login again if expired

2. **Seamless Re-login**
   - No login page shown if token valid
   - User returned to last visited page
   - Profile data automatically restored

3. **Security**
   - Tokens stored in localStorage (client-side)
   - Expiry prevents indefinite session
   - Logout immediately clears all data

## Usage

### For Users

**Stay Logged In:**
1. Login with Google
2. Close browser and return within 30 days
3. You're automatically logged in ✅

**Manual Logout:**
- Click "Logout" button in navbar
- Clears all session data immediately

**Session Expired:**
- After 30 days, you'll be logged out
- Click "Login" and authenticate again with Google

### For Developers

**Check if User Logged In:**
```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, token, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;
  
  return <div>Welcome, {user.name}!</div>;
}
```

**Manual Login:**
```typescript
const { login } = useAuth();
await login(googleIdToken);
```

**Manual Logout:**
```typescript
const { logout } = useAuth();
logout();
```

## Browser Storage Structure

### localStorage Keys

After login, these keys are stored:

```json
{
  "auth_token": "eyJhbGciOiJIUzI1NiIs...",
  "auth_token_expiry": "2025-11-29T15:30:00.000Z",
  "user_profile": "{\"id\":\"123\",\"name\":\"John\",\"email\":\"john@example.com\",...}"
}
```

### Expiry Check Logic

```
Current Time < Token Expiry?
  ├─ YES → Token valid, restore session ✅
  └─ NO → Token expired, remove from storage ❌
```

## Security Considerations

### ✅ What's Protected

1. **30-Day Expiry Limit**
   - Tokens automatically invalidated after 30 days
   - Reduces risk of token theft

2. **Expiry Validation**
   - Checked on every app load
   - Expired tokens immediately removed

3. **Logout Clears All**
   - User logout removes token + profile
   - No residual session data

### ⚠️ Important Notes

1. **localStorage vs sessionStorage**
   - Using `localStorage` (persists across browser sessions)
   - If using `sessionStorage`, session would end when browser closes
   - Choice made for "remember me for 30 days" feature

2. **Client-Side Storage**
   - Tokens stored on user's device
   - Vulnerable to XSS attacks if malicious script injected
   - Mitigation: Always validate tokens server-side (already implemented)

3. **HTTPS Only**
   - Ensure site uses HTTPS in production
   - Prevents token interception over HTTP

## Configuration

### Change Expiry Duration

To modify the 30-day expiry:

**In `context/AuthContext.tsx`:**

```typescript
// Change this constant (in days)
const TOKEN_EXPIRY_DAYS = 30; // Change to desired days

// Then rebuild the app
```

Available options:
- `7` - Remember for 7 days
- `14` - Remember for 2 weeks
- `30` - Remember for 30 days (current)
- `90` - Remember for 3 months

### Disable Persistent Login

To revert to login-per-session:

```typescript
// Use sessionStorage instead (clears when browser closes)
// Or set TOKEN_EXPIRY_DAYS to 0
```

## Testing

### Test 1: Basic Login Persistence

1. Visit app locally: `http://localhost:3000`
2. Login with Google
3. Open DevTools → Application → localStorage
4. Verify keys: `auth_token`, `auth_token_expiry`, `user_profile`
5. Close browser completely
6. Reopen app → Should be logged in ✅

### Test 2: Token Expiry

1. Login with Google
2. Open DevTools → Console
3. Manually set token expiry to past date:
   ```javascript
   localStorage.setItem('auth_token_expiry', new Date(Date.now() - 1000).toISOString());
   ```
4. Refresh page → Should be logged out ✅

### Test 3: Manual Logout

1. Login with Google
2. Click "Logout" button
3. Open DevTools → Application → localStorage
4. Verify keys are removed ✅

### Test 4: Session Restoration

1. Login and note user name shown
2. Refresh page → Name still shows (same session) ✅
3. Close all tabs/windows
4. Reopen → Name still shows (30-day persistence) ✅

## Troubleshooting

### "Still asking to login"

**Possible causes:**
1. Token expired (30 days passed)
2. Browser localStorage disabled
3. Private/Incognito mode (doesn't persist)

**Solution:**
- Re-login with Google
- Check browser privacy settings
- Test in normal browsing mode

### "Not staying logged in after refresh"

**Possible causes:**
1. localStorage quota exceeded
2. Browser auto-clear on close
3. App session issue

**Solution:**
1. Clear localStorage: `localStorage.clear()`
2. Re-login
3. Check browser settings for "clear site data on close"

### "Token showing but still logged out"

**Possible causes:**
1. Token corrupted
2. Expiry check failing
3. User profile missing

**Solution:**
1. Manually clear: `localStorage.removeItem('auth_token'); localStorage.removeItem('auth_token_expiry');`
2. Re-login
3. Check console for errors

## Production Deployment

### Vercel (Frontend)

No changes needed - localStorage works automatically on Vercel.

**Environment variables remain:**
```env
NEXT_PUBLIC_BACKEND_URL=https://super-tic-tac-toe-api.buildora.work
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
```

### Render (Backend)

No changes needed - backend token validation unchanged.

### Testing on Production

```bash
# Visit production site
https://super-tic-tac-toe.buildora.work

# 1. Login
# 2. Close browser
# 3. Return next day
# 4. Should still be logged in ✅
```

## Features & Benefits

### User Benefits ✅
- Stay logged in for 30 days
- Faster access (no repeated login)
- Convenient on personal devices
- Automatic session restoration

### Developer Benefits ✅
- Simple implementation
- No backend changes needed
- Automatic expiry handling
- Easy to test and debug

### Security Benefits ✅
- 30-day limit prevents indefinite access
- Automatic cleanup of expired tokens
- Server-side validation still enforced
- HTTPS protects in transit

## Best Practices

1. **Inform Users**: Display message about 30-day login (optional UI enhancement)

2. **Provide Logout**: Always offer logout option in navbar ✅ (already implemented)

3. **Handle Errors**: App handles token validation errors gracefully ✅

4. **Monitor Sessions**: Could add optional analytics:
   ```typescript
   // Track successful auto-login
   useEffect(() => {
     if (user && token) {
       console.log('Session restored from localStorage');
     }
   }, [user, token]);
   ```

5. **Update Profile**: If user profile changes server-side:
   ```typescript
   // Manual refresh (optional feature to add)
   const refreshProfile = async () => {
     const response = await fetch('/api/py/auth/me', {
       headers: { 'Authorization': `Bearer ${token}` }
     });
     const updatedUser = await response.json();
     localStorage.setItem('user_profile', JSON.stringify(updatedUser));
     setUser(updatedUser);
   };
   ```

## Changelog

### v1.0 - 30-Day Persistent Login
- ✅ Added `setStorageWithExpiry()` helper
- ✅ Added `getStorageWithExpiry()` helper
- ✅ Added `removeStorageWithExpiry()` helper
- ✅ Updated login function to use 30-day expiry
- ✅ Updated logout function to clear expiry
- ✅ Added automatic expiry validation on app load

## Related Files

- **Frontend**: `context/AuthContext.tsx` - Main implementation
- **Backend**: `api/services/auth_service.py` - Token validation
- **Login Page**: `app/login/page.tsx` - Login UI
- **Navbar**: `components/Navbar/Nabbar.tsx` - Logout button

## FAQ

**Q: Will this work in private/incognito mode?**  
A: No. Private mode doesn't persist localStorage between sessions.

**Q: Can users manually extend the 30 days?**  
A: Currently no. Expiry is fixed at 30 days from login. Could add "remember me" checkbox in future.

**Q: What if someone steals the token?**  
A: They can use it for 30 days max. Mitigation: Use HTTPS, enable browser security settings, log unusual activity.

**Q: Does this affect server-side sessions?**  
A: No. Server still validates each request. This is just client-side persistence of the token.

**Q: Can I reduce the 30-day period?**  
A: Yes! Change `TOKEN_EXPIRY_DAYS` constant in AuthContext.tsx.

---

**Status**: ✅ Implemented  
**Feature**: 30-Day Persistent Login  
**Files Modified**: 1 (`context/AuthContext.tsx`)  
**Breaking Changes**: None  
