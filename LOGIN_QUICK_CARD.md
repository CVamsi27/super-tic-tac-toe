# 30-Day Login Persistence - Quick Card

## What It Does
Users stay logged in for **30 days** - session auto-restores when they return to the app.

## How to Use It

### For Users
```
1. Login with Google
2. Close browser
3. Return within 30 days → Auto-logged in ✅
4. Return after 30 days → Need to login again
```

### For Developers
```typescript
import { useAuth } from '@/context/AuthContext';

// Check login status
const { user, token, logout } = useAuth();

if (user) {
  console.log('Welcome', user.name);
  // User is logged in
}
```

## Implementation

**File**: `context/AuthContext.tsx`

**Key Changes**:
- ✅ Added `setStorageWithExpiry()` - Save token with 30-day expiry
- ✅ Added `getStorageWithExpiry()` - Get token and validate expiry
- ✅ Updated `login()` - Uses new expiry helper
- ✅ Updated `logout()` - Clears expiry too

**Storage (after login)**:
```json
{
  "auth_token": "eyJ...",
  "auth_token_expiry": "2025-11-29T15:30:00Z",
  "user_profile": "{...}"
}
```

## Testing (Localhost)

```bash
# 1. npm run dev

# 2. Login with Google

# 3. DevTools → Application → Local Storage
#    Verify: auth_token, auth_token_expiry, user_profile

# 4. Close browser

# 5. Reopen app → Auto-logged in ✅
```

## Configuration

### Change Duration
```typescript
// In context/AuthContext.tsx
const TOKEN_EXPIRY_DAYS = 30; // Change this

// Options: 7, 14, 30, 90, etc.
```

### Disable
```typescript
const TOKEN_EXPIRY_DAYS = 0; // Session only (no persistence)
```

## Deployment

### Vercel ✅
```bash
git push origin main
# Auto-deploys, no config needed
```

### Render ✅
```bash
# No backend changes, works as-is
```

### Test Production
```bash
# Visit: https://super-tic-tac-toe.buildora.work
# Login → Close browser → Return next day → Auto-logged in ✅
```

## Key Features

| Feature | Status |
|---------|--------|
| 30-day persistence | ✅ |
| Auto-session restore | ✅ |
| Automatic expiry | ✅ |
| Immediate logout | ✅ |
| Server validation | ✅ |
| HTTPS support | ✅ |

## Storage Details

| Key | Value | Expires |
|-----|-------|---------|
| `auth_token` | JWT token | 30 days |
| `auth_token_expiry` | ISO timestamp | 30 days |
| `user_profile` | User JSON | Never |

## Security ✅
- Tokens expire after 30 days
- Expired tokens auto-removed
- Server validates each request
- Logout clears immediately
- Works with HTTPS

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Not staying logged in | Check localStorage enabled |
| Still asking to login | Try incognito mode test |
| Session not restoring | Check if 30 days passed |
| Logout not working | Clear localStorage manually |

## Documentation

**Full Guides**:
- `LOGIN_PERSISTENCE_GUIDE.md` - Complete feature docs
- `PERSISTENT_LOGIN_SUMMARY.md` - Overview & testing

**Related**:
- `context/AuthContext.tsx` - Implementation
- `app/login/page.tsx` - Login UI
- `components/Navbar/Nabbar.tsx` - Logout button

## Status

✅ **IMPLEMENTED**  
✅ **TESTED**  
✅ **READY FOR PRODUCTION**

---

## Quick Start

```bash
# Deploy to production
git push origin main

# Test on live site
# 1. Visit https://super-tic-tac-toe.buildora.work
# 2. Login with Google
# 3. Close browser
# 4. Return tomorrow → Auto-logged in ✅
```

---

**Commit**: f313fd5  
**Files Modified**: 1 (`context/AuthContext.tsx`)  
**Breaking Changes**: None  
**Backward Compatible**: Yes ✅
