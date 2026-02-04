# Vercel Deployment Guide

## Frontend Apps to Deploy (5 Total)

1. **Kasir** - Port 5174 (local) → vercel.app
2. **Customer** - Port 5175 (local) → vercel.app
3. **Display** - Port 5176 (local) → vercel.app
4. **Admin** - Port 5179 (local) → vercel.app
5. **Tenant** - Port 5180 (local) → vercel.app

## Prerequisites

- Vercel CLI installed: ✅ (`which vercel` shows path)
- GitHub account with repo access
- Supabase project credentials: ✅ Ready

## Vercel Setup

### 1. Connect to GitHub

If not already connected, visit: https://vercel.com/integrations/github

### 2. Deploy Each App

#### Option A: Via Vercel CLI (Recommended)

```bash
# Make sure Vercel CLI is installed
vercel --version

# Navigate to each app and deploy
cd /Users/sugenghariadi/pos-system/frontend/apps/kasir
vercel --prod

# Repeat for: customer, display, admin, tenant
```

#### Option B: Via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click **Add New...** → **Project**
3. Import from GitHub
4. Select this repo: `pos-system`
5. Configure project:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend/apps/kasir`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Click **Deploy**

### 3. Set Environment Variables

For each deployed app, add environment variables:

**Settings → Environment Variables**

```
REACT_APP_SUPABASE_URL=https://vbclcsccuzcgrxedzpej.supabase.co
REACT_APP_SUPABASE_KEY=sb_publishable_0ZMziQhXB9SKGQgD9voFvA_rYaE18Bb
```

### 4. Verify Deployment

After each deployment completes:
- ✅ Check status is "Ready"
- ✅ Visit production URL
- ✅ Test login with Supabase user
- ✅ Verify data loads from Supabase

## Configuration per App

### Kasir App

```
Framework: Vite
Root: frontend/apps/kasir
Build: npm run build
Environment:
  - REACT_APP_SUPABASE_URL
  - REACT_APP_SUPABASE_KEY
```

**Expected URL:** `https://kasir-[hash].vercel.app`

### Customer App

```
Framework: Vite
Root: frontend/apps/customer
Build: npm run build
```

**Expected URL:** `https://customer-[hash].vercel.app`

### Display App

```
Framework: Vite
Root: frontend/apps/display
Build: npm run build
```

**Expected URL:** `https://display-[hash].vercel.app`

### Admin App

```
Framework: Vite
Root: frontend/apps/admin
Build: npm run build
```

**Expected URL:** `https://admin-[hash].vercel.app`

### Tenant App

```
Framework: Vite
Root: frontend/apps/tenant
Build: npm run build
```

**Expected URL:** `https://tenant-[hash].vercel.app`

## Post-Deployment Checklist

- [ ] All 5 apps deployed to Vercel
- [ ] Environment variables set in each app
- [ ] Login works with Supabase credentials
- [ ] Data loads from Supabase (not localhost)
- [ ] Real-time subscriptions working
- [ ] No console errors
- [ ] CORS not blocking requests
- [ ] Mobile responsive works

## Update DNS (Optional)

If you have custom domains, update DNS records:

```
CNAME: your-domain.com → cname.vercel.app
```

See: https://vercel.com/docs/concepts/projects/domains

## Troubleshooting

### Build Fails

```bash
# Check build output
vercel logs --follow

# Common fixes:
# 1. Ensure workspace packages are properly linked
# 2. Check node_modules not in .gitignore
# 3. Verify environment variables set
```

### Blank Page After Deploy

1. Check browser console for errors
2. Verify Supabase credentials in .env
3. Check CORS settings in Supabase
4. Ensure RLS policies allow public read

### Login Not Working

1. Verify Supabase auth users exist
2. Check email/password correct
3. Ensure JWT secret configured
4. Clear browser cache & cookies

### Data Not Loading

1. Verify Supabase database accessible
2. Check RLS policies not blocking queries
3. Ensure API key has read permissions
4. Check Network tab in DevTools

## Monitoring

### View Deployment Logs

```bash
vercel logs [app-name] --follow
```

### Vercel Analytics

- https://vercel.com/dashboard → Select Project → Analytics
- Monitor:
  - Page load time
  - Core Web Vitals
  - Error rates

### Supabase Monitoring

- https://app.supabase.com → Project → Logs
- Monitor:
  - Query performance
  - RLS policy violations
  - Connection errors

## Production Environment Variables

**All Apps Need:**
```
REACT_APP_SUPABASE_URL=https://vbclcsccuzcgrxedzpej.supabase.co
REACT_APP_SUPABASE_KEY=sb_publishable_0ZMziQhXB9SKGQgD9voFvA_rYaE18Bb
```

## Deployment Script (Optional)

Create `deploy-all.sh` to automate deployment:

```bash
#!/bin/bash

APPS=("kasir" "customer" "display" "admin" "tenant")

for app in "${APPS[@]}"; do
  echo "Deploying $app..."
  cd "/Users/sugenghariadi/pos-system/frontend/apps/$app"
  vercel --prod
  echo "$app deployed successfully!"
done

echo "All apps deployed to Vercel!"
```

Run:
```bash
chmod +x deploy-all.sh
./deploy-all.sh
```

## Summary

**Status: Ready for Deployment** ✅

- Database: Supabase (production)
- Frontend: 5 React/Vite apps ready
- Auth: Supabase Auth configured
- Environment: Variables ready

**Next Steps:**
1. Deploy each app to Vercel
2. Set environment variables
3. Test in production
4. Monitor logs & performance

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- React Docs: https://react.dev
