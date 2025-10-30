# Environment Configuration Guide

## Deployment Infrastructure

- **Frontend**: Vercel (https://super-tic-tac-toe.buildora.work)
- **Backend**: Render (https://super-tic-tac-toe-api.buildora.work)
- **Database**: PostgreSQL on Render

---

## Frontend (Vercel) Configuration

### 1. Vercel Project Setup

**Option A: GitHub Integration (Recommended)**
1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. Vercel will auto-detect Next.js
5. Click "Deploy"

**Option B: Manual Setup**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### 2. Environment Variables on Vercel

Go to **Project Settings → Environment Variables** and add:

#### Development
```
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

#### Preview & Production
```
NEXT_PUBLIC_BACKEND_URL=https://super-tic-tac-toe-api.buildora.work
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

**Where to get GOOGLE_CLIENT_ID:**
1. Go to Google Cloud Console: https://console.cloud.google.com
2. Create OAuth 2.0 credentials (Web Application)
3. Add authorized origins:
   - `https://super-tic-tac-toe.buildora.work`
   - `http://localhost:3000` (for local development)
4. Copy Client ID

### 3. Custom Domain on Vercel

1. Go to **Project Settings → Domains**
2. Click "Add Domain"
3. Enter: `super-tic-tac-toe.buildora.work`
4. Choose "Nameserver" as DNS strategy
5. Update DNS records at your registrar:

```
Type: NS (Nameserver)
Value: ns1.vercel.com, ns2.vercel.com
```

Or if your registrar doesn't support NS records, use CNAME:

```
Type: CNAME
Name: super-tic-tac-toe
Value: cname.vercel.com.
```

### 4. Vercel Build Settings

**Framework Preset**: Next.js (auto-detected)
**Build Command**: `npm run build`
**Output Directory**: `.next`
**Install Command**: `npm install`

These are usually auto-configured by Vercel.

---

## Backend (Render) Configuration

### 1. Create PostgreSQL Database

1. Go to https://dashboard.render.com
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `super-tic-tac-toe-db`
   - **Region**: Select region closest to you
   - **PostgreSQL Version**: 15
   - **Datadog API Key**: Leave blank (optional)
4. Click "Create Database"
5. Copy the connection string (internal or external)

### 2. Create Web Service

1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `super-tic-tac-toe-api`
   - **Environment**: `Python 3`
   - **Branch**: `main`
   - **Build Command**: `pip install -r api/requirements.txt`
   - **Start Command**: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Starter` (minimum)

### 3. Environment Variables on Render

Add these environment variables in **Environment**:

```
DATABASE_URL=postgresql://user:password@host:5432/database
SECRET_KEY=your_secure_secret_key_here
GOOGLE_CLIENT_ID=your_google_client_id
CORS_ORIGINS=["https://super-tic-tac-toe.buildora.work","http://localhost:3000"]
PYTHON_VERSION=3.10.0
```

**Getting DATABASE_URL from PostgreSQL service:**
1. Go to the PostgreSQL service details
2. Under "Connections", find "Internal Database URL"
3. Copy the full connection string
4. Use it as `DATABASE_URL`

**Generating SECRET_KEY:**
```bash
# Linux/Mac
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Or use OpenSSL
openssl rand -base64 32
```

### 4. Custom Domain on Render

1. Go to Web Service → **Settings**
2. Scroll to **Custom Domain**
3. Enter: `super-tic-tac-toe-api.buildora.work`
4. Render will provide DNS instructions
5. Update DNS at your registrar:

```
Type: CNAME
Name: super-tic-tac-toe-api
Value: cname.render.com
```

**Wait 2-5 minutes for DNS propagation.**

### 5. Run Database Migrations

After deployment completes:

1. Click "Shell" in the Web Service page
2. Run:
   ```bash
   python -m alembic upgrade head
   ```

Or use the Render shell to run a one-off script:
```bash
# From dashboard
cd /app
python -m alembic upgrade head
```

---

## Custom Domain DNS Setup (buildora.work)

Assuming you own `buildora.work` and use a DNS provider like:
- Namecheap
- GoDaddy
- Route 53
- Cloudflare

### DNS Records Configuration

Add these DNS records to your registrar:

#### Vercel Frontend
```
Type: CNAME
Name: super-tic-tac-toe
Value: cname.vercel.com
TTL: 3600
```

#### Render Backend
```
Type: CNAME
Name: super-tic-tac-toe-api
Value: cname.render.com
TTL: 3600
```

### Verification

```bash
# Test frontend DNS
nslookup super-tic-tac-toe.buildora.work

# Test backend DNS
nslookup super-tic-tac-toe-api.buildora.work

# Test connectivity
curl https://super-tic-tac-toe-api.buildora.work/api/py/docs
```

---

## Continuous Deployment

### Automatic Deployments

Both Vercel and Render monitor your GitHub repository:

- Push to `main` branch → Automatic deployment
- Pull requests → Preview deployments (Vercel only)

### Manual Deployments

**Vercel:**
```bash
vercel --prod
```

**Render:**
- Trigger from Dashboard → "Manual Deploy"
- Or push to repository

---

## Environment Variable Checklist

### Vercel (Frontend)

- [ ] `NEXT_PUBLIC_BACKEND_URL` set to production API
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` set (visible to browser)
- [ ] Build successful
- [ ] Domain connected

### Render (Backend)

- [ ] `DATABASE_URL` pointing to PostgreSQL
- [ ] `SECRET_KEY` set to strong random value
- [ ] `GOOGLE_CLIENT_ID` set (for OAuth)
- [ ] `CORS_ORIGINS` includes frontend domain
- [ ] Migrations run: `alembic upgrade head`
- [ ] Domain connected

---

## Testing After Deployment

### Health Checks

```bash
# Frontend health
curl https://super-tic-tac-toe.buildora.work/

# Backend health
curl https://super-tic-tac-toe-api.buildora.work/api/py/health

# Backend docs (Swagger UI)
curl https://super-tic-tac-toe-api.buildora.work/api/py/docs
```

### Functionality Tests

1. **Visit frontend**: https://super-tic-tac-toe.buildora.work
2. **Create a remote game** and test two-player gameplay
3. **Create an AI game** and test against different difficulties
4. **Check browser console** for any CORS or API errors
5. **Test game reset** functionality

### Expected API Responses

**Game Creation:**
```bash
curl -X POST https://super-tic-tac-toe-api.buildora.work/api/py/game/create-game \
  -H "Content-Type: application/json" \
  -d '{"mode":"remote"}'

# Response:
# {"game_id":"uuid-here","mode":"remote"}
```

**AI Move:**
```bash
curl -X POST https://super-tic-tac-toe-api.buildora.work/api/ai/move \
  -H "Content-Type: application/json" \
  -d '{"game_id":"uuid","board_state":{},"difficulty":"medium"}'
```

---

## Monitoring & Logging

### Vercel Monitoring

- **Dashboard**: https://vercel.com/dashboard
- **Function Logs**: Real-time logs of serverless function calls
- **Analytics**: Performance metrics, edge requests
- **Error Tracking**: Automatic error detection

### Render Monitoring

- **Dashboard**: https://dashboard.render.com
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, disk usage
- **Database**: PostgreSQL metrics in database service

### Setting Up Alerts

**Vercel:**
- Settings → Alerts
- Configure for failed deployments

**Render:**
- Settings → Notifications
- Email alerts for service restarts

---

## Scaling & Performance

### Vercel

- **Automatic scaling** - No configuration needed
- **Regional distribution** - Via Vercel's global network
- **Auto-caching** - ISR and edge caching enabled

### Render

**Upgrading Instance Type:**
1. Go to Web Service → Settings
2. Under "Instance Type", select larger instance
3. Render will restart with new capacity

**Database Performance:**
- Monitor connections under PostgreSQL service
- Consider read replicas for heavy load
- Enable backups in settings

---

## Troubleshooting

### "Backend not reachable from frontend"

**Check:**
1. Backend is running: `curl https://super-tic-tac-toe-api.buildora.work/api/py/health`
2. `NEXT_PUBLIC_BACKEND_URL` is set correctly in Vercel
3. CORS settings allow frontend domain in backend
4. Frontend is actually deployed (check Vercel dashboard)

**Fix CORS on Backend:**
```python
# In api/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://super-tic-tac-toe.buildora.work",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### "Database connection failed"

**Check:**
1. `DATABASE_URL` is correct format
2. PostgreSQL service is running (check Render dashboard)
3. IP whitelist allows Render web service
4. Password doesn't contain special characters (or URL-encode them)

### "502 Bad Gateway"

**Common causes:**
1. Application crashed - Check Render logs
2. Out of memory - Upgrade instance
3. Database unreachable - Check DATABASE_URL
4. Deployment failed - Retry deployment

**Fix:**
1. Check logs: Render Dashboard → Logs
2. Restart service: Services → Web Service → Manual Restart
3. Check environment variables are all set

### "Slow response times"

**Investigation:**
1. Check server load in Render metrics
2. Look for slow database queries in logs
3. Check Vercel function duration in analytics

**Optimization:**
- Upgrade Render instance type
- Add database caching
- Enable compression in API responses

---

## Rollback Procedure

### Frontend Rollback

**Vercel:**
1. Go to Deployments
2. Find previous successful deployment
3. Click "... → Redeploy"
4. Or manually deploy previous commit:
   ```bash
   git revert HEAD
   git push origin main
   ```

### Backend Rollback

**Render:**
1. Go to Web Service → Logs
2. Find deployment before issue
3. Click "Manual Deploy" → Choose previous version
4. Or:
   ```bash
   git revert HEAD
   git push origin main
   # Render auto-deploys
   ```

---

## Production Checklist

Before going live:

- [ ] Vercel project created and connected
- [ ] Render PostgreSQL created
- [ ] Render Web Service created
- [ ] All environment variables set on both platforms
- [ ] Database migrations completed
- [ ] Custom domains configured and DNS updated
- [ ] SSL certificates generated (automatic)
- [ ] Health checks pass
- [ ] Functionality tested end-to-end
- [ ] Monitoring/alerts configured
- [ ] Backup procedures documented
- [ ] Runbook created for emergencies

---

**Last Updated**: Ready for Production Deployment 🚀
