# Render Deployment Guide (Using render.yaml)

## Quick Start with render.yaml

The `render.yaml` file automates the deployment setup process. Instead of manually configuring each service in the Render dashboard, you can use this file for infrastructure-as-code deployment.

## Prerequisites

- Render account: https://render.com
- GitHub repository connected to Render
- Google OAuth credentials

## Deployment Steps

### Option 1: Using Render Dashboard (Recommended for First Time)

1. **Go to https://render.com/dashboard**
2. Click "New +" → "Blueprint"
3. Select your GitHub repository
4. Render will automatically detect `render.yaml`
5. Review the configuration
6. Click "Create New Services"

### Option 2: Connect Blueprint from CLI

```bash
# Install Render CLI (optional)
brew install render-cli

# Or use the dashboard method above
```

## What render.yaml Configures

### Web Service
- **Name**: super-tic-tac-toe-api
- **Runtime**: Python 3.10
- **Build**: `pip install -r api/requirements.txt`
- **Start**: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
- **Plan**: Starter ($7/month)

### PostgreSQL Database
- **Name**: super-tic-tac-toe-db
- **Version**: PostgreSQL 15
- **Database**: super_tic_tac_toe
- **Plan**: Free (0-90 GB)

### Environment Variables
- `DATABASE_URL` - Auto-connected from PostgreSQL service
- `SECRET_KEY` - Auto-generated secure key
- `GOOGLE_CLIENT_ID` - Your OAuth client ID

## Setting Environment Variables

### Before Deployment
1. Go to **Environment** in the Render dashboard
2. Add these environment variables:

```
DATABASE_URL=postgresql://...  (auto-populated from PostgreSQL)
SECRET_KEY=your_secure_secret_key_or_auto-generated
GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Getting DATABASE_URL
1. After PostgreSQL service is created, go to its details page
2. Copy the "Internal Database URL" (faster) or "External Database URL"
3. Add it as `DATABASE_URL` environment variable

### Generating SECRET_KEY
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Post-Deployment

### 1. Run Database Migrations
```bash
# Access Render Shell for the web service
# Then run:
python -m alembic upgrade head
```

Or use the one-off script:
```bash
# From Render dashboard → Web Service → Shell
cd /app
python -m alembic upgrade head
```

### 2. Configure Custom Domain
1. Go to Web Service → Settings → Custom Domain
2. Enter: `super-tic-tac-toe-api.buildora.work`
3. Update DNS records at your registrar

### 3. Test Deployment
```bash
# Test health endpoint
curl https://super-tic-tac-toe-api.buildora.work/api/py/health

# Test API docs
curl https://super-tic-tac-toe-api.buildora.work/api/py/docs
```

## File Structure

```
super-tic-tac-toe/
├── render.yaml              # ← Render deployment config (NEW)
├── api/
│   ├── main.py
│   ├── requirements.txt
│   └── ...
├── app/
│   └── ...
└── ...
```

## Updating Deployment

### Edit render.yaml
1. Modify `render.yaml` in your repository
2. Commit changes: `git push origin main`
3. Render will auto-deploy with new configuration

### Important: Do NOT Modify These in render.yaml
- Service names (changing breaks connections)
- Database name (causes data loss)
- Build/start commands (must match your app)

### Safe to Modify
- Environment variables
- Resource plans (scale up/down)
- Python version
- Dependencies in requirements.txt

## Troubleshooting

### "Build failed"
- Check `build.log` in Render dashboard
- Ensure `api/requirements.txt` exists
- Verify Python syntax in `api/main.py`

### "Database connection failed"
- Verify `DATABASE_URL` is set
- Check PostgreSQL service is running
- Test with: `psql $DATABASE_URL -c "SELECT 1"`

### "Environment variables not loaded"
- Check variable names match in render.yaml
- Rebuild service to apply changes
- Clear browser cache

### "Deploy stuck in progress"
- Check resource usage in Render dashboard
- Restart service: Dashboard → "Manual Restart"

## Performance

### Starter Plan Specs
- **RAM**: 0.5 GB
- **CPU**: Shared
- **Storage**: Variable (default based on plan)

### Scaling Up
1. Go to Web Service → Settings
2. Change **Instance Type** to larger option
3. Render will restart with new capacity

### When to Scale
- Response times > 1 second
- CPU usage > 80% consistently
- Memory usage > 400 MB

## Cost

### Free Tier
- PostgreSQL database: Free (0-90 GB)
- Web service: Auto-spins down after 15 min inactivity

### Paid Plans
- Starter web service: $7/month (always on)
- Standard: $25/month
- Pro: $50/month

### Optimize Costs
- Keep free database plan if data < 90 GB
- Use auto-scaling for variable traffic
- Set up alerts for cost overruns

## Advanced Configuration

### Auto-Deploy on Push
Already configured in render.yaml. Any push to `main` branch triggers deployment.

### Preview Environments
1. Edit render.yaml:
   ```yaml
   previewsEnabled: true
   ```
2. Each PR will get a preview deployment

### Custom Domain with SSL
1. Render auto-provisions SSL certificates
2. Add CNAME record:
   ```
   super-tic-tac-toe-api  CNAME  cname.render.com
   ```
3. Wait 2-5 minutes for DNS propagation

## Monitoring Deployment

### View Logs
- **Build logs**: Dashboard → "Build" tab
- **Runtime logs**: Dashboard → "Logs" tab
- **Tail logs**: `render logs super-tic-tac-toe-api`

### Key Logs to Watch
```
INFO [alembic.runtime.migration] Running upgrade
INFO [uvicorn.server] Uvicorn running on 0.0.0.0:PORT
```

### Common Warning Signs
```
ERROR: connection refused        → Database not ready
ERROR: ModuleNotFoundError       → Missing pip dependency
ERROR: Port already in use       → Multiple services on same port
```

## Disaster Recovery

### Backup Database
1. Render PostgreSQL → "Backups" tab
2. Enable automatic daily backups
3. Download backup if needed

### Restore from Backup
1. PostgreSQL service → "Backups"
2. Click "Restore" on previous backup
3. Creates new database with restored data

### Rollback Deployment
```bash
# Push previous commit
git revert HEAD
git push origin main

# Render auto-redeploys with previous code
```

## Next Steps

1. ✅ Push `render.yaml` to main branch
2. ✅ Connect GitHub repo to Render (if not done)
3. ✅ Use "Blueprint" to import render.yaml
4. ✅ Set environment variables
5. ✅ Run database migrations
6. ✅ Configure custom domain
7. ✅ Test endpoints

## Documentation Reference

- [Render YAML Reference](https://render.com/docs/blueprint-spec)
- [PostgreSQL Service Docs](https://render.com/docs/databases)
- [Web Service Docs](https://render.com/docs/web-services)

## Support

- Render Docs: https://render.com/docs
- Render Status: https://status.render.com
- Discord: Render Community Discord

---

**Status**: render.yaml ready for deployment ✅

Deploy with confidence using infrastructure-as-code! 🚀
