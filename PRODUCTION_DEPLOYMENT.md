# Production Deployment Setup

## Frontend: Vercel Deployment
**URL**: https://super-tic-tac-toe.buildora.work/

### Vercel Environment Variables

Go to Vercel Project Settings → Environment Variables and add:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
NEXT_PUBLIC_BACKEND_URL=https://super-tic-tac-toe-api.buildora.work
```

### Vercel Configuration

No additional setup needed - the project will:
1. Auto-detect Next.js
2. Run `npm install && npm run build`
3. Deploy to production URL

### Custom Domain on Vercel
1. Go to Settings → Domains
2. Add domain: `super-tic-tac-toe.buildora.work`
3. Configure DNS (buildora.work provider)
4. Vercel will auto-provision SSL

### Deployment Steps
```bash
# Push to main branch
git push origin main

# Vercel auto-deploys from main
# Check deployment status in Vercel dashboard
```

---

## Backend: Render Deployment
**URL**: https://super-tic-tac-toe-api.buildora.work/

### Create Render Web Service

1. **Sign up at render.com**
2. **Create New → Web Service**
   - Repository: super-tic-tac-toe
   - Branch: main
   - Runtime: Python 3.10
   - Build Command: `pip install -r api/requirements.txt`
   - Start Command: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`

### Render Environment Variables

Add these in Render dashboard → Environment:

```
DATABASE_URL=postgresql://user:password@host:5432/db_name
SECRET_KEY=generate_strong_key_here
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
PYTHON_VERSION=3.10
```

### Create PostgreSQL on Render

1. **Create New → PostgreSQL**
   - Name: super-tic-tac-toe-db
   - Region: Oregon (or closest to you)
   - PostgreSQL Version: 15

2. **Copy connection string to DATABASE_URL**

### Configure CORS on Backend

Update `api/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://super-tic-tac-toe.buildora.work",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Custom Domain on Render

1. Go to Web Service → Settings → Custom Domain
2. Add: `super-tic-tac-toe-api.buildora.work`
3. Update DNS records at buildora.work provider
4. Render provides SSL automatically

### Run Database Migrations on Render

After first deployment:

1. Connect via Render shell
2. Run: `python -m alembic upgrade head`

Or use Render's cron jobs to auto-migrate

---

## Deployment Checklist

### Before Deploying

Frontend:
- [ ] `NEXT_PUBLIC_BACKEND_URL` points to production API
- [ ] Google OAuth credentials updated for production domain
- [ ] Build successful: `npm run build`
- [ ] No console errors in production

Backend:
- [ ] `DATABASE_URL` configured
- [ ] `SECRET_KEY` set to strong value
- [ ] CORS allows frontend domain
- [ ] All migrations: `alembic upgrade head`
- [ ] Health check working: `GET /api/health`

### Deployment Order

1. **Database first**: PostgreSQL on Render
2. **Backend second**: Deploy API, run migrations
3. **Frontend third**: Deploy Next.js to Vercel
4. **Test**: Verify both URLs working
5. **Monitor**: Check logs and error rates

### Post-Deployment Testing

```bash
# Test frontend
curl https://super-tic-tac-toe.buildora.work/

# Test backend health
curl https://super-tic-tac-toe-api.buildora.work/api/health

# Test CORS with frontend
# Go to https://super-tic-tac-toe.buildora.work/
# Try creating a game
# Check browser console for errors
```

### Monitor Production

- Vercel Dashboard: https://vercel.com/dashboard
- Render Dashboard: https://dashboard.render.com
- Set up error monitoring (Sentry, etc.)
- Monitor database size and performance

---

## Rollback Plan

### If Frontend Deployment Fails
```bash
# Vercel auto-rollback available
# Or push previous commit
git revert HEAD
git push origin main
# Vercel redeploys automatically
```

### If Backend Deployment Fails
```bash
# Connect to Render
# Check logs
# Redeploy specific commit
```

### If Database Issues
```bash
# Connect to Render PostgreSQL
# Use Render shell to run backups
# Restore from backup if needed
```

---

## Troubleshooting

### "Backend not reachable from frontend"
- Check NEXT_PUBLIC_BACKEND_URL is correct
- Check CORS on backend allows frontend domain
- Check network tab in browser DevTools

### "Database connection failed"
- Verify DATABASE_URL format
- Check PostgreSQL is running on Render
- Verify firewall/IP allowlist

### "API returning 500"
- Check Render logs for errors
- Ensure all migrations ran
- Verify environment variables set

### "Slow performance"
- Check Render instance type (upgrade if needed)
- Monitor database query performance
- Enable caching if applicable

---

## Custom Domain Setup (buildora.work)

Assuming you own buildora.work:

### DNS Records to Add

```
Type: CNAME
Name: super-tic-tac-toe
Value: cname.vercel.com (for Vercel)

Type: CNAME
Name: super-tic-tac-toe-api
Value: cname.render.com (for Render)
```

Or use:
- A records with IP addresses provided by Vercel/Render
- Check respective dashboards for exact values

### SSL Certificates

- Vercel: Auto-provisioned (free)
- Render: Auto-provisioned (free)
- No manual setup needed

---

## Continuous Deployment

### Vercel Auto-Deployment
- Push to main → auto-deploys
- Check deployments tab for status
- Rollback to previous deployment if needed

### Render Auto-Deployment
- Push to main → auto-deploys
- Takes ~2-5 minutes
- Check Build & Deployments tab

### Preview Deployments
- Vercel: Creates preview URL for each PR
- Render: Can configure preview environment

---

## Performance Optimization

### Frontend (Vercel)
- Next.js image optimization (enabled)
- Automatic code splitting
- Edge caching via Vercel CDN

### Backend (Render)
- Consider upgrading instance type if slow
- Enable query caching
- Monitor API latency

### Database (Render PostgreSQL)
- Monitor connection count
- Consider read replicas for scale
- Enable automated backups

---

## Monitoring & Alerts

### Vercel Monitoring
- Check deployment status
- Monitor build times
- Set up error tracking

### Render Monitoring
- Check service health
- Monitor CPU/memory usage
- Set up alerts for failures

### Application Monitoring (Optional)
- Sentry for error tracking
- DataDog/New Relic for performance
- Custom logging to track issues

---

## Next Steps

1. [ ] Set up both custom domains at DNS provider
2. [ ] Create Render PostgreSQL database
3. [ ] Create Render Web Service for backend
4. [ ] Add environment variables to both services
5. [ ] Deploy backend first (with migrations)
6. [ ] Deploy frontend (will auto-connect to backend)
7. [ ] Test both URLs
8. [ ] Monitor for errors
9. [ ] Set up alerts and monitoring
10. [ ] Document deployment process

