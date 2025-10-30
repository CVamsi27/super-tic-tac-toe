# Quick Start: Production Deployment

Get your game live in 15 minutes!

## Prerequisites

- GitHub repository (this project)
- Google OAuth credentials
- Domain (super-tic-tac-toe.buildora.work)

---

## Step 1: Create Vercel Project (2 min)

```bash
# Go to https://vercel.com
# Click "Add New..." → "Project"
# Import this GitHub repository
# Click "Deploy"
```

**Expected**: Deployment completes, you get a .vercel.app URL

---

## Step 2: Create Render PostgreSQL (3 min)

```bash
# Go to https://dashboard.render.com
# Click "New +" → "PostgreSQL"
# Name: super-tic-tac-toe-db
# Region: (select closest to you)
# Click "Create Database"

# Copy the internal connection string
# Format: postgresql://user:password@host:5432/db_name
```

**Expected**: PostgreSQL service is "Available" after ~2 min

---

## Step 3: Create Render Web Service (5 min)

```bash
# In Render Dashboard → "New +" → "Web Service"
# Connect GitHub repository
# Configure:

Repository: select this repository
Branch: main
Runtime: Python 3
Build Command: pip install -r api/requirements.txt
Start Command: uvicorn api.main:app --host 0.0.0.0 --port $PORT
Instance Type: Starter
```

**Don't click Deploy yet!** → Go to Step 4

---

## Step 4: Set Environment Variables (3 min)

### On Render (before deploying):

```
DATABASE_URL=postgresql://user:password@host:5432/db
SECRET_KEY=generate_strong_key_here
GOOGLE_CLIENT_ID=your_google_client_id
PYTHON_VERSION=3.10.0
```

**To generate SECRET_KEY:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Now click "Deploy"** on Render

**Expected**: Backend deploys in ~10 minutes

---

## Step 5: Configure Vercel Environment Variables (2 min)

1. Go to Vercel → Project Settings → Environment Variables
2. Add:

```
NEXT_PUBLIC_BACKEND_URL=https://super-tic-tac-toe-api.buildora.work
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

3. Trigger redeploy: Go to Deployments → click "..." on latest → "Redeploy"

**Expected**: Frontend redeploys with correct backend URL

---

## Step 6: Run Database Migrations (1 min)

Once Render backend is deployed:

1. Click Web Service → "Shell"
2. Run:
   ```bash
   python -m alembic upgrade head
   ```

**Expected**: "INFO  [alembic.runtime.migration] Running upgrade..."

---

## Step 7: Configure Custom Domains (0 min)

### Vercel
1. Settings → Domains → "Add Domain"
2. Enter: `super-tic-tac-toe.buildora.work`
3. Vercel will show DNS records to add

### Render
1. Web Service → Settings → Custom Domain
2. Enter: `super-tic-tac-toe-api.buildora.work`
3. Render will show DNS records to add

### At Your DNS Provider

Add these CNAME records:

```
super-tic-tac-toe    CNAME    cname.vercel.com
super-tic-tac-toe-api    CNAME    cname.render.com
```

**Wait 5-10 minutes for DNS propagation**

---

## Step 8: Verify Deployment ✅

### Test Frontend
```bash
curl https://super-tic-tac-toe.buildora.work/
# Should return HTML
```

### Test Backend Health
```bash
curl https://super-tic-tac-toe-api.buildora.work/api/py/health
# Should return: {"status":"ok"}
```

### Test API Docs
```bash
# Visit in browser:
https://super-tic-tac-toe-api.buildora.work/api/py/docs
```

### Test Game Creation
```bash
curl -X POST https://super-tic-tac-toe-api.buildora.work/api/py/game/create-game \
  -H "Content-Type: application/json" \
  -d '{"mode":"remote"}'
# Should return: {"game_id":"...","mode":"remote"}
```

### Test AI Endpoint
```bash
curl -X POST https://super-tic-tac-toe-api.buildora.work/api/ai/move \
  -H "Content-Type: application/json" \
  -d '{
    "game_id":"test",
    "board_state":{"(0,0)":"X","(0,1)":"","(0,2)":"","(1,0)":"","(1,1)":"","(1,2)":"","(2,0)":"","(2,1)":"","(2,2)":""},
    "difficulty":"medium"
  }'
# Should return: {"move":[...], "game_id":"test"}
```

---

## All Done! 🎉

Your game is now live at:
- **Frontend**: https://super-tic-tac-toe.buildora.work
- **Backend API**: https://super-tic-tac-toe-api.buildora.work

---

## Troubleshooting Quick Fixes

### "Backend not reachable"
- Check `NEXT_PUBLIC_BACKEND_URL` in Vercel is set correctly
- Verify backend domain is accessible
- Check browser console for CORS errors

### "Database connection failed"
- Verify `DATABASE_URL` is correct
- Check PostgreSQL service is "Available" in Render
- Ensure no special characters in password (or URL-encode them)

### "Migrations failed"
- SSH into Render shell
- Run: `python -m alembic current`
- Run: `python -m alembic upgrade head`

### "502 Bad Gateway"
- Check Render logs: Dashboard → Logs
- Verify all environment variables are set
- Restart service: Services → "Manual Restart"

---

## Next Steps

1. Test gameplay: Create remote and AI games
2. Monitor logs: Check Vercel and Render dashboards
3. Set up alerts: Configure error notifications
4. Share with users: Go live!

---

## Documentation Reference

- **Full Deployment Guide**: `PRODUCTION_DEPLOYMENT.md`
- **Environment Setup**: `ENVIRONMENT_CONFIGURATION.md`
- **AI Testing**: `AI_TESTING_GUIDE.md`
- **Troubleshooting**: See individual guides

---

**Estimated Time: 15-20 minutes**
**Status**: Production Ready ✅
