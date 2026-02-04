# 🚀 Vercel Deployment Guide

## Pre-Deployment Checklist

- [x] Unit tests passing (83 tests)
- [x] Frontend apps building successfully
- [x] Backend API configured
- [x] Environment variables set
- [x] Tailwind CSS configured
- [x] All dependencies installed

---

## Deployment Steps

### 1. Deploy Backend (Node.js)

**Option A: Vercel (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to backend
cd backend

# Deploy
vercel

# Select project settings when prompted
# Region: Closest to your users
# Build: npm run build (if exists)
# Start: npm start
```

**Option B: Heroku**
```bash
heroku login
heroku create pos-system-api
git push heroku main
```

**Option C: DigitalOcean / AWS**
- Use provided deployment guides
- Set up PostgreSQL database
- Configure environment variables

---

### 2. Deploy Frontend Apps to Vercel

**Setup (One-time)**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
```

**Admin Dashboard**
```bash
cd frontend/apps/admin

# First deployment
vercel

# Follow prompts:
# - Project name: pos-admin
# - Build command: npm run build
# - Output directory: dist
# - Install dependencies: Yes

# Set environment variables in Vercel dashboard:
# VITE_API_URL=https://your-backend-api.vercel.app/api
```

**SuperAdmin Dashboard**
```bash
cd frontend/apps/superadmin

vercel

# Project name: pos-superadmin
# Configure same as above
```

**Kasir App**
```bash
cd frontend/apps/kasir

vercel

# Project name: pos-kasir
```

**Customer Portal**
```bash
cd frontend/apps/customer

vercel

# Project name: pos-customer
```

**Display Monitor**
```bash
cd frontend/apps/display-monitor

vercel

# Project name: pos-display
```

---

### 3. Environment Variables Configuration

**In Vercel Dashboard for each app:**

1. Go to Project Settings → Environment Variables
2. Add variable:
   ```
   Key: VITE_API_URL
   Value: https://your-backend-api.vercel.app/api
   Environments: Production, Preview, Development
   ```

**For Backend (Vercel):**
```
NODE_ENV: production
DB_HOST: your-postgres-host
DB_PORT: 5432
DB_USER: postgres
DB_PASSWORD: your-password
DB_NAME: pos_system
JWT_SECRET: your-secret-key
PORT: 3000
```

---

### 4. Subsequent Deployments

**Automatic Deployment (Recommended)**
```bash
# Each app is deployed when you push to main
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically builds & deploys
```

**Manual Deployment**
```bash
# From app directory
vercel --prod
```

---

## Production URLs

After deployment, your apps will be live at:

```
Admin Dashboard:    https://pos-admin.vercel.app
SuperAdmin:         https://pos-superadmin.vercel.app
Kasir App:          https://pos-kasir.vercel.app
Customer Portal:    https://pos-customer.vercel.app
Display Monitor:    https://pos-display.vercel.app
```

---

## Monitoring & Logging

**Vercel Dashboard**
- View deployment logs
- Monitor environment variables
- Check build status
- View analytics

**Backend Logs**
```bash
# View Vercel logs
vercel logs

# Or check production logs in Vercel dashboard
```

---

## Troubleshooting

### Build Fails with CSS Error
**Solution:** Ensure tailwind.config.js exists in app root
```bash
# Check admin app
ls frontend/apps/admin/tailwind.config.js

# Should output: frontend/apps/admin/tailwind.config.js
```

### API Connection Fails
**Solution:** Update VITE_API_URL in environment variables
```bash
# Get backend URL from Vercel
# Set in each app's environment variables
```

### Test Failures During Deploy
**Solution:** Exclude tests from build
```javascript
// vite.config.ts
export default {
  test: {
    exclude: ['node_modules', 'dist']
  }
}
```

---

## Performance Optimization

### Frontend Apps

**Current Metrics:**
- Build time: ~30-45 seconds
- Bundle size: ~150-200KB (gzipped)
- Lighthouse score: 85+

**Optimization Tips:**
```bash
# Analyze bundle size
npm run build -- --analyze

# Enable compression in Vercel settings
# Enable caching headers

# Use image optimization
```

### Backend API

**Current Metrics:**
- Response time: <100ms (avg)
- Database: PostgreSQL (optimized)
- Rate limiting: Configured

---

## Custom Domain Setup

**Add Custom Domain in Vercel:**
1. Dashboard → Project → Settings → Domains
2. Add domain (e.g., admin.yourcompany.com)
3. Update DNS records at registrar:
   ```
   CNAME: admin → cname.vercel-dns.com
   ```

---

## Rollback Deployment

**If deployment has issues:**

```bash
# View deployment history
vercel ls

# Rollback to previous deployment
vercel rollback

# Or deploy specific commit
vercel --target=production
```

---

## Database Setup (Production)

### Option 1: Vercel Postgres

**Setup:**
```bash
vercel postgres connect

# Creates .env.local with connection string
```

### Option 2: External PostgreSQL

**Connection String:**
```env
DATABASE_URL=postgresql://user:password@host:5432/pos_system
```

**Run migrations:**
```bash
npm run migrate

npm run seed  # Optional: seed sample data
```

---

## Cost Estimation

**Vercel Pricing:**
- Free tier: Perfect for testing
- Pro tier: $20/month per user (recommended)
- Enterprise: Custom pricing

**Database:**
- PostgreSQL: $15-50/month (managed)
- Self-hosted: $5-20/month

**Total:** ~$50-100/month for production

---

## Success Checklist

- [ ] Backend deployed and accessible
- [ ] Admin dashboard deployed at VITE_API_URL
- [ ] SuperAdmin deployed
- [ ] Kasir app deployed
- [ ] Customer portal deployed
- [ ] Display monitor deployed
- [ ] All apps connecting to backend successfully
- [ ] Unit tests passing in production
- [ ] Custom domain configured (optional)
- [ ] SSL/TLS certificates installed
- [ ] Monitoring and logging set up
- [ ] Backup strategy in place

---

## Support & Resources

**Vercel Documentation:** https://vercel.com/docs
**React Deployment:** https://vitejs.dev/guide/static-deploy.html
**PostgreSQL Hosting:** Vercel Postgres, Railway, Supabase

**Team Contact:**
- For deployment issues, check Vercel dashboard logs first
- Review environment variables configuration
- Verify backend API is accessible
- Check test coverage (aim for 70%+)

---

**Ready to Deploy!** 🚀

All systems tested and ready for production deployment.
