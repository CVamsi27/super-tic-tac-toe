# Vercel Deployment Plan - Super Tic Tac Toe

## Architecture Overview

Your project is a **hybrid full-stack application**:
- **Frontend**: Next.js 15 (React 19) - handles UI and client-side logic
- **Backend**: FastAPI (Python) - handles game logic, authentication, database
- **Real-time**: WebSocket for live game state updates
- **Database**: PostgreSQL (via DATABASE_URL)

---

## Deployment Strategy: Two Options

### Option 1: **Recommended - Monorepo Deployment**
Deploy both frontend and backend to Vercel using a single repository with serverless functions.

**Pros:**
- Unified deployment workflow
- Shared environment variables
- Single deployment URL
- Easier to manage

**Cons:**
- Requires Python support (available via Vercel)
- Slightly more complex configuration

### Option 2: Separate Deployment
- Deploy Next.js to Vercel
- Deploy FastAPI to Railway, Render, or other Python host

**Pros:**
- Independent scaling
- Decoupled deployment

**Cons:**
- More infrastructure to manage
- Cross-origin configuration needed

---

## Implementation: Option 1 (Monorepo)

### Step 1: Project Structure Setup

Your existing structure is already compatible:
```
/repo-root
├── app/              # Next.js frontend
├── api/              # FastAPI backend
├── next.config.js    # Already configured with API rewrites
├── package.json      # Frontend dependencies
└── pyproject.toml    # Python dependencies
```

### Step 2: Environment Variables

Create these environment variables in Vercel dashboard (Settings → Environment Variables):

**Required for Frontend:**
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Your Google OAuth client ID (make it public)

**Required for Backend:**
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key for token signing
- `GOOGLE_CLIENT_ID` - Same as above (backend uses it)

**Optional:**
- `NODE_ENV` - Set to "production" (auto-set by Vercel)
- `PYTHON_VERSION` - Set to "3.10" or "3.11"

### Step 3: Vercel Configuration File

Create `vercel.json` in your root directory:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "pip install -r api/requirements.txt && npm ci",
  "framework": "nextjs",
  "functions": {
    "api/**": {
      "runtime": "python3.10"
    }
  },
  "rewrites": [
    {
      "source": "/api/py/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/docs",
      "destination": "/docs"
    }
  ]
}
```

### Step 4: Create Python Requirements File

Create `api/requirements.txt`:

```
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.20
python-dotenv==1.0.0
alembic==1.12.1
pydantic==2.5.0
pydantic-settings==2.1.0
python-multipart==0.0.6
PyJWT==2.8.1
google-auth-oauthlib==1.2.0
google-auth==2.25.0
aiosqlite==0.19.0
apscheduler==3.10.4
psycopg2-binary==2.9.9
websockets==12.0
```

**Note:** Replace versions with your actual pinned versions from local environment:
```bash
pip freeze > api/requirements.txt
```

### Step 5: Database Migrations

Before first deployment, set up PostgreSQL:

**Option A: Railway (Recommended)**
1. Go to https://railway.app
2. Create new PostgreSQL database
3. Copy connection string to `DATABASE_URL`

**Option B: Vercel Postgres (Beta)**
1. In Vercel dashboard → Storage → Postgres
2. Create database and copy connection string

**Option C: External provider**
- Neon, Supabase, AWS RDS, etc.

### Step 6: Pre-Deployment Configuration

Update `api/db/database.py` to handle Vercel environment:

```python
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy import create_engine
from contextlib import contextmanager
import os
from dotenv import load_dotenv

load_dotenv()
database_url = os.getenv("DATABASE_URL")

if not database_url:
    raise ValueError("DATABASE_URL environment variable is not set")

# Handle different database URL formats
if database_url.startswith("postgres://"):
    # Convert old postgres:// to postgresql://
    database_url = database_url.replace("postgres://", "postgresql://", 1)

# For SSL connections in production
if "SSL" not in database_url:
    engine = create_engine(database_url)
else:
    engine = create_engine(database_url, connect_args={"sslmode": "require"})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

@contextmanager
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
```

### Step 7: API Routes Configuration

Update `api/main.py` for production:

```python
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.services.game_service import game_service
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from contextlib import asynccontextmanager

from api.routers import game_router, auth_router
from api.db.database import init_db

scheduler = AsyncIOScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database on startup
    init_db()
    scheduler.start()
    
    scheduler.add_job(
        game_service.cleanup_inactive_games,
        CronTrigger(minute='*/30'),
        id='cleanup_games',
        name='Clean up inactive games'
    )
    yield
    scheduler.shutdown()

app = FastAPI(
    title="Super Tic Tac Toe",
    docs_url="/api/py/docs",
    openapi_url="/api/py/openapi.json",
    lifespan=lifespan
)

# CORS configuration
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "https://yourdomain.vercel.app",
    # Add your custom domain here when you have one
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if os.getenv("NODE_ENV") == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(game_router.router, prefix="/api/py/game", tags=["Game"])
app.include_router(auth_router.router, prefix="/api/py", tags=["Auth"])

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
```

### Step 8: Vercel Python Support

Vercel requires a specific structure for Python serverless functions. Create:

`api/__init__.py` - Ensure it exists (already does)

`api/index.py` or update entry point:

```python
from api.main import app

# Vercel expects a WSGI-compatible app
from fastapi.middleware.wsgi import WSGIMiddleware

# For serverless functions
handler = app
```

---

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "docs: Add deployment configuration"
git push origin main
```

### 2. Connect to Vercel

**Via CLI:**
```bash
npm install -g vercel
vercel link
```

**Via Dashboard:**
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import from Git (connect your GitHub repo)
4. Select your repository

### 3. Configure Build Settings

In Vercel dashboard:
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Root Directory**: `./`

### 4. Add Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```
DATABASE_URL = your_postgresql_url
SECRET_KEY = your_jwt_secret_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID = your_google_client_id
GOOGLE_CLIENT_ID = your_google_client_id
```

### 5. First Deployment

```bash
vercel --prod
```

Or deploy via dashboard by pushing to main branch.

### 6. Run Database Migrations

After first deployment, run migrations:

```bash
# Via Vercel CLI
vercel env pull  # Download environment variables

# Run Alembic migrations
alembic upgrade head
```

Or create a deployment hook in Vercel to auto-run migrations.

---

## WebSocket Configuration

Your Next.js config already has rewrites set up. For WebSocket support:

### Update `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  rewrites: async () => {
    const backendUrl =
      process.env.NODE_ENV === "development"
        ? "http://127.0.0.1:8000"
        : process.env.BACKEND_URL || "";
    
    return [
      {
        source: "/api/py/:path*",
        destination: `${backendUrl}/api/py/:path*`,
      },
      {
        source: "/ws/:path*",
        destination: `${backendUrl}/ws/:path*`,
      },
    ];
  },
  // Enable WebSocket support
  experimental: {
    serverComponentsExternalPackages: ["ws"],
  },
};

module.exports = nextConfig;
```

---

## Production Checklist

- [ ] Database hosted and accessible (PostgreSQL)
- [ ] `.env` variables added to Vercel
- [ ] `vercel.json` configured
- [ ] `api/requirements.txt` created with all dependencies
- [ ] CORS origins updated for production domain
- [ ] Google OAuth credentials set up for new domain
- [ ] Database migrations run successfully
- [ ] Health check endpoint responding (`/api/health`)
- [ ] API endpoints responding from frontend
- [ ] WebSocket connections working in production
- [ ] Game state persisting correctly
- [ ] User stats calculating properly
- [ ] Google OAuth login working with new domain

---

## Troubleshooting

### Issue: WebSocket connections fail
**Solution:** Ensure backend is reachable and CORS is configured correctly.

### Issue: Database connection times out
**Solution:** Check DATABASE_URL format, verify PostgreSQL is running, check firewall rules.

### Issue: NEXT_PUBLIC_ variables not available
**Solution:** Ensure they have `NEXT_PUBLIC_` prefix and are added to Vercel environment.

### Issue: 502 Bad Gateway on API calls
**Solution:** Check FastAPI logs, verify database connection, ensure migrations ran successfully.

### Issue: Static assets not loading
**Solution:** Rebuild with `vercel --prod`, clear Vercel cache.

---

## Alternative: Docker Deployment

If you prefer Docker (more control, easier local testing):

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy app
COPY . .

# Build Next.js
RUN npm run build

# Production image
FROM node:18-alpine
WORKDIR /app

# Install Python for FastAPI
RUN apk add --no-cache python3 py3-pip

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY . .

# Install Python dependencies
RUN pip install -r api/requirements.txt

# Expose ports
EXPOSE 3000 8000

# Start both servers
CMD ["npm", "run", "dev"]
```

Deploy to Docker Hub or host on Railway, Render, etc.

---

## Useful Commands

```bash
# Test locally before deployment
npm run dev

# Check for build errors
npm run build

# Lint code
npm run lint

# Deploy to Vercel
vercel --prod

# Check deployment status
vercel status

# View logs
vercel logs

# Pull environment variables locally
vercel env pull
```

---

## Next Steps

1. **Set up PostgreSQL database** (Railway, Neon, or Vercel Postgres)
2. **Create `.env` files** with required variables
3. **Test locally** with `npm run dev`
4. **Connect repository to Vercel**
5. **Add environment variables** to Vercel dashboard
6. **Deploy** and monitor for errors
7. **Update Google OAuth** for production domain
8. **Run database migrations** on deployed database

---

## Support Resources

- [Vercel Python Support](https://vercel.com/docs/concepts/functions/serverless-functions/supported-languages#python)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/concepts/)
- [Alembic Migrations](https://alembic.sqlalchemy.org/)
- [WebSocket with FastAPI](https://fastapi.tiangolo.com/advanced/websockets/)
